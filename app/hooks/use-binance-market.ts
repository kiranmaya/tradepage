"use client";

import { useEffect, useRef, useState } from "react";

export type MarketTicker = {
  markPrice: string;
  indexPrice: string;
  change24h: string;
  volume24h: string;
};

export type OrderBookLevel = {
  price: string;
  size: string;
  total: string;
};

export type MarketTrade = {
  price: string;
  size: string;
  time: string;
  side: "buy" | "sell";
};

type OrderBookState = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
};

const BINANCE_WS_URL = "wss://fstream.binance.com/stream";

const emptyTicker: MarketTicker = {
  markPrice: "--",
  indexPrice: "--",
  change24h: "--",
  volume24h: "--",
};

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const compactFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

function formatNumber(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "--";
  return numberFormatter.format(num);
}

function formatCompact(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "--";
  return compactFormatter.format(num);
}

function formatPercent(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return "--";
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

export function useBinanceMarketData(symbol: string = "btcusdt") {
  const [ticker, setTicker] = useState<MarketTicker>(emptyTicker);
  const [orderbook, setOrderbook] = useState<OrderBookState>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<MarketTrade[]>([]);
  const [status, setStatus] = useState<"connected" | "reconnecting" | "offline">("reconnecting");

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Reset state on symbol change
    setTicker(emptyTicker);
    setOrderbook({ bids: [], asks: [] });
    setTrades([]);
    setStatus("reconnecting");

    const ws = new WebSocket(`${BINANCE_WS_URL}?streams=${symbol.toLowerCase()}@depth20@100ms/${symbol.toLowerCase()}@aggTrade/${symbol.toLowerCase()}@markPrice/${symbol.toLowerCase()}@ticker`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message.data) return;

      const stream = message.stream;
      const data = message.data;

      // Orderbook (Depth)
      if (stream.includes("@depth20")) {
        // Calculate totals for improved UI
        let bidTotal = 0;
        const bidsWithTotal = data.b.map((level: string[]) => {
          const size = parseFloat(level[1]);
          bidTotal += size;
          return {
            price: formatNumber(level[0]),
            size: formatNumber(level[1]),
            total: formatNumber(bidTotal)
          };
        });

        let askTotal = 0;
        const asksWithTotal = data.a.map((level: string[]) => {
          const size = parseFloat(level[1]);
          askTotal += size;
          return {
            price: formatNumber(level[0]),
            size: formatNumber(level[1]),
            total: formatNumber(askTotal)
          };
        });

        setOrderbook({ bids: bidsWithTotal, asks: asksWithTotal });
      }

      // Trades (Aggregated Trades)
      if (stream.includes("@aggTrade")) {
        const newTrade: MarketTrade = {
          price: formatNumber(data.p),
          size: formatNumber(data.q),
          time: new Date(data.T).toLocaleTimeString("en-US", { hour12: false }),
          side: data.m ? "sell" : "buy" // m=true means maker (sell side initiated), wait... in Binance aggTrade: m=true means the buyer was the maker. So it's a SELL.
        };
        setTrades(prev => [newTrade, ...prev].slice(0, 100));
      }

      // Mark Price
      if (stream.includes("@markPrice")) {
        setTicker(prev => ({
          ...prev,
          markPrice: formatNumber(data.p),
          indexPrice: formatNumber(data.i)
        }));
      }

      // Ticker (24h stats)
      if (stream.includes("@ticker")) {
        setTicker(prev => ({
          ...prev,
          change24h: formatPercent(data.P),
          volume24h: `$${formatCompact(data.q)}` // q is quote volume
        }));
      }
    };

    ws.onclose = () => {
      setStatus("offline");
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  return { ticker, orderbook, trades, status };
}
