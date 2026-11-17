interface ServerlessRequest {
  method?: string;
}

interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (data: unknown) => void;
  end: () => void;
  setHeader: (name: string, value: string) => void;
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

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const token = getGithubToken();
  let authenticatedUser: string | null = null;

  if (token) {
    try {
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'Pi-Universe-Pro-App',
          'X-GitHub-Api-Version': '2022-11-28',
          Authorization: `Bearer ${token}`
        }
      });
      if (userRes.ok) {
        const userData = (await userRes.json()) as { login?: string };
        authenticatedUser = userData.login || null;
      }
    } catch {
      // Ignore user lookup errors on fine-grained tokens
    }
  }

  res.status(200).json({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    path: GITHUB_DB_PATH,
    autoCommitReady: Boolean(token),
    publicCollaborativeEdit: Boolean(token),
    authenticatedUser
  });
}
