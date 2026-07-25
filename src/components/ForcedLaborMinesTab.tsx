import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playJackpotSound, playCoinSound, playTickSound } from '../utils/audio';

export interface LaborSector {
  id: string;
  name: string;
  icon: string;
  level: number;
  assignedWorkers: number;
  baseRatePerSec: number; // in $
  multiplier: number;
  status: 'active' | 'overdrive' | 'exhausted';
  upgradeCost: number;
}

export interface LaborLog {
  id: string;
  time: string;
  text: string;
  type: 'production' | 'whip' | 'quota' | 'upgrade' | 'system';
}

interface ForcedLaborMinesTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

const DEFAULT_SECTORS: LaborSector[] = [
  { id: 'sec-1', name: '⛏️ Quantum Cash Quarry', icon: '⛏️', level: 1, assignedWorkers: 15, baseRatePerSec: 10000000, multiplier: 1, status: 'active', upgradeCost: 50000000 },
  { id: 'sec-2', name: '🖨️ Sovereign $1B Money Press', icon: '🖨️', level: 1, assignedWorkers: 25, baseRatePerSec: 50000000, multiplier: 1, status: 'active', upgradeCost: 250000000 },
  { id: 'sec-3', name: '💎 Deep Diamond Mining Shaft', icon: '💎', level: 1, assignedWorkers: 10, baseRatePerSec: 120000000, multiplier: 1, status: 'active', upgradeCost: 1000000000 },
  { id: 'sec-4', name: '🚀 Orbital Asteroid Gold Hauler', icon: '🚀', level: 1, assignedWorkers: 35, baseRatePerSec: 500000000, multiplier: 1, status: 'active', upgradeCost: 5000000000 },
  { id: 'sec-5', name: '⚛️ Antimatter Cash Synthesizer', icon: '⚛️', level: 1, assignedWorkers: 50, baseRatePerSec: 2500000000, multiplier: 1, status: 'active', upgradeCost: 25000000000 },
  { id: 'sec-6', name: '🧱 Brick & Concrete Assembly Plant', icon: '🧱', level: 1, assignedWorkers: 20, baseRatePerSec: 250000000, multiplier: 1, status: 'active', upgradeCost: 2000000000 },
];

