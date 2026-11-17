import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BOARD_MODELS, BoardModel } from '../data/models';
import { ALTERNATIVE_BOARDS, AlternativeBoard } from '../data/alternatives';
import { ACCESSORIES_LIST, AccessoryItem } from '../data/accessories';
import { DbImageAsset, resolveImageSrc } from '../data/imagePresets';
import { dbClearAll, dbDelete, dbGetAll, dbPut } from '../db/localDb';
import {
  clearDeletedIds,
  DeletedIdsState,
  EMPTY_PUBLIC_DB,
  fetchPublicGithubDatabase,
  PublicDatabasePayload,
  readDeletedIds,
  serializePublicDatabase,
  writeDeletedIds
} from '../db/githubDb';

export interface DbBoardRecord {
  id: string;
  boardType: 'official' | 'alternative';
  name: string;
  brand: string;
  badge: string;
  badgeColor: string;
  category: 'sbc' | 'zero' | 'mcu' | 'keyboard' | 'compute' | 'alternative';
  releaseDate: string;
  msrp: string;
  status: 'Ativo' | 'Legado' | 'Foco Educacional' | 'Industrial';
  image: string;
  imageId?: string;
  description: string;
  soc: string;
  cpu: string;
  gpu?: string;
  npu?: string;
  ram: string;
  storage: string;
  videoOut?: string;
  audio?: string;
  networking: string;
  usb?: string;
  pcie?: string;
  gpio?: string;
  power: string;
  dimensions?: string;
  keyFeatures: string[];
  cons?: string[];
  bestFor?: string;
  benchmarkScore: number;
  updatedAt: number;
}

export interface DbAccessoryRecord {
  id: string;
  name: string;
  category: 'power' | 'cooling' | 'storage' | 'camera' | 'display' | 'hat';
  compatibility: string[];
  msrp: string;
  specs: string;
  description: string;
  whyNeeded: string;
  image: string;
  imageId?: string;
  powerDrawWatts: number;
  updatedAt: number;
}

export type LocalImageAsset = Omit<DbImageAsset, 'ownerId' | 'ownerName' | 'isPublic'> & {
  updatedAt: number;
};

export type NewBoardInput = Omit<DbBoardRecord, 'id' | 'updatedAt'>;
export type NewAccessoryInput = Omit<DbAccessoryRecord, 'id' | 'updatedAt'>;
export type NewImageInput = Omit<LocalImageAsset, 'id' | 'updatedAt' | 'createdAt'>;

export interface ExtendedBoardModel extends BoardModel {
  isCustom?: boolean;
  isPublicGithub?: boolean;
  rawRecord?: DbBoardRecord;
}

export interface ExtendedAlternativeBoard extends AlternativeBoard {
  isCustom?: boolean;
  isPublicGithub?: boolean;
  rawRecord?: DbBoardRecord;
}

export interface ExtendedAccessoryItem extends AccessoryItem {
  isCustom?: boolean;
  isPublicGithub?: boolean;
  rawRecord?: DbAccessoryRecord;
}

interface CatalogContextValue {
  loadingDb: boolean;
  syncingGithub: boolean;
  githubSource: 'github' | 'bundled' | 'empty';
  githubUpdatedAt: string;
  publicCounts: { boards: number; accessories: number; images: number };
  pendingLocalChanges: number;

  dbBoards: DbBoardRecord[];
  dbAccessories: DbAccessoryRecord[];
  dbImages: LocalImageAsset[];

  allOfficialBoards: ExtendedBoardModel[];
  allAlternativeBoards: ExtendedAlternativeBoard[];
  allAccessories: ExtendedAccessoryItem[];

