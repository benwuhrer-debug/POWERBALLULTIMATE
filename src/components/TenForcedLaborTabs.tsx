import React, { useState, useEffect, useCallback } from 'react';
import { playJackpotSound, playCoinSound, playTickSound } from '../utils/audio';

export interface ForcedLaborTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

// ============================================================================
// 1. SOVEREIGN DIAMOND & ANTIMATTER QUARRY
// ============================================================================
export const ForcedLaborQuarryTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [miners, setMiners] = useState(45);
  const [depthFt, setDepthFt] = useState(1200);
  const [ratePerSec, setRatePerSec] = useState(500000000); // $500M/s
  const [boostActive, setBoostActive] = useState(false);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '💎 Antimatter Quarry initialized at 1,200ft depth. 45 forced laborers chiseling.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const yieldAmt = ratePerSec * (boostActive ? 50 : 1);
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + yieldAmt : yieldAmt));
    }, 1000);
    return () => clearInterval(interval);
  }, [ratePerSec, boostActive, onUpdateBalance]);

  const handleBlastRock = () => {
    setDepthFt(prev => prev + 500);
    setRatePerSec(prev => prev + 250000000);
    const bonus = 50000000000;
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + bonus : bonus));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `💣 DYNAMITE BLAST: Excavated +500ft deeper! Uncovered $50B in raw antimatter crystals!` }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  const handleOneButtonQuarry = () => {
    setBoostActive(true);
    const megaBonus = 5000000000000; // $5 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + megaBonus : megaBonus));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: `👑 ONE BUTTON OVERLORD QUARRY DRILL: 50x Mining speed engaged & +$5 TRILLION credited!` }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-2 border-cyan-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl shadow-xl">💎</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">SOVEREIGN DIAMOND & ANTIMATTER QUARRY</h2>
              <p className="text-xs text-cyan-200">Force laborers into 2,000°F underground excavation shafts to extract ultra-dense gems!</p>
            </div>
          </div>
          <div className="flex gap-3 text-center font-mono">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-cyan-500/40"><p className="text-[10px] text-slate-400 uppercase">Quarry Depth</p><p className="text-xl font-black text-cyan-300">{depthFt.toLocaleString()} FT</p></div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-emerald-500/40"><p className="text-[10px] text-slate-400 uppercase">Yield / Sec</p><p className="text-xl font-black text-emerald-400">${((ratePerSec * (boostActive ? 50 : 1)) / 1e6).toFixed(0)}M/s</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonQuarry} className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON MAX QUARRY EXCAVATION (50x SPEED + $5T)
          </button>
          <button onClick={handleBlastRock} className="bg-slate-900 border border-cyan-500 text-cyan-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            💣 Detonate Antimatter Dynamite (+$50B)
          </button>
          <button onClick={() => setMiners(prev => prev + 10)} className="bg-slate-900 text-slate-300 font-bold text-xs px-3 py-3 rounded-xl border border-slate-800 hover:bg-slate-800 transition cursor-pointer">
            👷 Draft +10 Chisel Workers ({miners} total)
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-cyan-400 font-bold block pb-1 border-b border-slate-800">📜 QUARRY TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 2. CYBERNETIC BIONIC ASSEMBLY LINE
// ============================================================================
export const ForcedLaborCyberAssemblyTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [dronesAssembled, setDronesAssembled] = useState(1280);
  const [roboticOverseers, setRoboticOverseers] = useState(12);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '🤖 Cybernetic Bionic Assembly Line online. Robotic overseers monitoring workers 24/7.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const earnings = dronesAssembled * 10000000; // $10M per drone
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + earnings : earnings));
    }, 1000);
    return () => clearInterval(interval);
  }, [dronesAssembled, onUpdateBalance]);

  const handleOneButtonAssembly = () => {
    setDronesAssembled(prev => prev + 5000);
    const payout = 2000000000000; // $2 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + payout : payout));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON CYBER ASSEMBLY: Assembled +5,000 Battle Drones & credited +$2 TRILLION!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-purple-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl shadow-xl">🤖</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">CYBERNETIC BIONIC ASSEMBLY LINE</h2>
              <p className="text-xs text-purple-200">Forced labor technicians solder neural AI chips and construct killer drone armadas under robotic overwatch.</p>
            </div>
          </div>
          <div className="flex gap-3 font-mono text-center">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-purple-500/40"><p className="text-[10px] text-slate-400 uppercase">Drones Built</p><p className="text-xl font-black text-purple-300">{dronesAssembled.toLocaleString()}</p></div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-indigo-500/40"><p className="text-[10px] text-slate-400 uppercase">Overseer Bots</p><p className="text-xl font-black text-indigo-300">{roboticOverseers}</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonAssembly} className="bg-gradient-to-r from-purple-400 to-indigo-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON CYBER ASSEMBLY OVERCLOCK (+$2 TRILLION)
          </button>
          <button onClick={() => { setDronesAssembled(prev => prev + 500); if (soundEnabled) playCoinSound(soundEnabled); }} className="bg-slate-900 border border-purple-500 text-purple-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            ⚡ Assemble +500 Neural Drones
          </button>
          <button onClick={() => setRoboticOverseers(prev => prev + 2)} className="bg-slate-900 text-slate-300 font-bold text-xs px-3 py-3 rounded-xl border border-slate-800 transition cursor-pointer">
            🤖 Deploy +2 Robotic Guard Bots
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-purple-400 font-bold block pb-1 border-b border-slate-800">📜 ASSEMBLY LINE TELEMETRY</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 3. OVERLORD AGRARIAN PLANTATION
// ============================================================================
export const ForcedLaborFarmTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [acresHarvested, setAcresHarvested] = useState(5000);
  const [cropYield, setCropYield] = useState(1500000000); // $1.5B/s
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '🌾 Overlord Agrarian Plantation operational. 5,000 acres of golden bio-grain harvesting.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + cropYield : cropYield));
    }, 1000);
    return () => clearInterval(interval);
  }, [cropYield, onUpdateBalance]);

  const handleOneButtonHarvest = () => {
    setAcresHarvested(prev => prev + 20000);
    const payout = 3000000000000; // $3 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + payout : payout));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON MASS HARVEST: Harvested 20,000 Acres & credited +$3 TRILLION!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-3xl shadow-xl">🌾</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">OVERLORD AGRARIAN PLANTATION</h2>
              <p className="text-xs text-emerald-200">Endless bio-grain fields and energy-kelp harvests tilled 24/7 by forced labor agricultural units.</p>
            </div>
          </div>
          <div className="flex gap-3 font-mono text-center">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-emerald-500/40"><p className="text-[10px] text-slate-400 uppercase">Acres Tilled</p><p className="text-xl font-black text-emerald-300">{acresHarvested.toLocaleString()} AC</p></div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-green-500/40"><p className="text-[10px] text-slate-400 uppercase">Crop Yield / Sec</p><p className="text-xl font-black text-green-400">${(cropYield / 1e6).toFixed(0)}M/s</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonHarvest} className="bg-gradient-to-r from-emerald-400 to-green-300 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON MASS PLANTATION HARVEST (+$3 TRILLION)
          </button>
          <button onClick={() => { setCropYield(prev => prev + 500000000); if (soundEnabled) playCoinSound(soundEnabled); }} className="bg-slate-900 border border-emerald-500 text-emerald-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            🚜 Deploy Automated Threshers (+$500M/s)
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-emerald-400 font-bold block pb-1 border-b border-slate-800">📜 HARVEST TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 4. QUANTUM TEXTILE & ARMOR SWEATSHOP
// ============================================================================
export const ForcedLaborSweatshopTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [cloaksCrafted, setCloaksCrafted] = useState(850);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '🧵 Quantum Textile Sweatshop active. Tailors stitching Sovereign Silk & VIP Battle Armor.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cash = cloaksCrafted * 5000000;
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + cash : cash));
    }, 1000);
    return () => clearInterval(interval);
  }, [cloaksCrafted, onUpdateBalance]);

  const handleOneButtonSweatshop = () => {
    setCloaksCrafted(prev => prev + 2500);
    const payout = 1500000000000; // $1.5 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + payout : payout));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON ARMOR WEAVE: Weaved +2,500 VIP Cloaks & credited +$1.5 TRILLION!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-pink-950 via-slate-900 to-rose-950 border-2 border-pink-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-3xl shadow-xl">🧵</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">QUANTUM TEXTILE & ARMOR SWEATSHOP</h2>
              <p className="text-xs text-pink-200">Force tailors to stitch Kevlar nano-jackets and golden Sovereign royal silk robes non-stop.</p>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-pink-500/40 text-center font-mono">
            <p className="text-[10px] text-slate-400 uppercase">Royal Cloaks Weaved</p>
            <p className="text-xl font-black text-pink-300">{cloaksCrafted.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonSweatshop} className="bg-gradient-to-r from-pink-400 to-rose-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON MASS TEXTILE WEAVE (+$1.5 TRILLION)
          </button>
          <button onClick={() => { setCloaksCrafted(prev => prev + 200); if (soundEnabled) playCoinSound(soundEnabled); }} className="bg-slate-900 border border-pink-500 text-pink-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            ✂️ Speed Loom (+200 Cloaks)
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-pink-400 font-bold block pb-1 border-b border-slate-800">📜 SWEATSHOP TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 5. HEAVY TITAN METAL FOUNDRY
// ============================================================================
export const ForcedLaborFoundryTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [ingotsSmelted, setIngotsSmelted] = useState(3200);
  const [furnaceTemp, setFurnaceTemp] = useState(4500); // Deg F
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '🔥 Heavy Titan Metal Foundry blazing at 4,500°F. Shovelers feeding furnace 24/7.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const payout = ingotsSmelted * 8000000;
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + payout : payout));
    }, 1000);
    return () => clearInterval(interval);
  }, [ingotsSmelted, onUpdateBalance]);

  const handleOneButtonFoundry = () => {
    setFurnaceTemp(prev => prev + 2000);
    setIngotsSmelted(prev => prev + 10000);
    const bonus = 4000000000000; // $4 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + bonus : bonus));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON TITAN BLAST FURNACE: Furnace overloaded to 6,500°F & +$4 TRILLION credited!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-orange-950 border-2 border-orange-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl shadow-xl">🔥</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">HEAVY TITAN METAL FOUNDRY</h2>
              <p className="text-xs text-orange-200">Workers shovel coal and raw iron in 5,000°F blast furnaces to pour golden Sovereign ingots.</p>
            </div>
          </div>
          <div className="flex gap-3 font-mono text-center">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-orange-500/40"><p className="text-[10px] text-slate-400 uppercase">Furnace Temp</p><p className="text-xl font-black text-orange-400">{furnaceTemp}°F</p></div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-red-500/40"><p className="text-[10px] text-slate-400 uppercase">Gold Ingots</p><p className="text-xl font-black text-red-300">{ingotsSmelted.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonFoundry} className="bg-gradient-to-r from-orange-400 to-red-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON MAX BLAST FURNACE (+$4 TRILLION)
          </button>
          <button onClick={() => { setFurnaceTemp(prev => prev + 500); setIngotsSmelted(prev => prev + 1000); if (soundEnabled) playCoinSound(soundEnabled); }} className="bg-slate-900 border border-orange-500 text-orange-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            🔨 Shovel Coal Blast (+1,000 Ingots)
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-orange-400 font-bold block pb-1 border-b border-slate-800">📜 FOUNDRY TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 6. HIGH-SECURITY LABOR PRISON BLOCK
// ============================================================================
export const ForcedLaborPrisonTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [inmates, setInmates] = useState(8500);
  const [platesStamped, setPlatesStamped] = useState(145000);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '🔒 High-Security Labor Prison Block locked down. 8,500 inmates stamping VIP license plates.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const revenue = platesStamped * 5000;
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + revenue : revenue));
    }, 1000);
    return () => clearInterval(interval);
  }, [platesStamped, onUpdateBalance]);

  const handleOneButtonPrison = () => {
    setPlatesStamped(prev => prev + 1000000);
    const payout = 2500000000000; // $2.5 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + payout : payout));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON MAXIMUM PRISON OVERHAUL: Stamped +1,000,000 Plates & credited +$2.5 TRILLION!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-slate-950 via-gray-900 to-zinc-950 border-2 border-slate-600/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-600 to-zinc-800 flex items-center justify-center text-3xl shadow-xl border border-slate-500">🔒</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">HIGH-SECURITY LABOR PRISON BLOCK</h2>
              <p className="text-xs text-slate-300">Inmate labor quarrying rock, stamping gold tags, and sweeping high-security corridors.</p>
            </div>
          </div>
          <div className="flex gap-3 font-mono text-center">
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-400 uppercase">Inmates</p><p className="text-xl font-black text-white">{inmates.toLocaleString()}</p></div>
            <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-700"><p className="text-[10px] text-slate-400 uppercase">Plates Stamped</p><p className="text-xl font-black text-amber-300">{platesStamped.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonPrison} className="bg-gradient-to-r from-slate-300 to-slate-100 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON PRISON STAMPING OVERDRIVE (+$2.5 TRILLION)
          </button>
          <button onClick={() => setInmates(prev => prev + 1000)} className="bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            👮 Incarcerate +1,000 New Inmates
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-slate-400 font-bold block pb-1 border-b border-slate-800">📜 PRISON BLOCK TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 7. ORBITAL SPACE STATION CONSTRUCTION YARD
// ============================================================================
export const ForcedLaborOrbitalTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [stationModules, setStationModules] = useState(42);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '🛰️ Orbital Space Station Construction Yard online in zero-G orbit.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const yieldAmt = stationModules * 500000000; // $500M per module
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + yieldAmt : yieldAmt));
    }, 1000);
    return () => clearInterval(interval);
  }, [stationModules, onUpdateBalance]);

  const handleOneButtonOrbital = () => {
    setStationModules(prev => prev + 100);
    const payout = 5000000000000; // $5 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + payout : payout));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON ORBITAL CONSTRUCTION: Launched 100 Space Modules & credited +$5 TRILLION!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 border-2 border-blue-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center text-3xl shadow-xl">🛰️</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">ORBITAL SPACE STATION CONSTRUCTION YARD</h2>
              <p className="text-xs text-blue-200">Zero-G forced labor astronaut spacewalkers welding satellite hulls and planetary thrusters.</p>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-blue-500/40 text-center font-mono">
            <p className="text-[10px] text-slate-400 uppercase">Space Modules</p>
            <p className="text-xl font-black text-cyan-300">{stationModules}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonOrbital} className="bg-gradient-to-r from-blue-400 to-cyan-300 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON ZERO-G ORBITAL EXPANSION (+$5 TRILLION)
          </button>
          <button onClick={() => { setStationModules(prev => prev + 5); if (soundEnabled) playCoinSound(soundEnabled); }} className="bg-slate-900 border border-blue-500 text-blue-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            🚀 Launch +5 Space Modules
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-blue-400 font-bold block pb-1 border-b border-slate-800">📜 ORBITAL YARD TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 8. UNDERGROUND SOVEREIGN VAULT STACKERS
// ============================================================================
export const ForcedLaborVaultTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [goldPallets, setGoldPallets] = useState(1500);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '💰 Sovereign Underground Vault active. Laborers stacking $100M physical cash pallets.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const income = goldPallets * 10000000; // $10M per pallet
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + income : income));
    }, 1000);
    return () => clearInterval(interval);
  }, [goldPallets, onUpdateBalance]);

  const handleOneButtonVault = () => {
    setGoldPallets(prev => prev + 10000);
    const bonus = 10000000000000; // $10 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + bonus : bonus));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON MASS VAULT STACK: Stacked 10,000 Pallets & credited +$10 TRILLION!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-yellow-950 via-slate-900 to-amber-950 border-2 border-yellow-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-3xl shadow-xl">💰</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">UNDERGROUND SOVEREIGN VAULT STACKERS</h2>
              <p className="text-xs text-yellow-200">Laborers carry 100lb gold bars and load physical cash crates into endless subterranean vaults.</p>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-yellow-500/40 text-center font-mono">
            <p className="text-[10px] text-slate-400 uppercase">Cash Pallets Stacked</p>
            <p className="text-xl font-black text-yellow-300">{goldPallets.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonVault} className="bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON MAXIMUM VAULT STACK (+$10 TRILLION)
          </button>
          <button onClick={() => { setGoldPallets(prev => prev + 500); if (soundEnabled) playCoinSound(soundEnabled); }} className="bg-slate-900 border border-yellow-500 text-yellow-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            📦 Stack +500 Gold Pallets
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-yellow-400 font-bold block pb-1 border-b border-slate-800">📜 VAULT TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 9. TOXIC SHIPWRECK & JUNK SCAVENGER BAY
// ============================================================================
export const ForcedLaborSalvageTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [tonnageScrapped, setTonnageScrapped] = useState(25000);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '☣️ Toxic Shipwreck Salvage Bay operational. 25,000 tons of hyper-alloys salvaged.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cash = tonnageScrapped * 1000000;
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + cash : cash));
    }, 1000);
    return () => clearInterval(interval);
  }, [tonnageScrapped, onUpdateBalance]);

  const handleOneButtonSalvage = () => {
    setTonnageScrapped(prev => prev + 500000);
    const payout = 3500000000000; // $3.5 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + payout : payout));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON MASS SHIPWRECK SALVAGE: Scrapped 500,000 Tons & credited +$3.5 TRILLION!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-lime-950 via-slate-900 to-emerald-950 border-2 border-lime-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center text-3xl shadow-xl">☣️</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">TOXIC SHIPWRECK & JUNK SCAVENGER BAY</h2>
              <p className="text-xs text-lime-200">Scavengers cut apart crashed alien cruisers and nuclear reactor cores to extract hyper-alloys.</p>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-lime-500/40 text-center font-mono">
            <p className="text-[10px] text-slate-400 uppercase">Tonnage Scrapped</p>
            <p className="text-xl font-black text-lime-300">{tonnageScrapped.toLocaleString()} TONS</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonSalvage} className="bg-gradient-to-r from-lime-400 to-emerald-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON TOXIC SALVAGE OVERDRIVE (+$3.5 TRILLION)
          </button>
          <button onClick={() => { setTonnageScrapped(prev => prev + 10000); if (soundEnabled) playCoinSound(soundEnabled); }} className="bg-slate-900 border border-lime-500 text-lime-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            🔧 Plasma Cutter Torch (+10,000 Tons)
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-lime-400 font-bold block pb-1 border-b border-slate-800">📜 SALVAGE TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};

