/**
 * Cloudflare Worker (100% Free Tier — 100,000 requests/day)
 * Proxy seguro para permitir que TODOS os visitantes de
 * https://bernas1078.github.io/Pi-Universe-Pro/ guardem diretamente
 * em public/database.json no repositório Bernas1078/Pi-Universe-Pro.
 *
 * Secret necessária no Cloudflare Workers (Settings -> Variables and Secrets):
 *   - GITHUB_TOKEN (Secret): Fine-grained token com Contents: Read and write
 *
 * Variáveis opcionais:
 *   - GITHUB_REPO (default: "Bernas1078/Pi-Universe-Pro")
 *   - GITHUB_BRANCH (default: "main")
 *   - GITHUB_DB_PATH (default: "public/database.json")
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS
    }
  });
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const binary = atob(b64.replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

function getConfig(env) {
  const repoFull = (env.GITHUB_REPO || 'Bernas1078/Pi-Universe-Pro').trim();
  const [owner, repo] = repoFull.includes('/')
    ? repoFull.split('/', 2)
    : ['Bernas1078', 'Pi-Universe-Pro'];
  const branch = (env.GITHUB_BRANCH || 'main').trim();
  const path = (env.GITHUB_DB_PATH || 'public/database.json').trim();
  const rawToken = typeof env.GITHUB_TOKEN === 'string' ? env.GITHUB_TOKEN.trim() : '';
  const token = rawToken && !rawToken.startsWith('MY_') ? rawToken : null;
  return { owner, repo, branch, path, token };
}

function githubHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Pi-Universe-Pro-Cloudflare-Worker',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function normalizePayload(raw, cfg) {
  const obj = raw && typeof raw === 'object' ? raw : {};
  return {
    version: 1,
    repository: `${cfg.owner}/${cfg.repo}`,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : '',
    boards: Array.isArray(obj.boards) ? obj.boards : [],
    accessories: Array.isArray(obj.accessories) ? obj.accessories : [],
    images: Array.isArray(obj.images) ? obj.images : []
  };
}

async function fetchGithubFile(cfg) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await fetch(url, {
    headers: githubHeaders(cfg.token),
    cf: { cacheTtl: 0, cacheEverything: false }
  });

  if (!res.ok) {
    return { found: false, sha: null, data: normalizePayload({}, cfg) };
  }

  const json = await res.json();
  let decoded = '{}';
  if (json.content && json.encoding === 'base64') {
    decoded = base64ToUtf8(json.content);
  }
  return {
    found: true,
    sha: json.sha || null,
    data: normalizePayload(JSON.parse(decoded), cfg)
  };
}

async function commitGithubFile(cfg, payload, commitMessage, knownSha) {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${cfg.path}`;
  const jsonString = `${JSON.stringify(payload, null, 2)}\n`;
  const encodedContent = utf8ToBase64(jsonString);

  const attempt = async (sha) => {
    const body = {
      message: commitMessage,
      content: encodedContent,
      branch: cfg.branch
    };
    if (sha) body.sha = sha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...githubHeaders(cfg.token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const parsed = await res.json().catch(() => ({}));
    return { status: res.status, body: parsed };
  };

  let result = await attempt(knownSha);
  if (result.status === 409) {
    const fresh = await fetchGithubFile(cfg);
    result = await attempt(fresh.sha);
  }

  if (result.status >= 200 && result.status < 300) {
    const commit = result.body.commit || {};
    return {
      ok: true,
      commitSha: typeof commit.sha === 'string' ? commit.sha : null,
      commitUrl: typeof commit.html_url === 'string' ? commit.html_url : null
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

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const cfg = getConfig(env);

    // Healthcheck / Status
    if (request.method === 'GET' && (pathname === '/' || pathname === '/api/github/status')) {
      let authenticatedUser = null;
      if (cfg.token) {
        try {
          const userRes = await fetch('https://api.github.com/user', {
            headers: githubHeaders(cfg.token)
          });
          if (userRes.ok) {
            const userData = await userRes.json();
            authenticatedUser = userData.login || null;
          }
        } catch {
          // Fine-grained tokens may omit user:read
        }
      }

      return jsonResponse({
        owner: cfg.owner,
        repo: cfg.repo,
        branch: cfg.branch,
        path: cfg.path,
        autoCommitReady: Boolean(cfg.token),
        publicCollaborativeEdit: Boolean(cfg.token),
        authenticatedUser
      });
    }

    // Read Database
    if (request.method === 'GET' && pathname === '/api/github/db') {
      const file = await fetchGithubFile(cfg);
      return jsonResponse({
        data: file.data,
        source: file.found ? 'github' : 'local_file',
        sha: file.sha
      });
    }

    // Write Database (PATCH atomic collaborative edit OR PUT full push)
    if (pathname === '/api/github/db' && (request.method === 'PATCH' || request.method === 'PUT')) {
      if (!cfg.token) {
        return jsonResponse(
          {
            ok: false,
            savedToDisk: false,
            committedToGithub: false,
            error: 'GITHUB_TOKEN não configurado nas Secrets do Cloudflare Worker.'
          },
          503
        );
      }

      let body = {};
      try {
        body = await request.json();
      } catch {
        return jsonResponse({ ok: false, error: 'JSON inválido.' }, 400);
      }

      const latest = await fetchGithubFile(cfg);
      let nextPayload;
      let commitMessage;

      if (request.method === 'PATCH') {
        const collection = body.collection;
        const action = body.action;
        if (!['boards', 'accessories', 'images'].includes(collection) || (action !== 'upsert' && action !== 'delete')) {
          return jsonResponse({ ok: false, error: 'Pedido PATCH inválido.' }, 400);
        }

        nextPayload = {
          ...latest.data,
          updatedAt: new Date().toISOString()
        };

        if (action === 'upsert') {
          const record = body.record;
          if (!record || typeof record !== 'object' || typeof record.id !== 'string' || !record.id.trim()) {
            return jsonResponse({ ok: false, error: 'Registo sem ID.' }, 400);
          }
          nextPayload[collection] = [
            record,
            ...nextPayload[collection].filter((item) => item.id !== record.id)
          ];
        } else {
          const id = typeof body.id === 'string' ? body.id.trim() : '';
          if (!id) {
            return jsonResponse({ ok: false, error: 'ID em falta.' }, 400);
          }
          nextPayload[collection] = nextPayload[collection].filter((item) => item.id !== id);
        }

        commitMessage =
          typeof body.message === 'string' && body.message.trim()
            ? body.message.trim().slice(0, 120)
            : `chore(db): atualizar ${collection} via Pi Universe Pro`;
      } else {
        nextPayload = {
          version: 1,
          repository: `${cfg.owner}/${cfg.repo}`,
          updatedAt: new Date().toISOString(),
          boards: Array.isArray(body.boards) ? body.boards : [],
          accessories: Array.isArray(body.accessories) ? body.accessories : [],
          images: Array.isArray(body.images) ? body.images : []
        };
        commitMessage =
          typeof body.message === 'string' && body.message.trim()
            ? body.message.trim().slice(0, 120)
            : `chore(db): atualizar ${cfg.path} via Pi Universe Pro`;
      }

      const commitRes = await commitGithubFile(cfg, nextPayload, commitMessage, latest.sha);
      if (!commitRes.ok) {
        return jsonResponse(
          {
            ok: false,
            savedToDisk: false,
            committedToGithub: false,
            error: commitRes.error
          },
          502
        );
      }

      return jsonResponse({
        ok: true,
        savedToDisk: false,
        committedToGithub: true,
        commitSha: commitRes.commitSha,
        commitUrl: commitRes.commitUrl,
        updatedAt: nextPayload.updatedAt,
        data: nextPayload
      });
    }

    return jsonResponse({ ok: false, error: 'Rota não encontrada.' }, 404);
  }
};
