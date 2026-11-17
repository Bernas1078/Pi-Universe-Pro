interface ServerlessRequest {
  method?: string;
  body?: unknown;
}

interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (data: unknown) => void;
  end: () => void;
  setHeader: (name: string, value: string) => void;
}

type CollectionKey = 'boards' | 'accessories' | 'images';

interface DatabaseFilePayload {
  version: number;
  repository: string;
  updatedAt: string;
  boards: Array<Record<string, unknown>>;
  accessories: Array<Record<string, unknown>>;
  images: Array<Record<string, unknown>>;
}

const DEFAULT_REPO = process.env.GITHUB_REPO || 'Bernas1078/Pi-Universe-Pro';
const [GITHUB_OWNER, GITHUB_REPO] = DEFAULT_REPO.includes('/')
  ? DEFAULT_REPO.split('/', 2)
  : ['Bernas1078', 'Pi-Universe-Pro'];
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_DB_PATH = process.env.GITHUB_DB_PATH || 'public/database.json';

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
  data: DatabaseFilePayload;
}> {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DB_PATH}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  const res = await fetch(apiUrl, {
    headers: githubHeaders(token),
    cache: 'no-store'
  });

  if (!res.ok) {
    return { found: false, data: normalizePayload({}) };
  }

  const json = (await res.json()) as { sha?: string; content?: string; encoding?: string };
  let decoded = '{}';
  if (json.content && json.encoding === 'base64') {
    decoded = Buffer.from(json.content.replace(/\n/g, ''), 'base64').toString('utf8');
  }
  return {
    found: true,
    sha: json.sha,
    data: normalizePayload(JSON.parse(decoded))
  };
}

async function commitGithubFile(
  token: string,
  payload: DatabaseFilePayload,
  commitMessage: string,
  knownSha?: string
): Promise<{ ok: boolean; commitSha?: string; commitUrl?: string; error?: string }> {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DB_PATH}`;
  const jsonString = `${JSON.stringify(payload, null, 2)}\n`;
  const encodedContent = Buffer.from(jsonString, 'utf8').toString('base64');

  const attempt = async (sha?: string) => {
    const body: Record<string, string> = {
      message: commitMessage,
      content: encodedContent,
      branch: GITHUB_BRANCH
    };
    if (sha) body.sha = sha;

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        ...githubHeaders(token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const parsed = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    return { status: res.status, body: parsed };
  };

  let result = await attempt(knownSha);
  if (result.status === 409) {
    const fresh = await fetchGithubFile(token);
    result = await attempt(fresh.sha);
  }

  if (result.status >= 200 && result.status < 300) {
    const commit = (result.body.commit || {}) as Record<string, unknown>;
    return {
      ok: true,
      commitSha: typeof commit.sha === 'string' ? commit.sha : undefined,
      commitUrl: typeof commit.html_url === 'string' ? commit.html_url : undefined
    };
  }

  return {
    ok: false,
    error:
      typeof result.body.message === 'string'
        ? result.body.message
        : `Erro HTTP ${result.status} ao guardar no GitHub`
  };
}

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const token = getGithubToken();

  if (req.method === 'GET') {
    const file = await fetchGithubFile(token);
    res.status(200).json({
      data: file.data,
      source: file.found ? 'github' : 'local_file',
      sha: file.sha || null
    });
    return;
  }

  if (!token) {
    res.status(503).json({
      ok: false,
      savedToDisk: false,
      committedToGithub: false,
      error: 'GITHUB_TOKEN não configurado no servidor.'
    });
    return;
  }

  const body = (
    typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  ) as Record<string, unknown>;

  if (req.method === 'PATCH') {
    const collection = body.collection as CollectionKey;
    const action = body.action as 'upsert' | 'delete';
    if (!['boards', 'accessories', 'images'].includes(collection) || (action !== 'upsert' && action !== 'delete')) {
      res.status(400).json({ ok: false, error: 'Pedido PATCH inválido.' });
      return;
    }

    const latest = await fetchGithubFile(token);
    const nextPayload: DatabaseFilePayload = {
      ...latest.data,
      updatedAt: new Date().toISOString()
    };

    if (action === 'upsert') {
      const record = body.record as Record<string, unknown> | undefined;
      if (!record || typeof record.id !== 'string' || !record.id.trim()) {
        res.status(400).json({ ok: false, error: 'Registo sem ID.' });
        return;
      }
      nextPayload[collection] = [record, ...nextPayload[collection].filter((item) => item.id !== record.id)];
    } else {
      const id = typeof body.id === 'string' ? body.id.trim() : '';
      if (!id) {
        res.status(400).json({ ok: false, error: 'ID em falta.' });
        return;
      }
      nextPayload[collection] = nextPayload[collection].filter((item) => item.id !== id);
    }

    const msg =
      typeof body.message === 'string' && body.message.trim()
        ? body.message.trim().slice(0, 120)
        : `chore(db): atualizar ${collection} via Pi Universe Pro`;

    const commitRes = await commitGithubFile(token, nextPayload, msg, latest.sha);
    if (!commitRes.ok) {
      res.status(502).json({ ok: false, committedToGithub: false, error: commitRes.error });
      return;
    }

    res.status(200).json({
      ok: true,
      savedToDisk: false,
      committedToGithub: true,
      commitSha: commitRes.commitSha || null,
      commitUrl: commitRes.commitUrl || null,
      updatedAt: nextPayload.updatedAt,
      data: nextPayload
    });
    return;
  }

  if (req.method === 'PUT') {
    const latest = await fetchGithubFile(token);
    const nextPayload: DatabaseFilePayload = {
      version: 1,
      repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
      updatedAt: new Date().toISOString(),
      boards: Array.isArray(body.boards) ? (body.boards as Array<Record<string, unknown>>) : [],
      accessories: Array.isArray(body.accessories) ? (body.accessories as Array<Record<string, unknown>>) : [],
      images: Array.isArray(body.images) ? (body.images as Array<Record<string, unknown>>) : []
    };

    const msg =
      typeof body.message === 'string' && body.message.trim()
        ? body.message.trim().slice(0, 120)
        : `chore(db): atualizar ${GITHUB_DB_PATH} via Pi Universe Pro`;

    const commitRes = await commitGithubFile(token, nextPayload, msg, latest.sha);
    if (!commitRes.ok) {
      res.status(502).json({ ok: false, committedToGithub: false, error: commitRes.error });
      return;
    }

    res.status(200).json({
      ok: true,
      savedToDisk: false,
      committedToGithub: true,
      commitSha: commitRes.commitSha || null,
      commitUrl: commitRes.commitUrl || null,
      updatedAt: nextPayload.updatedAt,
      data: nextPayload
    });
    return;
  }

  res.status(405).json({ ok: false, error: 'Método não suportado.' });
}