  saveBoard: (input: NewBoardInput, targetId?: string) => Promise<string>;
  deleteBoard: (boardId: string) => Promise<void>;
  saveAccessory: (input: NewAccessoryInput, targetId?: string) => Promise<string>;
  deleteAccessory: (accessoryId: string) => Promise<void>;
  saveImageAsset: (input: NewImageInput, editId?: string) => Promise<string>;
  deleteImageAsset: (imageId: string) => Promise<void>;
  syncFromGithub: () => Promise<void>;
  getPublicDatabaseJson: () => string;
  resetAllDatabase: () => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

function makeValidDocId(prefix: string, name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${slug || 'item'}_${rand}`.slice(0, 100);
}

function clampStr(val: string | undefined, maxLen: number, fallback = ''): string {
  const cleaned = (val ?? '').trim();
  if (!cleaned) return fallback;
  return cleaned.slice(0, maxLen);
}

function sanitizeList(items: string[] | undefined, maxItems: number, maxItemLen: number): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((s) => s.trim().slice(0, maxItemLen))
    .filter((s) => s.length > 0)
    .slice(0, maxItems);
}

function normalizeImageRef(image: string, imageId?: string): string {
  if (imageId && /^[a-zA-Z0-9_\-]+$/.test(imageId)) {
    return `imageRef:${imageId}`;
  }
  const trimmed = image.trim();
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('data:image/') ||
    /^preset:[a-zA-Z0-9_\-]+$/.test(trimmed) ||
    /^imageRef:[a-zA-Z0-9_\-]+$/.test(trimmed)
  ) {
    return trimmed;
  }
  return 'preset:pi5';
}

function mergeRecords<T extends { id: string; updatedAt?: number }>(
  publicItems: T[],
  localItems: T[],
  deletedIds: string[]
): T[] {
  const deletedSet = new Set(deletedIds);
  const map = new Map<string, T>();

  for (const item of publicItems) {
    if (!deletedSet.has(item.id)) {
      map.set(item.id, item);
    }
  }
  for (const item of localItems) {
    map.set(item.id, item);
  }

  return Array.from(map.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingDb, setLoadingDb] = useState(true);
  const [syncingGithub, setSyncingGithub] = useState(false);

  const [githubDb, setGithubDb] = useState<PublicDatabasePayload>(EMPTY_PUBLIC_DB);
  const [githubSource, setGithubSource] = useState<'github' | 'bundled' | 'empty'>('empty');

  const [localBoards, setLocalBoards] = useState<DbBoardRecord[]>([]);
  const [localAccessories, setLocalAccessories] = useState<DbAccessoryRecord[]>([]);
  const [localImages, setLocalImages] = useState<LocalImageAsset[]>([]);
  const [deletedIds, setDeletedIds] = useState<DeletedIdsState>(() => readDeletedIds());

  const loadAll = useCallback(async (isManualSync = false) => {
    if (isManualSync) {
      setSyncingGithub(true);
    } else {
      setLoadingDb(true);
    }
    try {
      const [ghResult, boards, accessories, images] = await Promise.all([
        fetchPublicGithubDatabase(),
        dbGetAll<DbBoardRecord>('boards'),
        dbGetAll<DbAccessoryRecord>('accessories'),
        dbGetAll<LocalImageAsset>('images')
      ]);

      setGithubDb(ghResult.data);
      setGithubSource(ghResult.source);
      setLocalBoards(boards);
      setLocalAccessories(accessories);
      setLocalImages(images);
      setDeletedIds(readDeletedIds());
    } finally {
      setLoadingDb(false);
      setSyncingGithub(false);
    }
  }, []);

  useEffect(() => {
    loadAll(false);
  }, [loadAll]);

  const syncFromGithub = useCallback(async () => {
    await loadAll(true);
  }, [loadAll]);

  // Merged view: Public GitHub DB + Local Browser Edits (excluding locally deleted public IDs)
  const dbBoards = useMemo(
    () => mergeRecords(githubDb.boards, localBoards, deletedIds.boards),
    [githubDb.boards, localBoards, deletedIds.boards]
  );

  const dbAccessories = useMemo(
    () => mergeRecords(githubDb.accessories, localAccessories, deletedIds.accessories),
    [githubDb.accessories, localAccessories, deletedIds.accessories]
  );

  const dbImages = useMemo(
    () => mergeRecords(githubDb.images, localImages, deletedIds.images),
    [githubDb.images, localImages, deletedIds.images]
  );

  const publicBoardIdSet = useMemo(() => new Set(githubDb.boards.map((b) => b.id)), [githubDb.boards]);
  const publicAccessoryIdSet = useMemo(() => new Set(githubDb.accessories.map((a) => a.id)), [githubDb.accessories]);

  const publicCounts = useMemo(
    () => ({
      boards: githubDb.boards.length,
      accessories: githubDb.accessories.length,
      images: githubDb.images.length
    }),
    [githubDb]
  );

  const pendingLocalChanges = useMemo(
    () =>
      localBoards.length +
      localAccessories.length +
      localImages.length +
      deletedIds.boards.length +
      deletedIds.accessories.length +
      deletedIds.images.length,
    [localBoards.length, localAccessories.length, localImages.length, deletedIds]
  );

  const dbImagesCompat = useMemo<DbImageAsset[]>(
    () =>
      dbImages.map((img) => ({
        ...img,
        ownerId: 'github',
        ownerName: 'GitHub',
        isPublic: true
      })),
    [dbImages]
  );

  // Merge Built-in + GitHub/Local DB Official Boards
  const allOfficialBoards = useMemo<ExtendedBoardModel[]>(() => {
    const customOfficial: ExtendedBoardModel[] = dbBoards
      .filter((b) => b.boardType === 'official')
      .map((b) => ({
        id: b.id,
        name: b.name,
        badge: b.badge,
        badgeColor: b.badgeColor,
        category: b.category === 'alternative' ? 'sbc' : b.category,
        releaseDate: b.releaseDate,
        msrp: b.msrp,
        status: b.status,
        image: resolveImageSrc(b.image, b.imageId, dbImagesCompat),
        description: b.description,
        soc: b.soc,
        cpu: b.cpu,
        gpu: b.gpu || 'Integrada',
        ram: b.ram,
        storage: b.storage,
        videoOut: b.videoOut || 'HDMI',
        audio: b.audio || 'HDMI Digital',
        networking: b.networking,
        usb: b.usb || 'USB',
        pcie: b.pcie || 'Não especificado',
        gpio: b.gpio || 'Header 40 Pinos',
        power: b.power,
        dimensions: b.dimensions || 'Padrão SBC',
        keyFeatures: b.keyFeatures.length > 0 ? b.keyFeatures : ['Adicionada manualmente à base de dados'],
        benchmarkScore: b.benchmarkScore,
        isCustom: true,
        isPublicGithub: publicBoardIdSet.has(b.id),
        rawRecord: b
      }));

    const overrideIds = new Set(dbBoards.map((b) => b.id));
    const remainingBuiltin = BOARD_MODELS.filter((m) => !overrideIds.has(m.id));
    return [...customOfficial, ...remainingBuiltin];
  }, [dbBoards, dbImagesCompat, publicBoardIdSet]);

  // Merge Built-in + GitHub/Local DB Alternative Boards
  const allAlternativeBoards = useMemo<ExtendedAlternativeBoard[]>(() => {
    const customAlts: ExtendedAlternativeBoard[] = dbBoards
      .filter((b) => b.boardType === 'alternative')
      .map((b) => ({
        id: b.id,
        name: b.name,
        brand: b.brand,
        badge: b.badge,
        badgeColor: b.badgeColor,
        image: resolveImageSrc(b.image, b.imageId, dbImagesCompat),
        soc: b.soc,
        cpu: b.cpu,
        npu: b.npu || b.gpu || 'Não especificado',
        maxRam: b.ram,
        storage: b.storage,
        networking: b.networking,
        displayOut: b.videoOut || 'HDMI',
        priceRange: b.msrp,
        summary: b.description,
        pros: b.keyFeatures.length > 0 ? b.keyFeatures : ['Placa adicionada manualmente'],
        cons: b.cons && b.cons.length > 0 ? b.cons : ['Registo personalizado'],
        bestFor: b.bestFor || 'Projetos personalizados, servidores e robótica.',
        communityRating: 4.5,
        hardwarePowerRating: Math.max(1, Math.min(5, Number((b.benchmarkScore / 20).toFixed(1)))),
        isCustom: true,
        isPublicGithub: publicBoardIdSet.has(b.id),
        rawRecord: b
      }));

    const overrideIds = new Set(dbBoards.map((b) => b.id));
    const remainingBuiltin = ALTERNATIVE_BOARDS.filter((a) => !overrideIds.has(a.id));
    return [...customAlts, ...remainingBuiltin];
  }, [dbBoards, dbImagesCompat, publicBoardIdSet]);

  // Merge Built-in + GitHub/Local DB Accessories
  const allAccessories = useMemo<ExtendedAccessoryItem[]>(() => {
    const customAcc: ExtendedAccessoryItem[] = dbAccessories.map((acc) => ({
      id: acc.id,
      name: acc.name,
      category: acc.category,
      compatibility: acc.compatibility,
      msrp: acc.msrp,
      specs: acc.specs,
      description: acc.description,
      whyNeeded: acc.whyNeeded,
      image: resolveImageSrc(acc.image, acc.imageId, dbImagesCompat),
      powerDrawWatts: acc.powerDrawWatts,
      isCustom: true,
      isPublicGithub: publicAccessoryIdSet.has(acc.id),
      rawRecord: acc
    }));

    const overrideIds = new Set(dbAccessories.map((a) => a.id));
    const remainingBuiltin = ACCESSORIES_LIST.filter((a) => !overrideIds.has(a.id));
    return [...customAcc, ...remainingBuiltin];
  }, [dbAccessories, dbImagesCompat, publicAccessoryIdSet]);

  const removeFromDeleted = (kind: keyof DeletedIdsState, id: string) => {
    setDeletedIds((prev) => {
      if (!prev[kind].includes(id)) return prev;
      const next = { ...prev, [kind]: prev[kind].filter((x) => x !== id) };
      writeDeletedIds(next);
      return next;
    });
  };

  const addToDeleted = (kind: keyof DeletedIdsState, id: string) => {
    setDeletedIds((prev) => {
      if (prev[kind].includes(id)) return prev;
      const next = { ...prev, [kind]: [...prev[kind], id] };
      writeDeletedIds(next);
      return next;
    });
  };

  const saveBoard = async (input: NewBoardInput, targetId?: string): Promise<string> => {
    const docId = targetId || makeValidDocId('board', input.name);
    const safeImageId = input.imageId && /^[a-zA-Z0-9_\-]+$/.test(input.imageId) ? input.imageId : '';
    const safeImage = normalizeImageRef(input.image, safeImageId);
    const score = Math.max(1, Math.min(100, Math.round(Number(input.benchmarkScore) || 50)));

    const record: DbBoardRecord = {
      id: docId,
      boardType: input.boardType === 'alternative' ? 'alternative' : 'official',
      name: clampStr(input.name, 120, 'Nova Placa'),
      brand: clampStr(input.brand, 80, 'Raspberry Pi'),
      badge: clampStr(input.badge, 100, 'Adicionada Manualmente'),
      badgeColor: clampStr(input.badgeColor, 120, 'border-pink-500/40 text-pink-400 bg-pink-500/10'),
      category: input.category,
      releaseDate: clampStr(input.releaseDate, 60, '2026'),
      msrp: clampStr(input.msrp, 80, '$50'),
      status: input.status,
      image: safeImage,
      imageId: safeImageId,
      description: clampStr(input.description, 1500, 'Especificação de placa adicionada à base de dados.'),
      soc: clampStr(input.soc, 150, 'SoC Custom'),
      cpu: clampStr(input.cpu, 200, 'ARM64 Quad-core'),
      gpu: clampStr(input.gpu, 200, ''),
      npu: clampStr(input.npu, 200, ''),
      ram: clampStr(input.ram, 150, '4GB LPDDR4X'),
      storage: clampStr(input.storage, 250, 'MicroSD'),
      videoOut: clampStr(input.videoOut, 250, ''),
      audio: clampStr(input.audio, 200, ''),
      networking: clampStr(input.networking, 250, 'Wi-Fi / Gigabit Ethernet'),
      usb: clampStr(input.usb, 200, ''),
      pcie: clampStr(input.pcie, 200, ''),
      gpio: clampStr(input.gpio, 200, ''),
      power: clampStr(input.power, 150, '5V / 3A USB-C'),
      dimensions: clampStr(input.dimensions, 120, ''),
      keyFeatures: sanitizeList(input.keyFeatures, 15, 250),
      cons: sanitizeList(input.cons, 10, 250),
      bestFor: clampStr(input.bestFor, 400, ''),
      benchmarkScore: score,
      updatedAt: Date.now()
    };

    await dbPut('boards', record);
    removeFromDeleted('boards', docId);
    setLocalBoards((prev) => [record, ...prev.filter((b) => b.id !== docId)]);
    return docId;
  };

  const deleteBoard = async (boardId: string): Promise<void> => {
    await dbDelete('boards', boardId);
    setLocalBoards((prev) => prev.filter((b) => b.id !== boardId));
    if (githubDb.boards.some((b) => b.id === boardId)) {
      addToDeleted('boards', boardId);
    }
  };

  const saveAccessory = async (input: NewAccessoryInput, targetId?: string): Promise<string> => {
    const docId = targetId || makeValidDocId('acc', input.name);
    const safeImageId = input.imageId && /^[a-zA-Z0-9_\-]+$/.test(input.imageId) ? input.imageId : '';
    const safeImage = normalizeImageRef(input.image || 'preset:gear', safeImageId);
    const watts = Math.max(0, Math.min(100, Number(input.powerDrawWatts) || 0));

    const record: DbAccessoryRecord = {
      id: docId,
      name: clampStr(input.name, 120, 'Novo Acessório'),
      category: input.category,
      compatibility: sanitizeList(input.compatibility, 15, 100),
      msrp: clampStr(input.msrp, 60, '$15'),
      specs: clampStr(input.specs, 400, 'Especificações técnicas'),
      description: clampStr(input.description, 1000, 'Descrição do acessório'),
      whyNeeded: clampStr(input.whyNeeded, 600, 'Complemento recomendado para projetos'),
      image: safeImage,
      imageId: safeImageId,
      powerDrawWatts: watts,
      updatedAt: Date.now()
    };

    await dbPut('accessories', record);
    removeFromDeleted('accessories', docId);
    setLocalAccessories((prev) => [record, ...prev.filter((a) => a.id !== docId)]);
    return docId;
  };

  const deleteAccessory = async (accessoryId: string): Promise<void> => {
    await dbDelete('accessories', accessoryId);
    setLocalAccessories((prev) => prev.filter((a) => a.id !== accessoryId));
    if (githubDb.accessories.some((a) => a.id === accessoryId)) {
      addToDeleted('accessories', accessoryId);
    }
  };

  const saveImageAsset = async (input: NewImageInput, editId?: string): Promise<string> => {
    const docId = editId || makeValidDocId('img', input.title);
    const record: LocalImageAsset = {
      id: docId,
      title: clampStr(input.title, 120, 'Nova Imagem'),
      category: input.category,
      sourceType: input.sourceType,
      url: input.url.trim(),
      altText: clampStr(input.altText, 200, ''),
      tags: sanitizeList(input.tags, 8, 40),
      updatedAt: Date.now()
    };

    await dbPut('images', record);
    removeFromDeleted('images', docId);
    setLocalImages((prev) => [record, ...prev.filter((i) => i.id !== docId)]);
    return docId;
  };

  const deleteImageAsset = async (imageId: string): Promise<void> => {
    await dbDelete('images', imageId);
    setLocalImages((prev) => prev.filter((i) => i.id !== imageId));
    if (githubDb.images.some((i) => i.id === imageId)) {
      addToDeleted('images', imageId);
    }
  };

  const getPublicDatabaseJson = useCallback((): string => {
    return serializePublicDatabase(dbBoards, dbAccessories, dbImages);
  }, [dbBoards, dbAccessories, dbImages]);

  const resetAllDatabase = async (): Promise<void> => {
    await dbClearAll();
    clearDeletedIds();
    setLocalBoards([]);
    setLocalAccessories([]);
    setLocalImages([]);
    setDeletedIds({ boards: [], accessories: [], images: [] });
  };

  return (
    <CatalogContext.Provider
      value={{
        loadingDb,
        syncingGithub,
        githubSource,
        githubUpdatedAt: githubDb.updatedAt,
        publicCounts,
        pendingLocalChanges,
        dbBoards,
        dbAccessories,
        dbImages,
        allOfficialBoards,
        allAlternativeBoards,
        allAccessories,
        saveBoard,
        deleteBoard,
        saveAccessory,
        deleteAccessory,
        saveImageAsset,
        deleteImageAsset,
        syncFromGithub,
        getPublicDatabaseJson,
        resetAllDatabase
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within a CatalogProvider');
  return ctx;
}
