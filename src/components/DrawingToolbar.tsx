import React from 'react';
import { 
  Crosshair, 
  TrendingUp, 
  Layers, 
  Square, 
  Type, 
  Smile, 
  Ruler, 
  ZoomIn, 
  Magnet, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Trash2 
} from 'lucide-react';
import { DrawingTool } from '../types/trading';

interface DrawingToolbarProps {
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
  magnetMode: boolean;
  setMagnetMode: (mode: boolean | ((prev: boolean) => boolean)) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean | ((prev: boolean) => boolean)) => void;
  drawingsVisible: boolean;
  setDrawingsVisible: (visible: boolean | ((prev: boolean) => boolean)) => void;
  onClearDrawings: () => void;
  drawingsCount: number;
  theme?: 'light' | 'dark';
}

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  activeTool,
  setActiveTool,
  magnetMode,
  setMagnetMode,
  isLocked,
  setIsLocked,
  drawingsVisible,
  setDrawingsVisible,
  onClearDrawings,
  drawingsCount,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  const tools: { id: DrawingTool; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { id: 'CROSSHAIR', label: 'Crosshair / Pointer', icon: <Crosshair className="w-4 h-4" />, shortcut: 'C' },
    { id: 'TRENDLINE', label: 'Trendline & Ray', icon: <TrendingUp className="w-4 h-4" />, shortcut: 'T' },
    { id: 'FIBONACCI', label: 'Fibonacci Retracement (0.236-0.786)', icon: <Layers className="w-4 h-4" />, shortcut: 'F' },
    { id: 'RECTANGLE', label: 'Order Block / Zone Box', icon: <Square className="w-4 h-4" />, shortcut: 'B' },
    { id: 'TEXT', label: 'Text Annotation', icon: <Type className="w-4 h-4" />, shortcut: 'A' },
    { id: 'STICKER', label: 'Sentiment Sticker (Bullish/Bearish)', icon: <Smile className="w-4 h-4" />, shortcut: 'S' },
    { id: 'MEASURE_RULER', label: 'Measure Tool (Pips & Price Range)', icon: <Ruler className="w-4 h-4" />, shortcut: 'M' },
    { id: 'ZOOM', label: 'Zoom In / Magnify Window', icon: <ZoomIn className="w-4 h-4" />, shortcut: 'Z' },
  ];

  return (
    <aside className={`w-12 flex flex-col items-center py-2 select-none z-20 shrink-0 border-r transition-colors ${
      isLight ? 'bg-white border-slate-200' : 'bg-[#0e131d] border-[#1e293b]'
    }`}>
      {/* Primary Chart Tools */}
      <div className="flex flex-col gap-1 w-full items-center">
        {tools.map((item) => {
          const isActive = activeTool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTool(isActive ? 'CROSSHAIR' : item.id)}
              title={`${item.label} [${item.shortcut}]`}
              className={`w-9 h-9 rounded flex items-center justify-center transition-all relative group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-[#848e9c] hover:text-[#d1d4dc] hover:bg-[#1a2333]'
              }`}
            >
              {item.icon}
              {/* Tooltip */}
              <div className="hidden group-hover:block absolute left-12 top-1/2 -translate-y-1/2 bg-slate-900 text-xs text-white px-2.5 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
                <span className="font-medium">{item.label}</span>
                <span className="ml-2 text-slate-400 font-mono text-[10px]">[{item.shortcut}]</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className={`w-6 h-[1px] my-2 ${isLight ? 'bg-slate-200' : 'bg-[#1e293b]'}`} />

      {/* Utilities & Modes */}
      <div className="flex flex-col gap-1 w-full items-center">
        {/* Magnet Mode */}
        <button
          onClick={() => setMagnetMode((prev) => !prev)}
          title={magnetMode ? 'Magnet Mode ON (Snap to OHLC)' : 'Magnet Mode OFF'}
          className={`w-9 h-9 rounded flex items-center justify-center transition-all relative group ${
            magnetMode
              ? isLight
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'bg-[#00b0ff]/20 text-[#00b0ff] border border-[#00b0ff]/50'
              : isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#848e9c] hover:text-[#d1d4dc] hover:bg-[#1a2333]'
          }`}
        >
          <Magnet className="w-4 h-4" />
          <div className="hidden group-hover:block absolute left-12 top-1/2 -translate-y-1/2 bg-slate-900 text-xs text-white px-2.5 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
            Magnet Snapping ({magnetMode ? 'ON' : 'OFF'})
          </div>
        </button>

        {/* Lock Drawings */}
        <button
          onClick={() => setIsLocked((prev) => !prev)}
          title={isLocked ? 'Drawings Locked' : 'Drawings Unlocked'}
          className={`w-9 h-9 rounded flex items-center justify-center transition-all relative group ${
            isLocked
              ? isLight
                ? 'bg-amber-50 text-amber-600 border border-amber-300'
                : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/50'
              : isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#848e9c] hover:text-[#d1d4dc] hover:bg-[#1a2333]'
          }`}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <div className="hidden group-hover:block absolute left-12 top-1/2 -translate-y-1/2 bg-slate-900 text-xs text-white px-2.5 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
            {isLocked ? 'Unlock All Drawings' : 'Lock All Drawings'}
          </div>
        </button>

        {/* Hide / Show Drawings */}
        <button
          onClick={() => setDrawingsVisible((prev) => !prev)}
          title={drawingsVisible ? 'Hide Drawings & Indicators' : 'Show Drawings & Indicators'}
          className={`w-9 h-9 rounded flex items-center justify-center transition-all relative group ${
            !drawingsVisible
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : isLight
              ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              : 'text-[#848e9c] hover:text-[#d1d4dc] hover:bg-[#1a2333]'
          }`}
        >
          {drawingsVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <div className="hidden group-hover:block absolute left-12 top-1/2 -translate-y-1/2 bg-slate-900 text-xs text-white px-2.5 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
            {drawingsVisible ? 'Hide Drawings' : 'Show Drawings'}
          </div>
        </button>

        {/* Clear Drawings Trash Can */}
        <button
          onClick={onClearDrawings}
          disabled={drawingsCount === 0}
          title={`Clear Drawings (${drawingsCount})`}
          className="w-9 h-9 rounded flex items-center justify-center transition-all relative group text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-300"
        >
          <Trash2 className="w-4 h-4" />
          <div className="hidden group-hover:block absolute left-12 top-1/2 -translate-y-1/2 bg-slate-900 text-xs text-white px-2.5 py-1 rounded shadow-xl border border-slate-700 whitespace-nowrap z-50 pointer-events-none">
            Clear All Drawings ({drawingsCount})
          </div>
        </button>
      </div>
    </aside>
  );
};
