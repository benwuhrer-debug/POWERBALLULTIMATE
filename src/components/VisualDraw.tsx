/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface VisualDrawProps {
  winningWhite: number[];
  winningPowerball: number;
  playerWhite: number[];
  playerPowerball: number;
  isDrawing: boolean;
  clairvoyanceIndex: number;
  riggedMode: string;
}

export const VisualDraw: React.FC<VisualDrawProps> = ({
  winningWhite,
  winningPowerball,
  playerWhite,
  playerPowerball,
  isDrawing,
  clairvoyanceIndex,
  riggedMode,
}) => {
  // Check matching subsets for visual highlighter highlights
  const matchesSet = useMemo(() => {
    return playerWhite.filter(num => winningWhite.includes(num));
  }, [playerWhite, winningWhite]);

  const matchesPowerball = playerPowerball === winningPowerball && winningPowerball > 0;

  // Generate 12 decorative bouncing micro-balls inside the cage
  const lotteryCageBalls = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => {
      const angle = (i * 2 * Math.PI) / 15;
      const radius = 35 + Math.random() * 15;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      const isRed = i % 5 === 0;
      
      return {
        x: `${x}%`,
        y: `${y}%`,
        color: isRed ? 'bg-red-500 shadow-red-500/50' : 'bg-slate-300 shadow-slate-300/30',
        delay: `${(i * 0.1).toFixed(1)}s`,
        speed: `${(1.2 + Math.random() * 0.8).toFixed(1)}s`
      };
    });
  }, []);

  return (
    <div id="lottery_cage_wrapper" className="bg-slate-900 border border-slate-700/60 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-6 relative overflow-hidden">
      {/* Background Neon Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>

      {/* The Physical Lottery Tumbler / Glass Cage */}
      <div className="relative w-48 h-48 rounded-full border-4 border-slate-700 bg-slate-950/70 shadow-[inset_0_0_20px_rgba(0,0,0,0.8),0_0_15px_rgba(51,65,85,0.3)] flex items-center justify-center overflow-hidden">
        {/* Machine Glass Reflections */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-2 left-6 w-12 h-3 rounded-full bg-white/20 blur-[1px] transform -rotate-12 pointer-events-none z-10"></div>

        {/* Bouncing Machine Balls inside Tumbler Bubble */}
        <div className={`absolute inset-4 rounded-full transition-transform ${isDrawing ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
          {lotteryCageBalls.map((ball, idx) => (
            <div
              key={`cage-ball-${idx}`}
              className={`absolute w-3.5 h-3.5 rounded-full ${ball.color} shadow-md transition-all duration-300`}
              style={{
                left: ball.x,
                top: ball.y,
                animation: isDrawing 
                  ? `bounce ${ball.speed} infinite alternate ease-in-out` 
                  : `none`,
                animationDelay: ball.delay,
                transform: isDrawing ? 'scale(1.2)' : 'scale(1)'
              }}
            />
          ))}
        </div>

        {/* Center Spinner Ring */}
        <div className="w-20 h-20 rounded-full border border-slate-700/60 bg-slate-900/40 z-20 flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center ${isDrawing ? 'animate-[spin_3s_linear_infinite]' : ''}`}>
            <span className="text-xs font-mono text-cyan-400 font-bold">LOTO</span>
          </div>
        </div>

        {/* Machine Base Stand */}
        <div className="absolute bottom-0 w-24 h-4 bg-slate-800 rounded-t-lg border-t border-slate-600 z-10"></div>
      </div>

      {/* WINNING NUMBERS ROW */}
      <div className="w-full flex flex-col items-center gap-2 z-10">
        <span className="text-[11px] font-mono tracking-widest text-slate-400 font-medium">LATEST WINNING DRAW</span>
        
        <div className="flex gap-2.5 sm:gap-4 justify-center items-center">
          {winningWhite.map((num, idx) => (
            <div
              key={`win-white-${idx}-${num}`}
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-800 text-slate-100 font-mono text-base sm:text-lg font-bold flex items-center justify-center border-2 border-slate-600 shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
                isDrawing ? 'animate-bounce' : 'transition-all duration-300 scale-102 hover:border-cyan-400'
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {num > 0 ? num : '?'}
            </div>
          ))}

          {/* Winning Powerball - Red Ball */}
          <div
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-radial from-red-500 to-red-700 text-white font-mono text-base sm:text-lg font-extrabold flex items-center justify-center border-2 border-red-400 shadow-[0_4px_15px_rgba(239,68,68,0.4)] ${
              isDrawing ? 'animate-bounce' : 'transition-all duration-300 scale-102 hover:border-amber-400'
            }`}
            style={{ animationDelay: '0.25s' }}
          >
            {winningPowerball > 0 ? winningPowerball : '?'}
          </div>
        </div>
      </div>

      {/* PLAYER TICKET COMPLIANCY ROW */}
      <div className="w-full bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col items-center gap-2 sm:gap-3 z-10">
        <span className="text-[10px] font-mono tracking-widest text-slate-500 font-semibold uppercase">YOUR PLAYED TICKET NUMBERS</span>
        
        <div className="flex gap-2.5 sm:gap-4 justify-center items-center">
          {playerWhite.map((num, idx) => {
            const isMatched = winningWhite.includes(num) && num > 0;
            return (
              <div
                key={`player-white-${idx}-${num}`}
                className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-full font-mono text-sm sm:text-base font-bold flex items-center justify-center border transition-all duration-300 ${
                  isMatched
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-105'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                {num > 0 ? num : '-'}
                {isMatched && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                )}
              </div>
            );
          })}

          {/* Player Powerball - Red Ball outline */}
          <div
            className={`relative w-9 h-9 sm:w-11 sm:h-11 rounded-full font-mono text-sm sm:text-base font-extrabold flex items-center justify-center border transition-all duration-300 ${
              matchesPowerball
                ? 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] scale-105'
                : 'bg-slate-900 border-red-900/60 text-red-400'
            }`}
          >
            {playerPowerball > 0 ? playerPowerball : '-'}
            {matchesPowerball && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </div>
        </div>

        {/* Display feedback status */}
        <div className="flex gap-2 items-center flex-wrap mt-1 justify-center">
          {clairvoyanceIndex > 0 && (
            <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800 font-mono flex items-center gap-1">
              🔮 Clairvoyance {(clairvoyanceIndex * 100).toFixed(0)}% Active
            </span>
          )}
          {riggedMode === 'guaranteeJackpot' && (
            <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full border border-amber-800 font-mono flex items-center gap-1">
              👑 Rigged: Guaranteed Jackpot
            </span>
          )}
          {riggedMode === 'cursed' && (
            <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full border border-purple-800 font-mono flex items-center gap-1">
              💀 Rigged: Cursed Mode Active
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
