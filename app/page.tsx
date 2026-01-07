"use client";

// ... imports
import { useState } from "react";
import OrderBook from "./components/order-book";
import OrderTicket from "./components/order-ticket";
import { useBinanceMarketData } from "./hooks/use-binance-market";
import TradingViewWidget from "./components/tradingview-widget";
import PriceFlash from "./components/price-flash";
import { ThemeToggle } from "./components/theme-toggle";

export default function BinanceFuturesPage() {
  const { ticker, orderbook, trades, status } = useBinanceMarketData("btcusdt");
  const [limitPrice, setLimitPrice] = useState("");

  return (
    <div className="flex h-screen w-full bg-white dark:bg-black text-black dark:text-white overflow-hidden flex-col">
      {/* Header / Ticker */}
      <header className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-6 text-xs bg-gray-50 dark:bg-gray-900 shrink-0">
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
        <div className="ml-auto flex items-center gap-4">
          <div className="text-[10px] uppercase text-gray-600 font-bold">
            {status}
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-[1fr_300px_320px] overflow-hidden">
        {/* Chart */}
        <div className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 relative">
          <TradingViewWidget />
        </div>

        {/* OrderBook & Trades */}
        <div className="flex flex-col border-r border-gray-200 dark:border-gray-800 h-full overflow-hidden">
          <OrderBook
            asks={orderbook.asks}
            bids={orderbook.bids}
            markPrice={ticker.markPrice}
            activeSymbol="BTCUSDT"
            onPriceSelect={setLimitPrice}
          />
          {/* Simplified Recent Trades */}
          <div className="h-1/3 border-t border-gray-200 dark:border-gray-800 p-2 overflow-hidden flex flex-col">
            <div className="text-[10px] font-bold text-gray-500 mb-1 uppercase">Recent Trades</div>
            <div className="flex-1 overflow-auto no-scrollbar space-y-0.5">
              {trades.map((t, i) => (
                <div key={i} className="grid grid-cols-3 text-[10px] font-mono opacity-80 hover:opacity-100">
                  <span className={t.side === 'buy' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>{t.price}</span>
                  <span className="text-right text-gray-600 dark:text-gray-400">{t.size}</span>
                  <span className="text-right text-gray-500 dark:text-gray-600">{t.time}</span>
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