export const ForcedLaborMinesTab: React.FC<ForcedLaborMinesTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
}) => {
  const [sectors, setSectors] = useState<LaborSector[]>(() => {
    try {
      const saved = localStorage.getItem('powerball_forced_labor_sectors');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_SECTORS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('powerball_forced_labor_sectors', JSON.stringify(sectors));
    } catch (e) {}
  }, [sectors]);

  const [totalLaborers, setTotalLaborers] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('powerball_forced_labor_worker_count');
      if (saved) return Number(saved);
    } catch (e) {}
    return 150;
  });

  const [whipMultiplier, setWhipMultiplier] = useState<number>(1);
  const [whipActiveTimer, setWhipActiveTimer] = useState<number>(0);
  const [quotaProgress, setQuotaProgress] = useState<number>(0);
  const [quotaTarget, setQuotaTarget] = useState<number>(100000000000); // $100 Billion
  const [quotaRewardGranted, setQuotaRewardGranted] = useState<boolean>(false);

  // Total earnings generated
  const [totalGeneratedSession, setTotalGeneratedSession] = useState<number>(0);

  // Logs
  const [logs, setLogs] = useState<LaborLog[]>([
    { id: '1', time: new Date().toLocaleTimeString(), text: '🏭 FORCED LABOR PRODUCTION MINES INITIALIZED: 150 workers on 24/7 Overlord Shift.', type: 'system' },
    { id: '2', time: new Date().toLocaleTimeString(), text: '⚡ OVERLORD WHIP & MEGAPHONIC BOOSTERS: Ready to overclock production speeds up to 100,000x!', type: 'system' }
  ]);

  const addLog = useCallback((text: string, type: LaborLog['type'] = 'system') => {
    const time = new Date().toLocaleTimeString();
    const id = Math.random().toString();
    setLogs(prev => [{ id, time, text, type }, ...prev].slice(0, 100));
  }, []);

  // Compute Total Cash Rate per Second
  const calculateTotalRatePerSec = useCallback(() => {
    return sectors.reduce((acc, sec) => {
      return acc + (sec.baseRatePerSec * sec.level * sec.multiplier * (sec.assignedWorkers / 10));
    }, 0) * whipMultiplier;
  }, [sectors, whipMultiplier]);

  const totalRate = calculateTotalRatePerSec();

  // Passive Production Loop (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const generated = calculateTotalRatePerSec();
      if (generated > 0) {
        onUpdateBalance(prev => (typeof prev === 'number' ? prev + generated : generated));
        setTotalGeneratedSession(prev => prev + generated);

        setQuotaProgress(prev => {
          const next = prev + generated;
          if (next >= quotaTarget && !quotaRewardGranted) {
            setQuotaRewardGranted(true);
            addLog(`🎯 DAILY FORCED LABOR QUOTA MET! +$500 Billion Overlord Bonus granted!`, 'quota');
            onUpdateBalance(prev => (typeof prev === 'number' ? prev + 500000000000 : 500000000000));
            if (soundEnabled) playJackpotSound(soundEnabled);
          }
          return next;
        });
      }

      // Whip timer countdown
      setWhipActiveTimer(prev => {
        if (prev > 1) return prev - 1;
        if (prev === 1) {
          setWhipMultiplier(1);
          addLog('⚡ Overlord Whip effect wore off. Production back to standard forced speed.', 'system');
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTotalRatePerSec, quotaTarget, quotaRewardGranted, onUpdateBalance, soundEnabled, addLog]);

  // Crack the Overlord Electric Whip (100x speed for 15s)
  const handleCrackWhip = () => {
    setWhipMultiplier(100);
    setWhipActiveTimer(15);
    addLog(`⚡ OVERLORD ELECTRIC WHIP CRACKED! Production overclocked 100x for 15 seconds!`, 'whip');
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // ONE BUTTON MAX OVERDRIVE: 1,000,000x Speed for 60s & +$10 Trillion cash grant
  const handleOneButtonMaxOverdrive = () => {
    setWhipMultiplier(1000000);
    setWhipActiveTimer(60);
    const bonus = 10000000000000; // $10 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + bonus : bonus));
    addLog(`👑 ONE BUTTON FORCED LABOR MAX OVERDRIVE ACTIVATED! 1,000,000x Speed & +$10 Trillion Cash credited!`, 'whip');
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // Upgrade Sector
  const handleUpgradeSector = (id: string) => {
    const sec = sectors.find(s => s.id === id);
    if (!sec) return;

    if (currentBalance < sec.upgradeCost) {
      addLog(`⚠️ Insufficient funds to upgrade ${sec.name}! Needs $${sec.upgradeCost.toLocaleString()}`, 'system');
      return;
    }

    onUpdateBalance(prev => (typeof prev === 'number' ? prev - sec.upgradeCost : 0));
    setSectors(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          level: s.level + 1,
          multiplier: s.multiplier * 2,
          upgradeCost: Math.floor(s.upgradeCost * 2.5),
        };
      }
      return s;
    }));

    addLog(`⬆️ UPGRADED ${sec.name} to Level ${sec.level + 1}! Production multiplied 2x!`, 'upgrade');
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // Reassign Laborers (+5 workers)
  const handleAddWorkers = (id: string) => {
    setSectors(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, assignedWorkers: s.assignedWorkers + 5 };
      }
      return s;
    }));
    setTotalLaborers(prev => prev + 5);
    addLog(`👷 Drafted +5 new forced laborers to Sector ${id}.`, 'system');
    if (soundEnabled) playTickSound(soundEnabled);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-3xl shadow-2xl border-2 border-yellow-200 animate-pulse">
              🏭
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-wider uppercase">
                  FORCED LABOR PRODUCTION MINES & FACTORY CAMPS
                </h2>
                <span className="bg-amber-600 text-white text-[10px] px-3 py-0.5 rounded-full font-black uppercase ring-2 ring-amber-300">
                  24/7 OVERLORD SHIFT
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium pt-1 max-w-xl">
                Force workers into 24/7 mining shafts, money presses, and quantum factories! Enforce strict production quotas and crack the Overlord Whip to multiply cash output!
              </p>
            </div>
          </div>

          {/* METRICS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/90 border border-amber-500/50 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Labor Force</p>
              <p className="font-mono text-2xl font-black text-amber-400">{totalLaborers} Workers 👷</p>
            </div>
            <div className="bg-slate-950/90 border border-yellow-400/60 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Passive Cash/Sec</p>
              <p className="font-mono text-2xl font-black text-yellow-300">${(totalRate / 1e6).toFixed(1)}M/s ⚡</p>
            </div>
            <div className="bg-slate-950/90 border border-emerald-500/60 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Session Cash Produced</p>
              <p className="font-mono text-xl font-black text-emerald-400">${(totalGeneratedSession / 1e9).toFixed(2)}B</p>
            </div>
          </div>
        </div>

        {/* OVERLORD ACTION CONTROLS */}
        <div className="pt-4 border-t border-amber-800/50 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOneButtonMaxOverdrive}
              className="bg-gradient-to-r from-yellow-400 via-amber-500 to-red-600 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border-2 border-amber-200 cursor-pointer"
            >
              <span className="text-xl">👑</span>
              <span>ONE BUTTON FORCED LABOR MAX OVERDRIVE! (1,000,000x SPEED + $10T)</span>
            </button>

            <button
              onClick={handleCrackWhip}
              disabled={whipActiveTimer > 0}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl border border-red-400 shadow cursor-pointer transition disabled:opacity-50"
            >
              ⚡ Crack Overlord Whip (100x Speed {whipActiveTimer > 0 ? `[${whipActiveTimer}s]` : ''})
            </button>
          </div>

          {/* QUOTA PROGRESS */}
          <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2 rounded-xl border border-amber-500/40">
            <div className="text-right">
              <span className="text-[10px] uppercase font-extrabold text-amber-300 block">Quota: $100B Target</span>
              <span className="font-mono text-xs text-white font-bold">${(quotaProgress / 1e9).toFixed(1)}B / $100B</span>
            </div>
            <div className="w-24 h-3 bg-slate-900 rounded-full border border-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                style={{ width: `${Math.min(100, (quotaProgress / quotaTarget) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTORS GRID */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-base text-white uppercase tracking-wider flex items-center space-x-2">
            <span>🏭 FORCED LABOR PRODUCTION SECTORS ({sectors.length})</span>
          </h3>
          <span className="text-xs font-mono text-amber-400">Current Overlord Speed Boost: <strong>{whipMultiplier.toLocaleString()}x</strong></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectors.map(sec => {
            const secRate = sec.baseRatePerSec * sec.level * sec.multiplier * (sec.assignedWorkers / 10) * whipMultiplier;
            const canAfford = currentBalance >= sec.upgradeCost;

            return (
              <div key={sec.id} className="bg-slate-950 border-2 border-amber-500/50 rounded-2xl p-5 space-y-4 hover:border-amber-400 transition shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl bg-slate-900 p-2 rounded-xl border border-amber-500/30">{sec.icon}</span>
                    <div>
                      <h4 className="font-black text-sm text-white">{sec.name}</h4>
                      <p className="text-[11px] text-amber-400 font-mono font-bold">Level {sec.level} Sector</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-950 text-amber-300 font-mono font-extrabold px-2.5 py-1 rounded border border-amber-500/40">
                    {sec.assignedWorkers} Workers
                  </span>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Output:</span>
                    <span className="text-amber-300 font-bold">${(sec.baseRatePerSec / 1e6).toFixed(1)}M/s</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Effective Rate:</span>
                    <span className="text-emerald-400 font-black">${(secRate / 1e6).toFixed(1)}M/s</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleAddWorkers(sec.id)}
                    className="py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-[11px] rounded-lg border border-amber-500/30 transition cursor-pointer"
                  >
                    👷 Draft +5 Workers
                  </button>

                  <button
                    onClick={() => handleUpgradeSector(sec.id)}
                    disabled={!canAfford}
                    className={`py-2 text-[11px] font-black rounded-lg transition shadow cursor-pointer ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    ⬆️ Upgrade (${(sec.upgradeCost / 1e6).toFixed(0)}M)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE LOGS */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="font-extrabold text-xs text-amber-400 uppercase tracking-wider">
            📜 LIVE FORCED LABOR TELEMETRY & QUOTA LOG
          </span>
          <button onClick={() => setLogs([])} className="text-[10px] text-slate-500 hover:text-white underline cursor-pointer">Clear</button>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {logs.map(log => {
            let color = 'text-slate-300 bg-slate-950 border-slate-800';
            if (log.type === 'whip') color = 'text-amber-300 bg-amber-950/50 border-amber-700 font-bold';
            if (log.type === 'quota') color = 'text-emerald-300 bg-emerald-950/50 border-emerald-600 font-black';
            if (log.type === 'upgrade') color = 'text-cyan-300 bg-cyan-950/50 border-cyan-700';

            return (
              <div key={log.id} className={`text-[11px] px-2.5 py-1 rounded border ${color}`}>
                <span className="opacity-50 text-[10px] mr-2">[{log.time}]</span>
                <span>{log.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
