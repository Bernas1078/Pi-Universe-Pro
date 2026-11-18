import React, { useEffect, useState } from 'react';
import {
  Database,
  Plus,
  Cpu,
  Sliders,
  Image as ImageIcon,
  Edit3,
  Trash2,
  CheckCircle2,
  Upload,
  Link as LinkIcon,
  Search,
  RotateCcw,
  Github,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  FileCode2,
  Globe
} from 'lucide-react';
import {
  DbAccessoryRecord,
  DbBoardRecord,
  LocalImageAsset,
  NewAccessoryInput,
  NewBoardInput,
  useCatalog
} from '../context/CatalogContext';
import {
  BUILTIN_IMAGE_PRESETS,
  compressImageFile,
  resolveImageSrc
} from '../data/imagePresets';
import {
  GITHUB_DB_PATH,
  GITHUB_EDIT_DB_URL,
  GITHUB_NEW_DB_URL,
  GITHUB_OWNER,
  GITHUB_REPO
} from '../db/githubDb';
import { BOARD_MODELS } from '../data/models';
import { ALTERNATIVE_BOARDS } from '../data/alternatives';
import { ACCESSORIES_LIST } from '../data/accessories';
import { ImagePickerModal } from './ImagePickerModal';

type DbSubTab = 'boards' | 'accessories' | 'images';

