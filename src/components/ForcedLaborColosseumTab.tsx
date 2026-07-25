import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playJackpotSound, playCoinSound, playTickSound } from '../utils/audio';

export interface Gladiator {
  id: string;
  name: string;
  avatar: string;
  title: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  wealth: number;
  vipHouseRank: 'None' | '🏠 Bronze VIP Villa' | '🏛️ Silver VIP Mansion' | '🏰 Gold VIP Estate' | '👑 Imperial $50B VIP Citadel';
  wins: number;
  losses: number;
  status: 'active' | 'fighting' | 'vip_champion' | 'banned_and_liquidated';
  joinedAt: string;
}

export interface CombatLogEvent {
  id: string;
  time: string;
  text: string;
  type: 'strike' | 'victory' | 'ban' | 'payout' | 'system';
}

interface ForcedLaborColosseumTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

const DEFAULT_GLADIATORS: Gladiator[] = [
  { id: 'glad-1', name: 'Apex_Laborer_X', avatar: '🥷', title: '🧱 Senior Brick Hauler', hp: 10000, maxHp: 10000, attack: 1400, defense: 800, wealth: 1500000000, vipHouseRank: 'None', wins: 3, losses: 0, status: 'active', joinedAt: '09:00' },
  { id: 'glad-2', name: 'CryptoWhale_Slave', avatar: '🐳', title: '⛏️ Overtime Miner', hp: 12000, maxHp: 12000, attack: 1200, defense: 1000, wealth: 5000000000, vipHouseRank: 'None', wins: 5, losses: 1, status: 'active', joinedAt: '09:05' },
  { id: 'glad-3', name: 'GigaChad_Subject', avatar: '🦁', title: '🏋️ Heavy Load Transport', hp: 15000, maxHp: 15000, attack: 1800, defense: 1200, wealth: 2500000000, vipHouseRank: 'None', wins: 7, losses: 0, status: 'active', joinedAt: '09:10' },
  { id: 'glad-4', name: 'NoobWorker_2026', avatar: '👶', title: '🧹 Floor Sweeper', hp: 6000, maxHp: 6000, attack: 700, defense: 400, wealth: 100000, vipHouseRank: 'None', wins: 0, losses: 2, status: 'active', joinedAt: '09:12' },
  { id: 'glad-5', name: 'Titan_Forge_Master', avatar: '🔨', title: '🔥 Anvil Smelter', hp: 14000, maxHp: 14000, attack: 1600, defense: 1100, wealth: 8000000000, vipHouseRank: 'None', wins: 4, losses: 1, status: 'active', joinedAt: '09:15' },
  { id: 'glad-6', name: 'Quantum_Printer_007', avatar: '🤖', title: '🖨️ Money Press Operator', hp: 11000, maxHp: 11000, attack: 1500, defense: 900, wealth: 12000000000, vipHouseRank: 'None', wins: 2, losses: 0, status: 'active', joinedAt: '09:18' },
  { id: 'glad-7', name: 'Shadow_Ninja_Servant', avatar: '⚔️', title: '🥷 Night Shift Guard', hp: 9500, maxHp: 9500, attack: 1900, defense: 600, wealth: 3400000000, vipHouseRank: 'None', wins: 6, losses: 2, status: 'active', joinedAt: '09:20' },
  { id: 'glad-8', name: 'Gold_Digger_Alpha', avatar: '💰', title: '💎 Vault Loader', hp: 10500, maxHp: 10500, attack: 1300, defense: 850, wealth: 9000000000, vipHouseRank: 'None', wins: 1, losses: 1, status: 'active', joinedAt: '09:22' },
];

const PRESET_NAMES = [
  'Vip_Gladiator_99', 'Spartan_Slave_77', 'Cyber_Laborer_X', 'Iron_Worker_500',
  'Overlord_Pawn_01', 'Matrix_Servant_2026', 'Atomic_Driller_88', 'Hyper_Builder_33',
  'Omega_Excavator', 'Void_Scavenger', 'Robo_Laborer_9000', 'Titan_Breaker_101'
];

const PRESET_AVATARS = ['🥊', '⚔️', '🥷', '🦁', '👹', '🤖', '🔨', '🛡️', '⚡', '🔥', '🐉', '💀'];

