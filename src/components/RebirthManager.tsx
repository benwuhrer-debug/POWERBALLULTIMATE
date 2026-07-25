import React, { useState, useEffect } from 'react';
import { UserProfile } from './UserProfileSettings';
import { playJackpotSound, playCoinSound, playTickSound } from '../utils/audio';

interface RebirthManagerProps {
  cheatBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  soundEnabled: boolean;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  adminSettings: any;
  onUpdateAdminSettings: (settings: any) => void;
}

export interface RebirthPerk {
  id: string;
  name: string;
  icon: string;
  description: string;
  costRebirths: number;
  effect: string;
  purchased: boolean;
}

export interface RebirthMilestone {
  levelReq: number;
  title: string;
  rewardText: string;
  rewardCash: number;
  rewardBadge: string;
  claimed: boolean;
}

export function RebirthManager({
  cheatBalance,
  onUpdateBalance,
  soundEnabled,
  userProfile,
  onUpdateProfile,
  adminSettings,
  onUpdateAdminSettings,
}: RebirthManagerProps) {
  // Rebirth State from localStorage or initial
  const [rebirthLevel, setRebirthLevel] = useState<number>(() => {
    const saved = localStorage.getItem('powerball_rebirth_level');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [rebirthTokens, setRebirthTokens] = useState<number>(() => {
    const saved = localStorage.getItem('powerball_rebirth_tokens');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const [totalRebirthCashEarned, setTotalRebirthCashEarned] = useState<number>(() => {
    const saved = localStorage.getItem('powerball_rebirth_total_cash');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  // Rebirth Perks State
  const [perks, setPerks] = useState<RebirthPerk[]>(() => {
    const saved = localStorage.getItem('powerball_rebirth_perks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'luck_boost', name: '🌌 Cosmic Luck Overdrive (+500% Luck)', icon: '🔮', description: 'Multiplies your lottery luck multiplier by 5x permanently.', costRebirths: 1, effect: '5x Luck', purchased: false },
      { id: 'cash_rain', name: '💸 Infinite Federal Printer (+10x Income)', icon: '🖨️', description: 'Automatically injects 10x cash into every win and trade.', costRebirths: 2, effect: '10x Cash Win Multiplier', purchased: false },
      { id: 'bidding_god', name: '👑 Master Auction Sovereign', icon: '🔨', description: 'Gives 80% discount on all auction reserve prices and forces 100% bot trade approvals.', costRebirths: 3, effect: '80% Reserve Discount + Auto Trade', purchased: false },
      { id: 'quantum_duplicator', name: '⚛️ Quantum Cash Duplicator', icon: '🌀', description: 'Doubles your cash balance automatically every 60 seconds without resetting.', costRebirths: 5, effect: 'Double Cash Every 60s', purchased: false },
      { id: 'godly_title', name: '⚡ Sovereign Multiverse Overlord', icon: '👑', description: 'Unlocks exclusive Obsidian Multiverse Title, Badges, and VIP Rank 100.', costRebirths: 10, effect: 'VIP Rank 100 + Godly Badge', purchased: false },
      { id: 'infinite_jackpot', name: '🪐 $1 Trillion Jackpot Lock', icon: '🌌', description: 'Forces the Powerball jackpot to never drop below $1,000,000,000,000.', costRebirths: 25, effect: '$1 Trillion Floor Jackpot', purchased: false },
    ];
  });

  // Rebirth Milestones State
  const [milestones, setMilestones] = useState<RebirthMilestone[]>(() => {
    const saved = localStorage.getItem('powerball_rebirth_milestones');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { levelReq: 1, title: 'First Rebirth', rewardText: '+$1,000,000,000 Bonus Cash & Rebirth Novice Badge', rewardCash: 1000000000, rewardBadge: '🌀 Rebirth Novice', claimed: false },
      { levelReq: 5, title: 'High-Roller Prestige', rewardText: '+$25,000,000,000 Cash & Rebirth Titan Badge', rewardCash: 25000000000, rewardBadge: '💎 Rebirth Titan', claimed: false },
      { levelReq: 10, title: 'Multiverse Sovereign', rewardText: '+$100,000,000,000 Cash & Sovereign Badge', rewardCash: 100000000000, rewardBadge: '⚡ Sovereign Overlord', claimed: false },
      { levelReq: 25, title: 'God of Probability', rewardText: '+$1,000,000,000,000 Cash & Godly Badge', rewardCash: 1000000000000, rewardBadge: '🌌 God of Probability', claimed: false },
      { levelReq: 50, title: 'Infinite Matrix Overlord', rewardText: '+$10,000,000,000,000 Cash & Matrix God Badge', rewardCash: 10000000000000, rewardBadge: '👑 Matrix Rebirth Sovereign', claimed: false },
    ];
  });

  // Auto Rebirth Toggle & Interval Speed
  const [autoRebirthActive, setAutoRebirthActive] = useState<boolean>(() => {
    return localStorage.getItem('powerball_auto_rebirth') === 'true';
  });
  const [autoRebirthSpeed, setAutoRebirthSpeed] = useState<number>(3); // Default every 3 seconds

  // Calculate multiplier based on rebirth level
  const rebirthMultiplier = 1 + rebirthLevel * 2.5; // Each rebirth adds +250% multiplier!

  // Handle Auto Rebirth Loop
  useEffect(() => {
    localStorage.setItem('powerball_auto_rebirth', autoRebirthActive ? 'true' : 'false');
    if (!autoRebirthActive) return;

    const interval = setInterval(() => {
      handlePerformRebirth();
    }, autoRebirthSpeed * 1000);

    return () => clearInterval(interval);
  }, [autoRebirthActive, autoRebirthSpeed, rebirthLevel, cheatBalance, adminSettings, userProfile]);

  // Persist State
  useEffect(() => {
    localStorage.setItem('powerball_rebirth_level', rebirthLevel.toString());
    localStorage.setItem('powerball_rebirth_tokens', rebirthTokens.toString());
    localStorage.setItem('powerball_rebirth_total_cash', totalRebirthCashEarned.toString());
    localStorage.setItem('powerball_rebirth_perks', JSON.stringify(perks));
    localStorage.setItem('powerball_rebirth_milestones', JSON.stringify(milestones));
  }, [rebirthLevel, rebirthTokens, totalRebirthCashEarned, perks, milestones]);

  // Handle ZERO-RESET Rebirth Execution
  const handlePerformRebirth = () => {
    playJackpotSound(soundEnabled);

    const nextLevel = rebirthLevel + 1;
    const bonusCashInject = 1000000000 * nextLevel; // Gives $1B * level bonus cash!

    setRebirthLevel(nextLevel);
    setRebirthTokens(prev => prev + 5);
    setTotalRebirthCashEarned(prev => prev + bonusCashInject);

    // INJECT CASH directly into user balance WITHOUT RESETTING anything!
    onUpdateBalance(cheatBalance + bonusCashInject);

    // Boost luck in admin settings
    if (onUpdateAdminSettings) {
      onUpdateAdminSettings({
        ...adminSettings,
        luckMultiplierPowerball: (adminSettings.luckMultiplierPowerball || 1) * 2,
        luckMultiplierWhite: (adminSettings.luckMultiplierWhite || 1) * 2,
      });
    }

    // Upgrade VIP level and badges in user profile
    if (userProfile && onUpdateProfile) {
      const currentBadges = userProfile.badges || [];
      const newBadge = `🌀 Rebirth Lvl ${nextLevel}`;
      const updatedBadges = currentBadges.includes(newBadge) ? currentBadges : [...currentBadges, newBadge];
      onUpdateProfile({
        ...userProfile,
        vipLevel: Math.max(userProfile.vipLevel || 1, nextLevel * 5),
        badges: updatedBadges,
        title: `👑 Rebirth Level ${nextLevel} Sovereign`,
      });
    }
  };

  // Buy Rebirth Perk
  const handleBuyPerk = (perkId: string) => {
    const perk = perks.find(p => p.id === perkId);
    if (!perk || perk.purchased) return;

    if (rebirthTokens < perk.costRebirths) {
      playTickSound(soundEnabled);
      return;
    }

    playCoinSound(soundEnabled);
    setRebirthTokens(prev => prev - perk.costRebirths);
    setPerks(prev => prev.map(p => p.id === perkId ? { ...p, purchased: true } : p));

    // Apply specific perk effects
    if (perkId === 'luck_boost' && onUpdateAdminSettings) {
      onUpdateAdminSettings({
        ...adminSettings,
        luckMultiplierPowerball: (adminSettings.luckMultiplierPowerball || 1) * 5,
        luckMultiplierWhite: (adminSettings.luckMultiplierWhite || 1) * 5,
      });
    } else if (perkId === 'cash_rain') {
      onUpdateBalance(cheatBalance + 10000000000);
    } else if (perkId === 'godly_title' && onUpdateProfile) {
      onUpdateProfile({
        ...userProfile,
        vipLevel: 100,
        title: '🌌 Sovereign Multiverse Overlord',
        cardTheme: 'obsidian',
      });
    }
  };

  // Claim Rebirth Milestone Reward
  const handleClaimMilestone = (levelReq: number) => {
    const m = milestones.find(item => item.levelReq === levelReq);
    if (!m || m.claimed || rebirthLevel < m.levelReq) return;

    playJackpotSound(soundEnabled);
    setMilestones(prev => prev.map(item => item.levelReq === levelReq ? { ...item, claimed: true } : item));

    // Award cash
    onUpdateBalance(cheatBalance + m.rewardCash);

    // Award badge
    if (userProfile && onUpdateProfile) {
      const currentBadges = userProfile.badges || [];
      const updatedBadges = currentBadges.includes(m.rewardBadge) ? currentBadges : [...currentBadges, m.rewardBadge];
      onUpdateProfile({
        ...userProfile,
        badges: updatedBadges,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ZERO-RESET REBIRTH BANNER */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-2 border-amber-400 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center text-3xl shadow-lg border-2 border-white/30 animate-pulse">
              🌀
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-wide">ZERO-RESET REBIRTH SYSTEM</h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 font-extrabold uppercase animate-pulse">
                  ⚡ 100% NO RESET GUARANTEE
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium pt-1 max-w-xl">
                Rebirthing DOES NOT reset your money, inventory items, ticket stats, or settings! Rebirthing ONLY INJECTS billions in free bonus cash, multiplies your luck & winnings, and unlocks godly perks!
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/80 border border-purple-500/40 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Rebirth Level</p>
              <p className="font-mono text-2xl font-black text-amber-400">LVL {rebirthLevel}</p>
            </div>
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Rebirth Tokens</p>
              <p className="font-mono text-2xl font-black text-emerald-400">{rebirthTokens} 🔮</p>
            </div>
            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Current Multiplier</p>
              <p className="font-mono text-2xl font-black text-cyan-400">{rebirthMultiplier.toFixed(1)}x 🔥</p>
            </div>
          </div>
        </div>

        {/* REBIRTH TRIGGER ACTION BUTTON & AUTO REBIRTH SWITCH */}
        <div className="pt-4 border-t border-purple-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🎁 Next Rebirth Reward:</span>
              <span className="text-emerald-400 font-mono font-black">+${((rebirthLevel + 1) * 1000000000).toLocaleString()} BONUS CASH</span>
              <span className="text-amber-300 font-mono font-bold">& +5 REBIRTH TOKENS 🔮</span>
            </p>
            <p className="text-[11px] text-slate-400 pt-0.5">
              You will keep your current balance (<span className="text-emerald-400 font-bold">${cheatBalance.toLocaleString()}</span>) and receive the bonus on top!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* AUTO REBIRTH CONTROLS */}
            <div className={`p-2.5 rounded-xl border flex items-center space-x-3 transition-all ${
              autoRebirthActive
                ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50'
                : 'bg-slate-950/80 border-slate-800'
            }`}>
              <button
                onClick={() => {
                  playTickSound(soundEnabled);
                  setAutoRebirthActive(!autoRebirthActive);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center space-x-1.5 ${
                  autoRebirthActive
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>⚡ {autoRebirthActive ? 'AUTO REBIRTH: ON' : 'AUTO REBIRTH: OFF'}</span>
              </button>

              <select
                value={autoRebirthSpeed}
                onChange={(e) => setAutoRebirthSpeed(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 text-amber-300 font-mono text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none"
              >
                <option value={1}>Every 1s (ULTRA FAST)</option>
                <option value={3}>Every 3s (FAST)</option>
                <option value={5}>Every 5s (MEDIUM)</option>
                <option value={10}>Every 10s (SLOW)</option>
              </select>
            </div>

            <button
              onClick={handlePerformRebirth}
              className="flex-1 md:flex-initial bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 border-2 border-yellow-200"
            >
              <span className="text-xl">🌀</span>
              <span>REBIRTH NOW!</span>
            </button>
          </div>
        </div>
      </div>

      {/* REBIRTH PERKS & PRESTIGE SHOP */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔮</span>
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">REBIRTH PERKS & PRESTIGE SHOP</h3>
              <p className="text-xs text-slate-400">Spend your 🔮 Rebirth Tokens on permanent passive upgrades and multipliers.</p>
            </div>
          </div>
          <div className="bg-purple-950/80 border border-purple-500/40 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-300">
            Available Tokens: <span className="text-amber-300 font-mono font-black text-sm">{rebirthTokens} 🔮</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {perks.map(perk => (
            <div
              key={perk.id}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                perk.purchased
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-slate-200'
                  : rebirthTokens >= perk.costRebirths
                  ? 'bg-slate-900 border-purple-500/40 hover:border-purple-400 text-white'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{perk.icon}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-purple-500/30 bg-purple-900/30 text-purple-300">
                    {perk.costRebirths} TOKENS
                  </span>
                </div>
                <h4 className="font-extrabold text-xs text-white pt-1">{perk.name}</h4>
                <p className="text-[11px] text-slate-300">{perk.description}</p>
                <div className="text-[10px] font-bold text-amber-400 pt-1 font-mono">
                  Effect: {perk.effect}
                </div>
              </div>

              <button
                disabled={perk.purchased || rebirthTokens < perk.costRebirths}
                onClick={() => handleBuyPerk(perk.id)}
                className={`w-full py-2 rounded-lg text-xs font-black transition-all ${
                  perk.purchased
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                    : rebirthTokens >= perk.costRebirths
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {perk.purchased ? '✓ UNLOCKED' : `UNLOCK (${perk.costRebirths} 🔮)`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* REBIRTH MILESTONES */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">REBIRTH LEVEL MILESTONES</h3>
            <p className="text-xs text-slate-400">Reach higher Rebirth levels to claim multi-billion dollar rewards and exclusive badges.</p>
          </div>
        </div>

        <div className="space-y-3">
          {milestones.map(m => {
            const isUnlocked = rebirthLevel >= m.levelReq;
            return (
              <div
                key={m.levelReq}
                className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 transition-all ${
                  m.claimed
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                    : isUnlocked
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border-amber-400 text-white ring-1 ring-amber-400/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border ${
                    isUnlocked ? 'bg-amber-400 text-slate-950 border-amber-300' : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}>
                    Lvl {m.levelReq}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">{m.title}</h4>
                    <p className="text-[11px] text-amber-300/90 font-medium">{m.rewardText}</p>
                  </div>
                </div>

                <button
                  disabled={!isUnlocked || m.claimed}
                  onClick={() => handleClaimMilestone(m.levelReq)}
                  className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${
                    m.claimed
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : isUnlocked
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {m.claimed ? '✓ CLAIMED' : isUnlocked ? '🎁 CLAIM REWARD' : `LOCKED (REACH LVL ${m.levelReq})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
