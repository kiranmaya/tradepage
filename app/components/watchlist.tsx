"use client";

import { useBinanceTickers, Ticker } from "../hooks/use-binance-tickers";
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

function SearchInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    return (
        <div className="relative mb-2">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-gray-500" />
            <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 dark:bg-gray-800 text-xs px-7 py-2 rounded border border-transparent focus:border-yellow-500 outline-none"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default function Watchlist({ onSelect }: { onSelect?: (symbol: string) => void }) {
    const { tickers, status } = useBinanceTickers();
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"vol" | "change" | "symbol">("vol");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [tab, setTab] = useState<"markets" | "news">("markets");

    const sortedTickers = useMemo(() => {
        let data = [...tickers];

        // Filter
        if (search) {
            const q = search.toUpperCase();
            data = data.filter(t => t.symbol.includes(q));
        }

        // Sort
        data.sort((a, b) => {
            let valA, valB;
            switch (sortBy) {
                case "change":
                    valA = a.priceChangePercent;
                    valB = b.priceChangePercent;
                    break;
                case "symbol":
                    valA = a.symbol;
                    valB = b.symbol;
                    break;
                case "vol":
                default:
                    valA = a.volume;
                    valB = b.volume;
            }
            return sortDir === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        });

        return data;
    }, [tickers, search, sortBy, sortDir]);

    const toggleSort = (key: typeof sortBy) => {
        if (sortBy === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortBy(key);
            setSortDir("desc");
        }
    };

    const newsItems = [
        { id: 1, title: "Bitcoin Breaks $100k Resistance Level", time: "2m ago", sentiment: "positive" },
        { id: 2, title: "SEC Approves New Ethereum ETF", time: "15m ago", sentiment: "positive" },
        { id: 3, title: "Binance Announces System Maintenance", time: "1h ago", sentiment: "neutral" },
        { id: 4, title: "Solana Network Congestion Reports", time: "2h ago", sentiment: "negative" },
        { id: 5, title: "Fed Chair Powell Speaks on Interest Rates", time: "3h ago", sentiment: "neutral" },
    ];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300">
            {/* Tab Switcher */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
                <button
                    onClick={() => setTab("markets")}
                    className={cn("flex-1 py-3 font-bold uppercase hover:bg-gray-50 dark:hover:bg-gray-900 border-b-2 transition-colors text-[10px]", tab === "markets" ? "border-yellow-500 text-yellow-600 dark:text-yellow-500" : "border-transparent text-gray-400")}
                >
                    Markets
                </button>
                <button
                    onClick={() => setTab("news")}
                    className={cn("flex-1 py-3 font-bold uppercase hover:bg-gray-50 dark:hover:bg-gray-900 border-b-2 transition-colors text-[10px]", tab === "news" ? "border-yellow-500 text-yellow-600 dark:text-yellow-500" : "border-transparent text-gray-400")}
                >
                    News
                </button>
            </div>

            {tab === "markets" ? (
                <>
                    {/* Header */}
                    <div className="p-2 border-b border-gray-200 dark:border-gray-800 shrink-0">
                        <div className="flex justify-between items-center mb-2">
                            <span className={cn("text-[10px] uppercase font-mono", status === "connected" ? "text-green-500" : "text-amber-500")}>
                                {status === "connected" ? "LIVE FEED" : status}
                            </span>
                        </div>
                        <SearchInput value={search} onChange={setSearch} />

                        {/* Column Headers */}
                        <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-500 mt-2 px-1">
                            <button onClick={() => toggleSort("symbol")} className="hover:text-gray-900 dark:hover:text-gray-300">Symbol</button>
                            <div className="flex gap-4">
                                <button onClick={() => toggleSort("vol")} className="hover:text-gray-900 dark:hover:text-gray-300">Vol</button>
                                <button onClick={() => toggleSort("change")} className="hover:text-gray-900 dark:hover:text-gray-300">24h%</button>
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {sortedTickers.length === 0 && status === "connected" && (
                            <div className="p-4 text-center text-gray-500">Loading...</div>
                        )}

                        {sortedTickers.map((t) => (
                            <div
                                key={t.symbol}
                                className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer border-b border-gray-100 dark:border-gray-800/50"
                                onClick={() => onSelect && onSelect(t.symbol)}
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 dark:text-gray-200 text-xs">{t.symbol.replace("USDT", "")}</span>
                                    <span className="text-[10px] text-gray-400">Vol {new Intl.NumberFormat('en-US', { notation: "compact" }).format(t.volume)}</span>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="font-mono text-gray-800 dark:text-gray-200">{t.lastPrice}</span>
                                    <span className={cn("text-[10px] font-mono", t.priceChangePercent >= 0 ? "text-green-500" : "text-red-500")}>
                                        {t.priceChangePercent > 0 ? "+" : ""}{t.priceChangePercent.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="flex-1 overflow-y-auto p-2 space-y-3 no-scrollbar">
                    {newsItems.map(item => (
                        <div key={item.id} className="border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900/50 p-2 rounded transition-colors cursor-pointer">
                            <div className="flex justify-between items-start mb-1">
                                <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded",
                                    item.sentiment === 'positive' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                        item.sentiment === 'negative' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                )}>
                                    {item.sentiment}
                                </span>
                                <span className="text-[9px] text-gray-400">{item.time}</span>
                            </div>
                            <h4 className="font-medium text-gray-800 dark:text-gray-200 leading-tight text-xs">{item.title}</h4>
                        </div>
                    ))}
                    <div className="text-center text-[10px] text-gray-400 italic mt-8 border-t border-gray-100 dark:border-gray-800 pt-4">
                        News Feed Connected
                    </div>
                </div>
            )}

        </div>
    );
}