export const ForcedLaborColosseumTab: React.FC<ForcedLaborColosseumTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
}) => {
  // Roster of Gladiators
  const [gladiators, setGladiators] = useState<Gladiator[]>(() => {
    try {
      const saved = localStorage.getItem('powerball_colosseum_gladiators');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_GLADIATORS;
  });

  // Save roster
  useEffect(() => {
    try {
      localStorage.setItem('powerball_colosseum_gladiators', JSON.stringify(gladiators));
    } catch (e) {}
  }, [gladiators]);

  // Active Battle State
  const [isFighting, setIsFighting] = useState<boolean>(false);
  const [fighter1, setFighter1] = useState<Gladiator | null>(null);
  const [fighter2, setFighter2] = useState<Gladiator | null>(null);
  const [fighter1Hp, setFighter1Hp] = useState<number>(0);
  const [fighter2Hp, setFighter2Hp] = useState<number>(0);
  const [battleRound, setBattleRound] = useState<number>(0);
  const [lastStrikeMsg, setLastStrikeMsg] = useState<string>('Select two forced laborers and enter the Colosseum!');

  // Confiscated Treasury Vault ($ from banned losers)
  const [confiscatedTreasury, setConfiscatedTreasury] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('powerball_colosseum_confiscated');
      if (saved) return Number(saved);
    } catch (e) {}
    return 150000000000; // $150B starting treasury
  });

  useEffect(() => {
    try {
      localStorage.setItem('powerball_colosseum_confiscated', confiscatedTreasury.toString());
    } catch (e) {}
  }, [confiscatedTreasury]);

  // Combat Logs
  const [logs, setLogs] = useState<CombatLogEvent[]>([
    { id: '1', time: new Date().toLocaleTimeString(), text: '🏛️ FORCED LABOR COLOSSEUM ARENA ONLINE: $50 Billion prize & VIP Houses enabled for champions!', type: 'system' },
    { id: '2', time: new Date().toLocaleTimeString(), text: '🚫 DEFEAT RULE: Losers will have 100% of their money confiscated & will be PERMANENTLY BANNED from the software.', type: 'ban' }
  ]);

  const addLog = useCallback((text: string, type: CombatLogEvent['type'] = 'system') => {
    const time = new Date().toLocaleTimeString();
    const id = Math.random().toString();
    setLogs(prev => [{ id, time, text, type }, ...prev].slice(0, 100));
  }, []);

  // Admin / Overlord Cheats
  const [riggedGladiatorId, setRiggedGladiatorId] = useState<string>('');
  const [autoTournamentActive, setAutoTournamentActive] = useState<boolean>(false);
  const [autoSimSpeedMs, setAutoSimSpeedMs] = useState<number>(400);

  // Selected Fighters for Manual Duel
  const [selectedFighter1Id, setSelectedFighter1Id] = useState<string>('');
  const [selectedFighter2Id, setSelectedFighter2Id] = useState<string>('');

  // Spawn New Gladiator
  const handleSpawnGladiator = (count: number = 1) => {
    const newGlads: Gladiator[] = [];
    for (let i = 0; i < count; i++) {
      const name = PRESET_NAMES[Math.floor(Math.random() * PRESET_NAMES.length)] + '_' + Math.floor(Math.random() * 999);
      const avatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
      const baseHp = Math.floor(Math.random() * 8000) + 8000;
      const initialWealth = Math.floor(Math.random() * 10000000000) + 1000000000;

      newGlads.push({
        id: 'glad-gen-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substring(2, 6),
        name,
        avatar,
        title: '⛏️ Drafted Forced Laborer',
        hp: baseHp,
        maxHp: baseHp,
        attack: Math.floor(Math.random() * 800) + 1000,
        defense: Math.floor(Math.random() * 500) + 500,
        wealth: initialWealth,
        vipHouseRank: 'None',
        wins: 0,
        losses: 0,
        status: 'active',
        joinedAt: new Date().toLocaleTimeString(),
      });
    }

    setGladiators(prev => [...prev, ...newGlads]);
    addLog(`➕ Drafted ${count} new forced laborer(s) into the Colosseum Roster.`, 'system');
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // Reset All Gladiators (unban)
  const handleResetRoster = () => {
    setGladiators(DEFAULT_GLADIATORS);
    addLog('🔄 Colosseum roster reset to default active forced labor units.', 'system');
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // Execute 1v1 Deathmatch
  const runDeathmatch = useCallback(async (g1: Gladiator, g2: Gladiator) => {
    setIsFighting(true);
    setFighter1(g1);
    setFighter2(g2);
    setFighter1Hp(g1.hp);
    setFighter2Hp(g2.hp);
    setBattleRound(0);

    addLog(`⚔️ DEATHMATCH BEGUN: [${g1.avatar} ${g1.name}] vs [${g2.avatar} ${g2.name}]!`, 'strike');
    if (soundEnabled) playTickSound(soundEnabled);

    let curHp1 = g1.hp;
    let curHp2 = g2.hp;
    let round = 0;

    const battleLoop = setInterval(() => {
      round++;
      setBattleRound(round);

      // Check for Rigged Cheat
      const g1IsRigged = riggedGladiatorId === g1.id;
      const g2IsRigged = riggedGladiatorId === g2.id;

      // Fighter 1 attacks Fighter 2
      let dmg1 = Math.floor(Math.random() * g1.attack) + 300 - Math.floor(g2.defense * 0.2);
      if (dmg1 < 100) dmg1 = 100;
      if (g1IsRigged) dmg1 = 999999;

      curHp2 -= dmg1;
      if (curHp2 < 0) curHp2 = 0;
      setFighter2Hp(curHp2);

      addLog(`💥 Round ${round}: [${g1.name}] strikes [${g2.name}] for ${dmg1.toLocaleString()} DMG! (${curHp2.toLocaleString()} HP left)`, 'strike');

      if (curHp2 <= 0) {
        clearInterval(battleLoop);
        finalizeBattle(g1, g2);
        return;
      }

      // Fighter 2 attacks Fighter 1
      let dmg2 = Math.floor(Math.random() * g2.attack) + 300 - Math.floor(g1.defense * 0.2);
      if (dmg2 < 100) dmg2 = 100;
      if (g2IsRigged) dmg2 = 999999;

      curHp1 -= dmg2;
      if (curHp1 < 0) curHp1 = 0;
      setFighter1Hp(curHp1);

      addLog(`⚡ Round ${round}: [${g2.name}] counters [${g1.name}] for ${dmg2.toLocaleString()} DMG! (${curHp1.toLocaleString()} HP left)`, 'strike');

      if (curHp1 <= 0) {
        clearInterval(battleLoop);
        finalizeBattle(g2, g1);
        return;
      }
    }, autoSimSpeedMs);
  }, [riggedGladiatorId, autoSimSpeedMs, addLog, soundEnabled]);

  // Finalize Battle Results: Winner gets $50B + VIP House; Loser gets 100% cash seized & BANNED FROM SOFTWARE!
  const finalizeBattle = (winner: Gladiator, loser: Gladiator) => {
    setIsFighting(false);

    const fiftyBillion = 50000000000;
    const seizedCash = loser.wealth;

    // Update Winner: +$50 Billion, VIP House Rank, Wins +1, Status = 'vip_champion'
    // Update Loser: Wealth = 0, Losses +1, Status = 'banned_and_liquidated'
    setGladiators(prev => prev.map(g => {
      if (g.id === winner.id) {
        return {
          ...g,
          wealth: g.wealth + fiftyBillion,
          vipHouseRank: '👑 Imperial $50B VIP Citadel',
          wins: g.wins + 1,
          status: 'vip_champion',
          hp: g.maxHp, // Restore HP
        };
      }
      if (g.id === loser.id) {
        return {
          ...g,
          wealth: 0,
          losses: g.losses + 1,
          status: 'banned_and_liquidated',
          hp: 0,
        };
      }
      return g;
    }));

    // Add seized cash to Overlord Confiscated Treasury & Overlord Balance
    setConfiscatedTreasury(prev => prev + seizedCash);
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + fiftyBillion + seizedCash : fiftyBillion + seizedCash));

    // Logs
    addLog(`🏆 GLADIATOR DEFEATED! Winner: [${winner.avatar} ${winner.name}]!`, 'victory');
    addLog(`💰 PRIZE AWARDED: [${winner.name}] won $50,000,000,000 & ranked up to 👑 Imperial $50B VIP Citadel House!`, 'payout');
    addLog(`🚫 SOFTWARE BAN: [${loser.avatar} ${loser.name}] lost $${seizedCash.toLocaleString()} (Confiscated) & is PERMANENTLY BANNED FROM SOFTWARE!`, 'ban');

    setLastStrikeMsg(`🏆 CHAMPION: ${winner.name} won $50 Billion & VIP House! 🚫 BANNED: ${loser.name} lost all money & software access!`);

    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // Launch Selected Manual Duel
  const handleStartManualDuel = () => {
    const activeList = gladiators.filter(g => g.status !== 'banned_and_liquidated');
    if (activeList.length < 2) {
      addLog('⚠️ Not enough active forced laborers! Draft new gladiator workers.', 'system');
      return;
    }

    let g1 = activeList.find(g => g.id === selectedFighter1Id);
    let g2 = activeList.find(g => g.id === selectedFighter2Id);

    if (!g1 || !g2 || g1.id === g2.id) {
      // Pick random 2
      g1 = activeList[0];
      g2 = activeList[1];
    }

    runDeathmatch(g1, g2);
  };

  // ONE BUTTON TO RULE THE COLOSSEUM: Instant Mass Tournament to the death across all active forced labor
  const handleOneButtonMassTournament = async () => {
    const activeList = gladiators.filter(g => g.status !== 'banned_and_liquidated');
    if (activeList.length < 2) {
      handleSpawnGladiator(4);
    }

    addLog('👑 ONE BUTTON TO RULE THE COLOSSEUM ACTIVATED: Instant Mass Deathmatch across all forced labor!', 'system');

    // Filter available
    let pool = [...gladiators.filter(g => g.status !== 'banned_and_liquidated')];
    if (pool.length < 2) {
      addLog('⚠️ Drafted emergency forced labor units for tournament.', 'system');
      return;
    }

    // Pick top 2 and run immediate clash
    const g1 = pool[Math.floor(Math.random() * pool.length)];
    let g2 = pool[Math.floor(Math.random() * pool.length)];
    while (g2.id === g1.id) {
      g2 = pool[Math.floor(Math.random() * pool.length)];
    }

    runDeathmatch(g1, g2);
  };

  // Instant Smite / Overlord Strike
  const handleSmiteGladiator = (id: string) => {
    const target = gladiators.find(g => g.id === id);
    if (!target) return;

    const seized = target.wealth;
    setGladiators(prev => prev.map(g => {
      if (g.id === id) {
        return {
          ...g,
          wealth: 0,
          hp: 0,
          status: 'banned_and_liquidated'
        };
      }
      return g;
    }));

    setConfiscatedTreasury(prev => prev + seized);
    addLog(`⚡ OVERLORD SMITE: Vaporized [${target.name}]! Seized $${seized.toLocaleString()} & BANNED FROM SOFTWARE!`, 'ban');
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // Active vs Banned counts
  const activeGladiators = gladiators.filter(g => g.status !== 'banned_and_liquidated');
  const vipChampions = gladiators.filter(g => g.status === 'vip_champion');
  const bannedGladiators = gladiators.filter(g => g.status === 'banned_and_liquidated');

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ARENA HERO BANNER */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-2 border-red-500/80 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 text-9xl font-black text-red-500 pointer-events-none select-none">
          ⚔️ COLOSSEUM
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-amber-500 to-yellow-400 flex items-center justify-center text-3xl shadow-2xl border-2 border-amber-300 animate-pulse">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-wider uppercase">
                  FORCED LABOR GLADIATOR COLOSSEUM
                </h2>
                <span className="bg-red-600 text-white text-[10px] px-3 py-0.5 rounded-full font-black uppercase ring-2 ring-red-400 animate-pulse">
                  DEATHMATCH ARENA
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium pt-1 max-w-xl">
                Forced laborers battle to the death! The winner claims <strong className="text-amber-300">$50 Billion Dollars</strong> and ranks up to <strong className="text-amber-300">👑 VIP House Status</strong>. The loser has <strong className="text-red-400">100% of their money confiscated</strong> and is <strong className="text-red-400 font-black">PERMANENTLY BANNED FROM THE SOFTWARE</strong>.
              </p>
            </div>
          </div>

          {/* STATS SUMMARY BOXES */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/90 border border-amber-500/50 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Active Laborers</p>
              <p className="font-mono text-2xl font-black text-amber-400">{activeGladiators.length}</p>
            </div>
            <div className="bg-slate-950/90 border border-yellow-400/60 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">$50B VIP Champions</p>
              <p className="font-mono text-2xl font-black text-yellow-300">{vipChampions.length} 👑</p>
            </div>
            <div className="bg-slate-950/90 border border-red-500/60 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Banned & Liquidated</p>
              <p className="font-mono text-2xl font-black text-red-500">{bannedGladiators.length} 🚫</p>
            </div>
            <div className="bg-slate-950/90 border border-emerald-500/60 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Confiscated Vault</p>
              <p className="font-mono text-xl font-black text-emerald-400">${confiscatedTreasury.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ONE BUTTON TO RULE THE COLOSSEUM ACTION BAR */}
        <div className="pt-4 border-t border-red-800/50 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOneButtonMassTournament}
              disabled={isFighting}
              className="bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-xl shadow-red-500/30 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center space-x-2 border-2 border-amber-200 cursor-pointer"
            >
              <span className="text-xl">👑</span>
              <span>ONE BUTTON TO RULE THE COLOSSEUM! ($50B WINNER / LOSER BANNED)</span>
            </button>

            <button
              onClick={() => handleSpawnGladiator(4)}
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-extrabold text-xs px-4 py-3 rounded-xl border border-amber-500/40 transition cursor-pointer"
            >
              ➕ Draft +4 Forced Laborers
            </button>

            <button
              onClick={handleResetRoster}
              className="bg-slate-950 hover:bg-slate-900 text-slate-400 font-bold text-xs px-3 py-3 rounded-xl border border-slate-800 transition cursor-pointer"
            >
              🔄 Reset Roster
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-bold">Battle Speed:</span>
            <select
              value={autoSimSpeedMs}
              onChange={e => setAutoSimSpeedMs(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value={100}>⚡ Instant (100ms)</option>
              <option value={400}>⚔️ Fast (400ms)</option>
              <option value={800}>🎬 Cinematic (800ms)</option>
            </select>
          </div>
        </div>
      </div>

      {/* COLOSSEUM BATTLE CANVAS & DUAL FIGHTERS DISPLAY */}
      <div className="bg-slate-950 border-2 border-amber-500/80 rounded-2xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-center border-b border-amber-900/50 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            <span className="font-extrabold text-sm text-amber-400 uppercase tracking-wider">
              ⚔️ LIVE COLOSSEUM DEATHMATCH STADIUM
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            {isFighting ? `ROUND ${battleRound} IN PROGRESS` : 'READY FOR BATTLE'}
          </span>
        </div>

        {/* FIGHTERS DUAL ARENA STAGE */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* FIGHTER 1 CARD */}
          <div className={`md:col-span-5 bg-slate-900/90 border-2 rounded-2xl p-5 space-y-3 transition-all ${
            fighter1Hp > 0 ? 'border-amber-400 shadow-amber-500/20' : 'border-red-900 opacity-60'
          }`}>
            {fighter1 ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl bg-slate-950 p-2 rounded-xl border border-amber-500/40">{fighter1.avatar}</span>
                    <div>
                      <h4 className="font-black text-base text-white">{fighter1.name}</h4>
                      <p className="text-xs text-amber-400 font-mono">{fighter1.title}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-950 text-amber-300 font-mono font-bold px-2.5 py-1 rounded border border-amber-500/40">
                    {fighter1.vipHouseRank}
                  </span>
                </div>

                {/* HP BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-extrabold">
                    <span className="text-slate-400">HEALTH</span>
                    <span className={fighter1Hp > 3000 ? 'text-emerald-400' : 'text-red-400'}>
                      {fighter1Hp.toLocaleString()} / {fighter1.maxHp.toLocaleString()} HP
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-200"
                      style={{ width: `${Math.max(0, Math.min(100, (fighter1Hp / fighter1.maxHp) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center pt-1 border-t border-slate-800">
                  <div className="bg-slate-950 p-1.5 rounded text-amber-300">ATK: {fighter1.attack}</div>
                  <div className="bg-slate-950 p-1.5 rounded text-cyan-300">DEF: {fighter1.defense}</div>
                  <div className="bg-slate-950 p-1.5 rounded text-emerald-300">${(fighter1.wealth / 1e9).toFixed(1)}B</div>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                No Fighter 1 selected. Choose a gladiator or click 'One Button'!
              </div>
            )}
          </div>

          {/* VS BADGE & STATUS */}
          <div className="md:col-span-2 text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 flex items-center justify-center font-black text-2xl text-slate-950 shadow-2xl border-2 border-amber-300 animate-bounce">
              VS
            </div>
            <p className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">
              DEATHMATCH
            </p>
          </div>

          {/* FIGHTER 2 CARD */}
          <div className={`md:col-span-5 bg-slate-900/90 border-2 rounded-2xl p-5 space-y-3 transition-all ${
            fighter2Hp > 0 ? 'border-amber-400 shadow-amber-500/20' : 'border-red-900 opacity-60'
          }`}>
            {fighter2 ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl bg-slate-950 p-2 rounded-xl border border-amber-500/40">{fighter2.avatar}</span>
                    <div>
                      <h4 className="font-black text-base text-white">{fighter2.name}</h4>
                      <p className="text-xs text-amber-400 font-mono">{fighter2.title}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-amber-950 text-amber-300 font-mono font-bold px-2.5 py-1 rounded border border-amber-500/40">
                    {fighter2.vipHouseRank}
                  </span>
                </div>

                {/* HP BAR */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-extrabold">
                    <span className="text-slate-400">HEALTH</span>
                    <span className={fighter2Hp > 3000 ? 'text-emerald-400' : 'text-red-400'}>
                      {fighter2Hp.toLocaleString()} / {fighter2.maxHp.toLocaleString()} HP
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 rounded-full transition-all duration-200"
                      style={{ width: `${Math.max(0, Math.min(100, (fighter2Hp / fighter2.maxHp) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-center pt-1 border-t border-slate-800">
                  <div className="bg-slate-950 p-1.5 rounded text-amber-300">ATK: {fighter2.attack}</div>
                  <div className="bg-slate-950 p-1.5 rounded text-cyan-300">DEF: {fighter2.defense}</div>
                  <div className="bg-slate-950 p-1.5 rounded text-emerald-300">${(fighter2.wealth / 1e9).toFixed(1)}B</div>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                No Fighter 2 selected. Choose a gladiator or click 'One Button'!
              </div>
            )}
          </div>
        </div>

        {/* LAST STRIKE TELEMETRY TICKER */}
        <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-3 text-center font-mono text-xs text-amber-300 font-extrabold shadow">
          {lastStrikeMsg}
        </div>
      </div>

      {/* MANUAL DUEL & RIGGED CHEATS PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MANUAL FIGHT LAUNCHER */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <span className="font-mono text-xs font-black text-amber-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
            ⚔️ MANUAL 1V1 GLADIATOR MATCHMAKER
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block pb-1 font-bold">Select Red Corner:</label>
              <select
                value={selectedFighter1Id}
                onChange={e => setSelectedFighter1Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
              >
                <option value="">Auto Pick Active Laborer</option>
                {activeGladiators.map(g => (
                  <option key={g.id} value={g.id}>{g.avatar} {g.name} (${(g.wealth / 1e9).toFixed(1)}B)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block pb-1 font-bold">Select Blue Corner:</label>
              <select
                value={selectedFighter2Id}
                onChange={e => setSelectedFighter2Id(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
              >
                <option value="">Auto Pick Active Laborer</option>
                {activeGladiators.map(g => (
                  <option key={g.id} value={g.id}>{g.avatar} {g.name} (${(g.wealth / 1e9).toFixed(1)}B)</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleStartManualDuel}
            disabled={isFighting}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
          >
            ⚔️ START 1V1 DEATHMATCH DUEL NOW!
          </button>
        </div>

        {/* OVERLORD RIGGED CHEAT PANEL */}
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 space-y-4">
          <span className="font-mono text-xs font-black text-amber-400 uppercase tracking-wider block border-b border-slate-800 pb-2">
            👑 OVERLORD RIGGED CHAMPION CHEAT
          </span>

          <div>
            <label className="text-slate-400 text-xs block pb-1 font-bold">Force Guaranteed Winner (100% Win Rate):</label>
            <select
              value={riggedGladiatorId}
              onChange={e => setRiggedGladiatorId(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/60 text-amber-300 rounded-lg p-2 font-mono text-xs font-bold"
            >
              <option value="">Fair Odds (No Cheat)</option>
              {activeGladiators.map(g => (
                <option key={g.id} value={g.id}>👑 {g.avatar} {g.name} (ALWAYS DEALS 999,999 DMG)</option>
              ))}
            </select>
          </div>

          <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2.5 rounded border border-slate-800">
            {riggedGladiatorId ? `👑 RIGGED: Selected gladiator will instantly strike for 999,999 DMG in every match!` : `⚖️ FAIR MATCHES: Both gladiators rely on attack & defense stats.`}
          </div>
        </div>
      </div>

      {/* GLADIATOR ROSTER TABLE */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap justify-between items-center border-b border-slate-800 pb-3 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-black text-sm text-white uppercase tracking-wider">
              📋 FORCED LABORERS & GLADIATORS ROSTER ({gladiators.length})
            </span>
          </div>

          <div className="flex space-x-2 text-xs">
            <span className="bg-amber-950 text-amber-300 px-3 py-1 rounded border border-amber-800 font-mono">
              Active: {activeGladiators.length}
            </span>
            <span className="bg-yellow-950 text-yellow-300 px-3 py-1 rounded border border-yellow-800 font-mono">
              VIP Champions: {vipChampions.length}
            </span>
            <span className="bg-red-950 text-red-300 px-3 py-1 rounded border border-red-800 font-mono">
              Banned & Liquidated: {bannedGladiators.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2 px-3">Gladiator</th>
                <th className="py-2 px-3">VIP House Rank</th>
                <th className="py-2 px-3">Wealth ($)</th>
                <th className="py-2 px-3">Record (W/L)</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {gladiators.map(g => {
                const isBanned = g.status === 'banned_and_liquidated';
                const isVip = g.status === 'vip_champion';

                return (
                  <tr key={g.id} className={`hover:bg-slate-900/60 transition ${isBanned ? 'opacity-40 bg-red-950/10' : isVip ? 'bg-amber-950/20' : ''}`}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{g.avatar}</span>
                        <div>
                          <strong className="text-white block font-sans">{g.name}</strong>
                          <span className="text-[10px] text-slate-500">{g.title}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isVip ? 'bg-yellow-950 text-yellow-300 border border-yellow-500' : 'text-slate-400 bg-slate-900'
                      }`}>
                        {g.vipHouseRank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      ${g.wealth.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      <span className="text-emerald-400 font-bold">{g.wins}W</span> / <span className="text-red-400 font-bold">{g.losses}L</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {isBanned ? (
                        <span className="bg-red-950 text-red-400 font-black px-2 py-0.5 rounded border border-red-800 text-[10px]">
                          🚫 BANNED & LIQUIDATED
                        </span>
                      ) : isVip ? (
                        <span className="bg-amber-950 text-amber-300 font-black px-2 py-0.5 rounded border border-amber-500 text-[10px] animate-pulse">
                          👑 $50B VIP CHAMPION
                        </span>
                      ) : (
                        <span className="bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          ⚔️ ACTIVE LABORER
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {!isBanned && (
                        <button
                          onClick={() => handleSmiteGladiator(g.id)}
                          className="bg-red-950 hover:bg-red-900 text-red-300 text-[10px] font-bold px-2.5 py-1 rounded border border-red-800 cursor-pointer"
                        >
                          ⚡ Smite & Ban
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMBAT TELEMETRY LOG PANEL */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
          <span className="font-extrabold text-xs text-amber-400 uppercase tracking-wider">
            📜 LIVE COLOSSEUM COMBAT & BAN TELEMETRY LOG
          </span>
          <button
            onClick={() => setLogs([])}
            className="text-[10px] bg-slate-900 text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
          >
            Clear Log
          </button>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {logs.map(log => {
            let badge = 'text-slate-300 bg-slate-950 border-slate-800';
            if (log.type === 'strike') badge = 'text-amber-300 bg-amber-950/40 border-amber-800';
            if (log.type === 'victory') badge = 'text-yellow-300 bg-yellow-950/60 border-yellow-500 font-bold';
            if (log.type === 'payout') badge = 'text-emerald-300 bg-emerald-950/60 border-emerald-500 font-black';
            if (log.type === 'ban') badge = 'text-red-300 bg-red-950/70 border-red-600 font-extrabold';

            return (
              <div key={log.id} className={`text-[11px] px-2.5 py-1 rounded border ${badge}`}>
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
