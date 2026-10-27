import React, { useState, useEffect } from 'react';
import { VolatilitySpikeAlert } from '../types/trading';
import { sounds } from '../utils/audio';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  MessageCircle, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  RefreshCw,
  Flame,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface VolatilitySpikeMonitorProps {
  currentPrice: number;
  symbol: string;
  userWhatsAppNumber: string;
  autoWhatsAppAlerts: boolean;
  onOpenWhatsAppConfig: () => void;
  spikeLogs: VolatilitySpikeAlert[];
  onNewSpikeDetected: (spike: VolatilitySpikeAlert, waUrl?: string) => void;
  audioMuted: boolean;
  theme?: 'light' | 'dark';
}

export const VolatilitySpikeMonitor: React.FC<VolatilitySpikeMonitorProps> = ({
  currentPrice,
  symbol,
  userWhatsAppNumber,
  autoWhatsAppAlerts,
  onOpenWhatsAppConfig,
  spikeLogs,
  onNewSpikeDetected,
  audioMuted,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // 1-Hour Moving Average Baseline and Rolling 1-Hour Standard Deviation for Gold
  const [ma1h, setMa1h] = useState<number>(4051.20);
  const [stdDev1h, setStdDev1h] = useState<number>(5.80);
  const [autoNotifyWhatsApp, setAutoNotifyWhatsApp] = useState<boolean>(true);
  const [lastAlertTime, setLastAlertTime] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [toastAlert, setToastAlert] = useState<{ spike: VolatilitySpikeAlert; waUrl?: string } | null>(null);

  // Calculate live statistical deviation metrics
  const deviation = Number((currentPrice - ma1h).toFixed(2));
  const zScore = Number((deviation / stdDev1h).toFixed(2));
  const absZ = Math.abs(zScore);
  const isSpikeActive = absZ >= 2.0;

  // 2-Sigma Upper and Lower Bollinger envelope boundaries
  const upperBand2Sigma = Number((ma1h + 2 * stdDev1h).toFixed(2)); // e.g. 4062.80
  const lowerBand2Sigma = Number((ma1h - 2 * stdDev1h).toFixed(2)); // e.g. 4039.60

  // Check and dispatch automated alert when threshold exceeded
  const evaluateAndDispatchAlert = async (testPrice?: number) => {
    const targetPrice = testPrice !== undefined ? testPrice : currentPrice;
    const currentDev = Number((targetPrice - ma1h).toFixed(2));
    const currentZ = Number((currentDev / stdDev1h).toFixed(2));

    if (Math.abs(currentZ) < 2.0) return;

    // 60-second de-bouncing cooldown to prevent spamming WhatsApp on continuous ticks
    const now = Date.now();
    if (testPrice === undefined && now - lastAlertTime < 60000) return;
    setLastAlertTime(now);

    setIsEvaluating(true);
    try {
      const res = await fetch('/api/volatility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          price: targetPrice,
          ma1h,
          stdDev1h,
          phoneNumber: userWhatsAppNumber,
          autoNotify: autoNotifyWhatsApp,
        }),
      });

      const data = await res.json();
      if (data.success && data.alert) {
        if (!audioMuted) sounds.playVolatilityAlarm();
        onNewSpikeDetected(data.alert, data.whatsappUrl);
        setToastAlert({ spike: data.alert, waUrl: data.whatsappUrl });

        // Auto-open WhatsApp deep link if auto-alert enabled
        if (autoNotifyWhatsApp && data.whatsappUrl && autoWhatsAppAlerts) {
          window.open(data.whatsappUrl, '_blank');
        }
      }
    } catch (err) {
      console.error('Volatility check failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Automated monitoring on live price updates
  useEffect(() => {
    if (isSpikeActive) {
      evaluateAndDispatchAlert();
    }
  }, [currentPrice, isSpikeActive]);

  // Simulation handlers for testing
  const handleSimulateSurge = () => {
    const surgePrice = 4065.50; // +2.46σ above 4051.20
    evaluateAndDispatchAlert(surgePrice);
  };

  const handleSimulatePlunge = () => {
    const plungePrice = 4037.20; // -2.41σ below 4051.20
    evaluateAndDispatchAlert(plungePrice);
  };

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border flex flex-col h-full transition-all ${
      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#121824] border-[#232f45] text-slate-100'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight 
          ? 'bg-slate-50 border-slate-200' 
          : 'bg-gradient-to-r from-rose-950/40 via-[#172033] to-[#121824] border-[#232f45]'
      }`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-200 text-rose-600">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                Real-Time Volatility Spike Monitor (&gt; 2σ)
              </h3>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                isSpikeActive 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : absZ >= 1.5 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {isSpikeActive ? 'CRITICAL SPIKE ACTIVE' : absZ >= 1.5 ? 'ELEVATED DEVIATION' : 'NORMAL RANGE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Automated 1-Hour Moving Average 2-Standard Deviation anomaly detector with instant WhatsApp dispatch
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => sounds.playVolatilityAlarm()}
            className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all font-semibold ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm' 
                : 'bg-[#1a2333] hover:bg-[#223049] text-gray-400 border-gray-700'
            }`}
            title="Test Siren Chime"
          >
            <Zap className="w-4 h-4 text-rose-500" />
            <span>Test Alarm</span>
          </button>

          <button
            onClick={onOpenWhatsAppConfig}
            className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all font-mono font-bold ${
              isLight 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm' 
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-transparent" />
            <span>WA: {userWhatsAppNumber ? userWhatsAppNumber.slice(-4) : 'Config'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Volatility Deviation KPI Bar */}
      <div className={`p-4 border-b grid grid-cols-2 md:grid-cols-5 gap-3 ${
        isLight ? 'bg-slate-50/60 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
      }`}>
        {/* Spot Price */}
        <div className={`p-3 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">XAU/USD Spot</span>
          <span className="text-lg font-black font-mono text-slate-900 mt-0.5 block">
            ${currentPrice.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Live Tick Feed</span>
        </div>

        {/* 1-Hour Moving Average */}
        <div className={`p-3 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800'
        }`}>
          <span className="text-[10px] uppercase font-bold text-blue-600 block">1H Moving Average</span>
          <span className="text-lg font-black font-mono text-blue-800 mt-0.5 block">
            ${ma1h.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Rolling Baseline</span>
        </div>

        {/* 1H Standard Deviation */}
        <div className={`p-3 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800'
        }`}>
          <span className="text-[10px] uppercase font-bold text-amber-700 block">1H Std Dev (1σ)</span>
          <span className="text-lg font-black font-mono text-amber-800 mt-0.5 block">
            ${stdDev1h.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">2σ = ${(2 * stdDev1h).toFixed(2)}</span>
        </div>

        {/* Absolute Deviation from MA1H */}
        <div className={`p-3 rounded-xl border ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800'
        }`}>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Deviation (Δ)</span>
          <span className={`text-lg font-black font-mono mt-0.5 block ${deviation >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {deviation >= 0 ? `+$${deviation.toFixed(2)}` : `-$${Math.abs(deviation).toFixed(2)}`}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {deviation >= 0 ? 'Above 1H MA' : 'Below 1H MA'}
          </span>
        </div>

        {/* Live Z-Score Gauge */}
        <div className={`p-3 rounded-xl border ${
          isSpikeActive
            ? 'bg-rose-50 border-rose-300 shadow-sm'
            : absZ >= 1.5
            ? 'bg-amber-50 border-amber-300'
            : (isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#172030] border-gray-800')
        } col-span-2 md:col-span-1`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-600">Z-Score Deviation</span>
            <span className="text-[9px] font-mono text-slate-400 font-semibold">Target: &gt; 2.0σ</span>
          </div>
          <span className={`text-xl font-black font-mono mt-0.5 block ${
            isSpikeActive ? 'text-rose-600 animate-pulse' : absZ >= 1.5 ? 'text-amber-700' : 'text-emerald-700'
          }`}>
            {zScore > 0 ? `+${zScore}` : zScore}σ
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {isSpikeActive ? 'Threshold Breached!' : 'Within 95% Normal Band'}
          </span>
        </div>
      </div>

      {/* Visual Z-Score Deviation Meter & Envelope Boundaries */}
      <div className={`p-4 border-b space-y-3 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#141b29] border-[#1e293b]'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" />
            2σ Bollinger Envelope Spread:
          </span>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-rose-600 font-bold">-2σ Floor: ${lowerBand2Sigma}</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700 font-bold">1H MA: ${ma1h.toFixed(2)}</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">+2σ Ceiling: ${upperBand2Sigma}</span>
          </div>
        </div>

        {/* Gauge Progress Bar */}
        <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          {/* Center 1H MA marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-blue-500 z-10" />

          {/* Safe Green Zone (-1.5σ to +1.5σ) */}
          <div className="absolute top-0 bottom-0 left-[20%] right-[20%] bg-emerald-200/50" />

          {/* Elevated Yellow Zones */}
          <div className="absolute top-0 bottom-0 left-[10%] right-[80%] bg-amber-300/50" />
          <div className="absolute top-0 bottom-0 left-[80%] right-[10%] bg-amber-300/50" />

          {/* Danger Red Spike Zones (< -2σ or > +2σ) */}
          <div className="absolute top-0 bottom-0 left-0 right-[90%] bg-rose-400/60" />
          <div className="absolute top-0 bottom-0 left-[90%] right-0 bg-rose-400/60" />

          {/* Current Position Pointer */}
          <div
            className={`absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full shadow-lg transition-all duration-300 z-20 ${
              isSpikeActive ? 'bg-rose-600 ring-2 ring-rose-200' : 'bg-blue-600 ring-2 ring-blue-200'
            }`}
            style={{
              left: `${Math.min(Math.max(50 + (zScore / 3) * 50, 2), 98)}%`,
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-slate-500 font-semibold">
          <span>-3.0σ (Extreme Oversold)</span>
          <span>-2.0σ Trigger</span>
          <span className="text-blue-700 font-bold">1H MA (0.0σ)</span>
          <span>+2.0σ Trigger</span>
          <span>+3.0σ (Extreme Overbought)</span>
        </div>
      </div>

      {/* Automated WhatsApp Notification Settings & Simulation Controls */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
      }`}>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoNotifyWhatsApp}
              onChange={(e) => setAutoNotifyWhatsApp(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span className="text-slate-800 font-bold flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              Automated WhatsApp Alert on &gt; 2σ Breach
            </span>
          </label>

          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-600 font-mono text-xs hidden sm:inline">
            Active Receiver: <span className="font-bold text-slate-900">{userWhatsAppNumber || 'Not Set'}</span>
          </span>
        </div>

        {/* Simulation Buttons to instantly test the 2-Sigma Automated WhatsApp Pipeline */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Test Trigger:</span>
          <button
            onClick={handleSimulateSurge}
            disabled={isEvaluating}
            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded-lg font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Simulate sudden Bullish Surge to $4,065.50 (+2.46σ)"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-700" />
            Simulate +2.46σ Surge
          </button>

          <button
            onClick={handleSimulatePlunge}
            disabled={isEvaluating}
            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg font-bold font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Simulate sudden Bearish Plunge to $4,037.20 (-2.41σ)"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-700" />
            Simulate -2.41σ Plunge
          </button>
        </div>
      </div>

      {/* Active Spike Banner Toast Notification */}
      {toastAlert && (
        <div className="bg-rose-50 border-b border-rose-200 p-3.5 flex flex-wrap items-center justify-between gap-2 animate-fade-in text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
            <div>
              <span className="font-extrabold text-rose-900 block">
                🚨 VOLATILITY SPIKE ALERT: {toastAlert.spike.direction.replace(/_/g, ' ')} ({toastAlert.spike.zScore > 0 ? '+' : ''}{toastAlert.spike.zScore}σ)
              </span>
              <span className="text-rose-700 text-xs font-medium">
                Gold deviated ${toastAlert.spike.deviation.toFixed(2)} from 1H MA ($4,051.20). Automated WhatsApp signal payload prepared!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {toastAlert.waUrl && (
              <a
                href={toastAlert.waUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-white text-transparent" />
                <span>Open in WhatsApp</span>
              </a>
            )}
            <button
              onClick={() => setToastAlert(null)}
              className="text-slate-500 hover:text-slate-800 px-2 py-1 font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Historical Spike Logs Table */}
      <div className="flex-1 overflow-y-auto">
        <div className={`p-3 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
        }`}>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Volatility Spike Event Logs (Historical Anomalies)
          </h4>
          <span className="text-xs text-slate-500 font-mono font-medium">
            {spikeLogs.length} Logged Spikes
          </span>
        </div>

        <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
          <thead className={`text-[10px] uppercase tracking-wider font-mono border-b sticky top-0 ${
            isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-[#0f141f] text-gray-400 border-[#1e293b]'
          }`}>
            <tr>
              <th className="py-2.5 px-3">Event ID</th>
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Trigger Price</th>
              <th className="py-2.5 px-3">1H MA</th>
              <th className="py-2.5 px-3">Deviation (Δ)</th>
              <th className="py-2.5 px-3">Z-Score</th>
              <th className="py-2.5 px-3">Spike Type</th>
              <th className="py-2.5 px-3">WhatsApp</th>
              <th className="py-2.5 px-3">Algorithm Action Advice</th>
            </tr>
          </thead>
          <tbody className={`divide-y font-mono ${isLight ? 'divide-slate-200' : 'divide-[#1e293b]'}`}>
            {spikeLogs.map((log) => (
              <tr key={log.id} className={isLight ? 'hover:bg-slate-50 transition-colors' : 'hover:bg-[#161f30] transition-colors'}>
                <td className="py-2.5 px-3 text-slate-500 font-bold">{log.id}</td>
                <td className="py-2.5 px-3 font-bold text-slate-900">{log.symbol}</td>
                <td className="py-2.5 px-3 text-slate-900 font-bold">${log.price.toFixed(2)}</td>
                <td className="py-2.5 px-3 text-blue-700 font-semibold">${log.ma1h.toFixed(2)}</td>
                <td className="py-2.5 px-3">
                  <span className={log.deviation >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                    {log.deviation >= 0 ? `+$${log.deviation.toFixed(2)}` : `-$${Math.abs(log.deviation).toFixed(2)}`}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                    {log.zScore > 0 ? `+${log.zScore}` : log.zScore}σ
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.direction === 'UPWARD_SURGE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {log.direction.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    DISPATCHED
                  </span>
                </td>
                <td className="py-2.5 px-3 text-slate-600 font-sans text-xs truncate max-w-[220px]">
                  {log.actionAdvice}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
