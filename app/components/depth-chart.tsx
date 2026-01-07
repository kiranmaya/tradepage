"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { OrderBookLevel } from "../hooks/use-binance-market";

interface DepthChartProps {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
}

export default function DepthChart({ bids, asks }: DepthChartProps) {
    const data = useMemo(() => {
        // Parse formatted strings back to numbers
        const parse = (s: string) => parseFloat(s.replace(/,/g, ""));

        // Prepare Bid Data (Green)
        // Bids come sorted High to Low. For the chart (X-axis Price), we want Low to High usually?
        // Actually depth charts usually show Price on X. 
        // Bids are on the Left (Prices < Mark). Asks on Right (Prices > Mark).
        // So we sort text-book style: Ascending Price.

        const bidData = bids.map(b => ({
            price: parse(b.price),
            bidTotal: parse(b.total), // Cumulative total
            askTotal: 0
        })).sort((a, b) => a.price - b.price); // Sort ascending for X-axis

        // Prepare Ask Data (Red)
        // Asks come sorted Low to High.
        const askData = asks.map(a => ({
            price: parse(a.price),
            bidTotal: 0,
            askTotal: parse(a.total)
        }));
        // Asks are already Low->High price usually.
        // If we want a continuous chart, we combine them.

        return [...bidData, ...askData];
    }, [bids, asks]);

    if (window.innerWidth < 100) return null; // Simple check

    return (
        <div className="flex-1 w-full h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAsks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="price"
                        type="number"
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 9, fill: '#6b7280' }}
                        tickFormatter={(val) => val.toFixed(1)}
                        hide={true} // Clean look
                    />
                    <YAxis
                        hide={true}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff', fontSize: '12px' }}
                        formatter={(value: any, name: any) => [
                            typeof value === 'number' ? value.toFixed(2) : value,
                            name === 'bidTotal' ? 'Buy Vol' : 'Sell Vol'
                        ]}
                        labelFormatter={(label) => `Price: ${label}`}
                    />
                    <Area
                        type="stepAfter"
                        dataKey="bidTotal"
                        stroke="#22c55e"
                        fillOpacity={1}
                        fill="url(#colorBids)"
                        isAnimationActive={false}
                    />
                    <Area
                        type="stepBefore"
                        dataKey="askTotal"
                        stroke="#ef4444"
                        fillOpacity={1}
                        fill="url(#colorAsks)"
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
