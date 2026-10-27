import React, { useState } from 'react';
import { NewsItem } from '../types/trading';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Flame, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Globe2,
  TrendingUp,
  Info
} from 'lucide-react';

interface GlobalNewsFilterProps {
  news: NewsItem[];
  fakeCount: number;
  theme?: 'light' | 'dark';
}

export const GlobalNewsFilter: React.FC<GlobalNewsFilterProps> = ({
  news,
  fakeCount,
  theme = 'light',
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'VERIFIED' | 'FILTERED_RUMORS'>('ALL');
  const isLight = theme === 'light';

  const filteredList = news.filter((item) => {
    if (activeTab === 'VERIFIED') return !item.isFake;
    if (activeTab === 'FILTERED_RUMORS') return item.isFake;
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
          <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-200 text-blue-600">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Global Market News & Fake Report Filter</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800 border border-purple-300 font-bold">
                AI Source Verification
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Eliminates panic traps, unverified telegram rumors & liquidity bait
            </p>
          </div>
        </div>

        {/* Fake Filter Stat Badge */}
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-rose-700 shadow-sm">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>{fakeCount} Fake Traps Filtered Today</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`px-4 py-2.5 border-b flex items-center justify-between ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
      }`}>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'ALL'
                ? (isLight ? 'bg-blue-600 text-white shadow-sm' : 'bg-amber-500 text-black')
                : (isLight ? 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200' : 'text-gray-400 hover:text-white bg-[#1a2333]')
            }`}
          >
            All Reports ({news.length})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'VERIFIED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : (isLight ? 'text-emerald-700 hover:bg-emerald-50 bg-white border border-slate-200' : 'text-emerald-400 bg-[#1a2333]')
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Clean ({news.filter((n) => !n.isFake).length})
          </button>
          <button
            onClick={() => setActiveTab('FILTERED_RUMORS')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'FILTERED_RUMORS'
                ? 'bg-rose-600 text-white shadow-sm'
                : (isLight ? 'text-rose-700 hover:bg-rose-50 bg-white border border-slate-200' : 'text-rose-400 bg-[#1a2333]')
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Filtered Fake Rumors ({news.filter((n) => n.isFake).length})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Continuous AI Web & Tape Audit
        </span>
      </div>

      {/* News Feed Items */}
      <div className={`flex-1 overflow-y-auto divide-y ${isLight ? 'divide-slate-200 bg-white' : 'divide-[#1e293b] bg-[#121824]'}`}>
        {filteredList.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-4 transition-all ${
                item.isFake 
                  ? (isLight ? 'bg-rose-50/50 hover:bg-rose-50' : 'bg-rose-950/15 hover:bg-rose-950/25') 
                  : (isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161f30]')
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {/* Status Flag */}
                  {item.isFake ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      FAKE REPORT BLOCKED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      VERIFIED TIER-1
                    </span>
                  )}

                  {/* Source */}
                  <span className="text-xs font-bold text-slate-700">
                    {item.source}
                  </span>
                  <span className="text-slate-400 text-xs">·</span>
                  <span className="text-xs text-slate-500 font-mono font-medium">{item.time}</span>
                </div>

                {/* Credibility Score Pill */}
                <div className="flex items-center gap-1 font-mono text-xs">
                  <span className="text-slate-500 text-[10px] font-semibold">Credibility:</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded-md text-[11px] ${
                      item.credibility > 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.credibility > 50
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.credibility}%
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h4
                className={`text-sm font-bold leading-snug ${
                  item.isFake ? 'text-rose-800 line-through decoration-rose-500 decoration-2' : 'text-slate-900'
                }`}
              >
                {item.headline}
              </h4>

              {/* Summary */}
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{item.summary}</p>

              {/* Verification & Fake Filter Notes */}
              <div
                className={`mt-2.5 p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
                  item.isFake
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <Info className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${item.isFake ? 'text-rose-600' : 'text-blue-600'}`} />
                <span>
                  <strong className={item.isFake ? 'text-rose-900 font-bold' : 'text-slate-900 font-bold'}>
                    AI Audit Verdict:{' '}
                  </strong>
                  {item.verificationNotes}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
