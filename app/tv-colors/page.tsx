"use client";

import { useState } from "react";
import ThemeableTradingViewWidget from "@/components/themeable-tradingview-widget";
import clsx from "clsx";

interface ThemeConfig {
    name: string;
    theme: "light" | "dark";
    backgroundColor: string;
    toolbar_bg: string;
    activeClass: string;
    cssFile?: string;
}

const THEMES: ThemeConfig[] = [
    {
        name: "Dark",
        theme: "dark",
        backgroundColor: "#131722",
        toolbar_bg: "#1e222d",
        activeClass: "bg-gray-800 text-white ring-2 ring-gray-600",
    },
    {
        name: "Light",
        theme: "light",
        backgroundColor: "#ffffff",
        toolbar_bg: "#f1f3f6",
        activeClass: "bg-white text-black ring-2 ring-gray-300",
    },
    {
        name: "Blue",
        theme: "dark",
        backgroundColor: "#0F172A", // Slate 900
        toolbar_bg: "#1E293B", // Slate 800
        activeClass: "bg-slate-900 text-white ring-2 ring-blue-500",
        cssFile: "blue.css",
    },
    {
        name: "Green",
        theme: "dark",
        backgroundColor: "#064E3B", // Emerald 900
        toolbar_bg: "#065F46", // Emerald 800
        activeClass: "bg-emerald-900 text-white ring-2 ring-emerald-500",
        cssFile: "green.css",
    },
    {
        name: "Purple",
        theme: "dark",
        backgroundColor: "#3B0764", // Purple 950
        toolbar_bg: "#4C1D95", // Violet 900
        activeClass: "bg-purple-900 text-white ring-2 ring-purple-500",
        cssFile: "purple.css",
    },
];

const TICKERS = [
    { symbol: "BTC/USDT", price: "91,921.55", change: "-1.72%", isUp: false },
    { symbol: "BNB/USDT", price: "910.49", change: "-0.11%", isUp: false },
    { symbol: "ETH/USDT", price: "3,217.04", change: "-0.37%", isUp: false },
    { symbol: "SOL/USDT", price: "137.58", change: "-0.29%", isUp: false },
    { symbol: "XRP/USDT", price: "2.247", change: "-4.84%", isUp: false },
    { symbol: "AVAX/USDT", price: "14.49", change: "+0.21%", isUp: true },
    { symbol: "TRX/USDT", price: "0.2947", change: "+1.13%", isUp: true },
];

export default function TvColorsPage() {
    const [activeThemeIndex, setActiveThemeIndex] = useState(0);
    const activeTheme = THEMES[activeThemeIndex];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-4">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col gap-4">

                    {/* Header & Theme Switcher */}
                    <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-[#1e1e1e] p-4 rounded-lg shadow-sm">
                        <h1 className="text-2xl font-bold mb-4 md:mb-0">TradingView Theme Test</h1>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {THEMES.map((theme, index) => (
                                <button
                                    key={theme.name}
                                    onClick={() => setActiveThemeIndex(index)}
                                    className={clsx(
                                        "px-4 py-2 rounded-md transition-all duration-200 font-medium",
                                        activeThemeIndex === index
                                            ? theme.activeClass
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    )}
                                >
                                    {theme.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 h-[800px]">
                        {/* Sidebar (Mock Data) */}
                        <div className="w-full lg:w-[350px] bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm flex flex-col overflow-hidden shrink-0">
                            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="relative mb-3">
                                    <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</i>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="w-full bg-gray-100 dark:bg-[#2a2a2a] text-sm rounded px-9 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <span className="text-blue-500 cursor-pointer">All</span>
                                    <span className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">USDT</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-200 dark:border-gray-700">
                                <div>Pair</div>
                                <div className="text-right">Price</div>
                                <div className="text-right">Change</div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {TICKERS.map((ticker) => (
                                    <div key={ticker.symbol} className="grid grid-cols-3 px-3 py-3 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{ticker.symbol}</span>
                                        </div>
                                        <div className="text-right font-medium text-sm">{ticker.price}</div>
                                        <div className={clsx("text-right text-xs font-medium", ticker.isUp ? "text-green-500" : "text-red-500")}>
                                            {ticker.change}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Chart Area */}
                        <div className="flex-1 bg-white dark:bg-[#1e1e1e] rounded-lg shadow-sm flex flex-col overflow-hidden">
                            <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                                    <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">₿</div>
                                    <div>
                                        <h2 className="text-xl font-bold leading-tight">BTC/USDT</h2>
                                        <div className="text-xs text-gray-500">Bitcoin / TetherUS</div>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-right">
                                    <div>
                                        <div className="text-lg font-bold">91,921.55</div>
                                        <div className="text-xs text-red-500">-1.72%</div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="text-xs text-gray-400">24h High</div>
                                        <div className="text-sm font-medium">94,444.44</div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="text-xs text-gray-400">24h Low</div>
                                        <div className="text-sm font-medium">91,262.94</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 relative">
                                <ThemeableTradingViewWidget
                                    theme={activeTheme.theme}
                                    backgroundColor={activeTheme.backgroundColor}
                                    toolbar_bg={activeTheme.toolbar_bg}
                                    autosize={true}
                                    customCssUrl={activeTheme.cssFile && typeof window !== 'undefined' ? `${window.location.origin}/tv-themes/${activeTheme.cssFile}` : undefined}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
