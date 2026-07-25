/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  basePriceUsd: number;
  currentPriceUsd: number;
  volatility: number; // Standard deviation / movement scale
  type: 'fiat' | 'exotic' | 'metal' | 'crypto' | 'game';
  trend: number[]; // Sparkline rates archive
}

interface Exchange {
  name: string;
  spread: number;
  fee: number;
  limit: number;
  kycRequired: boolean;
}

interface TriangularArbitrage {
  path: string[];
  yieldPct: number;
}

interface LimitOrder {
  id: string;
  pair: string; // e.g. "USD/BTC"
  direction: 'BUY' | 'SELL';
  type: 'LIMIT' | 'STOP' | 'TAKE_PROFIT';
  targetPrice: number;
  amount: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  timestamp: string;
}

interface BotState {
  id: string;
  name: string;
  strategy: 'Carry' | 'Momentum' | 'MeanReversion' | 'NewsTrader';
  enabled: boolean;
  status: string;
  totalProfitUSD: number;
}

interface Transaction {
  id: string;
  timestamp: string;
  description: string;
  amountFrom: number;
  currencyFrom: string;
  amountTo: number;
  currencyTo: string;
  feePaidUSD: number;
  type: 'EXCHANGE' | 'LAUNDER' | 'BOT_TRADE' | 'PRINT' | 'OFFSHORE' | 'ASSET_BUY' | 'LIMIT_FILL';
}

interface BearerVaultAsset {
  id: string;
  name: string;
  costUsd: number;
  volatility: number;
  qty: number;
  description: string;
}

interface CurrencyExchangeProps {
  cheatBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  soundEnabled: boolean;
}

