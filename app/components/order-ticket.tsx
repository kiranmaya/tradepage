"use client";

import { useState } from "react";

interface OrderTicketProps {
    activeSymbol: string;
    limitPrice: string;
    setLimitPrice: (val: string) => void;
}

export default function OrderTicket({ activeSymbol, limitPrice, setLimitPrice }: OrderTicketProps) {
    const [side, setSide] = useState<"buy" | "sell">("buy");
    const [orderType, setOrderType] = useState<"limit" | "market">("limit");
    const [quantity, setQuantity] = useState("");

    const handlePlaceOrder = () => {
        alert(`Order Placed: ${side.toUpperCase()} ${quantity} ${activeSymbol} @ ${orderType === 'market' ? 'MARKET' : limitPrice}`);
    };

    return (
        <div className="bg-gray-900 p-4 border-l border-gray-800 flex flex-col gap-4 h-full text-sm">
            <div className="flex justify-between items-center uppercase text-[10px] text-gray-400 font-bold border-b border-gray-800 pb-2">
                <span>Place Order</span>
                <span className="text-yellow-500">{activeSymbol}</span>
            </div>

            {/* Side Switch */}
            <div className="flex bg-gray-800 p-1 rounded">
                <button
                    onClick={() => setSide("buy")}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-colors ${side === "buy" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                    Buy
                </button>
                <button
                    onClick={() => setSide("sell")}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-colors ${side === "sell" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                    Sell
                </button>
            </div>

            {/* Type Switch */}
            <div className="flex gap-4 text-xs font-bold text-gray-400 border-b border-gray-800 pb-1">
                <button
                    onClick={() => setOrderType("limit")}
                    className={orderType === "limit" ? "text-white border-b-2 border-yellow-500 pb-1" : "hover:text-white"}
                >
                    Limit
                </button>
                <button
                    onClick={() => setOrderType("market")}
                    className={orderType === "market" ? "text-white border-b-2 border-yellow-500 pb-1" : "hover:text-white"}
                >
                    Market
                </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Price (USDT)</label>
                    <input
                        type="text"
                        value={orderType === "market" ? "Market Price" : limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        disabled={orderType === "market"}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white font-mono focus:border-yellow-500 outline-none disabled:opacity-50"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Size (BTC)</label>
                    <input
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white font-mono focus:border-yellow-500 outline-none"
                        placeholder="0.00"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="mt-auto pt-4 border-t border-gray-800 text-xs space-y-2">
                <div className="flex justify-between text-gray-400">
                    <span>Cost</span>
                    <span className="text-white font-mono">
                        {orderType === 'limit' && quantity && limitPrice
                            ? (parseFloat(quantity) * parseFloat(limitPrice) / 20).toFixed(2) // Mock 20x lev
                            : "--"} USDT
                    </span>
                </div>
                <button
                    onClick={handlePlaceOrder}
                    className={`w-full py-3 rounded font-black uppercase tracking-widest text-white shadow-lg  mt-2 ${side === "buy" ? "bg-green-600 hover:bg-green-500" : "bg-red-600 hover:bg-red-500"}`}
                >
                    {side.toUpperCase()}
                </button>
            </div>
        </div>
    );
}
