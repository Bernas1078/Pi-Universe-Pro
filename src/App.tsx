import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Layers,
  Zap,
  Sliders,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  Wifi,
  Fan,
  Camera,
  Monitor,
  Flame,
  ArrowLeftRight
} from 'lucide-react';

// Data imports
import { BOARD_MODELS, BoardModel } from './data/models';
import { ALTERNATIVE_BOARDS, AlternativeBoard } from './data/alternatives';
import { ACCESSORIES_LIST, AccessoryItem } from './data/accessories';

// Components
import { Navbar, NavTab } from './components/Navbar';
import { ModelDetailModal } from './components/ModelDetailModal';
import { PinoutSection } from './components/PinoutSection';
import { ComparisonTool } from './components/ComparisonTool';
import { PowerCalculator } from './components/PowerCalculator';

// Images
import pi5Img from './assets/images/raspberry_pi_5_board_1793723065529.jpg';
import gearImg from './assets/images/pi_accessories_gear_1793723069164.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedModelForModal, setSelectedModelForModal] = useState<BoardModel | null>(null);

  // Model filter state
  const [modelCategory, setModelCategory] = useState<'all' | 'sbc' | 'zero' | 'mcu' | 'keyboard' | 'compute'>('all');
  const [modelSearch, setModelSearch] = useState('');

  // Accessory category filter state
  const [accessoryCategory, setAccessoryCategory] = useState<string>('all');

  // Comparison boards preselect state
  const [compareA, setCompareA] = useState<string>('pi5');
  const [compareB, setCompareB] = useState<string>('pi4b');

  // Filtered models
  const filteredModels = useMemo(() => {
    return BOARD_MODELS.filter((m) => {
      if (modelCategory !== 'all' && m.category !== modelCategory) return false;
      if (modelSearch.trim()) {
        const q = modelSearch.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesSoc = m.soc.toLowerCase().includes(q);
        const matchesCpu = m.cpu.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        return matchesName || matchesSoc || matchesCpu || matchesDesc;
      }
      return true;
    });
  }, [modelCategory, modelSearch]);

  // Filtered accessories
  const filteredAccessories = useMemo(() => {
    return ACCESSORIES_LIST.filter((acc) => {
      if (accessoryCategory === 'all') return true;
      return acc.category === accessoryCategory;
    });
  }, [accessoryCategory]);

  const handleStartCompare = (model: BoardModel) => {
    setCompareA(model.id);
    setCompareB(model.id === 'pi5' ? 'pi4b' : 'pi5');
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-zinc-100 flex flex-col font-sans selection:bg-[#e31b5d] selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* ========================================================= */}
        {/* TAB 1: INÍCIO (HOME) */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-16">
            {/* Hero Banner with Pi 5 Photography */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-[#0f1422] to-[#1f0a14] border border-zinc-800 p-6 sm:p-10 lg:p-12 glow-raspberry">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#e31b5d]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-7 space-y-6">
                  <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e31b5d]/20 text-[#e31b5d] border border-[#e31b5d]/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enciclopédia Completa de Hardware & Pinout</span>
                  </span>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                    Raspberry Pi & <span className="text-[#e31b5d]">Universo SBC</span>
                  </h1>

                  <p className="text-zinc-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl">
                    Especificações técnicas oficiais, diagramas interativos de pinout GPIO de 40 pinos, simulação de código, comparativo direto com alternativas de alto desempenho (Orange Pi, Radxa Rock) e calculadora de energia.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => setActiveTab('models')}
                      className="px-6 py-3 rounded-xl bg-[#e31b5d] hover:bg-[#c5124b] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#e31b5d]/30 transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <span>Ver Modelos & Specs</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTab('pinout')}
                      className="px-6 py-3 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 font-semibold text-xs sm:text-sm border border-zinc-700 transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-[#e31b5d]" />
                      <span>Explorar Pinout GPIO</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('compare')}
                      className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs sm:text-sm border border-zinc-800 transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-cyan-400" />
                      <span>Comparar Placas</span>
                    </button>
                  </div>
                </div>

                {/* Hero Product Photo Card */}
                <div className="lg:col-span-5">
                  <div
                    onClick={() => {
                      const pi5 = BOARD_MODELS.find((m) => m.id === 'pi5');
                      if (pi5) setSelectedModelForModal(pi5);
                    }}
                    className="relative group rounded-2xl overflow-hidden border border-zinc-700/80 bg-zinc-950 shadow-2xl cursor-pointer hover:border-[#e31b5d]/60 transition-all"
                  >
                    <img
                      src={pi5Img}
                      alt="Raspberry Pi 5 Board Studio Shot"
                      className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#e31b5d] tracking-wider">
                          Destaque de Silício
                        </span>
                        <h4 className="text-lg font-bold text-white">Raspberry Pi 5 (BCM2712)</h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#e31b5d] text-white text-[11px] font-bold">
                        Ver Placa
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                onClick={() => setActiveTab('models')}
                className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-2 cursor-pointer hover:border-[#e31b5d]/50 hover:bg-zinc-900/90 transition-all"
              >
                <div className="text-[#e31b5d] text-2xl font-bold">
                  <Cpu className="w-7 h-7" />
                </div>
                <div className="text-2xl font-bold text-white">12 Modelos & Módulos</div>
                <p className="text-zinc-400 text-xs">Do Raspberry Pi 1 ao Pi 5, Compute Modules e Pico 2 com fotos reais.</p>
              </div>

              <div
                onClick={() => setActiveTab('pinout')}
                className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-2 cursor-pointer hover:border-[#e31b5d]/50 hover:bg-zinc-900/90 transition-all"
              >
                <div className="text-[#e31b5d] text-2xl font-bold">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="text-2xl font-bold text-white">40 Pinos GPIO</div>
                <p className="text-zinc-400 text-xs">Diagrama visual do header com gerador automático de código Python.</p>
              </div>

              <div
                onClick={() => setActiveTab('alternatives')}
                className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-2 cursor-pointer hover:border-cyan-500/50 hover:bg-zinc-900/90 transition-all"
              >
                <div className="text-cyan-400 text-2xl font-bold">
                  <Zap className="w-7 h-7" />
                </div>
                <div className="text-2xl font-bold text-white">7 Concorrentes & IA</div>
                <p className="text-zinc-400 text-xs">NVIDIA Jetson (40 TOPS), Orange Pi, Radxa, Khadas VIM4, ODROID e RISC-V.</p>
              </div>

              <div
                onClick={() => setActiveTab('accessories')}
                className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-2 cursor-pointer hover:border-amber-500/50 hover:bg-zinc-900/90 transition-all"
              >
                <div className="text-amber-400 text-2xl font-bold">
                  <Sliders className="w-7 h-7" />
                </div>
                <div className="text-2xl font-bold text-white">Calculadora Watts</div>
                <p className="text-zinc-400 text-xs">Simulador de consumo elétrico para fontes USB-C PD e periféricos.</p>
              </div>
            </div>

            {/* Architecture Spotlight: Pi 5 Anatomy */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#e31b5d]">Arquitetura de Silício</span>
                  <h3 className="text-2xl font-extrabold text-white mt-1">
                    O que mudou no Raspberry Pi 5?
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('compare')}
                  className="text-xs text-[#e31b5d] hover:text-white flex items-center space-x-1 font-semibold"
                >
                  <span>Comparar Pi 5 vs Pi 4B</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#e31b5d]/20 text-[#e31b5d] flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h4 className="text-base font-bold text-white">Southbridge Proprietário RP1</h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Pela primeira vez, o Raspberry Pi transferiu a controladora de periféricos (USB 3.0, Ethernet, GPIO e MIPI) para um chip desenhado pela própria fundação, aliviando o SoC principal.
                  </p>
                </div>

                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h4 className="text-base font-bold text-white">Barramento PCI Express 2.0 x1</h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Conector FFC de alta velocidade que permite conectar placas HAT com SSDs NVMe M.2. Taxas de leitura que saltam de 45 MB/s no MicroSD para até 850 MB/s no SSD.
                  </p>
                </div>

                <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <h4 className="text-base font-bold text-white">Power Delivery de 27W (5V / 5A)</h4>
                  <p className="text-zinc-400 leading-relaxed">
                    Para garantir que portas USB e SSDs recebam corrente estável, a placa utiliza perfil USB-PD proprietário. A CPU de 2.4GHz também conta com conector dedicado para ventoinha PWM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: MODELOS & SPECS */}
        {/* ========================================================= */}
        {activeTab === 'models' && (
          <div className="space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e31b5d]/10 text-[#e31b5d] border border-[#e31b5d]/20">
                <Cpu className="w-3.5 h-3.5" />
                <span>Linha Completa Oficial</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Modelos & Especificações <span className="text-[#e31b5d]">Técnicas</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">
                Explore a linha oficial com fotografias reais em alta resolução, processadores Broadcom, memória RAM e conexões de cada geração.
              </p>
            </div>

            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-zinc-900/60 p-4 sm:p-5 rounded-2xl border border-zinc-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar modelo (ex: Pi 5, 4B, Pico, BCM2712)..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e31b5d]"
                />
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
                {[
                  { id: 'all', label: 'Todos os Modelos (12)' },
                  { id: 'sbc', label: 'Placas SBC (Pi 5, 4, 3, 1)' },
                  { id: 'compute', label: 'Compute Modules (CM4 / CM5)' },
                  { id: 'zero', label: 'Linha Zero (Zero 2 W / W)' },
                  { id: 'mcu', label: 'Microcontroladores (Pico / Pico 2)' },
                  { id: 'keyboard', label: 'Computador Teclado (400)' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setModelCategory(cat.id as any)}
                    className={`px-3.5 py-2 rounded-xl font-medium shrink-0 transition-all ${
                      modelCategory === cat.id
                        ? 'bg-[#e31b5d] text-white font-semibold shadow-sm shadow-[#e31b5d]/30'
                        : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModels.map((model) => (
                <div
                  key={model.id}
                  className="group bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden hover:border-[#e31b5d]/50 transition-all flex flex-col justify-between shadow-lg"
                >
                  <div>
                    {/* Card Image Banner */}
                    <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden border-b border-zinc-800">
                      <img
                        src={model.image}
                        alt={model.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${model.badgeColor}`}>
                          {model.badge}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-zinc-700/60">
                          {model.releaseDate}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{model.name}</h3>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {model.description}
                        </p>
                      </div>

                      {/* Key specs pills */}
                      <div className="space-y-2 text-xs">
                        <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                          <span className="text-zinc-400 flex items-center">
                            <Cpu className="w-3.5 h-3.5 text-[#e31b5d] mr-1.5" /> CPU:
                          </span>
                          <span className="text-zinc-200 font-semibold truncate ml-2 max-w-[190px]">
                            {model.cpu}
                          </span>
                        </div>

                        <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                          <span className="text-zinc-400 flex items-center">
                            <Zap className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> RAM:
                          </span>
                          <span className="text-zinc-200 font-semibold">{model.ram}</span>
                        </div>

                        <div className="bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                          <span className="text-zinc-400 flex items-center">
                            <HardDrive className="w-3.5 h-3.5 text-purple-400 mr-1.5" /> Armazenamento:
                          </span>
                          <span className="text-zinc-200 font-semibold truncate ml-2 max-w-[190px]">
                            {model.storage}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-6 pt-0 flex items-center justify-between gap-3 border-t border-zinc-800/80 mt-2">
                    <button
                      onClick={() => setSelectedModelForModal(model)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors text-center cursor-pointer"
                    >
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleStartCompare(model)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#e31b5d]/10 hover:bg-[#e31b5d] text-[#e31b5d] hover:text-white border border-[#e31b5d]/30 transition-all flex items-center space-x-1 cursor-pointer"
                      title="Comparar com outro modelo"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span>Comparar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: COMPARADOR */}
        {/* ========================================================= */}
        {activeTab === 'compare' && (
          <ComparisonTool initialBoardA={compareA} initialBoardB={compareB} />
        )}

        {/* ========================================================= */}
        {/* TAB 4: PINOUT GPIO */}
        {/* ========================================================= */}
        {activeTab === 'pinout' && <PinoutSection />}

        {/* ========================================================= */}
        {/* TAB 5: CÓPIAS & ALTERNATIVAS */}
        {/* ========================================================= */}
        {activeTab === 'alternatives' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Zap className="w-3.5 h-3.5" />
                <span>Ecossistema Competitivo</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Cópias e <span className="text-orange-400">Alternativas de Alto Desempenho</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">
                Placas com processadores Rockchip RK3588, redes 2.5 Gigabit duplas e NPUs de inteligência artificial que competem diretamente com a linha Raspberry Pi.
              </p>
            </div>

            {/* Alternatives Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {ALTERNATIVE_BOARDS.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative aspect-[16/10] bg-zinc-950 overflow-hidden border-b border-zinc-800">
                      <img
                        src={alt.image}
                        alt={alt.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${alt.badgeColor}`}>
                          {alt.badge}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-xs font-bold text-white border border-zinc-700">
                          {alt.priceRange}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      <div>
                        <span className="text-[11px] text-zinc-400 font-semibold uppercase">{alt.brand}</span>
                        <h3 className="text-2xl font-bold text-white mt-0.5">{alt.name}</h3>
                        <p className="text-xs text-zinc-300 mt-2 leading-relaxed">{alt.summary}</p>
                      </div>

                      {/* Specs specs pills */}
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex justify-between">
                          <span className="text-zinc-400">Processador SoC:</span>
                          <strong className="text-zinc-200 font-mono text-[11px]">{alt.soc}</strong>
                        </div>
                        <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex justify-between">
                          <span className="text-zinc-400">Aceleração IA (NPU):</span>
                          <strong className="text-orange-400 font-bold">{alt.npu}</strong>
                        </div>
                        <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex justify-between">
                          <span className="text-zinc-400">RAM Máxima:</span>
                          <strong className="text-white">{alt.maxRam}</strong>
                        </div>
                        <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex justify-between">
                          <span className="text-zinc-400">Rede:</span>
                          <strong className="text-white truncate ml-2 max-w-[200px]">{alt.networking}</strong>
                        </div>
                      </div>

                      {/* Pros & Cons */}
                      <div className="space-y-3 pt-2 border-t border-zinc-800">
                        <div>
                          <span className="text-xs font-bold text-emerald-400 block mb-1.5">Principais Vantagens:</span>
                          <ul className="space-y-1 text-xs text-zinc-300">
                            {alt.pros.slice(0, 3).map((p, i) => (
                              <li key={i} className="flex items-start space-x-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-xs font-bold text-rose-400 block mb-1.5">Limitações:</span>
                          <ul className="space-y-1 text-xs text-zinc-400">
                            {alt.cons.map((c, i) => (
                              <li key={i} className="flex items-start space-x-1.5">
                                <span className="text-rose-400 font-bold">•</span>
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card bottom footer */}
                  <div className="p-6 pt-0">
                    <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
                      <strong className="text-zinc-200 block mb-0.5">Ideal Para:</strong>
                      {alt.bestFor}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Buying Advice Guide */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Guia de Decisão: Quando comprar Raspberry Pi ou Alternativa?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center space-x-2 text-[#e31b5d] font-bold text-base">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Escolha Raspberry Pi se você busca:</span>
                  </div>
                  <ul className="space-y-2 text-zinc-300">
                    <li>• Estabilidade absoluta de software e facilidade de instalação</li>
                    <li>• Milhares de bibliotecas prontas em Python (gpiozero, Picamera2)</li>
                    <li>• Suporte oficial de longo prazo (atualizações regulares do kernel Linux)</li>
                    <li>• Vasta gama de cases, coolers e HATs perfeitamente compatíveis</li>
                  </ul>
                </div>

                <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center space-x-2 text-orange-400 font-bold text-base">
                    <Flame className="w-5 h-5" />
                    <span>Escolha Orange Pi / Radxa se você precisa de:</span>
                  </div>
                  <ul className="space-y-2 text-zinc-300">
                    <li>• Redes ultra-rápidas com portas duplas de 2.5 GbE (roteadores, NAS)</li>
                    <li>• NPU com 6 TOPS para modelos de visão computacional e inteligência artificial</li>
                    <li>• Até 32GB de memória RAM para servidores pesados e Docker</li>
                    <li>• Saída e entrada de vídeo 8K nativa (HDMI IN para streaming)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ACESSÓRIOS & ENERGIA */}
        {/* ========================================================= */}
        {activeTab === 'accessories' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sliders className="w-3.5 h-3.5" />
                <span>Hardware Complementar & Fontes</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Acessórios Essenciais & <span className="text-amber-400">Consumo de Energia</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base">
                Conheça os componentes oficiais indispensáveis (Coolers PWM, Fontes 27W PD, HATs NVMe e Câmeras Sony) e use a calculadora interativa para dimensionar a energia correta.
              </p>
            </div>

            {/* Gear Flatlay Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800">
              <img
                src={gearImg}
                alt="Raspberry Pi Official Accessories Kit Flatlay"
                className="w-full max-h-96 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                    Kit de Alta Performance
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                    Equipamentos Oficiais Recomendados
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm mt-1 max-w-2xl">
                    Active Cooler PWM, Fonte Oficial 27W Power Delivery, M.2 NVMe HAT+ e Módulo de Câmera 3 com sensor Sony.
                  </p>
                </div>
              </div>
            </div>

            {/* Power Calculator Interactive Component */}
            <PowerCalculator />

            {/* Accessories Catalog Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Catálogo de Acessórios & Módulos</h3>
                  <p className="text-xs text-zinc-400">Verifique compatibilidade com seu modelo de placa.</p>
                </div>

                {/* Filter categories */}
                <div className="flex gap-2 overflow-x-auto text-xs">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'power', label: 'Alimentação' },
                    { id: 'cooling', label: 'Refrigeração' },
                    { id: 'storage', label: 'Armazenamento' },
                    { id: 'camera', label: 'Câmera & Vídeo' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setAccessoryCategory(btn.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                        accessoryCategory === btn.id
                          ? 'bg-amber-500 text-black font-bold'
                          : 'bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessories Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAccessories.map((acc) => (
                  <div
                    key={acc.id}
                    className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 space-y-4 hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {acc.category}
                        </span>
                        <span className="text-sm font-bold text-amber-400">{acc.msrp}</span>
                      </div>

                      <h4 className="text-lg font-bold text-white">{acc.name}</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed">{acc.description}</p>

                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-xs space-y-1">
                        <span className="text-zinc-400 block text-[11px] font-semibold">Especificações:</span>
                        <p className="text-zinc-200">{acc.specs}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-zinc-800">
                      <div className="text-[11px] text-zinc-400">
                        <strong className="text-zinc-200 block mb-1">Por que é essencial?</strong>
                        {acc.whyNeeded}
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {acc.compatibility.map((c, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-[10px] text-zinc-300 font-mono"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <ModelDetailModal
        model={selectedModelForModal}
        onClose={() => setSelectedModelForModal(null)}
        onCompare={(model) => handleStartCompare(model)}
        onViewPinout={() => {
          setActiveTab('pinout');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Global Footer */}
      <footer className="border-t border-zinc-800 mt-20 bg-[#080c14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#e31b5d] flex items-center justify-center text-white font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-zinc-200">Pi Universe Pro © 2026</p>
              <p className="text-[11px] text-zinc-400">Enciclopédia de Hardware, Pinouts GPIO e Alternativas SBC</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs">
            <button
              onClick={() => {
                setActiveTab('models');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#e31b5d] transition-colors cursor-pointer"
            >
              Modelos & Specs
            </button>
            <button
              onClick={() => {
                setActiveTab('pinout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#e31b5d] transition-colors cursor-pointer"
            >
              Pinout GPIO 40 Pinos
            </button>
            <button
              onClick={() => {
                setActiveTab('compare');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#e31b5d] transition-colors cursor-pointer"
            >
              Comparador
            </button>
            <button
              onClick={() => {
                setActiveTab('alternatives');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#e31b5d] transition-colors cursor-pointer"
            >
              Orange Pi & Radxa
            </button>
            <button
              onClick={() => {
                setActiveTab('accessories');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#e31b5d] transition-colors cursor-pointer"
            >
              Calculadora de Energia
            </button>
            <a
              href="https://github.com/Bernas1078/Pi-Universe-Pro"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white text-zinc-400 flex items-center space-x-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