const BADGE_COLOR_OPTIONS = [
  { label: 'Rosa Pi', value: 'border-pink-500/40 text-pink-400 bg-pink-500/10' },
  { label: 'Esmeralda', value: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
  { label: 'Ciano', value: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
  { label: 'Laranja', value: 'border-orange-500/40 text-orange-400 bg-orange-500/10' },
  { label: 'Azul', value: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { label: 'Violeta', value: 'border-violet-500/40 text-violet-400 bg-violet-500/10' },
  { label: 'Âmbar', value: 'border-amber-500/40 text-amber-400 bg-amber-500/10' }
];

const EMPTY_BOARD_FORM: NewBoardInput = {
  boardType: 'official',
  name: '',
  brand: 'Raspberry Pi',
  badge: 'Nova Placa',
  badgeColor: BADGE_COLOR_OPTIONS[0].value,
  category: 'sbc',
  releaseDate: '2026',
  msrp: '$60',
  status: 'Ativo',
  image: 'preset:pi5',
  imageId: '',
  description: '',
  soc: '',
  cpu: '',
  gpu: '',
  npu: '',
  ram: '',
  storage: '',
  videoOut: '',
  audio: '',
  networking: '',
  usb: '',
  pcie: '',
  gpio: 'Header padrão de 40 pinos',
  power: '5V / 5A USB-C PD',
  dimensions: '85 x 56 mm',
  keyFeatures: [],
  cons: [],
  bestFor: '',
  benchmarkScore: 75
};

const EMPTY_ACCESSORY_FORM: NewAccessoryInput = {
  name: '',
  category: 'hat',
  compatibility: ['Raspberry Pi 5'],
  msrp: '$15',
  specs: '',
  description: '',
  whyNeeded: '',
  image: 'preset:gear',
  imageId: '',
  powerDrawWatts: 1.0
};

interface DatabaseManagerProps {
  initialSection?: DbSubTab;
  initialOpenBoardForm?: boolean;
  initialBoardType?: 'official' | 'alternative';
  initialOpenAccessoryForm?: boolean;
  initialEditBoardId?: string;
  initialEditAccessoryId?: string;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  initialSection = 'boards',
  initialOpenBoardForm = false,
  initialBoardType = 'official',
  initialOpenAccessoryForm = false,
  initialEditBoardId,
  initialEditAccessoryId
}) => {
  const {
    syncingGithub,
    githubStatus,
    githubSource,
    lastCommitUrl,
    lastSyncTime,
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
    pushPendingToGithub,
    getPublicDatabaseJson,
    resetAllDatabase
  } = useCatalog();

  const [subTab, setSubTab] = useState<DbSubTab>(initialSection);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  // Board form state
  const [showBoardForm, setShowBoardForm] = useState(initialOpenBoardForm);
  const [editingBoardId, setEditingBoardId] = useState<string | undefined>(undefined);
  const [boardForm, setBoardForm] = useState<NewBoardInput>({
    ...EMPTY_BOARD_FORM,
    boardType: initialBoardType,
    category: initialBoardType === 'alternative' ? 'alternative' : 'sbc',
    brand: initialBoardType === 'alternative' ? 'Orange Pi' : 'Raspberry Pi'
  });
  const [featuresText, setFeaturesText] = useState('');
  const [consText, setConsText] = useState('');

  // Accessory form state
  const [showAccessoryForm, setShowAccessoryForm] = useState(initialOpenAccessoryForm);
  const [editingAccessoryId, setEditingAccessoryId] = useState<string | undefined>(undefined);
  const [accForm, setAccForm] = useState<NewAccessoryInput>(EMPTY_ACCESSORY_FORM);
  const [compatText, setCompatText] = useState('Raspberry Pi 5, Raspberry Pi 4');

  // Image form state
  const [showImageForm, setShowImageForm] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | undefined>(undefined);
  const [imgTitle, setImgTitle] = useState('');
  const [imgCategory, setImgCategory] = useState<'board' | 'accessory' | 'pinout' | 'other'>('board');
  const [imgMode, setImgMode] = useState<'url' | 'upload'>('upload');
  const [imgUrl, setImgUrl] = useState('');
  const [imgAlt, setImgAlt] = useState('');
  const [imgTagsText, setImgTagsText] = useState('sbc, hardware');
  const [imgUploadPreview, setImgUploadPreview] = useState('');

  // Image picker modal target
  const [pickerTarget, setPickerTarget] = useState<'board' | 'accessory' | null>(null);

  // Confirm delete / reset state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'board' | 'accessory' | 'image' | 'reset_all';
    id: string;
    name: string;
    isOverride?: boolean;
  } | null>(null);

  const dbImagesCompat = dbImages.map((i) => ({
    ...i,
    ownerId: 'local',
    ownerName: 'Local',
    isPublic: true
  }));

  const notify = (msg: string) => {
    setToast(msg);
    setErrorMsg(null);
    setTimeout(() => setToast(null), 4000);
  };

  const openEditBoardRecord = (record: DbBoardRecord) => {
    setEditingBoardId(record.id);
    setBoardForm({
      boardType: record.boardType,
      name: record.name,
      brand: record.brand,
      badge: record.badge,
      badgeColor: record.badgeColor,
      category: record.category,
      releaseDate: record.releaseDate,
      msrp: record.msrp,
      status: record.status,
      image: record.image,
      imageId: record.imageId || '',
      description: record.description,
      soc: record.soc,
      cpu: record.cpu,
      gpu: record.gpu || '',
      npu: record.npu || '',
      ram: record.ram,
      storage: record.storage,
      videoOut: record.videoOut || '',
      audio: record.audio || '',
      networking: record.networking,
      usb: record.usb || '',
      pcie: record.pcie || '',
      gpio: record.gpio || '',
      power: record.power,
      dimensions: record.dimensions || '',
      keyFeatures: record.keyFeatures || [],
      cons: record.cons || [],
      bestFor: record.bestFor || '',
      benchmarkScore: record.benchmarkScore
    });
    setFeaturesText((record.keyFeatures || []).join('\n'));
    setConsText((record.cons || []).join('\n'));
    setShowBoardForm(true);
    setErrorMsg(null);
  };

  const openEditAnyBoard = (boardId: string) => {
    const dbRec = dbBoards.find((b) => b.id === boardId);
    if (dbRec) {
      openEditBoardRecord(dbRec);
      setSubTab('boards');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const builtinOfficial = BOARD_MODELS.find((m) => m.id === boardId);
    if (builtinOfficial) {
      setEditingBoardId(builtinOfficial.id);
      setBoardForm({
        boardType: 'official',
        name: builtinOfficial.name,
        brand: 'Raspberry Pi',
        badge: builtinOfficial.badge,
        badgeColor: builtinOfficial.badgeColor,
        category: builtinOfficial.category,
        releaseDate: builtinOfficial.releaseDate,
        msrp: builtinOfficial.msrp,
        status: builtinOfficial.status,
        image: `preset:${builtinOfficial.id}`,
        imageId: '',
        description: builtinOfficial.description,
        soc: builtinOfficial.soc,
        cpu: builtinOfficial.cpu,
        gpu: builtinOfficial.gpu,
        npu: '',
        ram: builtinOfficial.ram,
        storage: builtinOfficial.storage,
        videoOut: builtinOfficial.videoOut,
        audio: builtinOfficial.audio,
        networking: builtinOfficial.networking,
        usb: builtinOfficial.usb,
        pcie: builtinOfficial.pcie,
        gpio: builtinOfficial.gpio,
        power: builtinOfficial.power,
        dimensions: builtinOfficial.dimensions,
        keyFeatures: builtinOfficial.keyFeatures,
        cons: [],
        bestFor: '',
        benchmarkScore: builtinOfficial.benchmarkScore
      });
      setFeaturesText(builtinOfficial.keyFeatures.join('\n'));
      setConsText('');
      setShowBoardForm(true);
      setSubTab('boards');
      setErrorMsg(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const builtinAlt = ALTERNATIVE_BOARDS.find((a) => a.id === boardId);
    if (builtinAlt) {
      setEditingBoardId(builtinAlt.id);
      setBoardForm({
        boardType: 'alternative',
        name: builtinAlt.name,
        brand: builtinAlt.brand,
        badge: builtinAlt.badge,
        badgeColor: builtinAlt.badgeColor,
        category: 'alternative',
        releaseDate: 'Ativo',
        msrp: builtinAlt.priceRange,
        status: 'Ativo',
        image: `preset:${builtinAlt.id}`,
        imageId: '',
        description: builtinAlt.summary,
        soc: builtinAlt.soc,
        cpu: builtinAlt.cpu,
        gpu: '',
        npu: builtinAlt.npu,
        ram: builtinAlt.maxRam,
        storage: builtinAlt.storage,
        videoOut: builtinAlt.displayOut,
        audio: 'HDMI Digital',
        networking: builtinAlt.networking,
        usb: 'USB 3.0 / USB-C',
        pcie: 'M.2 NVMe',
        gpio: '40 Pinos',
        power: '5V / 4A DC',
        dimensions: 'Padrão SBC',
        keyFeatures: builtinAlt.pros,
        cons: builtinAlt.cons,
        bestFor: builtinAlt.bestFor,
        benchmarkScore: Math.round(builtinAlt.hardwarePowerRating * 20)
      });
      setFeaturesText(builtinAlt.pros.join('\n'));
      setConsText(builtinAlt.cons.join('\n'));
      setShowBoardForm(true);
      setSubTab('boards');
      setErrorMsg(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openEditAccessoryRecord = (record: DbAccessoryRecord) => {
    setEditingAccessoryId(record.id);
    setAccForm({
      name: record.name,
      category: record.category,
      compatibility: record.compatibility,
      msrp: record.msrp,
      specs: record.specs,
      description: record.description,
      whyNeeded: record.whyNeeded,
      image: record.image,
      imageId: record.imageId || '',
      powerDrawWatts: record.powerDrawWatts
    });
    setCompatText(record.compatibility.join(', '));
    setShowAccessoryForm(true);
    setErrorMsg(null);
  };

  const openEditAnyAccessory = (accId: string) => {
    const dbRec = dbAccessories.find((a) => a.id === accId);
    if (dbRec) {
      openEditAccessoryRecord(dbRec);
      setSubTab('accessories');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const builtinAcc = ACCESSORIES_LIST.find((a) => a.id === accId);
    if (builtinAcc) {
      setEditingAccessoryId(builtinAcc.id);
      setAccForm({
        name: builtinAcc.name,
        category: builtinAcc.category,
        compatibility: builtinAcc.compatibility,
        msrp: builtinAcc.msrp,
        specs: builtinAcc.specs,
        description: builtinAcc.description,
        whyNeeded: builtinAcc.whyNeeded,
        image: 'preset:gear',
        imageId: '',
        powerDrawWatts: builtinAcc.powerDrawWatts
      });
      setCompatText(builtinAcc.compatibility.join(', '));
      setShowAccessoryForm(true);
      setSubTab('accessories');
      setErrorMsg(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openEditImage = (img: LocalImageAsset) => {
    setEditingImageId(img.id);
    setImgTitle(img.title);
    setImgCategory(img.category);
    setImgAlt(img.altText || '');
    setImgTagsText(img.tags.join(', '));
    if (img.sourceType === 'compressed') {
      setImgMode('upload');
      setImgUploadPreview(img.url);
      setImgUrl('');
    } else {
      setImgMode('url');
      setImgUrl(img.url);
      setImgUploadPreview('');
    }
    setShowImageForm(true);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (initialEditBoardId) {
      openEditAnyBoard(initialEditBoardId);
    } else if (initialEditAccessoryId) {
      openEditAnyAccessory(initialEditAccessoryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEditBoardId, initialEditAccessoryId]);

  const openNewBoardForm = (type: 'official' | 'alternative' = 'official') => {
    setEditingBoardId(undefined);
    setBoardForm({
      ...EMPTY_BOARD_FORM,
      boardType: type,
      category: type === 'alternative' ? 'alternative' : 'sbc',
      brand: type === 'alternative' ? 'Outra Marca' : 'Raspberry Pi',
      image: type === 'alternative' ? 'preset:orangepi5plus' : 'preset:pi5'
    });
    setFeaturesText('');
    setConsText('');
    setShowBoardForm(true);
    setErrorMsg(null);
  };

  const handleBoardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (boardForm.name.trim().length < 2) {
      setErrorMsg('O nome da placa deve ter pelo menos 2 caracteres.');
      return;
    }
    if (boardForm.description.trim().length < 5) {
      setErrorMsg('Adicione uma descrição de pelo menos 5 caracteres.');
      return;
    }

    const parsedFeatures = featuresText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 15);
    const parsedCons = consText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 10);

    setSaving(true);
    try {
      const outcome = await saveBoard(
        {
          ...boardForm,
          keyFeatures: parsedFeatures.length > 0 ? parsedFeatures : ['Adicionada manualmente à base de dados'],
          cons: parsedCons
        },
        editingBoardId
      );
      setShowBoardForm(false);
      setEditingBoardId(undefined);
      if (outcome.committedToGithub) {
        notify(
          editingBoardId
            ? 'Placa atualizada e enviada automaticamente para public/database.json no GitHub!'
            : 'Nova placa guardada automaticamente em public/database.json no GitHub!'
        );
      } else if (outcome.error) {
        setErrorMsg(`Guardado localmente, mas o GitHub devolveu erro: ${outcome.error}`);
      } else if (outcome.savedToDisk) {
        notify('Placa guardada localmente! Verifique GITHUB_TOKEN para envio automático ao GitHub.');
      } else {
        notify(editingBoardId ? 'Placa atualizada localmente!' : 'Nova placa guardada localmente!');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao guardar a placa.');
    } finally {
      setSaving(false);
    }
  };

  const openNewAccessoryForm = () => {
    setEditingAccessoryId(undefined);
    setAccForm(EMPTY_ACCESSORY_FORM);
    setCompatText('Raspberry Pi 5, Raspberry Pi 4');
    setShowAccessoryForm(true);
    setErrorMsg(null);
  };

  const handleAccessorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (accForm.name.trim().length < 2) {
      setErrorMsg('O nome do acessório deve ter pelo menos 2 caracteres.');
      return;
    }

    const compatList = compatText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15);

    setSaving(true);
    try {
      const outcome = await saveAccessory(
        {
          ...accForm,
          compatibility: compatList.length > 0 ? compatList : ['Universal']
        },
        editingAccessoryId
      );
      setShowAccessoryForm(false);
      setEditingAccessoryId(undefined);
      if (outcome.committedToGithub) {
        notify(
          editingAccessoryId
            ? 'Acessório atualizado automaticamente em public/database.json no GitHub!'
            : 'Novo acessório guardado automaticamente no GitHub!'
        );
      } else if (outcome.error) {
        setErrorMsg(`Guardado localmente, mas o GitHub devolveu erro: ${outcome.error}`);
      } else if (outcome.savedToDisk) {
        notify('Acessório guardado localmente! Verifique GITHUB_TOKEN para envio direto.');
      } else {
        notify(editingAccessoryId ? 'Acessório atualizado localmente!' : 'Novo acessório guardado localmente!');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao guardar acessório.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setImgUploadPreview(compressed);
      if (!imgTitle.trim()) {
        setImgTitle(file.name.replace(/\.[^.]+$/, '').slice(0, 80));
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao comprimir imagem.');
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (imgTitle.trim().length < 2) {
      setErrorMsg('Indique um título com pelo menos 2 caracteres.');
      return;
    }

    const finalUrl = imgMode === 'upload' ? imgUploadPreview : imgUrl.trim();
    if (imgMode === 'url' && !finalUrl.startsWith('https://') && !finalUrl.startsWith('http://')) {
      setErrorMsg('O URL da imagem deve começar por https:// ou http://');
      return;
    }
    if (imgMode === 'upload' && !finalUrl.startsWith('data:image/')) {
      setErrorMsg('Selecione um ficheiro de imagem para carregar.');
      return;
    }

    const tags = imgTagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 8);

    setSaving(true);
    try {
      const outcome = await saveImageAsset(
        {
          title: imgTitle.trim(),
          category: imgCategory,
          sourceType: imgMode === 'upload' ? 'compressed' : 'url',
          url: finalUrl,
          altText: imgAlt.trim() || imgTitle.trim(),
          tags
        },
        editingImageId
      );
      setShowImageForm(false);
      setEditingImageId(undefined);
      setImgTitle('');
      setImgUrl('');
      setImgAlt('');
      setImgUploadPreview('');
      if (outcome.committedToGithub) {
        notify('Imagem guardada automaticamente em public/database.json no GitHub!');
      } else if (outcome.error) {
        setErrorMsg(`Guardada localmente, mas o GitHub devolveu erro: ${outcome.error}`);
      } else {
        notify(editingImageId ? 'Imagem atualizada no Banco!' : 'Imagem adicionada ao Banco de Imagens!');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao guardar imagem.');
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      let committed = false;
      if (confirmDelete.type === 'board') {
        const res = await deleteBoard(confirmDelete.id);
        committed = res.committedToGithub;
      }
      if (confirmDelete.type === 'accessory') {
        const res = await deleteAccessory(confirmDelete.id);
        committed = res.committedToGithub;
      }
      if (confirmDelete.type === 'image') {
        const res = await deleteImageAsset(confirmDelete.id);
        committed = res.committedToGithub;
      }
      if (confirmDelete.type === 'reset_all') await resetAllDatabase();

      notify(
        confirmDelete.type === 'reset_all'
          ? 'Rascunhos locais descartados (dados públicos do GitHub mantidos).'
          : committed
          ? `"${confirmDelete.name}" atualizado automaticamente no GitHub!`
          : confirmDelete.isOverride
          ? `"${confirmDelete.name}" reposto para a versão original.`
          : `"${confirmDelete.name}" removido da base de dados.`
      );
      setConfirmDelete(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao remover registo.');
    } finally {
      setSaving(false);
    }
  };

  const filteredDbImages = dbImages.filter(
    (i) =>
      !searchTerm.trim() ||
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPublicGithub = publicCounts.boards + publicCounts.accessories + publicCounts.images;
  const publicJsonString = getPublicDatabaseJson();

  const handleCopyDatabaseJson = async () => {
    try {
      await navigator.clipboard.writeText(publicJsonString);
      setCopiedJson(true);
      notify('JSON da base de dados copiado! Cole em public/database.json no GitHub e faça Commit.');
      setTimeout(() => setCopiedJson(false), 3000);
    } catch {
      setShowJsonPreview(true);
      notify('Selecione e copie o JSON abaixo para colar em public/database.json no GitHub.');
    }
  };

  const handleSyncGithub = async () => {
    await syncFromGithub();
    notify('Base de dados sincronizada a partir do GitHub!');
  };

  const handlePushNow = async () => {
    setErrorMsg(null);
    const res = await pushPendingToGithub();
    if (res.committedToGithub) {
      notify('Alterações enviadas diretamente para public/database.json no GitHub!');
    } else if (res.error) {
      setErrorMsg(`Erro ao enviar para o GitHub: ${res.error}`);
    } else {
      setErrorMsg('Configure GITHUB_TOKEN nas Secrets do ambiente para ativar envio automático.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-br from-zinc-900 via-[#0f1422] to-[#1a0d16] border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e31b5d]/15 text-[#e31b5d] border border-[#e31b5d]/30">
            <Github className="w-3.5 h-3.5" />
            <span>Auto-Sync GitHub ({GITHUB_DB_PATH})</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Gestor de <span className="text-[#e31b5d]">Placas, Acessórios & Imagens</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl">
            Base de dados auto-sincronizada com <code className="text-zinc-200 font-mono">{GITHUB_OWNER}/{GITHUB_REPO}</code>. Sempre que clicar em guardar numa placa, acessório ou imagem, o ficheiro <code className="text-zinc-200 font-mono">{GITHUB_DB_PATH}</code> é atualizado automaticamente no GitHub sem precisar de mexer em nada.
          </p>
        </div>

        {/* Summary & Reset */}
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 min-w-[260px] space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-900/90 rounded-xl p-2 border border-zinc-800">
              <div className="text-base font-extrabold text-[#e31b5d] font-mono">{dbBoards.length}</div>
              <div className="text-[10px] text-zinc-400">Placas BD</div>
            </div>
            <div className="bg-zinc-900/90 rounded-xl p-2 border border-zinc-800">
              <div className="text-base font-extrabold text-amber-400 font-mono">{dbAccessories.length}</div>
              <div className="text-[10px] text-zinc-400">Acessórios</div>
            </div>
            <div className="bg-zinc-900/90 rounded-xl p-2 border border-zinc-800">
              <div className="text-base font-extrabold text-cyan-400 font-mono">{dbImages.length}</div>
              <div className="text-[10px] text-zinc-400">Imagens</div>
            </div>
          </div>

          {pendingLocalChanges > 0 && (
            <button
              onClick={() =>
                setConfirmDelete({
                  type: 'reset_all',
                  id: 'all',
                  name: 'todos os rascunhos locais (mantém os dados públicos do GitHub)'
                })
              }
              className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-rose-500/15 text-zinc-300 hover:text-rose-300 border border-zinc-800 hover:border-rose-500/40 text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Descartar Rascunhos Locais</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto-Sync & Direct GitHub Save Panel */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Sincronização Automática com GitHub</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-950 border border-zinc-700 text-zinc-300 font-mono">
                {githubStatus.owner}/{githubStatus.repo}
              </span>

              {githubStatus.autoCommitReady ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300">
                  Edição Pública Aberta a Todos · Save Direto no GitHub Ativo
                </span>
              ) : githubStatus.backendAvailable ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                  Auto-Sync de Leitura Ativo · Aguardar GITHUB_TOKEN no servidor
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300">
                  GitHub Pages (Estático) · Ligue um backend público para Save direto de todos
                </span>
              )}

              {pendingLocalChanges > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/15 border border-pink-500/40 text-pink-300">
                  {pendingLocalChanges} {pendingLocalChanges === 1 ? 'alteração pendente' : 'alterações pendentes'}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400">
              {githubStatus.autoCommitReady ? (
                <>
                  Qualquer visitante pode adicionar, editar ou remover placas, acessórios e imagens sem login: cada alteração é fundida de forma segura no servidor e gravada direto em <code className="text-zinc-200 font-mono">{githubStatus.path}</code> no GitHub (auto-sync a cada 15s · {totalPublicGithub} registos públicos).
                </>
              ) : githubStatus.backendAvailable ? (
                <>
                  O site lê automaticamente <code className="text-zinc-200 font-mono">{githubStatus.path}</code> do GitHub a cada 15s ({githubSource === 'github' ? 'ligado ao GitHub' : 'ficheiro local'}). Para gravar direto no GitHub sem mexer em nada, defina a variável <code className="text-zinc-200 font-mono">GITHUB_TOKEN</code> nas Secrets do servidor.
                </>
              ) : (
                <>
                  O GitHub Pages é estático e lê automaticamente <code className="text-zinc-200 font-mono">{githubStatus.path}</code> a cada 15s ({totalPublicGithub} registos públicos). Para que todos os visitantes consigam gravar direto no GitHub a partir daqui, publique o <code className="text-zinc-200 font-mono">Cloudflare Worker</code> (grátis, com <code className="text-zinc-200 font-mono">GITHUB_TOKEN</code>) e defina a variável <code className="text-zinc-200 font-mono">VITE_API_BASE_URL</code> no GitHub.
                </>
              )}
              {lastSyncTime && (
                <span className="text-zinc-500 ml-1.5">
                  (Última sincronização: {lastSyncTime.toLocaleTimeString('pt-PT')})
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {githubStatus.autoCommitReady && pendingLocalChanges > 0 && (
              <button
                type="button"
                onClick={handlePushNow}
                disabled={syncingGithub}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Github className="w-4 h-4" />
                <span>Enviar Pendentes Agora</span>
              </button>
            )}

            {lastCommitUrl && (
              <a
                href={lastCommitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ver Commit</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              type="button"
              onClick={handleSyncGithub}
              disabled={syncingGithub}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Recarregar public/database.json diretamente do GitHub"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingGithub ? 'animate-spin' : ''}`} />
              <span>{syncingGithub ? 'A sincronizar...' : 'Sincronizar'}</span>
            </button>

            {!githubStatus.autoCommitReady && (
              <>
                <button
                  type="button"
                  onClick={handleCopyDatabaseJson}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    copiedJson
                      ? 'bg-emerald-500 text-white'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
                  }`}
                >
                  {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedJson ? 'Copiado!' : 'Copiar JSON'}</span>
                </button>
                <a
                  href={githubSource === 'github' ? GITHUB_EDIT_DB_URL : GITHUB_NEW_DB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Abrir Ficheiro</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </>
            )}

            <button
              type="button"
              onClick={() => setShowJsonPreview((prev) => !prev)}
              className="px-3.5 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>{showJsonPreview ? 'Ocultar JSON' : 'Ver JSON'}</span>
            </button>
          </div>
        </div>

        {/* Expandable JSON preview */}
        {showJsonPreview && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-mono text-zinc-300">{githubStatus.path}</span>
              <span>{(publicJsonString.length / 1024).toFixed(1)} KB</span>
            </div>
            <textarea
              readOnly
              value={publicJsonString}
              onFocus={(e) => e.currentTarget.select()}
              rows={10}
              className="w-full p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-emerald-300 focus:outline-none focus:border-[#e31b5d]"
            />
          </div>
        )}
      </div>

      {/* Feedback messages */}
      {toast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Sub-navigation & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setSubTab('boards')}
            className={`px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              subTab === 'boards'
                ? 'bg-[#e31b5d] text-white shadow-sm shadow-[#e31b5d]/30'
                : 'bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Placas ({allOfficialBoards.length + allAlternativeBoards.length})</span>
          </button>

          <button
            onClick={() => setSubTab('accessories')}
            className={`px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              subTab === 'accessories'
                ? 'bg-amber-500 text-black font-bold'
                : 'bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Acessórios ({allAccessories.length})</span>
          </button>

          <button
            onClick={() => setSubTab('images')}
            className={`px-4 py-2.5 rounded-xl font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
              subTab === 'images'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Banco de Imagens ({dbImages.length + BUILTIN_IMAGE_PRESETS.length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar na base de dados..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#e31b5d]"
          />
        </div>
      </div>

      {/* ================================================================ */}
      {/* SUB-TAB 1: BOARDS DATABASE */}
      {/* ================================================================ */}
      {subTab === 'boards' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Base de Placas (Oficiais & Alternativas)</h3>
              <p className="text-xs text-zinc-400">
                Adicione novas placas manualmente ou clique em "Editar" em qualquer placa para alterar especificações e imagens.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => openNewBoardForm('official')}
                className="px-4 py-2.5 rounded-xl bg-[#e31b5d] hover:bg-[#c5124b] text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-[#e31b5d]/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Placa Raspberry / SBC</span>
              </button>
              <button
                onClick={() => openNewBoardForm('alternative')}
                className="px-4 py-2.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Placa Alternativa</span>
              </button>
            </div>
          </div>

          {/* Board Create / Edit Form */}
          {showBoardForm && (
            <form
              onSubmit={handleBoardSubmit}
              className="bg-zinc-900/80 border border-[#e31b5d]/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">
                    {editingBoardId ? `Editar Placa: ${boardForm.name || editingBoardId}` : 'Adicionar Nova Placa Manualmente'}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Preencha ou altere as especificações técnicas e associe uma foto do Banco de Imagens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowBoardForm(false);
                    setEditingBoardId(undefined);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Image Selector Preview */}
                <div className="lg:col-span-4 space-y-3">
                  <label className="text-xs font-semibold text-zinc-300 block">Fotografia da Placa</label>
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
                    <img
                      src={resolveImageSrc(boardForm.image, boardForm.imageId, dbImagesCompat)}
                      alt="Pré-visualização da placa"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${boardForm.badgeColor}`}>
                        {boardForm.badge || 'Destaque'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerTarget('board')}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center space-x-2 border border-zinc-700 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-[#e31b5d]" />
                    <span>Escolher / Carregar Imagem</span>
                  </button>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs text-zinc-400 block">Cor da etiqueta (Badge):</label>
                    <div className="flex flex-wrap gap-1.5">
                      {BADGE_COLOR_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() => setBoardForm({ ...boardForm, badgeColor: opt.value })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer ${opt.value} ${
                            boardForm.badgeColor === opt.value ? 'ring-2 ring-white/40' : 'opacity-65 hover:opacity-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs text-zinc-400 flex justify-between">
                      <span>Índice de Desempenho (1 - 100):</span>
                      <strong className="text-[#e31b5d] font-mono">{boardForm.benchmarkScore}/100</strong>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={boardForm.benchmarkScore}
                      onChange={(e) => setBoardForm({ ...boardForm, benchmarkScore: Number(e.target.value) })}
                      className="w-full accent-[#e31b5d]"
                    />
                  </div>
                </div>

                {/* Right: Core Specs Inputs */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-zinc-400 block mb-1">Tipo de Catálogo *</label>
                    <select
                      value={boardForm.boardType}
                      onChange={(e) => {
                        const t = e.target.value as 'official' | 'alternative';
                        setBoardForm({
                          ...boardForm,
                          boardType: t,
                          category: t === 'alternative' ? 'alternative' : 'sbc'
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    >
                      <option value="official">Linha Oficial / Modelos & Specs</option>
                      <option value="alternative">Cópia / Alternativa SBC</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Categoria *</label>
                    <select
                      value={boardForm.category}
                      onChange={(e) =>
                        setBoardForm({ ...boardForm, category: e.target.value as NewBoardInput['category'] })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    >
                      <option value="sbc">Placa SBC (Pi 5, 4, 3...)</option>
                      <option value="compute">Compute Module (CM4/CM5)</option>
                      <option value="zero">Linha Zero / Compacta</option>
                      <option value="mcu">Microcontrolador (Pico / ESP)</option>
                      <option value="keyboard">Computador Teclado (400/500)</option>
                      <option value="alternative">Alternativa / Concorrente</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Nome da Placa *</label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={boardForm.name}
                      onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                      placeholder="Ex: Raspberry Pi 500 ou Orange Pi 5 Ultra"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Marca / Fabricante *</label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={boardForm.brand}
                      onChange={(e) => setBoardForm({ ...boardForm, brand: e.target.value })}
                      placeholder="Ex: Raspberry Pi, Radxa, Orange Pi"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Destaque (Badge) *</label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={boardForm.badge}
                      onChange={(e) => setBoardForm({ ...boardForm, badge: e.target.value })}
                      placeholder="Ex: 16GB RAM / PCIe Gen3"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Preço Estimado (MSRP) *</label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={boardForm.msrp}
                      onChange={(e) => setBoardForm({ ...boardForm, msrp: e.target.value })}
                      placeholder="Ex: $90 - $120"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Data de Lançamento *</label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      value={boardForm.releaseDate}
                      onChange={(e) => setBoardForm({ ...boardForm, releaseDate: e.target.value })}
                      placeholder="Ex: Dezembro de 2024"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Estado de Mercado *</label>
                    <select
                      value={boardForm.status}
                      onChange={(e) =>
                        setBoardForm({ ...boardForm, status: e.target.value as NewBoardInput['status'] })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Foco Educacional">Foco Educacional</option>
                      <option value="Legado">Legado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Processador SoC *</label>
                    <input
                      type="text"
                      required
                      maxLength={150}
                      value={boardForm.soc}
                      onChange={(e) => setBoardForm({ ...boardForm, soc: e.target.value })}
                      placeholder="Ex: Broadcom BCM2712 / Rockchip RK3588"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">CPU & Arquitetura *</label>
                    <input
                      type="text"
                      required
                      maxLength={200}
                      value={boardForm.cpu}
                      onChange={(e) => setBoardForm({ ...boardForm, cpu: e.target.value })}
                      placeholder="Ex: Quad-core Cortex-A76 @ 2.4 GHz"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Memória RAM *</label>
                    <input
                      type="text"
                      required
                      maxLength={150}
                      value={boardForm.ram}
                      onChange={(e) => setBoardForm({ ...boardForm, ram: e.target.value })}
                      placeholder="Ex: 8GB / 16GB LPDDR4X"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">GPU / Aceleração IA (NPU)</label>
                    <input
                      type="text"
                      maxLength={200}
                      value={boardForm.boardType === 'alternative' ? boardForm.npu || '' : boardForm.gpu || ''}
                      onChange={(e) =>
                        boardForm.boardType === 'alternative'
                          ? setBoardForm({ ...boardForm, npu: e.target.value })
                          : setBoardForm({ ...boardForm, gpu: e.target.value })
                      }
                      placeholder={
                        boardForm.boardType === 'alternative'
                          ? 'Ex: 6 TOPS NPU integrada'
                          : 'Ex: VideoCore VII @ 800 MHz'
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Armazenamento *</label>
                    <input
                      type="text"
                      required
                      maxLength={250}
                      value={boardForm.storage}
                      onChange={(e) => setBoardForm({ ...boardForm, storage: e.target.value })}
                      placeholder="Ex: MicroSD + Slot M.2 NVMe PCIe"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Rede & Conectividade *</label>
                    <input
                      type="text"
                      required
                      maxLength={250}
                      value={boardForm.networking}
                      onChange={(e) => setBoardForm({ ...boardForm, networking: e.target.value })}
                      placeholder="Ex: Gigabit Ethernet, Wi-Fi 6, BT 5.2"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Saídas de Vídeo</label>
                    <input
                      type="text"
                      maxLength={250}
                      value={boardForm.videoOut || ''}
                      onChange={(e) => setBoardForm({ ...boardForm, videoOut: e.target.value })}
                      placeholder="Ex: 2x Micro-HDMI 4K @ 60Hz"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Alimentação *</label>
                    <input
                      type="text"
                      required
                      maxLength={150}
                      value={boardForm.power}
                      onChange={(e) => setBoardForm({ ...boardForm, power: e.target.value })}
                      placeholder="Ex: 5V / 5A via USB-C PD"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Portas USB</label>
                    <input
                      type="text"
                      maxLength={200}
                      value={boardForm.usb || ''}
                      onChange={(e) => setBoardForm({ ...boardForm, usb: e.target.value })}
                      placeholder="Ex: 2x USB 3.0 + 2x USB 2.0"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">PCIe / Dimensões</label>
                    <input
                      type="text"
                      maxLength={200}
                      value={boardForm.pcie || ''}
                      onChange={(e) => setBoardForm({ ...boardForm, pcie: e.target.value })}
                      placeholder="Ex: PCIe 2.0 x1 / 85 x 56 mm"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1">Descrição Completa *</label>
                    <textarea
                      required
                      rows={3}
                      maxLength={1500}
                      value={boardForm.description}
                      onChange={(e) => setBoardForm({ ...boardForm, description: e.target.value })}
                      placeholder="Descreva os pontos fortes, arquitetura e casos de uso principais desta placa..."
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Recursos / Vantagens (1 por linha)</label>
                    <textarea
                      rows={3}
                      value={featuresText}
                      onChange={(e) => setFeaturesText(e.target.value)}
                      placeholder={'Boot nativo por NVMe\nBaixo consumo térmico\nHeader 40 pinos compatível'}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">
                      {boardForm.boardType === 'alternative'
                        ? 'Limitações (1 por linha)'
                        : 'Ideal Para (Resumo de Uso)'}
                    </label>
                    {boardForm.boardType === 'alternative' ? (
                      <textarea
                        rows={3}
                        value={consText}
                        onChange={(e) => setConsText(e.target.value)}
                        placeholder={'Comunidade menor\nFonte dedicada necessária'}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                      />
                    ) : (
                      <textarea
                        rows={3}
                        maxLength={400}
                        value={boardForm.bestFor || ''}
                        onChange={(e) => setBoardForm({ ...boardForm, bestFor: e.target.value })}
                        placeholder="Servidores domésticos, robótica, automação..."
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBoardForm(false);
                    setEditingBoardId(undefined);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#e31b5d] hover:bg-[#c5124b] disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-[#e31b5d]/30 cursor-pointer"
                >
                  {saving
                    ? 'A guardar...'
                    : editingBoardId
                    ? 'Guardar Alterações'
                    : 'Adicionar Placa à Base de Dados'}
                </button>
              </div>
            </form>
          )}

          {/* Unified Catalog of All Boards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              ...allOfficialBoards.map((b) => ({
                id: b.id,
                name: b.name,
                brand: b.rawRecord?.brand || 'Raspberry Pi',
                typeLabel: 'Modelo Oficial',
                msrp: b.msrp,
                soc: b.soc,
                ram: b.ram,
                description: b.description,
                image: b.image,
                isCustom: Boolean(b.isCustom),
                isBuiltinOverride: Boolean(b.isCustom && BOARD_MODELS.some((m) => m.id === b.id))
              })),
              ...allAlternativeBoards.map((a) => ({
                id: a.id,
                name: a.name,
                brand: a.brand,
                typeLabel: 'Alternativa',
                msrp: a.priceRange,
                soc: a.soc,
                ram: a.maxRam,
                description: a.summary,
                image: a.image,
                isCustom: Boolean(a.isCustom),
                isBuiltinOverride: Boolean(a.isCustom && ALTERNATIVE_BOARDS.some((x) => x.id === a.id))
              }))
            ]
              .filter(
                (item) =>
                  !searchTerm.trim() ||
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.soc.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((board) => (
                <div
                  key={board.id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-zinc-950 border-b border-zinc-800">
                      <img src={board.image} alt={board.name} className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/75 text-[10px] font-bold text-[#e31b5d] border border-[#e31b5d]/40 uppercase">
                        {board.typeLabel}
                      </span>
                      {board.isCustom && (
                        <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-[10px] font-bold text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                          {board.isBuiltinOverride ? 'Editada' : 'Personalizada'}
                        </span>
                      )}
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-black/75 text-[10px] font-mono text-zinc-300 border border-zinc-700">
                        {board.msrp}
                      </span>
                    </div>
                    <div className="p-5 space-y-2">
                      <div className="text-[11px] uppercase font-semibold text-zinc-400">{board.brand}</div>
                      <h4 className="text-lg font-bold text-white">{board.name}</h4>
                      <p className="text-xs text-zinc-400 line-clamp-2">{board.description}</p>
                      <div className="text-[11px] font-mono text-zinc-300 pt-1">
                        {board.soc} · {board.ram}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3.5 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-zinc-500">
                      {board.isCustom ? 'Guardada no site' : 'Catálogo Base'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openEditAnyBoard(board.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-[#e31b5d] text-zinc-200 hover:text-white text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                        title="Editar placa"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      {board.isCustom && (
                        <button
                          onClick={() =>
                            setConfirmDelete({
                              type: 'board',
                              id: board.id,
                              name: board.name,
                              isOverride: board.isBuiltinOverride
                            })
                          }
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 cursor-pointer"
                          title={board.isBuiltinOverride ? 'Repor versão original' : 'Remover placa'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SUB-TAB 2: ACCESSORIES DATABASE */}
      {/* ================================================================ */}
      {subTab === 'accessories' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Base de Acessórios & Módulos</h3>
              <p className="text-xs text-zinc-400">
                Os acessórios com consumo superior a 0W ficam disponíveis automaticamente na Calculadora de Energia.
              </p>
            </div>
            <button
              onClick={openNewAccessoryForm}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Acessório / HAT</span>
            </button>
          </div>

          {showAccessoryForm && (
            <form
              onSubmit={handleAccessorySubmit}
              className="bg-zinc-900/80 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h4 className="text-lg font-bold text-white">
                  {editingAccessoryId ? `Editar Acessório: ${accForm.name}` : 'Adicionar Novo Acessório'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setShowAccessoryForm(false);
                    setEditingAccessoryId(undefined);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                <div className="lg:col-span-4 space-y-3">
                  <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
                    <img
                      src={resolveImageSrc(accForm.image, accForm.imageId, dbImagesCompat)}
                      alt="Pré-visualização do acessório"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerTarget('accessory')}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold flex items-center justify-center space-x-2 border border-zinc-700 cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Escolher / Carregar Imagem</span>
                  </button>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-zinc-400 block mb-1">Nome do Acessório *</label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={accForm.name}
                      onChange={(e) => setAccForm({ ...accForm, name: e.target.value })}
                      placeholder="Ex: AI HAT+ 26 TOPS (Hailo-8)"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Categoria *</label>
                    <select
                      value={accForm.category}
                      onChange={(e) =>
                        setAccForm({ ...accForm, category: e.target.value as NewAccessoryInput['category'] })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    >
                      <option value="hat">Placa HAT / Expansão</option>
                      <option value="power">Alimentação / Fonte</option>
                      <option value="cooling">Refrigeração / Case</option>
                      <option value="storage">Armazenamento (NVMe / SD)</option>
                      <option value="camera">Câmera / Visão</option>
                      <option value="display">Display / Touchscreen</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Preço Estimado (MSRP) *</label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      value={accForm.msrp}
                      onChange={(e) => setAccForm({ ...accForm, msrp: e.target.value })}
                      placeholder="Ex: $70"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Consumo Elétrico (Watts)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      value={accForm.powerDrawWatts}
                      onChange={(e) => setAccForm({ ...accForm, powerDrawWatts: Number(e.target.value) })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1">Compatibilidade (separada por vírgula)</label>
                    <input
                      type="text"
                      value={compatText}
                      onChange={(e) => setCompatText(e.target.value)}
                      placeholder="Raspberry Pi 5, Compute Module 5"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1">Especificações Técnicas *</label>
                    <input
                      type="text"
                      required
                      maxLength={400}
                      value={accForm.specs}
                      onChange={(e) => setAccForm({ ...accForm, specs: e.target.value })}
                      placeholder="Ex: Acelerador neural Hailo-8 via barramento PCIe Gen 3"
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1">Descrição *</label>
                    <textarea
                      required
                      rows={2}
                      maxLength={1000}
                      value={accForm.description}
                      onChange={(e) => setAccForm({ ...accForm, description: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1">Por que é recomendado? *</label>
                    <textarea
                      required
                      rows={2}
                      maxLength={600}
                      value={accForm.whyNeeded}
                      onChange={(e) => setAccForm({ ...accForm, whyNeeded: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccessoryForm(false);
                    setEditingAccessoryId(undefined);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs cursor-pointer"
                >
                  {saving ? 'A guardar...' : editingAccessoryId ? 'Guardar Alterações' : 'Adicionar Acessório'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAccessories
              .filter(
                (a) =>
                  !searchTerm.trim() ||
                  a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.specs.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((acc) => {
                const isBuiltinOverride = Boolean(acc.isCustom && ACCESSORIES_LIST.some((x) => x.id === acc.id));
                return (
                  <div
                    key={acc.id}
                    className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/9] bg-zinc-950 border-b border-zinc-800 relative">
                        <img src={acc.image} alt={acc.name} className="w-full h-full object-cover" />
                        {acc.isCustom && (
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold backdrop-blur-md">
                            {isBuiltinOverride ? 'Editado' : 'Personalizado'}
                          </span>
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-amber-400 text-xs font-bold">
                          {acc.msrp}
                        </span>
                      </div>
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-400">
                          <span>{acc.category}</span>
                          <span className="font-mono text-amber-400">{acc.powerDrawWatts}W</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{acc.name}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-2">{acc.description}</p>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500">
                        {acc.isCustom ? 'Guardado no site' : 'Catálogo Base'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditAnyAccessory(acc.id)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 text-zinc-200 hover:text-black text-xs font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        {acc.isCustom && (
                          <button
                            onClick={() =>
                              setConfirmDelete({
                                type: 'accessory',
                                id: acc.id,
                                name: acc.name,
                                isOverride: isBuiltinOverride
                              })
                            }
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 cursor-pointer"
                            title={isBuiltinOverride ? 'Repor versão original' : 'Remover acessório'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SUB-TAB 3: IMAGES DATABASE */}
      {/* ================================================================ */}
      {subTab === 'images' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Banco de Imagens de Hardware</h3>
              <p className="text-xs text-zinc-400">
                Carregue fotografias ou guarde links HTTPS diretamente no site para reutilizar em qualquer placa ou acessório.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingImageId(undefined);
                setImgTitle('');
                setImgUrl('');
                setImgAlt('');
                setImgUploadPreview('');
                setShowImageForm(!showImageForm);
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Imagem ao Banco</span>
            </button>
          </div>

          {showImageForm && (
            <form
              onSubmit={handleImageSubmit}
              className="bg-zinc-900/80 border border-cyan-500/40 rounded-3xl p-6 space-y-5 text-xs"
            >
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h4 className="text-base font-bold text-white">
                  {editingImageId ? 'Editar Imagem do Banco' : 'Nova Imagem no Banco de Dados'}
                </h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImgMode('upload')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 cursor-pointer ${
                      imgMode === 'upload' ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Ficheiro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgMode('url')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 cursor-pointer ${
                      imgMode === 'url' ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Link HTTPS</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-400 block mb-1">Título da Imagem *</label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={imgTitle}
                    onChange={(e) => setImgTitle(e.target.value)}
                    placeholder="Ex: Raspberry Pi 500 Vista Superior"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Categoria *</label>
                  <select
                    value={imgCategory}
                    onChange={(e) => setImgCategory(e.target.value as LocalImageAsset['category'])}
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                  >
                    <option value="board">Placa / SBC</option>
                    <option value="accessory">Acessório / HAT</option>
                    <option value="pinout">Diagrama / Pinout</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                {imgMode === 'upload' ? (
                  <div className="md:col-span-2 space-y-3">
                    <label className="block border-2 border-dashed border-zinc-700 hover:border-cyan-400 rounded-2xl p-6 text-center cursor-pointer bg-zinc-950/60">
                      <Upload className="w-6 h-6 text-cyan-400 mx-auto mb-1.5" />
                      <span className="font-semibold text-white block">Selecionar ficheiro de imagem</span>
                      <span className="text-[11px] text-zinc-400">Otimização automática em WebP</span>
                      <input type="file" accept="image/*" onChange={handleImageFileSelect} className="hidden" />
                    </label>
                    {imgUploadPreview && (
                      <div className="w-64 aspect-[16/10] rounded-xl overflow-hidden border border-zinc-700">
                        <img src={imgUploadPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="text-zinc-400 block mb-1">URL da Imagem (HTTPS) *</label>
                    <input
                      type="url"
                      required
                      value={imgUrl}
                      onChange={(e) => setImgUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="text-zinc-400 block mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={imgTagsText}
                    onChange={(e) => setImgTagsText(e.target.value)}
                    placeholder="raspberry, sbc, nvme"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Texto Alternativo (Alt)</label>
                  <input
                    type="text"
                    maxLength={200}
                    value={imgAlt}
                    onChange={(e) => setImgAlt(e.target.value)}
                    placeholder="Descrição curta da fotografia"
                    className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowImageForm(false);
                    setEditingImageId(undefined);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold cursor-pointer"
                >
                  {saving ? 'A guardar...' : editingImageId ? 'Guardar Alterações' : 'Guardar Imagem'}
                </button>
              </div>
            </form>
          )}

          {/* Local Database Images */}
          {filteredDbImages.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-cyan-400">
                Imagens Guardadas no Site ({filteredDbImages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredDbImages.map((img) => (
                  <div
                    key={img.id}
                    className="bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] bg-zinc-950 overflow-hidden">
                        <img
                          src={resolveImageSrc(img.url, undefined, dbImagesCompat)}
                          alt={img.altText || img.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-bold text-white truncate">{img.title}</p>
                        <div className="flex flex-wrap gap-1">
                          {img.tags.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-300 font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-2 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 uppercase">{img.sourceType}</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => openEditImage(img)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-cyan-500 text-zinc-200 hover:text-black cursor-pointer"
                          title="Editar imagem"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ type: 'image', id: img.id, name: img.title })}
                          className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 cursor-pointer"
                          title="Apagar imagem"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Built-in Studio Presets Gallery */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-zinc-400">
              Biblioteca de Estúdio Incluída ({BUILTIN_IMAGE_PRESETS.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {BUILTIN_IMAGE_PRESETS.filter(
                (p) =>
                  !searchTerm.trim() ||
                  p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.tags.some((t) => t.includes(searchTerm.toLowerCase()))
              ).map((preset) => (
                <div
                  key={preset.key}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-zinc-950">
                    <img src={preset.src} alt={preset.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-semibold text-zinc-200 truncate">{preset.title}</p>
                    <p className="text-[10px] font-mono text-zinc-500 truncate">{preset.key}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        currentImage={pickerTarget === 'accessory' ? accForm.image : boardForm.image}
        currentImageId={pickerTarget === 'accessory' ? accForm.imageId : boardForm.imageId}
        onSelect={({ image, imageId }) => {
          if (pickerTarget === 'board') {
            setBoardForm((prev) => ({ ...prev, image, imageId }));
          } else if (pickerTarget === 'accessory') {
            setAccForm((prev) => ({ ...prev, image, imageId }));
          }
        }}
      />

      {/* Delete / Reset Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="max-w-md w-full bg-[#0d131f] border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-bold text-white">
              {confirmDelete.isOverride ? 'Repor Versão Original' : 'Confirmar Remoção'}
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {confirmDelete.type === 'reset_all'
                ? 'Tem a certeza que pretende limpar todas as placas, acessórios e imagens personalizadas guardadas neste navegador e repor o catálogo original?'
                : confirmDelete.isOverride
                ? `Pretende descartar as edições feitas em "${confirmDelete.name}" e restaurar a ficha original?`
                : `Tem a certeza que pretende remover permanentemente "${confirmDelete.name}" da base de dados local?`}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                {saving ? 'A processar...' : confirmDelete.isOverride ? 'Repor Original' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
