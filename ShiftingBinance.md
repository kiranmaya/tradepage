# Moving to Binance Websockets

This document contains the adapted code to migrate the futures trading page from Delta Exchange to Binance Websockets.

## 1. Market Data Hook (`use-binance-market.ts`)

This hook connects to Binance Futures WebSocket streams to fetch real-time data.

```typescript
"use client";

import { useEffect, useRef, useState, useMemo } from "react";

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
        const bids = data.b.map((level: string[]) => ({
          price: formatNumber(level[0]),
          size: formatNumber(level[1]),
          total: "--" // Calculated in UI or simplified
        }));
        
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
        setTrades(prev => [newTrade, ...prev].slice(0, 50));
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
```

## 2. PriceFlash Component (`price-flash.tsx`)

Reusable component to animate price changes.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface PriceFlashProps {
    value: string | number;
    className?: string;
    children?: React.ReactNode;
}

export default function PriceFlash({ value, className = "", children }: PriceFlashProps) {
    const prevValueRef = useRef<string | number>(value);
    const [flashClass, setFlashClass] = useState("");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const prevValue = prevValueRef.current;
        const currentValStr = String(value ?? "");
        const prevValStr = String(prevValue ?? "");

        if (currentValStr !== prevValStr && currentValStr !== "--" && prevValStr !== "--") {
            const current = parseFloat(currentValStr.replace(/,/g, ""));
            const previous = parseFloat(prevValStr.replace(/,/g, ""));

            if (!isNaN(current) && !isNaN(previous)) {
                if (current > previous) {
                    setFlashClass("animate-flash-up text-green-500");
                } else if (current < previous) {
                    setFlashClass("animate-flash-down text-red-500");
                }

                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => {
                    setFlashClass("");
                }, 800);
            }
        }
        prevValueRef.current = value;
    }, [value]);

    // Merge flash class with existing className, flash class takes precedence for color
    // A simple approach is appending.
    return (
        <span className={`transition-colors duration-200 inline-block ${className} ${flashClass}`}>
            {children || value}
        </span>
    );
}
```

*Note: Ensure you have `animate-flash-up` and `animate-flash-down` keyframes in your global CSS or Tailwind config.*

## 3. OrderBook Component (`order-book.tsx`)

Adapted to use the Binance data structure and `PriceFlash`.

```tsx
"use client";

import PriceFlash from "./price-flash";
import { OrderBookLevel } from "./use-binance-market";

interface OrderBookProps {
    asks: OrderBookLevel[];
    bids: OrderBookLevel[];
    markPrice: string;
    activeSymbol: string;
    onPriceSelect: (price: string) => void;
}

