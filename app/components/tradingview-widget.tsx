"use client";

import { useEffect, useRef, memo } from "react";
import { useTheme } from "next-themes";

interface TradingViewWidgetProps {
    symbol?: string;
    theme?: string;
}

function TradingViewWidget({ symbol = "BINANCE:BTCUSDT" }: TradingViewWidgetProps) {
    const container = useRef<HTMLDivElement>(null);

    const { theme: systemTheme } = useTheme();
    // Use prop theme if provided, else system theme

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        // Ensure symbol has exchange prefix if missing
        const s = symbol.includes(":") ? symbol : `BINANCE:${symbol}`;

        script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${s}",
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "${systemTheme === 'light' ? 'light' : 'dark'}",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com"
      }`;

        if (container.current) {
            container.current.innerHTML = "";
            container.current.appendChild(script);
        }
    }, [systemTheme, symbol]);

    return (
        <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
            <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
        </div>
    );
}

export default memo(TradingViewWidget);
