import React, { useState } from 'react';
import { 
  ChevronDown, 
  BarChart2, 
  Layers, 
  MessageCircle, 
  ShieldCheck, 
  Calendar, 
  Globe2, 
  History, 
  User, 
  Volume2, 
  VolumeX, 
  Bell, 
  Search,
  Sparkles,
  Award,
  Activity,
  Sun,
  Moon,
  Mail,
  Send,
  Compass
} from 'lucide-react';
import { UserProfile } from '../types/trading';
import { sounds } from '../utils/audio';

export type ActiveTab = 
  | 'PRO_CHART' 
  | 'SENTIMENT'
  | 'SIGNALS' 
  | 'VOLATILITY_MONITOR'
  | 'CALENDAR' 
  | 'NEWS_FILTER' 
  | 'TRADINGVIEW' 
  | 'BACKTEST' 
  | 'RISK_JOURNAL';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedSymbol: string;
  setSelectedSymbol: (sym: string) => void;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  currentPrice: number;
  user: UserProfile;
  onOpenGoogleLogin: () => void;
  onOpenWhatsAppModal: () => void;
  audioMuted: boolean;
  setAudioMuted: (muted: boolean | ((prev: boolean) => boolean)) => void;
  currentZScore?: number;
  isSpikeActive?: boolean;
  theme?: 'light' | 'dark';
  setTheme?: (t: 'light' | 'dark') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedSymbol,
  setSelectedSymbol,
  timeframe,
  setTimeframe,
  currentPrice,
  user,
  onOpenGoogleLogin,
  onOpenWhatsAppModal,
  audioMuted,
  setAudioMuted,
  currentZScore = 1.24,
  isSpikeActive = false,
  theme = 'light',
  setTheme,
}) => {
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false);

  const symbols = [
    { id: 'GOLD', name: 'GOLD (XAU/USD)', icon: '🪙', price: 4058.39, change: '+1.03%' },
    { id: 'EURUSD', name: 'EUR/USD', icon: '💶', price: 1.0845, change: '+0.18%' },
    { id: 'GBPUSD', name: 'GBP/USD', icon: '💷', price: 1.2980, change: '+0.34%' },
    { id: 'USDJPY', name: 'USD/JPY', icon: '💴', price: 153.20, change: '-0.24%' },
    { id: 'BTCUSD', name: 'BTC/USD (Crypto)', icon: '₿', price: 68450.00, change: '+2.14%' },
  ];

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'];

  const navTabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'PRO_CHART', label: 'Live Gold Chart', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'SENTIMENT', label: 'Sentiment Gauge (74% Bullish)', icon: <Compass className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'SIGNALS', label: 'AI Signals & WhatsApp', icon: <Award className="w-3.5 h-3.5 text-amber-500" /> },
    { 
      id: 'VOLATILITY_MONITOR', 
      label: '2σ Volatility Alert', 
      icon: <Activity className={`w-3.5 h-3.5 ${isSpikeActive ? 'text-rose-500 animate-pulse' : 'text-rose-500'}`} /> 
    },
    { id: 'CALENDAR', label: 'ForexFactory Data', icon: <Calendar className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'NEWS_FILTER', label: 'News & Fake Filter', icon: <Globe2 className="w-3.5 h-3.5 text-indigo-500" /> },
    { id: 'TRADINGVIEW', label: 'TradingView Widget', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'BACKTEST', label: 'Backtesting', icon: <History className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'RISK_JOURNAL', label: 'Risk & Trades', icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-500" /> },
  ];

  const isLight = theme === 'light';

  return (
    <header className={`${isLight ? 'bg-white border-b border-slate-200 text-slate-800' : 'bg-[#0b0e14] border-b border-[#1e293b] text-[#e1e7ec]'} flex flex-col z-30 select-none shadow-sm transition-colors`}>
      {/* Top Bar: Asset, Ticker, Timeframes, and User profile */}
      <div className={`h-12 px-3 sm:px-4 flex items-center justify-between gap-3 border-b ${isLight ? 'border-slate-100' : 'border-[#172030]'}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Asset Selector Dropdown (matches screenshot "🪙 GOLD ▾") */}
          <div className="relative">
            <button
              onClick={() => setShowSymbolDropdown((prev) => !prev)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all shadow-sm ${
                isLight 
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900' 
                  : 'bg-[#172030] hover:bg-[#202c42] border-gray-700/80 text-white'
              }`}
            >
              <span className="text-sm">🪙</span>
              <span className="tracking-wide font-extrabold">{selectedSymbol}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showSymbolDropdown && (
              <div className={`absolute top-11 left-0 w-64 rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in font-mono text-xs border ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-800 divide-y divide-slate-100' 
                  : 'bg-[#121824] border-[#273549] text-gray-200 divide-y divide-[#1e293b]'
              }`}>
                {symbols.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSymbol(s.id);
                      setShowSymbolDropdown(false);
                      sounds.playOrderClick();
                    }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors ${
                      selectedSymbol === s.id 
                        ? (isLight ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-[#1e2d42] text-amber-400') 
                        : (isLight ? 'hover:bg-slate-50 text-slate-700' : 'hover:bg-[#1a2436] text-gray-200')
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{s.icon}</span>
                      <span className="font-sans font-bold">{s.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold">${s.price.toFixed(2)}</span>
                      <span className={`text-[10px] ${s.change.startsWith('+') ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}`}>
                        {s.change}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timeframes Bar (matches screenshot "15m", "1m", "5m"...) */}
          <div className={`hidden md:flex items-center gap-1 p-1 rounded-lg border text-xs font-mono ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#121824] border-gray-800'
          }`}>
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  sounds.playOrderClick();
                }}
                className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                  timeframe === tf
                    ? (isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-[#2962ff] text-white shadow-sm')
                    : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60')
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Real-time Live Price Marker */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-mono ${
            isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-[#131b29] border-gray-800 text-emerald-400'
          }`}>
            <span className="font-extrabold text-sm">${currentPrice.toFixed(2)}</span>
            <span className="text-[10px] font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-700">+1.03%</span>
          </div>

          {/* Real-time 2-Sigma Volatility Spike Monitor Pill */}
          <button
            onClick={() => setActiveTab('VOLATILITY_MONITOR')}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
              isSpikeActive
                ? 'bg-rose-500 text-white border-rose-600 shadow-md animate-pulse'
                : Math.abs(currentZScore) >= 1.5
                ? (isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/15 text-amber-300 border-amber-500/40')
                : (isLight ? 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300' : 'bg-[#131b29] text-gray-300 border-gray-800 hover:border-gray-700')
            }`}
            title="Real-Time 1H MA 2σ Volatility Spike Monitor"
          >
            <Activity className={`w-3.5 h-3.5 ${isSpikeActive ? 'text-white animate-spin' : 'text-rose-500'}`} />
            <span>2σ Vol:</span>
            <span className={isSpikeActive ? 'text-white' : (isLight ? 'text-blue-700' : 'text-cyan-400')}>
              {currentZScore > 0 ? `+${currentZScore}` : currentZScore}σ
            </span>
            {isSpikeActive && (
              <span className="px-1 py-0.2 rounded text-[9px] bg-white text-rose-600 font-extrabold">
                SPIKE
              </span>
            )}
          </button>

          {/* Real-time Institutional Sentiment Quick Pill */}
          <button
            onClick={() => setActiveTab('SENTIMENT')}
            className={`hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-all shadow-xs ${
              isLight 
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800' 
                : 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/40 text-emerald-300'
            }`}
            title="Institutional Order Flow: 74% Bullish / 26% Bearish"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sentiment:</span>
            <span className="text-emerald-700 font-black">74% Bullish</span>
          </button>
        </div>

        {/* Right Action Tools: Theme toggle, Sound, WhatsApp status, Google User */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          {setTheme && (
            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className={`p-1.5 rounded-lg border text-xs transition-colors ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                  : 'bg-[#172030] hover:bg-[#202c42] text-gray-300 border-gray-700'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          )}

          {/* Sound Mute Toggle */}
          <button
            onClick={() => setAudioMuted((v) => !v)}
            title={audioMuted ? 'Unmute Audio Alerts' : 'Mute Audio Alerts'}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                : 'bg-[#172030] hover:bg-[#202c42] text-gray-400 hover:text-white border-gray-800'
            }`}
          >
            {audioMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* WhatsApp Quick Dispatch Status Pill */}
          <button
            onClick={onOpenWhatsAppModal}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${
              isLight 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
            title="Configure WhatsApp Live Signal Dispatch"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-transparent" />
            <span className="text-[11px] truncate max-w-[130px]">
              {user.whatsAppNumber ? `WA: ${user.whatsAppNumber.slice(-4)}` : 'Setup WhatsApp'}
            </span>
          </button>

          {/* Google User Login Button */}
          <button
            onClick={onOpenGoogleLogin}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all font-semibold shadow-sm ${
              isLight 
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                : 'bg-[#172030] hover:bg-[#223049] border-gray-700 text-white'
            }`}
          >
            {user.isLoggedIn ? (
              <>
                <img src={user.avatar} alt="Profile" className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500" />
                <span className="hidden sm:inline font-mono">{user.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4 text-slate-400" />
                <span>Google Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar / Tabs */}
      <div className={`h-10 px-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d121c] border-[#172030]'
      }`}>
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                sounds.playOrderClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                isActive
                  ? (isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-amber-500 text-black shadow-md shadow-amber-500/20')
                  : (isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a2333]')
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
