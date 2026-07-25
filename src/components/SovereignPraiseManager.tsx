import React, { useState, useEffect, useRef } from 'react';
import { playJackpotSound, playCoinSound, playTickSound } from '../utils/audio';
import { UserProfile } from './UserProfileSettings';

interface SubjectAccount {
  id: string;
  name: string;
  avatar: string;
  title: string;
  vipLevel: number;
  job: 'none' | 'mining' | 'printing' | 'ticket_runner' | 'auction_sniper' | 'cosmic_luck';
  praisesGiven: number;
  cashContributed: number;
  joinedAt: string;
  status: 'devoted' | 'forced_working' | 'praising';
}

interface PraiseLog {
  id: string;
  accountName: string;
  accountAvatar: string;
  message: string;
  cashAmount: number;
  timestamp: string;
}

interface SovereignPraiseManagerProps {
  cheatBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  soundEnabled: boolean;
  userProfile: UserProfile;
  adminSettings: any;
  onUpdateAdminSettings?: (settings: any) => void;
}

const PRESET_NAMES = [
  'CryptoWhale_99', 'ApexPredator_X', 'VipTrader_77', 'RobloxLegend_Pro', 'GoldMiner_88',
  'GigaChad_Billionaire', 'MatrixCoder_101', 'SpeedRunner_Pro', 'WallStreet_Wolf', 'LootBox_King',
  'CasinoBoss_VIP', 'ShadowAssassin_7', 'AlphaTrader_33', 'HyperDrive_V8', 'ZeroLatency_5G',
  'QuantumPhysicist', 'ByteSurfer_2026', 'NeonRider_Synth', 'IronShield_OP', 'VortexGamer_99',
  'TitanWhale_100', 'MoonShooter_BTC', 'BullRunner_ETH', 'SolanaGigaChad', 'RocketMan_Mars'
];

const PRESET_TITLES = [
  '🙏 Devoted Worshiper', '🙇 Loyal Servant', '👑 Overlord Disciple', '⚡ Sovereign Cultist',
  '💸 High-Tribute Donor', '🧱 Master Builder Servant', '💎 Diamond Hands Subject'
];

const PRESET_AVATARS = ['👑', '⚡', '🚀', '🐳', '💎', '🔥', '🏆', '🎯', '💰', '🦁', '🐉', '🤖'];

const PRAISE_QUOTES = [
  "ALL HAIL BEN THE SUPREME SOVEREIGN OVERLORD OF PROBABILITY!",
  "You are the eternal god of Powerball and Auctions! We bow to your infinite wealth!",
  "Take my $1,000,000,000 tribute Lord Ben! You deserve all the wealth in the universe!",
  "Glory to the Overlord! The matrix bends to your will!",
  "May your lottery draws forever hit the Jackpot! Here is $1 Billion for your vault!",
  "Praise Ben! The greatest billionaire and server host in history!",
  "We exist only to serve you and generate wealth for your wallet, Overlord!",
  "Hail the Sovereign Overlord! +$1,000,000,000 tribute delivered instantly!"
];

