"use client";

import { useTrading } from "../context/trading-context";
import { cn } from "@/lib/utils";
import PriceFlash from "./price-flash";

export default function PositionsPanel() {
    const { positions, balance, equity, closePosition } = useTrading();

    return (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex flex-col h-full font-mono text-xs">
            <div className="flex items-center gap-6 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shrink-0">
                <div className="font-bold text-gray-500 uppercase text-[10px]">Assets</div>
                <div className="flex gap-4">
                    <div>
                        <span className="text-gray-400 mr-1">Balance:</span>
                        <span className="font-bold text-gray-900 dark:text-gray-100">${balance.toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="text-gray-400 mr-1">Equity:</span>
                        <span className="font-bold text-white">${equity.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar">
                <table className="w-full text-left">
                    <thead className="sticky top-0 bg-white dark:bg-gray-900 text-[10px] text-gray-500 uppercase">
                        <tr className="border-b border-gray-100 dark:border-gray-800">
                            <th className="p-2 font-medium">Symbol</th>
                            <th className="p-2 font-medium">Size</th>
                            <th className="p-2 font-medium">Entry Price</th>
                            <th className="p-2 font-medium">Mark Price</th>
                            <th className="p-2 font-medium">PnL (ROE%)</th>
                            <th className="p-2 font-medium text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {positions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center p-8 text-gray-400 italic">
                                    No open positions. Start paper trading!
                                </td>
                            </tr>
                        ) : (
                            positions.map(p => (
                                <tr key={p.symbol + p.side} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="p-2 font-bold text-gray-900 dark:text-gray-200 flex items-center gap-1">
                                        <span className={p.side === 'long' ? "text-green-500" : "text-red-500"}>
                                            {p.side === 'long' ? "Long" : "Short"}
                                        </span>
                                        {p.symbol}
                                        <span className="text-[9px] bg-gray-200 dark:bg-gray-700 px-1 rounded text-gray-500">{p.leverage}x</span>
                                    </td>
                                    <td className="p-2">{p.size}</td>
                                    <td className="p-2">{p.entryPrice.toFixed(2)}</td>
                                    <td className="p-2 text-gray-500">
                                        {/* We don't have current price here easily in map, passed from parent? 
                                       or calculate PnL in hook. unRealizedPnL is in object.
                                   */}
                                        --
                                    </td>
                                    <td className="p-2">
                                        <PriceFlash
                                            value={p.unrealizedPnL.toFixed(2)}
                                            className={cn("font-bold", p.unrealizedPnL >= 0 ? "text-green-500" : "text-red-500")}
                                        >
                                            {p.unrealizedPnL >= 0 ? "+" : ""}{p.unrealizedPnL.toFixed(2)}
                                        </PriceFlash>
                                    </td>
                                    <td className="p-2 text-right">
                                        <button
                                            onClick={() => closePosition(p.symbol)}
                                            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-[10px]"
                                        >
                                            Close
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                    {positions.length > 0 && (
                        <tfoot className="bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-100 dark:border-gray-800 font-bold sticky bottom-0">
                            <tr>
                                <td className="p-2 text-gray-500 uppercase">Total</td>
                                <td className="p-2">--</td>
                                <td className="p-2">--</td>
                                <td className="p-2">--</td>
                                <td className="p-2">
                                    <PriceFlash
                                        value={positions.reduce((acc, p) => acc + p.unrealizedPnL, 0).toFixed(2)}
                                        className={cn(
                                            positions.reduce((acc, p) => acc + p.unrealizedPnL, 0) >= 0 ? "text-green-500" : "text-red-500"
                                        )}
                                    >
                                        ${positions.reduce((acc, p) => acc + p.unrealizedPnL, 0).toFixed(2)}
                                    </PriceFlash>
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}
