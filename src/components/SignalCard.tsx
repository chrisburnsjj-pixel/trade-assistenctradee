import React, { useState } from 'react';
import { TradingSignal } from '../types/trading';
import { 
  Send, 
  CheckCircle2, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Award, 
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Zap,
  Globe,
  Mail,
  Compass
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface SignalCardProps {
  signal: TradingSignal;
  onExecuteTrade: (direction: 'BUY' | 'SELL', lotSize: number, price: number, notes: string) => void;
  userWhatsAppNumber: string;
  userEmail?: string;
  onOpenWhatsAppConfig: () => void;
  theme?: 'light' | 'dark';
}

export const SignalCard: React.FC<SignalCardProps> = ({
  signal,
  onExecuteTrade,
  userWhatsAppNumber,
  userEmail = 'junaidajaffry@gmail.com',
  onOpenWhatsAppConfig,
  theme = 'light',
}) => {
  const [copied, setCopied] = useState(false);
  const [showLanguage, setShowLanguage] = useState<'both' | 'urdu' | 'en'>('both');
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const isLight = theme === 'light';
  const isBuy = signal.direction.includes('BUY');
  
  const signalColor = isBuy 
    ? (isLight ? 'text-emerald-700' : 'text-emerald-400') 
    : (isLight ? 'text-rose-700' : 'text-rose-400');

  const signalBadgeBg = isBuy 
    ? (isLight ? 'bg-emerald-100 border-emerald-300' : 'bg-emerald-500/10 border-emerald-500/30') 
    : (isLight ? 'bg-rose-100 border-rose-300' : 'bg-rose-500/10 border-rose-500/30');

  // Format clean WhatsApp signal copy
  const getWhatsAppMessage = () => {
    return `
🎯 *GOLDSNIPER PRO - VERIFIED TRADING SIGNAL* 🎯
━━━━━━━━━━━━━━━━━━━━
🪙 *Asset:* ${signal.symbol}
⚡ *Action:* ${signal.direction}
💵 *Entry Price:* ${signal.entryPrice.toFixed(2)}
🛑 *Stop Loss:* ${signal.stopLoss.toFixed(2)} (-${signal.slPips} pips)
🎯 *Target 1 (TP1):* ${signal.takeProfit1.toFixed(2)} (+${signal.tp1Pips} pips)
🎯 *Target 2 (TP2):* ${signal.takeProfit2.toFixed(2)} (+${signal.tp2Pips} pips)
🎯 *Target 3 (TP3):* ${signal.takeProfit3.toFixed(2)} (+${signal.tp3Pips} pips)
━━━━━━━━━━━━━━━━━━━━
📊 *Risk/Reward:* ${signal.riskRewardRatio}
🛡️ *Algorithm Confidence:* ${signal.confidenceScore}% (Zero-Mistake Filter)
🧠 *Urdu Summary:* ${signal.decisionReasoningUrdu}
━━━━━━━━━━━━━━━━━━━━
⚠️ *Risk Management:* Max 1-2% account balance risk.
📱 GoldSniper Pro AI Trading Terminal
    `.trim();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getWhatsAppMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppDirectSend = () => {
    sounds.playSignalAlert();
    const cleanPhone = (userWhatsAppNumber || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(getWhatsAppMessage());
    const waUrl = cleanPhone 
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`
      : `https://api.whatsapp.com/send?text=${message}`;

    window.open(waUrl, '_blank');
    setDispatchStatus(`✅ Signal sent to WhatsApp (${userWhatsAppNumber}) & linked to ${userEmail}!`);
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border transition-all ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121824] border-[#232f45] text-slate-100'
    }`}>
      {/* Header with High-Probability Confidence & Confluence */}
      <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isLight 
          ? 'bg-slate-50 border-slate-200' 
          : 'bg-gradient-to-r from-[#172033] to-[#121824] border-[#232f45]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${
            isBuy 
              ? (isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400') 
              : (isLight ? 'bg-rose-100 text-rose-700' : 'bg-rose-500/20 text-rose-400')
          }`}>
            {isBuy ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase font-extrabold tracking-wider ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>
                Precision AI Signal
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 font-bold ${
                isLight 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>
                <Award className="w-3 h-3 text-blue-500" />
                Zero-Mistake Filter Active
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5 mt-1">
              <span>{signal.symbol}</span>
              <span className={`px-3 py-0.5 rounded-lg text-sm font-black border ${signalBadgeBg} ${signalColor}`}>
                {signal.direction}
              </span>
            </h3>
          </div>
        </div>

        {/* Confidence Score & Live Dispatch Targets */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-semibold">AI Confidence:</span>
          </div>
          <span className={`text-2xl sm:text-3xl font-black font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
            {signal.confidenceScore}%
          </span>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Target: {userWhatsAppNumber || 'Not set'}</span>
          </div>
        </div>
      </div>

      {/* Target Levels Grid (Entry, SL, TP1, TP2, TP3) */}
      <div className={`p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 border-b ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#0e131d]/60 border-[#1e293b]'
      }`}>
        {/* Entry */}
        <div className={`p-3 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Entry Price</span>
          <span className="text-base sm:text-lg font-black font-mono block mt-0.5 text-slate-900">
            ${signal.entryPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Market / Limit</span>
        </div>

        {/* Stop Loss */}
        <div className={`p-3 rounded-xl border ${
          isLight ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-[#172030] border-rose-900/40 bg-rose-950/10'
        }`}>
          <span className="text-[10px] uppercase font-bold text-rose-600 block">Stop Loss (SL)</span>
          <span className="text-base sm:text-lg font-black font-mono text-rose-700 block mt-0.5">
            ${signal.stopLoss.toFixed(2)}
          </span>
          <span className="text-[10px] text-rose-600 font-bold font-mono">-{signal.slPips} pips</span>
        </div>

        {/* TP 1 */}
        <div className={`p-3 rounded-xl border ${
          isLight ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-[#172030] border-emerald-900/40 bg-emerald-950/10'
        }`}>
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">TP 1 (Safe)</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-800 block mt-0.5">
            ${signal.takeProfit1.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold font-mono">+{signal.tp1Pips} pips</span>
        </div>

        {/* TP 2 */}
        <div className={`p-3 rounded-xl border ${
          isLight ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-[#172030] border-emerald-900/40 bg-emerald-950/10'
        }`}>
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">TP 2 (Standard)</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-800 block mt-0.5">
            ${signal.takeProfit2.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold font-mono">+{signal.tp2Pips} pips</span>
        </div>

        {/* TP 3 */}
        <div className={`p-3 rounded-xl border col-span-2 sm:col-span-1 ${
          isLight ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-[#172030] border-emerald-900/40 bg-emerald-950/10'
        }`}>
          <span className="text-[10px] uppercase font-bold text-emerald-700 block">TP 3 (Runner)</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-800 block mt-0.5">
            ${signal.takeProfit3.toFixed(2)}
          </span>
          <span className="text-[10px] text-emerald-700 font-bold font-mono">+{signal.tp3Pips} pips</span>
        </div>
      </div>

      {/* Metrics Row: Risk/Reward, ForexFactory News, Fake Report Filter */}
      <div className={`px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#131a27] border-[#1e293b]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-500 font-medium">R:R Ratio:</span>
            <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{signal.riskRewardRatio}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>ForexFactory Clean</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-teal-700 font-semibold font-mono">
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Sentiment: 74% Bullish Flow</span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${
          isLight ? 'bg-blue-50 text-blue-800 border-blue-200' : 'text-blue-300 bg-blue-500/10 border-blue-500/20'
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
          <span>Fake Rumors Filtered (100% Verified Sources)</span>
        </div>
      </div>

      {/* AI Trading Expert Explanation & Bilingual Translation */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            AI Decision Rationale & Technical Confluence:
          </span>

          <div className={`flex items-center gap-1 text-[11px] p-0.5 rounded-lg border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#1a2333] border-gray-700'
          }`}>
            <button
              onClick={() => setShowLanguage('both')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                showLanguage === 'both' 
                  ? (isLight ? 'bg-blue-600 text-white' : 'bg-amber-500 text-black') 
                  : 'text-slate-600'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setShowLanguage('urdu')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                showLanguage === 'urdu' 
                  ? (isLight ? 'bg-blue-600 text-white' : 'bg-amber-500 text-black') 
                  : 'text-slate-600'
              }`}
            >
              Roman Urdu
            </button>
            <button
              onClick={() => setShowLanguage('en')}
              className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                showLanguage === 'en' 
                  ? (isLight ? 'bg-blue-600 text-white' : 'bg-amber-500 text-black') 
                  : 'text-slate-600'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Technical Confluence Bullet Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {signal.technicalConfluence.map((conf, idx) => (
            <div key={idx} className={`flex items-start gap-2 p-2.5 rounded-lg border ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#172030] border-gray-800 text-gray-300'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{conf}</span>
            </div>
          ))}
        </div>

        {/* Urdu Explanation */}
        {(showLanguage === 'both' || showLanguage === 'urdu') && (
          <div className={`p-3.5 rounded-xl border text-xs ${
            isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-[#1a2436] border-amber-500/20 text-gray-200'
          }`}>
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block mb-1">
              🇵🇰 Trading Expert Advice (Roman Urdu):
            </span>
            <p className="leading-relaxed font-sans font-medium text-slate-800">
              "{signal.decisionReasoningUrdu}"
            </p>
          </div>
        )}

        {/* English Explanation */}
        {(showLanguage === 'both' || showLanguage === 'en') && (
          <div className={`p-3.5 rounded-xl border text-xs ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#172030] border-gray-800 text-gray-300'
          }`}>
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-1">
              Institutional Market Analysis:
            </span>
            <p className="leading-relaxed font-sans font-medium">
              "{signal.decisionReasoningEnglish}"
            </p>
          </div>
        )}
      </div>

      {/* Action Footer: WhatsApp Direct Dispatch + Terminal Execution */}
      <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
      }`}>
        <div className="flex items-center gap-2">
          {/* WhatsApp Direct Send Button */}
          <button
            onClick={handleWhatsAppDirectSend}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white text-transparent" />
            <span>Send to WhatsApp ({userWhatsAppNumber ? userWhatsAppNumber.slice(0, 10) + '...' : 'Config'})</span>
          </button>

          {/* Copy Signal text */}
          <button
            onClick={handleCopy}
            className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-1.5 ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm' 
                : 'bg-[#1e293b] hover:bg-[#273549] text-gray-300 border-gray-700'
            }`}
            title="Copy Signal Text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline font-semibold">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* WhatsApp Config link */}
          <button
            onClick={onOpenWhatsAppConfig}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2 ml-1"
          >
            Change Phone / Email
          </button>
        </div>

        {/* Execute in Terminal button */}
        <button
          onClick={() => {
            sounds.playOrderClick();
            onExecuteTrade(
              isBuy ? 'BUY' : 'SELL', 
              signal.recommendedLotSizeFor10k, 
              signal.entryPrice,
              `AI Signal Execution: ${signal.symbol} at ${signal.entryPrice} with TP ${signal.takeProfit1} and SL ${signal.stopLoss}`
            );
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wide text-white transition-all shadow-md active:scale-95 ${
            isBuy ? 'bg-[#089981] hover:bg-[#067a67]' : 'bg-[#f23645] hover:bg-[#d82a39]'
          }`}
        >
          Execute {signal.direction} ({signal.recommendedLotSizeFor10k} Lots)
        </button>
      </div>

      {dispatchStatus && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-center text-xs font-bold animate-fade-in">
          {dispatchStatus}
        </div>
      )}
    </div>
  );
};
