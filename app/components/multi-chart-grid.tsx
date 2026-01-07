"use client";

import { useState } from "react";
import TradingViewWidget from "./tradingview-widget";
import { Grid2X2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MultiChartGrid() {
    const [layout, setLayout] = useState<"single" | "quad">("single");
    // Hardcoded symbols for now or allow user selection later
    const [symbols, setSymbols] = useState(["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:SOLUSDT", "BINANCE:DOGEUSDT"]);

    return (
        <div className="w-full h-full flex flex-col relative group">
            {/* Layout Controls - Transparent Overlay appearing on hover */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur rounded p-1">
                <button
                    onClick={() => setLayout("single")}
                    className={cn("p-1 rounded hover:bg-white/20", layout === "single" ? "text-yellow-500" : "text-gray-400")}
                >
                    <Square size={16} />
                </button>
                <button
                    onClick={() => setLayout("quad")}
                    className={cn("p-1 rounded hover:bg-white/20", layout === "quad" ? "text-yellow-500" : "text-gray-400")}
                >
                    <Grid2X2 size={16} />
                </button>
            </div>

            {layout === "single" ? (
                <div className="w-full h-full">
                    <TradingViewWidget symbol={symbols[0]} />
                </div>
            ) : (
                <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                    <div className="border-r border-b border-gray-800"><TradingViewWidget symbol={symbols[0]} /></div>
                    <div className="border-b border-gray-800"><TradingViewWidget symbol={symbols[1]} /></div>
                    <div className="border-r border-gray-800"><TradingViewWidget symbol={symbols[2]} /></div>
                    <div><TradingViewWidget symbol={symbols[3]} /></div>
                </div>
            )}
        </div>
    );
}
