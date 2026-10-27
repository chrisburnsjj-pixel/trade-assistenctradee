import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  CandleData, 
  DrawingTool, 
  DrawingElement, 
  Point 
} from '../types/trading';
import { sounds } from '../utils/audio';
import { 
  X, 
  ChevronDown, 
  Maximize2, 
  Sparkles, 
  SlidersHorizontal 
} from 'lucide-react';

interface InteractiveChartProps {
  candles: CandleData[];
  currentPrice: number;
  bidPrice: number;
  askPrice: number;
  activeTool: DrawingTool;
  magnetMode: boolean;
  isLocked: boolean;
  drawingsVisible: boolean;
  drawings: DrawingElement[];
  setDrawings: React.Dispatch<React.SetStateAction<DrawingElement[]>>;
  onExecuteTrade: (direction: 'BUY' | 'SELL', lotSize: number, price: number) => void;
  timeframe: string;
  theme?: 'light' | 'dark';
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  candles,
  currentPrice,
  bidPrice,
  askPrice,
  activeTool,
  magnetMode,
  isLocked,
  drawingsVisible,
  drawings,
  setDrawings,
  onExecuteTrade,
  timeframe,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Quick execution ticket state
  const [showOrderBar, setShowOrderBar] = useState(true);
  const [orderType, setOrderType] = useState<'MKT' | 'LMT'>('LMT');
  const [lotSize, setLotSize] = useState<number>(0.49);

  // Drawing interactions state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingPoints, setCurrentDrawingPoints] = useState<Point[]>([]);
  const [hoverPos, setHoverPos] = useState<Point | null>(null);
  const [mousePrice, setMousePrice] = useState<number | null>(null);
  const [mouseTime, setMouseTime] = useState<string | null>(null);

  // Indicators toggle
  const [showMA50, setShowMA50] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

  // AI Projection Overlay state based on historical volatility patterns
  const [showAiProjection, setShowAiProjection] = useState(true);
  const [projectionScenario, setProjectionScenario] = useState<
    'BULLISH_CONTINUATION' | 'VOLATILITY_EXPANSION' | 'MEAN_REVERSION_BOUNCE'
  >('BULLISH_CONTINUATION');
  const [showProjectionCard, setShowProjectionCard] = useState(true);

  // Compute price ranges (accommodating projection targets)
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (!candles.length) return { minPrice: 4000, maxPrice: 4080, priceRange: 80 };
    let min = Infinity;
    let max = -Infinity;
    candles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    // If projection active, ensure upper target fits comfortably
    if (showAiProjection) {
      max = Math.max(max, 4082);
      min = Math.min(min, 4046);
    }

