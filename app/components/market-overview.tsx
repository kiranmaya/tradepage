"use client";

import { useBinanceTickers, Ticker } from "../hooks/use-binance-tickers";
import { useMemo } from "react";
import { X, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import PriceFlash from "./price-flash";

interface MarketOverviewProps {
    onClose: () => void;
}

function StatCard({ title, icon: Icon, data, type }: { title: string, icon: any, data: Ticker[], type: "gainers" | "losers" | "volume" }) {
    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase text-gray-500">
                <Icon size={14} />
                <span>{title}</span>
            </div>
            <div className="space-y-2">
                {data.map(t => (
                    <div key={t.symbol} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{t.symbol.replace("USDT", "")}</span>
                        <div className="flex flex-col items-end">
                            <span className="font-mono">{t.lastPrice}</span>
                            {type === "volume" ? (
                                <span className="text-[10px] text-gray-500">{new Intl.NumberFormat('en-US', { notation: "compact" }).format(t.volume)}</span>
                            ) : (
                                <span className={cn("text-[10px] font-bold", t.priceChangePercent >= 0 ? "text-green-500" : "text-red-500")}>
                                    {t.priceChangePercent > 0 ? "+" : ""}{t.priceChangePercent.toFixed(2)}%
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function MarketOverview({ onClose }: MarketOverviewProps) {
    const { tickers } = useBinanceTickers();

    const stats = useMemo(() => {
        if (!tickers.length) return null;
        const sortedByChange = [...tickers].sort((a, b) => b.priceChangePercent - a.priceChangePercent);
        const sortedByVol = [...tickers].sort((a, b) => b.volume - a.volume);

        return {
            gainers: sortedByChange.slice(0, 5),
            losers: sortedByChange.slice(-5).reverse(),
            volume: sortedByVol.slice(0, 5)
        };
    }, [tickers]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 w-[800px] h-[500px] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-black tracking-tight uppercase">Market Overview</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 grid grid-cols-3 gap-6 overflow-y-auto">
                    {stats ? (
                        <>
                            <StatCard title="Top Gainers" icon={TrendingUp} data={stats.gainers} type="gainers" />
                            <StatCard title="Top Losers" icon={TrendingDown} data={stats.losers} type="losers" />
                            <StatCard title="Highest Volume" icon={Activity} data={stats.volume} type="volume" />

                            {/* Sentiment Section */}
                            <div className="col-span-3 mt-4">
                                <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">Market Sentiment</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Long / Short Ratio (24h)</div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                                <div className="bg-green-500 h-full" style={{ width: "52%" }}></div>
                                                <div className="bg-red-500 h-full" style={{ width: "48%" }}></div>
                                            </div>
                                            <div className="text-xs font-mono">
                                                <span className="text-green-500">52.1%</span> / <span className="text-red-500">47.9%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <div className="text-xs text-gray-500 uppercase mb-1">Volatiity Index</div>
                                        <div className="text-xl font-black text-yellow-500">HIGH</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-3 text-center py-20 text-gray-500">Loading Market Data...</div>
                    )}
                </div>
            </div>
        </div>
    );
}