export default function OrderBook({ asks, bids, markPrice, activeSymbol, onPriceSelect }: OrderBookProps) {
    return (
        <div className="flex-1 bg-gray-900 text-xs p-2 flex flex-col overflow-hidden font-mono">
           {/* Header */}
            <div className="flex justify-between items-center mb-2 uppercase text-gray-400 font-bold text-[10px]">
                <span>Order Book <span className="text-yellow-500 ml-1">{activeSymbol}</span></span>
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
                            className="grid grid-cols-3 gap-1 py-0.5 hover:bg-gray-800 cursor-pointer transition-colors"
                            onClick={() => onPriceSelect(l.price.replace(/,/g, ""))}
                        >
                            <PriceFlash value={l.price} className="text-red-400" />
                            <span className="text-right text-gray-300">{l.size}</span>
                            <span className="text-right text-gray-500 text-[9px]">{l.total}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mark Price */}
            <div className="py-1.5 my-1 border-y border-gray-800 text-center text-sm font-bold text-white bg-gray-800/50 rounded">
                <PriceFlash value={markPrice} className="text-white">
                    {markPrice} <span className="text-[10px] text-gray-400 font-normal ml-2">Mark</span>
                </PriceFlash>
            </div>

            {/* Bids (Buys) */}
            <div className="flex-1 flex flex-col overflow-hidden mt-1">
                {bids.slice(0, 15).map((l, i) => (
                    <div
                        key={i}
                        className="grid grid-cols-3 gap-1 py-0.5 hover:bg-gray-800 cursor-pointer transition-colors"
                        onClick={() => onPriceSelect(l.price.replace(/,/g, ""))}
                    >
                        <PriceFlash value={l.price} className="text-green-400" />
                        <span className="text-right text-gray-300">{l.size}</span>
                        <span className="text-right text-gray-500 text-[9px]">{l.total}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

## 4. OrderTicket Component (`order-ticket.tsx`)

Simplified for UI demonstration without DB dependencies.

```tsx
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
```

## 5. Chart Component (`tradingview-widget.tsx`)

Using standard TradingView widget with Binance symbol key.

```tsx
"use client";

import { useEffect, useRef, memo } from "react";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com"
      }`;
    
    if(container.current) {
        container.current.innerHTML = "";
        container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
```

## 6. Page Layout (`page.tsx`)

Combining everything.

```tsx
"use client";

import { useState } from "react";
import OrderBook from "./order-book";
import OrderTicket from "./order-ticket";
import { useBinanceMarketData } from "./use-binance-market";
import TradingViewWidget from "./tradingview-widget";
import PriceFlash from "./price-flash";

export default function BinanceFuturesPage() {
    const { ticker, orderbook, trades, status } = useBinanceMarketData("btcusdt");
    const [limitPrice, setLimitPrice] = useState("");

    return (
        <div className="flex h-screen w-full bg-black text-white overflow-hidden flex-col">
            {/* Header / Ticker */}
            <header className="h-10 border-b border-gray-800 flex items-center px-4 gap-6 text-xs bg-gray-900 shrink-0">
                <div className="font-black text-yellow-500">BINANCE FUTURES</div>
                <div className="flex gap-4">
                    <div>
                        <span className="text-gray-500 mr-2">Mark</span>
                        <PriceFlash value={ticker.markPrice} className="font-mono font-bold" />
                    </div>
                    <div>
                        <span className="text-gray-500 mr-2">24h Change</span>
                        <span className={ticker.change24h.startsWith("-") ? "text-red-500" : "text-green-500"}>
                            {ticker.change24h}
                        </span>
                    </div>
                    <div>
                         <span className="text-gray-500 mr-2">Vol</span>
                         <span>{ticker.volume24h}</span>
                    </div>
                </div>
                <div className="ml-auto text-[10px] uppercase text-gray-600 font-bold">
                    {status}
                </div>
            </header>

            {/* Main Grid */}
            <div className="flex-1 grid grid-cols-[1fr_300px_320px] overflow-hidden">
                {/* Chart */}
                <div className="border-r border-gray-800 bg-gray-900 relative">
                     <TradingViewWidget />
                </div>

                {/* OrderBook & Trades */}
                <div className="flex flex-col border-r border-gray-800 h-full overflow-hidden">
                    <OrderBook 
                        asks={orderbook.asks} 
                        bids={orderbook.bids} 
                        markPrice={ticker.markPrice}
                        activeSymbol="BTCUSDT"
                        onPriceSelect={setLimitPrice}
                    />
                    {/* Simplified Recent Trades */}
                    <div className="h-1/3 border-t border-gray-800 p-2 overflow-hidden flex flex-col">
                         <div className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Recent Trades</div>
                         <div className="flex-1 overflow-auto no-scrollbar space-y-0.5">
                             {trades.map((t, i) => (
                                 <div key={i} className="grid grid-cols-3 text-[10px] font-mono opacity-80 hover:opacity-100">
                                     <span className={t.side === 'buy' ? 'text-green-500' : 'text-red-500'}>{t.price}</span>
                                     <span className="text-right text-gray-400">{t.size}</span>
                                     <span className="text-right text-gray-600">{t.time}</span>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>

                {/* Order Ticket */}
                <div className="h-full overflow-hidden">
                    <OrderTicket 
                        activeSymbol="BTCUSDT"
                        limitPrice={limitPrice}
                        setLimitPrice={setLimitPrice}
                    />
                </div>
            </div>
        </div>
    );
}
```
