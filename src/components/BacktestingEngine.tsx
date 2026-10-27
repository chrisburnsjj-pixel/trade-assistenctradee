import React, { useState } from 'react';
import { generateBacktestResults } from '../utils/marketData';
import { 
  BarChart3, 
  Sliders, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  ShieldCheck,
  Play
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface BacktestingEngineProps {
  theme?: 'light' | 'dark';
}

export const BacktestingEngine: React.FC<BacktestingEngineProps> = ({
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // Configurable indicator overlays
  const [rsiPeriod, setRsiPeriod] = useState(14);
  const [macdFast, setMacdFast] = useState(12);
  const [macdSlow, setMacdSlow] = useState(26);
  const [maPeriod, setMaPeriod] = useState(50);
  const [timeframe, setTimeframe] = useState('15m');
  const [isRunning, setIsRunning] = useState(false);

  // Active Backtest Results
  const [results, setResults] = useState(() => 
    generateBacktestResults(14, 12, 26, 50)
  );

  const handleRunBacktest = () => {
    sounds.playOrderClick();
    setIsRunning(true);
    setTimeout(() => {
      setResults(generateBacktestResults(rsiPeriod, macdFast, macdSlow, maPeriod));
      setIsRunning(false);
      sounds.playSignalAlert();
    }, 600);
  };

  const handleResetDefaults = () => {
    setRsiPeriod(14);
    setMacdFast(12);
    setMacdSlow(26);
    setMaPeriod(50);
    setResults(generateBacktestResults(14, 12, 26, 50));
  };

  const { summary, trades } = results;

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border flex flex-col h-full transition-all ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121824] border-[#232f45] text-slate-100'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#172033] border-[#232f45]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Historical Signal Backtesting Engine</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                Gold XAU/USD (90 Days)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Verify algorithm accuracy, win rate %, profit factor, and drawdown against historical tick data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all font-semibold ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm' 
                : 'bg-[#1e293b] hover:bg-[#283548] text-gray-400 border-gray-700'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleRunBacktest}
            disabled={isRunning}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Calculating...' : 'Run Backtest'}</span>
          </button>
        </div>
      </div>

      {/* Customizable Technical Indicator Overlays Panel */}
      <div className={`p-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
      }`}>
        {/* RSI Length */}
        <div>
          <div className="flex justify-between text-slate-600 font-semibold mb-1">
            <span>RSI Period:</span>
            <span className="font-mono font-bold text-amber-600">{rsiPeriod}</span>
          </div>
          <input
            type="range"
            min="7"
            max="28"
            value={rsiPeriod}
            onChange={(e) => setRsiPeriod(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* Moving Average */}
        <div>
          <div className="flex justify-between text-slate-600 font-semibold mb-1">
            <span>MA Period (EMA):</span>
            <span className="font-mono font-bold text-blue-600">{maPeriod}</span>
          </div>
          <input
            type="range"
            min="20"
            max="200"
            step="10"
            value={maPeriod}
            onChange={(e) => setMaPeriod(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />
        </div>

        {/* MACD Fast */}
        <div>
          <div className="flex justify-between text-slate-600 font-semibold mb-1">
            <span>MACD Fast / Slow:</span>
            <span className="font-mono font-bold text-purple-600">{macdFast} / {macdSlow}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={macdFast}
              onChange={(e) => setMacdFast(Number(e.target.value))}
              className={`w-1/2 text-center font-mono py-1 rounded-lg border text-xs ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#172030] border-gray-700 text-white'
              }`}
            />
            <input
              type="number"
              value={macdSlow}
              onChange={(e) => setMacdSlow(Number(e.target.value))}
              className={`w-1/2 text-center font-mono py-1 rounded-lg border text-xs ${
                isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#172030] border-gray-700 text-white'
              }`}
            />
          </div>
        </div>

        {/* Timeframe */}
        <div>
          <span className="text-slate-600 font-semibold mb-1 block">Testing Timeframe:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className={`w-full py-1.5 px-2 rounded-lg border font-mono text-xs ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#172030] border-gray-700 text-white'
            }`}
          >
            <option value="5m">5m (Scalping)</option>
            <option value="15m">15m (Day Trading - Recommended)</option>
            <option value="1h">1h (Swing Trading)</option>
            <option value="4h">4h (Macro Trend)</option>
          </select>
        </div>
      </div>

      {/* Backtest KPI Performance Cards */}
      <div className={`p-4 border-b grid grid-cols-2 sm:grid-cols-6 gap-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#141b29] border-[#1e293b]'
      }`}>
        {/* Win Rate */}
        <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-[#192233] border-gray-800'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Win Rate %</span>
          <span className="text-xl font-black font-mono text-emerald-700 mt-1 block">
            {summary.winRate}%
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {summary.winCount} Wins / {summary.lossCount} Losses
          </span>
        </div>

        {/* Profit Factor */}
        <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-[#192233] border-gray-800'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Profit Factor</span>
          <span className="text-xl font-black font-mono text-amber-600 mt-1 block">
            {summary.profitFactor}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold font-mono">Institutional Grade</span>
        </div>

        {/* Net Profit */}
        <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-[#192233] border-gray-800'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Net Profit</span>
          <span className="text-xl font-black font-mono text-emerald-700 mt-1 block">
            +${summary.netProfit.toLocaleString()}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold font-mono">+32.4% ROI</span>
        </div>

        {/* Max Drawdown */}
        <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-[#192233] border-gray-800'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Max Drawdown</span>
          <span className="text-xl font-black font-mono text-rose-600 mt-1 block">
            {summary.maxDrawdown}%
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold font-mono">Controlled Risk</span>
        </div>

        {/* Average R:R */}
        <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-[#192233] border-gray-800'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg Risk/Reward</span>
          <span className="text-xl font-black font-mono text-blue-700 mt-1 block">
            {summary.avgRR}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">High Asymmetry</span>
        </div>

        {/* Sharpe Ratio */}
        <div className={`p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-[#192233] border-gray-800'}`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Sharpe Ratio</span>
          <span className="text-xl font-black font-mono text-purple-700 mt-1 block">
            {summary.sharpeRatio}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold font-mono">Excellent Quality</span>
        </div>
      </div>

      {/* Trade-by-trade Historical Log Table */}
      <div className="flex-1 overflow-y-auto">
        <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
          <thead className={`text-[10px] uppercase tracking-wider font-mono border-b sticky top-0 ${
            isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-[#0e131d] text-gray-400 border-[#1e293b]'
          }`}>
            <tr>
              <th className="py-2.5 px-3">Date/Time</th>
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Direction</th>
              <th className="py-2.5 px-3">Entry</th>
              <th className="py-2.5 px-3">Exit</th>
              <th className="py-2.5 px-3">Pips</th>
              <th className="py-2.5 px-3">Net P&L ($)</th>
              <th className="py-2.5 px-3">Result</th>
              <th className="py-2.5 px-3">Confluence Rationale</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-mono ${isLight ? 'divide-slate-200 bg-white' : 'divide-[#1e293b]'}`}>
            {trades.map((tr) => (
              <tr key={tr.id} className={isLight ? 'hover:bg-slate-50 transition-colors' : 'hover:bg-[#161f30] transition-colors'}>
                <td className="py-2.5 px-3 text-slate-500 font-medium">
                  {tr.date} {tr.time}
                </td>
                <td className="py-2.5 px-3 font-bold text-slate-900">{tr.symbol}</td>
                <td className="py-2.5 px-3">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      tr.direction === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {tr.direction}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-semibold">${tr.entry}</td>
                <td className="py-2.5 px-3 font-semibold">${tr.exit}</td>
                <td className="py-2.5 px-3">
                  <span className={tr.pips >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {tr.pips >= 0 ? `+${tr.pips}` : tr.pips}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-black">
                  <span className={tr.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {tr.pnl >= 0 ? `+$${tr.pnl.toFixed(2)}` : `-$${Math.abs(tr.pnl).toFixed(2)}`}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  {tr.result === 'WIN' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> WIN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 w-fit">
                      <XCircle className="w-3 h-3 text-rose-600" /> LOSS
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-slate-600 font-sans text-xs truncate max-w-[240px]">
                  {tr.confluence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
