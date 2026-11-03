import React, { useState } from 'react';
import { ArrowLeftRight, Check, Sparkles } from 'lucide-react';
import { BOARD_MODELS, BoardModel } from '../data/models';
import { ALTERNATIVE_BOARDS } from '../data/alternatives';

interface ComparisonToolProps {
  initialBoardA?: string;
  initialBoardB?: string;
}

export const ComparisonTool: React.FC<ComparisonToolProps> = ({
  initialBoardA = 'pi5',
  initialBoardB = 'pi4b'
}) => {
  const [boardIdA, setBoardIdA] = useState(initialBoardA);
  const [boardIdB, setBoardIdB] = useState(initialBoardB);

  // Combine standard models + alternative boards into unified list
  const allAvailableBoards = [
    ...BOARD_MODELS.map((b) => ({
      id: b.id,
      name: b.name,
      soc: b.soc,
      cpu: b.cpu,
      ram: b.ram,
      storage: b.storage,
      video: b.videoOut,
      usb: b.usb,
      pcie: b.pcie,
      networking: b.networking,
      power: b.power,
      msrp: b.msrp,
      score: b.benchmarkScore,
      image: b.image,
      badge: b.badge
    })),
    ...ALTERNATIVE_BOARDS.map((alt) => ({
      id: alt.id,
      name: alt.name,
      soc: alt.soc,
      cpu: alt.cpu,
      ram: alt.maxRam,
      storage: alt.storage,
      video: alt.displayOut,
      usb: 'USB 3.0 / USB-C DP',
      pcie: 'M.2 M-Key NVMe Gen 3 x4',
      networking: alt.networking,
      power: '5V / 4A DC Type-C',
      msrp: alt.priceRange,
      score: alt.hardwarePowerRating * 20,
      image: alt.image,
      badge: alt.badge
    }))
  ];

  const boardA = allAvailableBoards.find((b) => b.id === boardIdA) || allAvailableBoards[0];
  const boardB = allAvailableBoards.find((b) => b.id === boardIdB) || allAvailableBoards[1];

  const rows = [
    { label: 'Processador (SoC)', a: boardA.soc, b: boardB.soc },
    { label: 'CPU & Arquitetura', a: boardA.cpu, b: boardB.cpu },
    { label: 'Memória RAM Suportada', a: boardA.ram, b: boardB.ram },
    { label: 'Armazenamento & Boot', a: boardA.storage, b: boardB.storage },
    { label: 'Conexão PCIe / NVMe', a: boardA.pcie, b: boardB.pcie },
    { label: 'Saídas de Vídeo', a: boardA.video, b: boardB.video },
    { label: 'Portas USB', a: boardA.usb, b: boardB.usb },
    { label: 'Rede & Conectividade', a: boardA.networking, b: boardB.networking },
    { label: 'Alimentação Recomendada', a: boardA.power, b: boardB.power },
    { label: 'Preço Estimado', a: boardA.msrp, b: boardB.msrp },
    { label: 'Índice de Potência', a: `${boardA.score} / 100`, b: `${boardB.score} / 100` }
  ];

  const setPreset = (idA: string, idB: string) => {
    setBoardIdA(idA);
    setBoardIdB(idB);
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e31b5d]/10 text-[#e31b5d] border border-[#e31b5d]/20">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Comparativo Lado a Lado</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Comparador de <span className="text-[#e31b5d]">Especificações</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Analise diretamente as diferenças entre modelos oficiais da Raspberry Pi e seus maiores concorrentes de mercado.
        </p>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="text-zinc-400 mr-2">Comparações populares:</span>
        <button
          onClick={() => setPreset('pi5', 'nvidiajetson')}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-emerald-400 transition-all font-medium"
        >
          Pi 5 vs Jetson Orin Nano
        </button>
        <button
          onClick={() => setPreset('pi5', 'orangepi5plus')}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-[#e31b5d] transition-all"
        >
          Pi 5 vs Orange Pi 5 Plus
        </button>
        <button
          onClick={() => setPreset('pi5', 'khadasvim4')}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-pink-400 transition-all"
        >
          Pi 5 vs Khadas VIM4
        </button>
        <button
          onClick={() => setPreset('pi4b', 'odroidn2plus')}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-blue-400 transition-all"
        >
          Pi 4B vs ODROID-N2+
        </button>
        <button
          onClick={() => setPreset('pi4b', 'milkvmars')}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-red-400 transition-all"
        >
          Pi 4B vs Milk-V Mars (RISC-V)
        </button>
        <button
          onClick={() => setPreset('orangepi5plus', 'radxarock5b')}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-cyan-400 transition-all"
        >
          Orange Pi 5 vs Radxa Rock 5B
        </button>
      </div>

      {/* Comparison Board Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Board A Select */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#e31b5d]">Placa de Referência A</span>
            <select
              value={boardIdA}
              onChange={(e) => setBoardIdA(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e31b5d]"
            >
              {allAvailableBoards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-24 h-16 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
              <img src={boardA.image} alt={boardA.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{boardA.name}</h3>
              <p className="text-xs text-zinc-400 font-mono">{boardA.badge}</p>
            </div>
          </div>
        </div>

        {/* Board B Select */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-cyan-400">Placa de Referência B</span>
            <select
              value={boardIdB}
              onChange={(e) => setBoardIdB(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {allAvailableBoards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-24 h-16 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800">
              <img src={boardB.image} alt={boardB.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{boardB.name}</h3>
              <p className="text-xs text-zinc-400 font-mono">{boardB.badge}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Detailed Table */}
      <div className="overflow-x-auto bg-zinc-900/60 border border-zinc-800 rounded-2xl">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400">
              <th className="py-4 px-6 w-1/4 font-semibold">Parâmetro Técnico</th>
              <th className="py-4 px-6 w-[37.5%] font-bold text-white">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#e31b5d]"></span>
                  <span>{boardA.name}</span>
                </div>
              </th>
              <th className="py-4 px-6 w-[37.5%] font-bold text-white">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  <span>{boardB.name}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                <td className="py-3.5 px-6 font-medium text-zinc-400 bg-zinc-950/30">{row.label}</td>
                <td className="py-3.5 px-6 text-zinc-200 leading-relaxed font-mono text-xs">{row.a}</td>
                <td className="py-3.5 px-6 text-zinc-200 leading-relaxed font-mono text-xs">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom Summary Insight */}
      <div className="p-5 bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#e31b5d]/20 text-[#e31b5d] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Qual escolher para seu projeto?</h4>
            <p className="text-xs text-zinc-400">
              Para maior suporte de comunidade, drivers estáveis e documentação: prefira <strong>Raspberry Pi</strong>. Para IA bruta, portas 2.5GbE e vídeo 8K: alternativas com <strong>Rockchip RK3588</strong> levam vantagem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
