import React, { useState } from 'react';
import { TradeLog, PriceAlert } from '../types/trading';
import { 
  ShieldAlert, 
  Calculator, 
  Bell, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Volume2,
  DollarSign,
  Percent
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface RiskManagementDashboardProps {
  trades: TradeLog[];
  currentPrice: number;
  alerts: PriceAlert[];
  onAddAlert: (targetPrice: number, condition: 'ABOVE' | 'BELOW') => void;
  onDeleteAlert: (id: string) => void;
  accountBalance: number;
  setAccountBalance: (val: number) => void;
  theme?: 'light' | 'dark';
}

export const RiskManagementDashboard: React.FC<RiskManagementDashboardProps> = ({
  trades,
  currentPrice,
  alerts,
  onAddAlert,
  onDeleteAlert,
  accountBalance,
  setAccountBalance,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // Calculator state
  const [riskPercent, setRiskPercent] = useState<number>(1.5);
  const [slPips, setSlPips] = useState<number>(100);

  // New Alert state
  const [newAlertPrice, setNewAlertPrice] = useState<number>(Math.round(currentPrice + 10));
  const [newAlertCondition, setNewAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  // Calculate lot size based on strict risk math
  const maxLossAllowed = (accountBalance * (riskPercent / 100));
  const calculatedLotSize = Number((maxLossAllowed / Math.max(slPips * 10, 10)).toFixed(2));

  // Compute total PnL from trades
  const totalPnL = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const winTrades = trades.filter((t) => t.pnl > 0).length;
  const winRate = trades.length > 0 ? ((winTrades / trades.length) * 100).toFixed(1) : '100';

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertPrice) return;
    sounds.playPriceAlert();
    onAddAlert(Number(newAlertPrice), newAlertCondition);
  };

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
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">Risk Management & Trade History Dashboard</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                Capital Protection Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Discipline calculator, trade execution logs & real-time price sound alerts
            </p>
          </div>
        </div>

        {/* Account Balance Widget */}
        <div className={`flex items-center gap-3 px-3.5 py-1.5 rounded-xl border text-xs ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e131d] border-gray-800'
        }`}>
          <div>
            <span className="text-[10px] uppercase text-slate-500 block font-mono font-semibold">Account Balance</span>
            <span className="text-sm font-extrabold font-mono text-slate-900">
              ${accountBalance.toLocaleString()}
            </span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="text-[10px] uppercase text-slate-500 block font-mono font-semibold">Net Realized P&L</span>
            <span className={`text-sm font-black font-mono ${totalPnL >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {totalPnL >= 0 ? `+$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`}
            </span>
          </div>
        </div>
      </div>

      <div className={`p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 border-b ${
        isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
      }`}>
        {/* 1. Position Sizing Calculator */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Position Size Calculator
              </h4>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">Risk Protection</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-semibold text-xs block mb-1">Risk Percentage per Trade:</label>
                <div className="flex items-center gap-2">
                  {[1, 1.5, 2, 3].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRiskPercent(r)}
                      className={`flex-1 py-1.5 rounded-lg font-mono font-bold text-xs transition-all ${
                        riskPercent === r
                          ? 'bg-blue-600 text-white shadow-sm'
                          : (isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-[#0f141f] text-gray-300 border border-gray-700')
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 text-xs mb-1 font-semibold">
                  <span>Stop Loss Buffer:</span>
                  <span className="font-mono text-slate-900 font-bold">{slPips} pips ($10.00 / oz)</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="10"
                  value={slPips}
                  onChange={(e) => setSlPips(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-3 border-t p-3 rounded-lg border flex items-center justify-between ${
            isLight ? 'border-slate-100 bg-slate-50' : 'border-gray-800 bg-[#0f141f]'
          }`}>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-semibold">Max Risk $</span>
              <span className="text-sm font-bold font-mono text-rose-600">-${maxLossAllowed.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-mono font-semibold">Recommended Lots</span>
              <span className="text-lg font-black font-mono text-emerald-700">{calculatedLotSize} Lots</span>
            </div>
          </div>
        </div>

        {/* 2. Real-Time Price Alerts Tool */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-blue-600" />
                Real-Time Price Alerts
              </h4>
              <button
                onClick={() => sounds.playPriceAlert()}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
                title="Test Audio Chime"
              >
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                Test Sound
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-2 text-xs">
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.10"
                  value={newAlertPrice}
                  onChange={(e) => setNewAlertPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Target Price (e.g. 4065.00)"
                  className={`flex-1 px-3 py-1.5 rounded-lg border font-mono text-xs focus:outline-none ${
                    isLight 
                      ? 'bg-slate-50 text-slate-900 border-slate-200 focus:border-blue-500 focus:bg-white' 
                      : 'bg-[#0f141f] text-white border-gray-700'
                  }`}
                />
                <select
                  value={newAlertCondition}
                  onChange={(e) => setNewAlertCondition(e.target.value as any)}
                  className={`px-2 py-1.5 rounded-lg border font-mono text-xs ${
                    isLight ? 'bg-slate-50 text-slate-900 border-slate-200' : 'bg-[#0f141f] text-white border-gray-700'
                  }`}
                >
                  <option value="ABOVE">≥ Crosses Above</option>
                  <option value="BELOW">≤ Drops Below</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Active Alerts List */}
          <div className="mt-3 max-h-[105px] overflow-y-auto space-y-1.5 pr-1">
            {alerts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-2">
                No active alerts set. Set an alert for Gold breakouts!
              </p>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-mono ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[#0f141f] border-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={al.triggered ? 'text-slate-400 line-through' : 'text-slate-900 font-bold'}>
                      {al.symbol} {al.condition === 'ABOVE' ? '≥' : '≤'} ${al.targetPrice.toFixed(2)}
                    </span>
                    {al.triggered && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded">Triggered</span>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteAlert(al.id)}
                    className="text-slate-400 hover:text-rose-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Account Performance Stats */}
        <div className={`p-4 rounded-xl border flex flex-col justify-between ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-600" />
              Journal Stats
            </h4>
            <span className="text-xs font-mono text-slate-500 font-semibold">{trades.length} Executed Trades</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f141f] border-gray-800'}`}>
              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Win Rate</span>
              <span className="text-base font-black text-emerald-700">{winRate}%</span>
            </div>
            <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f141f] border-gray-800'}`}>
              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Total Trades</span>
              <span className="text-base font-black text-slate-900">{trades.length}</span>
            </div>
            <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f141f] border-gray-800'}`}>
              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Winning Trades</span>
              <span className="text-base font-black text-emerald-700">{winTrades}</span>
            </div>
            <div className={`p-2.5 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f141f] border-gray-800'}`}>
              <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold block">Current Spot</span>
              <span className="text-base font-black text-amber-700">${currentPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade History Log Table */}
      <div className="flex-1 overflow-y-auto">
        <div className={`p-3 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
        }`}>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-amber-600" />
            Trade History & Realized Logs
          </h4>
          <span className="text-xs text-slate-500 font-mono font-medium">Real-time terminal execution</span>
        </div>

        <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
          <thead className={`text-[10px] uppercase tracking-wider font-mono border-b sticky top-0 ${
            isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-[#0f141f] text-gray-400 border-[#1e293b]'
          }`}>
            <tr>
              <th className="py-2.5 px-3">Trade ID</th>
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Lot Size</th>
              <th className="py-2.5 px-3">Entry Price</th>
              <th className="py-2.5 px-3">Exit Price</th>
              <th className="py-2.5 px-3">Pips</th>
              <th className="py-2.5 px-3">P&L ($)</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Confluence / Notes</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-mono ${isLight ? 'divide-slate-200 bg-white' : 'divide-[#1e293b]'}`}>
            {trades.map((tr) => (
              <tr key={tr.id} className={isLight ? 'hover:bg-slate-50 transition-colors' : 'hover:bg-[#161f30] transition-colors'}>
                <td className="py-2.5 px-3 text-slate-500 font-bold">{tr.id}</td>
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
                <td className="py-2.5 px-3 font-semibold">{tr.lotSize}</td>
                <td className="py-2.5 px-3 font-semibold">${tr.entryPrice.toFixed(2)}</td>
                <td className="py-2.5 px-3 font-semibold">
                  {tr.exitPrice ? `$${tr.exitPrice.toFixed(2)}` : 'Open'}
                </td>
                <td className="py-2.5 px-3 font-bold">
                  <span className={tr.pips >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {tr.pips >= 0 ? `+${tr.pips}` : tr.pips}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-black">
                  <span className={tr.pnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                    {tr.pnl >= 0 ? `+$${tr.pnl.toFixed(2)}` : `-$${Math.abs(tr.pnl).toFixed(2)}`}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    tr.status === 'CLOSED_PROFIT'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : tr.status === 'STOP_LOSS_HIT'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                  }`}>
                    {tr.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600 font-sans text-xs truncate max-w-[200px]">
                  {tr.signalReason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
