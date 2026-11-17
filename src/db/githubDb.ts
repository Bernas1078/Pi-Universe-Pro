import type {
  DbAccessoryRecord,
  DbBoardRecord,
  LocalImageAsset
} from '../context/CatalogContext';

export const GITHUB_OWNER = 'Bernas1078';
export const GITHUB_REPO = 'Pi-Universe-Pro';
export const GITHUB_BRANCH = 'main';
export const GITHUB_DB_PATH = 'public/database.json';

export const GITHUB_RAW_DB_URL = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_DB_PATH}`;
export const GITHUB_EDIT_DB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/edit/${GITHUB_BRANCH}/${GITHUB_DB_PATH}`;
export const GITHUB_NEW_DB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/new/${GITHUB_BRANCH}?filename=${encodeURIComponent(GITHUB_DB_PATH)}`;
export const GITHUB_VIEW_DB_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${GITHUB_DB_PATH}`;

export interface PublicDatabasePayload {
  version: number;
  repository: string;
  updatedAt: string;
  boards: DbBoardRecord[];
  accessories: DbAccessoryRecord[];
  images: LocalImageAsset[];
}

export interface DeletedIdsState {
  boards: string[];
  accessories: string[];
  images: string[];
}

const DELETED_IDS_KEY = 'pi_universe_deleted_ids_v1';

export const EMPTY_PUBLIC_DB: PublicDatabasePayload = {
  version: 1,
  repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
  updatedAt: '',
  boards: [],
  accessories: [],
  images: []
};

export function readDeletedIds(): DeletedIdsState {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (!raw) return { boards: [], accessories: [], images: [] };
    const parsed = JSON.parse(raw);
    return {
      boards: Array.isArray(parsed?.boards) ? parsed.boards : [],
      accessories: Array.isArray(parsed?.accessories) ? parsed.accessories : [],
      images: Array.isArray(parsed?.images) ? parsed.images : []
    };
  } catch {
    return { boards: [], accessories: [], images: [] };
  }
}

export function writeDeletedIds(state: DeletedIdsState): void {
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearDeletedIds(): void {
  try {
    localStorage.removeItem(DELETED_IDS_KEY);
  } catch {
    // Ignore
  }
}

export function normalizePublicDatabasePayload(raw: unknown): PublicDatabasePayload {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    version: typeof obj.version === 'number' ? obj.version : 1,
    repository:
      typeof obj.repository === 'string' && obj.repository.trim()
        ? obj.repository
        : `${GITHUB_OWNER}/${GITHUB_REPO}`,
    updatedAt: typeof obj.updatedAt === 'string' ? obj.updatedAt : '',
    boards: Array.isArray(obj.boards) ? (obj.boards as DbBoardRecord[]) : [],
    accessories: Array.isArray(obj.accessories) ? (obj.accessories as DbAccessoryRecord[]) : [],
    images: Array.isArray(obj.images) ? (obj.images as LocalImageAsset[]) : []
  };
}

export async function fetchPublicGithubDatabase(): Promise<{
  data: PublicDatabasePayload;
  source: 'github' | 'bundled' | 'empty';
}> {
  // 1. Try live GitHub Raw first so newly committed public/database.json updates appear immediately
  try {
    const res = await fetch(`${GITHUB_RAW_DB_URL}?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      return {
        data: normalizePublicDatabasePayload(json),
        source: 'github'
      };
    }
  } catch {
    // Fall through to bundled ./database.json
  }

  // 2. Fallback to ./database.json deployed alongside the site
  try {
    const res = await fetch(`./database.json?t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      return {
        data: normalizePublicDatabasePayload(json),
        source: 'bundled'
      };
    }
  } catch {
    // Fall through to empty payload
  }

  return {
    data: EMPTY_PUBLIC_DB,
    source: 'empty'
  };
}

export function serializePublicDatabase(
  boards: DbBoardRecord[],
  accessories: DbAccessoryRecord[],
  images: LocalImageAsset[]
): string {
  const payload: PublicDatabasePayload = {
    version: 1,
    repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
    updatedAt: new Date().toISOString(),
    boards,
    accessories,
    images
  };
  return JSON.stringify(payload, null, 2);
}
