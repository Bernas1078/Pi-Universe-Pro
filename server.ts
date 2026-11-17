import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

const DEFAULT_REPO = process.env.GITHUB_REPO || 'Bernas1078/Pi-Universe-Pro';
const [GITHUB_OWNER, GITHUB_REPO] = DEFAULT_REPO.includes('/')
  ? DEFAULT_REPO.split('/', 2)
  : ['Bernas1078', 'Pi-Universe-Pro'];
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_DB_PATH = process.env.GITHUB_DB_PATH || 'public/database.json';
const LOCAL_DB_FILE = path.resolve(__dirname, GITHUB_DB_PATH);

type CollectionKey = 'boards' | 'accessories' | 'images';

interface DatabaseFilePayload {
  version: number;
  repository: string;
  updatedAt: string;
  boards: Array<Record<string, unknown>>;
  accessories: Array<Record<string, unknown>>;
  images: Array<Record<string, unknown>>;
}

// Sequential write queue so concurrent public edits never overwrite each other
let writeQueue: Promise<unknown> = Promise.resolve();
function enqueueWrite<T>(task: () => Promise<T>): Promise<T> {
  const next = writeQueue.then(task, task);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

function getGithubToken(): string | null {
  const val = process.env.GITHUB_TOKEN?.trim();
  if (!val || val.startsWith('MY_')) return null;
  return val;
}

function githubHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Pi-Universe-Pro-App',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function normalizePayload(raw: unknown): DatabaseFilePayload {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    version: 1,
    repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : '',
    boards: Array.isArray(obj.boards) ? (obj.boards as Array<Record<string, unknown>>) : [],
    accessories: Array.isArray(obj.accessories) ? (obj.accessories as Array<Record<string, unknown>>) : [],
    images: Array.isArray(obj.images) ? (obj.images as Array<Record<string, unknown>>) : []
  };
}

async function fetchGithubFile(token?: string | null): Promise<{
  found: boolean;
  sha?: string;
  content?: string;
  error?: string;
}> {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DB_PATH}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  const res = await fetch(apiUrl, {
    headers: githubHeaders(token),
    cache: 'no-store'
  });

  if (res.status === 404) {
    return { found: false };
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return { found: false, error: `GitHub API ${res.status}: ${text.slice(0, 200)}` };
  }

  const json = (await res.json()) as { sha?: string; content?: string; encoding?: string };
  let decoded = '';
  if (json.content && json.encoding === 'base64') {
    decoded = Buffer.from(json.content.replace(/\n/g, ''), 'base64').toString('utf8');
  }
  return { found: true, sha: json.sha, content: decoded };
}

async function readLocalDatabaseFile(): Promise<DatabaseFilePayload> {
  try {
    const raw = await fs.readFile(LOCAL_DB_FILE, 'utf8');
    return normalizePayload(JSON.parse(raw));
  } catch {
    return normalizePayload({});
  }
}

async function readLatestDatabase(token?: string | null): Promise<{
  data: DatabaseFilePayload;
  source: 'github' | 'local_file';
  sha: string | null;
}> {
  try {
    const ghFile = await fetchGithubFile(token);
    if (ghFile.found && ghFile.content) {
      return {
        data: normalizePayload(JSON.parse(ghFile.content)),
        source: 'github',
        sha: ghFile.sha || null
      };
    }
  } catch {
    // Fallback to local file
  }
  const localData = await readLocalDatabaseFile();
  return { data: localData, source: 'local_file', sha: null };
}