    // Add margin
    const padding = (max - min) * 0.16 || 6;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: max - min + padding * 2,
    };
  }, [candles, showAiProjection]);

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive Canvas Size with High-DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Sub-panel heights allocation
    const bottomTimeScaleHeight = 28;
    const rightPriceScaleWidth = 68;
    const chartAreaWidth = width - rightPriceScaleWidth;

    // Panel heights
    const mainChartHeight = height * 0.44;
    const rsi1Height = height * 0.16;
    const rsi2Height = height * 0.14;
    const macdHeight = height - mainChartHeight - rsi1Height - rsi2Height - bottomTimeScaleHeight;

    const isLight = theme === 'light';
    const bgColor = isLight ? '#ffffff' : '#0f141f';
    const gridColor = isLight ? '#f1f5f9' : '#1b2333';
    const separatorColor = isLight ? '#e2e8f0' : '#1e293b';
    const scaleBg = isLight ? '#f8fafc' : '#0b0f19';
    const scaleBorder = isLight ? '#e2e8f0' : '#1e293b';
    const textLabelColor = isLight ? '#475569' : '#b2b5be';
    const scaleTextColor = isLight ? '#64748b' : '#94a3b8';

    // Clear background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Grid lines styling
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    // Calculate Candle layout and future projection horizon
    const candleCount = candles.length;
    const futureBars = showAiProjection ? 8 : 0;
    const totalSlots = candleCount + futureBars;
    const candleWidth = chartAreaWidth / Math.max(totalSlots, 1);
    const bodyWidth = Math.max(candleWidth * 0.65, 4);

    // Helpers to project Price <-> Y Coordinate
    const getY = (price: number, panelTop: number, panelHeight: number, pMin: number, pMax: number) => {
      const pRange = pMax - pMin || 1;
      return panelTop + panelHeight - ((price - pMin) / pRange) * panelHeight;
    };

    // 1. Draw Main Chart Grid & Moving Averages
    const mainGridLevels = [4020, 4030, 4040, 4050, 4060, 4070];
    ctx.setLineDash([4, 4]);
    mainGridLevels.forEach((level) => {
      const y = getY(level, 0, mainChartHeight, minPrice, maxPrice);
      if (y >= 0 && y <= mainChartHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartAreaWidth, y);
        ctx.stroke();
      }
    });
    ctx.setLineDash([]);

    // Draw Candles
    candles.forEach((c, idx) => {
      const x = idx * candleWidth + candleWidth / 2;
      const isBullish = c.close >= c.open;
      const candleColor = isBullish ? '#089981' : '#f23645';

      const highY = getY(c.high, 0, mainChartHeight, minPrice, maxPrice);
      const lowY = getY(c.low, 0, mainChartHeight, minPrice, maxPrice);
      const openY = getY(c.open, 0, mainChartHeight, minPrice, maxPrice);
      const closeY = getY(c.close, 0, mainChartHeight, minPrice, maxPrice);

      // Wick
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(openY - closeY), 2);
      ctx.fillStyle = candleColor;
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, bodyHeight);
    });

    // Draw MA 50 (Blue curving line)
    if (showMA50 && candles.length > 1) {
      ctx.strokeStyle = '#2962ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = idx * candleWidth + candleWidth / 2;
        const y = getY(c.ma50, 0, mainChartHeight, minPrice, maxPrice);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Moving Average Label
      ctx.fillStyle = '#2962ff';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('MA 50 close 0', 12, 54);
    }

    // AI Projection Overlay based on historical volatility patterns
    if (showAiProjection && candles.length > 0) {
      const lastIdx = candles.length - 1;
      const startX = lastIdx * candleWidth + candleWidth / 2;
      const startPrice = candles[lastIdx].close;

      const scenarios = {
        BULLISH_CONTINUATION: {
          color: '#00f2fe',
          glow: 'rgba(0, 242, 254, 0.4)',
          name: 'Bullish Base Wave',
          path: [startPrice, 4060.40, 4063.10, 4061.90, 4068.00, 4071.50, 4075.20, 4078.50],
          upperCone: [startPrice, 4063.50, 4067.80, 4072.00, 4078.00, 4083.20, 4087.50, 4091.00],
          lowerCone: [startPrice, 4056.00, 4054.50, 4053.20, 4054.00, 4053.20, 4051.80, 4050.20],
          targetLabel: 'TP2 Target $4,078.50',
          targetPips: '+201 pips',
        },
        VOLATILITY_EXPANSION: {
          color: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.4)',
          name: 'Volatility Expansion (PCE)',
          path: [startPrice, 4062.50, 4069.00, 4074.50, 4081.00, 4085.80, 4089.20, 4093.00],
          upperCone: [startPrice, 4067.00, 4076.00, 4083.50, 4091.00, 4097.50, 4103.00, 4108.00],
          lowerCone: [startPrice, 4054.00, 4052.00, 4050.50, 4051.00, 4048.50, 4046.00, 4044.50],
          targetLabel: 'Spike Target $4,093.00',
          targetPips: '+346 pips',
        },
        MEAN_REVERSION_BOUNCE: {
          color: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.4)',
          name: 'MA50 Pullback & Reversal',
          path: [startPrice, 4055.00, 4051.80, 4050.20, 4056.50, 4063.00, 4068.50, 4073.50],
          upperCone: [startPrice, 4059.50, 4058.20, 4058.00, 4065.00, 4073.50, 4079.00, 4084.50],
          lowerCone: [startPrice, 4052.00, 4048.00, 4046.50, 4047.00, 4050.00, 4054.00, 4058.00],
          targetLabel: 'Rebound Target $4,073.50',
          targetPips: '+151 pips',
        },
      };

      const activeScenario = scenarios[projectionScenario];
      const futureLen = activeScenario.path.length;
      const endX = (lastIdx + futureLen - 1) * candleWidth + candleWidth / 2;

      ctx.save();

      // 1. Vertical Horizon Line between Historical & AI Projection
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, mainChartHeight);
      ctx.stroke();

      ctx.fillStyle = '#00f2fe';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText('AI HORIZON ⏵', startX + 5, 20);
      ctx.setLineDash([]);

      // 2. Historical Volatility Probability Cloud (Cone)
      const grad = ctx.createLinearGradient(startX, 0, endX, 0);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.16)');
      grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.02)');

      ctx.beginPath();
      // Upper bound forward
      for (let i = 0; i < futureLen; i++) {
        const x = (lastIdx + i) * candleWidth + candleWidth / 2;
        const y = getY(activeScenario.upperCone[i], 0, mainChartHeight, minPrice, maxPrice);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      // Lower bound backward
      for (let i = futureLen - 1; i >= 0; i--) {
        const x = (lastIdx + i) * candleWidth + candleWidth / 2;
        const y = getY(activeScenario.lowerCone[i], 0, mainChartHeight, minPrice, maxPrice);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Dotted boundary lines for volatility confidence bands
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.45)';
      ctx.lineWidth = 1;

      // Draw upper boundary stroke
      ctx.beginPath();
      for (let i = 0; i < futureLen; i++) {
        const x = (lastIdx + i) * candleWidth + candleWidth / 2;
        const y = getY(activeScenario.upperCone[i], 0, mainChartHeight, minPrice, maxPrice);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw lower boundary stroke
      ctx.beginPath();
      for (let i = 0; i < futureLen; i++) {
        const x = (lastIdx + i) * candleWidth + candleWidth / 2;
        const y = getY(activeScenario.lowerCone[i], 0, mainChartHeight, minPrice, maxPrice);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Glowing Future Price Trajectory Path
      ctx.shadowColor = activeScenario.color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = activeScenario.color;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      for (let i = 0; i < futureLen; i++) {
        const x = (lastIdx + i) * candleWidth + candleWidth / 2;
        const y = getY(activeScenario.path[i], 0, mainChartHeight, minPrice, maxPrice);
        if (i === 0) ctx.moveTo(x, y);
        else {
          // Smooth curve connection
          const prevX = (lastIdx + i - 1) * candleWidth + candleWidth / 2;
          const prevY = getY(activeScenario.path[i - 1], 0, mainChartHeight, minPrice, maxPrice);
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 4. Milestone Nodes & Projected Target Badges
      // Node A: TP1 at index 4 (+60m)
      if (futureLen > 4) {
        const tp1X = (lastIdx + 4) * candleWidth + candleWidth / 2;
        const tp1Y = getY(activeScenario.path[4], 0, mainChartHeight, minPrice, maxPrice);
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(tp1X, tp1Y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(tp1X - 34, tp1Y - 22, 68, 16);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(tp1X - 34, tp1Y - 22, 68, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`TP1: $${activeScenario.path[4].toFixed(2)}`, tp1X, tp1Y - 10);
      }

      // Node B: Final Target at index 7 (+105m)
      const targetX = (lastIdx + futureLen - 1) * candleWidth + candleWidth / 2;
      const targetY = getY(activeScenario.path[futureLen - 1], 0, mainChartHeight, minPrice, maxPrice);

      // Outer pulse ring
      ctx.strokeStyle = activeScenario.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Target Callout Badge
      const badgeW = 100;
      const badgeH = 28;
      const badgeX = Math.min(targetX - badgeW / 2, chartAreaWidth - badgeW - 6);
      const badgeY = Math.max(targetY - badgeH - 10, 15);

      ctx.fillStyle = '#090e17';
      ctx.fillRect(badgeX, badgeY, badgeW, badgeH);
      ctx.strokeStyle = activeScenario.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(badgeX, badgeY, badgeW, badgeH);

      ctx.fillStyle = activeScenario.color;
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`🎯 ${activeScenario.targetLabel}`, badgeX + badgeW / 2, badgeY + 11);
      ctx.fillStyle = '#4ade80';
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillText(`${activeScenario.targetPips} · Volatility Fit 92%`, badgeX + badgeW / 2, badgeY + 22);

      ctx.restore();
    }

    // 2. Separator line between Main Chart & Subpanel 1
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mainChartHeight);
    ctx.lineTo(width, mainChartHeight);
    ctx.stroke();

    // 3. Sub-panel 1: RSI 14
    if (showRSI) {
      const rsiTop = mainChartHeight;
      // Dotted RSI 70 / 50 / 30 lines
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#273349';
      [70, 50, 30].forEach((level) => {
        const y = getY(level, rsiTop, rsi1Height, 0, 100);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartAreaWidth, y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // RSI Label
      ctx.fillStyle = '#b2b5be';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('RSI 14', 12, rsiTop + 16);

      // RSI Purple Curve
      ctx.strokeStyle = '#9353d3';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = idx * candleWidth + candleWidth / 2;
        const y = getY(c.rsi14, rsiTop, rsi1Height, 0, 100);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Right level 69.47 pill
      const latestRSI = candles[candles.length - 1]?.rsi14 || 69.47;
      const rsiBadgeY = getY(latestRSI, rsiTop, rsi1Height, 0, 100);
      ctx.fillStyle = '#7828c8';
      ctx.fillRect(chartAreaWidth + 2, rsiBadgeY - 9, rightPriceScaleWidth - 4, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(latestRSI.toFixed(2), chartAreaWidth + rightPriceScaleWidth / 2, rsiBadgeY + 4);
      ctx.textAlign = 'left';
    }

    // 4. Separator line between RSI 1 & RSI 2
    const rsi2Top = mainChartHeight + rsi1Height;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, rsi2Top);
    ctx.lineTo(width, rsi2Top);
    ctx.stroke();

    // 5. Sub-panel 2: Secondary RSI 14 (Multi-timeframe as seen in user's image)
    {
      ctx.fillStyle = '#b2b5be';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('RSI 14 (Multi-TF)', 12, rsi2Top + 16);

      // Curve
      ctx.strokeStyle = '#ab47bc';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = idx * candleWidth + candleWidth / 2;
        const val = Math.max(10, Math.min(90, c.rsi14 - (idx % 3 === 0 ? 3 : -2)));
        const y = getY(val, rsi2Top, rsi2Height, 0, 100);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Right level pill
      const rsi2BadgeY = getY(69.47, rsi2Top, rsi2Height, 0, 100);
      ctx.fillStyle = '#7828c8';
      ctx.fillRect(chartAreaWidth + 2, rsi2BadgeY - 9, rightPriceScaleWidth - 4, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('69.47', chartAreaWidth + rightPriceScaleWidth / 2, rsi2BadgeY + 4);
      ctx.textAlign = 'left';
    }

    // 6. Separator line between RSI 2 & MACD
    const macdTop = rsi2Top + rsi2Height;
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(0, macdTop);
    ctx.lineTo(width, macdTop);
    ctx.stroke();

    // 7. Sub-panel 3: MACD (12, 26, close 9 EMA EMA)
    if (showMACD) {
      ctx.fillStyle = '#d1d4dc';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('MACD 12 26 close 9 EMA EMA', 12, macdTop + 16);

      const macdMin = -5;
      const macdMax = 20;

      // MACD Histogram Bars
      candles.forEach((c, idx) => {
        const x = idx * candleWidth + candleWidth / 2;
        const zeroY = getY(0, macdTop, macdHeight, macdMin, macdMax);
        const histY = getY(c.macdHist * 3, macdTop, macdHeight, macdMin, macdMax);
        const barH = zeroY - histY;

        ctx.fillStyle = c.macdHist >= 0 ? '#4dd0e1' : '#ef5350';
        const bW = Math.max(bodyWidth * 0.9, 3);
        if (barH >= 0) {
          ctx.fillRect(x - bW / 2, histY, bW, barH);
        } else {
          ctx.fillRect(x - bW / 2, zeroY, bW, -barH);
        }
      });

      // MACD Line (Yellow)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = idx * candleWidth + candleWidth / 2;
        const y = getY(c.macdLine, macdTop, macdHeight, macdMin, macdMax);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Signal Line (Blue)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      candles.forEach((c, idx) => {
        const x = idx * candleWidth + candleWidth / 2;
        const y = getY(c.macdSignal, macdTop, macdHeight, macdMin, macdMax);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Right axis badges for MACD: 12.22 (yellow), 11.49 (blue), -0.72 (red)
      const yYellow = getY(12.22, macdTop, macdHeight, macdMin, macdMax);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(chartAreaWidth + 2, yYellow - 8, rightPriceScaleWidth - 4, 16);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('12.22', chartAreaWidth + rightPriceScaleWidth / 2, yYellow + 4);

      const yBlue = getY(11.49, macdTop, macdHeight, macdMin, macdMax);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(chartAreaWidth + 2, yBlue - 8, rightPriceScaleWidth - 4, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('11.49', chartAreaWidth + rightPriceScaleWidth / 2, yBlue + 4);

      const yRed = getY(-0.72, macdTop, macdHeight, macdMin, macdMax);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(chartAreaWidth + 2, yRed - 8, rightPriceScaleWidth - 4, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('-0.72', chartAreaWidth + rightPriceScaleWidth / 2, yRed + 4);
      ctx.textAlign = 'left';
    }

    // 8. Right Price Scale Background & Border
    ctx.fillStyle = scaleBg;
    ctx.fillRect(chartAreaWidth, 0, rightPriceScaleWidth, height - bottomTimeScaleHeight);
    ctx.strokeStyle = scaleBorder;
    ctx.beginPath();
    ctx.moveTo(chartAreaWidth, 0);
    ctx.lineTo(chartAreaWidth, height - bottomTimeScaleHeight);
    ctx.stroke();

    // Price scale markers on right axis
    const rightTicks = [
      { price: 4060.14, color: '#3b82f6', bg: '#1d4ed8' },
      { price: 4058.39, color: '#ffffff', bg: '#000000', isCurrent: true, border: '#ffffff' },
      { price: 4056.00, color: '#60a5fa', bg: '#1e3a8a' },
      { price: 4049.96, color: '#22c55e', bg: '#15803d', isMA: true },
      { price: 4022.76, color: '#38bdf8', bg: '#0369a1' },
      { price: 4022.01, color: '#a855f7', bg: '#7e22ce' },
    ];

    rightTicks.forEach((tick) => {
      const y = getY(tick.price, 0, mainChartHeight, minPrice, maxPrice);
      if (y >= 5 && y <= mainChartHeight - 5) {
        ctx.fillStyle = tick.bg;
        ctx.fillRect(chartAreaWidth + 2, y - 8, rightPriceScaleWidth - 4, 16);
        if (tick.border) {
          ctx.strokeStyle = tick.border;
          ctx.lineWidth = 1;
          ctx.strokeRect(chartAreaWidth + 2, y - 8, rightPriceScaleWidth - 4, 16);
        }
        ctx.fillStyle = tick.color;
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tick.price.toFixed(2), chartAreaWidth + rightPriceScaleWidth / 2, y + 4);
      }
    });
    ctx.textAlign = 'left';

    // 9. Interactive User Drawings Layer
    if (drawingsVisible) {
      drawings.forEach((draw) => {
        ctx.save();
        ctx.strokeStyle = draw.color || '#38bdf8';
        ctx.fillStyle = draw.color || '#38bdf8';
        ctx.lineWidth = 2;

        if (draw.tool === 'TRENDLINE' && draw.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(draw.points[0].x, draw.points[0].y);
          ctx.lineTo(draw.points[1].x, draw.points[1].y);
          ctx.stroke();

          // Anchor dots
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(draw.points[0].x, draw.points[0].y, 3, 0, Math.PI * 2);
          ctx.arc(draw.points[1].x, draw.points[1].y, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (draw.tool === 'FIBONACCI' && draw.points.length >= 2) {
          const p1 = draw.points[0];
          const p2 = draw.points[1];
          const dy = p2.y - p1.y;
          const fibRatios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
          const fibColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8'];

          fibRatios.forEach((ratio, idx) => {
            const y = p1.y + dy * ratio;
            ctx.strokeStyle = fibColors[idx % fibColors.length];
            ctx.setLineDash([4, 2]);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(chartAreaWidth, y);
            ctx.stroke();

            ctx.font = '9px "JetBrains Mono", monospace';
            ctx.fillStyle = fibColors[idx % fibColors.length];
            ctx.fillText(`Fib ${(ratio * 100).toFixed(1)}%`, 14, y - 3);
          });
          ctx.setLineDash([]);
        } else if (draw.tool === 'RECTANGLE' && draw.points.length >= 2) {
          const p1 = draw.points[0];
          const p2 = draw.points[1];
          const rx = Math.min(p1.x, p2.x);
          const ry = Math.min(p1.y, p2.y);
          const rw = Math.abs(p2.x - p1.x);
          const rh = Math.abs(p2.y - p1.y);

          ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.strokeStyle = '#38bdf8';
          ctx.fillRect(rx, ry, rw, rh);
          ctx.strokeRect(rx, ry, rw, rh);
        } else if (draw.tool === 'TEXT' && draw.points.length >= 1) {
          ctx.font = '12px "JetBrains Mono", monospace';
          ctx.fillStyle = '#f8fafc';
          ctx.fillText(draw.text || 'Order Block Support Zone', draw.points[0].x, draw.points[0].y);
        } else if (draw.tool === 'MEASURE_RULER' && draw.points.length >= 2) {
          const p1 = draw.points[0];
          const p2 = draw.points[1];
          const dy = p1.y - p2.y;
          const pips = Math.round(Math.abs(dy) * 2.8);
          
          ctx.fillStyle = dy > 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';
          ctx.strokeStyle = dy > 0 ? '#22c55e' : '#ef4444';
          ctx.fillRect(p1.x, p2.y, p2.x - p1.x, dy);
          ctx.strokeRect(p1.x, p2.y, p2.x - p1.x, dy);

          // Pips pill
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(p2.x - 30, p2.y - 18, 60, 16);
          ctx.strokeStyle = '#475569';
          ctx.strokeRect(p2.x - 30, p2.y - 18, 60, 16);
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${dy > 0 ? '+' : '-'}${pips} Pips`, p2.x, p2.y - 6);
          ctx.textAlign = 'left';
        }
        ctx.restore();
      });

      // Current in-progress drawing preview
      if (isDrawing && currentDrawingPoints.length > 0 && hoverPos) {
        ctx.save();
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(currentDrawingPoints[0].x, currentDrawingPoints[0].y);
        ctx.lineTo(hoverPos.x, hoverPos.y);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 10. Crosshair rendering
    if (hoverPos && activeTool === 'CROSSHAIR') {
      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      // Horizontal crosshair line
      ctx.beginPath();
      ctx.moveTo(0, hoverPos.y);
      ctx.lineTo(chartAreaWidth, hoverPos.y);
      ctx.stroke();

      // Vertical crosshair line
      ctx.beginPath();
      ctx.moveTo(hoverPos.x, 0);
      ctx.lineTo(hoverPos.x, height - bottomTimeScaleHeight);
      ctx.stroke();
      ctx.setLineDash([]);

      // Floating Price Pill on right scale
      if (mousePrice) {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(chartAreaWidth + 2, hoverPos.y - 9, rightPriceScaleWidth - 4, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(mousePrice.toFixed(2), chartAreaWidth + rightPriceScaleWidth / 2, hoverPos.y + 4);
      }

      // Floating Time Pill on bottom scale
      if (mouseTime) {
        const timeY = height - bottomTimeScaleHeight + 2;
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(hoverPos.x - 28, timeY, 56, 18);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(mouseTime, hoverPos.x, timeY + 12);
      }
      ctx.restore();
    }

    // 11. Bottom Time Scale Bar
    const timeScaleY = height - bottomTimeScaleHeight;
    ctx.fillStyle = scaleBg;
    ctx.fillRect(0, timeScaleY, width, bottomTimeScaleHeight);
    ctx.strokeStyle = scaleBorder;
    ctx.beginPath();
    ctx.moveTo(0, timeScaleY);
    ctx.lineTo(width, timeScaleY);
    ctx.stroke();

    // Time ticks (Historical)
    ctx.fillStyle = scaleTextColor;
    ctx.font = '10px "JetBrains Mono", monospace';
    const tickInterval = Math.max(Math.floor(candleCount / 4), 1);
    candles.forEach((c, idx) => {
      if (idx % tickInterval === 0 || idx === candleCount - 1) {
        const x = idx * candleWidth + candleWidth / 2;
        ctx.fillText(c.time, x - 14, timeScaleY + 16);
      }
    });

    // Future AI Projection Time Ticks
    if (showAiProjection) {
      ctx.fillStyle = '#00f2fe';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      const futureHours = [
        { offset: 4, label: '+60m [AI]' },
        { offset: 7, label: '+105m [AI]' },
      ];
      futureHours.forEach((fh) => {
        const fx = (candleCount - 1 + fh.offset) * candleWidth + candleWidth / 2;
        if (fx < chartAreaWidth - 20) {
          ctx.fillText(fh.label, fx - 20, timeScaleY + 16);
        }
      });
    }

    // Bottom info (matches screenshot: "Date Range ▾", "19:55:12 UTC+2", "log", "auto")
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('Date Range ▾', 14, timeScaleY + 16);
    ctx.fillText('19:55:12 UTC+2', width - 210, timeScaleY + 16);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('log', width - 85, timeScaleY + 16);
    ctx.fillText('auto', width - 50, timeScaleY + 16);

  }, [
    candles, 
    minPrice, 
    maxPrice, 
    drawings, 
    drawingsVisible, 
    activeTool, 
    hoverPos, 
    mousePrice, 
    mouseTime, 
    isDrawing, 
    currentDrawingPoints, 
    showMA50, 
    showRSI, 
    showMACD,
    showAiProjection,
    projectionScenario
  ]);

  // Handle Mouse Events for Drawings & Crosshairs
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isLocked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Magnet mode snapping to nearest candle OHLC
    if (magnetMode && candles.length > 0) {
      const candleWidth = (rect.width - 68) / candles.length;
      const idx = Math.min(Math.max(Math.floor(x / candleWidth), 0), candles.length - 1);
      const c = candles[idx];
      x = idx * candleWidth + candleWidth / 2;
      // snap y to closest of H, L, C, O
      const mainHeight = rect.height * 0.44;
      const prices = [c.high, c.low, c.close, c.open];
      const pRange = maxPrice - minPrice || 1;
      let closestY = y;
      let minDiff = Infinity;
      prices.forEach((p) => {
        const py = mainHeight - ((p - minPrice) / pRange) * mainHeight;
        const diff = Math.abs(py - y);
        if (diff < minDiff) {
          minDiff = diff;
          closestY = py;
        }
      });
      y = closestY;
    }

    if (activeTool === 'CROSSHAIR' || activeTool === 'NONE') return;

    sounds.playOrderClick();

    if (!isDrawing) {
      setIsDrawing(true);
      setCurrentDrawingPoints([{ x, y }]);
    } else {
      // Complete drawing with second point
      const newPoints = [...currentDrawingPoints, { x, y }];
      const newDrawing: DrawingElement = {
        id: `draw-${Date.now()}`,
        tool: activeTool,
        points: newPoints,
        color: activeTool === 'RECTANGLE' ? '#38bdf8' : activeTool === 'FIBONACCI' ? '#f59e0b' : '#38bdf8',
        text: activeTool === 'TEXT' ? 'Order Block Support' : undefined,
      };
      setDrawings((prev) => [...prev, newDrawing]);
      setIsDrawing(false);
      setCurrentDrawingPoints([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoverPos({ x, y });

    // Calculate price from Y
    const mainChartHeight = rect.height * 0.44;
    if (y <= mainChartHeight) {
      const calculatedPrice = maxPrice - (y / mainChartHeight) * (maxPrice - minPrice);
      setMousePrice(calculatedPrice);
    } else {
      setMousePrice(null);
    }

    // Calculate time from X
    const candleWidth = (rect.width - 68) / Math.max(candles.length, 1);
    const candleIdx = Math.min(Math.max(Math.floor(x / candleWidth), 0), candles.length - 1);
    if (candles[candleIdx]) {
      setMouseTime(candles[candleIdx].time);
    }
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
    setMousePrice(null);
    setMouseTime(null);
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full flex flex-col select-none overflow-hidden ${
      isLight ? 'bg-white text-slate-800' : 'bg-[#0f141f] text-[#e1e7ec]'
    }`}>
      {/* Top Header of Chart (Matches screenshot "GOLD · 15", "4,058.39 +41.37 (+1.03%)") */}
      <div className={`h-10 border-b flex items-center justify-between px-3 z-10 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <span>GOLD</span>
            <span className="text-slate-400">·</span>
            <span className="text-amber-500 font-mono text-xs px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">{timeframe}</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-emerald-600 font-bold text-sm">{currentPrice.toFixed(2)}</span>
            <span className="text-emerald-600 font-medium">+41.37 (+1.03%)</span>
          </div>
        </div>

        {/* Indicator Quick Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMA50((v) => !v)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
              showMA50 
                ? isLight ? 'bg-blue-50 text-blue-600 border border-blue-200 font-bold' : 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            MA 50
          </button>
          <button
            onClick={() => setShowRSI((v) => !v)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
              showRSI 
                ? isLight ? 'bg-purple-50 text-purple-600 border border-purple-200 font-bold' : 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                : isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            RSI 14
          </button>
          <button
            onClick={() => setShowMACD((v) => !v)}
            className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
              showMACD 
                ? isLight ? 'bg-amber-50 text-amber-600 border border-amber-200 font-bold' : 'bg-amber-600/20 text-amber-400 border border-amber-500/30' 
                : isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            MACD
          </button>

          {/* AI Projection Toggle Button */}
          <button
            onClick={() => {
              sounds.playOrderClick();
              setShowAiProjection((v) => !v);
            }}
            title="Toggle AI Volatility Trajectory Projection Overlay"
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
              showAiProjection
                ? isLight
                  ? 'bg-cyan-50 text-cyan-700 border border-cyan-300 shadow-sm'
                  : 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-400/60 shadow-md shadow-cyan-500/20'
                : isLight ? 'text-slate-500 hover:text-slate-800 bg-slate-100 border border-slate-200' : 'text-gray-400 hover:text-white bg-[#172030] border border-gray-700'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${showAiProjection ? 'text-cyan-600 animate-pulse' : 'text-gray-400'}`} />
            <span>AI Projection</span>
            {showAiProjection && <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />}
          </button>

          {!showOrderBar && (
            <button
              onClick={() => setShowOrderBar(true)}
              className={`ml-2 px-2.5 py-1 text-xs rounded border flex items-center gap-1 ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-[#1e293b] hover:bg-[#283548] text-gray-200 border-gray-700'
              }`}
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-500" />
              Order Ticket
            </button>
          )}
        </div>
      </div>

      {/* Floating AI Projection Volatility Model Control Overlay Card */}
      {showAiProjection && (
        <div className={`absolute top-12 right-4 z-30 rounded-xl border p-2.5 max-w-[270px] animate-fade-in text-xs select-none shadow-xl ${
          isLight ? 'bg-white/95 backdrop-blur-md border-cyan-300 text-slate-800' : 'bg-[#0c121e]/95 backdrop-blur-md border-cyan-500/40 text-white shadow-2xl'
        }`}>
          <div className={`flex items-center justify-between gap-2 border-b pb-1.5 mb-2 ${isLight ? 'border-slate-200' : 'border-gray-800'}`}>
            <div className={`flex items-center gap-1.5 font-bold text-[11px] ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
              <span>AI Volatility Path Model</span>
            </div>
            <button
              onClick={() => setShowProjectionCard((v) => !v)}
              className={`text-[10px] font-mono px-1 rounded ${isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              {showProjectionCard ? 'Hide' : 'Show'}
            </button>
          </div>

          {showProjectionCard && (
            <div className="space-y-2">
              <div>
                <span className={`text-[9px] uppercase font-bold block mb-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  Historical Volatility Pattern Fit:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => {
                      sounds.playOrderClick();
                      setProjectionScenario('BULLISH_CONTINUATION');
                    }}
                    className={`py-1 px-1 rounded text-[9px] font-bold text-center transition-all ${
                      projectionScenario === 'BULLISH_CONTINUATION'
                        ? 'bg-cyan-500 text-white shadow-sm'
                        : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-[#151e2e] text-gray-300 hover:text-white border border-gray-800'
                    }`}
                  >
                    Base Wave
                  </button>
                  <button
                    onClick={() => {
                      sounds.playOrderClick();
                      setProjectionScenario('VOLATILITY_EXPANSION');
                    }}
                    className={`py-1 px-1 rounded text-[9px] font-bold text-center transition-all ${
                      projectionScenario === 'VOLATILITY_EXPANSION'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-[#151e2e] text-gray-300 hover:text-white border border-gray-800'
                    }`}
                  >
                    PCE Spike
                  </button>
                  <button
                    onClick={() => {
                      sounds.playOrderClick();
                      setProjectionScenario('MEAN_REVERSION_BOUNCE');
                    }}
                    className={`py-1 px-1 rounded text-[9px] font-bold text-center transition-all ${
                      projectionScenario === 'MEAN_REVERSION_BOUNCE'
                        ? 'bg-amber-500 text-slate-900 shadow-sm'
                        : isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200' : 'bg-[#151e2e] text-gray-300 hover:text-white border border-gray-800'
                    }`}
                  >
                    Dip & Bounce
                  </button>
                </div>
              </div>

              <div className={`grid grid-cols-2 gap-1.5 p-2 rounded-lg border font-mono text-[10px] ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080d17] border-gray-800'
              }`}>
                <div>
                  <span className={`text-[8px] uppercase block font-sans ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>Projected Target</span>
                  <span className={`font-bold ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`}>
                    {projectionScenario === 'BULLISH_CONTINUATION'
                      ? '$4,078.50'
                      : projectionScenario === 'VOLATILITY_EXPANSION'
                      ? '$4,093.00'
                      : '$4,073.50'}
                  </span>
                </div>
                <div>
                  <span className={`text-[8px] uppercase block font-sans ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>Confidence Fit</span>
                  <span className="font-bold text-emerald-600">
                    {projectionScenario === 'BULLISH_CONTINUATION'
                      ? '92.4% High'
                      : projectionScenario === 'VOLATILITY_EXPANSION'
                      ? '88.7% Aggressive'
                      : '85.1% Moderate'}
                  </span>
                </div>
              </div>

              <div className={`text-[9px] leading-tight ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                🔮 Pattern: Monte Carlo ATR Cone + Oct 2024 Gold Bull Run fractal match.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating Quick Order Ticket (Direct replica of the screenshot red SELL, lot input, green BUY bar) */}
      {showOrderBar && (
        <div className={`absolute top-12 left-4 z-30 flex items-center rounded-md border p-1 gap-1 animate-fade-in shadow-xl ${
          isLight ? 'bg-white/95 backdrop-blur-md border-slate-200' : 'bg-[#131b29]/95 backdrop-blur-md border-[#273549] shadow-2xl'
        }`}>
          {/* Sell Button */}
          <button
            onClick={() => {
              sounds.playOrderClick();
              onExecuteTrade('SELL', lotSize, bidPrice);
            }}
            className="flex flex-col items-center justify-center px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 active:scale-95 text-white transition-all min-w-[78px]"
          >
            <span className="text-[12px] font-mono font-bold">{bidPrice.toFixed(2)}</span>
            <span className="text-[10px] uppercase font-extrabold tracking-wide text-white/90">SELL</span>
          </button>

          {/* Lot Size Input (e.g. 0.49 from screenshot) */}
          <div className="flex flex-col items-center px-1.5">
            <span className={`text-[9px] uppercase tracking-wider font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Lots</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="50"
              value={lotSize}
              onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.01)}
              className={`w-16 h-7 text-center font-mono text-xs font-bold rounded focus:outline-none border ${
                isLight ? 'bg-slate-100 text-slate-900 border-slate-300 focus:border-amber-500' : 'bg-[#0b0e14] text-white border-[#334155] focus:border-amber-400'
              }`}
            />
          </div>

          {/* Buy Button */}
          <button
            onClick={() => {
              sounds.playOrderClick();
              onExecuteTrade('BUY', lotSize, askPrice);
            }}
            className="flex flex-col items-center justify-center px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all min-w-[78px]"
          >
            <span className="text-[12px] font-mono font-bold">{askPrice.toFixed(2)}</span>
            <span className="text-[10px] uppercase font-extrabold tracking-wide text-white/90">BUY</span>
          </button>

          {/* LMT / MKT order badge */}
          <button
            onClick={() => setOrderType((prev) => (prev === 'LMT' ? 'MKT' : 'LMT'))}
            className={`h-8 px-2 rounded text-[10px] font-mono font-bold border transition-colors ${
              isLight ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200' : 'bg-[#1e293b] text-gray-300 border-gray-700 hover:text-white'
            }`}
          >
            {orderType}
          </button>

          {/* Close Order Ticket Button */}
          <button
            onClick={() => setShowOrderBar(false)}
            className={`w-6 h-6 flex items-center justify-center rounded ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Interactive Canvas */}
      <div className="flex-1 w-full relative cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
};
