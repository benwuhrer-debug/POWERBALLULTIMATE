/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface DVDBouncingCashProps {
  cheatBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  soundEnabled: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

export const DVDBouncingCash: React.FC<DVDBouncingCashProps> = ({
  cheatBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  // Config States (The God-Mode DVD Admin Panel)
  const [bouncingSpeed, setBouncingSpeed] = useState<number>(5); // Pixels per frame
  const [cashPerNormalHit, setCashPerNormalHit] = useState<number>(500);
  const [cashPerCornerHit, setCashPerCornerHit] = useState<number>(2500000);
  const [trajectoryMode, setTrajectoryMode] = useState<'fair' | 'guided' | 'hyper_corner'>('hyper_corner');
  const [logoText, setLogoText] = useState<string>('📀 DVD_CASH');
  const [logoColorIndex, setLogoColorIndex] = useState<number>(0);
  const [logoSize, setLogoSize] = useState<number>(90); // pixel width
  const [trailLength, setTrailLength] = useState<number>(10); // particle count on edge
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const [soundPitchMod, setSoundPitchMod] = useState<number>(1.0);

  // Statistics Logs
  const [stats, setStats] = useState({
    totalBounces: 0,
    cornerHits: 0,
    normalHits: 0,
    cashHarvested: 0,
  });

  // Color Swatches
  const neonColors = [
    '#38bdf8', // sky-400
    '#f43f5e', // rose-500
    '#10b981', // emerald-500
    '#eab308', // yellow-500
    '#a855f7', // purple-500
    '#fb923c', // orange-400
    '#f472b6', // pink-400
    '#22d3ee', // cyan-400
  ];

  // Domestic physics simulation refs
  const playfieldRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  // Core coordinates
  const stateRef = useRef({
    x: 100,
    y: 100,
    vx: 3,
    vy: 3,
    prevX: 100,
    prevY: 100,
    width: 90,
    height: 48,
    playfieldW: 600,
    playfieldH: 400,
    particlesList: [] as Particle[],
    particleIdCounter: 0,
    colorIndex: 0,
    targetCornerIndex: 0, // 0 = TL, 1 = TR, 2 = BR, 3 = BL
  });

  const [tickerTrigger, setTickerTrigger] = useState(0);

  // Add random explosive bursts of neon particles
  const triggerParticleExplosion = (startX: number, startY: number, count: number, customColor?: string) => {
    const nextArr: Particle[] = [];
    const colorToUse = customColor || neonColors[stateRef.current.colorIndex];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      nextArr.push({
        id: stateRef.current.particleIdCounter++,
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colorToUse,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
      });
    }
    stateRef.current.particlesList.push(...nextArr);
  };

  // Sound triggering safely with small pitch multipliers
  const playVisualImpactSound = (isCorner: boolean) => {
    if (!soundEnabled) return;
    try {
      if (isCorner) {
        playJackpotSound(soundEnabled);
      } else {
        playCoinSound(soundEnabled);
      }
    } catch {}
  };

  // Spawn custom screen notification alert
  const [bulletinAlertLine, setBulletinAlertLine] = useState<string>('🟢 SYSTEM STATUS: Bountiful cash rig active. Trajectory algorithm aligned.');

  const postLocalNews = (news: string) => {
    setBulletinAlertLine(news);
  };

  // Handle immediate corner teleport (Insta-Corner Slam)
  const handleInstaCornerSlam = () => {
    const { playfieldW, playfieldH, width, height } = stateRef.current;
    
    // Teleport directly to Bottom-Right corner
    stateRef.current.x = playfieldW - width;
    stateRef.current.y = playfieldH - height;
    
    // Force coordinates boundaries crash
    stateRef.current.vx = -Math.abs(stateRef.current.vx);
    stateRef.current.vy = -Math.abs(stateRef.current.vy);
    
    // Trigger corner rewards immediately
    setStats(prev => ({
      ...prev,
      totalBounces: prev.totalBounces + 1,
      cornerHits: prev.cornerHits + 1,
      cashHarvested: prev.cashHarvested + cashPerCornerHit,
    }));
    
    onUpdateBalance(cheatBalance + cashPerCornerHit);
    triggerParticleExplosion(playfieldW - width, playfieldH - height, 45, '#fb7185');
    playVisualImpactSound(true);
    postLocalNews(`🔥 [MANUAL INTEGRATION] Override hit landed! +$${cashPerCornerHit.toLocaleString()} corner jackpot added!`);
  };

  // Main high speed logic frames loops
  useEffect(() => {
    let animId: number;

    const gameLoop = () => {
      if (!isSimulationActive) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      const pBox = playfieldRef.current;
      const lBox = logoRef.current;
      if (!pBox || !lBox) {
        animId = requestAnimationFrame(gameLoop);
        return;
      }

      // Read current container and element boxes dimensions dynamically
      const pw = pBox.clientWidth;
      const ph = pBox.clientHeight;
      const lw = lBox.clientWidth;
      const lh = lBox.clientHeight;

      stateRef.current.playfieldW = pw;
      stateRef.current.playfieldH = ph;
      stateRef.current.width = lw;
      stateRef.current.height = lh;

      let { x, y, vx, vy, colorIndex, targetCornerIndex } = stateRef.current;

      // Handle custom RIG pathing variables
      if (trajectoryMode === 'hyper_corner') {
        // Mode 3: Guaranteed corner to corner transit using direct custom interpolation scaling!
        // We calculate perfect diagonals so that x and y impacts align identically!
        // Perfect velocity is scaled such that: path time Tx = Ty (W / vx = H / vy).
        const maxDim = Math.max(pw - lw, 1);
        const ratio = Math.max(ph - lh, 1) / maxDim;

        // Base velocity vector matches aspect ratio exactly
        const baseSpeed = bouncingSpeed;
        const currentVx = baseSpeed * (vx > 0 ? 1 : -1);
        const currentVy = baseSpeed * ratio * (vy > 0 ? 1 : -1);

        x += currentVx;
        y += currentVy;

        // Check bounds
        let hitX = false;
        let hitY = false;

        if (x <= 0) {
          x = 0;
          vx = Math.abs(vx);
          hitX = true;
        } else if (x >= pw - lw) {
          x = pw - lw;
          vx = -Math.abs(vx);
          hitX = true;
        }

        if (y <= 0) {
          y = 0;
          vy = Math.abs(vy);
          hitY = true;
        } else if (y >= ph - lh) {
          y = ph - lh;
          vy = -Math.abs(vy);
          hitY = true;
        }

        if (hitX || hitY) {
          // If BOTH hit, it's a corner!
          // Under hyper_corner mode, because velocity handles ph/pw scaling exactly, BOTH will trigger together 100% of the time!
          const isCornerStrike = hitX && hitY;
          
          // Switch color
          const nextClrIdx = (colorIndex + 1) % neonColors.length;
          stateRef.current.colorIndex = nextClrIdx;
          setLogoColorIndex(nextClrIdx);

          if (isCornerStrike) {
            // Trigger mega cash payout
            setStats(prev => ({
              ...prev,
              totalBounces: prev.totalBounces + 1,
              cornerHits: prev.cornerHits + 1,
              cashHarvested: prev.cashHarvested + cashPerCornerHit,
            }));
            onUpdateBalance(cheatBalance + cashPerCornerHit);
            triggerParticleExplosion(x + lw / 2, y + lh / 2, 35);
            playVisualImpactSound(true);
            postLocalNews(`🔮 PERFECT CORNER LANDING! Trajectory solved perfectly! +$${cashPerCornerHit.toLocaleString()} cash injected!`);
          } else {
            // Unlikely to slide off unless resized mid-flight, but fall back gracefully
            setStats(prev => ({
              ...prev,
              totalBounces: prev.totalBounces + 1,
              normalHits: prev.normalHits + 1,
              cashHarvested: prev.cashHarvested + cashPerNormalHit,
            }));
            onUpdateBalance(cheatBalance + cashPerNormalHit);
            triggerParticleExplosion(x + lw / 2, y + lh / 2, 10);
            playVisualImpactSound(false);
          }
        }

        stateRef.current.vx = vx;
        stateRef.current.vy = vy;

      } else if (trajectoryMode === 'guided') {
        // Mode 2: Micro-steer and bend the path toward the nearest corner near impact
        // Standard velocity plus subtle corrective target locking alignment!
        const baseSpeed = bouncingSpeed;
        x += vx * (baseSpeed / 4);
        y += vy * (baseSpeed / 4);

        let hitX = false;
        let hitY = false;

        let margin = 20; // Trigger bend magnet close to borders
        const dxToC = Math.min(x, pw - lw - x);
        const dyToC = Math.min(y, ph - lh - y);

        if (dxToC < margin && dyToC < margin) {
          // Magnet lock-on pulls logo directly to closest coordinates of nearest corner!
          const currentCornerX = x < pw / 2 ? 0 : pw - lw;
          const currentCornerY = y < ph / 2 ? 0 : ph - lh;
          x = currentCornerX;
          y = currentCornerY;
          vx = currentCornerX === 0 ? Math.abs(vx) : -Math.abs(vx);
          vy = currentCornerY === 0 ? Math.abs(vy) : -Math.abs(vy);
          hitX = true;
          hitY = true;
        } else {
          // Normal collisions
          if (x <= 0) {
            x = 0;
            vx = Math.abs(vx);
            hitX = true;
          } else if (x >= pw - lw) {
            x = pw - lw;
            vx = -Math.abs(vx);
            hitX = true;
          }

          if (y <= 0) {
            y = 0;
            vy = Math.abs(vy);
            hitY = true;
          } else if (y >= ph - lh) {
            y = ph - lh;
            vy = -Math.abs(vy);
            hitY = true;
          }
        }

        if (hitX || hitY) {
          const isCornerStrike = hitX && hitY;
          const nextClrIdx = (colorIndex + 1) % neonColors.length;
          stateRef.current.colorIndex = nextClrIdx;
          setLogoColorIndex(nextClrIdx);

          if (isCornerStrike) {
            setStats(prev => ({
              ...prev,
              totalBounces: prev.totalBounces + 1,
              cornerHits: prev.cornerHits + 1,
              cashHarvested: prev.cashHarvested + cashPerCornerHit,
            }));
            onUpdateBalance(cheatBalance + cashPerCornerHit);
            triggerParticleExplosion(x + lw / 2, y + lh / 2, 40);
            playVisualImpactSound(true);
            postLocalNews(`🎯 GUIDED RADAR LOCK! Nearest corner snapped. +$${cashPerCornerHit.toLocaleString()}`);
          } else {
            setStats(prev => ({
              ...prev,
              totalBounces: prev.totalBounces + 1,
              normalHits: prev.normalHits + 1,
              cashHarvested: prev.cashHarvested + cashPerNormalHit,
            }));
            onUpdateBalance(cheatBalance + cashPerNormalHit);
            triggerParticleExplosion(x + lw / 2, y + lh / 2, 10);
            playVisualImpactSound(false);
          }
        }

        stateRef.current.vx = vx;
        stateRef.current.vy = vy;

      } else {
        // Mode 1: Fair un-rigged traditional physical model (pure randomness of hitting corners is retained)
        const baseSpeed = bouncingSpeed;
        x += vx * (baseSpeed / 5);
        y += vy * (baseSpeed / 5);

        let hitX = false;
        let hitY = false;

        if (x <= 0) {
          x = 0;
          vx = Math.abs(vx);
          hitX = true;
        } else if (x >= pw - lw) {
          x = pw - lw;
          vx = -Math.abs(vx);
          hitX = true;
        }

        if (y <= 0) {
          y = 0;
          vy = Math.abs(vy);
          hitY = true;
        } else if (y >= ph - lh) {
          y = ph - lh;
          vy = -Math.abs(vy);
          hitY = true;
        }

        if (hitX || hitY) {
          const isCornerStrike = hitX && hitY;
          const nextClrIdx = (colorIndex + 1) % neonColors.length;
          stateRef.current.colorIndex = nextClrIdx;
          setLogoColorIndex(nextClrIdx);

          if (isCornerStrike) {
            setStats(prev => ({
              ...prev,
              totalBounces: prev.totalBounces + 1,
              cornerHits: prev.cornerHits + 1,
              cashHarvested: prev.cashHarvested + cashPerCornerHit,
            }));
            onUpdateBalance(cheatBalance + cashPerCornerHit);
            triggerParticleExplosion(x + lw / 2, y + lh / 2, 50, '#eab308');
            playVisualImpactSound(true);
            postLocalNews(`🎰 UNBELIEVABLE HONEST CORNER HIT! Pure statistical miracle! +$${cashPerCornerHit.toLocaleString()}!`);
          } else {
            setStats(prev => ({
              ...prev,
              totalBounces: prev.totalBounces + 1,
              normalHits: prev.normalHits + 1,
              cashHarvested: prev.cashHarvested + cashPerNormalHit,
            }));
            onUpdateBalance(cheatBalance + cashPerNormalHit);
            triggerParticleExplosion(x + lw / 2, y + lh / 2, 8);
            playVisualImpactSound(false);
          }
        }

        stateRef.current.vx = vx;
        stateRef.current.vy = vy;
      }

      // Constrain inside boundaries safely
      if (x < 0) x = 0;
      if (y < 0) y = 0;
      if (x > pw - lw) x = pw - lw;
      if (y > ph - lh) y = ph - lh;

      // Update positions
      stateRef.current.x = x;
      stateRef.current.y = y;

      lBox.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      // Render Canvas particle trail effects
      const canvas = particleCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Sync size
          if (canvas.width !== pw || canvas.height !== ph) {
            canvas.width = pw;
            canvas.height = ph;
          }

          ctx.clearRect(0, 0, pw, ph);

          // Render trail particles list
          stateRef.current.particlesList = stateRef.current.particlesList.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.02; // fade out speed
            
            if (p.alpha <= 0) return false;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            return true;
          });
          ctx.globalAlpha = 1.0;
        }
      }

      setTickerTrigger(prev => prev + 1); // updates metrics panel
      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [bouncingSpeed, cashPerNormalHit, cashPerCornerHit, trajectoryMode, isSimulationActive, cheatBalance]);

  return (
    <div className="bg-slate-900 border border-slate-750 p-6 rounded-3xl shadow-2xl space-y-6 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#a855f7_0.4px,transparent_0.4px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

      {/* HEADER BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-850 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest font-black uppercase text-purple-400 bg-purple-950/60 border border-purple-800/80 rounded-full">
              DVD Quantum Cash Rig
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-rose-950/50 border border-rose-900/40 text-rose-400 rounded-md font-bold">
              Gravity Corner Hack V4.9
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-100 mt-1 flex items-center gap-2">
            📀 DVD BOUNCING LOGO MONETIZER & PHYSICS RIG
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Auto-generate cash payloads by running infinite mechanical bounce collisions aligned perfectly with boundary coordinates.
          </p>
        </div>

        {/* Play/Pause state togglers */}
        <div className="flex items-center gap-2 font-mono text-xs bg-slate-950 p-2 rounded-xl border border-slate-850">
          <button
            onClick={() => {
              playTickSound(soundEnabled);
              setIsSimulationActive(!isSimulationActive);
            }}
            className={`px-3 py-1 font-bold rounded-lg transition ${
              isSimulationActive ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950/60 text-rose-400 border border-rose-900'
            }`}
          >
            {isSimulationActive ? '🟢 SIMULATION RUNNING' : '⏸ SIMULATION PAUSED'}
          </button>
          <button
            onClick={handleInstaCornerSlam}
            className="px-3 py-1 bg-purple-950 text-purple-300 hover:bg-purple-900 font-bold rounded-lg transition border border-purple-850"
          >
            ⚡ FORCE INSTA-CORNER SLAM
          </button>
        </div>
      </div>

      {/* METRICS & FINANCES BOARD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-850 relative z-10 font-mono">
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 uppercase block">TOTAL BOUNCES TRACKED</span>
          <p className="text-xl font-bold text-slate-200">
            {stats.totalBounces.toLocaleString()}
          </p>
          <span className="text-[9.5px] text-slate-450 block">Cumulative impacts</span>
        </div>
        <div className="space-y-1 border-l border-slate-850 pl-4">
          <span className="text-[10px] text-purple-400 font-bold uppercase block">👑 CORNER HITS MADE</span>
          <p className="text-xl font-black text-purple-300">
            {stats.cornerHits.toLocaleString()}
          </p>
          <span className="text-[9.5px] text-emerald-400 block font-bold">
            {(stats.totalBounces > 0 ? (stats.cornerHits / stats.totalBounces) * 100 : 0).toFixed(1)}% hit frequency
          </span>
        </div>
        <div className="space-y-1 border-l border-slate-850 pl-4">
          <span className="text-[10px] text-slate-500 uppercase block">WALL IMPACTS</span>
          <p className="text-xl font-bold text-slate-300">
            {stats.normalHits.toLocaleString()}
          </p>
          <span className="text-[9.5px] text-slate-450 block">Standard bounds bounce</span>
        </div>
        <div className="space-y-1 border-l border-slate-850 pl-4">
          <span className="text-[10px] text-emerald-400 font-bold uppercase block">CASH GENERATED</span>
          <p className="text-xl font-black text-emerald-300">
            +${stats.cashHarvested.toLocaleString()}
          </p>
          <span className="text-[9.5px] text-slate-400 block truncate">
            Awarded directly to core balance
          </span>
        </div>
      </div>

      {/* NEW DISPATCH ALERT BULLETIN */}
      <div className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-xs flex items-center gap-2 select-none">
        <span className="text-[9px] font-black uppercase text-purple-500 bg-purple-950/50 border border-purple-900/50 px-1.5 py-0.5 rounded-sm shrink-0">
          RIG SYSTEM TELEMETRY
        </span>
        <p className="text-slate-300 font-mono truncate leading-none mt-0.5 animate-fadeIn">
          {bulletinAlertLine}
        </p>
      </div>

      {/* MAIN LAYOUT SPLIT: Left side bouncing preview block, right side sovereign rig controls panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* BOUNCING GRAPHICS ENVIRONMENT GRID */}
        <div className="xl:col-span-7 bg-slate-950 border border-slate-850 p-3 rounded-2xl relative">
          <div className="absolute top-2 left-3 z-15 flex items-center gap-1.5 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-[9px] font-mono text-rose-400 font-bold uppercase">PHYSICS SIM STAGE</span>
          </div>

          {/* Core playfield container */}
          <div
            ref={playfieldRef}
            className="w-full h-[320px] rounded-xl bg-slate-1000 border border-slate-900/80 relative overflow-hidden flex items-center justify-center"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 80%)'
            }}
          >
            {/* Background Corner Crosshairs to display target grids */}
            <div className="absolute top-0 left-0 w-6 h-6 border-b border-r border-dashed border-purple-900/60 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-b border-l border-dashed border-purple-900/60 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-t border-r border-dashed border-purple-900/60 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-t border-l border-dashed border-purple-900/60 pointer-events-none"></div>

            {/* Canvas overlay for particle burst trailing */}
            <canvas
              ref={particleCanvasRef}
              className="absolute inset-0 pointer-events-none w-full h-full"
            />

            {/* Floating bouncing logo render element */}
            <div
              ref={logoRef}
              style={{
                width: `${logoSize}px`,
                color: neonColors[logoColorIndex],
                textShadow: `0 0 10px ${neonColors[logoColorIndex]}`,
              }}
              className="absolute top-0 left-0 text-center select-none font-sans font-black tracking-tighter leading-none p-2 rounded-lg cursor-grab active:cursor-grabbing text-xs transition-colors duration-150 inline-block bg-slate-950/60 backdrop-blur-sm border border-current"
            >
              <div className="font-mono text-[9px] tracking-widest font-black uppercase bg-black/40 px-1 py-0.5 rounded scale-90 mb-1 opacity-80">
                DVD CASH
              </div>
              <span className="whitespace-nowrap inline-block px-1">
                {logoText}
              </span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Coordinate Vector: X:{Math.round(stateRef.current.x)} Y:{Math.round(stateRef.current.y)}</span>
            <span>Aspect Scaling Ratio: {(stateRef.current.playfieldH / Math.max(stateRef.current.playfieldW, 1)).toFixed(3)}</span>
          </div>
        </div>

        {/* INTERACTIVE CONTROLLERS PANEL */}
        <div className="xl:col-span-5 bg-slate-950/50 border border-slate-850 p-5 rounded-2xl space-y-4">
          <span className="text-[10px] font-mono font-bold tracking-widest text-purple-400 block uppercase">
            🛠️ CENTRAL RIG CONTROL DECKS
          </span>

          <div className="space-y-4 text-xs">
            {/* Trajectory Mode Switcher */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-mono text-slate-400 block">TRAJECTORY COMPUTATION MECHANICS:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'hyper_corner',
                    name: 'Guaranteed Rigid',
                    hint: 'Hits a corner every single bounce'
                  },
                  {
                    id: 'guided',
                    name: 'Magnet Lock',
                    hint: 'Corrects path close to corners'
                  },
                  {
                    id: 'fair',
                    name: 'Organic Fair',
                    hint: 'Original classic physics rates'
                  }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      playTickSound(soundEnabled);
                      setTrajectoryMode(mode.id as any);
                      postLocalNews(`🔄 Mode updated: Aligned path to favor ${mode.name} trajectory.`);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      trajectoryMode === mode.id
                        ? 'bg-purple-950 border-purple-700/80 text-purple-300'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-[11px] block">{mode.name}</span>
                    <span className="text-[9px] text-slate-500 leading-tight block mt-1">{mode.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Value Multipliers config */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-mono text-slate-400 block">💰 CASH PER CORNER STRIKE:</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-mono font-bold">$</span>
                  <input
                    type="number"
                    value={cashPerCornerHit}
                    onChange={(e) => setCashPerCornerHit(Math.max(parseFloat(e.target.value) || 0, 0))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs pl-6 pr-2 py-2 rounded-lg font-mono font-bold text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-[9.5px] text-slate-500">Normal is $2,500,000</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-mono text-slate-400 block">💸 SECURE WALL IMPACT PAYOUT:</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-500 font-mono font-bold">$</span>
                  <input
                    type="number"
                    value={cashPerNormalHit}
                    onChange={(e) => setCashPerNormalHit(Math.max(parseFloat(e.target.value) || 0, 0))}
                    className="w-full bg-slate-900 border border-slate-800 text-xs pl-6 pr-2 py-2 rounded-lg font-mono font-bold text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>
                <span className="text-[9.5px] text-slate-500">Normal is $500</span>
              </div>
            </div>

            {/* Bouncing speed configuration */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-850">
              <div className="flex justify-between items-center text-[10.5px] font-mono">
                <span className="text-slate-400 font-bold">🚀 BOUNCING SPEED VELOCITY:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={bouncingSpeed}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(500, parseInt(e.target.value) || 1));
                      setBouncingSpeed(v);
                      playTickSound(soundEnabled);
                    }}
                    className="w-12 bg-slate-950 border border-slate-800 text-right text-xs py-0.5 px-1.5 rounded font-mono font-bold text-purple-400 outline-none"
                  />
                  <span className="text-purple-400 font-bold">px/step</span>
                </div>
              </div>
              
              <input
                type="range"
                min="1"
                max="120"
                step="1"
                value={bouncingSpeed}
                onChange={(e) => {
                  setBouncingSpeed(parseInt(e.target.value));
                  playTickSound(soundEnabled);
                }}
                className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
              />

              {/* Quick speed configuration hotkeys */}
              <div className="flex items-center justify-between gap-1 pt-1">
                {[
                  { label: '🐢 2x', val: 2 },
                  { label: '📀 5x', val: 5 },
                  { label: '⚡ 15x', val: 15 },
                  { label: '🔥 35x', val: 35 },
                  { label: '🌌 80x', val: 80 },
                  { label: '🚀 120x', val: 120 }
                ].map((s) => (
                  <button
                    key={`speed-pre-${s.val}`}
                    onClick={() => {
                      setBouncingSpeed(s.val);
                      playJackpotSound(soundEnabled);
                    }}
                    className={`flex-1 text-[9px] font-mono py-1 rounded border transition ${
                      bouncingSpeed === s.val
                        ? 'bg-purple-950/80 border-purple-800 text-purple-300 font-black'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <span className="text-[9.5px] text-slate-500 font-sans block leading-relaxed pt-0.5">
                Scale coordinates translation speed per tick. Higher velocity generates massive cash payloads instantly.
              </span>
            </div>

            {/* Custom logo parameters */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Logo Custom Text:</label>
                <input
                  type="text"
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value.substring(0, 16))}
                  className="w-full bg-slate-900 border border-slate-800 text-xs p-2 rounded-lg font-bold text-slate-200 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Rig Size (Width px):</label>
                <input
                  type="number"
                  value={logoSize}
                  onChange={(e) => setLogoSize(Math.max(parseInt(e.target.value) || 40, 40))}
                  className="w-full bg-slate-900 border border-slate-800 text-xs p-2 rounded-lg font-bold font-mono text-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Quick Balance manipulation presets */}
            <div className="border-t border-slate-900 pt-3.5 space-y-2">
              <span className="text-[9.5px] font-mono font-bold text-slate-450 block uppercase">⚡ CASH-FARM AUTOMATED TRIGGER CYCLES</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Reset Simulated Counters', action: () => {
                      setStats({ totalBounces: 0, cornerHits: 0, normalHits: 0, cashHarvested: 0 });
                      playTickSound(soundEnabled);
                    } 
                  },
                  { label: 'Set Unlimited Speed (35x)', action: () => {
                      setBouncingSpeed(35);
                      playJackpotSound(soundEnabled);
                    } 
                  },
                  { label: 'Mint $1,000,000 per corner', action: () => {
                      setCashPerCornerHit(1000000);
                      playTickSound(soundEnabled);
                    } 
                  }
                ].map((preset, idx) => (
                  <button
                    key={`dvd-preset-${idx}`}
                    onClick={preset.action}
                    className="px-2.5 py-1.5 bg-slate-900 text-slate-300 hover:text-slate-100 font-mono text-[10px] rounded-lg border border-slate-800 transition"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
