/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export const ExpectedValueDocs: React.FC = () => {
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  return (
    <div className="bg-slate-900 border border-slate-700/60 p-5 rounded-2xl shadow-xl space-y-4 font-sans text-xs">
      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
          📐 PROBABILITY THEORY & EXPECTED VALUE (EV) WORKBENCH
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          Math Sandbox
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Math explanation with LaTeX approximation */}
        <div className="bg-slate-950/85 p-4 rounded-xl border border-slate-850 space-y-3">
          <span className="text-[10.5px] font-mono text-cyan-400 font-bold block">
            THE ECONOMIC EQUATION OF EXPECTATION
          </span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            In probability theory, the <strong>Expected Value (EV)</strong> acts as the long-term mathematical average of a random occurrence. It represents what your returned net cash payout would be per ticket over infinite trials.
          </p>

          {/* Styled LaTeX equation widget */}
          <div className="my-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-center relative group">
            <span className="text-slate-500 text-[9px] block absolute top-1 left-2 font-mono">MATH PROFILE (EV):</span>
            <div className="font-mono text-slate-2 font-bold select-all tracking-wider text-sm text-cyan-300 py-1">
              EV = ∑ ( Payoutᵢ × Probabilityᵢ ) - Cost
            </div>
            
            <button
              onMouseEnter={() => setShowFormulaTooltip(true)}
              onMouseLeave={() => setShowFormulaTooltip(false)}
              onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
              className="text-[9.5px] text-slate-400 underline decoration-dotted cursor-help block mt-1 hover:text-slate-200"
            >
              Hover to decode terms
            </button>

            {showFormulaTooltip && (
              <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 bg-slate-950 border border-slate-705 p-3 rounded-xl shadow-2xl text-left w-64 text-[10.5px] leading-relaxed text-slate-300 animate-fadeIn">
                <p className="font-bold text-cyan-400 mb-1">Equation Breakdown:</p>
                <p>• <strong>∑ (Sigma)</strong>: Sum over all 9 distinct prize matching groups.</p>
                <p>• <strong>Payoutᵢ</strong>: Cash reward allocated for match configuration <code className="text-pink-400 font-mono">i</code>.</p>
                <p>• <strong>Probabilityᵢ</strong>: The exact odds fraction of achieving match configuration <code className="text-pink-400 font-mono">i</code>.</p>
                <p>• <strong>Cost</strong>: Entry fee of the ticket ($2.00 base standard).</p>
              </div>
            )}
          </div>

          <div className="text-[10.5px] text-slate-500 leading-relaxed italic border-t border-slate-900 pt-2.5">
            If EV is absolutely <strong>negative</strong>, you will lose capital over time. For standard Powerball drawing games, the theoretical baseline EV sits around <span className="text-red-400">-$1.24 per ticket</span>. Only when the jackpot rises past $1.2 Billion does the gross EV mathematically become positive!
          </div>
        </div>

        {/* Real Math tables and Tax simulations */}
        <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850">
          <span className="text-[10.5px] font-mono text-amber-400 font-bold block">
            THE TAXATION BLACK HOLE IN THE LAWS OF CHANCE
          </span>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Even in rare circumstances where the grand jackpot grows large enough to push theoretical gross EV into positive territory, the government imposes immediate cash option cuts and multi-tier tax brackets.
          </p>

          <ol className="space-y-1.5 text-[11px] list-decimal pl-4 text-slate-450 font-mono">
            <li>
              <strong className="text-slate-300">Lump Sum Reducer:</strong> Taking instantaneous cash payouts instead of a 30-year annuity consumes about <span className="text-red-400">38% to 45%</span> of your jackpot on day one.
            </li>
            <li>
              <strong className="text-slate-300">IRS Federal Cut:</strong> Big cash payouts fall instantly into the highest withholding tier, shaving <span className="text-red-400 font-bold">24% to 37%</span> off your cash balance.
            </li>
            <li>
              <strong className="text-slate-300">State Slices:</strong> Depending on where your ticket was scanned, states claim up to <span className="text-red-400">13%</span> on top of federal cuts.
            </li>
          </ol>

          <div className="bg-amber-950/20 text-amber-300 p-2.5 rounded border border-amber-900/40 leading-relaxed text-[10.5px]">
            <strong>Math Theorem:</strong> Tax adjustments almost ALWAYS prevent real world net EV from rising above your purchase entry cost, making lotteries a static long-term loss under every standard legal scenario.
          </div>
        </div>
      </div>
    </div>
  );
};
