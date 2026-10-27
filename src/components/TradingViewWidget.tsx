import React, { useEffect, useRef } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'dark' | 'light';
  interval?: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol = 'OANDA:XAUUSD',
  theme = 'dark',
  interval = '15',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget script
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#0f141f',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies',
          ],
          hide_side_toolbar: false,
          withdateranges: true,
          save_image: false,
          details: true,
          hotlist: true,
          calendar: true,
        });
      }
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, theme, interval]);

  const widgetId = `tradingview_${symbol.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <div className="w-full h-full relative bg-[#0f141f] min-h-[500px]">
      <div 
        id={widgetId} 
        ref={containerRef} 
        className="w-full h-full"
      />
    </div>
  );
};
