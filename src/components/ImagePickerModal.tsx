import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload, Link as LinkIcon, Check, Sparkles } from 'lucide-react';
import {
  BUILTIN_IMAGE_PRESETS,
  compressImageFile,
  resolveImageSrc
} from '../data/imagePresets';
import { LocalImageAsset, useCatalog } from '../context/CatalogContext';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage: string;
  currentImageId?: string;
  onSelect: (result: { image: string; imageId: string }) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  currentImage,
  currentImageId,
  onSelect
}) => {
  const { dbImages, saveImageAsset } = useCatalog();
  const [tab, setTab] = useState<'database' | 'presets' | 'url' | 'upload'>('database');
  const [urlInput, setUrlInput] = useState(currentImage.startsWith('http') ? currentImage : '');
  const [urlTitle, setUrlTitle] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageFile(file);
      setUploadPreview(compressed);
      if (!uploadTitle.trim()) {
        setUploadTitle(file.name.replace(/\.[^.]+$/, '').slice(0, 80));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar imagem.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveUploadAndSelect = async () => {
    setError('');
    if (!uploadPreview) {
      setError('Selecione primeiro um ficheiro de imagem.');
      return;
    }
    const title = uploadTitle.trim() || 'Imagem de Hardware';
    setBusy(true);
    try {
      const newId = await saveImageAsset({
        title: title.slice(0, 120),
        category: 'board',
        sourceType: 'compressed',
        url: uploadPreview,
        altText: title.slice(0, 200),
        tags: ['upload', 'hardware']
      });
      onSelect({ image: `imageRef:${newId}`, imageId: newId });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível guardar a imagem.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveUrlAndSelect = async (saveToGallery: boolean) => {
    setError('');
    const trimmed = urlInput.trim();
    if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
      setError('O URL da imagem deve começar por https:// ou http://');
      return;
    }

    if (saveToGallery) {
      setBusy(true);
      try {
        const title = urlTitle.trim() || 'Foto Externa de Hardware';
        const newId = await saveImageAsset({
          title: title.slice(0, 120),
          category: 'board',
          sourceType: 'url',
          url: trimmed,
          altText: title.slice(0, 200),
          tags: ['url', 'externo']
        });
        onSelect({ image: `imageRef:${newId}`, imageId: newId });
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao guardar URL na galeria.');
      } finally {
        setBusy(false);
      }
    } else {
      onSelect({ image: trimmed, imageId: '' });
      onClose();
    }
  };

  const renderDbImagePreview = (img: LocalImageAsset) =>
    resolveImageSrc(
      img.url,
      undefined,
      dbImages.map((i) => ({ ...i, ownerId: 'local', ownerName: 'Local', isPublic: true }))
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[#0d131f] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#e31b5d]/15 text-[#e31b5d] flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Selecionar Imagem do Banco</h3>
              <p className="text-xs text-zinc-400">
                Escolha uma foto da base de dados local, dos estúdios incluídos, por URL ou carregue do computador.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 flex flex-wrap gap-2 border-b border-zinc-800 pb-4 text-xs">
          {[
            { id: 'database', label: `Banco de Imagens (${dbImages.length})` },
            { id: 'presets', label: `Fotos de Estúdio (${BUILTIN_IMAGE_PRESETS.length})` },
            { id: 'upload', label: 'Carregar Ficheiro' },
            { id: 'url', label: 'Colar URL (HTTPS)' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id as typeof tab);
                setError('');
              }}
              className={`px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer ${
                tab === t.id
                  ? 'bg-[#e31b5d] text-white'
                  : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {tab === 'database' && (
            <>
              {dbImages.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                  <ImageIcon className="w-10 h-10 text-zinc-600 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-300">
                    Ainda não existem imagens personalizadas na base de dados.
                  </p>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Use os separadores acima para carregar um ficheiro do computador, guardar um URL ou escolher uma das 20 fotos de estúdio incluídas.
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => setTab('upload')}
                      className="px-4 py-2 rounded-xl bg-[#e31b5d] text-white text-xs font-semibold cursor-pointer"
                    >
                      Carregar Imagem
                    </button>
                    <button
                      onClick={() => setTab('presets')}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer"
                    >
                      Ver Fotos de Estúdio
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {dbImages.map((img) => {
                    const selected = currentImageId === img.id || currentImage === `imageRef:${img.id}`;
                    return (
                      <button
                        key={img.id}
                        onClick={() => {
                          onSelect({ image: `imageRef:${img.id}`, imageId: img.id });
                          onClose();
                        }}
                        className={`group text-left rounded-2xl overflow-hidden border transition-all bg-zinc-950 cursor-pointer ${
                          selected
                            ? 'border-[#e31b5d] ring-2 ring-[#e31b5d]/30'
                            : 'border-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                          <img
                            src={renderDbImagePreview(img)}
                            alt={img.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          {selected && (
                            <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#e31b5d] text-white flex items-center justify-center">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-white truncate">{img.title}</p>
                          <p className="text-[10px] text-zinc-400 uppercase mt-0.5">{img.category}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'presets' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {BUILTIN_IMAGE_PRESETS.map((preset) => {
                const selected = !currentImageId && currentImage === preset.key;
                return (
                  <button
                    key={preset.key}
                    onClick={() => {
                      onSelect({ image: preset.key, imageId: '' });
                      onClose();
                    }}
                    className={`group text-left rounded-2xl overflow-hidden border transition-all bg-zinc-950 cursor-pointer ${
                      selected
                        ? 'border-[#e31b5d] ring-2 ring-[#e31b5d]/30'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="relative aspect-[16/10] bg-zinc-900 overflow-hidden">
                      <img
                        src={preset.src}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {selected && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#e31b5d] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-white truncate">{preset.title}</p>
                      <p className="text-[10px] text-zinc-400 uppercase mt-0.5">Estúdio</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <label className="block border-2 border-dashed border-zinc-700 hover:border-[#e31b5d] rounded-2xl p-8 text-center cursor-pointer bg-zinc-950/60 transition-colors">
                <Upload className="w-8 h-8 text-[#e31b5d] mx-auto mb-2" />
                <span className="text-sm font-semibold text-white block">
                  Clique para escolher uma imagem (JPG, PNG, WebP)
                </span>
                <span className="text-xs text-zinc-400 block mt-1">
                  A imagem é guardada diretamente na base de dados local do site para reutilização.
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {uploadPreview && (
                <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img src={uploadPreview} alt="Pré-visualização" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Título da imagem no banco:</label>
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      maxLength={120}
                      placeholder="Ex: Banana Pi BPI-M7 Foto Topo"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#e31b5d]"
                    />
                  </div>
                  <button
                    onClick={handleSaveUploadAndSelect}
                    disabled={busy}
                    className="w-full py-2.5 rounded-xl bg-[#e31b5d] hover:bg-[#c5124b] disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {busy ? 'A guardar no Banco de Imagens...' : 'Guardar no Banco e Usar Imagem'}
                  </button>
                </div>
              )}
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <LinkIcon className="w-3.5 h-3.5 text-[#e31b5d]" />
                  <span>Endereço da imagem (HTTPS)</span>
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/minha-placa.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#e31b5d]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Título (opcional, para guardar na Galeria do Banco)
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  maxLength={120}
                  placeholder="Ex: Raspberry Pi 500 Foto Oficial"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white focus:outline-none focus:border-[#e31b5d]"
                />
              </div>

              {urlInput.startsWith('http') && (
                <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
                  <img
                    src={urlInput}
                    alt="Pré-visualização do URL"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => handleSaveUrlAndSelect(true)}
                  disabled={busy}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#e31b5d] hover:bg-[#c5124b] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{busy ? 'A guardar...' : 'Guardar no Banco e Usar'}</span>
                </button>
                <button
                  onClick={() => handleSaveUrlAndSelect(false)}
                  disabled={busy}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
                >
                  Usar URL Diretamente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
