"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Position = {
    symbol: string;
    side: "long" | "short";
    size: number;
    entryPrice: number;
    leverage: number;
    unrealizedPnL: number;
};

interface TradingContextType {
    balance: number;
    equity: number;
    positions: Position[];
    placeOrder: (symbol: string, side: "buy" | "sell", size: number, price: number, type: "market" | "limit") => void;
    closePosition: (symbol: string) => void;
    updatePnL: (symbol: string, currentPrice: number) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export function TradingProvider({ children }: { children: ReactNode }) {
    const [balance, setBalance] = useState(50000); // Start with $50k paper money
    const [positions, setPositions] = useState<Position[]>([
        { symbol: "BTCUSDT", side: "long", size: 0.05, entryPrice: 91500, leverage: 20, unrealizedPnL: 12.50 },
        { symbol: "ETHUSDT", side: "short", size: 1.5, entryPrice: 3200, leverage: 50, unrealizedPnL: 45.20 },
        { symbol: "SOLUSDT", side: "long", size: 25, entryPrice: 105.50, leverage: 10, unrealizedPnL: -24.00 }
    ]);

    // equity = balance + unrealized PnL of all positions
    const equity = balance + positions.reduce((acc, p) => acc + p.unrealizedPnL, 0);

    const placeOrder = useCallback((symbol: string, side: "buy" | "sell", size: number, price: number, type: "market" | "limit") => {
        // Simplified logic: Market orders execute immediately. Limit orders we trigger immediately for demo purposes if price is close, or just ignore.
        // For this "Paper Trading" demo, we assume instant execution at `price`.

        // Check margin?
        // Cost = (size * price) / 20 (assuming 20x default leverage for simplicity or pass it)
        const cost = (size * price) / 20;
        // if (cost > balance) return alert("Insufficient Funds");

        const newPosition: Position = {
            symbol,
            side: side === "buy" ? "long" : "short",
            size,
            entryPrice: price,
            leverage: 20,
            unrealizedPnL: 0
        };

        // Check if position exists?
        // Merging logic omitted for brevity, just pushing new positions or simple merge
        setPositions(prev => {
            const existing = prev.find(p => p.symbol === symbol && p.side === newPosition.side);
            if (existing) {
                // Average entry
                const totalSize = existing.size + size;
                const newEntry = ((existing.entryPrice * existing.size) + (price * size)) / totalSize;
                return prev.map(p => p === existing ? { ...p, size: totalSize, entryPrice: newEntry } : p);
            }
            return [...prev, newPosition];
        });

    }, []);

    const closePosition = useCallback((symbol: string) => {
        setPositions(prev => {
            const pos = prev.find(p => p.symbol === symbol);
            if (pos) {
                setBalance(b => b + pos.unrealizedPnL);
                return prev.filter(p => p.symbol !== symbol);
            }
            return prev;
        });
    }, []);

    const updatePnL = useCallback((symbol: string, currentPrice: number) => {
        setPositions(prev => prev.map(p => {
            if (p.symbol !== symbol) return p;

            // Long PnL: (Current - Entry) * Size
            // Short PnL: (Entry - Current) * Size
            const diff = p.side === "long" ? currentPrice - p.entryPrice : p.entryPrice - currentPrice;
            const pnl = diff * p.size;
            return { ...p, unrealizedPnL: pnl };
        }));
    }, []);

    return (
        <TradingContext.Provider value={{ balance, equity, positions, placeOrder, closePosition, updatePnL }}>
            {children}
        </TradingContext.Provider>
    );
}

export function useTrading() {
    const context = useContext(TradingContext);
    if (!context) throw new Error("useTrading must be used within TradingProvider");
    return context;
}
