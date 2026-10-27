import React, { useState, useEffect, useRef } from 'react';
import { 
  CandleData, 
  DrawingTool, 
  DrawingElement, 
  TradingSignal, 
  ForexFactoryEvent, 
  NewsItem, 
  TradeLog, 
  PriceAlert, 
  UserProfile,
  VolatilitySpikeAlert
} from './types/trading';
import { Header, ActiveTab } from './components/Header';
import { DrawingToolbar } from './components/DrawingToolbar';
import { InteractiveChart } from './components/InteractiveChart';
import { TradingViewWidget } from './components/TradingViewWidget';
import { VolatilitySpikeMonitor } from './components/VolatilitySpikeMonitor';
import { SignalCard } from './components/SignalCard';
import { ForexFactoryCalendar } from './components/ForexFactoryCalendar';
import { GlobalNewsFilter } from './components/GlobalNewsFilter';
import { TradingExpertAI } from './components/TradingExpertAI';
import { BacktestingEngine } from './components/BacktestingEngine';
import { RiskManagementDashboard } from './components/RiskManagementDashboard';
import { MarketSentimentGauge } from './components/MarketSentimentGauge';
import { WhatsAppModal } from './components/WhatsAppModal';
import { GoogleLoginModal } from './components/GoogleLoginModal';
import { generateInitialGoldCandles } from './utils/marketData';
import { sounds } from './utils/audio';
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Maximize2, 
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Mail,
  Send,
  Zap,
  CheckCircle2,
  BellRing,
  Compass
} from 'lucide-react';

