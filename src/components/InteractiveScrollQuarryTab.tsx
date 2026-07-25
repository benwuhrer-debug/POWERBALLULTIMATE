/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

export interface InteractiveScrollQuarryProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
  stickmanDensityMultiplier?: number;
}

export interface Block {
  id: string;
  row: number;
  col: number;
  type: 'soil' | 'rock' | 'blank' | 'iron' | 'gold' | 'emerald' | 'diamond' | 'antimatter' | 'relic' | 'air';
  hp: number;
  maxHp: number;
  value: number;
  xrayGlow: string;
  name: string;
  icon: string;
}

interface Stickman {
  id: string;
  name: string;
  depthRow: number;
  xPercent: number; // 0 to 100% across platform
  direction: 1 | -1;
  speech: string;
  chiselAction: boolean;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface ChiselTool {
  id: string;
  name: string;
  power: number;
  cost: number;
  speedMs: number;
  is3x3?: boolean;
  isInfinite?: boolean;
}

const CHISELS: ChiselTool[] = [
  { id: 'iron', name: '⛏️ Rust Iron Chisel', power: 10, cost: 0, speedMs: 500 },
  { id: 'titanium', name: '🔨 Titanium Hammer Chisel', power: 50, cost: 5000000, speedMs: 350 },
  { id: 'diamond', name: '💎 Diamond Tip Drill Chisel', power: 250, cost: 250000000, speedMs: 200 },
  { id: 'laser', name: '⚡ Quantum Laser Chisel', power: 1500, cost: 10000000000, speedMs: 100 },
  { id: 'antimatter', name: '👑 Overlord Antimatter Disintegrator', power: 10000, cost: 500000000000, speedMs: 50 },
  { id: 'god_3x3', name: '💥 GOD 3x3 Infinite Obliterator', power: 999999999, cost: 0, speedMs: 10, is3x3: true, isInfinite: true },
];

const SPEECH_MESSAGES = [
  'Chiseling hard for the Overlord!',
  'Found a gold vein!',
  'Heavy rock face!',
  'X-Ray scanner is glowing!',
  'My arms are iron!',
  'Mining for cash!',
  'Overlord Whip keeps us fast!',
  'More diamonds deeper down!',
  'Watch out for falling debris!',
  'Keep digging down infinitely!',
  'Spreading out across the shaft!',
];

const COLS = 12;

// Helper to generate blocks for a range of rows
const generateRowBlocks = (startRow: number, count: number): Block[] => {
  const grid: Block[] = [];
  for (let r = startRow; r < startRow + count; r++) {
    for (let c = 0; c < COLS; c++) {
      // Entrance air shaft at top
      if (r < 2 && c >= 4 && c <= 7) {
        grid.push({
          id: `block-${r}-${c}`,
          row: r,
          col: c,
          type: 'air',
          hp: 0,
          maxHp: 0,
          value: 0,
          xrayGlow: 'none',
          name: 'Air Shaft',
          icon: '',
        });
        continue;
      }

      const depthFactor = Math.min(1, r / 100);
      const roll = Math.random();

      let type: Block['type'] = 'rock';
      let hp = 50;
      let value = 100000;
      let xrayGlow = '#64748b';
      let name = 'Solid Granite Rock';
      let icon = '🪨';

      if (r < 4) {
        type = 'soil';
        hp = 20;
        value = 50000;
        xrayGlow = '#78350f';
        name = 'Surface Soil';
        icon = '🟫';
      } else if (roll < 0.20) {
        // Blank rock with 0 value
        type = 'blank';
        hp = 30;
        value = 0;
        xrayGlow = '#475569';
        name = 'Barren Blank Stone';
        icon = '🗿';
      } else if (roll < 0.23 + depthFactor * 0.05) {
        type = 'relic';
        hp = 5000;
        value = 50000000000; // $50B
        xrayGlow = '#f59e0b';
        name = 'Ancient Overlord Relic';
        icon = '👑';
      } else if (roll < 0.32 + depthFactor * 0.05) {
        type = 'antimatter';
        hp = 2000;
        value = 10000000000; // $10B
        xrayGlow = '#ec4899';
        name = 'Antimatter Crystal';
        icon = '⚛️';
      } else if (roll < 0.45 + depthFactor * 0.05) {
        type = 'diamond';
        hp = 800;
        value = 1000000000; // $1B
        xrayGlow = '#38bdf8';
        name = 'Diamond Ore';
        icon = '💎';
      } else if (roll < 0.60) {
        type = 'emerald';
        hp = 400;
        value = 250000000; // $250M
        xrayGlow = '#10b981';
        name = 'Emerald Deposit';
        icon = '❇️';
      } else if (roll < 0.75) {
        type = 'gold';
        hp = 200;
        value = 50000000; // $50M
        xrayGlow = '#eab308';
        name = 'Gold Ore Vein';
        icon = '🪙';
      } else if (roll < 0.88) {
        type = 'iron';
        hp = 100;
        value = 10000000; // $10M
        xrayGlow = '#94a3b8';
        name = 'Iron Deposit';
        icon = '⚙️';
      }

      grid.push({
        id: `block-${r}-${c}`,
        row: r,
        col: c,
        type,
        hp,
        maxHp: hp,
        value,
        xrayGlow,
        name,
        icon,
      });
    }
  }
  return grid;
};

// Helper to create spaced stickmen across depth rows to avoid crowding
const createSpacedStickmen = (count: number, maxRows: number): Stickman[] => {
  const list: Stickman[] = [];
  const X_SLOTS = [8, 22, 36, 50, 64, 78];

  for (let i = 0; i < count; i++) {
    const targetRow = Math.max(1, Math.floor((i / count) * (maxRows - 2))) + 1;
    const xSlot = X_SLOTS[i % X_SLOTS.length] + ((i * 7) % 10) - 5;

    list.push({
      id: `worker-${i}-${Date.now()}`,
      name: `Stickman #${i + 1}`,
      depthRow: targetRow,
      xPercent: Math.min(88, Math.max(5, xSlot)),
      direction: i % 2 === 0 ? 1 : -1,
      speech: SPEECH_MESSAGES[i % SPEECH_MESSAGES.length],
      chiselAction: false,
    });
  }
  return list;
};

export const InteractiveScrollQuarryTab: React.FC<InteractiveScrollQuarryProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
  stickmanDensityMultiplier = 1.0,
}) => {
  // Effective max visual stickmen cap calculated from global density multiplier
  const maxStickmenCap = Math.max(5, Math.round(50 * stickmanDensityMultiplier));

  // State
  const [maxRows, setMaxRows] = useState<number>(35);
  const [xrayActive, setXrayActive] = useState<boolean>(true);
  const [activeChiselIdx, setActiveChiselIdx] = useState<number>(5); // Default to GOD 3x3 Infinite Obliterator
  const [purchasedChisels, setPurchasedChisels] = useState<string[]>([
    'iron',
    'titanium',
    'diamond',
    'laser',
    'antimatter',
    'god_3x3',
  ]);
  const [totalStickmenForce, setTotalStickmenForce] = useState<number>(20);
  const [infiniteAutoSpawner, setInfiniteAutoSpawner] = useState<boolean>(true);
  const [autoChiselActive, setAutoChiselActive] = useState<boolean>(true);
  const [totalChiseled, setTotalChiseled] = useState<number>(0);
  const [totalExtractedCash, setTotalExtractedCash] = useState<number>(0);
  const [particles, setParticles] = useState<Particle[]>([]);

  const activeChisel = CHISELS[activeChiselIdx] || CHISELS[0];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initial Blocks Grid
  const [blocks, setBlocks] = useState<Block[]>(() => generateRowBlocks(0, 35));

  // Initialize Stickmen Workers with even spatial distribution
  const [stickmen, setStickmen] = useState<Stickman[]>(() => createSpacedStickmen(Math.min(20, maxStickmenCap), 35));

  // Dynamically restrict stickmen count whenever global density cap decreases
  useEffect(() => {
    setStickmen((prev) => {
      if (prev.length > maxStickmenCap) {
        return prev.slice(0, maxStickmenCap);
      }
      return prev;
    });
  }, [maxStickmenCap]);

  // Infinite Auto Spawner loop
  useEffect(() => {
    if (!infiniteAutoSpawner) return;
    const timer = setInterval(() => {
      setTotalStickmenForce((prev) => prev + 10);
      setStickmen((prev) => {
        if (prev.length >= maxStickmenCap) return prev; // Enforce density multiplier cap
        const newWorker: Stickman = {
          id: `worker-auto-${Date.now()}-${Math.random()}`,
          name: `Auto Stickman #${prev.length + 1}`,
          depthRow: Math.floor(Math.random() * (maxRows - 4)) + 2,
          xPercent: (prev.length * 15 + Math.random() * 10) % 85 + 5,
          direction: Math.random() > 0.5 ? 1 : -1,
          speech: 'Infinite worker deployed!',
          chiselAction: false,
        };
        return [...prev, newWorker];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, [infiniteAutoSpawner, maxRows, maxStickmenCap]);

  // INFINITE GENERATION: Append more rows when scrolling near bottom
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef.current;

    // When within 250px of the bottom, generate 15 more rows infinitely!
    if (scrollTop + clientHeight >= scrollHeight - 250) {
      setMaxRows((prevMax) => {
        const nextMax = prevMax + 15;
        const newBlocks = generateRowBlocks(prevMax, 15);
        setBlocks((prev) => [...prev, ...newBlocks]);

        // Spawn extra stickman evenly in the new deep layer
        setStickmen((prev) => {
          if (prev.length >= maxStickmenCap) return prev; // Enforce density multiplier cap
          return [
            ...prev,
            {
              id: `worker-${Date.now()}-${Math.random()}`,
              name: `Deep Stickman #${prev.length + 1}`,
              depthRow: prevMax + Math.floor(Math.random() * 10),
              xPercent: Math.random() * 80 + 10,
              direction: Math.random() > 0.5 ? 1 : -1,
              speech: 'Found a deeper layer!',
              chiselAction: true,
            },
          ];
        });

        return nextMax;
      });
    }
  }, [maxStickmenCap]);

  // Stickmen Movement & Auto-Chiseling loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Move stickmen & pick speech
      setStickmen((prev) =>
        prev.map((s) => {
          let newX = s.xPercent + s.direction * (1.2 + Math.random() * 1.5);
          let newDir = s.direction;
          if (newX > 88) {
            newX = 88;
            newDir = -1;
          } else if (newX < 5) {
            newX = 5;
            newDir = 1;
          }

          const isTalking = Math.random() < 0.12;
          const speech = isTalking
            ? SPEECH_MESSAGES[Math.floor(Math.random() * SPEECH_MESSAGES.length)]
            : s.speech;

          return {
            ...s,
            xPercent: newX,
            direction: newDir,
            speech,
            chiselAction: Math.random() < 0.4,
          };
        })
      );

      // Auto chiseling logic (scaled by totalStickmenForce)
      if (autoChiselActive || totalStickmenForce > 0) {
        setBlocks((prevBlocks) => {
          const nonAirBlocks = prevBlocks.filter((b) => b.type !== 'air');
          if (nonAirBlocks.length === 0) return prevBlocks;

          // Pick 1 to 3 random blocks based on force size
          const hitsCount = Math.min(5, Math.ceil(totalStickmenForce / 20));
          let updated = [...prevBlocks];
          let gainedCash = 0;
          let brokenCount = 0;

          for (let h = 0; h < hitsCount; h++) {
            const currentNonAir = updated.filter((b) => b.type !== 'air');
            if (currentNonAir.length === 0) break;
            const target = currentNonAir[Math.floor(Math.random() * currentNonAir.length)];

            const chiselPower = activeChisel.isInfinite
              ? target.hp
              : activeChisel.power * Math.max(1, Math.floor(totalStickmenForce / 10));

            const newHp = Math.max(0, target.hp - chiselPower);

            if (newHp === 0) {
              if (target.value > 0) gainedCash += target.value;
              brokenCount++;
              updated = updated.map((b) =>
                b.id === target.id ? { ...b, type: 'air', hp: 0, maxHp: 0, value: 0 } : b
              );
            } else {
              updated = updated.map((b) => (b.id === target.id ? { ...b, hp: newHp } : b));
            }
          }

          if (brokenCount > 0) {
            if (gainedCash > 0) {
              onUpdateBalance((prev) => (typeof prev === 'number' ? prev + gainedCash : gainedCash));
              setTotalExtractedCash((prev) => prev + gainedCash);
            }
            setTotalChiseled((prev) => prev + brokenCount);
          }

          return updated;
        });
      }
    }, 350);

    return () => clearInterval(interval);
  }, [autoChiselActive, totalStickmenForce, activeChisel, onUpdateBalance]);

  // Click handler to manually chisel a block (Supports 3x3 Mining & Infinite Damage!)
  const handleChiselBlock = (clickedBlock: Block, event: React.MouseEvent) => {
    if (clickedBlock.type === 'air') return;

    if (soundEnabled) playTickSound(soundEnabled);

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const pX = event.clientX - rect.left;
    const pY = event.clientY - rect.top;

    // Determine target blocks (1 block OR 3x3 grid)
    let targetRowStart = clickedBlock.row;
    let targetRowEnd = clickedBlock.row;
    let targetColStart = clickedBlock.col;
    let targetColEnd = clickedBlock.col;

    if (activeChisel.is3x3) {
      targetRowStart = Math.max(0, clickedBlock.row - 1);
      targetRowEnd = clickedBlock.row + 1;
      targetColStart = Math.max(0, clickedBlock.col - 1);
      targetColEnd = Math.min(COLS - 1, clickedBlock.col + 1);
    }

    let totalGainedCash = 0;
    let destroyedCount = 0;

    setBlocks((prevBlocks) => {
      const updated = prevBlocks.map((b) => {
        if (
          b.row >= targetRowStart &&
          b.row <= targetRowEnd &&
          b.col >= targetColStart &&
          b.col <= targetColEnd &&
          b.type !== 'air'
        ) {
          const hitDamage = activeChisel.isInfinite ? b.hp : activeChisel.power;
          const newHp = Math.max(0, b.hp - hitDamage);

          if (newHp === 0) {
            destroyedCount++;
            totalGainedCash += b.value;
            return { ...b, type: 'air' as const, hp: 0, maxHp: 0, value: 0 };
          } else {
            return { ...b, hp: newHp };
          }
        }
        return b;
      });

      if (destroyedCount > 0) {
        if (soundEnabled) playJackpotSound(soundEnabled);
        if (totalGainedCash > 0) {
          onUpdateBalance((prev) => (typeof prev === 'number' ? prev + totalGainedCash : totalGainedCash));
          setTotalExtractedCash((prev) => prev + totalGainedCash);
        }
        setTotalChiseled((prev) => prev + destroyedCount);

        const particleId = Math.random().toString();
        const displayLabel = activeChisel.is3x3
          ? `💥 3x3 OBLITERATE! +$${(totalGainedCash / 1e6).toFixed(1)}M`
          : totalGainedCash > 0
          ? `+$${(totalGainedCash / 1e6).toFixed(1)}M!`
          : '🗿 BLANK BROKEN!';

        setParticles((prev) => [
          ...prev.slice(-15),
          {
            id: particleId,
            x: pX,
            y: pY,
            text: displayLabel,
            color: totalGainedCash > 0 ? '#34d399' : '#94a3b8',
          },
        ]);

        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== particleId));
        }, 900);
      }

      return updated;
    });
  };

  // Buy upgrade chisel
  const handleBuyChisel = (chiselIdx: number) => {
    const target = CHISELS[chiselIdx];
    if (currentBalance >= target.cost) {
      if (target.cost > 0) {
        onUpdateBalance((prev) => (typeof prev === 'number' ? prev - target.cost : 0));
      }
      setPurchasedChisels((prev) => [...prev, target.id]);
      setActiveChiselIdx(chiselIdx);
      if (soundEnabled) playJackpotSound(soundEnabled);
    }
  };

  // Hire stickman worker (FREE & INFINITE!)
  const handleHireStickmen = (addCount: number) => {
    setTotalStickmenForce((prev) => prev + addCount);

    // Add visual stickmen without overcrowding
    setStickmen((prev) => {
      const remainingVisualCapacity = maxStickmenCap - prev.length;
      if (remainingVisualCapacity <= 0) return prev;

      const toAdd = Math.min(addCount, remainingVisualCapacity);
      const newVisuals: Stickman[] = [];

      for (let i = 0; i < toAdd; i++) {
        newVisuals.push({
          id: `worker-manual-${Date.now()}-${i}`,
          name: `Stickman #${prev.length + i + 1}`,
          depthRow: Math.floor(Math.random() * (maxRows - 4)) + 2,
          xPercent: (prev.length * 12 + i * 18) % 85 + 5,
          direction: i % 2 === 0 ? 1 : -1,
          speech: 'Spreading out to chisel!',
          chiselAction: false,
        });
      }

      return [...prev, ...newVisuals];
    });

    if (soundEnabled) playCoinSound(soundEnabled);
  };

  return (
    <div className="space-y-6 font-sans select-none pb-12">
      {/* HEADER SECTION & HERO CONTROL BAR */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-yellow-950 border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-4xl shadow-2xl border border-amber-300">
              ⛏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white uppercase tracking-wider">
                  INFINITE SCROLL QUARRY & STICKMEN ARMY
                </h1>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  INFINITE WORKERS & SPATIALLY BALANCED
                </span>
              </div>
              <p className="text-xs text-amber-200/90 pt-0.5">
                Infinite depth scroll-down shaft! Stickmen workers automatically spread out across all depth layers to prevent crowding.
              </p>
            </div>
          </div>

          {/* MAIN STATS METRICS */}
          <div className="flex flex-wrap gap-3 font-mono text-center">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/40 shadow">
              <p className="text-[10px] text-slate-400 uppercase">Chiseled Blocks</p>
              <p className="text-xl font-black text-amber-300">{totalChiseled.toLocaleString()}</p>
            </div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-emerald-500/40 shadow">
              <p className="text-[10px] text-slate-400 uppercase">Extracted Wealth</p>
              <p className="text-xl font-black text-emerald-400">
                ${(totalExtractedCash / 1e6).toFixed(1)}M
              </p>
            </div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-cyan-500/40 shadow">
              <p className="text-[10px] text-slate-400 uppercase">Stickman Force</p>
              <p className="text-xl font-black text-cyan-300">{totalStickmenForce.toLocaleString()} Workers</p>
            </div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-indigo-500/40 shadow">
              <p className="text-[10px] text-slate-400 uppercase">Density Cap</p>
              <p className="text-xl font-black text-indigo-300">{maxStickmenCap} Max ({((stickmanDensityMultiplier ?? 1.0) * 100).toFixed(0)}%)</p>
            </div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-yellow-500/40 shadow">
              <p className="text-[10px] text-slate-400 uppercase">Shaft Depth</p>
              <p className="text-xl font-black text-yellow-300">{(maxRows * 100).toLocaleString()} FT</p>
            </div>
          </div>
        </div>

        {/* INTERACTIVE CONTROLS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/80 p-4 rounded-xl border border-amber-500/30">
          {/* 1. X-RAY SCANNER TOGGLE */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">
              👁️ X-Ray Gem Vision Matrix
            </span>
            <button
              onClick={() => {
                setXrayActive(!xrayActive);
                if (soundEnabled) playCoinSound(soundEnabled);
              }}
              className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow ${
                xrayActive
                  ? 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950 shadow-cyan-500/30 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              <span>{xrayActive ? '🔮 X-RAY VISION ACTIVATED (ON)' : '🕶️ X-RAY VISION (OFF)'}</span>
            </button>
          </div>

          {/* 2. CHISEL TOOL SELECTOR */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">
              🔨 Active Chisel Tool
            </span>
            <select
              value={activeChiselIdx}
              onChange={(e) => setActiveChiselIdx(parseInt(e.target.value))}
              className="w-full bg-slate-900 border border-amber-500/50 text-amber-300 font-extrabold text-xs p-2.5 rounded-xl outline-none"
            >
              {CHISELS.map((c, idx) => {
                const isOwned = purchasedChisels.includes(c.id);
                return (
                  <option key={c.id} value={idx} disabled={!isOwned}>
                    {c.name} {isOwned ? `(${c.is3x3 ? '3x3 Area' : '1x1'} | Dmg: ${c.isInfinite ? '∞ INFINITE' : c.power})` : `[LOCKED - $${(c.cost / 1e6).toFixed(0)}M]`}
                  </option>
                );
              })}
            </select>
          </div>

          {/* 3. INFINITE STICKMEN SPAWNER CONTROLS */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">
              👷 Infinite Stickmen Spawner
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleHireStickmen(1)}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-2 px-1 rounded-xl transition cursor-pointer shadow"
              >
                +1 Free
              </button>
              <button
                onClick={() => handleHireStickmen(50)}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-1 rounded-xl transition cursor-pointer shadow"
              >
                +50 Swarm
              </button>
              <button
                onClick={() => setInfiniteAutoSpawner(!infiniteAutoSpawner)}
                className={`flex-1 font-black text-xs py-2 px-1 rounded-xl transition cursor-pointer ${
                  infiniteAutoSpawner
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 animate-pulse'
                    : 'bg-slate-900 text-slate-400 border border-slate-700'
                }`}
              >
                {infiniteAutoSpawner ? '∞ AUTO ON' : '∞ AUTO OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* UNLOCKABLE CHISEL UPGRADES BAR */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
          <span className="text-[11px] font-mono text-amber-400 font-bold mr-2">Chisel Arsenal:</span>
          {CHISELS.map((c, idx) => {
            const isOwned = purchasedChisels.includes(c.id);
            const canAfford = currentBalance >= c.cost;

            return (
              <button
                key={c.id}
                onClick={() => (isOwned ? setActiveChiselIdx(idx) : handleBuyChisel(idx))}
                className={`text-[10.5px] font-mono font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                  activeChiselIdx === idx
                    ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400 font-black'
                    : isOwned
                    ? 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-slate-800'
                    : canAfford
                    ? 'bg-amber-950/80 text-yellow-300 border-amber-500 hover:bg-amber-900'
                    : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <span>{c.name}</span>
                {!isOwned && <span className="text-emerald-400 font-black">${(c.cost / 1e6).toFixed(0)}M</span>}
                {c.is3x3 && <span className="bg-red-500 text-white text-[9px] px-1 rounded font-black">3x3 ∞</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* THE DEEP SCROLLABLE QUARRY SHAFT CANVAS */}
      <div className="bg-slate-950 border-4 border-amber-600/80 rounded-3xl p-4 shadow-2xl relative">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 font-mono text-xs text-amber-400 font-bold px-2">
          <span>⬇️ SCROLL DOWN INFINITELY TO EXPLORE DEEP STRATA (0 FT ➔ {(maxRows * 100).toLocaleString()} FT)</span>
          <span className="text-slate-300 text-[11px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
            {activeChisel.is3x3 ? '💥 3x3 AREA BLAST ACTIVE' : '🔨 SINGLE TILE CHISEL'}
          </span>
        </div>

        {/* INFINITE SCROLL CONTAINER */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="h-[720px] overflow-y-auto custom-scrollbar relative bg-slate-900/90 rounded-2xl p-4 my-2"
        >
          {/* PARTICLES OVERLAY */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute z-50 font-black font-mono text-xs animate-bounce pointer-events-none drop-shadow-md"
              style={{
                left: p.x,
                top: p.y,
                color: p.color,
              }}
            >
              {p.text}
            </div>
          ))}

          {/* DEPTH RULER BACKGROUND */}
          <div className="absolute left-1 top-0 bottom-0 w-12 border-r border-slate-800 font-mono text-[9px] text-amber-500/60 flex flex-col justify-between py-4 pointer-events-none z-10">
            {Array.from({ length: Math.ceil(maxRows / 3) }).map((_, i) => (
              <div key={i} className="flex items-center gap-1 my-4">
                <span>{i * 300}FT</span>
                <div className="h-[1px] w-3 bg-amber-500/30" />
              </div>
            ))}
          </div>

          {/* MAIN ROCK GRID */}
          <div className="ml-12 relative">
            {/* STICKMEN WORKERS OVERLAY (SPATIALLY BALANCED ACROSS DEPTHS TO PREVENT CROWDING) */}
            <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
              {stickmen.map((s) => {
                const topPercent = ((s.depthRow / maxRows) * 100).toFixed(1);
                return (
                  <div
                    key={s.id}
                    className="absolute transition-all duration-300 ease-linear flex flex-col items-center"
                    style={{
                      left: `${s.xPercent}%`,
                      top: `${topPercent}%`,
                      transform: `scaleX(${s.direction})`,
                    }}
                  >
                    {/* SPEECH BUBBLE */}
                    {s.speech && (
                      <div
                        className="bg-amber-300 text-slate-950 font-bold font-sans text-[8px] px-2 py-0.5 rounded-full shadow border border-amber-500 whitespace-nowrap mb-1 animate-bounce"
                        style={{ transform: `scaleX(${s.direction})` }}
                      >
                        💬 {s.speech}
                      </div>
                    )}

                    {/* STICKMAN SVG GRAPHIC */}
                    <svg className="w-8 h-10 text-amber-400 drop-shadow-md" viewBox="0 0 50 70">
                      {/* Head */}
                      <circle cx="25" cy="12" r="8" fill="#fef08a" stroke="#000" strokeWidth="2" />
                      {/* Helmet */}
                      <path d="M 12 12 Q 25 2 38 12 Z" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
                      {/* Body */}
                      <line x1="25" y1="20" x2="25" y2="45" stroke="#fef08a" strokeWidth="3" />
                      {/* Arms holding pickaxe */}
                      <line
                        x1="25"
                        y1="28"
                        x2={s.chiselAction ? '42' : '35'}
                        y2={s.chiselAction ? '18' : '32'}
                        stroke="#fef08a"
                        strokeWidth="3"
                      />
                      {/* Pickaxe */}
                      <line
                        x1={s.chiselAction ? '40' : '32'}
                        y1={s.chiselAction ? '12' : '28'}
                        x2={s.chiselAction ? '48' : '40'}
                        y2={s.chiselAction ? '24' : '38'}
                        stroke="#94a3b8"
                        strokeWidth="4"
                      />
                      <path d="M 38 10 Q 48 18 42 28" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                      {/* Legs */}
                      <line x1="25" y1="45" x2="15" y2="65" stroke="#fef08a" strokeWidth="3" />
                      <line x1="25" y1="45" x2="35" y2="65" stroke="#fef08a" strokeWidth="3" />
                    </svg>
                  </div>
                );
              })}
            </div>

            {/* ROCK BLOCKS GRID */}
            <div className="grid grid-cols-12 gap-1 relative z-0">
              {blocks.map((block) => {
                if (block.type === 'air') {
                  return (
                    <div
                      key={block.id}
                      className="h-16 rounded-lg bg-slate-950/40 border border-slate-900/30 flex items-center justify-center opacity-40"
                    >
                      <span className="text-[9px] text-slate-800 font-mono">AIR</span>
                    </div>
                  );
                }

                const hpPercent = Math.round((block.hp / block.maxHp) * 100);

                return (
                  <div
                    key={block.id}
                    onClick={(e) => handleChiselBlock(block, e)}
                    className={`h-16 rounded-lg border p-1 flex flex-col justify-between items-center transition-all cursor-pointer relative overflow-hidden group ${
                      xrayActive
                        ? 'bg-slate-950/80 border-cyan-500/60 shadow-inner'
                        : block.type === 'blank'
                        ? 'bg-slate-850 border-slate-700/80'
                        : 'bg-slate-800 border-slate-700 hover:border-amber-400'
                    }`}
                    style={{
                      boxShadow:
                        xrayActive && block.type !== 'rock' && block.type !== 'soil'
                          ? `0 0 12px ${block.xrayGlow}`
                          : undefined,
                    }}
                  >
                    {/* X-RAY GLOW OR NORMAL ROCK */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm">{block.icon}</span>
                      <span className="text-[9px] font-mono text-slate-400 font-bold">
                        {hpPercent}%
                      </span>
                    </div>

                    {/* BLOCK NAME OR X-RAY DETECT */}
                    <div className="text-center w-full">
                      <span
                        className={`text-[9px] font-mono block font-black truncate ${
                          xrayActive ? 'text-amber-300' : 'text-slate-300'
                        }`}
                        style={{ color: xrayActive ? block.xrayGlow : undefined }}
                      >
                        {xrayActive ? block.name : block.type === 'blank' ? 'Blank Stone' : 'Rock'}
                      </span>
                    </div>

                    {/* HEALTH BAR */}
                    <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all"
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER INFO & LEGEND */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-2 px-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-amber-400 font-bold">Ore Types:</span>
            <span className="text-slate-400">🗿 Blank Stone ($0)</span>
            <span className="text-amber-300">👑 Relic ($50B)</span>
            <span className="text-pink-400">⚛️ Antimatter ($10B)</span>
            <span className="text-cyan-300">💎 Diamond ($1B)</span>
            <span className="text-emerald-300">❇️ Emerald ($250M)</span>
            <span className="text-yellow-300">🪙 Gold ($50M)</span>
          </div>

          <div className="text-slate-300 font-bold">
            Selected Chisel:{' '}
            <span className="text-amber-300 font-black">
              {activeChisel.name} ({activeChisel.is3x3 ? '3x3 Area' : '1x1'} | {activeChisel.isInfinite ? '∞ Infinite Damage' : `${activeChisel.power} Dmg`})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