// ============================================================================
// 10. FORCED RE-EDUCATION & INDOCTRINATION CAMP
// ============================================================================
export const ForcedLaborAcademyTab: React.FC<ForcedLaborTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
}) => {
  const [graduates, setGraduates] = useState(12400);
  const [logs, setLogs] = useState<Array<{ id: string; time: string; msg: string }>>([
    { id: '1', time: new Date().toLocaleTimeString(), msg: '🎓 Forced Re-Education & Indoctrination Camp initialized. 12,400 recruits undergoing loyalty drills.' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const grant = graduates * 2000000;
      onUpdateBalance(prev => (typeof prev === 'number' ? prev + grant : grant));
    }, 1000);
    return () => clearInterval(interval);
  }, [graduates, onUpdateBalance]);

  const handleOneButtonAcademy = () => {
    setGraduates(prev => prev + 50000);
    const payout = 2000000000000; // $2 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + payout : payout));
    setLogs(prev => [{ id: Math.random().toString(), time: new Date().toLocaleTimeString(), msg: '👑 ONE BUTTON MASS INDOCTRINATION: Graduated +50,000 Devoted Recruits & credited +$2 TRILLION!' }, ...prev]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-5 font-sans">
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-red-950 border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-red-600 flex items-center justify-center text-3xl shadow-xl">🎓</div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">FORCED RE-EDUCATION & INDOCTRINATION CAMP</h2>
              <p className="text-xs text-amber-200">Recruits undergo intense obedience exams, loyalty pledges, and speed-mining drills before entering the workforce.</p>
            </div>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/40 text-center font-mono">
            <p className="text-[10px] text-slate-400 uppercase">Loyal Recruits</p>
            <p className="text-xl font-black text-amber-300">{graduates.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={handleOneButtonAcademy} className="bg-gradient-to-r from-amber-400 to-red-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow hover:scale-105 transition cursor-pointer">
            👑 ONE BUTTON MASS INDOCTRINATION DRILL (+$2 TRILLION)
          </button>
          <button onClick={() => { setGraduates(prev => prev + 5000); if (soundEnabled) playCoinSound(soundEnabled); }} className="bg-slate-900 border border-amber-500 text-amber-300 font-bold text-xs px-4 py-3 rounded-xl hover:bg-slate-800 transition cursor-pointer">
            📢 Conduct Loyalty Pledge (+5,000 Recruits)
          </button>
        </div>
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-40 overflow-y-auto space-y-1">
        <span className="text-amber-400 font-bold block pb-1 border-b border-slate-800">📜 INDOCTRINATION TELEMETRY LOG</span>
        {logs.map(l => (<div key={l.id} className="text-slate-300"><span className="text-slate-500">[{l.time}]</span> {l.msg}</div>))}
      </div>
    </div>
  );
};