async function commitGithubFile(
  token: string,
  jsonString: string,
  commitMessage: string,
  knownSha?: string | null
): Promise<{ ok: boolean; commitSha?: string; commitUrl?: string; error?: string }> {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DB_PATH}`;
  const encodedContent = Buffer.from(jsonString, 'utf8').toString('base64');

  const attemptCommit = async (
    shaOverride?: string | null
  ): Promise<{ status: number; body: Record<string, unknown> }> => {
    let sha = shaOverride;
    if (sha === undefined) {
      const existing = await fetchGithubFile(token);
      sha = existing.found ? existing.sha || null : null;
    }

    const payload: Record<string, string> = {
      message: commitMessage,
      content: encodedContent,
      branch: GITHUB_BRANCH
    };
    if (sha) {
      payload.sha = sha;
    }

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        ...githubHeaders(token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, body };
  };

  let result = await attemptCommit(knownSha ?? undefined);
  if (result.status === 409) {
    result = await attemptCommit(undefined);
  }

  if (result.status >= 200 && result.status < 300) {
    const commit = (result.body.commit || {}) as Record<string, unknown>;
    return {
      ok: true,
      commitSha: typeof commit.sha === 'string' ? commit.sha : undefined,
      commitUrl: typeof commit.html_url === 'string' ? commit.html_url : undefined
    };
  }

  const message =
    typeof result.body.message === 'string'
      ? result.body.message
      : `Erro HTTP ${result.status} ao guardar no GitHub`;
  return { ok: false, error: message };
}

async function persistPayload(
  payload: DatabaseFilePayload,
  commitMessage: string,
  knownSha?: string | null
) {
  const jsonString = `${JSON.stringify(payload, null, 2)}\n`;

  let savedToDisk = false;
  try {
    await fs.mkdir(path.dirname(LOCAL_DB_FILE), { recursive: true });
    await fs.writeFile(LOCAL_DB_FILE, jsonString, 'utf8');
    savedToDisk = true;
  } catch (err) {
    console.error('Failed to write local public/database.json:', err);
  }

  const token = getGithubToken();
  if (!token) {
    return {
      status: 200,
      body: {
        ok: true,
        savedToDisk,
        committedToGithub: false,
        reason: 'missing_github_token',
        updatedAt: payload.updatedAt,
        data: payload
      }
    };
  }

  const commitRes = await commitGithubFile(token, jsonString, commitMessage, knownSha);
  if (!commitRes.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        savedToDisk,
        committedToGithub: false,
        error: commitRes.error || 'Falha ao enviar para o GitHub',
        updatedAt: payload.updatedAt,
        data: payload
      }
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      savedToDisk,
      committedToGithub: true,
      commitSha: commitRes.commitSha || null,
      commitUrl: commitRes.commitUrl || null,
      updatedAt: payload.updatedAt,
      data: payload
    }
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Enable public CORS on /api/github/* so visitors from GitHub Pages (bernas1078.github.io)
  // and any other client can read & collaboratively edit the public database seamlessly.
  app.use('/api/github', (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (_req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // 1. Public GitHub Sync Status
  app.get('/api/github/status', async (_req: Request, res: Response) => {
    const token = getGithubToken();
    let authenticatedUser: string | null = null;

    if (token) {
      try {
        const userRes = await fetch('https://api.github.com/user', {
          headers: githubHeaders(token)
        });
        if (userRes.ok) {
          const userData = (await userRes.json()) as { login?: string };
          authenticatedUser = userData.login || null;
        }
      } catch {
        // Ignore user lookup failure
      }
    }

    res.json({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      branch: GITHUB_BRANCH,
      path: GITHUB_DB_PATH,
      autoCommitReady: Boolean(token),
      publicCollaborativeEdit: Boolean(token),
      authenticatedUser
    });
  });

  // 2. Read Public Database directly from GitHub
  app.get('/api/github/db', async (_req: Request, res: Response) => {
    const token = getGithubToken();
    const latest = await readLatestDatabase(token);
    res.json(latest);
  });

  // 3. Atomic Collaborative Edit (PATCH) — fetches latest GitHub file inside mutex,
  // merges ONLY the changed board/accessory/image, and commits straight to GitHub!
  app.patch('/api/github/db', async (req: Request, res: Response) => {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const collection = body.collection as CollectionKey;
    const action = body.action as 'upsert' | 'delete';

    if (!['boards', 'accessories', 'images'].includes(collection)) {
      res.status(400).json({ ok: false, error: 'Coleção inválida.' });
      return;
    }
    if (action !== 'upsert' && action !== 'delete') {
      res.status(400).json({ ok: false, error: 'Ação inválida.' });
      return;
    }

    const commitMessage =
      typeof body.message === 'string' && body.message.trim().length > 0
        ? body.message.trim().slice(0, 120)
        : `chore(db): atualizar ${collection} via Pi Universe Pro`;

    const result = await enqueueWrite(async () => {
      const token = getGithubToken();
      const latest = await readLatestDatabase(token);
      const nextPayload: DatabaseFilePayload = {
        ...latest.data,
        updatedAt: new Date().toISOString()
      };

      if (action === 'upsert') {
        const record = body.record as Record<string, unknown> | undefined;
        if (!record || typeof record !== 'object' || typeof record.id !== 'string' || !record.id.trim()) {
          return { status: 400, body: { ok: false, error: 'Registo inválido (falta id).' } };
        }
        const filtered = nextPayload[collection].filter((item) => item.id !== record.id);
        nextPayload[collection] = [record, ...filtered];
      } else {
        const id = typeof body.id === 'string' ? body.id.trim() : '';
        if (!id) {
          return { status: 400, body: { ok: false, error: 'ID em falta para remoção.' } };
        }
        nextPayload[collection] = nextPayload[collection].filter((item) => item.id !== id);
      }

      return persistPayload(nextPayload, commitMessage, latest.sha);
    });

    res.status(result.status).json(result.body);
  });

  // 4. Full Database Push (PUT) — used when pushing bulk pending local edits
  app.put('/api/github/db', async (req: Request, res: Response) => {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const commitMessage =
      typeof body.message === 'string' && body.message.trim().length > 0
        ? body.message.trim().slice(0, 120)
        : `chore(db): atualizar ${GITHUB_DB_PATH} via Pi Universe Pro`;

    const result = await enqueueWrite(async () => {
      const payload: DatabaseFilePayload = {
        version: 1,
        repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
        updatedAt: new Date().toISOString(),
        boards: Array.isArray(body.boards) ? (body.boards as Array<Record<string, unknown>>) : [],
        accessories: Array.isArray(body.accessories)
          ? (body.accessories as Array<Record<string, unknown>>)
          : [],
        images: Array.isArray(body.images) ? (body.images as Array<Record<string, unknown>>) : []
      };
      return persistPayload(payload, commitMessage);
    });

    res.status(result.status).json(result.body);
  });

  // 5. Vite Dev Middleware or Static Production Build
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pi Universe Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
