"use client";

import PriceFlash from "./price-flash";
import { OrderBookLevel } from "../hooks/use-binance-market";

interface OrderBookProps {
    asks: OrderBookLevel[];
    bids: OrderBookLevel[];
    markPrice: string;
    activeSymbol: string;
    onPriceSelect: (price: string) => void;
}

export default function OrderBook({ asks, bids, markPrice, activeSymbol, onPriceSelect }: OrderBookProps) {
    return (
        <div className="flex-1 bg-white dark:bg-gray-900 text-xs p-2 flex flex-col overflow-hidden font-mono">
            {/* Header */}
            <div className="flex justify-between items-center mb-2 uppercase text-gray-500 dark:text-gray-400 font-bold text-[10px]">
                <span>Order Book <span className="text-yellow-600 dark:text-yellow-500 ml-1">{activeSymbol}</span></span>
                <span>Price (USDT)</span>
            </div>

            <div className="grid grid-cols-3 gap-1 mb-1 text-[9px] text-gray-500 font-medium">
                <span>Price</span>
                <span className="text-right">Size</span>
                <span className="text-right">Sum</span>
            </div>

            {/* Asks (Sells) - Reversed to show lowest ask at bottom */}
            <div className="flex-1 flex flex-col justify-end overflow-hidden mb-1">
                <div className="flex flex-col-reverse">
                    {asks.slice(0, 15).map((l, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-3 gap-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            onClick={() => onPriceSelect(l.price.replace(/,/g, ""))}
                        >
                            <PriceFlash value={l.price} className="text-red-500 dark:text-red-400" />
                            <span className="text-right text-gray-700 dark:text-gray-300">{l.size}</span>
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
                        <span className="text-right text-gray-700 dark:text-gray-300">{l.size}</span>
                        <span className="text-right text-gray-400 dark:text-gray-500 text-[9px]">{l.total}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
