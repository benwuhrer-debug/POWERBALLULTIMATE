import React, { useState, useMemo, useEffect } from 'react';
import { playJackpotSound, playCoinSound, playTickSound } from '../utils/audio';

interface LiveEventsManagerProps {
  cheatBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  soundEnabled: boolean;
  adminSettings: any;
  onUpdateAdminSettings: (settings: any) => void;
}

export interface WorldEvent {
  id: number;
  name: string;
  icon: string;
  category: 'Cash & Economics' | 'Bidding & Relics' | 'Lottery & RNG' | 'Cosmic Chaos';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Godly' | 'Chaos';
  description: string;
  effectType: string;
  effectValue: number;
}

// Generate 200+ distinct events
export function generate200PlusEvents(): WorldEvent[] {
  const events: WorldEvent[] = [];

  const categories: Array<'Cash & Economics' | 'Bidding & Relics' | 'Lottery & RNG' | 'Cosmic Chaos'> = [
    'Cash & Economics',
    'Bidding & Relics',
    'Lottery & RNG',
    'Cosmic Chaos',
  ];

  const rarities: Array<'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Godly' | 'Chaos'> = [
    'Common', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Godly', 'Chaos'
  ];

  // Templates for Cash & Economics (#1 - #52)
  const cashNames = [
    'Federal Reserve Money Printer Overheat', 'Wall Street Hyper-Short Squeeze', 'Crypto Doge Rocket Surge',
    'Swiss Bank Vault Unlocked Leak', 'Billionaire Cash Rain Drop', 'Global Inflation Relief Stimulus',
    'Oil Super-Giant Stock Dividend Burst', 'Silicon Valley Tech IPO Jackpot', 'Sovereign Debt Jubilee Payout',
    'Central Bank Interest Rate Drop to 0%', 'Gold Bullion Vault Discovery', 'Diamond Mine Surprise Yield',
    'High-Frequency HFT Arbitrage Windfall', 'Offshore Tax Haven Refund Drop', 'Robux Currency Exchange Boom',
    'Platinum Deposit Mining Bonanza', 'Space Mining Asteroid Towing Cash', 'Quantum Bank Ledger Duplication',
    'Secret Inheritance Wire Transfer', 'Venture Capital Mega Funding Round', 'Meme Coin Pump to the Moon',
    'Sovereign Wealth Fund Distribution', 'Real Estate Bubble Cash Out', 'Art Auction Record-Breaking Sale',
    'Cyberpunk NFT Liquidity Surge', 'Rare Antique Collectors Payout', 'Supercomputer Crypto Staking Yield',
    'Casino Royal Jackpot Splash', 'Global Currency Devaluation Rebound', 'Billionaire Philanthropy Grant',
    'Treasure Chest Pirate Gold Unearthing', 'Titanium Futures Market Surge', 'Zero-Fee Banking Bonus Credit',
    'Stolen Vault Recovery Reward', 'Decentralized DeFi Liquidity Injection', 'Monopoly Bank Error In Your Favor',
    'Exotic Car Collector Cash Out', 'Metals Commodity Market Spike', 'Deep-Sea Sunken Galleon Treasure',
    'Luxury Yacht Fleet Auction Credit', 'Quantum Computer Ledger Dividend', 'Metropolitan Land Grant Cash',
    'Solar Energy Carbon Credit Boom', 'Alien Space Gold Retrieval', 'Deep Web Bitcoin Wallet Discovery',
    'International Trade Settlement Bonus', 'Automated Trading Bot Profit Surge', 'Precious Gems Clearing Dividend',
    'Hyper-Rich Family Trust Distribution', 'Intergalactic Trade Treaty Refund', 'Golden Crown Jewels Sale Dividend',
    'Sovereign Mint Printing Frenzy'
  ];

  // Templates for Bidding & Relics (#53 - #104)
  const biddingNames = [
    'Roblox Dominus Mass Duplication Glitch', 'Godly Relic Market Crash', 'Supernova Auction Bidding Spike',
    'Secret Black Market Vault Unlocked', 'Bot Collector Buying Frenzy', 'Classic Builder Helmet Liquidation',
    'Sovereign Crown Discount Sale', 'Koenigsegg Jesko Warehouse Raid', 'Crypto Reserve Key Clearance',
    'Cardboard Box Luxury Appraisal', 'Diamond Trim Jesko Bidding War', 'Swiss Gold Slab Surplus Auction',
    'Quantum Energy Sphere Firesale', 'Zero-Reserve Godly Item Drop', 'HFT Trading Bot License Giveaway',
    'Bacon Hair Wig Collector Hype', 'Wooden Sword Classic Relic Rush', 'Robux Card Vault Liquidity Dump',
    'Dominus Frigidus Ice Freeze Event', 'Dominus Aureus Golden Flash Sale', 'Imperial Scepter Crown Jewels Drop',
    'Plastic Toy Sword Diamond Polish', 'VIP Auction House Double Value', 'Cybernetic Cyborg Armor Clearance',
    'Hyper-Rare Antique Vault Opening', 'Titanium Sword Auction Frenzy', 'Emerald Dragon Egg Bidding Rush',
    'Obsidian Matrix Card Theme Drop', 'Celestial Galaxy Wings Auction', 'Legendary Hoverboard Clearance',
    'Ancient Pharaoh Scepter Unearthing', 'Steampunk Jetpack Bidding War', 'Masterpiece Painting Liquidation',
    'Neon Cyber Helmet Flash Sale', 'Rose Gold Ring Auction Rampage', 'Golden Shield Relic Surplus',
    'Ruby Encrusted Crown Clearance', 'Magic Spellbook Artifact Drop', 'Space Station Module Bidding War',
    'Cyberpunk Laser Rifle Fire Sale', 'Retro Arcade Cabinet Vault Drop', 'Enchanted Elixir Vial Clearance',
    'Golden Armor Plate Bidding Surge', 'Time Capsule 1999 Auction', 'Alien Artifact Fragment Drop',
    'Viking Battle Axe Bidding Frenzy', 'Diamond Crown Jewels Clearance', 'Mythic Pegasus Mount Auction',
    'Super-Speed Flash Boots Drop', 'Zero-Point Energy Core Auction', 'Infinite Power Gem Liquidation',
    'Godly Overlord Relic Extravaganza'
  ];

  // Templates for Lottery & RNG (#105 - #156)
  const lotteryNames = [
    'Quantum White Ball Entanglement', 'Powerball Jackpot Multiplied to $100 Billion', 'Clairvoyance Vision Burst',
    'RNG Matrix Hardware Glitch', 'Rigged Draw Guaranteed Match 5', 'PowerPlay 10x Multiplier Unlocked',
    'White Ball Thermal Frequency Surge', 'Red Powerball Heat Map Spike', 'Infinite Free Ticket Machine',
    'Jackpot Growth Rate Hyper-Speed', 'Monte Carlo Simulation Win Spike', 'Lucky White Ball Magnet Active',
    'Seed LCG Entropy Overdrive', 'Zero-Tax Federal Exception Ticket', 'Double Payout Rollover Event',
    'Instant Match 3 Guarantee Wave', 'Golden Ball Draw Override', 'Supernova Lottery Ticket Explosion',
    'Matrix Code Powerball Hack', 'Clairvoyant Vision 100% Accuracy', 'Jackpot Split Compensation Credit',
    'Parallel Universe Ticket Sync', 'Quantum Multiverse Draw Alignment', 'Telescopic Clairvoyance Pulse',
    'Statistical Deviation Anomaly', 'Hot Number Super-Cluster Spike', 'Cold Number Frost Revival Win',
    'Zero-Point Probability Flux', 'Hyper-Speed Draw 1000 Cycles/sec', 'Mega Jackpot Hyper-Inflation',
    'Federal Lottery Audit Refund', 'VIP Ticket Multi-Match Surge', 'Infinite Rollover Guarantee',
    'Cosmic Rays RNG Interference', 'Quantum Superposition Win State', 'Matrix Developer Draw Force',
    'Gold Tier Payout Multiplier', 'Jackpot Counter Overflow Glitch', 'White Ball Cluster Magnet',
    'Red Ball Laser Trajectory Locking', 'Probability Wave Collapse', 'Chances 1 in 1 Guaranteed',
    'Super-Lucky Ticket Generator', 'Lottery Commission Cash Grant', 'Multiverse Rollover Explosion',
    'Lucky Number 7 Infinite Match', 'White Ball Heat Engine Overheat', 'Red Powerball Cosmic Burst',
    'Instant Grand Prize Payout Wave', 'Matrix Lottery Hack Key Active', 'Godly Draw Probability Lock',
    'Infinite Winning Streak Event'
  ];

  // Templates for Cosmic & Quantum Chaos (#157 - #210)
  const cosmicNames = [
    'Solar Flare Currency Corruptor', 'Dimension C-137 Cash Portal', 'Time Traveler Market Arbitrage',
    'Alien Technology Infrastructure Injection', 'Matrix Developer Mode Override', 'Thermonuclear Cash Reaction',
    'Zero-G Gravity Coin Toss Burst', 'Quantum Sandboxes Fusion Chain Reaction', 'DVD Logo Corner Hit Cash Surge',
    'AV Synthesizer Frequency Glitch', 'Multiplayer Server Fund Duplication', 'Sovereign Profile Title Elevation',
    'Dark Mode Neon Matrix Transformation', 'Supernova Star Core Explosion', 'Black Hole Wealth Singularity',
    'Wormhole Asset Transporter', 'Sub-Atomic Cash Particles', 'Gamma Ray Burst Luck Wave',
    'Tachyon Particle Time Reversal', 'Multiverse Sovereign Resonance', 'Dark Energy Market Surge',
    'Parallel Timeline Wealth Drift', 'Antigravity Hovercraft Coin Rain', 'Quantum Computer Matrix Shatter',
    'Celestial Constellation Blessing', 'Deep Space Nebula Dust Extraction', 'Hyperspace Hyper-Drive Windfall',
    'String Theory Dimensional Fusion', 'Superstring Currency Oscillations', 'Zero-Point Vacuum Energy Extraction',
    'Chronos Time Warp Cash Surge', 'Interdimensional Trade Monopoly', 'Sub-Zero Cryo-Cash Vault Lock',
    'Aether Energy Wealth Channeling', 'Cosmic Microwave Background Wave', 'Quasar Radiation Wealth Pulse',
    'Hyper-Dimensional Hyper-Cube Drop', 'Event Horizon Money Funnel', 'Singularity Core Fusion Generator',
    'Pulsar Star Magnetic Coin Magnet', 'Super-Massive Black Hole Dividend', 'Dark Matter Wealth Condensation',
    'Chronos Time Loop Cash Multiplier', 'Multiverse Chaos Key Activation', 'Omega Point Infinite Asset State',
    'Void Energy Quantum Generator', 'Astral Projection Luck Infusion', 'Solar Eclipse Gold Standard',
    'Cybernetic AI Matrix Overlord', 'Infinite Reality Transmutation', 'Big Bang Sovereign Creation Event',
    'Genesis Block Absolute Wealth Wave', 'Omnipresent Overlord Matrix Reset'
  ];

  let idCounter = 1;

  cashNames.forEach((name, idx) => {
    events.push({
      id: idCounter++,
      name: `#${idCounter - 1} ${name}`,
      icon: idx % 2 === 0 ? '💸' : '💰',
      category: 'Cash & Economics',
      rarity: rarities[idx % rarities.length],
      description: `Global financial event boosting market liquidity and injecting instant cash!`,
      effectType: 'INJECT_CASH',
      effectValue: (idx + 1) * 50000000,
    });
  });

  biddingNames.forEach((name, idx) => {
    events.push({
      id: idCounter++,
      name: `#${idCounter - 1} ${name}`,
      icon: idx % 2 === 0 ? '🔨' : '💎',
      category: 'Bidding & Relics',
      rarity: rarities[idx % rarities.length],
      description: `High-stakes auction event introducing rare relics and bot trading chaos!`,
      effectType: 'BIDDING_BOOST',
      effectValue: (idx + 1) * 100000000,
    });
  });

  lotteryNames.forEach((name, idx) => {
    events.push({
      id: idCounter++,
      name: `#${idCounter - 1} ${name}`,
      icon: idx % 2 === 0 ? '🎲' : '🎰',
      category: 'Lottery & RNG',
      rarity: rarities[idx % rarities.length],
      description: `Probability manipulation event altering Powerball RNG luck and jackpot values!`,
      effectType: 'LOTTERY_LUCK',
      effectValue: (idx + 1) * 2,
    });
  });

  cosmicNames.forEach((name, idx) => {
    events.push({
      id: idCounter++,
      name: `#${idCounter - 1} ${name}`,
      icon: idx % 2 === 0 ? '🌌' : '⚡',
      category: 'Cosmic Chaos',
      rarity: rarities[idx % rarities.length],
      description: `Quantum chaos event bending matrix reality and spawning cosmic multipliers!`,
      effectType: 'COSMIC_CHAOS',
      effectValue: (idx + 1) * 500000000,
    });
  });

  return events;
}

