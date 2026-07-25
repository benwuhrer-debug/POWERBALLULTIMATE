import React, { useState, useEffect, useRef } from 'react';
import { playBallPop, playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface AsteroidsGameTabProps {
  soundEnabled: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  size: 'large' | 'medium' | 'small';
  vertices: number[];
  angle: number;
  rotationSpeed: number;
  color: string;
}

interface UFO {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  shootTimer: number;
  type: 'large' | 'small';
}

interface UFOBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function AsteroidsGameTab({ soundEnabled }: AsteroidsGameTabProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game Stats & State
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('asteroids_standalone_high_score') || '0');
  });
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [theme, setTheme] = useState<'retro_green' | 'cyber_neon' | 'vector_white' | 'synthwave'>('retro_green');

  // Input States
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Audio helper ref
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Main Game Loop Refs
  const shipRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    rotationSpeed: number;
    thrusting: boolean;
    radius: number;
    invulnerableTimer: number;
  }>({
    x: 425,
    y: 275,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    rotationSpeed: 0,
    thrusting: false,
    radius: 12,
    invulnerableTimer: 0,
  });

  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const ufoRef = useRef<UFO | null>(null);
  const ufoBulletsRef = useRef<UFOBullet[]>([]);
  const fireCooldownRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);

  // Theme color maps
  const themeColors = {
    retro_green: { bg: '#020d06', primary: '#22c55e', secondary: '#15803d', glow: '#4ade80', text: '#86efac' },
    cyber_neon: { bg: '#030712', primary: '#38bdf8', secondary: '#f43f5e', glow: '#a855f7', text: '#7dd3fc' },
    vector_white: { bg: '#0a0a0a', primary: '#ffffff', secondary: '#a3a3a3', glow: '#ffffff', text: '#f5f5f5' },
    synthwave: { bg: '#18042c', primary: '#f43f5e', secondary: '#fbbf24', glow: '#ec4899', text: '#f472b6' },
  };

  const currentColors = themeColors[theme];

  // Helper to create asteroid shape
  const createAsteroid = (x: number, y: number, size: 'large' | 'medium' | 'small'): Asteroid => {
    let radius = 40;
    if (size === 'medium') radius = 22;
    if (size === 'small') radius = 12;

    const numVertices = 8 + Math.floor(Math.random() * 5);
    const vertices: number[] = [];
    for (let i = 0; i < numVertices; i++) {
      const offset = (Math.random() * 0.4 + 0.8);
      vertices.push(offset);
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = (size === 'large' ? 1.2 : size === 'medium' ? 2.0 : 3.0) + (level * 0.2);

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      size,
      vertices,
      angle: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.04,
      color: currentColors.primary,
    };
  };

  // Spawn initial level asteroids
  const spawnLevelAsteroids = (lvl: number, width: number, height: number) => {
    const count = 3 + lvl * 2;
    const newAsteroids: Asteroid[] = [];
    for (let i = 0; i < count; i++) {
      let x = Math.random() * width;
      let y = Math.random() * height;
      while (Math.hypot(x - width / 2, y - height / 2) < 150) {
        x = Math.random() * width;
        y = Math.random() * height;
      }
      newAsteroids.push(createAsteroid(x, y, 'large'));
    }
    asteroidsRef.current = newAsteroids;
  };

  // Start game handler
  const handleStartGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.width;
    const height = canvas.height;

    shipRef.current = {
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      rotationSpeed: 0,
      thrusting: false,
      radius: 12,
      invulnerableTimer: 180, // 3 seconds invulnerability
    };

    bulletsRef.current = [];
    particlesRef.current = [];
    ufoRef.current = null;
    ufoBulletsRef.current = [];
    fireCooldownRef.current = 0;

    setScore(0);
    setLives(3);
    setLevel(1);
    setGameState('playing');

    spawnLevelAsteroids(1, width, height);

    if (soundEnabledRef.current) playTickSound(true);
  };

  // Hyperspace Teleport
  const handleHyperspace = () => {
    if (gameState !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x: shipRef.current.x,
        y: shipRef.current.y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 0,
        maxLife: 30,
        color: currentColors.glow,
        size: Math.random() * 3 + 1,
      });
    }

    shipRef.current.x = Math.random() * canvas.width;
    shipRef.current.y = Math.random() * canvas.height;
    shipRef.current.vx = 0;
    shipRef.current.vy = 0;
    shipRef.current.invulnerableTimer = 60; // 1s protection

    if (soundEnabledRef.current) playBallPop(true);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key) && gameState === 'playing') {
        e.preventDefault();
      }
      keysRef.current[e.key] = true;

      if (e.key === 'Shift' || e.key === 's' || e.key === 'S') {
        handleHyperspace();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const loop = () => {
      const width = canvas.width;
      const height = canvas.height;

      const keys = keysRef.current;
      const ship = shipRef.current;

      // Rotate Ship
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        ship.angle -= 0.08;
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        ship.angle += 0.08;
      }

      // Thrust
      ship.thrusting = !!(keys['ArrowUp'] || keys['w'] || keys['W']);
      if (ship.thrusting) {
        ship.vx += Math.cos(ship.angle) * 0.18;
        ship.vy += Math.sin(ship.angle) * 0.18;

        if (Math.random() < 0.6) {
          const rearX = ship.x - Math.cos(ship.angle) * 14;
          const rearY = ship.y - Math.sin(ship.angle) * 14;
          particlesRef.current.push({
            x: rearX,
            y: rearY,
            vx: -Math.cos(ship.angle) * (2 + Math.random() * 2) + (Math.random() - 0.5),
            vy: -Math.sin(ship.angle) * (2 + Math.random() * 2) + (Math.random() - 0.5),
            life: 0,
            maxLife: 20 + Math.random() * 15,
            color: Math.random() < 0.5 ? '#f59e0b' : '#ef4444',
            size: Math.random() * 3 + 1,
          });
        }
      }

      // Drag
      ship.vx *= 0.985;
      ship.vy *= 0.985;

      // Move Ship
      ship.x += ship.vx;
      ship.y += ship.vy;

      // Wrap
      if (ship.x < 0) ship.x = width;
      if (ship.x > width) ship.x = 0;
      if (ship.y < 0) ship.y = height;
      if (ship.y > height) ship.y = 0;

      if (ship.invulnerableTimer > 0) {
        ship.invulnerableTimer--;
      }

      // Fire Bullet
      if (fireCooldownRef.current > 0) {
        fireCooldownRef.current--;
      }

      if ((keys[' '] || keys['j'] || keys['J'] || keys['k'] || keys['K']) && fireCooldownRef.current === 0) {
        fireCooldownRef.current = 10;
        const bulletSpeed = 9;
        const noseX = ship.x + Math.cos(ship.angle) * 16;
        const noseY = ship.y + Math.sin(ship.angle) * 16;

        bulletsRef.current.push({
          x: noseX,
          y: noseY,
          vx: ship.vx + Math.cos(ship.angle) * bulletSpeed,
          vy: ship.vy + Math.sin(ship.angle) * bulletSpeed,
          life: 0,
        });

        if (soundEnabledRef.current) playBallPop(true);
      }

      // Update Bullets
      bulletsRef.current.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.life++;

        if (b.x < 0) b.x = width;
        if (b.x > width) b.x = 0;
        if (b.y < 0) b.y = height;
        if (b.y > height) b.y = 0;
      });
      bulletsRef.current = bulletsRef.current.filter(b => b.life < 75);

      // Update Asteroids
      asteroidsRef.current.forEach(ast => {
        ast.x += ast.vx;
        ast.y += ast.vy;
        ast.angle += ast.rotationSpeed;

        if (ast.x < -ast.radius) ast.x = width + ast.radius;
        if (ast.x > width + ast.radius) ast.x = -ast.radius;
        if (ast.y < -ast.radius) ast.y = height + ast.radius;
        if (ast.y > height + ast.radius) ast.y = -ast.radius;
      });

      // Spawn Flying Saucer UFO Periodically
      if (!ufoRef.current && Math.random() < 0.0015 + (level * 0.0005)) {
        const side = Math.random() < 0.5 ? 'left' : 'right';
        const type = Math.random() < 0.6 ? 'large' : 'small';
        ufoRef.current = {
          x: side === 'left' ? 0 : width,
          y: Math.random() * (height - 100) + 50,
          vx: (side === 'left' ? 1 : -1) * (type === 'small' ? 2.8 : 1.8),
          vy: (Math.random() - 0.5) * 1.5,
          radius: type === 'small' ? 12 : 22,
          shootTimer: 0,
          type,
        };
      }

      // Update UFO
      if (ufoRef.current) {
        const ufo = ufoRef.current;
        ufo.x += ufo.vx;
        ufo.y += ufo.vy;

        ufo.shootTimer++;
        if (ufo.shootTimer >= (ufo.type === 'small' ? 60 : 90)) {
          ufo.shootTimer = 0;
          let angle = Math.random() * Math.PI * 2;
          if (ufo.type === 'small') {
            angle = Math.atan2(ship.y - ufo.y, ship.x - ufo.x) + (Math.random() - 0.5) * 0.4;
          }
          ufoBulletsRef.current.push({
            x: ufo.x,
            y: ufo.y,
            vx: Math.cos(angle) * 5,
            vy: Math.sin(angle) * 5,
            life: 0,
          });
        }

        if (ufo.x < -30 || ufo.x > width + 30) {
          ufoRef.current = null;
        }
      }

      // Update UFO Bullets
      ufoBulletsRef.current.forEach(ub => {
        ub.x += ub.vx;
        ub.y += ub.vy;
        ub.life++;
      });
      ufoBulletsRef.current = ufoBulletsRef.current.filter(ub => ub.life < 100);

      // Bullet - Asteroid Collisions
      bulletsRef.current.forEach((bullet) => {
        asteroidsRef.current.forEach((ast, aIdx) => {
          const dist = Math.hypot(bullet.x - ast.x, bullet.y - ast.y);
          if (dist < ast.radius) {
            bullet.life = 999;

            for (let i = 0; i < 15; i++) {
              particlesRef.current.push({
                x: ast.x,
                y: ast.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 0,
                maxLife: 25 + Math.random() * 20,
                color: currentColors.glow,
                size: Math.random() * 3 + 1,
              });
            }

            let addedScore = 100;
            if (ast.size === 'medium') addedScore = 200;
            if (ast.size === 'small') addedScore = 500;

            setScore(prev => {
              const next = prev + addedScore;
              if (next > highScore) {
                setHighScore(next);
                localStorage.setItem('asteroids_standalone_high_score', String(next));
              }
              return next;
            });

            if (soundEnabledRef.current) playCoinSound(true);

            if (ast.size === 'large') {
              asteroidsRef.current.push(createAsteroid(ast.x, ast.y, 'medium'));
              asteroidsRef.current.push(createAsteroid(ast.x, ast.y, 'medium'));
            } else if (ast.size === 'medium') {
              asteroidsRef.current.push(createAsteroid(ast.x, ast.y, 'small'));
              asteroidsRef.current.push(createAsteroid(ast.x, ast.y, 'small'));
            }

            asteroidsRef.current.splice(aIdx, 1);
            screenShakeRef.current = 6;
          }
        });

        // Bullet - UFO Collision
        if (ufoRef.current) {
          const ufo = ufoRef.current;
          const dist = Math.hypot(bullet.x - ufo.x, bullet.y - ufo.y);
          if (dist < ufo.radius) {
            bullet.life = 999;
            ufoRef.current = null;

            for (let i = 0; i < 25; i++) {
              particlesRef.current.push({
                x: ufo.x,
                y: ufo.y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 0,
                maxLife: 35,
                color: '#f43f5e',
                size: Math.random() * 4 + 1,
              });
            }

            const ufoRewardScore = ufo.type === 'small' ? 2000 : 1000;
            setScore(prev => {
              const next = prev + ufoRewardScore;
              if (next > highScore) {
                setHighScore(next);
                localStorage.setItem('asteroids_standalone_high_score', String(next));
              }
              return next;
            });

            if (soundEnabledRef.current) playJackpotSound(true);
            screenShakeRef.current = 10;
          }
        }
      });

      // Check Ship - Asteroid Collisions
      if (ship.invulnerableTimer === 0) {
        asteroidsRef.current.forEach(ast => {
          const dist = Math.hypot(ship.x - ast.x, ship.y - ast.y);
          if (dist < ship.radius + ast.radius) {
            triggerShipExplosion(ship.x, ship.y);
          }
        });

        ufoBulletsRef.current.forEach(ub => {
          const dist = Math.hypot(ship.x - ub.x, ship.y - ub.y);
          if (dist < ship.radius + 4) {
            triggerShipExplosion(ship.x, ship.y);
          }
        });
      }

      // Check Level Clear
      if (asteroidsRef.current.length === 0) {
        const nextLvl = level + 1;
        setLevel(nextLvl);
        spawnLevelAsteroids(nextLvl, width, height);
        ship.invulnerableTimer = 120;
        if (soundEnabledRef.current) playJackpotSound(true);
      }

      // Update Particles
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
      });
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);

      // DRAWING
      ctx.save();

      if (screenShakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * screenShakeRef.current;
        const dy = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(dx, dy);
        screenShakeRef.current *= 0.85;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      ctx.fillStyle = currentColors.bg;
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137.5) % width;
        const sy = (i * 293.1) % height;
        ctx.fillRect(sx, sy, (i % 3 === 0 ? 2 : 1), (i % 3 === 0 ? 2 : 1));
      }

      // Particles
      particlesRef.current.forEach(p => {
        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // Bullets
      ctx.fillStyle = currentColors.glow;
      ctx.shadowBlur = 10;
      ctx.shadowColor = currentColors.glow;
      bulletsRef.current.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // UFO Bullets
      ctx.fillStyle = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f43f5e';
      ufoBulletsRef.current.forEach(ub => {
        ctx.beginPath();
        ctx.arc(ub.x, ub.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Asteroids
      ctx.strokeStyle = currentColors.primary;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = currentColors.glow;

      asteroidsRef.current.forEach(ast => {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.angle);

        ctx.beginPath();
        const numVerts = ast.vertices.length;
        for (let i = 0; i < numVerts; i++) {
          const a = (i / numVerts) * Math.PI * 2;
          const r = ast.radius * ast.vertices[i];
          const vx = Math.cos(a) * r;
          const vy = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      // UFO
      if (ufoRef.current) {
        const ufo = ufoRef.current;
        ctx.save();
        ctx.translate(ufo.x, ufo.y);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#f43f5e';

        const r = ufo.radius;
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, -r * 0.2, r * 0.4, Math.PI, 0);
        ctx.stroke();

        ctx.restore();
      }

      // Ship
      if (ship.invulnerableTimer === 0 || Math.floor(ship.invulnerableTimer / 10) % 2 === 0) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);

        ctx.strokeStyle = currentColors.primary;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = currentColors.glow;

        ctx.beginPath();
        ctx.moveTo(16, 0);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.stroke();

        if (ship.thrusting) {
          ctx.strokeStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(-8, -5);
          ctx.lineTo(-18 + (Math.random() - 0.5) * 4, 0);
          ctx.lineTo(-8, 5);
          ctx.stroke();
        }

        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, level, theme]);

  const triggerShipExplosion = (x: number, y: number) => {
    screenShakeRef.current = 15;

    for (let i = 0; i < 40; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 0,
        maxLife: 40 + Math.random() * 20,
        color: Math.random() < 0.5 ? '#f43f5e' : '#f59e0b',
        size: Math.random() * 4 + 1,
      });
    }

    if (soundEnabledRef.current) playBallPop(true);

    const nextLives = lives - 1;
    setLives(nextLives);

    if (nextLives <= 0) {
      setGameState('gameover');
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        shipRef.current.x = canvas.width / 2;
        shipRef.current.y = canvas.height / 2;
        shipRef.current.vx = 0;
        shipRef.current.vy = 0;
        shipRef.current.invulnerableTimer = 180;
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">

      {/* HEADER BAR */}
      <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-slate-950 flex items-center justify-center text-3xl shadow-xl border border-emerald-300">
            🚀
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wide uppercase flex items-center space-x-3">
              <span>ASTEROIDS ARCADE</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium pt-0.5">
              Classic vector space arcade shooter. Pilot your ship, destroy floating space rocks and enemy saucers!
            </p>
          </div>
        </div>

        {/* STATS / THEME SELECTOR */}
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={theme}
            onChange={e => setTheme(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs rounded-2xl px-3 py-2.5 focus:outline-none"
          >
            <option value="retro_green">❇️ Retro Vector Green</option>
            <option value="cyber_neon">🌆 Cyber Neon Blue</option>
            <option value="vector_white">⚪ High-Contrast Monokai</option>
            <option value="synthwave">🌆 Synthwave Pink</option>
          </select>
        </div>
      </div>

      {/* GAME CANVAS & HUD CONTAINER */}
      <div className="relative bg-slate-950 border-2 border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col items-center justify-center overflow-hidden">

        {/* HUD OVERLAY BAR TOP */}
        <div className="w-full max-w-4xl flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl mb-3 text-xs font-mono font-bold">
          <div className="flex items-center space-x-6">
            <div className="text-emerald-400">SCORE: <span className="text-white text-sm">{score.toLocaleString()}</span></div>
            <div className="text-amber-400">HIGH SCORE: <span className="text-white text-sm">{highScore.toLocaleString()}</span></div>
            <div className="text-cyan-300">WAVE LEVEL: <span className="text-white text-sm">{level}</span></div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">LIVES:</span>
            <div className="flex space-x-1 text-base text-emerald-400">
              {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                <span key={i}>🚀</span>
              ))}
            </div>
          </div>
        </div>

        {/* CANVAS SCREEN */}
        <div className="relative border-4 border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            width={850}
            height={550}
            className="block max-w-full bg-slate-950 cursor-crosshair"
          />

          {/* IDLE / START OVERLAY */}
          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-6 text-center p-6">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-widest uppercase">
                  ASTEROIDS
                </h2>
                <p className="text-sm text-emerald-400 font-mono">
                  [ W, A, S, D ] or [ ARROW KEYS ] to Pilot & Thrust • [ SPACE / J ] to Fire • [ SHIFT / S ] Hyperspace
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 max-w-md text-xs text-slate-300 space-y-1 text-left font-mono">
                <p className="text-amber-400 font-bold uppercase pb-1">🎯 Point Table:</p>
                <p>• Large Asteroid: <span className="text-emerald-400 font-bold">100 Points</span></p>
                <p>• Medium Asteroid: <span className="text-emerald-400 font-bold">200 Points</span></p>
                <p>• Small Asteroid: <span className="text-emerald-400 font-bold">500 Points</span></p>
                <p>• Flying Saucer UFO: <span className="text-amber-300 font-bold">1,000 / 2,000 Points</span></p>
              </div>

              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 text-slate-950 font-black text-lg px-10 py-4 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-emerald-200"
              >
                🚀 START GAME
              </button>
            </div>
          )}

          {/* GAME OVER OVERLAY */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center space-y-6 text-center p-6">
              <div className="space-y-2">
                <h2 className="text-5xl font-black text-red-500 tracking-widest uppercase">
                  GAME OVER
                </h2>
                <p className="text-base text-slate-300 font-mono">
                  Final Score: <span className="text-amber-400 font-bold">{score.toLocaleString()}</span> • Wave Level: <span className="text-cyan-300 font-bold">{level}</span>
                </p>
              </div>

              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-base px-8 py-3.5 rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                🔄 PLAY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* TOUCH / ON-SCREEN CONTROLS FOR MOBILE / TABLET */}
        <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <button
            onMouseDown={() => { keysRef.current['ArrowLeft'] = true; }}
            onMouseUp={() => { keysRef.current['ArrowLeft'] = false; }}
            onTouchStart={() => { keysRef.current['ArrowLeft'] = true; }}
            onTouchEnd={() => { keysRef.current['ArrowLeft'] = false; }}
            className="bg-slate-900 hover:bg-slate-800 text-cyan-300 font-black text-sm py-3 rounded-2xl border border-slate-800 active:scale-95 transition-all select-none"
          >
            ◀ ROTATE LEFT
          </button>

          <button
            onMouseDown={() => { keysRef.current['ArrowRight'] = true; }}
            onMouseUp={() => { keysRef.current['ArrowRight'] = false; }}
            onTouchStart={() => { keysRef.current['ArrowRight'] = true; }}
            onTouchEnd={() => { keysRef.current['ArrowRight'] = false; }}
            className="bg-slate-900 hover:bg-slate-800 text-cyan-300 font-black text-sm py-3 rounded-2xl border border-slate-800 active:scale-95 transition-all select-none"
          >
            ROTATE RIGHT ▶
          </button>

          <button
            onMouseDown={() => { keysRef.current['ArrowUp'] = true; }}
            onMouseUp={() => { keysRef.current['ArrowUp'] = false; }}
            onTouchStart={() => { keysRef.current['ArrowUp'] = true; }}
            onTouchEnd={() => { keysRef.current['ArrowUp'] = false; }}
            className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-black text-sm py-3 rounded-2xl border border-slate-800 active:scale-95 transition-all select-none"
          >
            🔥 THRUST
          </button>

          <button
            onClick={() => {
              keysRef.current[' '] = true;
              setTimeout(() => { keysRef.current[' '] = false; }, 100);
            }}
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-sm py-3 rounded-2xl shadow-lg active:scale-95 transition-all col-span-2 sm:col-span-1 select-none"
          >
            💥 FIRE LASER
          </button>

          <button
            onClick={handleHyperspace}
            className="bg-slate-900 hover:bg-slate-800 text-purple-300 font-black text-sm py-3 rounded-2xl border border-slate-800 active:scale-95 transition-all col-span-2 sm:col-span-1 select-none"
          >
            🌀 HYPERSPACE
          </button>
        </div>

      </div>

    </div>
  );
}
