import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, AlertTriangle, ShieldCheck, Code, Zap, Sparkles } from 'lucide-react';
import { GPIO_PINS, GpioPin, getPinTypeBadge } from '../data/gpio';

type FilterType = 'all' | 'power' | 'gnd' | 'gpio' | 'i2c' | 'spi' | 'uart' | 'pwm' | 'id';
type CodeLang = 'gpiozero' | 'rpigpio' | 'micropython' | 'shell';

export const PinoutSection: React.FC = () => {
  const [selectedPin, setSelectedPin] = useState<GpioPin>(GPIO_PINS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [activeCodeLang, setActiveCodeLang] = useState<CodeLang>('gpiozero');
  const [copiedCode, setCopiedCode] = useState(false);

  // Filter logic
  const filteredPins = useMemo(() => {
    return GPIO_PINS.filter((pin) => {
      // Category filter
      if (filterType === 'power' && pin.type !== 'power3v3' && pin.type !== 'power5v') return false;
      if (filterType === 'gnd' && pin.type !== 'gnd') return false;
      if (filterType === 'gpio' && pin.type !== 'gpio') return false;
      if (filterType === 'i2c' && pin.type !== 'i2c') return false;
      if (filterType === 'spi' && pin.type !== 'spi') return false;
      if (filterType === 'uart' && pin.type !== 'uart') return false;
      if (filterType === 'pwm' && pin.type !== 'pwm') return false;
      if (filterType === 'id' && pin.type !== 'id') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = pin.name.toLowerCase().includes(q);
        const matchesBcm = pin.bcm.toLowerCase().includes(q);
        const matchesDesc = pin.desc.toLowerCase().includes(q);
        const matchesAlt = pin.altFunctions?.some((alt) => alt.toLowerCase().includes(q));
        const matchesPin = pin.pin.toString() === q || `pino ${pin.pin}` === q || `pin ${pin.pin}` === q;
        return matchesName || matchesBcm || matchesDesc || matchesAlt || matchesPin;
      }

      return true;
    });
  }, [filterType, searchQuery]);

  const isPinHighlighted = (pin: GpioPin) => {
    return filteredPins.some((p) => p.pin === pin.pin);
  };

  // Generate code snippet for selected pin
  const getCodeSnippet = (pin: GpioPin, lang: CodeLang): string => {
    const isDigitalGpio = pin.bcm.startsWith('BCM ');
    const bcmNumber = isDigitalGpio ? pin.bcm.replace('BCM ', '') : null;

    if (!bcmNumber) {
      if (pin.type === 'power3v3') {
        return `# Pino ${pin.pin}: Alimentação 3.3V contínua\n# Não é controlado via software.\n# Fornece até ~50mA para sensores e CIs de baixa potência.`;
      }
      if (pin.type === 'power5v') {
        return `# Pino ${pin.pin}: Alimentação 5.0V direta\n# Fornece energia da fonte do Pi para ventoinhas e periféricos.\n# ATENÇÃO: Nunca conecte em pinos digitais do Raspberry Pi!`;
      }
      if (pin.type === 'gnd') {
        return `# Pino ${pin.pin}: GND (Terra 0V)\n# Conecte ao terra dos seus sensores e circuitos para referência comum.`;
      }
      return `# Pino ${pin.pin} (${pin.name})\n# Reservado para barramento do sistema ou identificação de HATs.`;
    }

    switch (lang) {
      case 'gpiozero':
        return `from gpiozero import LED, Button
from time import sleep

# Usando biblioteca moderna gpiozero (BCM ${bcmNumber} no Pino Físico ${pin.pin})
led = LED(${bcmNumber})

print("Piscando LED no pino GPIO ${bcmNumber}...")
try:
    while True:
        led.on()
        sleep(1)
        led.off()
        sleep(1)
except KeyboardInterrupt:
    print("Finalizado!")`;

      case 'rpigpio':
        return `import RPi.GPIO as GPIO
import time

# Modo BCM (numeração do chip Broadcom)
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

PIN = ${bcmNumber}  # Pino Físico ${pin.pin}
GPIO.setup(PIN, GPIO.OUT)

try:
    print("Acionando BCM ${bcmNumber}...")
    GPIO.output(PIN, GPIO.HIGH)
    time.sleep(2)
    GPIO.output(PIN, GPIO.LOW)
finally:
    GPIO.cleanup()`;

      case 'micropython':
        return `from machine import Pin
import time

# Para Raspberry Pi Pico / Pico W
# Configura o pino GP${bcmNumber} como saída
led = Pin(${bcmNumber}, Pin.OUT)

while True:
    led.toggle()
    time.sleep(0.5)`;

      case 'shell':
        return `# No terminal do Raspberry Pi OS (Bookworm / Kernel 6.x):
# Ler estado do pino via pinctrl
pinctrl get ${bcmNumber}

# Colocar nível ALTO (3.3V)
pinctrl set ${bcmNumber} op dh

# Colocar nível BAIXO (0V)
pinctrl set ${bcmNumber} op dl

# Modo entrada com pull-up
pinctrl set ${bcmNumber} ip pu`;

      default:
        return '';
    }
  };

  const currentCode = getCodeSnippet(selectedPin, activeCodeLang);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#e31b5d]/10 text-[#e31b5d] border border-[#e31b5d]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Diagrama Padrão Oficial 40 Pinos</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Guia Interativo de <span className="text-[#e31b5d]">Pinout GPIO</span>
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Compatível com Raspberry Pi 5, 4B, 3B+, 3A+, Zero 2 W, Zero W e 400. Clique em qualquer pino para inspecionar parâmetros elétricos e gerar código em tempo real.
        </p>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-4 sm:p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar pino (ex: I2C, SDA, PWM, TX, BCM 18, 5V, Pino 7)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#e31b5d] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick results count */}
          <div className="text-xs text-zinc-400 w-full sm:w-auto text-left sm:text-right">
            Exibindo <span className="text-[#e31b5d] font-bold">{filteredPins.length}</span> de 40 pinos
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Todos os 40 Pinos' },
            { id: 'power', label: 'Energia (3.3V / 5V)' },
            { id: 'gnd', label: 'Terra (GND)' },
            { id: 'gpio', label: 'GPIO Digital' },
            { id: 'i2c', label: 'I2C (SDA/SCL)' },
            { id: 'spi', label: 'SPI (MOSI/MISO)' },
            { id: 'uart', label: 'UART (TX/RX)' },
            { id: 'pwm', label: 'Hardware PWM' },
            { id: 'id', label: 'ID EEPROM' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id as FilterType)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                filterType === cat.id
                  ? 'bg-[#e31b5d] text-white shadow-sm shadow-[#e31b5d]/30 font-semibold'
                  : 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Visual Header on Left, Inspector & Code on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual 40-Pin Header Container (7 cols on lg) */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-3">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>Lado Cartão SD / PCIe (Topo)</span>
            </span>
            <span className="font-mono text-zinc-300 font-bold uppercase tracking-wider">
              PCB Header P1 (40 Pinos)
            </span>
            <span className="flex items-center space-x-1">
              <span>Lado USB / LAN (Base)</span>
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
            </span>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap gap-2 text-[11px] justify-center bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80">
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> <span>5.0V</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> <span>3.3V</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-zinc-700/20 text-zinc-300 border border-zinc-700">
              <span className="w-2 h-2 rounded-full bg-zinc-400"></span> <span>GND</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> <span>GPIO</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span> <span>I2C</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span> <span>SPI</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span> <span>UART</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> <span>PWM</span>
            </span>
          </div>

          {/* Physical Pinout Dual-Column Layout (Odd Pins Left, Even Pins Right) */}
          <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
            {Array.from({ length: 20 }).map((_, rowIndex) => {
              const oddPin = GPIO_PINS[rowIndex * 2]; // 1, 3, 5, ...
              const evenPin = GPIO_PINS[rowIndex * 2 + 1]; // 2, 4, 6, ...

              const isOddSelected = selectedPin.pin === oddPin.pin;
              const isEvenSelected = selectedPin.pin === evenPin.pin;

              const isOddHighlighted = isPinHighlighted(oddPin);
              const isEvenHighlighted = isPinHighlighted(evenPin);

              const oddBadge = getPinTypeBadge(oddPin.type);
              const evenBadge = getPinTypeBadge(evenPin.type);

              return (
                <div key={rowIndex} className="grid grid-cols-2 gap-3 items-center">
                  {/* Odd Pin (Left Column) */}
                  <button
                    onClick={() => setSelectedPin(oddPin)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left ${
                      isOddSelected
                        ? 'bg-[#e31b5d]/30 border-2 border-[#e31b5d] text-white shadow-md shadow-[#e31b5d]/20 scale-[1.01]'
                        : isOddHighlighted
                        ? 'bg-zinc-950/90 border border-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900'
                        : 'bg-zinc-950/40 border border-zinc-900 text-zinc-500 opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {oddPin.pin}
                      </span>
                      <span className="truncate font-medium">{oddPin.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${oddBadge.bg}`}>
                        {oddBadge.label}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${oddBadge.dot}`}></span>
                    </div>
                  </button>

                  {/* Even Pin (Right Column) */}
                  <button
                    onClick={() => setSelectedPin(evenPin)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left ${
                      isEvenSelected
                        ? 'bg-[#e31b5d]/30 border-2 border-[#e31b5d] text-white shadow-md shadow-[#e31b5d]/20 scale-[1.01]'
                        : isEvenHighlighted
                        ? 'bg-zinc-950/90 border border-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900'
                        : 'bg-zinc-950/40 border border-zinc-900 text-zinc-500 opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5 shrink-0 mr-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${evenBadge.dot}`}></span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${evenBadge.bg}`}>
                        {evenBadge.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 truncate justify-end w-full">
                      <span className="truncate font-medium text-right">{evenPin.name}</span>
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {evenPin.pin}
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Pin Inspector & Code Generation (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Detailed Inspector Card */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-[#e31b5d]/20 text-[#e31b5d] border border-[#e31b5d]/40 flex items-center justify-center font-mono font-bold text-lg">
                  #{selectedPin.pin}
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold">Pino Físico Selecionado</span>
                  <h3 className="text-xl font-bold text-white tracking-tight">{selectedPin.name}</h3>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block font-mono">BROADCOM BCM</span>
                <span className="text-sm font-bold text-[#e31b5d] font-mono">{selectedPin.bcm}</span>
              </div>
            </div>

            {/* Spec Attributes */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400 block">Tipo Elétrico</span>
                <strong className="text-zinc-200 capitalize">{selectedPin.type}</strong>
              </div>
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-400 block">Estado Inicial (Boot)</span>
                <strong className="text-zinc-200">{selectedPin.defaultPull || 'Flutuante'}</strong>
              </div>
              {selectedPin.wiringPi !== undefined && (
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 block">Número WiringPi</span>
                  <strong className="text-zinc-200 font-mono">wPi {selectedPin.wiringPi}</strong>
                </div>
              )}
              {selectedPin.altFunctions && selectedPin.altFunctions.length > 0 && (
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 col-span-2">
                  <span className="text-zinc-400 block mb-1">Funções Alternativas (Mux)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPin.altFunctions.map((alt, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Technical description */}
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs text-zinc-300 space-y-1">
              <span className="text-zinc-400 block font-semibold">Descrição de Operação:</span>
              <p className="leading-relaxed">{selectedPin.desc}</p>
            </div>

            {/* Warning if applicable */}
            {selectedPin.warning ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start space-x-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{selectedPin.warning}</p>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Nível lógico seguro de 3.3V. Corrente máxima recomendada de 16mA por pino digital.</p>
              </div>
            )}
          </div>

          {/* Interactive Code Generator for this Pin */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-[#e31b5d]" />
                <h4 className="text-sm font-bold text-white">Gerador de Código de Teste</h4>
              </div>

              {/* Language Selector */}
              <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[11px]">
                <button
                  onClick={() => setActiveCodeLang('gpiozero')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeCodeLang === 'gpiozero' ? 'bg-[#e31b5d] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  gpiozero
                </button>
                <button
                  onClick={() => setActiveCodeLang('rpigpio')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeCodeLang === 'rpigpio' ? 'bg-[#e31b5d] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  RPi.GPIO
                </button>
                <button
                  onClick={() => setActiveCodeLang('shell')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeCodeLang === 'shell' ? 'bg-[#e31b5d] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Linux CLI
                </button>
                <button
                  onClick={() => setActiveCodeLang('micropython')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeCodeLang === 'micropython' ? 'bg-[#e31b5d] text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  MicroPython
                </button>
              </div>
            </div>

            {/* Code Box */}
            <div className="relative group">
              <pre className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300 font-mono text-xs leading-relaxed overflow-x-auto">
                {currentCode}
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-2.5 right-2.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center space-x-1.5 border border-zinc-700 transition-all shadow-md"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
