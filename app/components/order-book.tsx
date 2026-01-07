"use client";

import { useState } from "react";
import PriceFlash from "./price-flash";
import { OrderBookLevel } from "../hooks/use-binance-market";
import DepthChart from "./depth-chart";
import { cn } from "@/lib/utils";
import { List, BarChart2 } from "lucide-react";

interface OrderBookProps {
    asks: OrderBookLevel[];
    bids: OrderBookLevel[];
    markPrice: string;
    activeSymbol: string;
    onPriceSelect: (price: string) => void;
}

export default function OrderBook({ asks, bids, markPrice, activeSymbol, onPriceSelect }: OrderBookProps) {
    const [view, setView] = useState<"book" | "depth">("book");

    return (
        <div className="flex-1 bg-white dark:bg-gray-900 text-xs flex flex-col overflow-hidden font-mono relative">
            {/* Header Tabs */}
            <div className="flex items-center border-b border-gray-100 dark:border-gray-800 shrink-0">
                <button
                    onClick={() => setView("book")}
                    className={cn(
                        "flex-1 py-2 text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                        view === "book" ? "text-yellow-600 dark:text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400"
                    )}
                >
                    <List size={12} /> Book
                </button>
                <button
                    onClick={() => setView("depth")}
                    className={cn(
                        "flex-1 py-2 text-[10px] font-bold uppercase flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                        view === "depth" ? "text-yellow-600 dark:text-yellow-500 border-b-2 border-yellow-500" : "text-gray-400"
                    )}
                >
                    <BarChart2 size={12} /> Depth
                </button>
            </div>

            {/* Content */}
            {view === "book" ? (
                <div className="flex-1 flex flex-col p-2 overflow-hidden">
                    <div className="grid grid-cols-3 gap-1 mb-1 text-[9px] text-gray-500 font-medium">
                        <span>Price</span>
                        <span className="text-right">Size</span>
                        <span className="text-right">Sum</span>
                    </div>

                    {/* Asks (Sells) */}
                    <div className="flex-1 flex flex-col justify-end overflow-hidden mb-1">
                        <div className="flex flex-col-reverse">
                            {asks.slice(0, 15).map((l, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-3 gap-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                    onClick={() => onPriceSelect(l.price.replace(/,/g, ""))}
                                >
                                    <PriceFlash value={l.price} className="text-red-500 dark:text-red-400" />
                                    <PriceFlash value={l.size} className="text-right w-full text-gray-700 dark:text-gray-300" />
                                    <span className="text-right text-gray-400 dark:text-gray-500 text-[9px]">{l.total}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mark Price */}
                    <div className="py-1.5 my-1 border-y border-gray-200 dark:border-gray-800 text-center text-sm font-bold text-black dark:text-white bg-gray-50 dark:bg-gray-800/50 rounded">
                        <PriceFlash value={markPrice} className="text-black dark:text-white">
                            {markPrice} <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal ml-2">Mark</span>
                        </PriceFlash>
                    </div>

                    {/* Bids (Buys) */}
                    <div className="flex-1 flex flex-col overflow-hidden mt-1">
                        {bids.slice(0, 15).map((l, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-3 gap-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                onClick={() => onPriceSelect(l.price.replace(/,/g, ""))}
                            >
                                <PriceFlash value={l.price} className="text-green-600 dark:text-green-400" />
                                <PriceFlash value={l.size} className="text-right w-full text-gray-700 dark:text-gray-300" />
                                <span className="text-right text-gray-400 dark:text-gray-500 text-[9px]">{l.total}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-2">
                    <DepthChart bids={bids} asks={asks} />
                    <div className="text-center text-[10px] text-gray-400 mt-2">
                        Mark: {markPrice}
                    </div>
                </div>
            )}
        </div>
    );
}