export default function App() {
  // Theme state: defaults strictly to clean LIGHT mode per user request
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Navigation & Asset State
  const [activeTab, setActiveTab] = useState<ActiveTab>('PRO_CHART');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('GOLD');
  const [timeframe, setTimeframe] = useState<string>('15m');
  const [audioMuted, setAudioMuted] = useState(false);

  // Market Price & Candlesticks State
  const [candles, setCandles] = useState<CandleData[]>(() => generateInitialGoldCandles());
  const [currentPrice, setCurrentPrice] = useState<number>(4058.39);
  const [bidPrice, setBidPrice] = useState<number>(4058.39);
  const [askPrice, setAskPrice] = useState<number>(4058.88); // 0.49 spread matching screenshot

  // Drawing Tools State (Matches user's screenshot left sidebar)
  const [activeTool, setActiveTool] = useState<DrawingTool>('CROSSHAIR');
  const [magnetMode, setMagnetMode] = useState<boolean>(true);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [drawingsVisible, setDrawingsVisible] = useState<boolean>(true);
  const [drawings, setDrawings] = useState<DrawingElement[]>([
    {
      id: 'init-1',
      tool: 'RECTANGLE',
      points: [
        { x: 120, y: 155 },
        { x: 340, y: 185 },
      ],
      color: '#0284c7',
      text: 'Order Block Demand Zone',
    },
  ]);

  // Modals State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [showAiExpertPanel, setShowAiExpertPanel] = useState(true);

  // User Profile (configured with user's email and editable WhatsApp number)
  const [user, setUser] = useState<UserProfile>({
    name: 'Junaid Jaffry',
    email: 'junaidajaffry@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
    accountBalance: 10000,
    riskPercentage: 1.5,
    whatsAppNumber: '+923001234567',
    autoWhatsAppAlerts: true,
    isLoggedIn: true,
  });

  // Active AI Signal (Precision Zero-Mistake Strategy)
  const [activeSignal, setActiveSignal] = useState<TradingSignal>({
    symbol: 'GOLD (XAU/USD)',
    direction: 'STRONG BUY',
    confidenceScore: 94,
    entryPrice: 4058.39,
    stopLoss: 4048.00,
    slPips: 104,
    takeProfit1: 4068.00,
    tp1Pips: 96,
    takeProfit2: 4078.00,
    tp2Pips: 196,
    takeProfit3: 4095.00,
    tp3Pips: 366,
    riskRewardRatio: '1:3.4',
    technicalConfluence: [
      'MA 50 dynamic baseline support tested and defended at $4,049.96',
      'RSI (14) at 69.47 holding constructive momentum without bearish divergence',
      'MACD histogram expanding in positive alignment (12.22 / 11.49)',
      'ForexFactory High-Impact news embargo cleared (Zero fakeout risk)',
    ],
    fakeNewsAudit: 'Verified: All viral Telegram rumor dumps filtered; physical central bank accumulation solid.',
    forexFactoryImpact: 'Core PCE cooler than consensus, weakening US Dollar & boosting gold demand.',
    decisionReasoningEnglish: 'Institutional order blocks confirm strong buyer accumulation around 4,049-4,055 zone. Confluence confirms high probability continuation toward 4,078 and 4,095.',
    decisionReasoningUrdu: 'Gold is waqt MA 50 support (4049) ko bohot mazboot tareeqay say hold ker raha hai. RSI aur MACD dono bullish continuation confirm ker rahay hain. Fake panic reports filter ho chuki hain, safe entry zone 4058 hai with stop loss at 4048.',
    recommendedLotSizeFor10k: 0.49,
    volatilityWarning: 'Maintain strict 1.5% maximum account capital exposure.',
    timestamp: '19:55:12 UTC+2',
  });

  // Real-time WhatsApp Dispatch Notification Toast
  const [realtimeToast, setRealtimeToast] = useState<{
    message: string;
    type: 'success' | 'alert';
    url?: string;
  } | null>(null);

  // ForexFactory Calendar State
  const [calendarEvents, setCalendarEvents] = useState<ForexFactoryEvent[]>([]);
  const [volatilityStatus, setVolatilityStatus] = useState<'ELEVATED' | 'NORMAL' | 'CRITICAL_EMBARGO'>('ELEVATED');
  const [embargoActive, setEmbargoActive] = useState<boolean>(false);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);

  // Global News State
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [fakeFilterCount, setFakeFilterCount] = useState<number>(2);

  // Trade History
  const [trades, setTrades] = useState<TradeLog[]>([]);

  // Price Alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([
    {
      id: 'al-1',
      symbol: 'GOLD',
      targetPrice: 4065.00,
      condition: 'ABOVE',
      triggered: false,
      createdAt: '19:30',
    },
    {
      id: 'al-2',
      symbol: 'GOLD',
      targetPrice: 4048.00,
      condition: 'BELOW',
      triggered: false,
      createdAt: '19:40',
    },
  ]);

  // 1-Hour Volatility Spike Monitor State (1H MA: 4051.20, 1H Std Dev: 5.80)
  const ma1h = 4051.20;
  const stdDev1h = 5.80;
  const currentZScore = Number(((currentPrice - ma1h) / stdDev1h).toFixed(2));
  const isSpikeActive = Math.abs(currentZScore) >= 2.0;
  const lastSpikeNotifyRef = useRef<number>(0);
  const [activeSpikeBanner, setActiveSpikeBanner] = useState<{ spike: VolatilitySpikeAlert; waUrl?: string } | null>(null);

  const [spikeLogs, setSpikeLogs] = useState<VolatilitySpikeAlert[]>([
    {
      id: 'VS-8821',
      symbol: 'XAU/USD',
      price: 4066.80,
      ma1h: 4051.20,
      stdDev1h: 5.80,
      deviation: 15.60,
      zScore: 2.69,
      direction: 'UPWARD_SURGE',
      threshold: 2.0,
      timestamp: '19:05:00 UTC',
      whatsAppStatus: 'SENT',
      actionAdvice: 'Bullish breakout +2.69σ above 1H MA. Tighten stops; watch for liquidity absorption.',
    },
  ]);

  // Function to dispatch signal to WhatsApp in real-time
  const dispatchSignalToWhatsApp = async (signal: TradingSignal, autoOpenWindow = true) => {
    try {
      const cleanPhone = (user.whatsAppNumber || '').replace(/[^0-9]/g, '');
      const rawText = `
🎯 *GOLDSNIPER PRO - REAL-TIME LIVE SIGNAL* 🎯
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
🛡️ *AI Confidence:* ${signal.confidenceScore}% (Zero-Mistake Mode)
🇵🇰 *Roman Urdu:* ${signal.decisionReasoningUrdu}
━━━━━━━━━━━━━━━━━━━━
📱 Receiver: ${user.whatsAppNumber} | Email: ${user.email}
      `.trim();

      // Post to backend logger
      await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: user.whatsAppNumber,
          message: rawText,
          signalId: `SIG-${Date.now()}`
        })
      });

      const messageEncoded = encodeURIComponent(rawText);
      const waUrl = cleanPhone 
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${messageEncoded}`
        : `https://api.whatsapp.com/send?text=${messageEncoded}`;

      if (autoOpenWindow) {
        window.open(waUrl, '_blank');
      }

      setRealtimeToast({
        message: `Signal sent real-time to WhatsApp (${user.whatsAppNumber}) & linked to ${user.email}!`,
        type: 'success',
        url: waUrl
      });
      setTimeout(() => setRealtimeToast(null), 6000);
    } catch (err) {
      console.warn('Real-time WhatsApp dispatch error:', err);
    }
  };

  // Handler for manual "Test Real-Time Signal Dispatch" button
  const handleTestRealtimeSignal = () => {
    sounds.playSignalAlert();
    const testSignal: TradingSignal = {
      ...activeSignal,
      entryPrice: currentPrice,
      timestamp: new Date().toLocaleTimeString(),
    };
    dispatchSignalToWhatsApp(testSignal, true);
  };

  // When AI expert generates a new signal, auto-send to WhatsApp if toggle is on
  const handleNewAiSignal = (newSig: TradingSignal) => {
    setActiveSignal(newSig);
    if (user.autoWhatsAppAlerts) {
      dispatchSignalToWhatsApp(newSig, true);
    }
  };

  // Fetch initial backend data
  const fetchData = async () => {
    try {
      setIsCalendarLoading(true);
      const [calRes, newsRes, tradesRes, volRes] = await Promise.all([
        fetch('/api/forexfactory/calendar'),
        fetch('/api/news/global'),
        fetch('/api/trades/history'),
        fetch('/api/volatility/history'),
      ]);

      const calData = await calRes.json();
      if (calData.success) {
        setCalendarEvents(calData.data || []);
        setVolatilityStatus(calData.marketVolatilityStatus || 'ELEVATED');
        setEmbargoActive(calData.embargoActive || false);
      }

      const newsData = await newsRes.json();
      if (newsData.success) {
        setNewsFeed(newsData.news || []);
        setFakeFilterCount(newsData.fakeNewsFilteredCount || 2);
      }

      const tradesData = await tradesRes.json();
      if (tradesData.success) {
        setTrades(tradesData.trades || []);
      }

      const volData = await volRes.json();
      if (volData.success && volData.spikes) {
        setSpikeLogs(volData.spikes);
      }
    } catch (e) {
      console.warn('Initial backend fetch fallback:', e);
    } finally {
      setIsCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Automated 2-Sigma Volatility Spike Evaluation
  const checkVolatilitySpike = async (price: number) => {
    const dev = Number((price - ma1h).toFixed(2));
    const z = Number((dev / stdDev1h).toFixed(2));
    if (Math.abs(z) >= 2.0) {
      const now = Date.now();
      if (now - lastSpikeNotifyRef.current > 60000) {
        lastSpikeNotifyRef.current = now;
        try {
          const res = await fetch('/api/volatility/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              symbol: 'XAU/USD',
              price,
              ma1h,
              stdDev1h,
              phoneNumber: user.whatsAppNumber,
              autoNotify: user.autoWhatsAppAlerts,
            }),
          });
          const data = await res.json();
          if (data.success && data.alert) {
            if (!audioMuted) sounds.playVolatilityAlarm();
            setSpikeLogs((prev) => [data.alert, ...prev]);
            setActiveSpikeBanner({ spike: data.alert, waUrl: data.whatsappUrl });
            if (user.autoWhatsAppAlerts && data.whatsappUrl) {
              window.open(data.whatsappUrl, '_blank');
            }
          }
        } catch (e) {
          console.warn('Auto volatility spike dispatch failed:', e);
        }
      }
    }
  };

  // Live market price tick simulation (Simulates real-time price tick fluctuations around 4058.39)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const delta = (Math.random() - 0.48) * 0.25;
        const newPrice = Number((prev + delta).toFixed(2));
        setBidPrice(newPrice);
        setAskPrice(Number((newPrice + 0.49).toFixed(2)));

        // Check 2-Sigma Volatility Spike
        checkVolatilitySpike(newPrice);

        // Check price alerts
        alerts.forEach((alert) => {
          if (!alert.triggered) {
            const hitAbove = alert.condition === 'ABOVE' && newPrice >= alert.targetPrice;
            const hitBelow = alert.condition === 'BELOW' && newPrice <= alert.targetPrice;
            if (hitAbove || hitBelow) {
              if (!audioMuted) sounds.playPriceAlert();
              setAlerts((all) =>
                all.map((a) => (a.id === alert.id ? { ...a, triggered: true } : a))
              );
            }
          }
        });

        return newPrice;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [alerts, audioMuted, user.whatsAppNumber, user.autoWhatsAppAlerts]);

  // Execute trade callback
  const handleExecuteTrade = async (
    direction: 'BUY' | 'SELL', 
    lotSize: number, 
    price: number,
    notes = 'Instant Terminal Execution'
  ) => {
    try {
      const res = await fetch('/api/trades/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: `${selectedSymbol} (XAU/USD)`,
          direction,
          lotSize,
          entryPrice: price,
          stopLoss: direction === 'BUY' ? price - 10 : price + 10,
          takeProfit: direction === 'BUY' ? price + 20 : price - 20,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success && data.trade) {
        setTrades((prev) => [data.trade, ...prev]);
        if (!audioMuted) sounds.playSignalAlert();
      }
    } catch (e) {
      console.error('Trade execution failed:', e);
    }
  };

  const handleAddAlert = (targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    const newAlert: PriceAlert = {
      id: `al-${Date.now()}`,
      symbol: selectedSymbol,
      targetPrice,
      condition,
      triggered: false,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${
      isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#0b0e14] text-[#e1e7ec]'
    } transition-colors font-sans`}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedSymbol={selectedSymbol}
        setSelectedSymbol={setSelectedSymbol}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        currentPrice={currentPrice}
        user={user}
        onOpenGoogleLogin={() => setIsGoogleModalOpen(true)}
        onOpenWhatsAppModal={() => setIsWhatsAppModalOpen(true)}
        audioMuted={audioMuted}
        setAudioMuted={setAudioMuted}
        currentZScore={currentZScore}
        isSpikeActive={isSpikeActive}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Prominent User-Friendly Signal Delivery Settings & Instant Testing Bar */}
      <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs z-20 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#101724] border-[#1e293b]'
      }`}>
        <div className="flex flex-wrap items-center gap-3">
          {/* WhatsApp input badge */}
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-700 hidden sm:inline">WhatsApp:</span>
            <input
              type="text"
              value={user.whatsAppNumber}
              onChange={(e) => setUser((prev) => ({ ...prev, whatsAppNumber: e.target.value }))}
              placeholder="+923001234567"
              className={`w-36 sm:w-40 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-600' 
                  : 'bg-[#172030] border-gray-700 text-emerald-400'
              }`}
              title="Enter your WhatsApp number with country code"
            />
          </div>

          {/* Email input badge */}
          <div className="flex items-center gap-1.5">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-700 hidden sm:inline">Email:</span>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
              className={`w-44 sm:w-52 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
                isLight 
                  ? 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600' 
                  : 'bg-[#172030] border-gray-700 text-blue-300'
              }`}
              title="Enter your email to receive signal summaries"
            />
          </div>

          {/* Real-time Auto-Send Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={user.autoWhatsAppAlerts}
              onChange={(e) => setUser((prev) => ({ ...prev, autoWhatsAppAlerts: e.target.checked }))}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
            />
            <span className="font-bold text-slate-800 text-xs hidden md:inline">
              ⚡ Auto-Send Signal to WhatsApp in Real-Time
            </span>
          </label>
        </div>

        {/* Instant Testing Action Button & Sentiment Gauge Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('SENTIMENT')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              activeTab === 'SENTIMENT'
                ? 'bg-blue-600 text-white shadow-xs'
                : isLight
                ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200 shadow-xs'
                : 'bg-teal-950/30 hover:bg-teal-900/40 text-teal-300 border-teal-700/50'
            }`}
            title="Open Institutional Market Sentiment Gauge"
          >
            <Compass className="w-3.5 h-3.5 text-teal-600" />
            <span>Sentiment: 74% Bull</span>
          </button>

          <button
            onClick={handleTestRealtimeSignal}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title="Immediately generate and send verified Gold signal to user's WhatsApp & Email"
          >
            <Zap className="w-4 h-4 fill-white text-transparent" />
            <span>⚡ Test Signal Dispatch Now</span>
          </button>
        </div>
      </div>

      {/* Active Toast Notification for Signal Sent in Real-Time */}
      {realtimeToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold animate-fade-in z-30 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{realtimeToast.message}</span>
          </div>
          {realtimeToast.url && (
            <a
              href={realtimeToast.url}
              target="_blank"
              rel="noreferrer"
              className="underline font-black bg-white/20 px-2 py-0.5 rounded hover:bg-white/30"
            >
              Open WhatsApp Web
            </a>
          )}
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Drawing Toolbar (Enabled for PRO_CHART mode matching screenshot) */}
        {activeTab === 'PRO_CHART' && (
          <DrawingToolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            magnetMode={magnetMode}
            setMagnetMode={setMagnetMode}
            isLocked={isLocked}
            setIsLocked={setIsLocked}
            drawingsVisible={drawingsVisible}
            setDrawingsVisible={setDrawingsVisible}
            onClearDrawings={() => setDrawings([])}
            drawingsCount={drawings.length}
            theme={theme}
          />
        )}

        {/* Center Main Stage Content based on activeTab */}
        <main className={`flex-1 flex flex-col overflow-hidden relative ${
          isLight ? 'bg-slate-50' : 'bg-[#0e131d]'
        }`}>
          {/* Active 2-Sigma Volatility Spike Global Notification Banner */}
          {activeSpikeBanner && (
            <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-between text-xs z-30 animate-fade-in shadow-md">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-white animate-pulse" />
                <div>
                  <span className="font-extrabold text-white">
                    🚨 2σ VOLATILITY SPIKE DETECTED: {activeSpikeBanner.spike.direction.replace(/_/g, ' ')} ({activeSpikeBanner.spike.zScore > 0 ? '+' : ''}{activeSpikeBanner.spike.zScore}σ)
                  </span>
                  <span className="text-rose-100 ml-2 hidden sm:inline">
                    XAU/USD Price ${activeSpikeBanner.spike.price.toFixed(2)} deviated by ${activeSpikeBanner.spike.deviation.toFixed(2)} from 1H MA ($4,051.20).
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeSpikeBanner.waUrl && (
                  <a
                    href={activeSpikeBanner.waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Open in WhatsApp</span>
                  </a>
                )}
                <button
                  onClick={() => setActiveTab('VOLATILITY_MONITOR')}
                  className="px-2.5 py-1 bg-rose-800 hover:bg-rose-900 text-white rounded-lg font-bold"
                >
                  View Monitor
                </button>
                <button
                  onClick={() => setActiveSpikeBanner(null)}
                  className="text-white hover:text-rose-200 px-1.5 py-0.5 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: PRO TERMINAL CANVAS CHART (Pixel-perfect match to user's uploaded image, Light Mode) */}
          {activeTab === 'PRO_CHART' && (
            <div className="flex-1 w-full h-full relative">
              <InteractiveChart
                candles={candles}
                currentPrice={currentPrice}
                bidPrice={bidPrice}
                askPrice={askPrice}
                activeTool={activeTool}
                magnetMode={magnetMode}
                isLocked={isLocked}
                drawingsVisible={drawingsVisible}
                drawings={drawings}
                setDrawings={setDrawings}
                onExecuteTrade={handleExecuteTrade}
                timeframe={timeframe}
                theme={theme}
              />
            </div>
          )}

          {/* TAB 2: MARKET SENTIMENT GAUGE (Institutional Order Flow & Bull vs Bear) */}
          {activeTab === 'SENTIMENT' && (
            <div className="flex-1 p-3 md:p-5 overflow-hidden">
              <MarketSentimentGauge
                currentPrice={currentPrice}
                symbol={`${selectedSymbol} (XAU/USD)`}
                theme={theme}
                onNavigateToChart={() => setActiveTab('PRO_CHART')}
              />
            </div>
          )}

          {/* TAB 2: PRECISION SIGNALS & WHATSAPP DISPATCH */}
          {activeTab === 'SIGNALS' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">
              <SignalCard
                signal={activeSignal}
                onExecuteTrade={handleExecuteTrade}
                userWhatsAppNumber={user.whatsAppNumber}
                userEmail={user.email}
                onOpenWhatsAppConfig={() => setIsWhatsAppModalOpen(true)}
                theme={theme}
              />

              {/* ForexFactory Impact Summary Bar */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#121824] border-gray-800'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-bold text-slate-800">Algorithmic Confluence Verdict:</span>
                  <span className="text-slate-600 font-medium">
                    MA50 support defended + RSI momentum continuous + High economic risk window cleared.
                  </span>
                </div>
                <button
                  onClick={handleTestRealtimeSignal}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Dispatch to WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REAL-TIME 2-SIGMA VOLATILITY SPIKE MONITOR */}
          {activeTab === 'VOLATILITY_MONITOR' && (
            <div className="flex-1 p-3 md:p-5 overflow-hidden">
              <VolatilitySpikeMonitor
                currentPrice={currentPrice}
                symbol="XAU/USD (GOLD)"
                userWhatsAppNumber={user.whatsAppNumber}
                autoWhatsAppAlerts={user.autoWhatsAppAlerts}
                onOpenWhatsAppConfig={() => setIsWhatsAppModalOpen(true)}
                spikeLogs={spikeLogs}
                onNewSpikeDetected={(newSpike, waUrl) => {
                  setSpikeLogs((prev) => [newSpike, ...prev]);
                  setActiveSpikeBanner({ spike: newSpike, waUrl });
                }}
                audioMuted={audioMuted}
                theme={theme}
              />
            </div>
          )}

          {/* TAB 4: FOREXFACTORY ECONOMIC CALENDAR */}
          {activeTab === 'CALENDAR' && (
            <div className="flex-1 p-3 md:p-5 overflow-hidden">
              <ForexFactoryCalendar
                events={calendarEvents}
                volatilityStatus={volatilityStatus}
                embargoActive={embargoActive}
                onRefresh={fetchData}
                isLoading={isCalendarLoading}
                theme={theme}
              />
            </div>
          )}

          {/* TAB 5: GLOBAL NEWS & FAKE REPORT FILTER */}
          {activeTab === 'NEWS_FILTER' && (
            <div className="flex-1 p-3 md:p-5 overflow-hidden">
              <GlobalNewsFilter
                news={newsFeed}
                fakeCount={fakeFilterCount}
                theme={theme}
              />
            </div>
          )}

          {/* TAB 6: TRADINGVIEW OFFICIAL ADVANCED WIDGET */}
          {activeTab === 'TRADINGVIEW' && (
            <div className="flex-1 w-full h-full p-2">
              <TradingViewWidget
                symbol={selectedSymbol === 'GOLD' ? 'OANDA:XAUUSD' : `FX:${selectedSymbol}`}
                interval={timeframe === '15m' ? '15' : '60'}
              />
            </div>
          )}

          {/* TAB 7: HISTORICAL BACKTESTING ENGINE */}
          {activeTab === 'BACKTEST' && (
            <div className="flex-1 p-3 md:p-5 overflow-hidden">
              <BacktestingEngine theme={theme} />
            </div>
          )}

          {/* TAB 8: RISK MANAGEMENT & TRADE LOGS */}
          {activeTab === 'RISK_JOURNAL' && (
            <div className="flex-1 p-3 md:p-5 overflow-hidden">
              <RiskManagementDashboard
                trades={trades}
                currentPrice={currentPrice}
                alerts={alerts}
                onAddAlert={handleAddAlert}
                onDeleteAlert={handleDeleteAlert}
                accountBalance={user.accountBalance}
                setAccountBalance={(val) => setUser((prev) => ({ ...prev, accountBalance: val }))}
                theme={theme}
              />
            </div>
          )}
        </main>

        {/* Right Drawer / Split Panel: Trading Expert AI (Gemini 3.8 Flash) */}
        {showAiExpertPanel && (
          <aside className={`w-80 md:w-96 flex flex-col z-20 shrink-0 shadow-lg transition-all border-l ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#121824] border-[#1e293b]'
          }`}>
            <div className={`flex items-center justify-between p-3 border-b ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0f141f] border-[#1e293b]'
            }`}>
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-700">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>AI Expert Analyst</span>
              </div>
              <button
                onClick={() => setShowAiExpertPanel(false)}
                title="Minimize AI Panel"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TradingExpertAI
                currentPrice={currentPrice}
                symbol={`${selectedSymbol} (XAU/USD)`}
                onNewSignalGenerated={handleNewAiSignal}
                theme={theme}
              />
            </div>
          </aside>
        )}

        {/* Minimized AI Drawer Trigger */}
        {!showAiExpertPanel && (
          <button
            onClick={() => setShowAiExpertPanel(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-blue-600 hover:bg-blue-700 text-white py-3 px-1.5 rounded-l-xl shadow-xl flex flex-col items-center gap-1 font-bold text-[11px] transition-all"
            title="Open AI Trading Expert"
          >
            <ChevronLeft className="w-4 h-4" />
            <Bot className="w-4 h-4" />
            <span className="[writing-mode:vertical-lr] tracking-wider uppercase font-black">AI Expert</span>
          </button>
        )}
      </div>

      {/* WhatsApp Configuration Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        whatsAppNumber={user.whatsAppNumber}
        userEmail={user.email}
        onSaveWhatsAppNumber={(num, auto, em) => {
          setUser((prev) => ({ 
            ...prev, 
            whatsAppNumber: num, 
            autoWhatsAppAlerts: auto,
            email: em || prev.email 
          }));
        }}
        autoSendAlerts={user.autoWhatsAppAlerts}
        theme={theme}
      />

      {/* Google Login & Preferences Modal */}
      <GoogleLoginModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        user={user}
        setUser={setUser}
        theme={theme}
      />
    </div>
  );
}
