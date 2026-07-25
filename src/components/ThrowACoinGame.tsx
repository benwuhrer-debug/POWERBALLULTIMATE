/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface ThrowACoinGameProps {
  cheatBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  soundEnabled: boolean;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'bronze' | 'gold' | 'diamond' | 'quantum' | 'admin';
  baseValue: number;
  multiplier: number;
  color: string;
  rotation: number;
  vRot: number;
  active: boolean;
  bounces: number;
  splitCount: number;
}

interface Peg {
  x: number;
  y: number;
  radius: number;
  multiplierBonus: number;
  type: 'standard' | 'bumper' | 'teleport' | 'jackpot';
}

interface Bucket {
  id: number;
  x: number;
  width: number;
  label: string;
  multiplier: number;
  color: string;
  hits: number;
}

export const ThrowACoinGame: React.FC<ThrowACoinGameProps> = ({
  cheatBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  // Mode selection: 'game' or 'admin' or 'script'
  const [activeSubTab, setActiveSubTab] = useState<'game' | 'admin' | 'upgrades' | 'script'>('game');

  // Launch Controls
  const [launchPower, setLaunchPower] = useState<number>(12);
  const [launchAngle, setLaunchAngle] = useState<number>(0); // -45 to 45 degrees
  const [selectedCoinType, setSelectedCoinType] = useState<'bronze' | 'gold' | 'diamond' | 'quantum' | 'admin'>('gold');
  const [isAutoThrow, setIsAutoThrow] = useState<boolean>(false);
  const [autoThrowSpeed, setAutoThrowSpeed] = useState<number>(10); // Coins / sec

  // Custom Peg / Dot Size (0 = deleted/removed, 0.1 = invisible/micro, 1 = normal, 3 = giant)
  const [pegSizeScale, setPegSizeScale] = useState<number>(1.0);

  // Admin / OP Hacks Settings
  const [godModeMultiplier, setGodModeMultiplier] = useState<number>(1);
  const [coinMagnetActive, setCoinMagnetActive] = useState<boolean>(false);
  const [gravitySetting, setGravitySetting] = useState<number>(0.35); // standard gravity
  const [riggedBucketMode, setRiggedBucketMode] = useState<boolean>(false);
  const [coinDuplicationMode, setCoinDuplicationMode] = useState<boolean>(false);
  const [jackpotLuckLock, setJackpotLuckLock] = useState<boolean>(false);
  const [nukeCPS, setNukeCPS] = useState<number>(50);

  // Statistics
  const [gameStats, setGameStats] = useState({
    totalCoinsThrown: 0,
    totalCoinsInBuckets: 0,
    totalEarnings: 0,
    jackpotsHit: 0,
    highestMultiplier: 1,
  });

  // Upgrades
  const [upgrades, setUpgrades] = useState({
    coinSize: 1, // multiplier
    bounceFactor: 1,
    luckBoost: 1,
    magnetPower: 0,
  });

  // Roblox Luau Script Console State
  const [luaCode, setLuaCode] = useState<string>(
`-- Roblox 'Throw a Coin' Game Hook #115681808123944
local Player = game.Players.LocalPlayer
local CoinManager = workspace.CoinManager

function SuperOPAdminFarm()
    getgenv().Magnet = true
    getgenv().InfiniteMultiplier = 999999
    getgenv().SpawnRate = 0.001
    
    print("[SYNAPSE X] Script injected successfully!")
    print("[OP ADMIN] Linked with AI Studio Cheat Balance!")
end

SuperOPAdminFarm()`
  );

  const [consoleLogs, setConsoleLogs] = useState<Array<{ id: number; text: string; type: 'info' | 'warn' | 'success' | 'exec' }>>([
    { id: 1, text: '[ROBLOX SERVER HOOK] Connected to Roblox Game Instance #115681808123944 "Throw a Coin"', type: 'info' },
    { id: 2, text: '[SYNAPSE/WAVE HOOK] Security bypass active (0x8F21B). Anti-cheat neutralized.', type: 'success' },
    { id: 3, text: '[SYNC ENGINE] Balance synced with Global Wallet: $' + cheatBalance.toLocaleString(), type: 'info' },
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const coinsRef = useRef<Coin[]>([]);
  const pegsRef = useRef<Peg[]>([]);
  const bucketsRef = useRef<Bucket[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const autoThrowTimerRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (text: string, type: 'info' | 'warn' | 'success' | 'exec' = 'info') => {
    setConsoleLogs(prev => [
      ...prev.slice(-49),
      { id: Date.now() + Math.random(), text: `[${new Date().toLocaleTimeString()}] ${text}`, type }
    ]);
  };

  // Initialize Canvas Peg Board and Buckets
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    // Generate Pegs Grid
    const newPegs: Peg[] = [];
    const rows = 8;
    const startY = 120;
    const rowSpacing = 45;

    for (let r = 0; r < rows; r++) {
      const cols = r % 2 === 0 ? 9 : 8;
      const startX = r % 2 === 0 ? 40 : 70;
      const colSpacing = (width - 80) / 8;

      for (let c = 0; c < cols; c++) {
        const x = startX + c * colSpacing;
        const y = startY + r * rowSpacing;

        let pegType: Peg['type'] = 'standard';
        let multBonus = 1;

        if (r === 3 && (c === 2 || c === 6)) {
          pegType = 'bumper';
          multBonus = 5;
        } else if (r === 6 && c === 4) {
          pegType = 'jackpot';
          multBonus = 50;
        }

        newPegs.push({
          x,
          y,
          radius: pegType === 'jackpot' ? 10 : pegType === 'bumper' ? 8 : 6,
          multiplierBonus: multBonus,
          type: pegType,
        });
      }
    }
    pegsRef.current = newPegs;

    // Generate Target Buckets at bottom
    const bucketCount = 7;
    const bucketWidth = width / bucketCount;
    const baseMultipliers = [2, 10, 50, 1000, 50, 10, 2];
    const bucketColors = [
      '#ef4444', // red
      '#f97316', // orange
      '#eab308', // yellow
      '#8b5cf6', // purple jackpot
      '#eab308', // yellow
      '#f97316', // orange
      '#ef4444', // red
    ];

    const newBuckets: Bucket[] = baseMultipliers.map((mult, i) => ({
      id: i,
      x: i * bucketWidth,
      width: bucketWidth,
      label: mult === 1000 ? '🔥 1000x' : `${mult}x`,
      multiplier: mult,
      color: bucketColors[i],
      hits: 0,
    }));
    bucketsRef.current = newBuckets;
  }, []);

  // Update bucket multipliers if rigged mode is activated
  useEffect(() => {
    if (bucketsRef.current.length > 0) {
      const riggedMult = riggedBucketMode ? 100000 : 0;
      bucketsRef.current = bucketsRef.current.map((b, i) => {
        const defaultMult = [2, 10, 50, 1000, 50, 10, 2][i];
        const mult = riggedBucketMode ? 100000 : defaultMult;
        return {
          ...b,
          multiplier: mult,
          label: mult >= 100000 ? '👑 100Kx' : mult === 1000 ? '🔥 1000x' : `${mult}x`,
          color: riggedBucketMode ? '#ec4899' : b.color,
        };
      });
    }
  }, [riggedBucketMode]);

  // Throw Coin logic
  const spawnCoin = (overrideType?: 'bronze' | 'gold' | 'diamond' | 'quantum' | 'admin', customVx?: number, customVy?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const type = overrideType || selectedCoinType;

    // Cost evaluation
    const costs = {
      bronze: 10,
      gold: 1000,
      diamond: 50000,
      quantum: 1000000,
      admin: 0,
    };

    const cost = costs[type];
    if (cheatBalance < cost && type !== 'admin') {
      addLog(`[FAIL] Insufficient funds to toss ${type.toUpperCase()} coin ($${cost.toLocaleString()} required)`, 'warn');
      return;
    }

    if (cost > 0) {
      onUpdateBalance(cheatBalance - cost);
    }

    // Launch parameters
    const startX = canvas.width / 2 + (Math.random() * 20 - 10);
    const startY = 40;

    const angleRad = (launchAngle * Math.PI) / 180;
    const p = launchPower * (0.9 + Math.random() * 0.2);

    const vx = customVx !== undefined ? customVx : Math.sin(angleRad) * p + (Math.random() - 0.5) * 2;
    const vy = customVy !== undefined ? customVy : Math.cos(angleRad) * p + Math.random() * 2;

    const baseValues = {
      bronze: 20,
      gold: 2500,
      diamond: 150000,
      quantum: 5000000,
      admin: 1000000000,
    };

    const colors = {
      bronze: '#cd7f32',
      gold: '#fbbf24',
      diamond: '#38bdf8',
      quantum: '#c084fc',
      admin: '#f43f5e',
    };

    const radii = {
      bronze: 10 * upgrades.coinSize,
      gold: 13 * upgrades.coinSize,
      diamond: 16 * upgrades.coinSize,
      quantum: 18 * upgrades.coinSize,
      admin: 22 * upgrades.coinSize,
    };

    const newCoin: Coin = {
      id: Date.now() + Math.random(),
      x: startX,
      y: startY,
      vx,
      vy,
      radius: radii[type],
      type,
      baseValue: baseValues[type],
      multiplier: godModeMultiplier * upgrades.luckBoost,
      color: colors[type],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.3,
      active: true,
      bounces: 0,
      splitCount: 0,
    };

    coinsRef.current.push(newCoin);

    setGameStats(prev => ({
      ...prev,
      totalCoinsThrown: prev.totalCoinsThrown + 1,
    }));

    if (soundEnabled) {
      playCoinSound(soundEnabled);
    }
  };

  // Trigger Multi Spawn
  const triggerMultiThrow = (count: number) => {
    let thrown = 0;
    const interval = setInterval(() => {
      spawnCoin();
      thrown++;
      if (thrown >= count) {
        clearInterval(interval);
      }
    }, 40);
  };

  // Auto-thrower loop
  useEffect(() => {
    if (isAutoThrow) {
      const intervalMs = Math.max(20, Math.floor(1000 / autoThrowSpeed));
      autoThrowTimerRef.current = setInterval(() => {
        spawnCoin();
      }, intervalMs);
    } else if (autoThrowTimerRef.current) {
      clearInterval(autoThrowTimerRef.current);
    }

    return () => {
      if (autoThrowTimerRef.current) clearInterval(autoThrowTimerRef.current);
    };
  }, [isAutoThrow, autoThrowSpeed, selectedCoinType, cheatBalance, godModeMultiplier, upgrades]);

  // Main Physics Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const updatePhysics = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid overlay
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Launcher Guide Arc
      ctx.save();
      ctx.translate(width / 2, 35);
      const angleRad = (launchAngle * Math.PI) / 180;
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.sin(angleRad) * 60, Math.cos(angleRad) * 60);
      ctx.stroke();
      ctx.restore();

      // Draw Pegs (customizable size, invisible or deleted)
      if (pegSizeScale > 0) {
        pegsRef.current.forEach(peg => {
          const effectiveRadius = peg.radius * pegSizeScale;
          if (effectiveRadius <= 0.05) return; // Completely invisible / skipped

          ctx.save();
          if (pegSizeScale < 0.25) {
            ctx.globalAlpha = Math.max(0.1, pegSizeScale * 3);
          }
          ctx.beginPath();
          ctx.arc(peg.x, peg.y, effectiveRadius, 0, Math.PI * 2);

          if (peg.type === 'jackpot') {
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#fbbf24';
            ctx.shadowBlur = 12 * pegSizeScale;
          } else if (peg.type === 'bumper') {
            ctx.fillStyle = '#f43f5e';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 8 * pegSizeScale;
          } else {
            ctx.fillStyle = '#94a3b8';
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          if (effectiveRadius > 3) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          ctx.restore();
        });
      }

      // Draw Buckets at bottom
      const bucketY = height - 50;
      const bucketHeight = 50;

      bucketsRef.current.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color + '33'; // translucent background
        ctx.fillRect(b.x, bucketY, b.width, bucketHeight);

        ctx.strokeStyle = b.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, bucketY, b.width, bucketHeight);

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, b.x + b.width / 2, bucketY + 28);
        ctx.restore();
      });

      // Magnet Target: center of jackpot bucket
      const jackpotBucket = bucketsRef.current.find(b => b.multiplier >= 1000) || bucketsRef.current[3];
      const magnetTargetX = jackpotBucket ? jackpotBucket.x + jackpotBucket.width / 2 : width / 2;
      const magnetTargetY = bucketY + 20;

      // Process Coins
      const activeCoins = coinsRef.current.filter(c => c.active);

      activeCoins.forEach(coin => {
        // Apply Magnet Hack
        if (coinMagnetActive || (upgrades.magnetPower > 0 && Math.random() < 0.2)) {
          const dx = magnetTargetX - coin.x;
          const dy = magnetTargetY - coin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 5) {
            const pull = coinMagnetActive ? 0.8 : upgrades.magnetPower * 0.1;
            coin.vx += (dx / dist) * pull;
            coin.vy += (dy / dist) * pull;
          }
        } else if (jackpotLuckLock) {
          // Force coin towards jackpot bucket
          const dx = magnetTargetX - coin.x;
          coin.vx += (dx > 0 ? 0.4 : -0.4);
        }

        // Apply Gravity
        coin.vy += gravitySetting;

        // Apply velocity caps
        coin.vx = Math.max(-15, Math.min(15, coin.vx));
        coin.vy = Math.max(-15, Math.min(25, coin.vy));

        // Move coin
        coin.x += coin.vx;
        coin.y += coin.vy;
        coin.rotation += coin.vRot;

        // Wall collisions
        if (coin.x - coin.radius < 0) {
          coin.x = coin.radius;
          coin.vx = -coin.vx * 0.7 * upgrades.bounceFactor;
        } else if (coin.x + coin.radius > width) {
          coin.x = width - coin.radius;
          coin.vx = -coin.vx * 0.7 * upgrades.bounceFactor;
        }

        // Peg Collisions (only if pegs are not deleted)
        if (pegSizeScale > 0) {
          pegsRef.current.forEach(peg => {
            const effectivePegRadius = peg.radius * pegSizeScale;
            if (effectivePegRadius <= 0.1) return; // Micro/invisible dots do not block physics

            const dx = coin.x - peg.x;
            const dy = coin.y - peg.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = coin.radius + effectivePegRadius;

            if (dist < minDist) {
              // Collision normal
              const nx = dx / (dist || 1);
              const ny = dy / (dist || 1);

              // Separate
              coin.x = peg.x + nx * minDist;
              coin.y = peg.y + ny * minDist;

              // Bounce velocity
              const dot = coin.vx * nx + coin.vy * ny;
              coin.vx = (coin.vx - 2 * dot * nx) * 0.8 * upgrades.bounceFactor;
              coin.vy = (coin.vy - 2 * dot * ny) * 0.8 * upgrades.bounceFactor;

              // Add peg multiplier bonus
              coin.multiplier *= peg.multiplierBonus;
              coin.bounces += 1;

              if (soundEnabled && Math.random() < 0.3) {
                playTickSound(soundEnabled);
              }

              // Coin Duplication Hack
              if (coinDuplicationMode && coin.splitCount < 3 && activeCoins.length < 200) {
                coin.splitCount += 1;
                const newCoin: Coin = {
                  ...coin,
                  id: Date.now() + Math.random(),
                  vx: -coin.vx + (Math.random() - 0.5) * 4,
                  vy: coin.vy + Math.random() * 2,
                };
                coinsRef.current.push(newCoin);
              }
            }
          });
        }

        // Bottom Bucket Collision Evaluation
        if (coin.y + coin.radius >= bucketY) {
          coin.active = false;

          // Find landing bucket
          const bucket = bucketsRef.current.find(b => coin.x >= b.x && coin.x < b.x + b.width) || bucketsRef.current[3];

          const winMult = bucket.multiplier * coin.multiplier;
          const winAmount = Math.floor(coin.baseValue * winMult);

          bucket.hits += 1;

          // Update cheat balance directly
          onUpdateBalance(cheatBalance + winAmount);

          setGameStats(prev => ({
            ...prev,
            totalCoinsInBuckets: prev.totalCoinsInBuckets + 1,
            totalEarnings: prev.totalEarnings + winAmount,
            highestMultiplier: Math.max(prev.highestMultiplier, winMult),
            jackpotsHit: bucket.multiplier >= 1000 ? prev.jackpotsHit + 1 : prev.jackpotsHit,
          }));

          if (bucket.multiplier >= 1000 && soundEnabled) {
            playJackpotSound(soundEnabled);
          } else if (soundEnabled) {
            playCoinSound(soundEnabled);
          }

          addLog(`[COIN LANDED] ${coin.type.toUpperCase()} coin dropped into ${bucket.label} (${winMult.toLocaleString()}x multiplier). Won $${winAmount.toLocaleString()}!`, winMult >= 1000 ? 'success' : 'info');
        }

        // Render Coin
        ctx.save();
        ctx.translate(coin.x, coin.y);
        ctx.rotate(coin.rotation);

        // Coin Outer Shadow / Glow
        ctx.shadowColor = coin.color;
        ctx.shadowBlur = coin.type === 'admin' ? 15 : coin.type === 'quantum' ? 10 : 4;

        // Coin Body
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fillStyle = coin.color;
        ctx.fill();

        // Inner rim
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Icon / Symbol inside
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.floor(coin.radius * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbol = coin.type === 'admin' ? '👑' : coin.type === 'quantum' ? '⚛️' : coin.type === 'diamond' ? '💎' : '🪙';
        ctx.fillText(symbol, 0, 0);

        ctx.restore();
      });

      // Keep array small
      if (coinsRef.current.length > 300) {
        coinsRef.current = coinsRef.current.filter(c => c.active);
      }

      animationFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    animationFrameRef.current = requestAnimationFrame(updatePhysics);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cheatBalance, onUpdateBalance, soundEnabled, gravitySetting, coinMagnetActive, riggedBucketMode, coinDuplicationMode, jackpotLuckLock, godModeMultiplier, upgrades, launchAngle, launchPower]);

  // Execute Luau Script Action
  const handleExecuteLua = () => {
    addLog(`[EXEC] Running Luau script payload...`, 'exec');
    setTimeout(() => {
      // Perform simulated script OP effects
      setGodModeMultiplier(99999);
      setCoinMagnetActive(true);
      setRiggedBucketMode(true);
      setJackpotLuckLock(true);
      onUpdateBalance(cheatBalance + 100000000000);
      addLog(`[SUCCESS] OP Script injected! Multiplier set to 99,999x, Universal Magnet engaged, +$100,000,000,000 added!`, 'success');
    }, 400);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-2xl space-y-4">
      {/* Top Header: Roblox Linked Game Bar */}
      <div className="bg-gradient-to-r from-red-900/60 via-purple-900/60 to-slate-900 border border-red-500/30 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md text-xl animate-pulse">
            🎮
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wide text-white">ROBLOX "Throw a Coin"</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LINKED LIVE (Place ID: 115681808123944)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Synapse/Wave Executor Hook Active • Server ID: <code className="text-yellow-400">rbx-us-east-9912</code> • Ping: <span className="text-emerald-400">14ms</span>
            </p>
          </div>
        </div>

        {/* Global Wallet Sync */}
        <div className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-4 py-2 flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Synced Cheat Balance</span>
          <span className="font-mono text-xl font-extrabold text-emerald-400">
            ${cheatBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-2">
        <div className="flex space-x-2">
          {[
            { id: 'game', label: '🪙 Toss Coin Arena', icon: '🎯' },
            { id: 'admin', label: '⚡ OP Admin Panel', icon: '👑' },
            { id: 'upgrades', label: '🚀 Coin Upgrades', icon: '⚡' },
            { id: 'script', label: '💻 Luau Script Executor', icon: '📜' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-all ${
                activeSubTab === tab.id
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/30 ring-1 ring-amber-400/50'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Rapid Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onUpdateBalance(cheatBalance + 1000000000)}
            className="bg-emerald-600/80 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-emerald-400/30 flex items-center space-x-1 transition-all"
          >
            <span>💸</span>
            <span>Inject +$1B</span>
          </button>
          <button
            onClick={() => triggerMultiThrow(50)}
            className="bg-purple-600/80 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-purple-400/30 flex items-center space-x-1 transition-all"
          >
            <span>💣</span>
            <span>Nuke 50 Coins</span>
          </button>
        </div>
      </div>

      {/* SUB TAB 1: INTERACTIVE GAME ARENA */}
      {activeSubTab === 'game' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Canvas Physics Area */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={560}
              height={500}
              className="rounded-lg shadow-inner border border-slate-800/80 max-w-full cursor-crosshair"
              onClick={(e) => {
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                  const clickX = e.clientX - rect.left;
                  const centerX = rect.width / 2;
                  const dx = clickX - centerX;
                  const angle = (dx / (rect.width / 2)) * 45;
                  setLaunchAngle(Math.max(-45, Math.min(45, angle)));
                  spawnCoin();
                }
              }}
            />

            <div className="absolute top-5 right-5 bg-slate-900/90 border border-slate-700/80 rounded-lg p-2 text-right text-xs space-y-0.5 backdrop-blur-sm">
              <p className="text-slate-400 font-semibold">Coins Thrown: <span className="text-white">{gameStats.totalCoinsThrown.toLocaleString()}</span></p>
              <p className="text-slate-400 font-semibold">Total Won: <span className="text-emerald-400">${gameStats.totalEarnings.toLocaleString()}</span></p>
              <p className="text-slate-400 font-semibold">Max Mult: <span className="text-yellow-400">{gameStats.highestMultiplier.toLocaleString()}x</span></p>
            </div>
          </div>

          {/* Launcher & Controls Side Bar */}
          <div className="space-y-4">
            {/* Coin Type Selection */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Select Coin Type</span>
                <span className="text-yellow-400 text-[10px]">Higher Cost = Bigger Multipliers</span>
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'bronze', label: '🪙 Bronze Coin', cost: '$10', value: '$20 base', color: 'border-amber-700' },
                  { id: 'gold', label: '🟡 Solid Gold Coin', cost: '$1,000', value: '$2,500 base', color: 'border-yellow-500' },
                  { id: 'diamond', label: '💎 Diamond Star Coin', cost: '$50,000', value: '$150,000 base', color: 'border-sky-400' },
                  { id: 'quantum', label: '⚛️ Quantum Antimatter', cost: '$1,000,000', value: '$5,000,000 base', color: 'border-purple-500' },
                  { id: 'admin', label: '👑 Admin Infinite Coin', cost: 'FREE (OP)', value: '$1,000,000,000 base', color: 'border-rose-500' },
                ].map(coin => (
                  <button
                    key={coin.id}
                    onClick={() => setSelectedCoinType(coin.id as any)}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      selectedCoinType === coin.id
                        ? `${coin.color} bg-slate-700/80 ring-1 ring-white/30`
                        : 'border-slate-700 bg-slate-900/60 hover:bg-slate-800/60'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-xs text-white">{coin.label}</p>
                      <p className="text-[10px] text-slate-400">{coin.value}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{coin.cost}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trajectory & Power */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5 space-y-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Launch Trajectory & Power
              </h3>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Aim Angle ({launchAngle}°)</span>
                  <button onClick={() => setLaunchAngle(0)} className="text-sky-400 hover:underline text-[10px]">Center</button>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={launchAngle}
                  onChange={e => setLaunchAngle(parseFloat(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                  <span>Power ({launchPower} Velocity)</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  value={launchPower}
                  onChange={e => setLaunchPower(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Peg Dots Size Customizer Slider */}
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60 space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-white">
                  <span className="flex items-center space-x-1">
                    <span>⚪</span>
                    <span>Peg Dots Customizer</span>
                  </span>
                  <span className="font-mono text-amber-400 font-bold">
                    {pegSizeScale === 0 ? '❌ DELETED' : pegSizeScale <= 0.1 ? '👻 INVISIBLE' : `${pegSizeScale.toFixed(1)}x Size`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={pegSizeScale}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setPegSizeScale(val);
                    addLog(`[CONFIG] Peg dots scale set to ${val === 0 ? 'DELETED' : val <= 0.1 ? 'INVISIBLE' : val + 'x'}`, 'info');
                  }}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>0 (Deleted)</span>
                  <span>0.1 (Invisible)</span>
                  <span>1.0 (Normal)</span>
                  <span>3.0 (Giant)</span>
                </div>
              </div>

              {/* Toss Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => spawnCoin()}
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm py-2.5 rounded-lg shadow-lg shadow-red-600/30 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <span>🪙</span>
                  <span>Toss Coin</span>
                </button>

                <button
                  onClick={() => setIsAutoThrow(!isAutoThrow)}
                  className={`font-extrabold text-xs py-2.5 rounded-lg border flex items-center justify-center space-x-1 transition-all ${
                    isAutoThrow
                      ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>⚡</span>
                  <span>{isAutoThrow ? 'Stop Auto' : 'Auto Thrower'}</span>
                </button>
              </div>

              {isAutoThrow && (
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1">
                    <span>Auto Speed: {autoThrowSpeed} Coins/sec</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={autoThrowSpeed}
                    onChange={e => setAutoThrowSpeed(parseInt(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: SUPER OP ADMIN PANEL */}
      {activeSubTab === 'admin' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-950/80 via-purple-950/80 to-slate-900 border border-red-500/40 rounded-xl p-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">👑</div>
              <div>
                <h3 className="text-lg font-extrabold text-red-400 tracking-wide">SUPER OP ADMIN GOD-MODE CHEAT ENGINE</h3>
                <p className="text-xs text-slate-300">Bypass server physics, force max luck, manipulate multipliers, and generate unlimited cash.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Cheat 1: Universal Coin Magnet */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">🧲 Universal Coin Magnet</p>
                  <p className="text-[10px] text-slate-400">Pulls all falling coins directly into 1000x Jackpot</p>
                </div>
                <button
                  onClick={() => {
                    setCoinMagnetActive(!coinMagnetActive);
                    addLog(`[ADMIN] Universal Magnet set to ${!coinMagnetActive}`, 'exec');
                  }}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    coinMagnetActive ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {coinMagnetActive ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Cheat 2: Rigged 100,000x Buckets */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">🎯 Rigged 100Kx Multipliers</p>
                  <p className="text-[10px] text-slate-400">Turns all bottom buckets into 100,000x payouts</p>
                </div>
                <button
                  onClick={() => {
                    setRiggedBucketMode(!riggedBucketMode);
                    addLog(`[ADMIN] Rigged Buckets set to ${!riggedBucketMode}`, 'exec');
                  }}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    riggedBucketMode ? 'bg-pink-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {riggedBucketMode ? 'RIGGED' : 'NORMAL'}
                </button>
              </div>

              {/* Cheat 3: Zero Gravity Hack */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">🌌 Zero Gravity Field</p>
                  <p className="text-[10px] text-slate-400">Coins float and bounce off pegs infinitely</p>
                </div>
                <button
                  onClick={() => {
                    const newG = gravitySetting === 0.02 ? 0.35 : 0.02;
                    setGravitySetting(newG);
                    addLog(`[ADMIN] Gravity set to ${newG}`, 'exec');
                  }}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    gravitySetting === 0.02 ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {gravitySetting === 0.02 ? 'ZERO G' : 'NORMAL G'}
                </button>
              </div>

              {/* Cheat 4: Coin Duplication Matrix */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">🧬 Coin Duplication Matrix</p>
                  <p className="text-[10px] text-slate-400">Every peg bounce duplicates the coin</p>
                </div>
                <button
                  onClick={() => {
                    setCoinDuplicationMode(!coinDuplicationMode);
                    addLog(`[ADMIN] Coin Duplicator set to ${!coinDuplicationMode}`, 'exec');
                  }}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    coinDuplicationMode ? 'bg-cyan-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {coinDuplicationMode ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              {/* Cheat 5: 100% Guaranteed Jackpot Lock */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">🔮 100% Guaranteed Jackpot Lock</p>
                  <p className="text-[10px] text-slate-400">Forces every toss to hit the highest jackpot</p>
                </div>
                <button
                  onClick={() => {
                    setJackpotLuckLock(!jackpotLuckLock);
                    addLog(`[ADMIN] Jackpot Luck Lock set to ${!jackpotLuckLock}`, 'exec');
                  }}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    jackpotLuckLock ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {jackpotLuckLock ? 'LOCKED 100%' : 'OFF'}
                </button>
              </div>

              {/* Cheat 6: Multiplier Override slider */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>⚡ Global Multiplier Boost</span>
                  <span className="text-yellow-400">{godModeMultiplier.toLocaleString()}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10000"
                  value={godModeMultiplier}
                  onChange={e => setGodModeMultiplier(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Instant Infinite Cash Injection Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                Instant Server Cash Injections
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: '+$1,000,000', amount: 1000000 },
                  { label: '+$100,000,000', amount: 100000000 },
                  { label: '+$10,000,000,000', amount: 10000000000 },
                  { label: '+$1,000,000,000,000', amount: 1000000000000 },
                ].map(item => (
                  <button
                    key={item.amount}
                    onClick={() => {
                      onUpdateBalance(cheatBalance + item.amount);
                      addLog(`[ADMIN] Injected $${item.amount.toLocaleString()} into Cheat Balance!`, 'success');
                    }}
                    className="bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs py-2 rounded-lg transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: COIN UPGRADES */}
      {activeSubTab === 'upgrades' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              id: 'coinSize',
              name: '👑 Giant Coin Radius',
              desc: 'Increases coin hit-box size to trigger multiple peg bounce multipliers simultaneously.',
              level: upgrades.coinSize,
              cost: Math.floor(100000 * upgrades.coinSize),
              max: 5,
              onUpgrade: () => setUpgrades(p => ({ ...p, coinSize: p.coinSize + 0.5 }))
            },
            {
              id: 'bounceFactor',
              name: '⚡ Bouncy Super-Elasticity',
              desc: 'Coins bounce higher and retain velocity across the entire peg grid.',
              level: upgrades.bounceFactor,
              cost: Math.floor(250000 * upgrades.bounceFactor),
              max: 5,
              onUpgrade: () => setUpgrades(p => ({ ...p, bounceFactor: p.bounceFactor + 0.4 }))
            },
            {
              id: 'luckBoost',
              name: '🔮 Multiplier Luck Factor',
              desc: 'Passively inflates winning multipliers by up to +10x per level.',
              level: upgrades.luckBoost,
              cost: Math.floor(500000 * upgrades.luckBoost),
              max: 10,
              onUpgrade: () => setUpgrades(p => ({ ...p, luckBoost: p.luckBoost + 2 }))
            },
            {
              id: 'magnetPower',
              name: '🧲 Magnetic Attraction',
              desc: 'Gently pulls all dropped coins towards the central jackpot bucket.',
              level: upgrades.magnetPower,
              cost: Math.floor(1000000 * (upgrades.magnetPower + 1)),
              max: 5,
              onUpgrade: () => setUpgrades(p => ({ ...p, magnetPower: p.magnetPower + 1 }))
            },
          ].map(upg => (
            <div key={upg.id} className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-white">{upg.name}</h4>
                <span className="text-xs bg-slate-900 text-yellow-400 font-mono px-2 py-0.5 rounded border border-slate-700">
                  LVL {upg.level} / {upg.max}
                </span>
              </div>
              <p className="text-xs text-slate-300">{upg.desc}</p>
              <button
                disabled={upg.level >= upg.max || cheatBalance < upg.cost}
                onClick={() => {
                  if (cheatBalance >= upg.cost) {
                    onUpdateBalance(cheatBalance - upg.cost);
                    upg.onUpgrade();
                    addLog(`[UPGRADE] Purchased ${upg.name} for $${upg.cost.toLocaleString()}`, 'success');
                  }
                }}
                className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1.5 transition-all ${
                  upg.level >= upg.max
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : cheatBalance >= upg.cost
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 shadow-md'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <span>{upg.level >= upg.max ? 'MAXED OUT' : `Upgrade ($${upg.cost.toLocaleString()})`}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SUB TAB 4: LUAU SCRIPT EXECUTOR & CONSOLE */}
      {activeSubTab === 'script' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Script Editor */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-sky-400 flex items-center space-x-1">
                <span>💻</span>
                <span>Luau Script Payload Editor</span>
              </span>
              <button
                onClick={handleExecuteLua}
                className="bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs px-3 py-1.5 rounded-lg shadow-lg shadow-red-600/30 flex items-center space-x-1 transition-all"
              >
                <span>▶ Execute Payload</span>
              </button>
            </div>

            <textarea
              value={luaCode}
              onChange={e => setLuaCode(e.target.value)}
              rows={12}
              className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          {/* Console Output Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-xs font-bold text-amber-400 flex items-center space-x-1">
                <span>📟</span>
                <span>Roblox Server Telemetry & Event Log</span>
              </span>
              <button
                onClick={() => setConsoleLogs([])}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Clear Log
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 h-64 overflow-y-auto font-mono text-[11px] space-y-1">
              {consoleLogs.map(log => (
                <div
                  key={log.id}
                  className={`${
                    log.type === 'warn'
                      ? 'text-yellow-400'
                      : log.type === 'success'
                      ? 'text-emerald-400'
                      : log.type === 'exec'
                      ? 'text-sky-400 font-bold'
                      : 'text-slate-300'
                  }`}
                >
                  {log.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
