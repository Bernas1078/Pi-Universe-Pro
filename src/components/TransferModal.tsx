import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Share2, Globe, Printer, HardDrive, Laptop } from 'lucide-react';
import { BOARD_MODELS } from '../data/models';
import { ALTERNATIVE_BOARDS } from '../data/alternatives';
import { GPIO_PINS } from '../data/gpio';
import { ACCESSORIES_LIST } from '../data/accessories';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedScp, setCopiedScp] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyScp = () => {
    const cmd = `scp -r ./pi-universe-pro pi@raspberrypi.local:/home/pi/projects/`;
    navigator.clipboard.writeText(cmd);
    setCopiedScp(true);
    setTimeout(() => setCopiedScp(false), 2000);
  };

  const handleCopyCurl = () => {
    const cmd = `curl -sL "${currentUrl}" -o pi_universe.html && python3 -m http.server 8080`;
    navigator.clipboard.writeText(cmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyGit = () => {
    const cmd = `git remote add origin <seu-repositorio-github>\ngit branch -M main\ngit push -u origin main`;
    navigator.clipboard.writeText(cmd);
    setCopiedGit(true);
    setTimeout(() => setCopiedGit(false), 2000);
  };

  // Export full JSON database
  const handleExportJson = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      models: BOARD_MODELS,
      alternatives: ALTERNATIVE_BOARDS,
      pinout: GPIO_PINS,
      accessories: ACCESSORIES_LIST
    };
    const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pi_universe_complete_specs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print friendly view for Pinout cheat sheet
  const handlePrintPinout = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-3xl bg-[#0d131f] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl my-8 text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-900/80 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950">
          <span className="text-xs font-bold uppercase tracking-wider text-[#e31b5d]">Opções de Compartilhamento & Exportação</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Como você deseja transferir?
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">
            Transfira a aplicação, acesse de outro dispositivo ou copie comandos prontos para sua placa Raspberry Pi.
          </p>
        </div>

        {/* Modal Options Grid */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Method 1: Direct Web Link */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2.5">
              <Globe className="w-5 h-5 text-[#e31b5d]" />
              <h3 className="text-base font-bold text-white">1. Acessar ou Compartilhar via Link Web Direto</h3>
            </div>
            <p className="text-xs text-zinc-300">
              A aplicação já está online e hospedada na nuvem. Você pode abrir este link no navegador do seu Raspberry Pi, celular, tablet ou computador:
            </p>

            <div className="flex items-center space-x-2 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full bg-transparent text-xs text-zinc-200 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-[#e31b5d] hover:bg-[#c5124b] text-white text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Method 2: Transfer via Terminal to Raspberry Pi (SSH / SCP) */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2.5">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white">2. Transferir para o Raspberry Pi via Terminal (SSH / SCP)</h3>
            </div>
            <p className="text-xs text-zinc-300">
              Se você possui uma Raspberry Pi na sua rede local conectada via Wi-Fi ou cabo Ethernet:
            </p>

            {/* SCP Command */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-zinc-400 block font-semibold">Comando SCP para enviar arquivos do seu PC para o Pi:</span>
              <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono text-xs text-cyan-300">
                <span className="truncate mr-2">scp -r ./pi-universe-pro pi@raspberrypi.local:/home/pi/projects/</span>
                <button
                  onClick={handleCopyScp}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  {copiedScp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScp ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Quick Curl & Run on Pi */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-zinc-400 block font-semibold">Rodar servidor local na porta 8080 do Raspberry Pi:</span>
              <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800 font-mono text-xs text-emerald-300">
                <span className="truncate mr-2">python3 -m http.server 8080</span>
                <button
                  onClick={handleCopyCurl}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center space-x-1 shrink-0 cursor-pointer"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Method 3: Export complete database JSON */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2.5">
              <Download className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">3. Baixar Banco de Dados Completo (JSON)</h3>
            </div>
            <p className="text-xs text-zinc-300">
              Exporte todos os dados estruturados de especificações técnicas das 12 placas Raspberry Pi, 7 alternativas de mercado, todos os 40 pinos GPIO e catálogo de acessórios:
            </p>
            <button
              onClick={handleExportJson}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo JSON (pi_universe_complete_specs.json)</span>
            </button>
          </div>

          {/* Method 4: Imprimir Pinout em PDF */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2.5">
              <Printer className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">4. Imprimir ou Salvar Guia de Pinout em PDF</h3>
            </div>
            <p className="text-xs text-zinc-300">
              Gere um documento para imprimir ou colar na sua bancada de eletrônica de laboratório ao lado da sua placa Raspberry Pi:
            </p>
            <button
              onClick={handlePrintPinout}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center space-x-2 transition-all cursor-pointer border border-zinc-700"
            >
              <Printer className="w-4 h-4" />
              <span>Abrir Janela de Impressão / Salvar PDF</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-zinc-950 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