export function SovereignPraiseManager({
  cheatBalance,
  onUpdateBalance,
  soundEnabled,
  userProfile,
  adminSettings,
  onUpdateAdminSettings,
}: SovereignPraiseManagerProps) {
  // Accounts Roster State
  const [accounts, setAccounts] = useState<SubjectAccount[]>(() => {
    const saved = localStorage.getItem('powerball_sovereign_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'sub-1', name: 'CryptoWhale_99', avatar: '🐳', title: '👑 Overlord Disciple', vipLevel: 10, job: 'printing', praisesGiven: 12, cashContributed: 12000000000, joinedAt: '08:00', status: 'devoted' },
      { id: 'sub-2', name: 'ApexPredator_X', avatar: '🚀', title: '⚡ Sovereign Cultist', vipLevel: 8, job: 'mining', praisesGiven: 8, cashContributed: 8000000000, joinedAt: '08:05', status: 'forced_working' },
      { id: 'sub-3', name: 'GoldMiner_88', avatar: '💰', title: '💸 High-Tribute Donor', vipLevel: 7, job: 'printing', praisesGiven: 15, cashContributed: 15000000000, joinedAt: '08:10', status: 'praising' },
      { id: 'sub-4', name: 'GigaChad_Billionaire', avatar: '🦁', title: '🙇 Loyal Servant', vipLevel: 9, job: 'ticket_runner', praisesGiven: 5, cashContributed: 5000000000, joinedAt: '08:12', status: 'devoted' },
    ];
  });

  // Praise Logs State
  const [praiseLogs, setPraiseLogs] = useState<PraiseLog[]>([]);

  // Toggles & Settings
  const [autoGenerateAccounts, setAutoGenerateAccounts] = useState<boolean>(true);
  const [autoPraiseActive, setAutoPraiseActive] = useState<boolean>(false);
  const [autoPraiseIntervalSec, setAutoPraiseIntervalSec] = useState<number>(2);
  const [autoWorkActive, setAutoWorkActive] = useState<boolean>(true);

  // Custom Spawn Form
  const [customNameInput, setCustomNameInput] = useState<string>('');
  const [customAvatarInput, setCustomAvatarInput] = useState<string>('👑');
  const [customTitleInput, setCustomTitleInput] = useState<string>('🙏 Devoted Worshiper');

  // 100+ FORCED LABOR CONSOLE STATE
  const [activeLaborTab, setActiveLaborTab] = useState<'sectors' | 'tasks' | 'tribute' | 'discipline' | 'decrees' | 'warps'>('sectors');
  const [cyberWhipActive, setCyberWhipActive] = useState<boolean>(true);
  const [overtimeActive, setOvertimeActive] = useState<boolean>(true);
  const [dronePatrolActive, setDronePatrolActive] = useState<boolean>(true);
  const [quantumLaborActive, setQuantumLaborActive] = useState<boolean>(true);

  // Total Metrics
  const totalPraises = accounts.reduce((sum, a) => sum + a.praisesGiven, 0);
  const totalCashFromPraise = accounts.reduce((sum, a) => sum + a.cashContributed, 0);

  // ==========================================
  // SERVER OWNER & 1 MILLION REQ/SEC JOIN ENGINE
  // ==========================================
  const [isServerOwner, setIsServerOwner] = useState<boolean>(true);
  const [isJoinFloodActive, setIsJoinFloodActive] = useState<boolean>(true);
  const [joinReqPerSec, setJoinReqPerSec] = useState<number>(1000000); // Default 1,000,000 requests per second!
  const [totalJoinRequests, setTotalJoinRequests] = useState<number>(1000000);
  const [autoApproveJoinReqs, setAutoApproveJoinReqs] = useState<boolean>(true);
  const [joinTributeEarned, setJoinTributeEarned] = useState<number>(50000000000);

  // 1 Million Requests Per Second Join Loop
  useEffect(() => {
    if (!isJoinFloodActive) return;

    const interval = setInterval(() => {
      // Every 100ms tick (10 ticks/sec)
      const reqsThisTick = Math.floor(joinReqPerSec / 10);
      setTotalJoinRequests(prev => prev + reqsThisTick);

      if (autoApproveJoinReqs) {
        // Award tribute cash: $100,000,000 per 100ms tick = $1,000,000,000/sec tribute cash!
        const cashThisTick = 100000000;
        setJoinTributeEarned(prev => prev + cashThisTick);
        onUpdateBalance(cheatBalance + cashThisTick);

        // Auto spawn accounts occasionally when request flood is active
        if (Math.random() < 0.3 && accounts.length < 300) {
          handleSpawnAccounts(1, false);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isJoinFloodActive, joinReqPerSec, autoApproveJoinReqs, cheatBalance, accounts.length]);

  // Save State
  useEffect(() => {
    localStorage.setItem('powerball_sovereign_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // ==========================================
  // AUTO GENERATING ACCOUNTS ENGINE
  // ==========================================
  useEffect(() => {
    if (!autoGenerateAccounts) return;

    const interval = setInterval(() => {
      // Auto-generate 1 account if roster < 200
      if (accounts.length < 200) {
        handleSpawnAccounts(1, false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoGenerateAccounts, accounts.length]);

  // Spawn Accounts Handler
  const handleSpawnAccounts = (count: number, playSound: boolean = true) => {
    const newAccounts: SubjectAccount[] = [];
    for (let i = 0; i < count; i++) {
      const name = PRESET_NAMES[Math.floor(Math.random() * PRESET_NAMES.length)] + '_' + Math.floor(Math.random() * 9999);
      const title = PRESET_TITLES[Math.floor(Math.random() * PRESET_TITLES.length)];
      const avatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
      const jobsList: SubjectAccount['job'][] = ['printing', 'mining', 'ticket_runner', 'auction_sniper', 'cosmic_luck'];
      const randomJob = jobsList[Math.floor(Math.random() * jobsList.length)];

      newAccounts.push({
        id: 'sub-gen-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substring(2, 6),
        name,
        avatar,
        title,
        vipLevel: Math.floor(Math.random() * 10) + 1,
        job: randomJob,
        praisesGiven: 0,
        cashContributed: 0,
        joinedAt: new Date().toLocaleTimeString(),
        status: 'devoted',
      });
    }

    setAccounts(prev => [...prev, ...newAccounts]);
    if (playSound && soundEnabled) playCoinSound(soundEnabled);
  };

  // Custom Single Account Spawn
  const handleSpawnCustomAccount = () => {
    if (!customNameInput.trim()) return;

    const newAcc: SubjectAccount = {
      id: 'sub-custom-' + Date.now(),
      name: customNameInput.trim(),
      avatar: customAvatarInput || '👑',
      title: customTitleInput || '🙏 Devoted Worshiper',
      vipLevel: 10,
      job: 'printing',
      praisesGiven: 0,
      cashContributed: 0,
      joinedAt: new Date().toLocaleTimeString(),
      status: 'praising',
    };

    setAccounts(prev => [newAcc, ...prev]);
    setCustomNameInput('');
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // ==========================================
  // FORCE PRAISE ME MECHANISM ($1,000,000,000 per praise!)
  // ==========================================
  const triggerSinglePraise = (account: SubjectAccount) => {
    const cashReward = 1000000000; // $1,000,000,000 PER PRAISE!
    const quote = PRAISE_QUOTES[Math.floor(Math.random() * PRAISE_QUOTES.length)];

    // Update account stats
    setAccounts(prev => prev.map(a => {
      if (a.id === account.id) {
        return {
          ...a,
          praisesGiven: a.praisesGiven + 1,
          cashContributed: a.cashContributed + cashReward,
          status: 'praising',
        };
      }
      return a;
    }));

    // Add cash directly to player balance
    onUpdateBalance(cheatBalance + cashReward);

    // Add praise log entry
    const newLog: PraiseLog = {
      id: Date.now().toString() + Math.random(),
      accountName: account.name,
      accountAvatar: account.avatar,
      message: quote,
      cashAmount: cashReward,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPraiseLogs(prev => [newLog, ...prev.slice(0, 49)]);

    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  const handleForceAllPraiseNow = () => {
    if (accounts.length === 0) return;

    const cashPerPraise = 1000000000;
    const totalNewCash = accounts.length * cashPerPraise;

    // Update all accounts
    setAccounts(prev => prev.map(a => ({
      ...a,
      praisesGiven: a.praisesGiven + 1,
      cashContributed: a.cashContributed + cashPerPraise,
      status: 'praising',
    })));

    // Award total billions
    onUpdateBalance(cheatBalance + totalNewCash);

    // Add summary log entry
    const newLog: PraiseLog = {
      id: Date.now().toString(),
      accountName: '🌟 ALL SERVER SUBJECTS 🌟',
      accountAvatar: '👑',
      message: `MASS CHANT: "ALL HAIL BEN THE SUPREME OVERLORD!" (${accounts.length} Subjects Praised You!)`,
      cashAmount: totalNewCash,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPraiseLogs(prev => [newLog, ...prev.slice(0, 49)]);

    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // Auto Praise Loop
  useEffect(() => {
    if (!autoPraiseActive || accounts.length === 0) return;

    const interval = setInterval(() => {
      // Random subject praises
      const randomAcc = accounts[Math.floor(Math.random() * accounts.length)];
      if (randomAcc) {
        triggerSinglePraise(randomAcc);
      }
    }, autoPraiseIntervalSec * 1000);

    return () => clearInterval(interval);
  }, [autoPraiseActive, autoPraiseIntervalSec, accounts, cheatBalance]);

  // ==========================================
  // FORCE WORK LABOR ENGINE (PASSIVE CASH GENERATION)
  // ==========================================
  useEffect(() => {
    if (!autoWorkActive || accounts.length === 0) return;

    const interval = setInterval(() => {
      let totalLaborYield = 0;

      accounts.forEach(acc => {
        if (acc.job === 'printing') totalLaborYield += 2000000000; // $2B/sec
        else if (acc.job === 'mining') totalLaborYield += 500000000; // $500M/sec
        else if (acc.job === 'ticket_runner') totalLaborYield += 250000000; // $250M/sec
        else if (acc.job === 'auction_sniper') totalLaborYield += 1000000000; // $1B/sec
        else if (acc.job === 'cosmic_luck') totalLaborYield += 1500000000; // $1.5B/sec
      });

      if (totalLaborYield > 0) {
        onUpdateBalance(cheatBalance + totalLaborYield);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoWorkActive, accounts, cheatBalance]);

  // Mass Assign All Jobs
  const handleMassAssignJob = (jobType: SubjectAccount['job']) => {
    setAccounts(prev => prev.map(a => ({ ...a, job: jobType, status: 'forced_working' })));
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // ==========================================
  // BRAND NEW SERVER OWNER ULTIMATE DECREES
  // ==========================================
  const [customBroadcastText, setCustomBroadcastText] = useState<string>("BEN IS THE ETERNAL GOD OF THE POWERBALL MULTIVERSE!");
  const [arenaActive, setArenaActive] = useState<boolean>(false);
  const [arenaLog, setArenaLog] = useState<string[]>([]);
  const [arenaPot, setArenaPot] = useState<number>(0);

  // 1. Confiscate 100% Treasury ($50B per subject)
  const handleSeizeWealthTax = () => {
    if (accounts.length === 0) return;
    const cashSeized = accounts.length * 50000000000; // $50B per subject
    onUpdateBalance(cheatBalance + cashSeized);

    const newLog: PraiseLog = {
      id: Date.now().toString(),
      accountName: '🚨 SERVER OWNER DECREE 🚨',
      accountAvatar: '👑',
      message: `ROYAL EDICT EXECUTED: Confiscated 100% wealth tax from all ${accounts.length} subjects!`,
      cashAmount: cashSeized,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPraiseLogs(prev => [newLog, ...prev.slice(0, 49)]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // 2. Brainwash & Mass Mind Control
  const handleBrainwashAll = () => {
    setAccounts(prev => prev.map(a => ({
      ...a,
      avatar: '👑',
      title: '🧠 Brainwashed Overlord Disciple',
      vipLevel: 10,
      praisesGiven: a.praisesGiven + 5,
      cashContributed: a.cashContributed + 5000000000,
      status: 'praising',
    })));

    onUpdateBalance(cheatBalance + (accounts.length * 5000000000));

    const newLog: PraiseLog = {
      id: Date.now().toString(),
      accountName: '🧠 MASS BRAINWASH BEAM 🧠',
      accountAvatar: '🌀',
      message: `ALL ${accounts.length} SUBJECTS HAVE BEEN BRAINWASHED INTO ETERNAL CONFORMITY!`,
      cashAmount: accounts.length * 5000000000,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPraiseLogs(prev => [newLog, ...prev.slice(0, 49)]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // 3. Broadcast Custom Speech Forced Chant
  const handleForceBroadcastSpeech = () => {
    if (!customBroadcastText.trim() || accounts.length === 0) return;

    const cashPerChant = 5000000000; // $5B per chant
    const totalCash = accounts.length * cashPerChant;
    onUpdateBalance(cheatBalance + totalCash);

    setAccounts(prev => prev.map(a => ({
      ...a,
      praisesGiven: a.praisesGiven + 1,
      cashContributed: a.cashContributed + cashPerChant,
      status: 'praising',
    })));

    const newLog: PraiseLog = {
      id: Date.now().toString(),
      accountName: `📢 CHORUS OF ${accounts.length} SUBJECTS`,
      accountAvatar: '👑',
      message: `"${customBroadcastText.trim().toUpperCase()}"`,
      cashAmount: totalCash,
      timestamp: new Date().toLocaleTimeString(),
    };
    setPraiseLogs(prev => [newLog, ...prev.slice(0, 49)]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // 4. Forced Gladiator Bidding Arena
  const handleStartGladiatorDuel = () => {
    if (accounts.length < 2) {
      handleSpawnAccounts(2, false);
    }
    setArenaActive(true);
    setArenaLog([]);
    const sub1 = accounts[0] || { name: 'GigaChad_Billionaire' };
    const sub2 = accounts[1] || { name: 'CryptoWhale_99' };

    let pot = 0;
    const logs: string[] = [];
    logs.push(`⚔️ FORCED GLADIATOR DUEL STARTED BETWEEN ${sub1.name} AND ${sub2.name}!`);

    for (let round = 1; round <= 5; round++) {
      const bid1 = round * 10000000000;
      const bid2 = round * 15000000000;
      pot += bid1 + bid2;
      logs.push(`Round ${round}: ${sub1.name} bids $${bid1.toLocaleString()}! ${sub2.name} counters with $${bid2.toLocaleString()}!`);
    }

    logs.push(`🏆 DUEL CONCLUDED! Total Gladiator Pot of $${pot.toLocaleString()} collected by Server Owner!`);

    setArenaPot(pot);
    setArenaLog(logs);
    onUpdateBalance(cheatBalance + pot);

    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // 5. Mass VIP 100 Upgrade
  const handleMassVipUpgrade = () => {
    setAccounts(prev => prev.map(a => ({ ...a, vipLevel: 100, title: '👑 VIP 100 Sovereign Elite' })));
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // 6. Ban / Kick Account
  const handleBanAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* SERVER OWNER HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-purple-950 border-2 border-amber-400 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Background Glowing Watermark */}
        <div className="absolute -right-8 -bottom-8 opacity-10 text-9xl font-black text-amber-300 pointer-events-none">
          👑 OWNER
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 flex items-center justify-center text-3xl shadow-xl border-2 border-white/30 animate-pulse">
              👑
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-wide">SERVER OWNER DOMAIN & SOVEREIGN CONTROL</h2>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-xs px-3 py-1 rounded-full font-black uppercase shadow ring-2 ring-amber-300 animate-pulse">
                  👑 SERVER OWNER ACTIVE
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium pt-1 max-w-xl">
                You are designated as the supreme Server Owner with absolute operational rights. Receive 1,000,000 join requests per second, force-add subjects, force praises for $1B cash, and command forced labor!
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Servants</p>
              <p className="font-mono text-2xl font-black text-amber-400">{accounts.length}</p>
            </div>
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Total Praises</p>
              <p className="font-mono text-2xl font-black text-emerald-400">{totalPraises.toLocaleString()} 🙏</p>
            </div>
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Praise Cash Earned</p>
              <p className="font-mono text-2xl font-black text-cyan-400">${totalCashFromPraise.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* PRIMARY OVERLORD ACTION CONTROLS */}
        <div className="pt-4 border-t border-amber-800/50 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleForceAllPraiseNow}
              className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border-2 border-yellow-200"
            >
              <span className="text-xl">👑</span>
              <span>FORCE ALL {accounts.length} SUBJECTS TO PRAISE ME NOW! (+$1B EACH)</span>
            </button>

            {/* AUTO PRAISE LOOP SWITCH */}
            <button
              onClick={() => {
                playTickSound(soundEnabled);
                setAutoPraiseActive(!autoPraiseActive);
              }}
              className={`px-5 py-3 rounded-xl font-black text-xs transition-all flex items-center space-x-2 border ${
                autoPraiseActive
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/30 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <span>⚡ {autoPraiseActive ? 'AUTO PRAISE LOOP: ON (+$1B)' : 'AUTO PRAISE LOOP: OFF'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-bold">Auto Praise Speed:</span>
            <select
              value={autoPraiseIntervalSec}
              onChange={e => setAutoPraiseIntervalSec(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value={1}>1s (EXTREME BILLIONS)</option>
              <option value={2}>2s (FAST)</option>
              <option value={5}>5s (NORMAL)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 1 MILLION REQUESTS PER SECOND JOIN ENGINE */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950/40 to-slate-950 border-2 border-cyan-400/80 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-800/50 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl animate-spin">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">
                  1,000,000 REQ/SEC SERVER JOIN FLOOD ENGINE
                </h3>
                <span className="bg-cyan-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase animate-pulse">
                  HYPER BEAM
                </span>
              </div>
              <p className="text-xs text-cyan-200/80">
                Millions of players around the world are spamming join requests to your server. Auto-accept them to collect infinite tribute!
              </p>
            </div>
          </div>

          {/* JOIN FLOOD METRICS */}
          <div className="flex items-center space-x-4">
            <div className="bg-slate-950/90 border border-cyan-500/50 px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Join Requests Received</p>
              <p className="font-mono text-2xl font-black text-cyan-300 animate-pulse">
                {totalJoinRequests.toLocaleString()} 🚀
              </p>
            </div>

            <div className="bg-slate-950/90 border border-emerald-500/50 px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Join Tribute Collected</p>
              <p className="font-mono text-2xl font-black text-emerald-400">
                +${joinTributeEarned.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLS BAR FOR 1M REQ/SEC */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-xl border border-cyan-800/40">
          <div className="flex flex-wrap items-center gap-3">
            {/* FLOOD TOGGLE */}
            <button
              onClick={() => {
                playTickSound(soundEnabled);
                setIsJoinFloodActive(!isJoinFloodActive);
              }}
              className={`px-4 py-2 rounded-xl font-black text-xs transition-all flex items-center space-x-2 border ${
                isJoinFloodActive
                  ? 'bg-cyan-400 text-slate-950 border-cyan-200 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-300 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <span>⚡ {isJoinFloodActive ? 'JOIN FLOOD: 1,000,000 REQ/SEC ACTIVE' : '⏸️ JOIN FLOOD: PAUSED'}</span>
            </button>

            {/* SPEED PRESET SELECTOR */}
            <select
              value={joinReqPerSec}
              onChange={e => setJoinReqPerSec(Number(e.target.value))}
              className="bg-slate-950 border border-cyan-500/60 text-cyan-300 font-mono text-xs font-black rounded-xl px-3 py-2 focus:outline-none"
            >
              <option value={100000}>100,000 Req / sec</option>
              <option value={500000}>500,000 Req / sec</option>
              <option value={1000000}>⚡ 1,000,000 Req / sec (HYPER DRIVE)</option>
              <option value={10000000}>🌌 10,000,000 Req / sec (COSMIC BEAM)</option>
            </select>

            {/* AUTO APPROVE TOGGLE */}
            <button
              onClick={() => {
                playTickSound(soundEnabled);
                setAutoApproveJoinReqs(!autoApproveJoinReqs);
              }}
              className={`px-3.5 py-2 rounded-xl font-black text-xs transition-all border ${
                autoApproveJoinReqs
                  ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              {autoApproveJoinReqs ? '✅ AUTO-APPROVE & COLLECT TRIBUTE: ON' : '❌ AUTO-APPROVE: OFF'}
            </button>
          </div>

          <button
            onClick={() => {
              handleSpawnAccounts(25);
              onUpdateBalance(cheatBalance + 100000000000);
              if (soundEnabled) playJackpotSound(soundEnabled);
            }}
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <span>🚀 MASS ACCEPT ALL PENDING JOIN REQUESTS (+$100 BILLION)</span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* BRAND NEW: SERVER OWNER DECREES COMMAND CENTER */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-5 space-y-4 shadow-2xl">
        <div className="flex items-center space-x-3 border-b border-amber-500/30 pb-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shadow">
            👑
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white uppercase tracking-wider flex items-center gap-2">
              <span>SERVER OWNER ULTIMATE DECREES & OVERLORD EDICTS</span>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                ABSOLUTE POWER
              </span>
            </h3>
            <p className="text-xs text-amber-200/80">
              Execute royal decrees on all {accounts.length} server members: tax wealth, broadcast forced speech, force gladiator bidding duels, or brainwash everyone!
            </p>
          </div>
        </div>

        {/* DECREE ACTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* 1. SEIZE WEALTH TAX */}
          <button
            onClick={handleSeizeWealthTax}
            className="bg-slate-900/90 hover:bg-slate-800 border-2 border-amber-500/50 p-3 rounded-xl text-left transition-all hover:scale-[1.02] shadow-lg group"
          >
            <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🚨</div>
            <div className="font-black text-amber-300">CONFISCATE 100% WEALTH TAX</div>
            <div className="text-[10px] text-slate-400 pt-0.5">Seize $50B from every subject into your balance!</div>
          </button>

          {/* 2. BRAINWASH BEAM */}
          <button
            onClick={handleBrainwashAll}
            className="bg-slate-900/90 hover:bg-slate-800 border-2 border-purple-500/50 p-3 rounded-xl text-left transition-all hover:scale-[1.02] shadow-lg group"
          >
            <div className="text-xl mb-1 group-hover:scale-110 transition-transform">🧠</div>
            <div className="font-black text-purple-300">MASS BRAINWASH BEAM</div>
            <div className="text-[10px] text-slate-400 pt-0.5">Force 👑 avatar, brainwashed title & 5x instant praise!</div>
          </button>

          {/* 3. GLADIATOR ARENA */}
          <button
            onClick={handleStartGladiatorDuel}
            className="bg-slate-900/90 hover:bg-slate-800 border-2 border-cyan-500/50 p-3 rounded-xl text-left transition-all hover:scale-[1.02] shadow-lg group"
          >
            <div className="text-xl mb-1 group-hover:scale-110 transition-transform">⚔️</div>
            <div className="font-black text-cyan-300">FORCED GLADIATOR ARENA</div>
            <div className="text-[10px] text-slate-400 pt-0.5">Pit 2 subjects in bidding duel; keep 100% pot!</div>
          </button>

          {/* 4. MASS VIP 100 */}
          <button
            onClick={handleMassVipUpgrade}
            className="bg-slate-900/90 hover:bg-slate-800 border-2 border-emerald-500/50 p-3 rounded-xl text-left transition-all hover:scale-[1.02] shadow-lg group"
          >
            <div className="text-xl mb-1 group-hover:scale-110 transition-transform">💎</div>
            <div className="font-black text-emerald-300">PROMOTE ALL TO VIP 100</div>
            <div className="text-[10px] text-slate-400 pt-0.5">Elevate all accounts to VIP 100 Elite status!</div>
          </button>
        </div>

        {/* BROADCAST CUSTOM FORCED SPEECH INPUT */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="text-[11px] font-bold text-amber-300 block mb-1">
              📢 Broadcast Custom Forced Speech to All {accounts.length} Server Subjects:
            </label>
            <input
              type="text"
              value={customBroadcastText}
              onChange={e => setCustomBroadcastText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
              placeholder="e.g. BEN IS THE ETERNAL GOD OF THE POWERBALL MULTIVERSE!"
            />
          </div>
          <button
            onClick={handleForceBroadcastSpeech}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap self-end"
          >
            📢 FORCE EVERYONE TO CHANT THIS NOW (+$5B EACH)
          </button>
        </div>

        {/* GLADIATOR ARENA FEED LOG */}
        {arenaActive && (
          <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-cyan-300">⚔️ GLADIATOR ARENA RESULTS</span>
              <span className="font-mono text-xs font-black text-emerald-400">+${arenaPot.toLocaleString()} COLLECTED BY OWNER</span>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto text-[11px] font-mono text-slate-300">
              {arenaLog.map((line, idx) => (
                <p key={idx} className="border-b border-slate-900/60 pb-0.5">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* 100+ FORCED LABOR & OVERLORD COMMAND CONSOLE */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950/60 to-slate-950 border-2 border-purple-500/80 rounded-3xl p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-purple-800/60 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⛏️</span>
            <div>
              <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-widest flex items-center space-x-2">
                <span>100+ FORCED LABOR & OVERLORD COMMAND CONSOLE</span>
              </h3>
              <p className="text-[10px] text-purple-200/80">
                TOTAL CONTROL: ASSIGN WORKLOADS, EXTRACT QUADRILLIONS IN TAXES, DISCIPLINE WORKERS & WARP TO LEVEL 1000
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-purple-500/30 text-purple-300 px-3 py-1 rounded-full font-black border border-purple-400 animate-pulse">
            100+ OP COMMANDS
          </span>
        </div>

        {/* SUB-TAB SELECTOR (6 CATEGORIES, 102 TOTAL BUTTONS) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-purple-800/40">
          {[
            { id: 'sectors', label: '⛏️ SECTORS', count: '18' },
            { id: 'tasks', label: '🔨 TASKS', count: '18' },
            { id: 'tribute', label: '💸 TRIBUTE', count: '18' },
            { id: 'discipline', label: '⚡ DISCIPLINE', count: '18' },
            { id: 'decrees', label: '👑 DECREES', count: '18' },
            { id: 'warps', label: '🚀 WARPS', count: '12' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                if (soundEnabled) playTickSound(soundEnabled);
                setActiveLaborTab(t.id as any);
              }}
              className={`py-2 px-1 rounded-xl text-[10px] font-extrabold transition-all flex flex-col items-center justify-center cursor-pointer ${
                activeLaborTab === t.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border border-purple-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{t.label}</span>
              <span className="text-[9px] text-purple-300 font-normal">({t.count})</span>
            </button>
          ))}
        </div>

        {/* TAB 1: LABOR SECTORS & WORKLOADS (18 BUTTONS) */}
        {activeLaborTab === 'sectors' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {[
              { label: '🖨️ Quantum Money Printing', rate: '$200B/s', job: 'printing' },
              { label: '⛏️ Asteroid Core Scraping', rate: '$50B/s', job: 'mining' },
              { label: '⚛️ Fusion Energy Harvesting', rate: '$100B/s', job: 'cosmic_luck' },
              { label: '💻 Crypto Treadmill Farms', rate: '$80B/s', job: 'mining' },
              { label: '💎 Diamond Crush Refineries', rate: '$150B/s', job: 'auction_sniper' },
              { label: '🌋 Volcanic Plasma Siphoning', rate: '$300B/s', job: 'printing' },
              { label: '🛸 Alien Tech Dismantling', rate: '$250B/s', job: 'cosmic_luck' },
              { label: '🧬 Cyberware Assembly Lines', rate: '$120B/s', job: 'ticket_runner' },
              { label: '🌊 Deep Sea Oil Rigs', rate: '$90B/s', job: 'mining' },
              { label: '🪐 Moon Base Construction', rate: '$180B/s', job: 'printing' },
              { label: '🌀 Dark Matter Extraction', rate: '$500B/s', job: 'cosmic_luck' },
              { label: '☀️ Solar Panel Scrubbing', rate: '$40B/s', job: 'ticket_runner' },
              { label: '⚡ Antimatter Containment', rate: '$400B/s', job: 'auction_sniper' },
              { label: '☣️ Toxic Waste Recycling', rate: '$70B/s', job: 'mining' },
              { label: '🏗️ Titan Class Mega Build', rate: '$350B/s', job: 'printing' },
              { label: '🧪 Bio-Tech Clone Labs', rate: '$220B/s', job: 'cosmic_luck' },
              { label: '⛏️ Gold Mine Bedrock Dig', rate: '$110B/s', job: 'mining' },
              { label: '🛰️ Satellite Rigging', rate: '$130B/s', job: 'ticket_runner' },
            ].map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleMassAssignJob(s.job as any);
                  onUpdateBalance(cheatBalance + 100000000000);
                  if (soundEnabled) playCoinSound(soundEnabled);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-400 p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-sm group"
              >
                <div className="font-extrabold text-[11px] text-purple-200 group-hover:text-amber-300 truncate">{s.label}</div>
                <div className="text-[10px] text-emerald-400 font-mono font-bold pt-0.5">{s.rate} yield</div>
              </button>
            ))}
          </div>
        )}

        {/* TAB 2: FORCED TASK ASSIGNMENTS & QUOTAS (18 BUTTONS) */}
        {activeLaborTab === 'tasks' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {[
              { label: '🧱 Print 1,000,000 Bricks', reward: 100000000000 },
              { label: '⏰ 24/7 Mandatory Overtime', reward: 500000000000 },
              { label: '⚡ 100x Whiplash Speed', reward: 1000000000000 },
              { label: '🚫 Zero Sleep Enforcement', reward: 250000000000 },
              { label: '☕ 100x Espresso Injection', reward: 150000000000 },
              { label: '🤖 Robot-Slave Synergy', reward: 800000000000 },
              { label: '🏃 Treadmill Overclock', reward: 300000000000 },
              { label: '🧠 Hypnotic Work Loop', reward: 600000000000 },
              { label: '🧬 Cybernetic Muscle Rigs', reward: 450000000000 },
              { label: '❄️ Cryo Speedrun Shift', reward: 700000000000 },
              { label: '💨 Oxygen Quota Reduction', reward: 200000000000 },
              { label: '♾️ Infinite Labor Loop', reward: 2000000000000 },
              { label: '🔨 Mass Hammer Drill', reward: 350000000000 },
              { label: '🖨️ Federal Reserve Run', reward: 5000000000000 },
              { label: '📦 1,000 Cargo Shipments', reward: 1500000000000 },
              { label: '⛏️ Bedrock Deep Well Drill', reward: 900000000000 },
              { label: '⚡ Voltage Motivation Surge', reward: 400000000000 },
              { label: '🏆 Master Quota Met', reward: 3000000000000 },
            ].map((t, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onUpdateBalance(cheatBalance + t.reward);
                  if (soundEnabled) playJackpotSound(soundEnabled);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-400 p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-sm"
              >
                <div className="font-extrabold text-[11px] text-slate-200 truncate">{t.label}</div>
                <div className="text-[10px] text-amber-400 font-mono font-bold pt-0.5">+${(t.reward/1e9).toFixed(0)}B Cash</div>
              </button>
            ))}
          </div>
        )}

        {/* TAB 3: TRIBUTE & TAX EXTRACTOR (18 BUTTONS) */}
        {activeLaborTab === 'tribute' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {[
              { label: '💸 Seize 100% Wage Tax', amt: 100000000000000 },
              { label: '🏦 Confiscate Savings', amt: 50000000000000 },
              { label: '💰 Salary Freeze Levy', amt: 25000000000000 },
              { label: '💳 Forced Wallet Siphon', amt: 10000000000000 },
              { label: '👑 Sovereign Wealth Tax', amt: 200000000000000 },
              { label: '🏛️ Labor Permit Fee', amt: 30000000000000 },
              { label: '🛸 Intergalactic Tax', amt: 75000000000000 },
              { label: '💎 Slave Dividend Payout', amt: 150000000000000 },
              { label: '📦 Sweatshop Cut', amt: 40000000000000 },
              { label: '⚡ Overtime Surcharge', amt: 60000000000000 },
              { label: '🚨 Asset Forfeiture Edict', amt: 500000000000000 },
              { label: '🏛️ Treasury Injection', amt: 1000000000000000 },
              { label: '💸 Sweat Tax Collection', amt: 35000000000000 },
              { label: '📊 Corporate Penalty', amt: 80000000000000 },
              { label: '🔮 Multiverse Tax Drain', amt: 2000000000000000 },
              { label: '🏆 Gold Standard Tribute', amt: 90000000000000 },
              { label: '🌋 Wealth Seizure Burst', amt: 300000000000000 },
              { label: '👑 Sovereign Overlord Grant', amt: 10000000000000000 },
            ].map((tr, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onUpdateBalance(cheatBalance + tr.amt);
                  if (soundEnabled) playJackpotSound(soundEnabled);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-400 p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-sm"
              >
                <div className="font-extrabold text-[11px] text-emerald-300 truncate">{tr.label}</div>
                <div className="text-[10px] text-emerald-400 font-mono font-bold pt-0.5">+$ Extract</div>
              </button>
            ))}
          </div>
        )}

        {/* TAB 4: WORKER DISCIPLINE & MOTIVATORS (18 BUTTONS) */}
        {activeLaborTab === 'discipline' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {[
              { label: '⚡ Cybernetic Whip Pulse', state: cyberWhipActive, toggle: () => setCyberWhipActive(!cyberWhipActive) },
              { label: '⚡ Electric Floor Shock', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '📢 Motivation Megaphone', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '🛸 AI Overseer Drones', state: dronePatrolActive, toggle: () => setDronePatrolActive(!dronePatrolActive) },
              { label: '🗿 Holographic Boss Statue', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '🤖 Guard Bot Patrol Sweeps', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '🗣️ Mandatory Praise Loop', state: autoPraiseActive, toggle: () => setAutoPraiseActive(!autoPraiseActive) },
              { label: '🚫 Zero Break Enforcer', state: overtimeActive, toggle: () => setOvertimeActive(!overtimeActive) },
              { label: '💉 Adrenaline Injections', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '🚨 Speedrun Sirens', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '👁️ Satellite Tracking', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '📊 Public Leaderboard Shame', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '🔴 Laser Pointer Pacing', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '🧬 Cyberware Overclock', state: quantumLaborActive, toggle: () => setQuantumLaborActive(!quantumLaborActive) },
              { label: '🔒 Shock Collar Rig', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '⚡ High Voltage Floor', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '🔊 Hypnotic Loudspeaker', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
              { label: '👑 Absolute Sovereign Mandate', state: true, toggle: () => { if (soundEnabled) playCoinSound(soundEnabled); } },
            ].map((d, idx) => (
              <button
                key={idx}
                onClick={d.toggle}
                className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                  d.state
                    ? 'bg-gradient-to-r from-purple-900 to-indigo-900 border-purple-400 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-extrabold text-[11px] truncate">{d.label}</div>
                <div className="text-[9px] font-black pt-0.5">{d.state ? 'ACTIVE' : 'OFF'}</div>
              </button>
            ))}
          </div>
        )}

        {/* TAB 5: OVERLORD DECREES & FORCED SPELLS (18 BUTTONS) */}
        {activeLaborTab === 'decrees' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {[
              { label: '🧬 Clone 1,000 Slave Workers', action: () => handleSpawnAccounts(50) },
              { label: '🚀 Teleport Force to Mars', action: () => handleBrainwashAll() },
              { label: '🤖 Convert Slaves to Cyberborgs', action: () => handleBrainwashAll() },
              { label: '🌀 Dimensional Work Rift', action: () => handleSeizeWealthTax() },
              { label: '👥 Instant 100,000 Slave Flood', action: () => handleSpawnAccounts(100) },
              { label: '🧠 Mass Brainwash Matrix', action: () => handleBrainwashAll() },
              { label: '⏰ Time Dilated Shift 1000x', action: () => onUpdateBalance(cheatBalance + 100000000000000) },
              { label: '🪐 Cosmic Sweatshop Galaxy', action: () => onUpdateBalance(cheatBalance + 500000000000000) },
              { label: '☀️ Solar Flare Charge', action: () => handleForceAllPraiseNow() },
              { label: '🧱 Quantum Assembly Line', action: () => onUpdateBalance(cheatBalance + 20000000000000) },
              { label: '🌌 Multiverse Labor Harvest', action: () => onUpdateBalance(cheatBalance + 1000000000000000) },
              { label: '📜 Unbreakable Work Contract', action: () => handleBrainwashAll() },
              { label: '🎆 Supernova Production Burst', action: () => onUpdateBalance(cheatBalance + 50000000000000) },
              { label: '🔮 Void Energy Portal', action: () => onUpdateBalance(cheatBalance + 800000000000000) },
              { label: '👑 Supreme Overlord Blessing', action: () => handleForceAllPraiseNow() },
              { label: '💥 Mass Labor Rebirth', action: () => handleMassVipUpgrade() },
              { label: '⚡ Instant Level 1000 Slave Rank', action: () => handleMassVipUpgrade() },
              { label: '🏆 Omnipotent Slave Command', action: () => handleForceAllPraiseNow() },
            ].map((dc, idx) => (
              <button
                key={idx}
                onClick={dc.action}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-pink-400 p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-sm"
              >
                <div className="font-extrabold text-[11px] text-pink-300 truncate">{dc.label}</div>
                <div className="text-[10px] text-pink-400 font-mono font-bold pt-0.5">⚡ EXECUTE</div>
              </button>
            ))}
          </div>
        )}

        {/* TAB 6: INSTANT MEGA LABOR WARPS (12 BUTTONS) */}
        {activeLaborTab === 'warps' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {[
              { label: '🚀 Complete 1,000,000 Work Orders', amt: 1000000000000000 },
              { label: '💸 Instant +$1 Quadrillion Revenue', amt: 1000000000000000 },
              { label: '⚡ Force All Workers to Hyper Sprint', amt: 500000000000000 },
              { label: '👑 Level 1000 Slave Rank Warp', amt: 10000000000000000 },
              { label: '💎 Max Out All Worker VIP Levels', amt: 200000000000000 },
              { label: '🤖 Instant 10,000 Worker Legion', amt: 50000000000000 },
              { label: '💣 Nuke Slacker Workers', amt: 100000000000000 },
              { label: '⚡ Cash to Slave Upgrades', amt: 300000000000000 },
              { label: '🧬 Unlock All Labor Techs', amt: 800000000000000 },
              { label: '🏛️ Instant $100 Quadrillion Vault', amt: 100000000000000000 },
              { label: '🚀 Warp Drive Labor Overclock', amt: 5000000000000000 },
              { label: '🏆 Infinite Auto-Labor Yield', amt: 1000000000000000000 },
            ].map((w, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onUpdateBalance(cheatBalance + w.amt);
                  if (soundEnabled) playJackpotSound(soundEnabled);
                }}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-400 p-2.5 rounded-xl text-left transition-all cursor-pointer shadow-sm"
              >
                <div className="font-extrabold text-[11px] text-amber-300 truncate">{w.label}</div>
                <div className="text-[10px] text-amber-400 font-mono font-bold pt-0.5">🚀 WARP NOW</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AUTO GENERATING ACCOUNTS & FORCE ADD PANEL */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">AUTO-GENERATING ACCOUNTS ENGINE & FORCE ADD</h3>
              <p className="text-xs text-slate-400">Spawn infinite server subjects to continuously chant praises and work in your financial empire.</p>
            </div>
          </div>

          {/* AUTO-GENERATE TOGGLE & MASS SPAWN BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                playTickSound(soundEnabled);
                setAutoGenerateAccounts(!autoGenerateAccounts);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                autoGenerateAccounts
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 ring-1 ring-cyan-400/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {autoGenerateAccounts ? '⚡ AUTO-GENERATOR: ACTIVE (Every 3s)' : '⏸️ AUTO-GENERATOR: PAUSED'}
            </button>

            <button
              onClick={() => handleSpawnAccounts(1)}
              className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            >
              ➕ +1 Account
            </button>
            <button
              onClick={() => handleSpawnAccounts(10)}
              className="bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 border border-purple-500/40 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
            >
              🚀 +10 Mass Spawn
            </button>
            <button
              onClick={() => handleSpawnAccounts(50)}
              className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-xs font-black px-3 py-1.5 rounded-xl transition-all"
            >
              💥 +50 Mega Legion
            </button>
          </div>
        </div>

        {/* CUSTOM FORCE ADD ACCOUNT FORM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs">
          <div>
            <label className="text-slate-400 font-bold block mb-1">Username / Account Name:</label>
            <input
              type="text"
              placeholder="e.g. Sovereign_Fanatic_99"
              value={customNameInput}
              onChange={e => setCustomNameInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">Title / Role:</label>
            <input
              type="text"
              placeholder="e.g. 🙏 Devoted Worshiper"
              value={customTitleInput}
              onChange={e => setCustomTitleInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-amber-300 focus:outline-none focus:border-amber-400 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 font-bold block mb-1">Avatar Emoji:</label>
            <select
              value={customAvatarInput}
              onChange={e => setCustomAvatarInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white focus:outline-none font-bold"
            >
              {PRESET_AVATARS.map(av => (
                <option key={av} value={av}>{av} Emoji Avatar</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSpawnCustomAccount}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black py-1.5 rounded-lg shadow hover:brightness-110 transition-all"
            >
              ⚡ FORCE ADD THIS PERSON
            </button>
          </div>
        </div>
      </div>

      {/* GRID LAYOUT: PRAISE LOG STREAM & FORCED LABOR SECTORS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN: LIVE PRAISE CHANT STREAM */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">LIVE PRAISE CHANT STREAM ($1B/EACH)</h3>
                <p className="text-xs text-slate-400">Real-time worship log raining $1,000,000,000 per praise chant.</p>
              </div>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
              LIVE STREAM
            </span>
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {praiseLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Click "FORCE ALL SUBJECTS TO PRAISE ME NOW" or turn on Auto Praise to start the $1 Billion cash rain!
              </div>
            ) : (
              praiseLogs.map(log => (
                <div
                  key={log.id}
                  className="bg-slate-900 border border-amber-500/30 p-3 rounded-xl flex items-start space-x-3 text-xs shadow hover:border-amber-400 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-400/50 flex items-center justify-center text-lg shrink-0">
                    {log.accountAvatar}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white">{log.accountName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <p className="text-amber-200/90 font-medium italic">"{log.message}"</p>
                    <p className="text-[11px] font-mono font-black text-emerald-400 pt-0.5">
                      +${log.cashAmount.toLocaleString()} CASH INJECTED 💸
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: FORCED LABOR SECTORS & WORKER ASSIGNMENT */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⛏️</span>
              <div>
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">FORCE THEM TO WORK FOR YOU</h3>
                <p className="text-xs text-slate-400">Assign subjects to high-yield labor sectors for passive revenues.</p>
              </div>
            </div>

            <button
              onClick={() => {
                playTickSound(soundEnabled);
                setAutoWorkActive(!autoWorkActive);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                autoWorkActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {autoWorkActive ? '⚡ LABOR YIELD: ACTIVE' : '⏸️ LABOR: PAUSED'}
            </button>
          </div>

          {/* MASS JOB ASSIGNMENT BUTTONS */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400">Mass Assign All {accounts.length} Servants To Sector:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleMassAssignJob('printing')}
                className="bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 font-bold p-2 rounded-xl text-left transition-all"
              >
                <div className="font-black">🖨️ Federal Printing</div>
                <div className="text-[10px] text-slate-400">$2,000,000,000/sec per worker</div>
              </button>

              <button
                onClick={() => handleMassAssignJob('mining')}
                className="bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold p-2 rounded-xl text-left transition-all"
              >
                <div className="font-black">⛏️ Gold & Crypto Mine</div>
                <div className="text-[10px] text-slate-400">$500,000,000/sec per worker</div>
              </button>

              <button
                onClick={() => handleMassAssignJob('auction_sniper')}
                className="bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold p-2 rounded-xl text-left transition-all"
              >
                <div className="font-black">🔨 Auction Sniping</div>
                <div className="text-[10px] text-slate-400">$1,000,000,000/sec per worker</div>
              </button>

              <button
                onClick={() => handleMassAssignJob('ticket_runner')}
                className="bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 font-bold p-2 rounded-xl text-left transition-all"
              >
                <div className="font-black">🎟️ Ticket Runner</div>
                <div className="text-[10px] text-slate-400">$250,000,000/sec per worker</div>
              </button>
            </div>
          </div>

          {/* ACCOUNTS ROSTER WORK LIST */}
          <div className="pt-2">
            <p className="text-[11px] font-bold text-slate-400 mb-2">Individual Servant Roster ({accounts.length}):</p>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="text-lg">{acc.avatar}</span>
                    <div>
                      <div className="font-extrabold text-white">{acc.name}</div>
                      <div className="text-[10px] text-slate-400">{acc.praisesGiven} Praises • Contributed ${acc.cashContributed.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => triggerSinglePraise(acc)}
                      className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-1 rounded-lg"
                    >
                      🙏 Force Praise (+$1B)
                    </button>

                    <select
                      value={acc.job}
                      onChange={e => {
                        const newJob = e.target.value as any;
                        setAccounts(prev => prev.map(a => a.id === acc.id ? { ...a, job: newJob } : a));
                      }}
                      className="bg-slate-950 border border-slate-700 text-slate-300 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="printing">🖨️ $2B/s Printing</option>
                      <option value="mining">⛏️ $500M/s Mine</option>
                      <option value="auction_sniper">🔨 $1B/s Sniper</option>
                      <option value="ticket_runner">🎟️ $250M/s Runner</option>
                      <option value="cosmic_luck">🌌 $1.5B/s Luck</option>
                    </select>

                    <button
                      onClick={() => handleBanAccount(acc.id)}
                      title="Kick & Ban Subject"
                      className="bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/40 text-[10px] font-bold px-1.5 py-1 rounded-lg"
                    >
                      🚫 Kick
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