export function LiveEventsManager({
  cheatBalance,
  onUpdateBalance,
  soundEnabled,
  adminSettings,
  onUpdateAdminSettings,
}: LiveEventsManagerProps) {
  // Generate 200+ Events list
  const allEvents = useMemo(() => generate200PlusEvents(), []);

  // Filtering & Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');

  // Live Auto-Event Ticker State
  const [autoSchedulerActive, setAutoSchedulerActive] = useState<boolean>(true);
  const [lastFiredEvent, setLastFiredEvent] = useState<WorldEvent | null>(null);
  const [eventLogs, setEventLogs] = useState<Array<{ id: number; text: string; time: string; rarity: string }>>([
    { id: 1, text: '🌐 Live World Event System Online. 200+ Global Events Loaded.', time: new Date().toLocaleTimeString(), rarity: 'Godly' },
  ]);

  // Filtered Events List
  const filteredEvents = useMemo(() => {
    return allEvents.filter(ev => {
      const matchSearch = ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ev.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'ALL' || ev.category === selectedCategory;
      const matchRarity = selectedRarity === 'ALL' || ev.rarity === selectedRarity;
      return matchSearch && matchCat && matchRarity;
    });
  }, [allEvents, searchTerm, selectedCategory, selectedRarity]);

  // Trigger a single event
  const handleTriggerEvent = (ev: WorldEvent) => {
    playJackpotSound(soundEnabled);
    setLastFiredEvent(ev);

    // Apply specific effect
    if (ev.effectType === 'INJECT_CASH' || ev.effectType === 'BIDDING_BOOST' || ev.effectType === 'COSMIC_CHAOS') {
      onUpdateBalance(cheatBalance + ev.effectValue);
    } else if (ev.effectType === 'LOTTERY_LUCK' && onUpdateAdminSettings) {
      onUpdateAdminSettings({
        ...adminSettings,
        luckMultiplierPowerball: (adminSettings.luckMultiplierPowerball || 1) * 2,
        jackpotValue: (adminSettings.jackpotValue || 40000000) + 1000000000,
      });
      onUpdateBalance(cheatBalance + ev.effectValue * 1000000);
    }

    const logEntry = `🔥 [EVENT FIRED] ${ev.name} (${ev.rarity}) -> Triggered ${ev.description} (+$${ev.effectValue.toLocaleString()})`;
    setEventLogs(prev => [{ id: Date.now(), text: logEntry, time: new Date().toLocaleTimeString(), rarity: ev.rarity }, ...prev.slice(0, 40)]);
  };

  // Trigger ALL 200+ Events at once!
  const handleTriggerAllEvents = () => {
    playJackpotSound(soundEnabled);

    // Sum total cash from all 200+ events
    const totalCashFromAll = allEvents.reduce((acc, ev) => acc + ev.effectValue, 0);
    onUpdateBalance(cheatBalance + totalCashFromAll);

    if (onUpdateAdminSettings) {
      onUpdateAdminSettings({
        ...adminSettings,
        luckMultiplierPowerball: 999999,
        luckMultiplierWhite: 999999,
        jackpotValue: 1000000000000, // $1 Trillion Jackpot
      });
    }

    const logMsg = `💥 [CHAOS OVERLORD] TRIGGERED ALL ${allEvents.length}+ GLOBAL EVENTS AT ONCE! INJECTED +$${totalCashFromAll.toLocaleString()} CASH & $1 TRILLION JACKPOT!`;
    setEventLogs(prev => [{ id: Date.now(), text: logMsg, time: new Date().toLocaleTimeString(), rarity: 'Chaos' }, ...prev]);
  };

  // Auto-Scheduler interval firing live events
  useEffect(() => {
    if (!autoSchedulerActive) return;

    const interval = setInterval(() => {
      const randomEv = allEvents[Math.floor(Math.random() * allEvents.length)];
      handleTriggerEvent(randomEv);
    }, 12000); // Fires a live random event every 12 seconds

    return () => clearInterval(interval);
  }, [autoSchedulerActive, allEvents, cheatBalance]);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 border-2 border-amber-400/80 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg border-2 border-white/30 animate-pulse">
              🌐
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-wide">200+ LIVE WORLD EVENTS ENGINE</h2>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-amber-500/40 font-extrabold uppercase">
                  {allEvents.length} EVENTS LOADED
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium pt-1 max-w-xl">
                Real-time world event simulator. Trigger live market crashes, money rain, lottery glitches, cosmic anomalies, or trigger ALL 200+ events at once for instant trillions!
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAutoSchedulerActive(!autoSchedulerActive)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs border transition-all flex items-center space-x-2 ${
                autoSchedulerActive
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-600/30 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span>📡</span>
              <span>Auto-Event Scheduler: {autoSchedulerActive ? 'ACTIVE (Fires every 12s)' : 'PAUSED'}</span>
            </button>

            <button
              onClick={handleTriggerAllEvents}
              className="bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-yellow-200 flex items-center space-x-2"
            >
              <span>🔥</span>
              <span>TRIGGER ALL {allEvents.length}+ EVENTS AT ONCE!</span>
            </button>
          </div>
        </div>

        {/* Live Activity Feed Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-xs space-y-1 max-h-28 overflow-y-auto">
          <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">📡 LIVE EVENT TICKER STREAM:</p>
          {eventLogs.map(log => (
            <div key={log.id} className="text-[11px] text-slate-300 flex items-center space-x-2">
              <span className="text-slate-500 text-[10px]">{log.time}</span>
              <span className="text-emerald-400 font-bold">{log.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="🔍 Search across 200+ global events by name or effect..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-medium"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none"
            >
              <option value="ALL">All Categories ({allEvents.length})</option>
              <option value="Cash & Economics">💸 Cash & Economics (52)</option>
              <option value="Bidding & Relics">🔨 Bidding & Relics (52)</option>
              <option value="Lottery & RNG">🎲 Lottery & RNG (52)</option>
              <option value="Cosmic Chaos">🌌 Cosmic Chaos (54)</option>
            </select>
          </div>

          {/* Rarity Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Rarity:</span>
            <select
              value={selectedRarity}
              onChange={e => setSelectedRarity(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-purple-300 font-bold focus:outline-none"
            >
              <option value="ALL">All Rarities</option>
              <option value="Common">Common</option>
              <option value="Rare">Rare</option>
              <option value="Epic">Epic</option>
              <option value="Legendary">Legendary</option>
              <option value="Mythic">Mythic</option>
              <option value="Godly">Godly</option>
              <option value="Chaos">Chaos</option>
            </select>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          Showing <span className="text-amber-400 font-bold">{filteredEvents.length}</span> of {allEvents.length} events. Click "⚡ TRIGGER EVENT NOW" on any card to execute its effect immediately.
        </p>
      </div>

      {/* 200+ EVENTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[700px] overflow-y-auto pr-2">
        {filteredEvents.map(ev => {
          let rarityBadgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
          if (ev.rarity === 'Rare') rarityBadgeColor = 'bg-blue-950 text-blue-300 border-blue-500/40';
          else if (ev.rarity === 'Epic') rarityBadgeColor = 'bg-purple-950 text-purple-300 border-purple-500/40';
          else if (ev.rarity === 'Legendary') rarityBadgeColor = 'bg-amber-950 text-amber-300 border-amber-500/40';
          else if (ev.rarity === 'Mythic') rarityBadgeColor = 'bg-rose-950 text-rose-300 border-rose-500/40';
          else if (ev.rarity === 'Godly') rarityBadgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-500/40 animate-pulse';
          else if (ev.rarity === 'Chaos') rarityBadgeColor = 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-500/40 animate-pulse';

          return (
            <div
              key={ev.id}
              className="bg-slate-950 border border-slate-800 hover:border-amber-400/60 rounded-xl p-3.5 flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{ev.icon}</span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${rarityBadgeColor}`}>
                    {ev.rarity}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-xs text-white leading-tight">{ev.name}</h4>
                  <p className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider pt-0.5">{ev.category}</p>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">{ev.description}</p>

                <div className="bg-slate-900 border border-slate-800 rounded p-2 text-[10px] font-mono text-emerald-400 font-bold">
                  Effect: +${ev.effectValue.toLocaleString()} Cash
                </div>
              </div>

              <button
                onClick={() => handleTriggerEvent(ev)}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs py-2 rounded-lg hover:brightness-110 shadow transition-all flex items-center justify-center space-x-1"
              >
                <span>⚡</span>
                <span>TRIGGER EVENT NOW</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
