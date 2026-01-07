"use client";

import { useEffect, useRef, useState } from "react";

export type Ticker = {
    symbol: string;
    lastPrice: number;
    priceChangePercent: number;
    volume: number; // Quote volume
};

const BINANCE_WS_URL = "wss://fstream.binance.com/ws";

export function useBinanceTickers() {
    const [tickers, setTickers] = useState<Ticker[]>([]);
    const [status, setStatus] = useState<"connected" | "reconnecting" | "offline">("reconnecting");
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        setStatus("reconnecting");
        // Connect to the All Market Tickers Stream
        const ws = new WebSocket(`${BINANCE_WS_URL}/!ticker@arr`);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus("connected");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (Array.isArray(data)) {
                    // Map the raw data to our Ticker type
                    // Sort by volume descending by default for better UX
                    const mapped: Ticker[] = data
                        .map((t: any) => ({
                            symbol: t.s,
                            lastPrice: parseFloat(t.c),
                            priceChangePercent: parseFloat(t.P),
                            volume: parseFloat(t.q),
                        }))
                        .filter((t) => t.symbol.endsWith("USDT")); // Filter for USDT pairs only for now

                    // We only update if the array is substantial to avoid flickering on partial updates if any (though ticker@arr is usually full)
                    if (mapped.length > 0) {
                        setTickers(mapped);
                    }
                }
            } catch (e) {
                console.error("Parse error", e);
            }
        };

        ws.onclose = () => {
            setStatus("offline");
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    return { tickers, status };
}
