import React, { useState } from 'react';
import { ForexFactoryEvent } from '../types/trading';
import { 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  ExternalLink,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

interface ForexFactoryCalendarProps {
  events: ForexFactoryEvent[];
  volatilityStatus: 'ELEVATED' | 'NORMAL' | 'CRITICAL_EMBARGO';
  embargoActive: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  theme?: 'light' | 'dark';
}

export const ForexFactoryCalendar: React.FC<ForexFactoryCalendarProps> = ({
  events,
  volatilityStatus,
  embargoActive,
  onRefresh,
  isLoading,
  theme = 'light',
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [filterImpact, setFilterImpact] = useState<string>('ALL');

  const isLight = theme === 'light';
  const currencies = ['ALL', 'USD', 'EUR', 'GBP', 'JPY'];

  const filteredEvents = events.filter((ev) => {
    if (selectedCurrency !== 'ALL' && ev.currency !== selectedCurrency) return false;
    if (filterImpact !== 'ALL' && ev.impact !== filterImpact) return false;
    return true;
  });

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border flex flex-col h-full transition-all ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121824] border-[#232f45] text-slate-100'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#172033] border-[#232f45]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-100 border border-red-200 text-red-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">ForexFactory Economic Calendar</h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                Live Macro Data
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              High impact event radar & volatility protection for Gold and Forex pairs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all font-semibold ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm' 
                : 'bg-[#1e293b] hover:bg-[#283548] text-gray-300 border-gray-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-600' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Volatility & News Embargo Warning Banner */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between text-xs font-semibold ${
        embargoActive 
          ? 'bg-rose-50 border-rose-200 text-rose-800' 
          : volatilityStatus === 'ELEVATED'
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}>
        <div className="flex items-center gap-2">
          {embargoActive ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          ) : (
            <Flame className="w-4 h-4 text-amber-600" />
          )}
          <span>
            {embargoActive
              ? 'CRITICAL EMBARGO: Major high-impact release imminent. Signals locked to prevent slippage.'
              : 'Market Volatility Status: ELEVATED. Gold reacts sharply to US CPI/PCE releases. Strict stop-loss recommended.'}
          </span>
        </div>

        <span className="font-mono text-[11px] bg-white px-2.5 py-0.5 rounded-md border border-slate-300 shadow-sm font-bold text-slate-700">
          Auto-Hedging Active
        </span>
      </div>

      {/* Filters Bar */}
      <div className={`px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
      }`}>
        {/* Currencies */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 mr-1 text-xs font-semibold">Currency:</span>
          {currencies.map((curr) => (
            <button
              key={curr}
              onClick={() => setSelectedCurrency(curr)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedCurrency === curr
                  ? 'bg-blue-600 text-white shadow-sm'
                  : (isLight ? 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200' : 'bg-[#1a2333] text-gray-300 border border-gray-800')
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Impact Folder Level */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-xs font-semibold">Impact:</span>
          <button
            onClick={() => setFilterImpact('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              filterImpact === 'ALL' 
                ? (isLight ? 'bg-slate-800 text-white' : 'bg-gray-700 text-white') 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterImpact('HIGH')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterImpact === 'HIGH' 
                ? 'bg-rose-600 text-white shadow-sm' 
                : 'text-rose-700 bg-rose-50 border border-rose-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            High / Red
          </button>
          <button
            onClick={() => setFilterImpact('MEDIUM')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              filterImpact === 'MEDIUM' 
                ? 'bg-amber-500 text-white shadow-sm' 
                : 'text-amber-800 bg-amber-50 border border-amber-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Medium / Orange
          </button>
        </div>
      </div>

      {/* Events List Table */}
      <div className={`flex-1 overflow-y-auto divide-y ${isLight ? 'divide-slate-200 bg-white' : 'divide-[#1e293b] bg-[#121824]'}`}>
        {filteredEvents.map((ev) => {
          const isHigh = ev.impact === 'HIGH';
          const isMedium = ev.impact === 'MEDIUM';

          return (
            <div key={ev.id} className={`p-4 transition-colors flex flex-col gap-2 ${
              isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161f30]'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* Impact Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono border ${
                      isHigh
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : isMedium
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }`}
                  >
                    {ev.impact}
                  </span>

                  {/* Currency */}
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                    {ev.currency}
                  </span>

                  {/* Time */}
                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {ev.time} ({ev.date})
                  </span>
                </div>

                {/* Effect on Gold */}
                <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md ${
                  ev.sentimentEffect.includes('BULLISH') 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : ev.sentimentEffect.includes('VOLATILE')
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {ev.sentimentEffect.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Event Name & Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{ev.event}</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">{ev.description}</p>
              </div>

              {/* Actual / Forecast / Previous numbers */}
              <div className={`grid grid-cols-3 gap-2 p-2.5 rounded-xl border font-mono text-xs text-center ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-gray-800'
              }`}>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-sans font-semibold">Actual</span>
                  <span className={`font-black ${
                    ev.actual === 'Pending' || ev.actual === 'Upcoming' ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {ev.actual}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-sans font-semibold">Forecast</span>
                  <span className="text-slate-800 font-bold">{ev.forecast}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-sans font-semibold">Previous</span>
                  <span className="text-slate-500 font-semibold">{ev.previous}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
