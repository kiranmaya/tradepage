"use client";

import { useMemo, useState } from "react";
import PriceFlash from "./price-flash";
import { MarketTrade } from "../hooks/use-binance-market";
import { Filter, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface TradeFeedProps {
    trades: MarketTrade[];
}

export default function TradeFeed({ trades }: TradeFeedProps) {
    const [minSize, setMinSize] = useState<number>(0);
    const [soundEnabled, setSoundEnabled] = useState(false);

    const filteredTrades = useMemo(() => {
        return trades.filter((t) => {
            const size = parseFloat(t.size);
            const price = parseFloat(t.price.replace(/,/g, ""));
            const value = size * price;

            // Determine if visual highlight needed (e.g. > 10k)
            // We'll pass this as a prop or class later

            return value >= minSize;
        });
    }, [trades, minSize]);

    // Audio effect for whales (mock implementation for now)
    // useEffect(() => {
    //   if (soundEnabled && filteredTrades.length > 0) {
    //       const latest = filteredTrades[0];
    //       // Check if very recent...
    //   }
    // }, [filteredTrades]);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            {/* Header / Controls */}
            <div className="flex justify-between items-center p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center gap-1 font-bold text-[10px] uppercase text-gray-500">
                    <span>Trades</span>
                    <span className="text-gray-400 font-normal">({filteredTrades.length})</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Filter Dropdown (Simplified as buttons for now) */}
                    <select
                        className="bg-transparent text-[10px] border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 outline-none focus:border-yellow-500"
                        value={minSize}
                        onChange={(e) => setMinSize(Number(e.target.value))}
                    >
                        <option value={0}>All</option>
                        <option value={1000}>&gt; $1k</option>
                        <option value={10000}>&gt; $10k</option>
                        <option value={50000}>🐳 &gt; $50k</option>
                    </select>

                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={cn("p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800", soundEnabled ? "text-yellow-600" : "text-gray-400")}
                        title="Whale Alert Sound"
                    >
                        {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto no-scrollbar p-1 space-y-0.5">
                <div className="grid grid-cols-3 text-[9px] text-gray-400 font-medium px-1 mb-1 bg-gray-50 dark:bg-gray-800/20 py-1">
                    <span>Price</span>
                    <span className="text-right">Amt(BTC)</span>
                    <span className="text-right">Time</span>
                </div>

                {filteredTrades.map((t, i) => {
                    const isWhale = parseFloat(t.size) * parseFloat(t.price.replace(/,/g, "")) > 50000;
                    return (
                        <div key={i} className={cn(
                            "grid grid-cols-3 text-[10px] font-mono px-1 py-0.5 border-b border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                            isWhale ? "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-100 dark:border-yellow-500/20" : "opacity-90"
                        )}>
                            <PriceFlash
                                value={t.price}
                                className={cn(
                                    t.side === 'buy' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500',
                                    "font-medium"
                                )}
                            />
                            <span className={cn("text-right", isWhale ? "text-yellow-600 dark:text-yellow-500 font-bold" : "text-gray-600 dark:text-gray-400")}>
                                {t.size}
                            </span>
                            <span className="text-right text-gray-500 dark:text-gray-600">{t.time}</span>
                        </div>
                    );
                })}
                {filteredTrades.length === 0 && (
                    <div className="text-center text-[10px] text-gray-400 py-4 italic">
                        Waiting for trades...
                    </div>
                )}
            </div>
        </div>
    );
}
