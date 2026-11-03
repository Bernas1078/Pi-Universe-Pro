import React, { useState } from 'react';
import { Cpu, Grid, Layers, Zap, Sliders, Menu, X, ArrowLeftRight, Share2, Download } from 'lucide-react';

export type NavTab = 'home' | 'models' | 'compare' | 'pinout' | 'alternatives' | 'accessories';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenTransfer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, onOpenTransfer }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Início', icon: <Cpu className="w-4 h-4" /> },
    { id: 'models', label: 'Modelos & Specs', icon: <Grid className="w-4 h-4" /> },
    { id: 'compare', label: 'Comparador', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'pinout', label: 'Pinout GPIO (40 Pinos)', icon: <Layers className="w-4 h-4" /> },
    { id: 'alternatives', label: 'Cópias & Alternativas', icon: <Zap className="w-4 h-4" /> },
    { id: 'accessories', label: 'Acessórios & Energia', icon: <Sliders className="w-4 h-4" /> }
  ];

  const handleSelect = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#080c14]/90 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => handleSelect('home')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#c5124b] to-[#e31b5d] flex items-center justify-center glow-raspberry transition-transform group-hover:scale-105">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-[#e31b5d] bg-clip-text text-transparent">
                Pi Universe
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#e31b5d]/20 text-[#e31b5d] border border-[#e31b5d]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Hardware Specs, Pinouts & Alternativas</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#e31b5d]/20 text-white border border-[#e31b5d]/40 shadow-sm shadow-[#e31b5d]/20'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <span className={isActive ? 'text-[#e31b5d]' : 'text-zinc-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Transfer / Export Button + Mobile Toggle */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenTransfer}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#e31b5d] hover:bg-[#c5124b] text-white flex items-center space-x-1.5 transition-all shadow-md shadow-[#e31b5d]/25 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Transferir / Exportar</span>
            <span className="sm:hidden">Transferir</span>
          </button>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0f1b] border-b border-zinc-800 px-4 pt-3 pb-5 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#e31b5d]/20 text-white border border-[#e31b5d]/40'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <span className={isActive ? 'text-[#e31b5d]' : 'text-zinc-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTransfer();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 flex items-center justify-center space-x-2 border border-zinc-700"
            >
              <Share2 className="w-4 h-4 text-[#e31b5d]" />
              <span>Opções de Transferência & Exportação</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