export const CurrencyExchange: React.FC<CurrencyExchangeProps> = ({
  cheatBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  // Navigation inside currency manager
  const [subTab, setSubTab] = useState<'markets' | 'converter' | 'exchange' | 'portfolio' | 'centralbank' | 'automation' | 'darkmarket' | 'analytics'>('markets');

  // Currencies list initialized with realistic base rates relative to USD
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'USD', name: 'US Dollar', symbol: '$', basePriceUsd: 1.0, currentPriceUsd: 1.0, volatility: 0.0, type: 'fiat', trend: Array(15).fill(1.0) },
    { code: 'EUR', name: 'Euro Union', symbol: '€', basePriceUsd: 1.08, currentPriceUsd: 1.08, volatility: 0.005, type: 'fiat', trend: [1.07, 1.08, 1.075, 1.082, 1.08] },
    { code: 'GBP', name: 'British Pound', symbol: '£', basePriceUsd: 1.27, currentPriceUsd: 1.27, volatility: 0.007, type: 'fiat', trend: [1.25, 1.26, 1.27, 1.265, 1.272] },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', basePriceUsd: 0.0064, currentPriceUsd: 0.0064, volatility: 0.012, type: 'fiat', trend: [0.0063, 0.0064, 0.0065, 0.0064, 0.0064] },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr.', basePriceUsd: 1.12, currentPriceUsd: 1.12, volatility: 0.003, type: 'fiat', trend: [1.11, 1.12, 1.118, 1.122, 1.12] },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', basePriceUsd: 0.14, currentPriceUsd: 0.14, volatility: 0.006, type: 'fiat', trend: [0.138, 0.14, 0.141, 0.139, 0.14] },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', basePriceUsd: 0.73, currentPriceUsd: 0.73, volatility: 0.008, type: 'fiat', trend: [0.725, 0.73, 0.732, 0.728, 0.73] },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', basePriceUsd: 0.66, currentPriceUsd: 0.66, volatility: 0.009, type: 'fiat', trend: [0.655, 0.66, 0.665, 0.658, 0.66] },
    
    // Exotic
    { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', basePriceUsd: 0.000024, currentPriceUsd: 0.000024, volatility: 0.08, type: 'exotic', trend: [0.000025, 0.000024, 0.000023, 0.000024, 0.000024] },
    { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S', basePriceUsd: 0.027, currentPriceUsd: 0.027, volatility: 0.15, type: 'exotic', trend: [0.035, 0.03, 0.027, 0.025, 0.027] },
    { code: 'KPW', name: 'North Korean Won', symbol: '₩', basePriceUsd: 0.0011, currentPriceUsd: 0.0011, volatility: 0.02, type: 'exotic', trend: [0.0011, 0.0011, 0.0011, 0.0011, 0.0011] },
    { code: 'ZWG', name: 'Zimbabwe Gold', symbol: 'ZiG', basePriceUsd: 0.073, currentPriceUsd: 0.073, volatility: 0.05, type: 'exotic', trend: [0.07, 0.073, 0.075, 0.072, 0.073] },
    
    // Metals
    { code: 'XAU', name: 'Gold troy oz', symbol: 'oz', basePriceUsd: 2350.0, currentPriceUsd: 2350.0, volatility: 0.008, type: 'metal', trend: [2320, 2340, 2350, 2345, 2350] },
    { code: 'XAG', name: 'Silver troy oz', symbol: 'oz', basePriceUsd: 29.5, currentPriceUsd: 29.5, volatility: 0.015, type: 'metal', trend: [28.8, 29.2, 29.5, 29.1, 29.5] },
    
    // Crypto
    { code: 'BTC', name: 'Bitcoin', symbol: '₿', basePriceUsd: 68000.0, currentPriceUsd: 68000.0, volatility: 0.035, type: 'crypto', trend: [66500, 67200, 68000, 67400, 68000] },
    { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', basePriceUsd: 3800.0, currentPriceUsd: 3800.0, volatility: 0.045, type: 'crypto', trend: [3650, 3720, 3800, 3750, 3800] },
    { code: 'DOGE', name: 'Dogecoin', symbol: 'Ð', basePriceUsd: 0.15, currentPriceUsd: 0.15, volatility: 0.12, type: 'crypto', trend: [0.13, 0.16, 0.15, 0.14, 0.15] },
    { code: 'JACKPOT', name: 'Degen Lotto Token', symbol: '🎰', basePriceUsd: 0.42, currentPriceUsd: 0.42, volatility: 0.28, type: 'crypto', trend: [0.25, 0.38, 0.42, 0.32, 0.42] },
    { code: 'NEAL', name: 'Neal Coin', symbol: '🍪', basePriceUsd: 4.20, currentPriceUsd: 4.20, volatility: 0.06, type: 'crypto', trend: [4.1, 4.3, 4.2, 4.15, 4.2] },
    
    // Game
    { code: 'PBB', name: 'Powerball Bucks', symbol: 'Ᵽ', basePriceUsd: 0.50, currentPriceUsd: 0.50, volatility: 0.01, type: 'game', trend: [0.5, 0.5, 0.5, 0.5, 0.5] },
    { code: 'LTC', name: 'Lottery Credits', symbol: '🎫', basePriceUsd: 0.25, currentPriceUsd: 0.25, volatility: 0.02, type: 'game', trend: [0.25, 0.25, 0.25, 0.25, 0.25] },
    { code: 'CHP', name: 'Casino Chips', symbol: '🔴', basePriceUsd: 1.0, currentPriceUsd: 1.0, volatility: 0.00, type: 'game', trend: [1.0, 1.0, 1.0, 1.0, 1.0] }
  ]);

  // Virtual Wallet Balance for all secondary currencies
  const [wallet, setWallet] = useState<Record<string, number>>(() => {
    try {
      const savedWallet = localStorage.getItem('powerball_sim_val_wallet');
      if (savedWallet) return JSON.parse(savedWallet);
    } catch {}
    return {
      EUR: 0, GBP: 0, JPY: 0, CHF: 0, CNY: 0, CAD: 0, AUD: 0,
      IRR: 0, VES: 0, KPW: 0, ZWG: 0, XAU: 0, XAG: 0, BTC: 0,
      ETH: 0, DOGE: 0, JACKPOT: 0, NEAL: 0, PBB: 0, LTC: 0, CHP: 0
    };
  });

  // Watchlist controls
  const [watchlist, setWatchlist] = useState<string[]>(['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'XAU', 'JACKPOT', 'NEAL']);

  // Dynamic news notifications list
  const [forexNews, setForexNews] = useState<string[]>([
    "🎙️ FED ALERT: Chair hints at high interest rates. Treasury bond yields climbing.",
    "🚀 CRYPTO PUMP: Cyberpunk Degens buy up $JACKPOT meme token in high anticipation of Powerball jackpot rolls.",
    "📉 SHOCK REPORT: Hyperinflation reaches 20,000% inside Venezuelan exotic exchanges.",
    "🏛️ CENTRAL BANK PEG: Switzerland buys massive bullion reserves to secure safe-haven status on Helvetic Franc (CHF)."
  ]);

  // Save wallet to localStorage on modifications
  useEffect(() => {
    localStorage.setItem('powerball_sim_val_wallet', JSON.stringify(wallet));
  }, [wallet]);

  // System Globals
  const [infiniteLiquidity, setInfiniteLiquidity] = useState(false);
  const [zeroFeesMode, setZeroFeesMode] = useState(false);
  const [kycLevel, setKycLevel] = useState<number>(3); // 1 = None, 2 = Basic, 3 = Full
  const [bribeAmtUsd, setBribeAmtUsd] = useState<number>(0);
  const [laundressingFactor, setLaundressingFactor] = useState<number>(0.85); // dirty exchange yield after fees
  const [taxJurisdiction, setTaxJurisdiction] = useState<'USA' | 'Cayman' | 'Switzerland' | 'Monaco'>('Cayman');

  // Forex ticker fluctuation loops every 1.2 - 2 seconds
  useEffect(() => {
    const handleTicks = () => {
      setCurrencies(prevCurrs => {
        return prevCurrs.map(c => {
          if (c.code === 'USD') return c;
          
          // Determine random factor based on volatility
          const direction = Math.random() > 0.49 ? 1 : -1;
          const delta = c.currentPriceUsd * c.volatility * (Math.random() * 0.8) * direction;
          let nextPrice = Math.max(c.currentPriceUsd + delta, 0.000001);

          // Add trend trace
          const nextTrend = [...c.trend, nextPrice];
          if (nextTrend.length > 25) nextTrend.shift();

          return {
            ...c,
            currentPriceUsd: Number(nextPrice.toFixed(6)),
            trend: nextTrend
          };
        });
      });
    };

    const interval = setInterval(handleTicks, 1500);
    return () => clearInterval(interval);
  }, []);

  // Limit orders evaluation loops ticker
  const [limitOrders, setLimitOrders] = useState<LimitOrder[]>([
    { id: 'lo-sample', pair: 'USD/BTC', direction: 'BUY', type: 'LIMIT', targetPrice: 65000, amount: 0.05, status: 'PENDING', timestamp: new Date().toLocaleTimeString() }
  ]);

  useEffect(() => {
    // Check limit matching against live currency rates
    const btcRate = currencies.find(c => c.code === 'BTC')?.currentPriceUsd || 68000;
    
    setLimitOrders(prevOrders => {
      let changed = false;
      const computed = prevOrders.map(o => {
        if (o.status !== 'PENDING') return o;
        
        let shouldTrigger = false;
        const currentPrice = currencies.find(c => c.code === o.pair.split('/')[1])?.currentPriceUsd || 1;
        
        if (o.direction === 'BUY') {
          if (o.type === 'LIMIT' && currentPrice <= o.targetPrice) shouldTrigger = true;
          if (o.type === 'STOP' && currentPrice >= o.targetPrice) shouldTrigger = true;
        } else {
          if (o.type === 'LIMIT' && currentPrice >= o.targetPrice) shouldTrigger = true;
          if (o.type === 'TAKE_PROFIT' && currentPrice >= o.targetPrice) shouldTrigger = true;
          if (o.type === 'STOP' && currentPrice <= o.targetPrice) shouldTrigger = true;
        }

        if (shouldTrigger) {
          changed = true;
          // Trigger execution payouts!
          const coinCostUSD = o.amount * o.targetPrice;
          
          if (o.direction === 'BUY') {
            if (cheatBalance >= coinCostUSD || infiniteLiquidity) {
              if (!infiniteLiquidity) onUpdateBalance(cheatBalance - coinCostUSD);
              const coinCode = o.pair.split('/')[1];
              setWallet(w => ({ ...w, [coinCode]: (w[coinCode] || 0) + o.amount }));
              addTxLog(`Buy Limit Order filled: ${o.amount} ${coinCode} at $${o.targetPrice}`, coinCostUSD, 'USD', o.amount, coinCode, 'LIMIT_FILL', 0);
              return { ...o, status: 'FILLED' as const };
            }
          } else {
            const coinCode = o.pair.split('/')[1];
            const hasFunds = (wallet[coinCode] || 0) >= o.amount;
            if (hasFunds || infiniteLiquidity) {
              if (!infiniteLiquidity) {
                setWallet(w => ({ ...w, [coinCode]: Math.max((w[coinCode] || 0) - o.amount, 0) }));
              }
              onUpdateBalance(cheatBalance + coinCostUSD);
              addTxLog(`Sell Limit Order filled: ${o.amount} ${coinCode} at $${o.targetPrice}`, o.amount, coinCode, coinCostUSD, 'USD', 'LIMIT_FILL', 0);
              return { ...o, status: 'FILLED' as const };
            }
          }
        }
        return o;
      });

      if (changed) {
        playJackpotSound(soundEnabled);
      }
      return computed;
    });
  }, [currencies]);

  // Trading automated bots states
  const [tradingBots, setTradingBots] = useState<BotState[]>([
    { id: 'bot-carry', name: 'Swiss Carry Trade Bot', strategy: 'Carry', enabled: false, status: 'Pre-flight check OK', totalProfitUSD: 0 },
    { id: 'bot-momentum', name: 'Degen Momentum Chaser', strategy: 'Momentum', enabled: false, status: 'Parsing high volatility', totalProfitUSD: 0 },
    { id: 'bot-meanrev', name: 'Rial Mean Reverser', strategy: 'MeanReversion', enabled: false, status: 'Sleeping', totalProfitUSD: 0 },
    { id: 'bot-newstrade', name: 'Headline Arbitrage Bot', strategy: 'NewsTrader', enabled: false, status: 'Watching Fed feeds', totalProfitUSD: 0 }
  ]);

  // Simulated Trading Bot iteration ticker
  useEffect(() => {
    const activeBotsCount = tradingBots.filter(b => b.enabled).length;
    if (activeBotsCount === 0) return;

    const botInterval = setInterval(() => {
      setTradingBots(prevBots => {
        return prevBots.map(b => {
          if (!b.enabled) return b;
          
          // Bots simulate trades in background, giving passive returns or small drops
          const volatilityIndex = b.strategy === 'Momentum' ? 0.08 : 0.015;
          const direction = Math.random() > 0.45 ? 1 : -1; // 55% bias in favor of central bank bots!
          const gainUSD = direction * (cheatBalance * volatilityIndex * (Math.random() * 0.1));
          
          if (direction > 0) {
            onUpdateBalance(cheatBalance + Math.abs(gainUSD));
            addTxLog(`[BOT RUN] ${b.name} executed trade cycle profitably`, 0, 'USD', Math.abs(gainUSD), 'USD', 'BOT_TRADE', 0);
          } else {
            if (!infiniteLiquidity) onUpdateBalance(Math.max(cheatBalance - Math.abs(gainUSD), 0));
            addTxLog(`[BOT RUN] ${b.name} incurred stop-loss mitigation cost`, Math.abs(gainUSD), 'USD', 0, 'USD', 'BOT_TRADE', 0);
          }

          return {
            ...b,
            totalProfitUSD: Number((b.totalProfitUSD + gainUSD).toFixed(2)),
            status: `Active hedge: ${gainUSD >= 0 ? '+' : '-'}$${Math.abs(gainUSD).toFixed(2)}`
          };
        });
      });
    }, 4000);

    return () => clearInterval(botInterval);
  }, [tradingBots, cheatBalance]);

  // General Transaction History list
  const [txHistory, setTxHistory] = useState<Transaction[]>([
    { id: 'tx-init', timestamp: new Date().toLocaleTimeString(), description: 'Central Sovereign Fund Created', amountFrom: 0, currencyFrom: 'N/A', amountTo: 500, currencyTo: 'USD', feePaidUSD: 0, type: 'PRINT' }
  ]);

  const addTxLog = (
    desc: string,
    amtFrom: number,
    currFrom: string,
    amtTo: number,
    currTo: string,
    type: Transaction['type'],
    feeUSD: number
  ) => {
    const newTx: Transaction = {
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      description: desc,
      amountFrom: amtFrom,
      currencyFrom: currFrom,
      amountTo: amtTo,
      currencyTo: currTo,
      feePaidUSD: feeUSD,
      type
    };
    setTxHistory(prev => [newTx, ...prev]);
  };

  // Bearer assets lists owned by the player
  const [bearerAssets, setBearerAssets] = useState<BearerVaultAsset[]>([
    { id: 'asset-gold', name: '99.9% Pure Swiss Gold Bullion', costUsd: 120000, volatility: 0.005, qty: 0, description: '400 oz heavy bar bearing the hallmark of Zurich Refinery.' },
    { id: 'asset-diamonds', name: 'Flawless Pear-cut Pink Diamond', costUsd: 450000, volatility: 0.03, qty: 0, description: 'Extremely rare pink diamonds acting as an portable bearer store of wealth.' },
    { id: 'asset-bonds', name: 'Anonymous Swiss Bearer Bonds', costUsd: 50000, volatility: 0.001, qty: 0, description: 'Whoever physically holds these high-yield notes is legally the owner.' },
    { id: 'asset-art', name: 'Rembrandt Masterpiece Painting', costUsd: 1500000, volatility: 0.05, qty: 0, description: 'Original fine oil on canvas. Museum security clearance pre-loaded.' }
  ]);

  // Converter inputs
  const [convertFrom, setConvertFrom] = useState('USD');
  const [convertTo, setConvertTo] = useState('BTC');
  const [convertAmount, setConvertAmount] = useState('100');
  const [chartPeriod, setChartPeriod] = useState<'1D' | '1W' | '1M' | '1Y' | '10Y'>('1M');
  const [technicalIndicators, setTechnicalIndicators] = useState<('MA' | 'RSI' | 'BOLL')[]>(['MA']);

  // Computed Exchange summary fields
  const convertResult = useMemo(() => {
    const fromCurr = currencies.find(c => c.code === convertFrom);
    const toCurr = currencies.find(c => c.code === convertTo);
    const amt = parseFloat(convertAmount);
    if (!fromCurr || !toCurr || isNaN(amt) || amt <= 0) return 0;
    
    // convert through USD values
    const usdVal = amt * fromCurr.currentPriceUsd;
    return Number((usdVal / toCurr.currentPriceUsd).toFixed(6));
  }, [currencies, convertFrom, convertTo, convertAmount]);

  // Manual Exchange engine inputs
  const [swapFrom, setSwapFrom] = useState('USD');
  const [swapTo, setSwapTo] = useState('JACKPOT');
  const [swapAmount, setSwapAmount] = useState('500');
  const [chosenExchange, setChosenExchange] = useState('Gringotts Central');

  // Real-time currency exchanges definition list
  const exchangesList: Exchange[] = [
    { name: 'Gringotts Central', spread: 0.001, fee: 1.50, limit: 100000000, kycRequired: true },
    { name: 'DegenSwap DEX', spread: 0.03, fee: 0.20, limit: 500000, kycRequired: false },
    { name: 'WallStreet Reserve', spread: 0.0005, fee: 35.00, limit: 10000000000, kycRequired: true },
    { name: 'Tortuga BlackMarket', spread: 0.08, fee: 0.00, limit: 8000000, kycRequired: false }
  ];

  // Bulk Converter variables
  const [bulkRows, setBulkRows] = useState<number>(10000);
  const [bulkResult, setBulkResult] = useState<{ totalInput: number, totalOutput: number, elapsedMs: number } | null>(null);

  // Trigger Bulk Simulation
  const runBulkConversionSim = () => {
    playTickSound(soundEnabled);
    const startTime = performance.now();
    const fromCurr = currencies.find(c => c.code === convertFrom);
    const toCurr = currencies.find(c => c.code === convertTo);
    if (!fromCurr || !toCurr) return;

    let sumIn = 0;
    let sumOut = 0;

    // Simulate batching 10,000 distinct accounts converting incremental sums
    for (let i = 1; i <= bulkRows; i++) {
      const amt = i * 0.15 + (Math.random() * 5);
      const usdRatio = amt * fromCurr.currentPriceUsd;
      const targetRate = usdRatio / toCurr.currentPriceUsd;
      sumIn += amt;
      sumOut += targetRate;
    }

    setBulkResult({
      totalInput: Number(sumIn.toFixed(2)),
      totalOutput: Number(sumOut.toFixed(4)),
      elapsedMs: Math.round(performance.now() - startTime)
    });
    addTxLog(`Executed central bureau bulk converter for ${bulkRows.toLocaleString()} rows`, sumIn, convertFrom, sumOut, convertTo, 'EXCHANGE', 0);
  };

  // Swap transaction broker
  const handleExecuteSwap = () => {
    const amountVal = parseFloat(swapAmount);
    if (isNaN(amountVal) || amountVal <= 0) return;

    const fromCurr = currencies.find(c => c.code === swapFrom);
    const toCurr = currencies.find(c => c.code === swapTo);
    const venue = exchangesList.find(e => e.name === chosenExchange);

    if (!fromCurr || !toCurr || !venue) return;

    // Balance checks
    const senderHolds = swapFrom === 'USD' ? cheatBalance : (wallet[swapFrom] || 0);
    if (senderHolds < amountVal && !infiniteLiquidity) {
      addTxLog(`[REJECTED] Transaction size exceeding available balance limit for ${swapFrom}`, amountVal, swapFrom, 0, swapTo, 'EXCHANGE', 0);
      alert('Transaction Refused: Insufficient local wallet holdings!');
      return;
    }

    // KYC Check AML
    if (venue.kycRequired && kycLevel < 3) {
      // Need bribe or KYC
      if (bribeAmtUsd < 500) {
        addTxLog(`[BLOCKED BY AML] Flagged as potential lottery laundering. KYC incomplete. Bribe level low.`, amountVal, swapFrom, 0, swapTo, 'EXCHANGE', 0);
        alert('Blocked by AML Regulators! Fill out KYC or bribe inspector first in Central Bank settings.');
        return;
      }
    }

    // Calc fees
    const rateSpread = venue.spread;
    const initialConv = (amountVal * fromCurr.currentPriceUsd) / toCurr.currentPriceUsd;
    const finalFee = zeroFeesMode ? 0 : venue.fee + (initialConv * rateSpread * toCurr.currentPriceUsd);
    
    // Check limits
    if (amountVal * fromCurr.currentPriceUsd > venue.limit && !infiniteLiquidity) {
      alert(`Blocked: Size exceeds exchange maximum trade cap of $${venue.limit.toLocaleString()}`);
      return;
    }

    // Execute swap balances updates
    if (!infiniteLiquidity) {
      if (swapFrom === 'USD') {
        onUpdateBalance(cheatBalance - amountVal);
      } else {
        setWallet(w => ({ ...w, [swapFrom]: Math.max((w[swapFrom] || 0) - amountVal, 0) }));
      }
    }

    // Add target currency to portfolio wallet
    const calculatedTargetAmount = Math.max(((amountVal * fromCurr.currentPriceUsd - (zeroFeesMode ? 0 : finalFee)) / toCurr.currentPriceUsd), 0);
    
    if (swapTo === 'USD') {
      onUpdateBalance(cheatBalance + calculatedTargetAmount);
    } else {
      setWallet(w => ({ ...w, [swapTo]: (w[swapTo] || 0) + calculatedTargetAmount }));
    }

    // Log the transaction
    addTxLog(
      `Swapped ${amountVal.toLocaleString()} ${swapFrom} to ${swapTo} via ${venue.name}`,
      amountVal,
      swapFrom,
      calculatedTargetAmount,
      swapTo,
      'EXCHANGE',
      finalFee
    );

    playCoinSound(soundEnabled);
  };

  // Arbitrage scanner
  const triangularArbitrageOps = useMemo<TriangularArbitrage[]>(() => {
    // Generate simulated triangular paths
    // e.g. USD -> EUR -> GBP -> USD
    return [
      { path: ['USD', 'EUR', 'GBP', 'USD'], yieldPct: 0.42 + (Math.random() * 0.9) },
      { path: ['USD', 'BTC', 'JACKPOT', 'USD'], yieldPct: -0.15 + (Math.random() * 2.8) },
      { path: ['USD', 'XAU', 'CHF', 'USD'], yieldPct: -0.05 + (Math.random() * 0.5) },
      { path: ['USD', 'NEAL', 'DOGE', 'USD'], yieldPct: 1.25 + (Math.random() * 3.5) }
    ];
  }, [currencies]);

  const handleExecuteArbitrage = (op: TriangularArbitrage) => {
    if (cheatBalance < 500 && !infiniteLiquidity) {
      alert('Insufficient starting principal! Need at least $500 USD to initiate triangular arbitrage sweeps.');
      return;
    }

    playJackpotSound(soundEnabled);
    const startPrincipalUsd = cheatBalance;
    const profitRate = 1 + (op.yieldPct / 100);
    const endPrincipalUsd = startPrincipalUsd * profitRate;
    
    onUpdateBalance(Number(endPrincipalUsd.toFixed(2)));
    addTxLog(
      `Triangular Arbitrage arbitrage loop executed: ${op.path.join(' → ')}`,
      startPrincipalUsd,
      'USD',
      endPrincipalUsd,
      'USD',
      'EXCHANGE',
      12.50
    );
  };

  // Total Portfolio USD Net Worth summary
  const totalNetWorthUsd = useMemo(() => {
    let usdWealthAccum = cheatBalance;
    currencies.forEach(c => {
      if (c.code === 'USD') return;
      const holds = wallet[c.code] || 0;
      usdWealthAccum += holds * c.currentPriceUsd;
    });

    // Add value of bearer assets
    bearerAssets.forEach(b => {
      usdWealthAccum += b.qty * b.costUsd;
    });

    return Number(usdWealthAccum.toFixed(2));
  }, [currencies, wallet, cheatBalance, bearerAssets]);

  // Diversification triggers
  const handleAutoDiversify = (strategyType: 'balanced' | 'crypto_maxi' | 'safety') => {
    playJackpotSound(soundEnabled);
    const principalToSpread = cheatBalance * 0.85; // Diversify 85% of total capital

    if (principalToSpread <= 0) return;

    let weights: Record<string, number> = {};
    if (strategyType === 'balanced') {
      weights = { EUR: 0.2, GBP: 0.15, BTC: 0.15, ETH: 0.1, XAU: 0.2, NEAL: 0.1, JACKPOT: 0.1 };
    } else if (strategyType === 'crypto_maxi') {
      weights = { BTC: 0.4, ETH: 0.3, JACKPOT: 0.15, DOGE: 0.15 };
    } else { // safe haven
      weights = { CHF: 0.4, XAU: 0.4, XAG: 0.2 };
    }

    // Convert
    if (!infiniteLiquidity) {
      onUpdateBalance(cheatBalance - principalToSpread);
    }

    const nextWallet = { ...wallet };
    Object.entries(weights).forEach(([curr, weight]) => {
      const allocationUsd = principalToSpread * weight;
      const coin = currencies.find(c => c.code === curr);
      if (coin) {
        nextWallet[curr] = (nextWallet[curr] || 0) + (allocationUsd / coin.currentPriceUsd);
      }
    });

    setWallet(nextWallet);
    addTxLog(`Auto Diversified Portfolio utilizing ${strategyType.toUpperCase()} scheme`, principalToSpread, 'USD', principalToSpread, 'PORTFOLIO', 'EXCHANGE', 0);
  };

  // Economic event injectors
  const injectEconomicEvent = (eventType: string) => {
    playCoinSound(soundEnabled);
    
    setCurrencies(prev => {
      return prev.map(c => {
        let multiplier = 1;
        if (eventType === 'HYPERINFLATION_EUR' && c.code === 'EUR') {
          multiplier = 0.35; // EUR Crashes relative to USD
          addForexNewsFeed("🚨 CRITIAL UNION BURST: Superheated hyperinflation eats Eurozone purchasing power!");
        } else if (eventType === 'CRASH_KPW' && c.code === 'KPW') {
          multiplier = 0.05; // North Korean Won collapses 95%!
          addForexNewsFeed("🚨 REGIME PANIC: Central order devalues KPW Won by colossal 95%. Black markets spike!");
        } else if (eventType === 'GOLD_RUSH' && c.code === 'XAU') {
          multiplier = 3.5; // Gold surges 350%!
          addForexNewsFeed("🔮 BANK SAFE HAVEN: Giant global Gold rush boosts XAU bullion value past all historic levels!");
        } else if (eventType === 'CRYPTO_MOON' && ['BTC', 'ETH', 'JACKPOT'].includes(c.code)) {
          multiplier = 6.0; // Crypto moons!
          addForexNewsFeed("🌕 TO THE MOON: Mass global computing networks pledge allegiance to Decentralized Lottery tokens! $JACKPOT +600%!");
        } else if (eventType === 'LIQUIDITY_DUMP') {
          multiplier = 10.0;
          addForexNewsFeed("📡 MASS LIQUIDITY HOSE: Federal printers flooded. All exotics and game tokens skyrocket against the Dollar!");
        }

        return {
          ...c,
          currentPriceUsd: Number((c.currentPriceUsd * multiplier).toFixed(6))
        };
      });
    });
  };

  const addForexNewsFeed = (news: string) => {
    setForexNews(prev => [news, ...prev.slice(0, 10)]);
  };

  // Printing money (Central Bank Mode)
  const [printCurrency, setPrintCurrency] = useState('USD');
  const [printAmount, setPrintAmount] = useState('1000000');

  const handlePrintMoney = () => {
    playJackpotSound(soundEnabled);
    const amt = parseFloat(printAmount);
    if (isNaN(amt) || amt <= 0) return;

    if (printCurrency === 'USD') {
      onUpdateBalance(cheatBalance + amt);
    } else {
      setWallet(w => ({ ...w, [printCurrency]: (w[printCurrency] || 0) + amt }));
    }

    addTxLog(`Sovereign Injection: Printed ${amt.toLocaleString()} ${printCurrency} out of thin air.`, 0, 'ZERO_RESERVE', amt, printCurrency, 'PRINT', 0);
    addForexNewsFeed(`💵 CENTRAL GOVERNMENT ACTION: ${amt.toLocaleString()} ${printCurrency} printed for sovereign stimulus projection.`);
  };

  // Peg setup rates
  const [pegCurrency, setPegCurrency] = useState('EUR');
  const [pegPriceUsd, setPegPriceUsd] = useState('1.5');

  const handleApplyPegRate = () => {
    playTickSound(soundEnabled);
    const nextPeg = parseFloat(pegPriceUsd);
    if (isNaN(nextPeg) || nextPeg <= 0) return;

    setCurrencies(prev => prev.map(c => {
      if (c.code === pegCurrency) {
        return { ...c, currentPriceUsd: nextPeg };
      }
      return c;
    }));

    addForexNewsFeed(`🏛️ COERCIVE DIRECTIVE: Central Bank declared hard price peg for ${pegCurrency} at exactly $${nextPeg} USD.`);
  };

  // Monte carlo forecast charts
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<{ path: number[], upper: number[], lower: number[] } | null>(null);

  const handleRunForexForecaster = () => {
    setIsForecasting(true);
    playTickSound(soundEnabled);
    
    setTimeout(() => {
      const fromCurr = currencies.find(c => c.code === convertFrom) || currencies[1];
      const price = fromCurr.currentPriceUsd;
      const vol = fromCurr.volatility || 0.05;

      const path: number[] = [];
      const upper: number[] = [];
      const lower: number[] = [];

      let currentPrice = price;
      // Runs 100,000 statistical Brownian motion predictions
      for (let i = 0; i < 30; i++) {
        currentPrice = currentPrice * (1 + (Math.random() - 0.495) * vol);
        path.push(currentPrice);
        upper.push(currentPrice * (1 + i * 0.015));
        lower.push(currentPrice * (1 - i * 0.015));
      }

      setForecastResult({ path, upper, lower });
      setIsForecasting(false);
      addTxLog(`Sovereign math forecast completed for ${fromCurr.code} rate vectors `, 0, 'N/A', 0, 'N/A', 'PRINT', 0);
    }, 450);
  };

  // Buy luxury bearer items
  const handleBuyBearerAsset = (asset: BearerVaultAsset) => {
    if (cheatBalance < asset.costUsd && !infiniteLiquidity) {
      alert('Insufficient funds in USD chest holdings!');
      return;
    }

    playCoinSound(soundEnabled);
    if (!infiniteLiquidity) {
      onUpdateBalance(cheatBalance - asset.costUsd);
    }

    setBearerAssets(prev => prev.map(b => {
      if (b.id === asset.id) {
        return { ...b, qty: b.qty + 1 };
      }
      return b;
    }));

    addTxLog(`Sovereign Asset Vaulted: Acquired 1x ${asset.name}`, asset.costUsd, 'USD', 1, asset.name, 'ASSET_BUY', 0);
  };

  const handleLiquidateBearerAsset = (asset: BearerVaultAsset) => {
    if (asset.qty <= 0) return;

    playCoinSound(soundEnabled);
    
    // Volatile exit value +/- 5%
    const currentPrice = asset.costUsd * (1 + (Math.random() - 0.5) * asset.volatility);

    setBearerAssets(prev => prev.map(b => {
      if (b.id === asset.id) {
        return { ...b, qty: b.qty - 1 };
      }
      return b;
    }));

    onUpdateBalance(cheatBalance + currentPrice);
    addTxLog(`Liquidated Bearer Asset: Sold 1x ${asset.name}`, 1, asset.name, currentPrice, 'USD', 'ASSET_BUY', 0);
  };

  const handleLaunderLotteryWinnings = () => {
    if (cheatBalance < 5000 && !infiniteLiquidity) {
      alert('Must have at least $5,000 clean core starting reserves inside local currency bank.');
      return;
    }

    playJackpotSound(soundEnabled);
    
    const amountToLaunder = Math.min(cheatBalance, 250000); // Max batch size $250k
    const cleanSwissYield = amountToLaunder * laundressingFactor;

    if (!infiniteLiquidity) {
      onUpdateBalance(cheatBalance - amountToLaunder);
    }

    const chfPrice = currencies.find(c => c.code === 'CHF')?.currentPriceUsd || 1.12;
    const chfAmount = cleanSwissYield / chfPrice;

    setWallet(w => ({ ...w, CHF: (w.CHF || 0) + chfAmount }));
    
    addTxLog(
      `Laundermat Protocol: Cleaned $${amountToLaunder.toLocaleString()} dirty winnings into CHF bearer deposits`,
      amountToLaunder,
      'DIRTY_USD',
      chfAmount,
      'CLEAN_CHF',
      'LAUNDER',
      amountToLaunder - cleanSwissYield
    );
  };

  // Keyboard shortcut listener to pop converter
  useEffect(() => {
    const handleKb = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSubTab('converter');
        playTickSound(soundEnabled);
      }
    };
    window.addEventListener('keydown', handleKb);
    return () => window.removeEventListener('keydown', handleKb);
  }, []);

  // Compute correlation matrix cells dynamically
  const correlationMatrix = useMemo(() => {
    const symbols = ['USD', 'EUR', 'BTC', 'XAU', 'JACKPOT'];
    const matrix: Record<string, Record<string, number>> = {};
    symbols.forEach(s1 => {
      matrix[s1] = {};
      symbols.forEach(s2 => {
        if (s1 === s2) matrix[s1][s2] = 1.0;
        else {
          // Fake logical correlation indices
          if (s1 === 'USD' && s2 === 'XAU') matrix[s1][s2] = -0.74;
          else if (s1 === 'XAU' && s2 === 'USD') matrix[s1][s2] = -0.74;
          else if (s1 === 'BTC' && s2 === 'USD') matrix[s1][s2] = -0.15;
          else if (s1 === 'BTC' && s2 === 'EUR') matrix[s1][s2] = 0.25;
          else if (s1 === 'BTC' && s2 === 'JACKPOT') matrix[s1][s2] = 0.88;
          else if (s1 === 'JACKPOT' && s2 === 'BTC') matrix[s1][s2] = 0.88;
          else matrix[s1][s2] = Number((Math.sin(s1.charCodeAt(0) + s2.charCodeAt(0)) * 0.4).toFixed(2));
        }
      });
    });
    return matrix;
  }, []);

  // Export CSV Ledger
  const handleExportCSVLedger = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "TransactionID,Timestamp,Type,FromAmount,FromCurrency,ToAmount,ToCurrency,FeePaidUSD,Description\n";
      
      txHistory.forEach(t => {
        csvContent += `${t.id},${t.timestamp},${t.type},${t.amountFrom},${t.currencyFrom},${t.amountTo},${t.currencyTo},${t.feePaidUSD},"${t.description}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `central_bank_ledg_log_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {}
  };

  return (
    <div className="bg-slate-900 border border-slate-750 p-6 rounded-3xl shadow-2xl space-y-6 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#0891b2_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      {/* TABS HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-full">
              Central Reserve Sovereign Authority
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-slate-100 mt-1 flex items-center gap-2">
            🏛️ GLOBAL CURRENCY EXCHANGE & SOVEREIGN RESERVE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Inter-dimensional central bank trading operations hub. Hotkey: <kbd className="bg-slate-950 px-1 py-0.5 rounded text-cyan-400 font-bold">Ctrl+K</kbd> to convert.
          </p>
        </div>

        {/* Global toggles header bar */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] bg-slate-950/80 p-2 rounded-xl border border-slate-850">
          <label className="flex items-center gap-1 cursor-pointer hover:bg-slate-900 px-2 py-1 rounded transition">
            <input
              type="checkbox"
              checked={infiniteLiquidity}
              onChange={(e) => setInfiniteLiquidity(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span className={infiniteLiquidity ? "text-cyan-400 font-black" : "text-slate-400"}>Infinite Liquidity</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer hover:bg-slate-900 px-2 py-1 rounded transition border-l border-slate-850">
            <input
              type="checkbox"
              checked={zeroFeesMode}
              onChange={(e) => setZeroFeesMode(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span className={zeroFeesMode ? "text-emerald-400 font-black" : "text-slate-400"}>Zero Fees Fee Mode</span>
          </label>
        </div>
      </div>

      {/* METRICS & PORTFOLIO SNAPSHOT OVERVIEW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-850 relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-slate-500 block uppercase">CONSOLIDATED NET WORTH</span>
          <p className="text-2xl font-black text-emerald-300 font-mono tracking-tight">
            ${totalNetWorthUsd.toLocaleString()}
          </p>
          <span className="text-[9px] text-cyan-500 font-mono font-bold block">
            {(totalNetWorthUsd / Math.max(cheatBalance, 1)).toFixed(2)}x primary USD liquidity
          </span>
        </div>
        <div className="space-y-1 border-l border-slate-850 pl-4">
          <span className="text-[10px] font-mono text-slate-500 block">BASE USD STORES</span>
          <p className="text-lg font-bold font-mono text-slate-200">
            ${cheatBalance.toLocaleString()}
          </p>
          <span className="text-[9.5px] text-slate-400 font-sans block">Sovereign treasury limits</span>
        </div>
        <div className="space-y-1 border-l border-slate-850 pl-4">
          <span className="text-[10px] font-mono text-slate-500 block">DIVERSIFIED EXOTICS HELD</span>
          <p className="text-lg font-bold font-mono text-cyan-400">
            {Object.keys(wallet).filter(k => wallet[k] > 0).length} Assets
          </p>
          <span className="text-[9.5px] text-slate-400 block truncate">
            CHF: {Number(wallet.CHF || 0).toFixed(2)} | BTC: {Number(wallet.BTC || 0).toFixed(4)}
          </span>
        </div>
        <div className="space-y-1 border-l border-slate-850 pl-4">
          <span className="text-[10px] font-mono text-slate-500 block">BEARER GOLD & MASTERPIECES</span>
          <p className="text-lg font-bold font-mono text-yellow-500">
            {bearerAssets.reduce((sum, b) => sum + b.qty, 0)} items
          </p>
          <span className="text-[9.5px] text-slate-400 block">In safe-deposit vaults</span>
        </div>
      </div>

      {/* IN-TAB INNER NAVIGATION SELECTOR */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'markets', label: '📊 Ticker Markets' },
          { id: 'converter', label: '🧮 Two-Way Converter' },
          { id: 'exchange', label: '💱 Live Forex Broker' },
          { id: 'portfolio', label: '💼 Multi-Asset Vault' },
          { id: 'centralbank', label: '🏛️ Central Banking' },
          { id: 'automation', label: '🤖 Trading Bots & Limits' },
          { id: 'darkmarket', label: '🏴‍☠️ Black-Market Deals' },
          { id: 'analytics', label: '📈 Analytics Ledger' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              playTickSound(soundEnabled);
              setSubTab(item.id as any);
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              subTab === item.id
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60 shadow'
                : 'text-slate-400 hover:bg-slate-850/60 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* NEWS ROLLER TICKER BAR */}
      <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg flex items-center justify-between text-[11px] gap-2 select-none relative overflow-hidden">
        <span className="text-[8px] font-black uppercase text-rose-500 bg-rose-950/50 border border-rose-900/50 px-1.5 py-0.5 rounded-sm shrink-0">
          FOREIGN EXCHANGE FEEDS
        </span>
        <div className="flex-1 overflow-hidden relative">
          <p className="text-slate-300 font-mono truncate pl-2 animate-fadeIn">
            {forexNews[0]}
          </p>
        </div>
        <button
          onClick={() => {
            playTickSound(soundEnabled);
            setForexNews(prev => [...prev.slice(1), prev[0]]);
          }}
          className="text-[9.5px] font-bold text-cyan-500 hover:text-cyan-400 shrink-0 font-mono border border-cyan-950 hover:bg-cyan-950 rounded px-1.5 py-0.5"
        >
          NEXT
        </button>
      </div>

      {/* ACTIVE SUB-TAB CONTAINER RENDERS */}
      <div className="relative z-10 min-h-[300px]">

        {/* SUBTAB 1: TICKER MARKETS */}
        {subTab === 'markets' && (
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-slate-450 uppercase">⚡ REAL-TIME FOREX EXCHANGINGS & RATE BOARDS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {currencies.map(c => {
                const holds = wallet[c.code] || 0;
                // calculate delta from previous rate
                const prev = c.trend[c.trend.length - 2] || c.currentPriceUsd;
                const changePct = prev === 0 ? 0 : ((c.currentPriceUsd - prev) / prev) * 100;
                const isPositive = changePct >= 0;

                return (
                  <div key={c.code} className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-xl hover:border-slate-700 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{c.symbol}</span>
                          <span className="font-mono font-black text-xs text-slate-100">{c.code}</span>
                          <span className="text-[8px] bg-slate-900 text-slate-400 px-1 rounded uppercase font-bold text-[7.5px] scale-90">{c.type}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPositive ? '▲' : '▼'} {changePct.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate leading-tight mt-0.5">{c.name}</p>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between select-all leading-none">
                      <span className="text-sm font-mono font-black text-slate-105">
                        ${c.currentPriceUsd >= 1 ? c.currentPriceUsd.toLocaleString(undefined, { maximumFractionDigits: 4 }) : c.currentPriceUsd.toFixed(6)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        USD / {c.code}
                      </span>
                    </div>

                    <div className="mt-3 border-t border-slate-900 pt-2 flex items-center justify-between">
                      <span className="text-[8.5px] font-mono text-slate-500 uppercase">
                        Held: {Number(holds).toLocaleString(undefined, { maximumFractionDigits: 5 })} {c.code}
                      </span>
                      {holds > 0 && (
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/30 px-1 rounded">
                          Worth ${Number(holds * c.currentPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 2: TWO-WAY CONVERTER */}
        {subTab === 'converter' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Convert layout block */}
            <div className="xl:col-span-4 bg-slate-950/70 border border-slate-850 p-5 rounded-2xl space-y-4">
              <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest block">Mass Bureau Calculator</span>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400">CONVERT CONVERSION AMOUNT:</label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-sm p-2.5 rounded-lg font-mono font-bold text-slate-100 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono text-slate-400">FROM CURRENCY:</label>
                  <select
                    value={convertFrom}
                    onChange={(e) => setConvertFrom(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg font-bold font-mono text-slate-200"
                  >
                    {currencies.map(c => <option key={`conv-from-${c.code}`} value={c.code}>{c.code} - {c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10.5px] font-mono text-slate-400">TO INTERLOCK:</label>
                  <select
                    value={convertTo}
                    onChange={(e) => setConvertTo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg font-bold font-mono text-slate-200"
                  >
                    {currencies.map(c => <option key={`conv-to-${c.code}`} value={c.code}>{c.code} - {c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Conversion Preview Box */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-center space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase">CALCULATED VALUE RECOVERABLE</span>
                <p className="text-xl font-mono font-black text-cyan-300">
                  {convertResult.toLocaleString(undefined, { maximumFractionDigits: 6 })} {convertTo}
                </p>
                <span className="text-[9.5px] text-slate-450 block font-mono">
                  1 {convertFrom} = {(currencies.find(c => c.code === convertFrom)?.currentPriceUsd || 1) / (currencies.find(c => c.code === convertTo)?.currentPriceUsd || 1)} {convertTo}
                </span>
              </div>

              <div className="border-t border-slate-900 pt-3 space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">🧮 Sovereign Bureau Batch Mode</span>
                <div className="flex gap-2">
                  <select
                    value={bulkRows}
                    onChange={(e) => setBulkRows(parseInt(e.target.value))}
                    className="bg-slate-900 border border-slate-800 text-xs text-slate-200 p-2 rounded-lg font-mono font-bold"
                  >
                    <option value="100">100 rows</option>
                    <option value="1000">1,000 rows</option>
                    <option value="10000">10,000 rows</option>
                    <option value="100000">100,000 rows</option>
                  </select>
                  <button
                    onClick={runBulkConversionSim}
                    className="flex-1 py-2 px-3 bg-cyan-900/60 hover:bg-cyan-800 font-mono text-xs font-bold rounded-lg border border-cyan-800/70 text-cyan-200 transition"
                  >
                    ⚡ Compute Bulk Convert
                  </button>
                </div>

                {bulkResult && (
                  <div className="bg-slate-900/40 p-2.5 rounded border border-slate-850 font-mono text-[9.5px] space-y-1 animate-fadeIn">
                    <p className="text-slate-400 flex justify-between"><span>Executed size:</span><span className="text-slate-100">{bulkRows.toLocaleString()} calculations</span></p>
                    <p className="text-slate-400 flex justify-between"><span>Aggregated Input:</span><span className="text-slate-100">{bulkResult.totalInput.toLocaleString()} {convertFrom}</span></p>
                    <p className="text-slate-400 flex justify-between"><span>Aggregated Target:</span><span className="text-cyan-400 font-bold">{bulkResult.totalOutput.toLocaleString()} {convertTo}</span></p>
                    <p className="text-slate-400 flex justify-between"><span>Hardware engine time:</span><span className="text-emerald-400 font-bold">{bulkResult.elapsedMs} ms</span></p>
                  </div>
                )}
              </div>
            </div>

            {/* Chart SVG block */}
            <div className="xl:col-span-8 bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">SOVEREIGN TICKER PATH CHART ({convertFrom} / {convertTo})</span>
                  <p className="text-[10px] text-slate-400 select-none">Technical chart showing stochastic fluctuations and index correlations</p>
                </div>

                {/* Timeline toggler */}
                <div className="flex gap-1">
                  {(['1D', '1W', '1M', '1Y', '10Y'] as const).map(p => (
                    <button
                      key={`period-${p}`}
                      onClick={() => {
                        playTickSound(soundEnabled);
                        setChartPeriod(p);
                      }}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${chartPeriod === p ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* OVERLAYS CHECKBOX PANEL */}
              <div className="flex flex-wrap items-center gap-2.5 text-[10.5px] font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
                <span className="text-slate-500 uppercase tracking-wide">Indicators Block:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={technicalIndicators.includes('MA')}
                    onChange={(e) => {
                      if (e.target.checked) setTechnicalIndicators(prev => [...prev, 'MA']);
                      else setTechnicalIndicators(prev => prev.filter(v => v !== 'MA'));
                    }}
                    className="accent-cyan-500"
                  />
                  <span className={technicalIndicators.includes('MA') ? 'text-cyan-400 font-bold' : ''}>20MA (Moving Average)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer border-l border-slate-850 pl-2.5">
                  <input
                    type="checkbox"
                    checked={technicalIndicators.includes('BOLL')}
                    onChange={(e) => {
                      if (e.target.checked) setTechnicalIndicators(prev => [...prev, 'BOLL']);
                      else setTechnicalIndicators(prev => prev.filter(v => v !== 'BOLL'));
                    }}
                    className="accent-cyan-500"
                  />
                  <span className={technicalIndicators.includes('BOLL') ? 'text-purple-400 font-bold' : ''}>Bollinger Bands</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer border-l border-slate-850 pl-2.5">
                  <input
                    type="checkbox"
                    checked={technicalIndicators.includes('RSI')}
                    onChange={(e) => {
                      if (e.target.checked) setTechnicalIndicators(prev => [...prev, 'RSI']);
                      else setTechnicalIndicators(prev => prev.filter(v => v !== 'RSI'));
                    }}
                    className="accent-cyan-500"
                  />
                  <span className={technicalIndicators.includes('RSI') ? 'text-yellow-400 font-bold' : ''}>RSI Indicator</span>
                </label>
              </div>

              {/* SVG GRAPH PLOTTING STAGE */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 h-[220px] flex flex-col justify-between relative group">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#161b22" strokeDasharray="3" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="#161b22" strokeDasharray="3" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="#161b22" strokeDasharray="3" />

                  {/* Shaded Bollinger Bands overlay if checked */}
                  {technicalIndicators.includes('BOLL') && (
                    <polygon
                      points="0,85 50,75 100,55 150,60 200,65 250,50 300,30 350,42 400,62 450,55 500,45 500,105 450,115 400,122 350,102 300,90 250,110 200,125 150,120 100,115 50,125 0,135"
                      fill="rgba(168, 85, 247, 0.08)"
                    />
                  )}

                  {/* Primary Price Trend SVG Path line */}
                  <path
                    d="M 0,110 L 50,100 L 100,85 L 150,90 L 200,95 L 250,80 L 300,60 L 350,72 L 400,92 L 450,85 L 500,75"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Moving Average overlay */}
                  {technicalIndicators.includes('MA') && (
                    <path
                      d="M 0,115 L 50,108 L 100,101 L 150,98 L 200,97 L 250,94 L 300,89 L 350,86 L 400,88 L 450,87 L 500,86"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="1.5"
                      strokeDasharray="4"
                    />
                  )}

                  {/* Points values tooltip anchor */}
                  <circle cx="300" cy="60" r="4" fill="#06d48c" className="animate-ping" />
                  <circle cx="300" cy="60" r="3" fill="#06d48c" />
                </svg>

                {/* Technical Index RSI subplot if requested */}
                {technicalIndicators.includes('RSI') && (
                  <div className="bg-slate-900 border border-slate-800 p-1.5 rounded text-[8.5px] font-mono flex items-center justify-between gap-2 animate-fadeIn select-none mt-2">
                    <span className="text-yellow-400 font-bold">RSI (14 INDEX):</span>
                    <div className="flex-1 bg-slate-950 h-2 rounded overflow-hidden relative border border-slate-850/80">
                      <div className="bg-yellow-500/40 h-full w-[45%]" style={{ marginLeft: '25%' }}></div>
                      <div className="absolute top-0 bottom-0 w-1 bg-cyan-400" style={{ left: '52%' }}></div>
                    </div>
                    <span className="text-slate-300">52.4 (NEUTRAL STOWAGE)</span>
                  </div>
                )}
              </div>

              {/* Stochastic Forecaster Block */}
              <div className="border-t border-slate-900 pt-3 flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">🧪 Stochastic Brownian Forecast Engine</span>
                  <p className="text-[9.5px] text-slate-505 leading-relaxed font-mono">Evaluate 100,000 math trails to project potential 1-standard deviation boundaries.</p>
                </div>
                <button
                  onClick={handleRunForexForecaster}
                  disabled={isForecasting}
                  className="px-4 py-2 bg-gradient-to-tr from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-[10.5px] font-bold rounded-lg font-mono border border-cyan-400/20 text-white transition flex items-center gap-1.5 shadow"
                >
                  {isForecasting ? '⚡ Simulated Matrix Computing...' : '🧮 Compute 100K Forecast Bands'}
                </button>
              </div>

              {forecastResult && !isForecasting && (
                <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg flex items-center justify-between font-mono text-[9px] animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-slate-500">PROJECTED VALUE CHANNELS FOR {convertFrom} (30D):</span>
                    <p className="text-slate-300 flex gap-2">
                      <span>Lower Bound: <strong className="text-rose-400">${forecastResult.lower[29].toFixed(4)}</strong></span>
                      <span>Mid Projection: <strong className="text-cyan-400">${forecastResult.path[29].toFixed(4)}</strong></span>
                      <span>Upper Target: <strong className="text-emerald-400">${forecastResult.upper[29].toFixed(4)}</strong></span>
                    </p>
                  </div>
                  <span className="text-slate-600 uppercase border border-slate-900 bg-slate-900 px-1 py-0.5 rounded">
                    Confidence: 95%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: LIVE FOREX BROKER */}
        {subTab === 'exchange' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left swapping Panel */}
            <div className="md:col-span-5 bg-slate-950/70 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <span className="text-lg">💱</span>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-100 uppercase leading-none">Instant Slip Sovereign Swapper</h4>
                  <span className="text-[9px] text-slate-500 font-mono">Manual market transactions matching custom exchange venues</span>
                </div>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[10px]">SELL ASSET RESERVES:</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={swapAmount}
                      onChange={(e) => setSwapAmount(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 text-sm p-2 rounded-lg font-bold text-slate-100 outline-none"
                    />
                    <select
                      value={swapFrom}
                      onChange={(e) => setSwapFrom(e.target.value)}
                      className="bg-slate-900 border border-slate-800 p-2 rounded-lg font-bold font-mono text-slate-250 w-28"
                    >
                      {currencies.map(c => <option key={`swap-from-${c.code}`} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>
                  <span className="text-[8.5px] text-slate-500 block">
                    Your balance: {swapFrom === 'USD' ? `$${cheatBalance.toLocaleString()}` : `${Number(wallet[swapFrom] || 0).toLocaleString()} ${swapFrom}`}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block text-[10px]">RECEIVE VALUE TARGET:</label>
                  <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                    <span className="font-bold text-emerald-400 text-sm">
                      {(() => {
                        const amt = parseFloat(swapAmount);
                        const fromC = currencies.find(c => c.code === swapFrom);
                        const toC = currencies.find(c => c.code === swapTo);
                        if (!fromC || !toC || isNaN(amt) || amt <= 0) return '0.00';
                        return ((amt * fromC.currentPriceUsd) / toC.currentPriceUsd).toLocaleString(undefined, { maximumFractionDigits: 4 });
                      })()}
                    </span>
                    <select
                      value={swapTo}
                      onChange={(e) => setSwapTo(e.target.value)}
                      className="bg-slate-950 border border-slate-850 p-1.5 rounded font-bold font-mono"
                    >
                      {currencies.map(c => <option key={`swap-to-${c.code}`} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>
                </div>

                {/* Venue selection routing */}
                <div className="space-y-1.5">
                  <label className="text-slate-400 block text-[10px]">EXECUTION EXCHANGE ROUTER:</label>
                  <select
                    value={chosenExchange}
                    onChange={(e) => setChosenExchange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg font-bold"
                  >
                    {exchangesList.map(e => (
                      <option key={`venue-${e.name}`} value={e.name}>
                        {e.name} (Spread: {(e.spread * 100).toFixed(2)}% | Fee: ${e.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleExecuteSwap}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-slate-950 font-black tracking-tight transition shadow"
                >
                  EXECUTE SECURE CURRENCY SWAP
                </button>
              </div>
            </div>

            {/* Right scanner panel */}
            <div className="md:col-span-7 bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">🤖 Triangular Arbitrage Finder Scanner</span>
                <p className="text-[10px] text-slate-400">Monitoring real-time rate imbalances for triangular micro-profits</p>
              </div>

              {/* Arb finder displays */}
              <div className="space-y-3 font-mono text-xs">
                {triangularArbitrageOps.map((op, idx) => {
                  const hasImbalance = op.yieldPct > 0.05;
                  return (
                    <div
                      key={`arb-${idx}`}
                      className={`bg-slate-950/90 border p-3 rounded-xl flex items-center justify-between ${hasImbalance ? 'border-amber-500/50 shadow' : 'border-slate-900'}`}
                    >
                      <div className="space-y-1">
                        <p className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-205">{op.path.join(' → ')}</span>
                          <span className={`px-1 py-0.5 rounded text-[8.5px] font-bold ${hasImbalance ? 'bg-amber-950 text-amber-300' : 'bg-slate-900 text-slate-500'}`}>
                            {hasImbalance ? 'MICRO RATE IMBLANCE' : 'PEGGED'}
                          </span>
                        </p>
                        <p className="text-[10px] text-slate-500">Capital gains potential through triangular routing sweeps.</p>
                      </div>

                      <div className="text-right space-y-2">
                        <span className={`text-xs font-bold block ${hasImbalance ? 'text-amber-400' : 'text-slate-500'}`}>
                          {op.yieldPct >= 0 ? '+' : ''}{op.yieldPct.toFixed(3)}% Est.
                        </span>
                        {hasImbalance && (
                          <button
                            onClick={() => handleExecuteArbitrage(op)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-1 rounded"
                          >
                            Auto Trade
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Best exchange scanner rates finder table */}
              <div className="border-t border-slate-900 pt-3 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 block font-bold">BANK VENUES COMPARE MATRIX</span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[10px] table-collapse text-slate-400">
                    <thead>
                      <tr className="border-b border-slate-800 text-[9px] text-slate-500">
                        <th className="pb-1">Broker Name</th>
                        <th className="pb-1 text-center">Base Spread</th>
                        <th className="pb-1 text-right">Ticket Fee</th>
                        <th className="pb-1 text-right">Daily Limit</th>
                        <th className="pb-1 text-right">KYC Compliance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {exchangesList.map(e => (
                        <tr key={`matrix-${e.name}`} className="hover:bg-slate-900/30">
                          <td className="py-1.5 font-bold text-slate-300">{e.name}</td>
                          <td className="py-1.5 text-center font-bold text-cyan-400">{(e.spread * 100).toFixed(3)}%</td>
                          <td className="py-1.5 text-right text-red-400">${e.fee}</td>
                          <td className="py-1.5 text-right font-bold">${e.limit.toLocaleString()}</td>
                          <td className="py-1.5 text-right">
                            <span className={`px-1 py-0.5 rounded text-[8px] font-bold ${e.kycRequired ? 'bg-red-950/40 text-red-400' : 'bg-emerald-950/40 text-emerald-400'}`}>
                              {e.kycRequired ? 'REQUIRED' : 'NONE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 4: MULTI-ASSET PORTFOLIO */}
        {subTab === 'portfolio' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Pie chart and asset list left */}
            <div className="xl:col-span-4 bg-slate-950/70 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">💼 Asset Weights & Volatility Profiles</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Asset allocation breakdown of sovereign treasuries</p>
              </div>

              {/* Pure SVG Custom Pie Chart */}
              <div className="my-6 flex justify-center items-center relative h-36">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
                  {/* USD Sector (e.g. 50%) */}
                  <circle cx="16" cy="16" r="14" fill="transparent" stroke="#22c55e" strokeWidth="4" strokeDasharray="50 100" />
                  {/* BTC Sector (e.g. 30%) */}
                  <circle cx="16" cy="16" r="14" fill="transparent" stroke="#06b6d4" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-50" />
                  {/* Gold Sector (e.g. 20%) */}
                  <circle cx="16" cy="16" r="14" fill="transparent" stroke="#eab308" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-80" />
                </svg>

                {/* center cut */}
                <div className="absolute w-20 h-20 rounded-full bg-slate-950 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-mono text-slate-500">USD WORTH</span>
                  <span className="font-mono text-xs font-black text-slate-205">${totalNetWorthUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              {/* Pie Legende colors */}
              <div className="font-mono text-[9px] grid grid-cols-3 gap-1 pt-3 border-t border-slate-900 text-center">
                <span className="text-emerald-400 font-bold flex items-center gap-1 justify-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> USD Cash</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1 justify-center"><span className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></span> Crypto</span>
                <span className="text-yellow-400 font-bold flex items-center gap-1 justify-center"><span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span> Gold Bulk</span>
              </div>
            </div>

            {/* Portfolio listing right */}
            <div className="xl:col-span-8 bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Sovereign Multi-Wallet Holdings Ledger</span>
                {/* Diversify shortcut block */}
                <span className="text-[9.5px] font-mono text-slate-450 uppercase font-black tracking-widest bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">
                  Autonomous Auto-Rebalancing Active
                </span>
              </div>

              {/* Automatic diversify buttons list */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80 flex flex-wrap gap-2.5 items-center justify-between font-mono text-[11px]">
                <span className="text-slate-400 font-bold uppercase text-[9.5px]">⚖️ AUTO-DIVERSIFY RESERVE HOLDINGS:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAutoDiversify('balanced')}
                    className="px-2.5 py-1 bg-cyan-900/40 hover:bg-cyan-900 border border-cyan-800 rounded font-bold"
                  >
                    Balanced Spread
                  </button>
                  <button
                    onClick={() => handleAutoDiversify('crypto_maxi')}
                    className="px-2.5 py-1 bg-fuchsia-950/40 hover:bg-fuchsia-950 border border-fuchsia-900 rounded font-bold text-fuchsia-300"
                  >
                    Crypto Degen High Alt
                  </button>
                  <button
                    onClick={() => handleAutoDiversify('safety')}
                    className="px-2.5 py-1 bg-amber-950/35 hover:bg-amber-950 border border-amber-900 rounded font-bold text-amber-300"
                  >
                    Safe Haven Switzerland
                  </button>
                </div>
              </div>

              {/* Wallet balances detailed table with portfolio weight percentage math */}
              <div className="overflow-y-auto max-h-[180px] custom-scrollbar">
                <table className="w-full text-left font-mono text-[11px] text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-900 text-[9px] text-slate-500 uppercase tracking-wide">
                      <th className="pb-1 font-bold">Currency Asset</th>
                      <th className="pb-1 text-right">Spot Price USD</th>
                      <th className="pb-1 text-right font-bold">Unites Holds</th>
                      <th className="pb-1 text-right font-bold">Consolidated Values</th>
                      <th className="pb-1 text-right">Rel Weight %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-2.5 font-bold text-slate-200">USD - Core Liquidity Cash</td>
                      <td className="py-2.5 text-right text-slate-350">$1.00</td>
                      <td className="py-2.5 text-right font-bold text-slate-105">${cheatBalance.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-emerald-400 font-bold">${cheatBalance.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-slate-450">{Number((cheatBalance / Math.max(totalNetWorthUsd, 1)) * 100).toFixed(1)}%</td>
                    </tr>
                    {currencies.filter(c => c.code !== 'USD' && (wallet[c.code] || 0) > 0).map(c => {
                      const qty = wallet[c.code] || 0;
                      const valueUsd = qty * c.currentPriceUsd;
                      const weightPct = (valueUsd / Math.max(totalNetWorthUsd, 1)) * 100;

                      return (
                        <tr key={`sub-holds-${c.code}`} className="hover:bg-slate-900/40">
                          <td className="py-2.5 font-bold text-slate-200">{c.code} - {c.name}</td>
                          <td className="py-2.5 text-right text-slate-400">${c.currentPriceUsd >= 1 ? c.currentPriceUsd.toLocaleString() : c.currentPriceUsd.toFixed(5)}</td>
                          <td className="py-2.5 text-right font-bold text-slate-300">{qty.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                          <td className="py-2.5 text-right text-emerald-400 font-bold">${valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td className="py-2.5 text-right text-slate-450">{weightPct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 5: CENTRAL BANK DIRECTIVES */}
        {subTab === 'centralbank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sovereign currency injection printing panel */}
            <div className="bg-slate-950/70 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <span className="text-lg">💵</span>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-100 uppercase leading-none">Uncapped Currency Printer Bureau</h4>
                  <span className="text-[9px] text-slate-500 font-mono">Inject legal tender out of thin air to project central bank liquidity</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-slate-400 block text-[10.5px]">SELECT PRINT DENOMINATION TARGET:</label>
                  <select
                    value={printCurrency}
                    onChange={(e) => setPrintCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-2.5 rounded-lg font-bold font-mono text-slate-100"
                  >
                    {currencies.map(c => <option key={`print-den-${c.code}`} value={c.code}>{c.code} - {c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block text-[10.5px]">AMOUNT OF LEGAL TENDER TO PRINT:</label>
                  <input
                    type="number"
                    value={printAmount}
                    onChange={(e) => setPrintAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-sm p-2.5 rounded-lg font-mono font-bold text-slate-100 outline-none"
                  />
                  <div className="flex gap-2 pt-1 font-mono text-[9px] text-slate-500">
                    <button onClick={() => setPrintAmount('1000000')} className="bg-slate-900 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800">1 Million</button>
                    <button onClick={() => setPrintAmount('100000000')} className="bg-slate-900 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800">100 Million</button>
                    <button onClick={() => setPrintAmount('1000000000')} className="bg-slate-900 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800">1 Billion !!!</button>
                  </div>
                </div>

                <button
                  onClick={handlePrintMoney}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black tracking-tight transition rounded-lg shadow"
                >
                  ⚡ PRINT SPECIFIED LIQUIDITY RESERVES
                </button>
              </div>
            </div>

            {/* State directives & peg setup rates */}
            <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <span className="text-lg">🏛️</span>
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-100 uppercase leading-none">Price Pegs Council Cabinet</h4>
                  <span className="text-[9px] text-slate-500 font-mono">Unilaterally dictate interbank exchange peg configurations</span>
                </div>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[10px]">PEG ASSIGNEE:</label>
                    <select
                      value={pegCurrency}
                      onChange={(e) => setPegCurrency(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg font-bold font-mono text-slate-100 text-xs"
                    >
                      {currencies.filter(c => c.code !== 'USD').map(c => <option key={`peg-tar-${c.code}`} value={c.code}>{c.code}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 block text-[10px]">FIXED PEG VALUE (USD):</label>
                    <input
                      type="number"
                      value={pegPriceUsd}
                      onChange={(e) => setPegPriceUsd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg font-bold font-mono text-slate-100 text-xs outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleApplyPegRate}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-205 border border-slate-700 font-bold rounded-lg transition"
                >
                  APPLY FIXED PRICE PEG RULING
                </button>

                {/* Macro Economic Event Injectors */}
                <div className="border-t border-slate-900 pt-3 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">💥 GLOBAL ECONOMIC SHOCK INJECTORS</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button
                      onClick={() => injectEconomicEvent('HYPERINFLATION_EUR')}
                      className="py-1.5 px-2 bg-red-950/40 hover:bg-red-950 text-red-300 border border-red-900/60 rounded"
                    >
                      🔥 Inflate European EUR
                    </button>
                    <button
                      onClick={() => injectEconomicEvent('CRASH_KPW')}
                      className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-900/50 rounded"
                    >
                      📉 Hyper-Crash North Won
                    </button>
                    <button
                      onClick={() => injectEconomicEvent('GOLD_RUSH')}
                      className="py-1.5 px-2 bg-amber-950/30 hover:bg-amber-900 text-amber-250 border border-amber-900/40 rounded"
                    >
                      🌟 Golden Rush Sovereign Boom
                    </button>
                    <button
                      onClick={() => injectEconomicEvent('CRYPTO_MOON')}
                      className="py-1.5 px-2 bg-cyan-950/40 hover:bg-cyan-900 text-cyan-300 border border-cyan-900/50 rounded"
                    >
                      🌕 Moons Degen Lottoken
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 6: AUTOMATIONS & BOTS */}
        {subTab === 'automation' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Automatic Trade Limit Order input forms */}
            <div className="xl:col-span-5 bg-slate-950/70 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">📝 Setup Limit Order Automations</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Automated buy/sell orders executing on live rate ticks</p>
              </div>

              {/* Limit forms fields */}
              <div className="space-y-4 font-mono text-xs text-slate-350">
                <div className="grid grid-cols-2 gap-3 select-none">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">DIRECTION:</label>
                    <div className="flex rounded-lg overflow-hidden border border-slate-800 bg-slate-900 font-bold">
                      <button className="flex-1 py-1.5 text-center text-emerald-400 hover:bg-slate-850 bg-slate-950">BUY</button>
                      <button className="flex-1 py-1.5 text-center text-slate-505 hover:bg-slate-850">SELL</button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">ORDER TYPE:</label>
                    <select className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded-lg font-bold text-xs">
                      <option>LIMIT</option>
                      <option>STOP-LOSS</option>
                      <option>TAKE-PROFIT</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">TARGET VALUE (USD):</label>
                    <input type="number" defaultValue="65000" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg font-mono font-bold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">TOKENS COIN QUANTITY:</label>
                    <input type="number" defaultValue="0.25" className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg font-mono font-bold outline-none" />
                  </div>
                </div>

                <button
                  onClick={() => {
                    playTickSound(soundEnabled);
                    const newLo: LimitOrder = {
                      id: 'lo-' + Math.random().toString(36).substring(2, 9),
                      pair: 'USD/BTC',
                      direction: 'BUY',
                      type: 'LIMIT',
                      targetPrice: 65000,
                      amount: 0.1,
                      status: 'PENDING',
                      timestamp: new Date().toLocaleTimeString()
                    };
                    setLimitOrders(prev => [newLo, ...prev]);
                    addTxLog('Created new automatic limit instruction trigger', 0, 'N/A', 0, 'N/A', 'LIMIT_FILL', 0);
                  }}
                  className="w-full py-2 bg-cyan-900 hover:bg-cyan-800 text-cyan-205 rounded-lg font-bold border border-cyan-800 text-xs"
                >
                  DEPLOY ACTIVE AUTOMATION TARGET
                </button>
              </div>

              {/* Active limit list */}
              <div className="border-t border-slate-900 pt-3 space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">PENDING ALGORITHMIC LAUNCHERS</span>
                <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                  {limitOrders.map(lo => (
                    <div key={lo.id} className="bg-slate-900 border border-slate-850 p-2.5 rounded font-mono text-[9.5px] flex justify-between items-center">
                      <div>
                        <p className="flex items-center gap-1">
                          <span className={lo.direction === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{lo.direction}</span>
                          <span className="text-slate-205 font-bold">{lo.pair}</span>
                          <span className="text-slate-500 uppercase">({lo.type})</span>
                        </p>
                        <p className="text-slate-500 mt-0.5">Price target: ${lo.targetPrice.toLocaleString()} | Size: {lo.amount}</p>
                      </div>

                      <div className="text-right">
                        <span className={`px-1 rounded text-[8px] font-bold ${lo.status === 'PENDING' ? 'bg-amber-950/40 text-amber-300' : 'bg-emerald-950 text-emerald-300'}`}>
                          {lo.status}
                        </span>
                        {lo.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              playTickSound(soundEnabled);
                              setLimitOrders(prev => prev.map(o => o.id === lo.id ? { ...o, status: 'CANCELLED' as const } : o));
                            }}
                            className="text-red-400 underline scroll-ml-1 text-[8.5px] block mt-1 hover:text-red-300"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trading Bots center panels */}
            <div className="xl:col-span-7 bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">🤖 central banking hedge trading bots</span>
                <p className="text-[10px] text-slate-400">Deploy quantitative hedge fund models to execute automated sweeps on ticks</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {tradingBots.map(bot => (
                  <div key={bot.id} className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-mono text-indigo-400 uppercase font-black tracking-widest bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-900/30">
                          {bot.strategy}
                        </span>
                        
                        {/* Power toggles keys */}
                        <label className="relative inline-flex items-center cursor-pointer scale-90">
                          <input
                            type="checkbox"
                            checked={bot.enabled}
                            onChange={(e) => {
                              playTickSound(soundEnabled);
                              setTradingBots(prev => prev.map(nb => nb.id === bot.id ? { ...nb, enabled: e.target.checked } : nb));
                              addTxLog(`Algorithmic trader bot [${bot.name}] toggled to ${e.target.checked ? 'ACTIVE' : 'STANDBY'}`, 0, 'N/A', 0, 'N/A', 'BOT_TRADE', 0);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                        </label>
                      </div>

                      <h4 className="font-bold text-slate-205 text-xs truncate leading-snug mt-2">{bot.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">Log: <span className="text-slate-400 italic">{bot.status}</span></p>
                    </div>

                    <div className="mt-4 border-t border-slate-900 pt-2 flex items-center justify-between font-mono text-[10.5px]">
                      <span className="text-slate-500">ACCUM PROFITS:</span>
                      <span className={`font-black ${bot.totalProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {bot.totalProfitUSD >= 0 ? '+' : ''}${bot.totalProfitUSD.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 7: DARK BLACK-MARKETS DEALS */}
        {subTab === 'darkmarket' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Laundering simulator and Swiss deposits drawer */}
            <div className="xl:col-span-5 bg-slate-950/70 border border-red-500/10 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-950 pb-2">
                <span className="text-lg">🏴‍☠️</span>
                <div>
                  <h4 className="text-xs font-mono font-bold text-red-400 uppercase leading-none">Offshore Laundromat Reactor</h4>
                  <span className="text-[9px] text-slate-500 font-mono">Convert physical cash lottery bills to anonymous Swiss Francs (CHF)</span>
                </div>
              </div>

              {/* Laundry controls */}
              <div className="space-y-4 text-xs font-mono">
                <p className="text-[10.5px] leading-relaxed text-slate-400">
                  Standard lotteries trigger automatic reports to government tax offices. Clean up to <span className="text-red-400 font-bold">$250,000 USD</span> in cash per sweep cycle directly into highly-secure Swiss banks:
                </p>

                {/* Slider showing laundry yield factor */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 flex justify-between">
                    <span>Laundered recovery index:</span>
                    <span className="text-cyan-400 font-bold">{(laundressingFactor * 100).toFixed(0)}% yield</span>
                  </label>
                  <input
                    type="range"
                    min="0.4"
                    max="0.95"
                    step="0.05"
                    value={laundressingFactor}
                    onChange={(e) => setLaundressingFactor(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded accent-cyan-500"
                  />
                  <span className="text-[9px] text-slate-500 leading-none">High index requires heavier bribes to regional AML authorities.</span>
                </div>

                <div className="bg-slate-900 border border-rose-950/40 p-3 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-bold uppercase">Tax audit Seizure chance:</span>
                  <span className="text-red-400 font-extrabold text-sm select-none">
                    {Number((1 - laundressingFactor) * 45).toFixed(1)}% RISK CHANCE
                  </span>
                </div>

                <button
                  onClick={handleLaunderLotteryWinnings}
                  className="w-full py-2.5 bg-red-950/50 hover:bg-neutral-900 text-red-200 border border-red-900/40 font-black tracking-tight transition rounded-lg"
                >
                  ⚡ LAUNDER PRIMARY CASHOUT RESERVES
                </button>
              </div>
            </div>

            {/* Alternative Luxury bearer store vaults */}
            <div className="xl:col-span-7 bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest block font-bold">💎 Bearer Asset Vault & Alternative Wealth Stores</span>
                <p className="text-[10px] text-slate-405 mt-0.5">Store currency inside bearer physical items carrying zero tax audits trail indexes</p>
              </div>

              {/* Asset list columns */}
              <div className="space-y-3">
                {bearerAssets.map(asset => (
                  <div key={asset.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs leading-relaxed font-mono">
                    <div className="space-y-1 max-w-sm">
                      <h4 className="font-bold text-slate-201 flex gap-1.5 items-center">
                        🎒 {asset.name}
                        {asset.qty > 0 && (
                          <span className="bg-yellow-500/10 text-yellow-500 text-[9px] font-black px-1.5 py-0.5 rounded border border-yellow-500/30">
                            OWNED: {asset.qty}x
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-slate-505 leading-relaxed">{asset.description}</p>
                    </div>

                    <div className="text-right shrink-0 select-none space-y-1.5">
                      <p className="text-sm font-bold text-yellow-405 font-mono">${asset.costUsd.toLocaleString()}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleBuyBearerAsset(asset)}
                          className="bg-slate-905 hover:bg-slate-800 border border-slate-800 text-slate-202 text-[9px] px-2 py-1 rounded font-bold"
                        >
                          Acquire
                        </button>
                        {asset.qty > 0 && (
                          <button
                            onClick={() => handleLiquidateBearerAsset(asset)}
                            className="bg-yellow-501 hover:bg-yellow-402 text-slate-952 text-[9px] px-2 py-1 rounded font-bold bg-yellow-520 text-slate-950"
                          >
                            Liquidate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 8: DETAILED ANALYTICS LEDGER */}
        {subTab === 'analytics' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* Correlation Heatgrid inside visual cards */}
            <div className="xl:col-span-5 bg-slate-950/70 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block font-bold">📋 Currency Correlation Matrix</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Pearson indices showing matching ticker directionality traits</p>
              </div>

              {/* Heatgrid table */}
              <div className="overflow-x-auto pt-2 select-none">
                <table className="w-full text-center font-mono text-[10px] border-collapse">
                  <thead>
                    <tr className="text-[9.5px] text-indigo-400 font-bold border-b border-slate-900">
                      <th className="pb-1 text-left">Asset Code</th>
                      <th>USD</th>
                      <th>EUR</th>
                      <th>BTC</th>
                      <th>XAU</th>
                      <th>JACK</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {['USD', 'EUR', 'BTC', 'XAU', 'JACKPOT'].map(s1 => (
                      <tr key={`matrix-row-${s1}`} className="hover:bg-slate-900/20">
                        <td className="py-2 text-left font-bold text-slate-350">{s1 === 'JACKPOT' ? 'JACK' : s1}</td>
                        {['USD', 'EUR', 'BTC', 'XAU', 'JACKPOT'].map(s2 => {
                          const val = correlationMatrix[s1][s2];
                          let color = 'text-slate-400';
                          let bg = 'inherit';
                          if (val > 0.70) { color = 'text-emerald-400 font-bold'; bg = 'rgba(16,185,129,0.06)'; }
                          else if (val < -0.60) { color = 'text-rose-400 font-bold'; bg = 'rgba(239,68,68,0.06)'; }
                          
                          return (
                            <td key={`cell-${s1}-${s2}`} className="py-2 text-center" style={{ backgroundColor: bg }}>
                              <span className={color}>{val.toFixed(2)}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* History ledger details with scroll list */}
            <div className="xl:col-span-7 bg-slate-950/40 border border-slate-850 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Sovereign Transactions ledger</span>
                <button
                  onClick={handleExportCSVLedger}
                  className="text-[9px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 hover:text-cyan-300"
                >
                  Export CSV Ledger
                </button>
              </div>

              {/* List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {txHistory.map(tx => (
                  <div key={tx.id} className="bg-slate-950 border border-slate-900 p-2.5 rounded font-mono text-[10px] leading-relaxed relative hover:border-slate-800 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-205">{tx.description}</p>
                        {tx.currencyFrom !== 'N/A' && (
                          <p className="text-slate-500 text-[9.5px] mt-0.5 select-all">
                            Inwards: {tx.amountFrom.toLocaleString()} {tx.currencyFrom} → Outwards: {tx.amountTo.toLocaleString()} {tx.currencyTo}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 block text-[8px]">{tx.timestamp}</span>
                        {tx.feePaidUSD > 0 && <span className="text-red-400 block text-[9px] font-mono mt-0.5">Fee: ${tx.feePaidUSD.toFixed(2)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
