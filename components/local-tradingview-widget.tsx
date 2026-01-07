"use client";

import { useEffect, useRef, memo } from "react";
import Script from "next/script";

interface LocalTradingViewWidgetProps {
    theme?: "light" | "dark";
    backgroundColor?: string;
    toolbar_bg?: string;
    gridColor?: string;
    candleUpColor?: string;
    candleDownColor?: string;
    autosize?: boolean;
    customCssUrl?: string;
}

declare global {
    interface Window {
        TradingView: any;
    }
}

function LocalTradingViewWidget({
    theme = "dark",
    backgroundColor,
    toolbar_bg,
    gridColor,
    candleUpColor,
    candleDownColor,
    autosize = true,
    customCssUrl,
}: LocalTradingViewWidgetProps) {
    const containerId = useRef(`tv_chart_container_${Math.random().toString(36).substring(7)}`);
    const widgetRef = useRef<any>(null);

    useEffect(() => {
        if (!window.TradingView) return;

        const baseSettings = {
            container: containerId.current,
            library_path: "/charting_library/",
            autosize: autosize,
            symbol: "BINANCE:BTCUSDT",
            interval: "15",
            timezone: "Etc/UTC",
            theme: theme,
            style: "1",
            locale: "en",
            enable_publishing: false,
            allow_symbol_change: true,
            // overrides for the library are passed directly in 'overrides' object
        };

        const overrides: any = {};
        if (backgroundColor) overrides["paneProperties.background"] = backgroundColor;
        if (gridColor) {
            overrides["paneProperties.vertGridProperties.color"] = gridColor;
            overrides["paneProperties.horzGridProperties.color"] = gridColor;
        }
        if (candleUpColor) overrides["mainSeriesProperties.candleStyle.upColor"] = candleUpColor;
        if (candleDownColor) overrides["mainSeriesProperties.candleStyle.downColor"] = candleDownColor;

        const widgetOptions: any = {
            ...baseSettings,
            overrides: overrides,
        };

        if (backgroundColor) widgetOptions.backgroundColor = backgroundColor; // Widget background
        if (toolbar_bg) widgetOptions.toolbar_bg = toolbar_bg;
        if (customCssUrl) widgetOptions.custom_css_url = customCssUrl;

        // Cleanup previous widget if exists
        if (widgetRef.current) {
            try {
                widgetRef.current.remove();
            } catch (e) { /* ignore */ }
        }

        // Initialize Widget
        if (document.getElementById(containerId.current)) {
            widgetRef.current = new window.TradingView.widget(widgetOptions);
        }

        return () => {
            if (widgetRef.current) {
                try {
                    widgetRef.current.remove();
                } catch (e) { /* ignore */ }
                widgetRef.current = null;
            }
        }

    }, [theme, backgroundColor, toolbar_bg, gridColor, candleUpColor, candleDownColor, autosize, customCssUrl]);

    return (
        <>
            <Script
                src="/charting_library/charting_library.standalone.js"
                strategy="lazyOnload"
                onLoad={() => {
                    // Trigger a re-render or effect if needed, but the effect depends on window.TradingView
                    // We can force forceUpdate or just let the effect run if it depeneds on a state
                    // Actually, simply setting a state here to true will trigger the effect
                    // But let's keep it simple. If window.TradingView becomes available, we might need to trigger the effect.
                    // A simple way is to use a state 'libLoaded'
                    window.dispatchEvent(new Event('tv-lib-loaded'));
                }}
            />
            <div
                id={containerId.current}
                className="tradingview-widget-container"
                style={{ height: "100%", width: "100%" }}
            />
        </>
    );
}

// Wrapper to handle library loading state
export default function LocalTradingViewWidgetWrapper(props: LocalTradingViewWidgetProps) {
    const [libLoaded, setLibLoaded] = require("react").useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.TradingView) {
            setLibLoaded(true);
        }

        const handleLoad = () => setLibLoaded(true);
        window.addEventListener('tv-lib-loaded', handleLoad);
        return () => window.removeEventListener('tv-lib-loaded', handleLoad);
    }, []);

    // Also check periodically just in case script loads without event if cached
    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof window !== 'undefined' && window.TradingView) {
                setLibLoaded(true);
                clearInterval(interval);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    if (!libLoaded) {
        return (
            <>
                <Script
                    src="/charting_library/charting_library.standalone.js"
                    onLoad={() => setLibLoaded(true)}
                />
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Loading Charting Library...
                </div>
            </>
        )
    }

    return <LocalTradingViewWidget {...props} />;
}
