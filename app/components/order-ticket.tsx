"use client";

import { useState } from "react";

interface OrderTicketProps {
    activeSymbol: string;
    limitPrice: string;
    setLimitPrice: (val: string) => void;
    onPlaceOrder?: (symbol: string, side: "buy" | "sell", size: number, price: number, type: "market" | "limit") => void;
}

export default function OrderTicket({ activeSymbol, limitPrice, setLimitPrice, onPlaceOrder }: OrderTicketProps) {
    const [side, setSide] = useState<"buy" | "sell">("buy");
    const [orderType, setOrderType] = useState<"limit" | "market" | "stop">("limit");
    const [quantity, setQuantity] = useState("");
    const [leverage, setLeverage] = useState(20);
    const [reduceOnly, setReduceOnly] = useState(false);
    const [showTpSl, setShowTpSl] = useState(false);
    const [tp, setTp] = useState("");
    const [sl, setSl] = useState("");

    const handlePlaceOrder = () => {
        if (onPlaceOrder) {
            onPlaceOrder(
                activeSymbol,
                side,
                parseFloat(quantity) || 0,
                parseFloat(limitPrice) || 0,
                orderType === 'market' ? 'market' : 'limit'
            );
        } else {
            alert(`Order Placed: ${side.toUpperCase()} ${quantity} ${activeSymbol} x${leverage} @ ${orderType === 'market' ? 'MARKET' : limitPrice}`);
        }
    };

    const cost = orderType === 'limit' && quantity && limitPrice
        ? (parseFloat(quantity) * parseFloat(limitPrice) / leverage)
        : 0;

    return (
        <div className="bg-white dark:bg-gray-900 p-4 border-l border-gray-200 dark:border-gray-800 flex flex-col gap-4 h-full text-sm font-mono overflow-y-auto no-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-center uppercase text-[10px] text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800 pb-2 shrink-0">
                <span>Place Order</span>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Iso</span>
                    <span className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-yellow-600 dark:text-yellow-500">{leverage}x</span>
                </div>
            </div>

            {/* Side Switch */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded shrink-0">
                <button
                    onClick={() => setSide("buy")}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-colors ${side === "buy" ? "bg-green-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setSide("sell")}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-colors ${side === "sell" ? "bg-red-600 text-white shadow-sm" : "text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}
                >
                    Sell
                </button>
            </div>

            {/* Type Switch */}
            <div className="flex gap-4 text-xs font-bold text-gray-400 border-b border-gray-200 dark:border-gray-800 pb-1 shrink-0">
                {["limit", "market", "stop"].map(t => (
                    <button
                        key={t}
                        onClick={() => setOrderType(t as any)}
                        className={`uppercase ${orderType === t ? "text-black dark:text-white border-b-2 border-yellow-600 dark:border-yellow-500 pb-1" : "hover:text-black dark:hover:text-white"}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Inputs */}
            <div className="space-y-3 shrink-0">
                <div>
                    <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                        <span>Price (USDT)</span>
                        {orderType === 'limit' && <span className="text-yellow-600 cursor-pointer" onClick={() => setLimitPrice((parseFloat(limitPrice || "0") * 1.01).toFixed(2))}>Last</span>}
                    </label>
                    <input
                        type="text"
                        value={orderType === "market" ? "Market Price" : limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        disabled={orderType === "market"}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 text-black dark:text-white font-mono text-xs focus:border-yellow-500 outline-none disabled:opacity-50"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-1">Size (BTC)</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-2 text-black dark:text-white font-mono text-xs focus:border-yellow-500 outline-none"
                            placeholder="0.00"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-gray-400">BTC</span>
                    </div>
                </div>

                {/* Leverage Slider */}
                <div className="pt-2">
                    <label className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                        <span>Leverage</span>
                        <span>{leverage}x</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="125"
                        value={leverage}
                        onChange={(e) => setLeverage(Number(e.target.value))}
                        className="w-full accent-yellow-500 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        id="reduce"
                        checked={reduceOnly}
                        onChange={(e) => setReduceOnly(e.target.checked)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <label htmlFor="reduce" className="text-[10px] text-gray-500 select-none cursor-pointer">Reduce Only</label>
                </div>

                {/* TP/SL Advanced */}
                <div className="border border-gray-200 dark:border-gray-800 rounded p-2">
                    <div
                        className="flex justify-between items-center cursor-pointer select-none"
                        onClick={() => setShowTpSl(!showTpSl)}
                    >
                        <span className="text-[10px] font-bold text-gray-500">TP / SL</span>
                        <span className="text-[10px] text-gray-400">{showTpSl ? "Hide" : "Add"}</span>
                    </div>

                    {showTpSl && (
                        <div className="mt-2 space-y-2 animate-in slide-in-from-top-1 fade-in duration-200">
                            <div>
                                <input placeholder="Take Profit" value={tp} onChange={e => setTp(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1.5 text-xs outline-none focus:border-green-500" />
                            </div>
                            <div>
                                <input placeholder="Stop Loss" value={sl} onChange={e => setSl(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1.5 text-xs outline-none focus:border-red-500" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Summary */}
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 text-xs space-y-1.5 shrink-0">
                <div className="flex justify-between text-gray-500 dark:text-gray-400 text-[10px]">
                    <span>Cost</span>
                    <span className="text-black dark:text-white font-mono">
                        {cost > 0 ? cost.toFixed(2) : "--"} USDT
                    </span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400 text-[10px]">
                    <span>Max Buy</span>
                    <span className="text-black dark:text-white font-mono">0.05 BTC</span>
                </div>
                <button
                    onClick={handlePlaceOrder}
                    className={`w-full py-3 rounded font-black uppercase tracking-widest text-white shadow-lg mt-2 transition-transform active:scale-[0.98] ${side === "buy" ? "bg-green-600 hover:bg-green-500 shadow-green-900/20" : "bg-red-600 hover:bg-red-500 shadow-red-900/20"}`}
                >
                    {side} {side === 'buy' ? 'Long' : 'Short'}
                </button>
            </div>
        </div>
    );
}
