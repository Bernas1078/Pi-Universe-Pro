import React from 'react';
import { X, Cpu, HardDrive, Wifi, Monitor, Zap, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { BoardModel } from '../data/models';

interface ModelDetailModalProps {
  model: BoardModel | null;
  onClose: () => void;
  onCompare: (model: BoardModel) => void;
  onViewPinout: () => void;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({
  model,
  onClose,
  onCompare,
  onViewPinout
}) => {
  if (!model) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#0d131f] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-8 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & Image Banner */}
        <div className="relative aspect-[16/9] max-h-80 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800">
          <img
            src={model.image}
            alt={model.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-[#0d131f]/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${model.badgeColor}`}>
              {model.badge}
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2 tracking-tight">{model.name}</h2>
            <p className="text-zinc-300 text-sm mt-1 max-w-2xl">{model.description}</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Quick info row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 block">Lançamento</span>
              <strong className="text-zinc-100 font-semibold">{model.releaseDate}</strong>
            </div>
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 block">Preço Sugerido (MSRP)</span>
              <strong className="text-[#e31b5d] font-bold">{model.msrp}</strong>
            </div>
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 block">Status de Mercado</span>
              <strong className="text-emerald-400 font-semibold">{model.status}</strong>
            </div>
            <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              <span className="text-zinc-400 block">Índice Desempenho</span>
              <strong className="text-cyan-400 font-bold">{model.benchmarkScore} / 100</strong>
            </div>
          </div>

          {/* Detailed specs grid */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#e31b5d]" />
              <span>Especificações Técnicas Oficiais</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 space-y-1">
                <span className="text-zinc-400 font-medium flex items-center">
                  <Cpu className="w-3.5 h-3.5 text-[#e31b5d] mr-1.5" /> Processador SoC & CPU
                </span>
                <p className="text-zinc-200 font-semibold">{model.cpu}</p>
                <p className="text-[11px] text-zinc-400 font-mono">SoC: {model.soc}</p>
              </div>

              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 space-y-1">
                <span className="text-zinc-400 font-medium flex items-center">
                  <Zap className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> Memória RAM
                </span>
                <p className="text-zinc-200 font-semibold">{model.ram}</p>
                <p className="text-[11px] text-zinc-400">GPU: {model.gpu}</p>
              </div>

              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 space-y-1">
                <span className="text-zinc-400 font-medium flex items-center">
                  <Monitor className="w-3.5 h-3.5 text-blue-400 mr-1.5" /> Saídas de Vídeo & Áudio
                </span>
                <p className="text-zinc-200 font-semibold">{model.videoOut}</p>
                <p className="text-[11px] text-zinc-400">Áudio: {model.audio}</p>
              </div>

              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 space-y-1">
                <span className="text-zinc-400 font-medium flex items-center">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Rede & Conectividade
                </span>
                <p className="text-zinc-200 font-semibold">{model.networking}</p>
                <p className="text-[11px] text-zinc-400">USB: {model.usb}</p>
              </div>

              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 space-y-1">
                <span className="text-zinc-400 font-medium flex items-center">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400 mr-1.5" /> Armazenamento & PCIe
                </span>
                <p className="text-zinc-200 font-semibold">{model.storage}</p>
                <p className="text-[11px] text-zinc-400">PCI Express: {model.pcie}</p>
              </div>

              <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/80 space-y-1">
                <span className="text-zinc-400 font-medium flex items-center">
                  <Zap className="w-3.5 h-3.5 text-pink-400 mr-1.5" /> Requisitos de Alimentação
                </span>
                <p className="text-zinc-200 font-semibold">{model.power}</p>
                <p className="text-[11px] text-zinc-400">Dimensões físicas: {model.dimensions}</p>
              </div>
            </div>
          </div>

          {/* Key Differentiators */}
          <div>
            <h3 className="text-base font-bold text-white mb-3">Recursos Notáveis & Vantagens</h3>
            <div className="space-y-2">
              {model.keyFeatures.map((feat, index) => (
                <div key={index} className="flex items-start space-x-2 text-xs text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-[#e31b5d] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Recommended OS notice */}
          <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl flex items-start space-x-3 text-xs text-zinc-400">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-200 block">Sistemas Operacionais Recomendados:</strong>
              <p className="mt-0.5">
                Raspberry Pi OS (Bookworm 64-bit com Wayland), Ubuntu Desktop/Server 24.04 LTS, DietPi (para servidores ultra-leves), LibreELEC (Home Theater Kodi), RetroPie (emulação de jogos) e Home Assistant OS.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex flex-wrap gap-3 justify-end items-center">
          <button
            onClick={() => {
              onViewPinout();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors flex items-center space-x-1.5"
          >
            <span>Ver Pinout GPIO de 40 Pinos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              onCompare(model);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#e31b5d] hover:bg-[#c5124b] text-white shadow-lg shadow-[#e31b5d]/30 transition-all flex items-center space-x-1.5"
          >
            <span>Comparar este Modelo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
