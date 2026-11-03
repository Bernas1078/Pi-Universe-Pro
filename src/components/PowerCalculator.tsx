import React, { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

interface PeripheralOption {
  id: string;
  name: string;
  watts: number;
  desc: string;
}

export const PowerCalculator: React.FC = () => {
  const [selectedBoardId, setSelectedBoardId] = useState<string>('pi5');
  const [selectedPeripherals, setSelectedPeripherals] = useState<string[]>([
    'active-cooler',
    'nvme-ssd'
  ]);

  const boards = [
    { id: 'pi5', name: 'Raspberry Pi 5 (Cortex-A76)', baseIdleW: 2.7, basePeakW: 6.5, defaultSupply: '27W USB-C PD (5.1V 5.0A)' },
    { id: 'cm5', name: 'Compute Module 5 (CM5)', baseIdleW: 2.5, basePeakW: 6.2, defaultSupply: '25W Carrier Board 5V' },
    { id: 'cm4', name: 'Compute Module 4 (CM4)', baseIdleW: 1.8, basePeakW: 4.5, defaultSupply: '15W Carrier Board 5V' },
    { id: 'pi4b', name: 'Raspberry Pi 4 Model B (Cortex-A72)', baseIdleW: 2.1, basePeakW: 4.8, defaultSupply: '15W USB-C (5.1V 3.0A)' },
    { id: 'pi3bplus', name: 'Raspberry Pi 3 Model B+ (Cortex-A53)', baseIdleW: 1.4, basePeakW: 3.5, defaultSupply: '12.5W Micro-USB (5.0V 2.5A)' },
    { id: 'pi3aplus', name: 'Raspberry Pi 3 Model A+ (Econômico)', baseIdleW: 1.1, basePeakW: 2.8, defaultSupply: '12.5W Micro-USB (5.0V 2.5A)' },
    { id: 'pizero2w', name: 'Raspberry Pi Zero 2 W (Compacto)', baseIdleW: 0.6, basePeakW: 1.8, defaultSupply: '10W Micro-USB (5.0V 2.0A)' },
    { id: 'pico2', name: 'Raspberry Pi Pico 2 (RP2350)', baseIdleW: 0.04, basePeakW: 0.25, defaultSupply: '3.3V / 5V USB ou Bateria' },
    { id: 'pico', name: 'Raspberry Pi Pico / Pico W (RP2040)', baseIdleW: 0.05, basePeakW: 0.3, defaultSupply: '5W Micro-USB ou Bateria' }
  ];

  const peripheralList: PeripheralOption[] = [
    { id: 'nvme-ssd', name: 'SSD NVMe M.2 (via PCIe HAT)', watts: 2.8, desc: 'Alta velocidade de leitura e boot ultra rápido' },
    { id: 'active-cooler', name: 'Active Cooler / Ventoinha PWM', watts: 0.7, desc: 'Dissipador térmico ativo contra estrangulamento térmico' },
    { id: 'external-hdd', name: 'HD Externo 2.5" USB 3.0 Mecânico', watts: 4.5, desc: 'Picos altos de rotação do motor em 5V' },
    { id: 'camera-mod3', name: 'Camera Module 3 (Autofoco Sony IMX708)', watts: 1.3, desc: 'Alimentada via conector MIPI CSI' },
    { id: 'touch-display', name: 'Tela Touchscreen Oficial 7" DSI', watts: 2.6, desc: 'Backlight LED e digitalizador de toque capacitivo' },
    { id: 'usb-peripherals', name: 'Teclado + Mouse com iluminação LED', watts: 0.9, desc: 'Consumo padrão de periféricos USB' },
    { id: 'relay-hat', name: 'Placa HAT com Relés e Sensores GPIO', watts: 1.2, desc: 'Bobinas de relé acionadas em 5V' }
  ];

  const activeBoard = boards.find((b) => b.id === selectedBoardId) || boards[0];

  const togglePeripheral = (id: string) => {
    setSelectedPeripherals((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Calculations
  const peripheralsPowerWatts = selectedPeripherals.reduce((sum, id) => {
    const p = peripheralList.find((item) => item.id === id);
    return sum + (p ? p.watts : 0);
  }, 0);

  const totalPeakWatts = parseFloat((activeBoard.basePeakW + peripheralsPowerWatts).toFixed(1));
  const totalIdleWatts = parseFloat((activeBoard.baseIdleW + peripheralsPowerWatts * 0.4).toFixed(1));
  const estimatedAmpsAt5V = parseFloat((totalPeakWatts / 5.1).toFixed(2));

  // Recommendation logic
  const getPowerRecommendation = () => {
    if (selectedBoardId === 'pi5') {
      if (totalPeakWatts > 12) {
        return {
          title: 'Fonte Oficial Raspberry Pi 27W USB-C PD Obrigatória',
          status: 'critical',
          desc: 'Seu setup consome mais de 12W em carga de pico. Fontes convencionais de 15W farão o Pi 5 emitir aviso de sub-tensão e limitar a corrente das portas USB a apenas 600mA.'
        };
      }
      return {
        title: 'Fonte Oficial 27W PD ou Fonte 5V/3A Recomendada',
        status: 'recommended',
        desc: 'Para uso sem periféricos adicionais de alta corrente, uma fonte 5V/3A de boa qualidade atende, mas a fonte oficial de 27W garante que as portas USB forneçam 1.6A totais.'
      };
    }

    if (totalPeakWatts > 15) {
      return {
        title: 'Atenção: Sobrecarga em barramento 5V',
        status: 'warning',
        desc: 'Recomenda-se usar um HUB USB com alimentação própria ou fonte externa para os discos rígidos e displays.'
      };
    }

    return {
      title: `Fonte ${activeBoard.defaultSupply}`,
      status: 'ok',
      desc: 'Capacidade de corrente perfeitamente adequada para a carga calculada com margem de segurança de 25%.'
    };
  };

  const recommendation = getPowerRecommendation();

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Calculadora de Consumo Elétrico & Fonte</h3>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Simule o consumo real do seu setup e descubra a fonte ideal para evitar congelamentos e o temido aviso de raio amarelo (under-voltage).
          </p>
        </div>

        {/* Board selector */}
        <div className="w-full sm:w-auto">
          <label className="text-xs text-zinc-400 block mb-1">Selecione sua placa:</label>
          <select
            value={selectedBoardId}
            onChange={(e) => setSelectedBoardId(e.target.value)}
            className="w-full sm:w-64 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e31b5d]"
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Peripherals Selection Checklist */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-200 mb-3">Marque os periféricos conectados:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {peripheralList.map((p) => {
            const isChecked = selectedPeripherals.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => togglePeripheral(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 text-xs ${
                  isChecked
                    ? 'bg-[#e31b5d]/10 border-[#e31b5d]/50 text-white'
                    : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 rounded accent-[#e31b5d]"
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-zinc-200">{p.name}</div>
                  <div className="text-[11px] text-zinc-400">{p.desc}</div>
                  <div className="text-[10px] text-amber-400 font-mono">+{p.watts} Watts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Results Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400">Consumo em Repouso (Idle)</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{totalIdleWatts} W</div>
          <span className="text-[10px] text-zinc-400 block">Sistema sem carga pesada</span>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400">Pico sob Carga Máxima (Peak)</span>
          <div className="text-2xl font-bold text-[#e31b5d] font-mono">{totalPeakWatts} W</div>
          <span className="text-[10px] text-zinc-400 block">CPU 100% + periféricos ativos</span>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400">Corrente Estimada (a 5.1V)</span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{estimatedAmpsAt5V} A</div>
          <span className="text-[10px] text-zinc-400 block">Amperes contínuos mínimos</span>
        </div>
      </div>

      {/* Final Recommendation Box */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex items-start space-x-3.5 text-xs ${
          recommendation.status === 'critical'
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
            : recommendation.status === 'warning'
            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
        }`}
      >
        {recommendation.status === 'critical' ? (
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        ) : recommendation.status === 'warning' ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <strong className="text-sm font-bold text-white block">{recommendation.title}</strong>
          <p className="leading-relaxed">{recommendation.desc}</p>
        </div>
      </div>
    </div>
  );
};
