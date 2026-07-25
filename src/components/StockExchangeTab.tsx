import React, { useState, useEffect } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface StockAsset {
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
  history: number[];
}

interface PortfolioPosition {
  id: string;
  symbol: string;
  shares: number;
  buyPrice: number;
  type: 'LONG' | 'SHORT';
  leverage: number;
}

interface StockExchangeTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

export const StockExchangeTab: React.FC<StockExchangeTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username
}) => {
  const [stocks, setStocks] = useState<StockAsset[]>([
    { symbol: 'PWRB', name: 'Powerball Sovereign Coin', icon: '💰', price: 15420.50, change24h: 12.4, history: [14200, 14500, 14800, 15100, 15420.5] },
    { symbol: 'NVDA', name: 'NVIDIA Multiverse AI Chips', icon: '🟢', price: 128.40, change24h: 4.8, history: [120, 122, 124, 126, 128.4] },
    { symbol: 'BTC', name: 'Bitcoin Quantum Sovereign', icon: '₿', price: 98500.00, change24h: -1.2, history: [99000, 100000, 97500, 98000, 98500] },
    { symbol: 'GME', name: 'Gamestop Moon Rocket', icon: '🚀', price: 420.69, change24h: 69.4, history: [200, 250, 310, 380, 420.69] },
    { symbol: 'TSLA', name: 'Tesla Interstellar Cybertruck', icon: '⚡', price: 245.80, change24h: 2.1, history: [240, 242, 244, 243, 245.8] },
    { symbol: 'GOLD', name: 'Sovereign Physical Gold Bullion', icon: '🥇', price: 2750.00, change24h: 0.8, history: [2730, 2740, 2745, 2748, 2750] }
  ]);

  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('PWRB');
  const [tradeAmountInput, setTradeAmountInput] = useState<string>('10000');
  const [leverage, setLeverage] = useState<number>(10);
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [tradingLog, setTradingLog] = useState<string[]>([
    '📈 Wall Street Exchange Live: Synchronized with Powerball Wallet.',
    '⚡ Trading leverage enabled up to 100x. Market manipulation tools online.'
  ]);

  // Live Price Fluctuation Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setStocks(prev => prev.map(s => {
        const deltaPercent = (Math.random() - 0.48) * 3; // slight upward drift
        const newPrice = Math.max(0.01, s.price * (1 + deltaPercent / 100));
        const newHist = [...s.history.slice(1), newPrice];
        return {
          ...s,
          price: Number(newPrice.toFixed(2)),
          change24h: Number((s.change24h + deltaPercent * 0.1).toFixed(2)),
          history: newHist
        };
      }));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const activeStock = stocks.find(s => s.symbol === selectedStockSymbol) || stocks[0];

  const handleBuyPosition = (type: 'LONG' | 'SHORT') => {
    const amount = parseFloat(tradeAmountInput) || 0;
    if (amount <= 0) return;
    if (amount > currentBalance) {
      setTradingLog(prev => [`⚠️ Insufficient Funds: $${amount.toLocaleString()} required!`, ...prev]);
      return;
    }

    onUpdateBalance(prev => prev - amount);
    const shares = (amount * leverage) / activeStock.price;
    const newPos: PortfolioPosition = {
      id: `pos-${Date.now()}`,
      symbol: activeStock.symbol,
      shares,
      buyPrice: activeStock.price,
      type,
      leverage
    };

    setPositions(prev => [newPos, ...prev]);
    if (soundEnabled) playCoinSound(soundEnabled);
    setTradingLog(prev => [
      `✅ OPENED ${leverage}x ${type}: ${shares.toFixed(4)} shares of ${activeStock.symbol} at $${activeStock.price.toLocaleString()}`,
      ...prev
    ]);
  };

  const handleClosePosition = (posId: string) => {
    const pos = positions.find(p => p.id === posId);
    if (!pos) return;
    const stock = stocks.find(s => s.symbol === pos.symbol) || activeStock;
    const initialCollateral = (pos.shares * pos.buyPrice) / pos.leverage;
    
    let profitLoss = 0;
    if (pos.type === 'LONG') {
      profitLoss = pos.shares * (stock.price - pos.buyPrice);
    } else {
      profitLoss = pos.shares * (pos.buyPrice - stock.price);
    }

    const payout = Math.max(0, initialCollateral + profitLoss);
    onUpdateBalance(prev => prev + payout);
    setPositions(prev => prev.filter(p => p.id !== posId));

    if (payout > initialCollateral) {
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else {
      if (soundEnabled) playTickSound(soundEnabled);
    }

    setTradingLog(prev => [
      `💰 CLOSED POSITION: ${pos.symbol} P/L: ${profitLoss >= 0 ? '+' : ''}$${Math.floor(profitLoss).toLocaleString()} (Returned $${Math.floor(payout).toLocaleString()})`,
      ...prev
    ]);
  };

  // MARKET MANIPULATION CHEATS
  const handleMarketPump = () => {
    setStocks(prev => prev.map(s => {
      const newPrice = s.price * 5;
      return {
        ...s,
        price: Number(newPrice.toFixed(2)),
        change24h: s.change24h + 400,
        history: [...s.history.slice(1), newPrice]
      };
    }));
    if (soundEnabled) playJackpotSound(soundEnabled);
    setTradingLog(prev => [`🚨 OP ADMIN MARKET MANIPULATION: PUMPED ALL ASSETS BY +500%! 🚀🚀🚀`, ...prev]);
  };

  const handleBailout = () => {
    const bailoutCash = 100000000000; // $100 Billion
    onUpdateBalance(prev => prev + bailoutCash);
    if (soundEnabled) playJackpotSound(soundEnabled);
    setTradingLog(prev => [`🏛️ FED WALL STREET BAILOUT: Deposited +$100,000,000,000 Cash to ${username}'s wallet!`, ...prev]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg border border-emerald-200">
            📈
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                WALL STREET & CRYPTO EXCHANGE TERMINAL
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/40 animate-pulse">
                LIVE MARKET ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-300 pt-1">
              Trader: <span className="text-emerald-400 font-bold">{username}</span> • Available Cash: <span className="text-cyan-300 font-bold">${currentBalance.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* OP ADMIN CHEAT BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMarketPump}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            🚀 PUMP MARKET (+500%)
          </button>
          <button
            onClick={handleBailout}
            className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
          >
            🏛️ $100B FED BAILOUT
          </button>
        </div>
      </div>

      {/* TICKER GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stocks.map(stock => {
          const isSelected = stock.symbol === selectedStockSymbol;
          const isPositive = stock.change24h >= 0;
          return (
            <button
              key={stock.symbol}
              onClick={() => setSelectedStockSymbol(stock.symbol)}
              className={`p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/40 shadow-xl'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xl">{stock.icon}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isPositive ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                }`}>
                  {isPositive ? '+' : ''}{stock.change24h}%
                </span>
              </div>
              <div className="mt-2">
                <div className="font-extrabold text-xs text-white">{stock.symbol}</div>
                <div className="text-[10px] text-slate-400 truncate">{stock.name}</div>
                <div className="text-xs font-mono font-black text-cyan-300 mt-1">${stock.price.toLocaleString()}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* MAIN TRADING WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ACTIVE ASSET CHART & ORDER PANEL */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{activeStock.icon}</span>
              <div>
                <h3 className="font-extrabold text-base text-white">{activeStock.name} ({activeStock.symbol})</h3>
                <p className="text-xs text-slate-400">Current Spot Price: <span className="text-emerald-400 font-mono font-bold">${activeStock.price.toLocaleString()}</span></p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-black font-mono ${activeStock.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {activeStock.change24h >= 0 ? '+' : ''}{activeStock.change24h}% 24H
              </div>
            </div>
          </div>

          {/* SIMULATED CANDLESTICK GRAPH */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-end justify-between h-36 gap-2">
            {activeStock.history.map((priceVal, idx) => {
              const maxVal = Math.max(...activeStock.history) * 1.05;
              const minVal = Math.min(...activeStock.history) * 0.95;
              const heightPct = Math.max(10, Math.min(100, ((priceVal - minVal) / (maxVal - minVal || 1)) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[9px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-all">${priceVal.toFixed(1)}</span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-cyan-400 rounded-t transition-all duration-500"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] text-slate-600 font-mono">T-{5 - idx}</span>
                </div>
              );
            })}
          </div>

          {/* ORDER CONTROLS */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-4">
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">EXECUTE LEVERAGED TRADE</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Trade Collateral ($ Cash)</label>
                <input
                  type="number"
                  value={tradeAmountInput}
                  onChange={e => setTradeAmountInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold text-sm px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Leverage Multiplier ({leverage}x)</label>
                <div className="flex gap-2">
                  {[1, 5, 10, 25, 50, 100].map(lev => (
                    <button
                      key={lev}
                      onClick={() => setLeverage(lev)}
                      className={`flex-1 text-xs font-black py-2 rounded-lg border transition-all ${
                        leverage === lev
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleBuyPosition('LONG')}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition-all"
              >
                🟢 BUY LONG ({leverage}x LEVERAGE)
              </button>
              <button
                onClick={() => handleBuyPosition('SHORT')}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-xs py-3 rounded-xl shadow-lg transition-all"
              >
                🔴 SELL SHORT ({leverage}x LEVERAGE)
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE POSITIONS & LIVE LOG */}
        <div className="space-y-6">
          {/* POSITIONS CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <h3 className="font-black text-xs text-white uppercase tracking-wider flex justify-between items-center">
              <span>💼 ACTIVE POSITIONS ({positions.length})</span>
            </h3>

            {positions.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">No open positions. Select an asset and execute a trade.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {positions.map(pos => {
                  const stock = stocks.find(s => s.symbol === pos.symbol) || activeStock;
                  let pnl = pos.type === 'LONG'
                    ? pos.shares * (stock.price - pos.buyPrice)
                    : pos.shares * (pos.buyPrice - stock.price);
                  const isProfitable = pnl >= 0;

                  return (
                    <div key={pos.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className="font-bold text-white">{pos.symbol} <span className="text-[10px] text-cyan-400">({pos.leverage}x {pos.type})</span></div>
                        <div className="text-[10px] text-slate-400">Buy: ${pos.buyPrice.toLocaleString()} → Now: ${stock.price.toLocaleString()}</div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <span className={`font-black ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfitable ? '+' : ''}${Math.floor(pnl).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleClosePosition(pos.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-600"
                        >
                          CLOSE
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TRADING LOG */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-[11px]">
            <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LIVE TRADING AUDIT LOG</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar text-slate-300">
              {tradingLog.map((logMsg, i) => (
                <div key={i} className="border-b border-slate-900 pb-1">{logMsg}</div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
