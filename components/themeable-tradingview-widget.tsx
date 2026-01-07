"use client";

import { useEffect, useRef, memo } from "react";

interface ThemeableTradingViewWidgetProps {
    theme?: "light" | "dark";
    backgroundColor?: string;
    toolbar_bg?: string;
    gridColor?: string;
    candleUpColor?: string;
    candleDownColor?: string;
    autosize?: boolean;
    customCssUrl?: string;
}

function ThemeableTradingViewWidget({
    theme = "dark",
    backgroundColor,
    toolbar_bg,
    gridColor,
    candleUpColor,
    candleDownColor,
    autosize = true,
}: ThemeableTradingViewWidgetProps) {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src =
            "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;

        const baseSettings = {
            autosize: autosize,
            symbol: "BINANCE:BTCUSDT",
            interval: "15",
            timezone: "Etc/UTC",
            theme: theme,
            style: "1",
            locale: "en",
            enable_publishing: false,
            allow_symbol_change: true,
            support_host: "https://www.tradingview.com",
        };

        // Add overrides if provided
        const overrides: any = {};
        if (backgroundColor) overrides["paneProperties.background"] = backgroundColor;
        if (gridColor) {
            overrides["paneProperties.vertGridProperties.color"] = gridColor;
            overrides["paneProperties.horzGridProperties.color"] = gridColor;
        }
        if (candleUpColor) overrides["mainSeriesProperties.candleStyle.upColor"] = candleUpColor;
        if (candleDownColor) overrides["mainSeriesProperties.candleStyle.downColor"] = candleDownColor;

        // Construct the widget config settings
        const widgetConfig: any = {
            ...baseSettings,
        };

        if (backgroundColor) widgetConfig.backgroundColor = backgroundColor;
        if (toolbar_bg) widgetConfig.toolbar_bg = toolbar_bg;

        // Note: The 'overrides' property works for the charting library, but for the widget 
        // strictly speaking, only specific properties are exposed. 
        // However, we can try to pass them or use the available widget properties.
        // The Standard Widget API is more limited than the library. 
        // We will use standard available styling props.

        // Attempting to pass overrides in the widget JSON effectively usually requires specific widget support.
        // For standard widget, we rely on 'theme', 'toolbar_bg' and undocumented 'overrides' if supported, 
        // but mostly 'backgroundColor' is supported in some versions.
        // Let's stick to what we know works for sure in the widget or fallback to standard themes.

        script.innerHTML = JSON.stringify(widgetConfig);

        if (container.current) {
            container.current.innerHTML = "";
            container.current.appendChild(script);
        }
    }, [theme, backgroundColor, toolbar_bg, gridColor, candleUpColor, candleDownColor, autosize]);

    return (
        <div
            className="tradingview-widget-container"
            ref={container}
            style={{ height: "100%", width: "100%" }}
        >
            <div
                className="tradingview-widget-container__widget"
                style={{ height: "calc(100% - 32px)", width: "100%" }}
            ></div>
        </div>
    );
}

export default memo(ThemeableTradingViewWidget);
