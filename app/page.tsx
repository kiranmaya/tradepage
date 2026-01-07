"use client";

import { useState, useEffect } from "react";
import OrderBook from "./components/order-book";
import OrderTicket from "./components/order-ticket";
import { useBinanceMarketData } from "./hooks/use-binance-market";
import PriceFlash from "./components/price-flash";
import { ThemeToggle } from "./components/theme-toggle";
import Watchlist from "./components/watchlist";
import TradeFeed from "./components/trade-feed";
import MultiChartGrid from "./components/multi-chart-grid";
import MarketOverview from "./components/market-overview";
import { TradingProvider, useTrading } from "./context/trading-context";
import PositionsPanel from "./components/positions-panel";

// Inner component to access context
function PageContent() {
  const { ticker, orderbook, trades, status } = useBinanceMarketData("btcusdt");
  const { placeOrder, updatePnL, closePosition } = useTrading();
  const [limitPrice, setLimitPrice] = useState("");
  const [showOverview, setShowOverview] = useState(false);

  // Update PnL whenever mark price changes
  useEffect(() => {
    if (ticker.markPrice !== "--") {
      updatePnL("BTCUSDT", parseFloat(ticker.markPrice.replace(/,/g, "")));
    }
  }, [ticker.markPrice, updatePnL]);

  // Keyboard Shortcuts (Feature 10)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const price = parseFloat(ticker.markPrice.replace(/,/g, "")) || 40000;

      // Debug shortcut to test
      if (e.key === 'b' && !e.shiftKey) { // Just 'b' for easier testing? No, keep it specific.
        // Shift + B
      }

      if (e.code === 'KeyB' && e.shiftKey) {
        // Shift + B = market buy
        placeOrder("BTCUSDT", "buy", 0.1, price, "market");
        // alert("Lightning Buy Executed!");
      }
      if (e.code === 'KeyS' && e.shiftKey) {
        // Shift + S = market sell
        placeOrder("BTCUSDT", "sell", 0.1, price, "market");
        // alert("Lightning Sell Executed!");
      }
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        // Close all (Simulated by closing BTC for demo)
        closePosition("BTCUSDT");
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placeOrder, closePosition, ticker.markPrice]);

  return (
    <div className="flex min-h-screen lg:h-screen w-full bg-white dark:bg-black text-black dark:text-white lg:overflow-hidden flex-col font-sans">
      {showOverview && <MarketOverview onClose={() => setShowOverview(false)} />}

      {/* Header / Ticker */}
      <header className="h-10 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-6 text-xs bg-gray-50 dark:bg-gray-900 shrink-0 sticky top-0 z-50 lg:static">
        <div className="flex items-center gap-1.5 select-none cursor-pointer" onClick={() => setShowOverview(true)}>
          <span className="font-black text-xl tracking-tighter text-black dark:text-white font-sans">AIZU</span>
          <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-500/10 px-1.5 py-0.5 rounded-sm">FUTURES</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          <div className="whitespace-nowrap">
            <span className="text-gray-500 mr-2">Mark</span>
            <PriceFlash value={ticker.markPrice} className="font-mono font-bold" />
          </div>
          <div className="whitespace-nowrap">
            <span className="text-gray-500 mr-2">24h Change</span>
            <span className={ticker.change24h.startsWith("-") ? "text-red-500" : "text-green-500"}>
              {ticker.change24h}
            </span>
          </div>
          <div className="hidden sm:block whitespace-nowrap">
            <span className="text-gray-500 mr-2">Vol</span>
            <span>{ticker.volume24h}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={() => setShowOverview(true)}
            className="hidden sm:flex items-center gap-1 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300"
          >
            Dashboard
          </button>
          <div className="flex items-center gap-1 text-[9px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-200 dark:border-red-900/50">
            <span className="font-bold animate-pulse">LIVE SIMULATION</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[280px_1fr_300px_320px] lg:overflow-hidden max-h-screen">

        {/* Watchlist Sidebar */}
        <div className="hidden lg:flex border-r border-gray-200 dark:border-gray-800 flex-col overflow-hidden h-full">
          <Watchlist />
        </div>

        {/* Center: Chart + Positions */}
        <div className="flex flex-col min-w-0 border-r border-gray-200 dark:border-gray-800 h-full overflow-hidden">
          {/* Chart */}
          <div className="flex-1 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 relative overflow-hidden min-h-0">
            <MultiChartGrid />
          </div>
          {/* Positions Panel (Fixed 200px) */}
          <div className="h-[200px] shrink-0 overflow-hidden bg-white dark:bg-gray-900 z-10 relative">
            <PositionsPanel />
          </div>
        </div>

        {/* OrderBook & Trades */}
        <div className="flex flex-col h-[600px] lg:h-full border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800 overflow-hidden">
          <OrderBook
            asks={orderbook.asks}
            bids={orderbook.bids}
            markPrice={ticker.markPrice}
            activeSymbol="BTCUSDT"
            onPriceSelect={setLimitPrice}
          />
          {/* Trade Feed with Whale Tracking */}
          <div className="h-1/3 flex flex-col overflow-hidden min-h-0">
            <TradeFeed trades={trades} />
          </div>
        </div>

        {/* Order Ticket */}
        <div className="h-auto lg:h-full overflow-hidden mb-8 lg:mb-0">
          <OrderTicket
            activeSymbol="BTCUSDT"
            limitPrice={limitPrice}
            setLimitPrice={setLimitPrice}
            onPlaceOrder={placeOrder}
          />
        </div>
      </div>

      {/* Toast for shortcuts (simplified) */}
      <div className="fixed bottom-4 left-4 z-50 pointer-events-none">
        {/* We can implement toast later explicitly if needed, alert is default for now */}
      </div>
    </div>
  );
}

export default function BinanceFuturesPage() {
  return (
    <TradingProvider>
      <PageContent />
    </TradingProvider>
  );
}
