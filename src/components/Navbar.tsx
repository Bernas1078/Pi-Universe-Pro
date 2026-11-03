import React, { useState } from 'react';
import { Cpu, Grid, Layers, Zap, Sliders, Menu, X, ArrowLeftRight, ExternalLink } from 'lucide-react';

export type NavTab = 'home' | 'models' | 'compare' | 'pinout' | 'alternatives' | 'accessories';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
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
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

        {/* Right Actions: Direct GitHub Link + Mobile Toggle */}
        <div className="flex items-center space-x-2.5">
          <a
            href="https://github.com/Bernas1078/Pi-Universe-Pro"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 hover:border-zinc-500 transition-all shadow-sm group"
            title="Abrir repositório no GitHub: Bernas1078/Pi-Universe-Pro"
          >
            <svg
              className="w-4 h-4 text-zinc-300 group-hover:text-white fill-current shrink-0"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="font-mono text-[11px] hidden sm:inline">Bernas1078/Pi-Universe-Pro</span>
            <span className="font-mono text-[11px] sm:hidden">GitHub</span>
            <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-white shrink-0" />
          </a>

          {/* Mobile menu toggle button */}
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
            <a
              href="https://github.com/Bernas1078/Pi-Universe-Pro"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 flex items-center justify-center space-x-2 border border-zinc-700"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>Abrir no GitHub (Bernas1078/Pi-Universe-Pro)</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
