/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface NewsTickerProps {
  totalSpent: number;
  totalWon: number;
  netGainLoss: number;
  ticketsBought: number;
  drawsCount: number;
  darkHumor: boolean;
}

export const NewsTicker: React.FC<NewsTickerProps> = ({
  totalSpent,
  totalWon,
  netGainLoss,
  ticketsBought,
  drawsCount,
  darkHumor,
}) => {
  // scrolling headlines
  const headlines = useMemo(() => {
    return [
      "📈 LOCAL NEWS: MAN SELLS FAMILY CAR TO BUY 25,000 POWERBALL TICKETS, RECLAIMS $28 IN COMBINED WINNINGS.",
      "💰 WALL STREET: LOTTERY COMMISSIONS EXPAND QUARTERS PREDICTING MASS SOCIAL EXHAUST RECORD EARNINGS.",
      "🚨 STUDY SHOWS: VORTEX OF STATISTICAL ILLITERACY DRIVES 98% OF CASUAL RAFFLE POOL DEPOSITS.",
      "👑 BREAKING: BILLIONAIRE WHO COMPLETED 1M SIMULATIONS SAYS 'HE FEELS A BIG WIN COMING FOR SURE'.",
      "☕ SCIENTISTS PROVE: SAVING YOUR COFFEE MONEY ADDS EXTRA MINUTE TO YOUR RETIREMENT TIMELINE DAILY.",
      "🎰 ANTHROPOLOGY NEWS: POWERBALL PARTICIPANTS CALLED 'THE ULTIMATE FAITH OPTIMISERS' BY GIANTS OF SOCIO-DYNAMICS."
    ];
  }, []);

  // roasts and commentary depending on loss threshold
  const roastComment = useMemo(() => {
    if (ticketsBought === 0) {
      return "Welcome, future statistic! Ready to donate your hypothetical life savings to support the school systems?";
    }

    const netLoss = Math.abs(netGainLoss);
    const roi = totalSpent > 0 ? (totalWon / totalSpent) * 100 : 0;

    if (darkHumor) {
      if (ticketsBought < 50) {
        return "Ah, standard denial. 'Just $100, checking the waters.' That's how we start before transferring the deed to your house.";
      }
      if (ticketsBought < 500) {
        return `You've thrown $${totalSpent} into the physical glass cage. The slot machine of standard probability has eaten ${(100 - roi).toFixed(1)}% of your cash. Please seek immediate financial therapy.`;
      }
      if (ticketsBought < 5000) {
        return `Congratulations! You have simulated over ${drawsCount} draws. If those were physical sheets, you would have created enough paper waste to cover your local garbage dump. ROI is a flat ${roi.toFixed(1)}%. Incredible.`;
      }
      return `Generational madness! You've lost $${netLoss.toLocaleString()}! Under standard tax brackets, you could have retired easily. Instead, you're looking at bouncing virtual white balls inside an iframe. Beautiful life choices.`;
    }

    // Normal lighthearted hints
    if (ticketsBought < 100) {
      return "Lotteries are a tax on people who don't understand math. Start small and watch your return rates carefully.";
    }
    if (ticketsBought < 1000) {
      return "At this velocity, you're basically burning single dollar bills at a cozy bonfire. At least keep the chimes on to make it sound fun!";
    }
    return `Statistically, if you kept that cash in high-yield certificates on Wall Street, you'd be sitting on a real profit. Instead, the simulator's house mode is laughing. Try tweaking Overlord settings!`;

  }, [ticketsBought, totalSpent, totalWon, netGainLoss, drawsCount, darkHumor]);

  return (
    <div className="bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl font-sans text-xs">
      {/* 1. SCROLLING MARQUEE */}
      <div className="bg-slate-950 border-b border-slate-800 py-2.5 px-4 flex items-center gap-3 overflow-hidden select-none relative">
        <span className="bg-rose-600 text-slate-50 font-black px-2 py-0.5 rounded text-[8px] animate-pulse whitespace-nowrap z-10 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
          FAKE NEWS TICKER
        </span>
        <div className="flex-1 overflow-hidden relative w-full">
          <div className="animate-marquee whitespace-nowrap flex gap-12 text-[10.5px] font-mono text-slate-300">
            {headlines.map((text, i) => (
              <span key={`headline-${i}`} className="hover:text-cyan-400 cursor-default transition">
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. AI ROASTER DISPLAY */}
      <div className="p-4 flex gap-4 items-start bg-slate-900/65 relative">
        <div id="ai_roaster_avatar" className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-2xl shadow-lg border border-cyan-300/40 shrink-0 select-none">
          🤖
        </div>
        <div>
          <span className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">
            AI FINANCE COMMENTATOR ({darkHumor ? "EXTRA SAVAGE SAVAGE" : "RATIONAL ECONOMIST"})
          </span>
          <p className="text-slate-200 mt-1.5 leading-relaxed italic text-sm font-sans font-medium text-slate-205">
            "{roastComment}"
          </p>
        </div>
      </div>
    </div>
  );
};
