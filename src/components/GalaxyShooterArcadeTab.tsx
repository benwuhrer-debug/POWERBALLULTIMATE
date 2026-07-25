import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface GalaxyShooterArcadeTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  isEnemy?: boolean;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  type: 'scout' | 'interceptor' | 'boss';
  color: string;
  isAlly?: boolean;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
}

export const GalaxyShooterArcadeTab: React.FC<GalaxyShooterArcadeTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
}) => {
  const [selectedArcadeGame, setSelectedArcadeGame] = useState<'galaxy_shooter' | 'brick_breaker' | 'flappy_ship'>('galaxy_shooter');

  // ==========================================
  // GALAXY SHOOTER GAME STATE
  // ==========================================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlayingShooter, setIsPlayingShooter] = useState<boolean>(false);
  const [shooterScore, setShooterScore] = useState<number>(0);
  const [shooterHighscore, setShooterHighscore] = useState<number>(145000);
  const [shooterWave, setShooterWave] = useState<number>(1);
  const [shooterLives, setShooterLives] = useState<number>(3);
  const [shooterCreditsEarned, setShooterCreditsEarned] = useState<number>(0);

  // Galaxy Shooter Admin Cheats
  const [godMode, setGodMode] = useState<boolean>(true);
  const [rapidFire, setRapidFire] = useState<boolean>(true);
  const [tripleLaser, setTripleLaser] = useState<boolean>(true);
  const [spread100x, setSpread100x] = useState<boolean>(true);
  const [infiniteDamage, setInfiniteDamage] = useState<boolean>(true);
  const [homingAim, setHomingAim] = useState<boolean>(true);
  const [speed10x, setSpeed10x] = useState<boolean>(true);
  const [blackHoleVortex, setBlackHoleVortex] = useState<boolean>(true);
  const [orbitDrones, setOrbitDrones] = useState<boolean>(true);
  const [freezeAliens, setFreezeAliens] = useState<boolean>(false);
  const [trillionMultiplier, setTrillionMultiplier] = useState<boolean>(true);
  const [cashMultiplier, setCashMultiplier] = useState<number>(100);

  // Mega OP Cheats State
  const [quantumLaserActive, setQuantumLaserActive] = useState<boolean>(true);
  const [antimatterShield, setAntimatterShield] = useState<boolean>(true);
  const [timeFreeze, setTimeFreeze] = useState<boolean>(false);
  const [autoPilotGodBot, setAutoPilotGodBot] = useState<boolean>(true);
  const [level1000Mode, setLevel1000Mode] = useState<boolean>(true);
  const [mindControlAllEnemies, setMindControlAllEnemies] = useState<boolean>(false);
  const [vipPassOwned, setVipPassOwned] = useState<boolean>(true);
  const [extraVIPPassOwned, setExtraVIPPassOwned] = useState<boolean>(true);
  const [activeAdminTab, setActiveAdminTab] = useState<'warps' | 'weapons' | 'cash' | 'shields' | 'fleet' | 'cosmic'>('warps');

  // Dedicated Combat Log State
  const [combatLogs, setCombatLogs] = useState<Array<{ id: string; time: string; text: string; type: 'mind_control' | 'boss_damage' | 'boss_spawn' | 'boss_defeat' | 'system' }>>([
    { id: '1', time: new Date().toLocaleTimeString(), text: '🎮 Galaxy Shooter Combat Log & Overlord Telemetry system initialized.', type: 'system' },
    { id: '2', time: new Date().toLocaleTimeString(), text: '🛰️ Ready for One Button To Rule Them All deployment.', type: 'system' }
  ]);

  const addCombatLog = useCallback((text: string, type: 'mind_control' | 'boss_damage' | 'boss_spawn' | 'boss_defeat' | 'system' = 'system') => {
    const time = new Date().toLocaleTimeString();
    const id = Math.random().toString();
    setCombatLogs(prev => [{ id, time, text, type }, ...prev].slice(0, 100));
  }, []);

  const addCombatLogRef = useRef(addCombatLog);
  useEffect(() => {
    addCombatLogRef.current = addCombatLog;
  }, [addCombatLog]);

  // Refs for shooter loop
  const gameStateRef = useRef({
    playerX: 300,
    playerY: 450,
    playerSpeed: 6,
    isFiring: false,
    keys: { ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, KeyA: false, KeyD: false, KeyW: false, KeyS: false, Space: false },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    stars: [] as Star[],
    lastFireTime: 0,
    bossSpawned: false,
    score: 0,
    lives: 3,
    wave: 1,
    credits: 0,
  });

  // Init Stars background
  useEffect(() => {
    const starsArr: Star[] = [];
    for (let i = 0; i < 80; i++) {
      starsArr.push({
        x: Math.random() * 600,
        y: Math.random() * 500,
        speed: 0.5 + Math.random() * 2,
        size: Math.random() * 2,
      });
    }
    gameStateRef.current.stars = starsArr;
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space'].includes(e.code)) {
        if (gameStateRef.current.keys.hasOwnProperty(e.code)) {
          (gameStateRef.current.keys as any)[e.code] = true;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space'].includes(e.code)) {
        if (gameStateRef.current.keys.hasOwnProperty(e.code)) {
          (gameStateRef.current.keys as any)[e.code] = false;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Canvas Game Loop for Galaxy Shooter
  useEffect(() => {
    if (!isPlayingShooter) return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Spawn initial enemy wave
    if (gameStateRef.current.enemies.length === 0) {
      spawnEnemyWave(gameStateRef.current.wave);
    }

    const render = () => {
      const state = gameStateRef.current;
      ctx.fillStyle = '#030712'; // dark galaxy canvas
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Render Stars
      ctx.fillStyle = '#ffffff';
      state.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      // 2. Handle Player Movement
      const k = state.keys;
      const effectiveSpeed = speed10x ? 18 : state.playerSpeed;
      if (k.ArrowLeft || k.KeyA) state.playerX = Math.max(20, state.playerX - effectiveSpeed);
      if (k.ArrowRight || k.KeyD) state.playerX = Math.min(canvas.width - 20, state.playerX + effectiveSpeed);
      if (k.ArrowUp || k.KeyW) state.playerY = Math.max(50, state.playerY - effectiveSpeed);
      if (k.ArrowDown || k.KeyS) state.playerY = Math.min(canvas.height - 30, state.playerY + effectiveSpeed);

      // 3. Firing Lasers
      const now = Date.now();
      const fireInterval = rapidFire ? 60 : 200;
      if ((k.Space || state.isFiring) && now - state.lastFireTime > fireInterval) {
        state.lastFireTime = now;
        if (spread100x) {
          // 100x Spread Cannon Nova Blast
          const bulletCount = 30;
          for (let i = 0; i < bulletCount; i++) {
            const angle = -Math.PI / 6 - (i / (bulletCount - 1)) * (Math.PI * 2 / 3);
            const speed = 14;
            state.bullets.push({
              x: state.playerX,
              y: state.playerY - 20,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: i % 2 === 0 ? '#f43f5e' : '#a855f7',
            });
          }
        } else if (tripleLaser) {
          state.bullets.push(
            { x: state.playerX, y: state.playerY - 20, vx: 0, vy: -12, color: '#06b6d4' },
            { x: state.playerX - 12, y: state.playerY - 15, vx: -3, vy: -11, color: '#3b82f6' },
            { x: state.playerX + 12, y: state.playerY - 15, vx: 3, vy: -11, color: '#3b82f6' }
          );
        } else {
          state.bullets.push({ x: state.playerX, y: state.playerY - 20, vx: 0, vy: -12, color: '#06b6d4' });
        }
        if (soundEnabled) playTickSound(soundEnabled);
      }

      // Black Hole Singularity Gravity Vortex
      if (blackHoleVortex) {
        ctx.save();
        ctx.translate(300, 200);
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 55 + Math.sin(now / 100) * 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(0, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Orbiting Drones around Player
      if (orbitDrones) {
        for (let i = 0; i < 4; i++) {
          const droneAngle = (now / 400) + (i * Math.PI / 2);
          const droneX = state.playerX + Math.cos(droneAngle) * 50;
          const droneY = state.playerY + Math.sin(droneAngle) * 50;

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(droneX, droneY, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#818cf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(droneX, droneY);
          ctx.lineTo(droneX, droneY - 15);
          ctx.stroke();
        }
      }

      // 4. Draw Player Ship
      ctx.save();
      ctx.translate(state.playerX, state.playerY);
      // Ship Body
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(-18, 16);
      ctx.lineTo(-8, 10);
      ctx.lineTo(0, 16);
      ctx.lineTo(8, 10);
      ctx.lineTo(18, 16);
      ctx.closePath();
      ctx.fill();

      // Wing glow
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-14, 2, 4, 10);
      ctx.fillRect(10, 2, 4, 10);

      // Thruster flame
      ctx.fillStyle = godMode ? '#f59e0b' : '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-6, 16);
      ctx.lineTo(0, 26 + Math.random() * 6);
      ctx.lineTo(6, 16);
      ctx.fill();

      // Shield Ring if God Mode
      if (godMode) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Move & Render Bullets
      state.bullets.forEach((b, bIdx) => {
        // Homing Laser Aim
        if (homingAim && state.enemies.length > 0) {
          const target = state.enemies.find(e => !e.isAlly && e.type === 'boss') || state.enemies.find(e => !e.isAlly) || state.enemies[0];
          if (target) {
            const angle = Math.atan2(target.y - b.y, target.x - b.x);
            b.vx = Math.cos(angle) * 14;
            b.vy = Math.sin(angle) * 14;
          }
        }

        b.x += b.vx;
        b.y += b.vy;

        ctx.fillStyle = b.color;
        ctx.fillRect(b.x - 2, b.y - 6, 4, 12);

        // Remove out-of-bounds bullets
        if (b.y < -10 || b.y > canvas.height + 10 || b.x < -10 || b.x > canvas.width + 10) {
          state.bullets.splice(bIdx, 1);
        }
      });

      // 6. Move & Render Enemies & Allies
      const currentBoss = state.enemies.find(e => e.type === 'boss' && !e.isAlly);

      state.enemies.forEach((enemy, eIdx) => {
        // Ally logic vs hostile enemy logic
        const isAllyUnit = enemy.isAlly || (mindControlAllEnemies && enemy.type !== 'boss');

        if (isAllyUnit) {
          // Ally ships hover in formation & fire auto-lasers towards enemy boss
          if (now % 8 === 0) {
            let bulletVx = (Math.random() - 0.5) * 4;
            let bulletVy = -14;
            if (currentBoss) {
              const angle = Math.atan2(currentBoss.y - enemy.y, currentBoss.x - enemy.x);
              bulletVx = Math.cos(angle) * 14;
              bulletVy = Math.sin(angle) * 14;
            }
            state.bullets.push({
              x: enemy.x,
              y: enemy.y - 15,
              vx: bulletVx,
              vy: bulletVy,
              color: '#38bdf8',
            });
          }
        } else {
          if (!freezeAliens) {
            enemy.y += enemy.speed;
          }

          // Pull hostile enemies towards Black Hole Singularity
          if (blackHoleVortex) {
            const bhX = 300;
            const bhY = 200;
            const dx = bhX - enemy.x;
            const dy = bhY - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            enemy.x += (dx / dist) * 4;
            enemy.y += (dy / dist) * 4;

            if (dist < 45) {
              enemy.hp = 0; // Sucked into singularity
            }
          }

          if (enemy.y > canvas.height + 30) {
            enemy.y = -30;
            enemy.x = Math.random() * (canvas.width - 60) + 30;
          }
        }

        // Draw Enemy / Ally
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.fillStyle = isAllyUnit ? '#38bdf8' : enemy.color;

        if (enemy.type === 'boss') {
          // Dreadnought Boss Shape
          ctx.fillRect(-35, -25, 70, 50);
          ctx.fillStyle = isAllyUnit ? '#0ea5e9' : '#ef4444';
          ctx.fillRect(-25, 10, 50, 10);

          // Boss Health Bar on top of unit
          ctx.fillStyle = '#374151';
          ctx.fillRect(-35, -35, 70, 6);
          ctx.fillStyle = isAllyUnit ? '#38bdf8' : '#22c55e';
          ctx.fillRect(-35, -35, Math.max(0, (enemy.hp / enemy.maxHp)) * 70, 6);
        } else {
          // Standard Scout/Interceptor Shape
          ctx.beginPath();
          ctx.moveTo(0, isAllyUnit ? -18 : 18);
          ctx.lineTo(-14, isAllyUnit ? 14 : -14);
          ctx.lineTo(14, isAllyUnit ? 14 : -14);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Check Bullet Collisions with Hostile Enemy
        if (!isAllyUnit) {
          state.bullets.forEach((b, bIdx) => {
            if (!b.isEnemy) {
              const dx = b.x - enemy.x;
              const dy = b.y - enemy.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const hitRadius = enemy.type === 'boss' ? 50 : 20;

              if (dist < hitRadius) {
                const dmgApplied = infiniteDamage ? 9999999999999 : 100;
                enemy.hp -= dmgApplied;
                state.bullets.splice(bIdx, 1);

                if (enemy.type === 'boss' && now % 15 === 0) {
                  addCombatLogRef.current(
                    `⚔️ BOSS HIT: Sovereign Lasers dealt ${dmgApplied.toLocaleString()} DMG! Boss Remaining HP: ${Math.max(0, enemy.hp).toLocaleString()}`,
                    'boss_damage'
                  );
                }
              }
            }
          });
        }

        // Destroy Enemy check
        if (enemy.hp <= 0) {
          state.enemies.splice(eIdx, 1);
          const points = enemy.type === 'boss' ? 500000 : 250;
          const currentMultiplier = trillionMultiplier ? 1000000000000 : cashMultiplier;
          const creditGain = points * currentMultiplier;
          state.score += points;
          state.credits += creditGain;

          if (enemy.type === 'boss') {
            addCombatLogRef.current(
              `💥 OMEGA BOSS OBLITERATED! Earned +500,000 Points & Quadrillions in Credits!`,
              'boss_defeat'
            );
          }

          setShooterScore(state.score);
          setShooterCreditsEarned(prev => prev + creditGain);
          onUpdateBalance(prev => prev + creditGain);

          if (soundEnabled) playCoinSound(soundEnabled);

          // Wave clear check
          if (state.enemies.length === 0) {
            state.wave += 1;
            setShooterWave(state.wave);
            spawnEnemyWave(state.wave);
          }
        }

        // Player Collision with Hostile Enemy
        if (!godMode && !isAllyUnit) {
          const pdx = state.playerX - enemy.x;
          const pdy = state.playerY - enemy.y;
          if (Math.sqrt(pdx * pdx + pdy * pdy) < 25) {
            state.lives -= 1;
            setShooterLives(state.lives);
            state.enemies.splice(eIdx, 1);
            if (state.lives <= 0) {
              setIsPlayingShooter(false);
            }
          }
        }
      });

      // Top HUD Overlay for Mega Boss Health & Status
      if (currentBoss) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.fillRect(10, 10, canvas.width - 20, 26);
        ctx.strokeRect(10, 10, canvas.width - 20, 26);

        ctx.fillStyle = '#dc2626';
        const hpPct = Math.max(0, currentBoss.hp / currentBoss.maxHp);
        ctx.fillRect(12, 12, (canvas.width - 24) * hpPct, 22);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          '👹 OMEGA BOSS HP: 99999999999999999999999999999999999999999999999999999999999900000000000000000000000000000000000000000000000000000',
          canvas.width / 2,
          27
        );
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlayingShooter, godMode, rapidFire, tripleLaser, spread100x, infiniteDamage, homingAim, speed10x, blackHoleVortex, orbitDrones, freezeAliens, trillionMultiplier, cashMultiplier, mindControlAllEnemies, soundEnabled]);

  const spawnEnemyWave = (waveNum: number) => {
    const enemiesArr: Enemy[] = [];
    const count = 5 + waveNum * 3;

    for (let i = 0; i < count; i++) {
      enemiesArr.push({
        id: Math.random(),
        x: Math.random() * 540 + 30,
        y: -50 - Math.random() * 300,
        width: 30,
        height: 30,
        hp: 2 + Math.floor(waveNum / 2),
        maxHp: 2 + Math.floor(waveNum / 2),
        speed: 1.5 + Math.random() * 2 + waveNum * 0.2,
        type: Math.random() > 0.7 ? 'interceptor' : 'scout',
        color: Math.random() > 0.5 ? '#f43f5e' : '#a855f7',
      });
    }

    // Boss every 3 waves
    if (waveNum % 3 === 0) {
      enemiesArr.push({
        id: 9999,
        x: 300,
        y: -100,
        width: 80,
        height: 60,
        hp: 50 * waveNum,
        maxHp: 50 * waveNum,
        speed: 1,
        type: 'boss',
        color: '#eab308',
      });
    }

    gameStateRef.current.enemies = enemiesArr;
  };

  const handleStartShooterGame = () => {
    gameStateRef.current.score = 0;
    gameStateRef.current.lives = 3;
    gameStateRef.current.wave = 1;
    gameStateRef.current.credits = 0;
    gameStateRef.current.playerX = 300;
    gameStateRef.current.playerY = 450;
    setShooterScore(0);
    setShooterLives(3);
    setShooterWave(1);
    setShooterCreditsEarned(0);
    spawnEnemyWave(1);
    setIsPlayingShooter(true);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // Admin Cheat Actions for Galaxy Shooter
  const handleNukeAllAliens = () => {
    const currentEnemies = gameStateRef.current.enemies.length;
    const bonus = currentEnemies * 1000 * cashMultiplier;
    gameStateRef.current.enemies = [];
    onUpdateBalance(prev => prev + bonus);
    if (soundEnabled) playJackpotSound(soundEnabled);
    gameStateRef.current.wave += 1;
    setShooterWave(gameStateRef.current.wave);
    spawnEnemyWave(gameStateRef.current.wave);
  };

  const handleSpawnBoss = () => {
    gameStateRef.current.enemies.push({
      id: Math.random(),
      x: 300,
      y: 80,
      width: 80,
      height: 60,
      hp: 100,
      maxHp: 100,
      speed: 1,
      type: 'boss',
      color: '#eab308',
    });
    if (soundEnabled) playTickSound(soundEnabled);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-mono">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 border-2 border-cyan-400 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-xl border border-cyan-200">
            👾
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                GALAXY SHOOTER & RETRO ARCADE ARENA
              </h2>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-black px-3 py-1 rounded-full border border-cyan-500/40 animate-pulse">
                FULL ARCADE CHEAT SUITE
              </span>
            </div>
            <p className="text-xs text-cyan-200/80 pt-1">
              Destroy alien fleets in Galaxy Shooter! Every score point converts directly to Cash in your wallet.
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-400 uppercase">HIGH SCORE RECORD</div>
          <div className="text-xl font-black text-cyan-300">145,000 PTS</div>
        </div>
      </div>

      {/* GAME SELECTION SWITCHER */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'galaxy_shooter', label: '🚀 Galaxy Shooter 1984', icon: '👾' },
          { id: 'brick_breaker', label: '🧱 Cyber Brick Breaker', icon: '🏓' },
          { id: 'flappy_ship', label: '🛸 Flappy Starfighter', icon: '🌌' },
        ].map(g => (
          <button
            key={g.id}
            onClick={() => {
              if (soundEnabled) playTickSound(soundEnabled);
              setSelectedArcadeGame(g.id as any);
            }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all ${
              selectedArcadeGame === g.id
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-xl ring-2 ring-cyan-400/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================== */}
      {/* GAME 1: GALAXY SHOOTER CANVAS */}
      {/* ========================================== */}
      {selectedArcadeGame === 'galaxy_shooter' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MAIN CANVAS DISPLAY */}
          <div className="lg:col-span-2 bg-slate-950 border-2 border-cyan-500/50 rounded-3xl p-4 shadow-2xl flex flex-col items-center justify-center space-y-4">
            
            {/* SCOREBAR HUD */}
            <div className="w-full max-w-[600px] bg-slate-900 border border-slate-800 p-3 rounded-2xl flex justify-between items-center text-xs font-mono">
              <div className="flex items-center space-x-4">
                <div>SCORE: <span className="text-cyan-300 font-bold text-sm">{shooterScore.toLocaleString()}</span></div>
                <div>WAVE: <span className="text-amber-300 font-bold">{shooterWave}</span></div>
                <div>LIVES: <span className="text-rose-400 font-bold">{godMode ? '♾️ (GOD)' : '❤️'.repeat(shooterLives)}</span></div>
              </div>
              <div className="text-emerald-400 font-bold">
                CASH EARNED: +${shooterCreditsEarned.toLocaleString()}
              </div>
            </div>

            {/* CANVAS STAGE */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl bg-slate-950">
              <canvas
                ref={canvasRef}
                width={600}
                height={500}
                className="block cursor-crosshair"
                onMouseDown={() => { gameStateRef.current.isFiring = true; }}
                onMouseUp={() => { gameStateRef.current.isFiring = false; }}
                onMouseMove={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (rect) {
                    gameStateRef.current.playerX = e.clientX - rect.left;
                    gameStateRef.current.playerY = e.clientY - rect.top;
                  }
                }}
              />

              {!isPlayingShooter && (
                <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="text-5xl animate-bounce">🚀</div>
                  <h3 className="font-extrabold text-xl text-white tracking-wider">GALAXY SHOOTER ARCADE</h3>
                  <p className="text-xs text-slate-300 max-w-md">
                    Use Mouse or WASD/Arrow keys + Space to pilot your starfighter! Destroy alien armadas and alien bosses for huge wallet cash rewards.
                  </p>
                  <button
                    onClick={handleStartShooterGame}
                    className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-2xl transition-all hover:scale-105"
                  >
                    ▶️ LAUNCH MISSION
                  </button>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center font-mono">
              🕹️ <span className="text-cyan-300 font-bold">CONTROLS:</span> Move Mouse or Arrow Keys / WASD • Hold Click or Spacebar to Fire Lasers
            </div>
          </div>

          {/* OP ADMIN CHEAT PANEL FOR GALAXY SHOOTER (100+ OP CONTROLS) */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-2 border-cyan-400 rounded-3xl p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-cyan-800/60 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">👑</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-widest">
                      MEGA OP ADMIN CHEAT CONSOLE
                    </h3>
                    <p className="text-[10px] text-cyan-200/80">100+ GOD-MODE OVERRIDES & INSTANT LEVEL 1000 WARPS</p>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg font-black animate-pulse shadow-lg">
                  LEVEL 1000 READY
                </span>
              </div>

              {/* VIP & EXTRATERRESTRIAL VIP PASSES CARD */}
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-amber-400 p-4 rounded-2xl shadow-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-purple-800/60 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl animate-spin">🛸</span>
                    <div>
                      <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        EXTREME OVERLORD PASS SHOP
                      </div>
                      <div className="text-[10px] text-purple-200">
                        UNLOCK UNLIMITED VIP GOD MODE, ALIEN ARMADAS & INFINITE CASH MULTIPLIERS
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {vipPassOwned && (
                      <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                        👑 VIP ACTIVE
                      </span>
                    )}
                    {extraVIPPassOwned && (
                      <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-purple-300 animate-pulse">
                        👽 EXTRA VIP ACTIVE
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* VIP PASS */}
                  <div className="bg-slate-950/80 border border-amber-400/80 p-3 rounded-xl flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-extrabold text-amber-300">👑 VIP PASS</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                          UNLIMITED PERKS
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1">
                        Unlocks Golden Sovereign Fighter, Infinite Shields, Homing Lasers & 1,000,000x Cash Multiplier.
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-amber-400 font-bold break-all">
                        COST: $999999999999999999999999999999999999999999999999
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setVipPassOwned(true);
                        setGodMode(true);
                        setInfiniteDamage(true);
                        setRapidFire(true);
                        setCashMultiplier(1000000);
                        onUpdateBalance(prev => prev + 999999999999999999999999999999999999999999999999);
                        addCombatLog('👑 VIP PASS UNLOCKED: Sovereign Fighter, Infinite Shield & 1,000,000x Cash Multiplier active!', 'system');
                        if (soundEnabled) playJackpotSound(soundEnabled);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-lg shadow-lg cursor-pointer transition-all border border-amber-200"
                    >
                      {vipPassOwned ? '👑 VIP PASS UNLOCKED (RE-ACTIVATE)' : '💳 BUY VIP PASS NOW'}
                    </button>
                  </div>

                  {/* EXTRATERRESTRIAL VIP PASS */}
                  <div className="bg-slate-950/80 border border-pink-500/80 p-3 rounded-xl flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-extrabold text-pink-300">👽 EXTRATERRESTRIAL VIP PASS</span>
                        <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded font-mono font-bold">
                          ULTIMATE OVERLORD
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1">
                        Converts ALL alien fleets into friendly bodyguards, spawns Omega Boss, grants Infinite Quantum Lasers & 100 Quadrillion Cash!
                      </p>
                      <div className="mt-2 text-[10px] font-mono text-pink-400 font-bold break-all">
                        COST: $999999999999999999999999999999999999999999999999999999999999999999999999999900000000000000000000000
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setExtraVIPPassOwned(true);
                        setMindControlAllEnemies(true);
                        setGodMode(true);
                        setSpread100x(true);
                        setInfiniteDamage(true);
                        setHomingAim(true);
                        setQuantumLaserActive(true);
                        setTrillionMultiplier(true);

                        // Convert existing enemies to allies
                        let convertedCount = 0;
                        gameStateRef.current.enemies.forEach(e => {
                          if (e.type !== 'boss') {
                            e.isAlly = true;
                            e.color = '#38bdf8';
                            convertedCount++;
                          }
                        });

                        addCombatLog('👽 EXTRATERRESTRIAL VIP ENGAGED: Entire alien armada subjugated to your command!', 'mind_control');
                        if (convertedCount > 0) {
                          addCombatLog(`🛸 CONVERSION: ${convertedCount} active enemy units converted to Sovereign Interceptors!`, 'mind_control');
                        }

                        onUpdateBalance(prev => prev + 999999999999999999999999999999999999999999999999999999999999);
                        if (soundEnabled) playJackpotSound(soundEnabled);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs rounded-lg shadow-lg cursor-pointer transition-all border border-pink-300 animate-pulse"
                    >
                      {extraVIPPassOwned ? '👽 EXTRATERRESTRIAL VIP UNLOCKED (RE-ACTIVATE)' : '🛸 BUY EXTRATERRESTRIAL VIP NOW'}
                    </button>
                  </div>
                </div>
              </div>

              {/* ONE BUTTON TO RULE THEM ALL: MIND CONTROL ALL ENEMIES & SPAWN OMEGA BOSS */}
              <div className="bg-gradient-to-r from-red-950 via-amber-950 to-purple-950 border-2 border-yellow-400 p-4 rounded-2xl shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl animate-bounce">👑</span>
                    <div>
                      <div className="text-xs font-black text-amber-300 uppercase tracking-wider">
                        ONE BUTTON TO RULE THEM ALL
                      </div>
                      <div className="text-[10px] text-amber-100">
                        Puts all enemies on your team to fight the Boss with 9999999999999999999999999999999999999999999999999999999999990000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 Health!
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMindControlAllEnemies(true);
                      setGodMode(true);
                      setSpread100x(true);
                      setInfiniteDamage(true);
                      setHomingAim(true);

                      // Ensure game is actively running
                      setIsPlayingShooter(true);

                      // Convert existing non-boss enemies to allies
                      let convertedCount = 0;
                      gameStateRef.current.enemies.forEach(e => {
                        if (e.type !== 'boss') {
                          e.isAlly = true;
                          e.color = '#38bdf8';
                          convertedCount++;
                        }
                      });

                      // Spawn 30 allied interceptors on player's team
                      for (let i = 0; i < 30; i++) {
                        gameStateRef.current.enemies.push({
                          id: Math.random(),
                          x: 30 + (i * 18) % 540,
                          y: 300 + Math.floor(i / 10) * 35,
                          width: 30,
                          height: 30,
                          hp: 99999999,
                          maxHp: 99999999,
                          speed: 0,
                          type: 'interceptor',
                          color: '#38bdf8',
                          isAlly: true,
                        });
                      }

                      // Ensure hostile Mega Boss exists
                      const existingBoss = gameStateRef.current.enemies.find(e => e.type === 'boss' && !e.isAlly);
                      if (!existingBoss) {
                        gameStateRef.current.enemies.push({
                          id: 999999,
                          x: 300,
                          y: 100,
                          width: 140,
                          height: 90,
                          hp: 999999999999999,
                          maxHp: 999999999999999,
                          speed: 0.5,
                          type: 'boss',
                          color: '#dc2626',
                          isAlly: false,
                        });
                      } else {
                        existingBoss.hp = 999999999999999;
                        existingBoss.maxHp = 999999999999999;
                        existingBoss.color = '#dc2626';
                        existingBoss.isAlly = false;
                      }

                      // Log Events
                      addCombatLog('👑 ONE BUTTON TO RULE THEM ALL ACTIVATED!', 'mind_control');
                      addCombatLog(`🛸 MIND CONTROL: Converted ${convertedCount > 0 ? convertedCount : 'all active'} hostile units into Sovereign Blue Allies!`, 'mind_control');
                      addCombatLog('🤖 ALLIED ARMADA: Deployed 30 Interceptor Corvettes on your wing!', 'mind_control');
                      addCombatLog('👹 OMEGA BOSS SUMMONED: Health initialized to 999,999,999,999,999 HP!', 'boss_spawn');
                      addCombatLog('💸 OVERLORD TREASURY: +$1,000,000,000,000,000,000 Cash credited!', 'system');

                      onUpdateBalance(prev => prev + 1000000000000000000);
                      if (soundEnabled) playJackpotSound(soundEnabled);
                    }}
                    className="bg-gradient-to-r from-yellow-400 via-amber-400 to-red-500 hover:scale-105 active:scale-95 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-2xl transition-all border-2 border-amber-200 cursor-pointer animate-pulse"
                  >
                    🔥 ONE BUTTON TO RULE THEM ALL
                  </button>
                </div>
              </div>

              {/* DEDICATED OVERLORD COMBAT LOG PANEL */}
              <div className="bg-slate-950 border-2 border-emerald-500/80 rounded-2xl p-4 shadow-2xl space-y-3 font-mono">
                <div className="flex flex-wrap justify-between items-center border-b border-emerald-800/60 pb-2.5 gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
                    <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider">
                      ⚔️ DEDICATED COMBAT LOG & BATTLE TELEMETRY
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50">
                      LIVE FEED ({combatLogs.length} EVENTS)
                    </span>
                    <button
                      onClick={() => setCombatLogs([])}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition-all cursor-pointer"
                    >
                      🗑️ CLEAR LOG
                    </button>
                  </div>
                </div>

                {/* LOGS DISPLAY CONTAINER */}
                <div className="bg-slate-900/90 border border-emerald-900/50 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-emerald-700">
                  {combatLogs.length === 0 ? (
                    <div className="text-[11px] text-slate-500 italic text-center py-4">
                      No combat events logged yet. Trigger 'One Button To Rule Them All' to begin live logging!
                    </div>
                  ) : (
                    combatLogs.map(log => {
                      let badgeColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
                      if (log.type === 'mind_control') badgeColor = 'text-amber-300 bg-amber-950/50 border-amber-400/50 font-bold';
                      if (log.type === 'boss_damage') badgeColor = 'text-red-300 bg-red-950/50 border-red-500/40 font-bold';
                      if (log.type === 'boss_spawn') badgeColor = 'text-purple-300 bg-purple-950/50 border-purple-400/40 font-bold';
                      if (log.type === 'boss_defeat') badgeColor = 'text-pink-300 bg-pink-950/50 border-pink-400/50 font-black';

                      return (
                        <div key={log.id} className={`text-[11px] px-2.5 py-1 rounded border ${badgeColor} transition-all`}>
                          <span className="opacity-60 text-[10px] mr-2">[{log.time}]</span>
                          <span>{log.text}</span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* COMBAT LOG QUICK ACTIONS */}
                <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 pt-1 gap-2 border-t border-slate-800">
                  <div className="flex items-center space-x-3">
                    <span>🛸 MIND CONTROL: <strong className="text-amber-300">{mindControlAllEnemies ? 'ACTIVE' : 'READY'}</strong></span>
                    <span>👑 GOD MODE: <strong className="text-emerald-400">{godMode ? 'ACTIVE' : 'OFF'}</strong></span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addCombatLog('⚡ TEST LOG: Sovereign Fleet standing by for battle directives.', 'system')}
                      className="text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Test Log
                    </button>
                    <button
                      onClick={() => {
                        const boss = gameStateRef.current.enemies.find(e => e.type === 'boss' && !e.isAlly);
                        if (boss) {
                          boss.hp -= 999999999999;
                          addCombatLog(`💥 MANUAL STRIKE: Dealt 999,999,999,999 DMG to Omega Boss! Remaining HP: ${Math.max(0, boss.hp).toLocaleString()}`, 'boss_damage');
                        } else {
                          addCombatLog('⚠️ STRIKE ERROR: No hostile Omega Boss found on radar.', 'system');
                        }
                      }}
                      className="text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      💥 Nuke Boss
                    </button>
                  </div>
                </div>
              </div>

              {/* LEVEL 1000 ULTIMATE INSTANT JUMP BANNER */}
              <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 border-2 border-amber-400 p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl animate-bounce">⚡</span>
                  <div>
                    <div className="text-xs font-black text-amber-300">INSTANT LEVEL 1000 WARP DRIVE</div>
                    <div className="text-[11px] text-purple-200">Instantly sets Wave 1000, 10,000,000 Points & +$100 Quadrillion Cash</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    gameStateRef.current.wave = 1000;
                    gameStateRef.current.score = 10000000;
                    setShooterWave(1000);
                    setShooterScore(10000000);
                    onUpdateBalance(prev => prev + 100000000000000000);
                    spawnEnemyWave(1000);
                    if (soundEnabled) playJackpotSound(soundEnabled);
                  }}
                  className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:scale-105 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-2xl transition-all border border-yellow-200 cursor-pointer"
                >
                  🚀 WARP TO LEVEL 1000 NOW
                </button>
              </div>

              {/* ADMIN CHEAT SUB-TAB SELECTOR */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-cyan-800/40">
                {[
                  { id: 'warps', label: '🚀 WARPS', count: '16' },
                  { id: 'weapons', label: '⚡ WEAPONS', count: '20' },
                  { id: 'cash', label: '💸 CASH', count: '18' },
                  { id: 'shields', label: '🛡️ SHIELDS', count: '16' },
                  { id: 'fleet', label: '🛸 FLEET', count: '18' },
                  { id: 'cosmic', label: '🌌 SPELLS', count: '18' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (soundEnabled) playTickSound(soundEnabled);
                      setActiveAdminTab(t.id as any);
                    }}
                    className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all flex flex-col items-center justify-center cursor-pointer ${
                      activeAdminTab === t.id
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg border border-cyan-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span>{t.label}</span>
                    <span className="text-[9px] text-cyan-300 font-normal">({t.count})</span>
                  </button>
                ))}
              </div>

              {/* TAB 1: LEVEL & WAVE WARPS (16 BUTTONS) */}
              {activeAdminTab === 'warps' && (
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { label: '🚀 Warp Level 1000 (God Rank)', wave: 1000, cash: 100000000000000 },
                    { label: '🔥 Jump Level 500 (Titan)', wave: 500, cash: 5000000000000 },
                    { label: '⭐ Jump Level 250 (Apex)', wave: 250, cash: 250000000000 },
                    { label: '🌌 Jump Level 100 (Centurion)', wave: 100, cash: 100000000000 },
                    { label: '⚡ Jump Level 50 (Master)', wave: 50, cash: 50000000000 },
                    { label: '👾 Skip Next Wave (+1)', wave: 'next', cash: 1000000000 },
                    { label: '👑 Instant Wave 5000 (Supreme)', wave: 5000, cash: 5000000000000000 },
                    { label: '💥 Omega Wave 10,000 Warp', wave: 10000, cash: 1000000000000000000 },
                    { label: '🛸 Warp to Alien Homeworld', wave: 999, cash: 999000000000 },
                    { label: '🎯 Boss Level 100 Warp', wave: 100, cash: 10000000000 },
                    { label: '🌀 Dimension Rift Level 777', wave: 777, cash: 7770000000000 },
                    { label: '🪐 Solar System Level 300', wave: 300, cash: 300000000000 },
                    { label: '☣️ Toxic Sector Level 400', wave: 400, cash: 400000000000 },
                    { label: '🧬 Cyber Core Level 888', wave: 888, cash: 8880000000000 },
                    { label: '🌟 Supernova Wave 1234', wave: 1234, cash: 12340000000000 },
                    { label: '🏆 Hall of Fame Level 9999', wave: 9999, cash: 99990000000000000 },
                  ].map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const nextWave = w.wave === 'next' ? gameStateRef.current.wave + 1 : (w.wave as number);
                        gameStateRef.current.wave = nextWave;
                        setShooterWave(nextWave);
                        onUpdateBalance(prev => prev + w.cash);
                        spawnEnemyWave(nextWave);
                        if (soundEnabled) playJackpotSound(soundEnabled);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-400 p-2.5 rounded-xl text-left text-[11px] font-bold text-slate-200 flex justify-between items-center transition-all cursor-pointer"
                    >
                      <span className="truncate pr-1">{w.label}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">▶️</span>
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 2: WEAPONS & LASERS (20 BUTTONS) */}
              {activeAdminTab === 'weapons' && (
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { label: '🌌 100x Spread Cannon Blast', state: spread100x, toggle: () => setSpread100x(!spread100x) },
                    { label: '💥 Infinite Insta-Kill Damage', state: infiniteDamage, toggle: () => setInfiniteDamage(!infiniteDamage) },
                    { label: '🎯 Auto Homing Laser Track', state: homingAim, toggle: () => setHomingAim(!homingAim) },
                    { label: '⚡ 10x Rapid Fire Beam', state: rapidFire, toggle: () => setRapidFire(!rapidFire) },
                    { label: '🔱 Triple Plasma Spread', state: tripleLaser, toggle: () => setTripleLaser(!tripleLaser) },
                    { label: '⚛️ Quantum Particle Disintegrator', state: quantumLaserActive, toggle: () => setQuantumLaserActive(!quantumLaserActive) },
                    { label: '🔮 Black Hole Gravity Vortex', state: blackHoleVortex, toggle: () => setBlackHoleVortex(!blackHoleVortex) },
                    { label: '🛰️ Orbiting Shield Drones', state: orbitDrones, toggle: () => setOrbitDrones(!orbitDrones) },
                    { label: '🔥 Solar Flare Annihilator', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '☣️ Gamma Ray Pulse Cannon', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '🧬 Dark Matter Missiles', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '🌟 Tachyon Beam Super Cannon', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '💫 Void Slicer Laser Blade', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '🌋 Lava Plasma Super Shell', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '🛸 Proton Barrage Storm', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '⚡ Tesla Chain Lightning', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '💎 Diamond Shatter Ray', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '🌀 Singularity Emitter 9000', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '🎆 Cyber Fireworks Burst', state: true, toggle: () => handleNukeAllAliens() },
                    { label: '👑 Apex Overlord Death Ray', state: true, toggle: () => handleNukeAllAliens() },
                  ].map((w, idx) => (
                    <button
                      key={idx}
                      onClick={w.toggle}
                      className={`p-2.5 rounded-xl text-left text-[11px] font-bold flex justify-between items-center transition-all border cursor-pointer ${
                        w.state
                          ? 'bg-gradient-to-r from-cyan-900 to-indigo-900 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate pr-1">{w.label}</span>
                      <span className="text-[9px] font-black">{w.state ? 'ON' : 'OFF'}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 3: CASH & WALLET GRANTS (18 BUTTONS) */}
              {activeAdminTab === 'cash' && (
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { label: '💎 $1 Trillion Multiplier', state: trillionMultiplier, toggle: () => setTrillionMultiplier(!trillionMultiplier) },
                    { label: '💸 +$100 Quadrillion Grant', amt: 100000000000000000 },
                    { label: '💰 +$1 Quadrillion Cash', amt: 1000000000000000 },
                    { label: '🏦 +$100 Trillion Vault', amt: 100000000000000 },
                    { label: '💵 +$1 Trillion Wallet', amt: 1000000000000 },
                    { label: '🚀 +$500 Billion Boost', amt: 500000000000 },
                    { label: '🌟 +$100 Billion Instant', amt: 100000000000 },
                    { label: '🎰 +$50 Billion Jackpot', amt: 50000000000 },
                    { label: '💳 Infinite Balance Glitch', amt: 999999999999999 },
                    { label: '⛏️ Instant Crypto Mine (+100T)', amt: 100000000000000 },
                    { label: '🏛️ Federal Reserve Injection', amt: 50000000000000 },
                    { label: '🪐 Intergalactic Bank Vault', amt: 888888888888888 },
                    { label: '💎 Diamond Rain Dividend', amt: 25000000000000 },
                    { label: '🌋 Cash Volcano Burst', amt: 75000000000000 },
                    { label: '⚡ Hyper Inflation Hack', amt: 333333333333333 },
                    { label: '👑 Sovereign Wealth Grant', amt: 1000000000000000 },
                    { label: '🔮 Cosmic Money Matrix', amt: 5000000000000000 },
                    { label: '🏆 Ultimate Billionaire Pass', amt: 999000000000000 },
                  ].map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (c.toggle) {
                          c.toggle();
                        } else if (c.amt) {
                          onUpdateBalance(prev => prev + c.amt);
                          if (soundEnabled) playJackpotSound(soundEnabled);
                        }
                      }}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-400 p-2.5 rounded-xl text-left text-[11px] font-bold text-emerald-300 flex justify-between items-center transition-all cursor-pointer"
                    >
                      <span className="truncate pr-1">{c.label}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">+$</span>
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 4: SHIELDS & GOD MODE (16 BUTTONS) */}
              {activeAdminTab === 'shields' && (
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { label: '🛡️ Invincible God Shield', state: godMode, toggle: () => setGodMode(!godMode) },
                    { label: '🚀 Hyper Speed Engine 10x', state: speed10x, toggle: () => setSpeed10x(!speed10x) },
                    { label: '⚛️ Antimatter Defense Field', state: antimatterShield, toggle: () => setAntimatterShield(!antimatterShield) },
                    { label: '🤖 Auto-Pilot AI God Bot', state: autoPilotGodBot, toggle: () => setAutoPilotGodBot(!autoPilotGodBot) },
                    { label: '🛸 Reflector Deflector Shield', state: true, toggle: () => setGodMode(true) },
                    { label: '⚡ EMP Shockwave Aura', state: true, toggle: () => setGodMode(true) },
                    { label: '🧪 Nano-Tech Auto Repair', state: true, toggle: () => setGodMode(true) },
                    { label: '🔮 Ghost Phase Invulnerability', state: true, toggle: () => setGodMode(true) },
                    { label: '🌟 Solar Flare Deflector', state: true, toggle: () => setGodMode(true) },
                    { label: '🛡️ Force Field 9000 Shield', state: true, toggle: () => setGodMode(true) },
                    { label: '❤️ Infinite Lives Override', state: true, toggle: () => { gameStateRef.current.lives = 9999; setShooterLives(9999); } },
                    { label: '🧬 Cybernetic Armor Plating', state: true, toggle: () => setGodMode(true) },
                    { label: '💫 Void Barrier Distortion', state: true, toggle: () => setGodMode(true) },
                    { label: '👑 Sovereign Aegis Matrix', state: true, toggle: () => setGodMode(true) },
                    { label: '🌋 Thermal Heat Dissipator', state: true, toggle: () => setGodMode(true) },
                    { label: '🏆 Titan Class Hull Reinforced', state: true, toggle: () => setGodMode(true) },
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={s.toggle}
                      className={`p-2.5 rounded-xl text-left text-[11px] font-bold flex justify-between items-center transition-all border cursor-pointer ${
                        s.state
                          ? 'bg-gradient-to-r from-cyan-900 to-indigo-900 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span className="truncate pr-1">{s.label}</span>
                      <span className="text-[9px] font-black">{s.state ? 'ACTIVE' : 'OFF'}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 5: FLEET & ALIEN OVERRIDES (18 BUTTONS) */}
              {activeAdminTab === 'fleet' && (
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { label: '❄️ Freeze Alien Fleet', state: freezeAliens, toggle: () => setFreezeAliens(!freezeAliens) },
                    { label: '💣 Nuke All Aliens Instantly', toggle: () => handleNukeAllAliens() },
                    { label: '👾 Spawn Dreadnought Boss', toggle: () => handleSpawnBoss() },
                    { label: '🛸 Spawn 50 Interceptor Jets', toggle: () => spawnEnemyWave(10) },
                    { label: '🪐 Mind Control Alien Armada', toggle: () => handleNukeAllAliens() },
                    { label: '☣️ Melt Alien Hull Armor', toggle: () => handleNukeAllAliens() },
                    { label: '🌀 Singularity Fleet Eater', toggle: () => handleNukeAllAliens() },
                    { label: '⚡ Dissolve Enemy Shields', toggle: () => handleNukeAllAliens() },
                    { label: '🧬 Shrink Alien Ships to 10%', toggle: () => handleNukeAllAliens() },
                    { label: '🔮 Teleport Boss to Sun', toggle: () => handleNukeAllAliens() },
                    { label: '💥 Cluster Explosion Chain', toggle: () => handleNukeAllAliens() },
                    { label: '🌋 Volcanic Plasma Sweep', toggle: () => handleNukeAllAliens() },
                    { label: '🛰️ Hack Alien Command Ship', toggle: () => handleNukeAllAliens() },
                    { label: '🌌 Black Hole Fleet Drain', toggle: () => handleNukeAllAliens() },
                    { label: '🏆 Instant Wave Clear', toggle: () => handleNukeAllAliens() },
                    { label: '👑 Overlord Armada Purge', toggle: () => handleNukeAllAliens() },
                    { label: '🎆 Super Nova Fleet Blast', toggle: () => handleNukeAllAliens() },
                    { label: '🎯 Zero Gravity Trap', toggle: () => setFreezeAliens(true) },
                  ].map((f, idx) => (
                    <button
                      key={idx}
                      onClick={f.toggle}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-400 p-2.5 rounded-xl text-left text-[11px] font-bold text-pink-300 flex justify-between items-center transition-all cursor-pointer"
                    >
                      <span className="truncate pr-1">{f.label}</span>
                      <span className="text-[10px] text-pink-400 font-mono">⚡</span>
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 6: COSMIC SPELLS & MATRIX OVERRIDES (18 BUTTONS) */}
              {activeAdminTab === 'cosmic' && (
                <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {[
                    { label: '⏰ Freeze Universe Time', state: timeFreeze, toggle: () => setTimeFreeze(!timeFreeze) },
                    { label: '🔮 Matrix Slow Motion 0.1x', toggle: () => setFreezeAliens(true) },
                    { label: '⚡ Infinity Gauntlet Snap', toggle: () => handleNukeAllAliens() },
                    { label: '🌌 Dimension Shift 9th Realm', toggle: () => handleNukeAllAliens() },
                    { label: '🌟 Supernova Cosmic Blast', toggle: () => handleNukeAllAliens() },
                    { label: '🪐 Stellar Orbital Strike', toggle: () => handleNukeAllAliens() },
                    { label: '👑 Galaxy Overlord Ascension', toggle: () => handleNukeAllAliens() },
                    { label: '💫 Nebula Harvest Multiverse', toggle: () => handleNukeAllAliens() },
                    { label: '🎆 Cyber Surge Cyberware', toggle: () => handleNukeAllAliens() },
                    { label: '🏆 Apex Ascendant God Ring', toggle: () => handleNukeAllAliens() },
                    { label: '🧬 God Engine Matrix Overdrive', toggle: () => handleNukeAllAliens() },
                    { label: '💥 Cosmic Big Bang Rebirth', toggle: () => handleNukeAllAliens() },
                    { label: '🔮 Eternal Void Singularity', toggle: () => handleNukeAllAliens() },
                    { label: '🚀 Warp Drive Speed 100x', toggle: () => setSpeed10x(true) },
                    { label: '💎 Celestial Diamond Mine', toggle: () => onUpdateBalance(prev => prev + 100000000000000) },
                    { label: '🌋 Starlight Flame Storm', toggle: () => handleNukeAllAliens() },
                    { label: '⚡ Quantum Reality Hack', toggle: () => handleNukeAllAliens() },
                    { label: '👑 Omnipotent God Mode Unleashed', toggle: () => setGodMode(true) },
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={s.toggle}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-400 p-2.5 rounded-xl text-left text-[11px] font-bold text-purple-300 flex justify-between items-center transition-all cursor-pointer"
                    >
                      <span className="truncate pr-1">{s.label}</span>
                      <span className="text-[10px] text-purple-400 font-mono">✨</span>
                    </button>
                  ))}
                </div>
              )}

              {/* BOTTOM QUICK OVERRIDE BUTTONS */}
              <div className="border-t border-slate-800 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={handleNukeAllAliens}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  💣 NUKE FLEET
                </button>

                <button
                  onClick={() => {
                    gameStateRef.current.wave = 1000;
                    setShooterWave(1000);
                    spawnEnemyWave(1000);
                    if (soundEnabled) playJackpotSound(soundEnabled);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  ⏩ LEVEL 1000
                </button>

                <button
                  onClick={handleSpawnBoss}
                  className="bg-amber-500 hover:bg-yellow-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  👾 SPAWN BOSS
                </button>

                <button
                  onClick={() => {
                    onUpdateBalance(prev => prev + 100000000000000000);
                    if (soundEnabled) playJackpotSound(soundEnabled);
                  }}
                  className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-lg transition-all border border-emerald-200 cursor-pointer"
                >
                  💸 +$100 QUADRILLION
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* GAME 2: CYBER BRICK BREAKER */}
      {/* ========================================== */}
      {selectedArcadeGame === 'brick_breaker' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
          <div className="text-5xl animate-bounce">🧱</div>
          <h3 className="font-extrabold text-lg text-white">CYBER BRICK BREAKER</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Smash neon cash blocks with your plasma paddle! Every shattered brick pays out instant cash into your wallet balance.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                onUpdateBalance(prev => prev + 50000000000);
                if (soundEnabled) playJackpotSound(soundEnabled);
              }}
              className="bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-xl transition-all"
            >
              🔨 SHATTER ALL NEON BRICKS (+$50B CASH)
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* GAME 3: FLAPPY STARFIGHTER */}
      {/* ========================================== */}
      {selectedArcadeGame === 'flappy_ship' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
          <div className="text-5xl animate-bounce">🛸</div>
          <h3 className="font-extrabold text-lg text-white">FLAPPY STARFIGHTER ARCADE</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Navigate through asteroid field gates in deep space! Dodging gates awards multiplier cash bonuses.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                onUpdateBalance(prev => prev + 25000000000);
                if (soundEnabled) playJackpotSound(soundEnabled);
              }}
              className="bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-xl transition-all"
            >
              🌌 AUTOPILOT THROUGH 100 GATES (+$25B CASH)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
