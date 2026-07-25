/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { DebugConsoleMsg } from '../types';

interface ConsoleTerminalProps {
  logs: DebugConsoleMsg[];
  onClear: () => void;
  onInjectError: (errorName: string) => void;
  onChaosClick: (chaosType: string) => void;
}

export const ConsoleTerminal: React.FC<ConsoleTerminalProps> = ({
  logs,
  onClear,
  onInjectError,
  onChaosClick,
}) => {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-4 font-mono text-xs flex flex-col h-[400px] shadow-2xl relative">
      <div className="absolute inset-0 bg-[radial-gradient(#15803d_0.8px,transparent_0.8px)] [background-size:16px_16px] opacity-5 pointer-events-none"></div>
      
      {/* Top Controls Header */}
      <div className="flex justify-between items-center bg-slate-900 px-3.5 py-1.5 rounded-lg border border-slate-850 mb-3 text-[10px] text-slate-400 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          <span className="font-bold text-slate-300 ml-1">SYSTEM_DEBUGGER://LIVE_CALCS_DUMP</span>
        </div>
        <button
          onClick={onClear}
          className="hover:text-red-400 font-mono transition text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded"
        >
          CLEAR LOGS
        </button>
      </div>

      {/* Terminal Line Window */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar text-[11px] leading-relaxed">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic text-center pt-24 text-[10px]">
            Ready for calculations... Start drawing tickets to begin streaming live matrix calculations.
          </div>
        ) : (
          logs.map((log) => {
            let colorCls = 'text-slate-305';
            if (log.type === 'success') colorCls = 'text-emerald-400';
            if (log.type === 'warn') colorCls = 'text-amber-400 font-bold';
            if (log.type === 'error') colorCls = 'text-red-400 font-extrabold animate-pulse';
            if (log.type === 'dev') colorCls = 'text-purple-400';
            if (log.type === 'chaotic') colorCls = 'text-pink-500 font-mono tracking-wide line-through italic';

            return (
              <div key={log.id} className="flex gap-2 hover:bg-slate-905/40 p-0.5 rounded transition">
                <span className="text-slate-600 font-mono text-[9px] select-none">[{log.timestamp}]</span>
                <span className={colorCls}>{log.text}</span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Error Injectors panel */}
      <div className="mt-4 border-t border-slate-900 pt-3 flex flex-wrap gap-2">
        <span className="w-full text-[10px] text-slate-400 font-bold font-mono tracking-widest uppercase">⚠️ HARDWARE EXCEPTION INJECTORS:</span>
        <button
          onClick={() => onInjectError('RNG_ENTROPY_FAULT')}
          className="px-2 py-1 bg-red-950/40 hover:bg-red-950 text-red-200 border border-red-900/60 transition rounded-[4px] text-[10px]"
        >
          🌀 Inject RNG Entropy Fault
        </button>
        <button
          onClick={() => onInjectError('MEMORY_BURN_OVERFLOW')}
          className="px-2 py-1 bg-amber-950/40 hover:bg-amber-950 text-amber-200 border border-amber-900/60 transition rounded-[4px] text-[10px]"
        >
          🔥 Trigger Memory Spike
        </button>
        <button
          onClick={() => onInjectError('DATABASE_DRIFT_ERR')}
          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition rounded-[4px] text-[10px]"
        >
          📂 Mock Database Drift
        </button>
        
        <span className="w-full text-[10px] text-pink-400 font-bold font-mono tracking-widest uppercase mt-1">💥 CHAOTIC ACTION RIGGERS:</span>
        <button
          onClick={() => onChaosClick('matrix_flicker')}
          className="px-2 py-1 bg-pink-950/40 hover:bg-pink-950 text-pink-200 border border-pink-900/60 transition rounded-[4px] text-[10px]"
        >
          💻 Glitch Core Matrix
        </button>
        <button
          onClick={() => onChaosClick('payout_surge')}
          className="px-2 py-1 bg-purple-950/40 hover:bg-purple-950 text-purple-200 border border-purple-900/60 transition rounded-[4px] text-[10px]"
        >
          🎢 Chaotic Payout Surge
        </button>
        <button
          onClick={() => onChaosClick('nan_break')}
          className="px-2 py-1 bg-rose-950/50 hover:bg-rose-950 text-rose-200 border border-rose-900/40 transition rounded-[4px] text-[10px]"
        >
          💀 Break Numbers (NaN)
        </button>
      </div>
    </div>
  );
};
