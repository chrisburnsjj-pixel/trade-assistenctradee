export type DrawingTool = 
  | 'CROSSHAIR' 
  | 'TRENDLINE' 
  | 'FIBONACCI' 
  | 'RECTANGLE' 
  | 'TEXT' 
  | 'STICKER' 
  | 'MEASURE_RULER' 
  | 'ZOOM' 
  | 'NONE';

export interface Point {
  x: number;
  y: number;
  price?: number;
  time?: string;
}

export interface DrawingElement {
  id: string;
  tool: DrawingTool;
  points: Point[];
  color: string;
  text?: string;
  locked?: boolean;
}

export interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma50: number;
  rsi14: number;
  macdLine: number;
  macdSignal: number;
  macdHist: number;
}

export interface ForexFactoryEvent {
  id: string;
  time: string;
  date: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  event: string;
  forecast: string;
  previous: string;
  actual: string;
  sentimentEffect: string;
  description: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  credibility: number; // 0 - 100
  isFake: boolean;
  impact: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'FAKE_ALERT';
  symbol: string;
  time: string;
  summary: string;
  verificationNotes: string;
}

export interface TradingSignal {
  symbol: string;
  direction: 'STRONG BUY' | 'BUY' | 'NEUTRAL_WAIT' | 'SELL' | 'STRONG SELL';
  confidenceScore: number;
  entryPrice: number;
  stopLoss: number;
  slPips: number;
  takeProfit1: number;
  tp1Pips: number;
  takeProfit2: number;
  tp2Pips: number;
  takeProfit3: number;
  tp3Pips: number;
  riskRewardRatio: string;
  technicalConfluence: string[];
  fakeNewsAudit: string;
  forexFactoryImpact: string;
  decisionReasoningEnglish: string;
  decisionReasoningUrdu: string;
  recommendedLotSizeFor10k: number;
  volatilityWarning: string;
  timestamp: string;
}

export interface TradeLog {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  lotSize: number;
  entryPrice: number;
  exitPrice?: number | null;
  stopLoss?: number;
  takeProfit?: number;
  pnl: number;
  pips: number;
  status: 'ACTIVE_OPEN' | 'CLOSED_PROFIT' | 'STOP_LOSS_HIT';
  timestamp: string;
  signalReason: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  triggered: boolean;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  accountBalance: number;
  riskPercentage: number;
  whatsAppNumber: string;
  autoWhatsAppAlerts: boolean;
  isLoggedIn: boolean;
}

export interface VolatilitySpikeAlert {
  id: string;
  symbol: string;
  price: number;
  ma1h: number;
  stdDev1h: number;
  deviation: number;
  zScore: number;
  direction: 'UPWARD_SURGE' | 'DOWNWARD_PLUNGE';
  threshold: number;
  timestamp: string;
  whatsAppStatus: 'SENT' | 'SIMULATED' | 'OPENED';
  actionAdvice: string;
}

export interface InstitutionalOrderFlowGroup {
  name: string;
  category: 'CENTRAL_BANKS' | 'LARGE_SPECULATORS' | 'COMMERCIAL_BANKS' | 'RETAIL_TRADERS';
  bullishPct: number;
  bearishPct: number;
  volumeLots: number;
  bias: 'STRONGLY_BULLISH' | 'MODERATELY_BULLISH' | 'NEUTRAL' | 'BEARISH';
  description: string;
}

export interface LiquidityPoolLevel {
  price: number;
  type: 'BUY_WALL_BID' | 'SELL_WALL_ASK';
  volumeOz: number;
  volumeUsdMillions: number;
  strengthPct: number;
}

export interface MarketSentimentData {
  symbol: string;
  currentPrice: number;
  overallBullishPct: number;
  overallBearishPct: number;
  netSentimentScore: number; // -100 to +100
  sentimentLabel: 'STRONG_BULLISH' | 'MODERATE_BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  institutionalNetInflowOz: number;
  institutionalNetInflowUsd: number;
  smartMoneyDivergence: boolean;
  cotSpeculatorLongPct: number;
  cotCommercialHedgePct: number;
  retailCrowdLongPct: number;
  bidDepthTotalUsdMillions: number;
  askDepthTotalUsdMillions: number;
  lastUpdated: string;
  sourceFeed: string;
  summaryUrdu: string;
  summaryEnglish: string;
  groups: InstitutionalOrderFlowGroup[];
  liquidityPools: LiquidityPoolLevel[];
}
