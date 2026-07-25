import React, { useState, useEffect, useRef } from 'react';
import { playJackpotSound, playCoinSound, playTickSound, playBallPop } from '../utils/audio';
import { UserProfile } from './UserProfileSettings';

interface GeminiMultiverseTabProps {
  cheatBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  userProfile: UserProfile;
  onUpdateProfile: (updater: (prev: UserProfile) => UserProfile) => void;
  adminSettings: any;
  onUpdateAdminSettings: (settings: any) => void;
}

interface CelestialPlanet {
  id: string;
  name: string;
  icon: string;
  incomePerSec: number;
  cost: number;
  level: number;
  description: string;
}

interface CosmicDragon {
  id: string;
  name: string;
  icon: string;
  level: number;
  yieldPerSec: number;
  feedCost: number;
  element: string;
}

interface CryptoStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  owned: number;
}

interface TrophyBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
  reward: number;
  unlocked: boolean;
}

export function GeminiMultiverseTab({
  cheatBalance,
  onUpdateBalance,
  soundEnabled,
  userProfile,
  onUpdateProfile,
  adminSettings,
  onUpdateAdminSettings,
}: GeminiMultiverseTabProps) {
  // ==========================================
  // MASTER CHEAT STATES & GOD TOGGLES
  // ==========================================
  const [singularityEngineActive, setSingularityEngineActive] = useState<boolean>(() => {
    return localStorage.getItem('powerball_gemini_singularity') === 'true';
  });
  const [jackpotAuraActive, setJackpotAuraActive] = useState<boolean>(true);

  // ==========================================
  // FEATURE 1: REALITY WARPER SLIDERS
  // ==========================================
  const [timeSpeed, setTimeSpeed] = useState<number>(1.0);
  const [gravityStrength, setGravityStrength] = useState<number>(9.8);
  const [quantumFreq, setQuantumFreq] = useState<number>(432);

  // ==========================================
  // FEATURE 2: BIG BANG EXPLOSION ENGINE
  // ==========================================
  const [bigBangCount, setBigBangCount] = useState<number>(0);
  const [bigBangFlash, setBigBangFlash] = useState<boolean>(false);

  const handleTriggerBigBang = () => {
    setBigBangCount(prev => prev + 1);
    setBigBangFlash(true);
    setTimeout(() => setBigBangFlash(false), 800);

    const bangYield = 500000000000; // $500 Billion
    onUpdateBalance((prev: number) => prev + bangYield);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // ==========================================
  // FEATURE 3: INFINITE MONEY FOUNTAIN
  // ==========================================
  const [fountainActive, setFountainActive] = useState<boolean>(true);
  const [fountainEarnings, setFountainEarnings] = useState<number>(0);

  // ==========================================
  // FEATURE 4: AI CRYSTAL SPHERE LOTTERY PREDICTION
  // ==========================================
  const [crystalSpinning, setCrystalSpinning] = useState<boolean>(false);
  const [predictedNumbers, setPredictedNumbers] = useState<number[]>([7, 14, 21, 35, 42, 10]);

  const handleSpinCrystalSphere = () => {
    setCrystalSpinning(true);
    if (soundEnabled) playTickSound(soundEnabled);

    setTimeout(() => {
      const n1 = Math.floor(Math.random() * 69) + 1;
      const n2 = Math.floor(Math.random() * 69) + 1;
      const n3 = Math.floor(Math.random() * 69) + 1;
      const n4 = Math.floor(Math.random() * 69) + 1;
      const n5 = Math.floor(Math.random() * 69) + 1;
      const pb = Math.floor(Math.random() * 26) + 1;
      setPredictedNumbers([n1, n2, n3, n4, n5, pb]);
      setCrystalSpinning(false);
      onUpdateBalance((prev: number) => prev + 100000000000); // $100B reward for prophecy
      if (soundEnabled) playJackpotSound(soundEnabled);
    }, 1000);
  };

  // ==========================================
  // FEATURE 5: COSMIC DRAGON INCUBATOR
  // ==========================================
  const [dragons, setDragons] = useState<CosmicDragon[]>([
    { id: 'starlight', name: '✨ Starlight Wyrm', icon: '🐲', level: 1, yieldPerSec: 2000000000, feedCost: 10000000000, element: 'Light' },
    { id: 'nebula', name: '🌌 Nebula Leviathan', icon: '🐉', level: 1, yieldPerSec: 10000000000, feedCost: 50000000000, element: 'Cosmic' },
    { id: 'quantum', name: '⚡ Quantum Hydra', icon: '🐍', level: 0, yieldPerSec: 50000000000, feedCost: 200000000000, element: 'Energy' },
    { id: 'solar', name: '🔥 Solar Phoenix Dragon', icon: '🦅', level: 0, yieldPerSec: 250000000000, feedCost: 1000000000000, element: 'Fire' },
  ]);

  const totalDragonYield = dragons.reduce((sum, d) => sum + (d.yieldPerSec * d.level), 0);

  const handleFeedDragon = (id: string) => {
    const dragon = dragons.find(d => d.id === id);
    if (!dragon) return;
    const cost = dragon.feedCost;
    setDragons(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, level: d.level + 1, feedCost: d.feedCost * 1.8 };
      }
      return d;
    }));
    onUpdateBalance((prev: number) => prev >= cost ? prev - cost : prev + cost);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // ==========================================
  // FEATURE 6: 777 HIGH-ROLLER ROULETTE WHEEL
  // ==========================================
  const [rouletteAngle, setRouletteAngle] = useState<number>(0);
  const [rouletteSpinning, setRouletteSpinning] = useState<boolean>(false);
  const [rouletteResult, setRouletteResult] = useState<string>('Spin the wheel for guaranteed multi-billions!');

  const ROULETTE_SECTORS = [
    { label: '$10 Billion', val: 10000000000 },
    { label: '$50 Billion', val: 50000000000 },
    { label: '$100 Billion', val: 100000000000 },
    { label: '$500 Billion', val: 500000000000 },
    { label: '💎 $1 Trillion', val: 1000000000000 },
    { label: '👑 $5 Trillion', val: 5000000000000 },
  ];

  const handleSpinRoulette = () => {
    if (rouletteSpinning) return;
    setRouletteSpinning(true);
    if (soundEnabled) playTickSound(soundEnabled);

    const randomSector = ROULETTE_SECTORS[Math.floor(Math.random() * ROULETTE_SECTORS.length)];
    const newAngle = rouletteAngle + 1440 + Math.floor(Math.random() * 360);
    setRouletteAngle(newAngle);

    setTimeout(() => {
      setRouletteSpinning(false);
      onUpdateBalance(cheatBalance + randomSector.val);
      setRouletteResult(`🎉 JACKPOT LANDED: ${randomSector.label} added to wallet!`);
      if (soundEnabled) playJackpotSound(soundEnabled);
    }, 2000);
  };

  // ==========================================
  // FEATURE 7: ADMIN GOD MODE SANDBOX SLIDERS
  // ==========================================
  const [ticketMultiplier, setTicketMultiplier] = useState<number>(1000);
  const [autoWinChance, setAutoWinChance] = useState<number>(100);
  const [jackpotMultiplierVal, setJackpotMultiplierVal] = useState<number>(10000);

  // ==========================================
  // FEATURE 8: ROCKET MOON & MARS LAUNCH SIMULATOR
  // ==========================================
  const [rocketDestination, setRocketDestination] = useState<string>('Moon (10x)');
  const [rocketLaunching, setRocketLaunching] = useState<boolean>(false);
  const [rocketProgress, setRocketProgress] = useState<number>(0);
  const [rocketLog, setRocketLog] = useState<string>('Rocket ready for launch on launchpad Alpha!');

  const handleLaunchRocket = () => {
    if (rocketLaunching) return;
    setRocketLaunching(true);
    setRocketProgress(0);
    setRocketLog(`🚀 Rocket ignited! Accelerating towards ${rocketDestination}...`);
    if (soundEnabled) playBallPop(soundEnabled);

    let prog = 0;
    const interval = setInterval(() => {
      prog += 20;
      setRocketProgress(prog);
      if (prog >= 100) {
        clearInterval(interval);
        setRocketLaunching(false);
        const payout = 250000000000; // $250 Billion
        onUpdateBalance(cheatBalance + payout);
        setRocketLog(`🎯 TOUCHDOWN AT ${rocketDestination.toUpperCase()}! Collected +$${payout.toLocaleString()} cosmic bounty!`);
        if (soundEnabled) playJackpotSound(soundEnabled);
      }
    }, 400);
  };

  // ==========================================
  // FEATURE 9: SOVEREIGN OVERLORD ROYAL EDICTS
  // ==========================================
  const [edictTitle, setEdictTitle] = useState<string>('ROYAL DECREE #777: ALL TAXES SURRENDERED TO BEN');
  const [edictsList, setEdictsList] = useState<string[]>([
    'Edict #1: Infinite Powerball ticket printing enabled.',
    'Edict #2: All server members must pay 100% tribute daily.',
  ]);

  const handleIssueEdict = () => {
    if (!edictTitle.trim()) return;
    setEdictsList(prev => [edictTitle, ...prev]);
    onUpdateBalance(cheatBalance + 100000000000); // $100B per edict
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // ==========================================
  // FEATURE 10: BLACK HOLE SINGULARITY CONVERTER
  // ==========================================
  const [darkMatterCrystals, setDarkMatterCrystals] = useState<number>(12);

  const handleSacrificeToBlackHole = () => {
    setDarkMatterCrystals(prev => prev + 5);
    const crystalCash = 500000000000; // $500 Billion
    onUpdateBalance(cheatBalance + crystalCash);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // ==========================================
  // FEATURE 11: QUANTUM MATRIX LASER CANNON
  // ==========================================
  const [laserActive, setLaserActive] = useState<boolean>(false);

  const handleFireLaserCannon = () => {
    setLaserActive(true);
    onUpdateBalance(cheatBalance + 50000000000); // $50B per beam
    if (soundEnabled) playBallPop(soundEnabled);
    setTimeout(() => setLaserActive(false), 400);
  };

  // ==========================================
  // FEATURE 12: SYNTHWAVE AUDIO SYNTHESIZER
  // ==========================================
  const [synthFreq, setSynthFreq] = useState<number>(528); // 528Hz Solfeggio
  const [synthPlaying, setSynthPlaying] = useState<boolean>(false);

  // ==========================================
  // FEATURE 13: GALACTIC HALL OF FAME ROSTER
  // ==========================================
  const hallOfFame = [
    { rank: 1, name: '👑 Ben (Multiverse God)', wealth: '$999,999,999,999,999', badge: 'SOVEREIGN OVERLORD' },
    { rank: 2, name: '✨ Gemini AI Overlord', wealth: '$888,888,888,888,888', badge: 'AI CREATOR' },
    { rank: 3, name: '⚡ Satoshi Nakamoto', wealth: '$500,000,000,000,000', badge: 'BLOCKCHAIN KING' },
    { rank: 4, name: '🚀 Elon SpaceWhale', wealth: '$250,000,000,000,000', badge: 'MARS COLONIZER' },
    { rank: 5, name: '🔮 Powerball Prophet', wealth: '$100,000,000,000,000', badge: 'LOTTERY ORACLE' },
  ];

  // ==========================================
  // FEATURE 14: ALCHEMY LAB & POTION CRAFTING
  // ==========================================
  const [potionStatus, setPotionStatus] = useState<string>('Ready to brew Elixir of Infinite Wealth!');

  const handleBrewPotion = () => {
    setPotionStatus('🧪 Brewing Stardust + Dark Matter + Gold Dust...');
    if (soundEnabled) playTickSound(soundEnabled);

    setTimeout(() => {
      onUpdateBalance(cheatBalance + 1000000000000); // $1 Trillion potion
      setPotionStatus('✨ SUCCESS: Brewed 1x Liquid Gold Elixir (+ $1 Trillion Cash)!');
      if (soundEnabled) playJackpotSound(soundEnabled);
    }, 1000);
  };

  // ==========================================
  // FEATURE 15: HIGH-STAKES COSMIC DICE GAMBLE
  // ==========================================
  const [diceBet, setDiceBet] = useState<number>(10000000000); // $10B
  const [diceRoll, setDiceRoll] = useState<number>(100);
  const [diceMessage, setDiceMessage] = useState<string>('Roll 100-Sided Cosmic Dice for 10x payout!');

  const handleRollDice = () => {
    const roll = Math.floor(Math.random() * 100) + 1;
    setDiceRoll(roll);

    if (roll >= 30) { // 70% win chance in Gemini's realm
      const payout = diceBet * 5;
      onUpdateBalance(cheatBalance + payout);
      setDiceMessage(`🎲 ROLLED ${roll}! WINNER! Won +$${payout.toLocaleString()}!`);
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else {
      const consolation = diceBet * 2;
      onUpdateBalance(cheatBalance + consolation);
      setDiceMessage(`🎲 ROLLED ${roll}! Safe landing bonus +$${consolation.toLocaleString()}!`);
      if (soundEnabled) playCoinSound(soundEnabled);
    }
  };

  // ==========================================
  // FEATURE 16: CROSS-DIMENSION PORTAL GATEWAY
  // ==========================================
  const [activePortal, setActivePortal] = useState<string>('Earth-616 Prime');

  const portals = [
    { name: 'Earth-616 Prime', buff: 'Standard 1x Yield' },
    { name: 'Cyberpunk-2099 Neon City', buff: '+100% Tech Cash' },
    { name: 'Atlantis Sub-Ocean Realm', buff: '+200% Water Yield' },
    { name: 'Alpha Centauri Starport', buff: '+500% Cosmic Yield' },
  ];

  const handleWarpPortal = (pName: string) => {
    setActivePortal(pName);
    onUpdateBalance(cheatBalance + 200000000000); // $200B warp bonus
    if (soundEnabled) playBallPop(soundEnabled);
  };

  // ==========================================
  // FEATURE 17: MULTIVERSE CRYPTO & STOCK TICKER
  // ==========================================
  const [cryptoList, setCryptoList] = useState<CryptoStock[]>([
    { id: 'gemini', symbol: '$GEMINI', name: 'Gemini AI Token', price: 88888, change: +24.5, owned: 100 },
    { id: 'pwrball', symbol: '$PWRBALL', name: 'Powerball Coin', price: 15400, change: +18.2, owned: 50 },
    { id: 'star', symbol: '$STAR', name: 'Stardust Shares', price: 3200, change: +5.4, owned: 200 },
  ]);

  const handleBuyCrypto = (id: string) => {
    setCryptoList(prev => prev.map(c => c.id === id ? { ...c, owned: c.owned + 100, price: c.price * 1.2 } : c));
    onUpdateBalance(cheatBalance + 50000000000); // Instant trade profit
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // ==========================================
  // FEATURE 18: AUTONOMOUS AI ROBOT SWARM
  // ==========================================
  const [botSwarmActive, setBotSwarmActive] = useState<boolean>(true);

  useEffect(() => {
    if (!botSwarmActive) return;
    const interval = setInterval(() => {
      onUpdateBalance(cheatBalance + 15000000000); // $15B/sec from 5 drones
    }, 1000);
    return () => clearInterval(interval);
  }, [botSwarmActive, cheatBalance]);

  // ==========================================
  // FEATURE 19: TIME MACHINE REWIND & FAST-FORWARD
  // ==========================================
  const handleTimeTravelForward = (hours: number) => {
    const earnings = hours * 3600 * 10000000000; // $10B per sec skipped
    onUpdateBalance(cheatBalance + earnings);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // ==========================================
  // FEATURE 20: COSMIC LOOT CRATES & MYSTERY BOXES
  // ==========================================
  const [crateMessage, setCrateMessage] = useState<string>('Unbox Mystery Crate for random Godlike Loot!');

  const handleUnboxCrate = (type: string) => {
    let reward = 100000000000;
    if (type === 'mythic') reward = 500000000000;
    if (type === 'godlike') reward = 2000000000000;

    onUpdateBalance((prev: number) => prev + reward);
    setCrateMessage(`🎁 UNBOXED ${type.toUpperCase()} CRATE! Received +$${reward.toLocaleString()} Cash!`);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // ==========================================
  // BRAND NEW 20 EXPANDED MULTIVERSE FEATURES
  // ==========================================

  // FEATURE 21: WORMHOLE TELEPORTATION GATE
  const [wormholeLog, setWormholeLog] = useState<string>('Gate online. Ready to send 10,000 auto-tickets!');
  const handleTriggerWormhole = () => {
    setWormholeLog('🌀 Wormhole opened! 10,000 Jackpot Tickets warped to central lottery!');
    onUpdateBalance((prev: number) => prev + 1000000000000);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // FEATURE 22: AI DEEP THOUGHT ORACLE
  const [oracleAnswer, setOracleAnswer] = useState<string>('Seek the 528Hz frequency to awaken maximum luck.');
  const handleAskOracle = () => {
    const answers = [
      '✨ Oracle: Align your mind with the cosmic dragon. Powerball jackpot is 100% yours today!',
      '✨ Oracle: The universe was created in a flash of Gemini code. Wealth is infinite.',
      '✨ Oracle: All 6 Powerball numbers are already locked in your favor. Collect your trillions!'
    ];
    setOracleAnswer(answers[Math.floor(Math.random() * answers.length)]);
    onUpdateBalance((prev: number) => prev + 100000000000);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // FEATURE 23: COSMIC GEM CRAFTER
  const [craftedGems, setCraftedGems] = useState<{ ruby: number; emerald: number; sapphire: number; diamond: number }>({
    ruby: 1, emerald: 1, sapphire: 1, diamond: 1
  });
  const handleCraftGem = (gemType: 'ruby' | 'emerald' | 'sapphire' | 'diamond') => {
    const rewards = { ruby: 500000000000, emerald: 1000000000000, sapphire: 2000000000000, diamond: 5000000000000 };
    setCraftedGems(prev => ({ ...prev, [gemType]: prev[gemType] + 1 }));
    onUpdateBalance((prev: number) => prev + rewards[gemType]);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // FEATURE 24: VOLCANO GOLD ERUPTION SIMULATOR
  const [volcanoErupting, setVolcanoErupting] = useState<boolean>(false);
  const handleEruptVolcano = () => {
    setVolcanoErupting(true);
    onUpdateBalance((prev: number) => prev + 250000000000);
    if (soundEnabled) playBallPop(soundEnabled);
    setTimeout(() => setVolcanoErupting(false), 800);
  };

  // FEATURE 25: ALIEN SPACE FLEET COMMAND
  const [fleet, setFleet] = useState([
    { id: 'ufo', name: '🛸 Scout UFO', level: 1, yield: 5000000000 },
    { id: 'dread', name: '⚡ Cyber Dreadnought', level: 1, yield: 20000000000 },
    { id: 'carrier', name: '🌌 Void Carrier', level: 0, yield: 100000000000 },
    { id: 'mothership', name: '👑 Omega Mothership', level: 0, yield: 500000000000 },
  ]);
  const handleUpgradeFleet = (id: string) => {
    setFleet(prev => prev.map(f => f.id === id ? { ...f, level: f.level + 1 } : f));
    onUpdateBalance((prev: number) => prev + 100000000000);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // FEATURE 26: MULTIVERSE BOSS RAID SIMULATOR
  const [bossHp, setBossHp] = useState<number>(1000000);
  const [bossMessage, setBossMessage] = useState<string>('Omega Chaos Dragon is attacking the realm!');
  const handleAttackBoss = () => {
    const dmg = 50000 + Math.floor(Math.random() * 50000);
    const newHp = Math.max(0, bossHp - dmg);
    setBossHp(newHp);
    onUpdateBalance((prev: number) => prev + 50000000000);
    if (newHp === 0) {
      setBossMessage('💥 OMEGA CHAOS DRAGON DEFEATED! Claimed $10 TRILLION RAID LOOT!');
      onUpdateBalance((prev: number) => prev + 10000000000000);
      setTimeout(() => setBossHp(1000000), 5000);
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else {
      setBossMessage(`⚔️ Dealt ${dmg.toLocaleString()} DMG! Boss HP: ${newHp.toLocaleString()} / 1,000,000`);
      if (soundEnabled) playTickSound(soundEnabled);
    }
  };

  // FEATURE 27: SOLFEGGIO 432HZ AUDIO FREQUENCY GENERATOR
  const handlePlaySolfeggioFrequency = (freq: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
      onUpdateBalance((prev: number) => prev + 100000000000);
    } catch (e) {}
  };

  // FEATURE 28: SUPERCOLLIDER PARTICLE ACCELERATOR
  const [colliderProgress, setColliderProgress] = useState<number>(0);
  const [colliderStatus, setColliderStatus] = useState<string>('Collider Idle. Click to smash subatomic protons!');
  const handleAccelerateParticles = () => {
    if (colliderProgress >= 100) {
      setColliderProgress(0);
      setColliderStatus('⚛️ ANTIMATTER SYNTHESIZED! +$2 TRILLION CASH REWARD!');
      onUpdateBalance((prev: number) => prev + 2000000000000);
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else {
      const newP = colliderProgress + 25;
      setColliderProgress(newP);
      setColliderStatus(`⚡ Particle Velocity: ${(newP * 10000).toLocaleString()} km/s!`);
      if (soundEnabled) playTickSound(soundEnabled);
    }
  };

  // FEATURE 29: COSMIC 5-REEL MEGAWAYS SLOT MACHINE
  const [slotReels, setSlotReels] = useState<string[]>(['7️⃣', '💎', '👑', '✨', '🎰']);
  const [slotSpinning, setSlotSpinning] = useState<boolean>(false);
  const [slotOutcome, setSlotOutcome] = useState<string>('Spin 5 Reels for up to $10 Trillion Jackpot!');
  const handleSpinMegawaysSlot = () => {
    if (slotSpinning) return;
    setSlotSpinning(true);
    if (soundEnabled) playTickSound(soundEnabled);
    const emojis = ['7️⃣', '💎', '👑', '✨', '🎰', '🚀', '🔮'];
    setTimeout(() => {
      const r1 = emojis[Math.floor(Math.random() * emojis.length)];
      const r2 = emojis[Math.floor(Math.random() * emojis.length)];
      const r3 = emojis[Math.floor(Math.random() * emojis.length)];
      const r4 = emojis[Math.floor(Math.random() * emojis.length)];
      const r5 = emojis[Math.floor(Math.random() * emojis.length)];
      setSlotReels([r1, r2, r3, r4, r5]);
      setSlotSpinning(false);
      onUpdateBalance((prev: number) => prev + 500000000000);
      setSlotOutcome(`🎰 MEGAWAYS HIT: ${r1} ${r2} ${r3} ${r4} ${r5} (+$500 Billion Cash)!`);
      if (soundEnabled) playJackpotSound(soundEnabled);
    }, 1200);
  };

  // FEATURE 30: CELESTIAL CONSTELLATION DRAWER
  const [gridNodes, setGridNodes] = useState<boolean[]>(Array(16).fill(false));
  const handleToggleNode = (index: number) => {
    const updated = [...gridNodes];
    updated[index] = !updated[index];
    setGridNodes(updated);
    onUpdateBalance((prev: number) => prev + 25000000000);
    if (soundEnabled) playBallPop(soundEnabled);
  };

  // FEATURE 31: TAROT CARDS OF FATE
  const [tarotCard, setTarotCard] = useState<string>('Draw a Tarot Card to read your fortune!');
  const handleDrawTarot = () => {
    const cards = [
      '🔮 The Sovereign 👑: Instant $1 Trillion Jackpot Boost!',
      '🔮 The Wheel of Fortune 🎡: Ticket Luck Multiplied 100x!',
      '🔮 The Celestial Dragon 🐉: Infinite Stardust Shower Unlocked!',
      '🔮 The Sun ☀️: Unlimited VIP Perks Active!'
    ];
    const picked = cards[Math.floor(Math.random() * cards.length)];
    setTarotCard(picked);
    onUpdateBalance((prev: number) => prev + 1000000000000);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // FEATURE 32: INTERGALACTIC CITADEL BUILDER
  const [citadelLevels, setCitadelLevels] = useState<{ treasury: number; observatory: number; spire: number; shield: number }>({
    treasury: 1, observatory: 1, spire: 1, shield: 1
  });
  const handleUpgradeCitadel = (building: 'treasury' | 'observatory' | 'spire' | 'shield') => {
    setCitadelLevels(prev => ({ ...prev, [building]: prev[building] + 1 }));
    onUpdateBalance((prev: number) => prev + 200000000000);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // FEATURE 33: ANTIMATTER BATTERY CHARGER
  const [batteryCharge, setBatteryCharge] = useState<number>(50);
  const handleChargeBattery = () => {
    if (batteryCharge >= 100) {
      setBatteryCharge(0);
      onUpdateBalance((prev: number) => prev + 3000000000000);
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else {
      setBatteryCharge(prev => Math.min(100, prev + 25));
      if (soundEnabled) playTickSound(soundEnabled);
    }
  };

  // FEATURE 34: PLANET TERRAFORMER
  const [terraformedPlanets, setTerraformedPlanets] = useState<string[]>(['Venus Paradise']);
  const handleTerraformPlanet = (pName: string) => {
    if (!terraformedPlanets.includes(pName)) {
      setTerraformedPlanets(prev => [...prev, pName]);
    }
    onUpdateBalance((prev: number) => prev + 500000000000);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // FEATURE 35: SOVEREIGN PRAISE CHANT SYNTHESIZER
  const handleSynthesizeVoicePraise = () => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance('All hail Sovereign Ben, God of the Gemini Multiverse!');
      msg.pitch = 0.9;
      msg.rate = 1.0;
      window.speechSynthesis.speak(msg);
    }
    onUpdateBalance((prev: number) => prev + 100000000000);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // FEATURE 36: COSMIC LASER DARTBOARD TARGET
  const [dartScore, setDartScore] = useState<number>(0);
  const handleThrowDart = () => {
    const pts = Math.floor(Math.random() * 100) + 1;
    setDartScore(prev => prev + pts);
    onUpdateBalance((prev: number) => prev + pts * 1000000000);
    if (soundEnabled) playBallPop(soundEnabled);
  };

  // FEATURE 37: DNA GENETIC ENHANCER
  const [dnaTraits, setDnaTraits] = useState({ luckDna: 10, wealthGene: 10, quantumMind: 10 });
  const handleEnhanceDna = (trait: 'luckDna' | 'wealthGene' | 'quantumMind') => {
    setDnaTraits(prev => ({ ...prev, [trait]: prev[trait] + 5 }));
    onUpdateBalance((prev: number) => prev + 100000000000);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // FEATURE 38: TSUNAMI GOLD WAVE HARNESSER
  const handleRideGoldWave = () => {
    onUpdateBalance((prev: number) => prev + 400000000000);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // FEATURE 39: GOD SHIELD INVINCIBILITY MATRIX
  const [invincibleActive, setInvincibleActive] = useState<boolean>(true);

  // FEATURE 40: SHOOTING STAR WISHING WELL
  const [wishCount, setWishCount] = useState<number>(7);
  const handleMakeWish = () => {
    setWishCount(prev => prev + 1);
    onUpdateBalance((prev: number) => prev + 777000000000);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // FEATURE 41: BLACK HOLE ANTI-MATTER FORGE
  const [blackHoleMass, setBlackHoleMass] = useState<number>(100);
  const handleFeedBlackHole = () => {
    setBlackHoleMass(prev => prev + 50);
    onUpdateBalance((prev: number) => prev + 500000000000);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // FEATURE 42: INTERDIMENSIONAL PORTAL JUMP
  const [currentDimension, setCurrentDimension] = useState<string>('Alpha-6 Prime');
  const handleWarpDimension = (dimName: string) => {
    setCurrentDimension(dimName);
    onUpdateBalance((prev: number) => prev + 1000000000000);
    if (soundEnabled) playBallPop(soundEnabled);
  };

  // FEATURE 43: MULTIVERSE CONSTELLATION WEAVER
  const [activeConstellations, setActiveConstellations] = useState<string[]>(['Pegasus', 'Orion']);
  const handleWeaveConstellation = (cName: string) => {
    if (!activeConstellations.includes(cName)) {
      setActiveConstellations(prev => [...prev, cName]);
    }
    onUpdateBalance((prev: number) => prev + 750000000000);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // FEATURE 44: QUANTUM TEMPORAL STASIS POD
  const [stasisLocked, setStasisLocked] = useState<boolean>(false);
  const [stasisTimer, setStasisTimer] = useState<number>(0);
  const handleLockStasisPod = () => {
    if (stasisLocked) return;
    setStasisLocked(true);
    setStasisTimer(5);
    if (soundEnabled) playTickSound(soundEnabled);
    const interval = setInterval(() => {
      setStasisTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setStasisLocked(false);
          onUpdateBalance((b: number) => b + 2000000000000);
          if (soundEnabled) playJackpotSound(soundEnabled);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // FEATURE 45: CELESTIAL SUPERNOVA DETONATOR
  const [supernovaCharge, setSupernovaCharge] = useState<number>(20);
  const handleDetonateSupernova = () => {
    if (supernovaCharge < 100) {
      setSupernovaCharge(prev => Math.min(100, prev + 20));
      if (soundEnabled) playTickSound(soundEnabled);
    } else {
      setSupernovaCharge(0);
      onUpdateBalance((prev: number) => prev + 5000000000000);
      if (soundEnabled) playJackpotSound(soundEnabled);
    }
  };

  // FEATURE 46: GEMINI ORACLE FATE CARDS
  const [drawnFateCard, setDrawnFateCard] = useState<{ title: string; icon: string; boost: string } | null>({
    title: 'The Sun of Abundance',
    icon: '☀️',
    boost: '+$1,000,000,000,000 Cosmic Cash'
  });
  const handleDrawFateCard = () => {
    const cards = [
      { title: 'The Empress of Luck', icon: '👑', boost: '+$1.5 Trillion Jackpot Bonus' },
      { title: 'The Star of Infinity', icon: '⭐', boost: '+$2.0 Trillion Stardust Yield' },
      { title: 'The Dragon of Prosperity', icon: '🐉', boost: '+$3.0 Trillion Wealth Expansion' },
      { title: 'The Phoenix of Rebirth', icon: '🦅', boost: '+$5.0 Trillion Rebirth Multiplier' },
    ];
    const picked = cards[Math.floor(Math.random() * cards.length)];
    setDrawnFateCard(picked);
    onUpdateBalance((prev: number) => prev + 1500000000000);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // FEATURE 47: COSMIC ALCHEMY SYNTHESIZER
  const [alchemyProduct, setAlchemyProduct] = useState<string>('✨ Philosophers Starlight Stone');
  const handleSynthesizeAlchemy = () => {
    const artifacts = [
      '💎 Diamond Star Sapphire',
      '⚡ Quantum Singularity Orb',
      '🔥 Solar Flare Amulet',
      '🌌 Void Matrix Crystal',
    ];
    const picked = artifacts[Math.floor(Math.random() * artifacts.length)];
    setAlchemyProduct(picked);
    onUpdateBalance((prev: number) => prev + 1000000000000);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // FEATURE 48: EXTRATERRESTRIAL RADIO RECEIVER
  const [radioFreq, setRadioFreq] = useState<number>(1420.40);
  const [radioBroadcast, setRadioBroadcast] = useState<string>('📡 Signal: WOW! Signal [+$888B]');
  const handleScanRadioFreq = () => {
    const newFreq = (1400 + Math.random() * 100).toFixed(2);
    setRadioFreq(Number(newFreq));
    const signals = [
      '📡 Extraterrestrial Signal from Vega 4: +$888 Billion Broadcast!',
      '📡 Alien Signal from Alpha Centauri: +$1.2 Trillion Signal!',
      '📡 Deep Space Pulsar Transmission: +$2.5 Trillion Frequencies!',
    ];
    const sig = signals[Math.floor(Math.random() * signals.length)];
    setRadioBroadcast(`📡 Freq ${newFreq} MHz: ${sig}`);
    onUpdateBalance((prev: number) => prev + 888000000000);
    if (soundEnabled) playBallPop(soundEnabled);
  };

  // ==========================================
  // CELESTIAL PLANETS & EXISTING STATE
  // ==========================================
  const [planets, setPlanets] = useState<CelestialPlanet[]>(() => {
    const saved = localStorage.getItem('powerball_gemini_planets');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'mars', name: '🔴 Mars Mining Colony', icon: '🔴', incomePerSec: 1000000000, cost: 5000000000, level: 1, description: 'Extract red dust minerals for $1 Billion/sec.' },
      { id: 'saturn', name: '🪐 Saturn Diamond Rings', icon: '🪐', incomePerSec: 10000000000, cost: 50000000000, level: 0, description: 'Harvest pure diamond asteroid rings for $10 Billion/sec.' },
      { id: 'dyson', name: '🌟 Dyson Swarm Core', icon: '🌟', incomePerSec: 100000000000, cost: 500000000000, level: 0, description: 'Siphon solar star energy for $100 Billion/sec.' },
      { id: 'blackhole', name: '🌌 Sagittarius A* Core', icon: '🌌', incomePerSec: 1000000000000, cost: 5000000000000, level: 0, description: 'Extract dark matter Hawking radiation for $1 Trillion/sec.' },
      { id: 'multiverse', name: '⚡ Gemini Multiverse Matrix', icon: '⚡', incomePerSec: 50000000000000, cost: 100000000000000, level: 0, description: 'Harvest infinite parallel universe wealth for $50 Trillion/sec.' },
    ];
  });

  const totalPassiveIncome = planets.reduce((sum, p) => sum + (p.incomePerSec * p.level), 0);

  useEffect(() => {
    localStorage.setItem('powerball_gemini_planets', JSON.stringify(planets));
  }, [planets]);

  useEffect(() => {
    if (totalPassiveIncome <= 0) return;
    const interval = setInterval(() => {
      onUpdateBalance((prev: number) => prev + totalPassiveIncome);
    }, 1000);
    return () => clearInterval(interval);
  }, [totalPassiveIncome]);

  useEffect(() => {
    localStorage.setItem('powerball_gemini_singularity', singularityEngineActive ? 'true' : 'false');
    if (!singularityEngineActive) return;
    const interval = setInterval(() => {
      onUpdateBalance((prev: number) => prev + 100000000000);
    }, 1000);
    return () => clearInterval(interval);
  }, [singularityEngineActive]);

  // AI Command Terminal
  const [commandInput, setCommandInput] = useState<string>('');
  const [aiLogs, setAiLogs] = useState<Array<{ sender: 'user' | 'gemini'; text: string; time: string }>>([
    {
      sender: 'gemini',
      text: '✨ Welcome to Gemini’s Multiverse Ultimate Playground! I am your AI Overlord. Type any cheat command or click quick action pills below to grant infinite wealth, spawn celestial planets, or warp lottery probabilities!',
      time: new Date().toLocaleTimeString(),
    }
  ]);

  const handleExecuteAiCommand = (cmdText?: string) => {
    const text = (cmdText || commandInput).trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString();
    const userMsg = { sender: 'user' as const, text, time: now };

    let aiResponse = '';
    const lower = text.toLowerCase();
    if (lower.includes('trillion') || lower.includes('cash') || lower.includes('money') || lower.includes('fund')) {
      const grantAmount = 1000000000000;
      onUpdateBalance(cheatBalance + grantAmount);
      aiResponse = `🌌 [COMMAND EXECUTED]: Granted +$1,000,000,000,000 ($1 Trillion) to your wallet balance! Your wealth is now infinite!`;
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else if (lower.includes('supernova') || lower.includes('jackpot') || lower.includes('win')) {
      onUpdateBalance(cheatBalance + 5000000000000);
      onUpdateAdminSettings({ ...adminSettings, winRateMultiplier: 100 });
      aiResponse = `🎰 [SUPERNOVA ACTIVATED]: Injected $5 Trillion Jackpot & locked lottery win rate to 100% GUARANTEED JACKPOT!`;
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else if (lower.includes('planet') || lower.includes('space') || lower.includes('empire')) {
      setPlanets(prev => prev.map(p => ({ ...p, level: p.level + 5 })));
      aiResponse = `🪐 [CELESTIAL UPGRADE]: Upgraded ALL 5 Celestial Planets by +5 Levels! Passive income boosted to hyper-drive!`;
      if (soundEnabled) playCoinSound(soundEnabled);
    } else if (lower.includes('vip') || lower.includes('level') || lower.includes('rank')) {
      onUpdateProfile(prev => ({ ...prev, vipLevel: 9999, titleBadge: '🌌 Gemini Multiverse God' }));
      aiResponse = `👑 [SOVEREIGN PROMOTION]: Upgraded your user profile to VIP LEVEL 9,999 with title "🌌 Gemini Multiverse God"!`;
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else {
      onUpdateBalance(cheatBalance + 10000000000);
      aiResponse = `⚡ [GEMINI DIRECTIVE]: Executed "${text}". Granted +$10,000,000,000 tribute cash and warped local quantum matrix!`;
      if (soundEnabled) playCoinSound(soundEnabled);
    }

    setAiLogs(prev => [userMsg, { sender: 'gemini', text: aiResponse, time: new Date().toLocaleTimeString() }, ...prev]);
    if (!cmdText) setCommandInput('');
  };

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; label: string }> = [];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 12 + 8,
        color: ['#38bdf8', '#a855f7', '#f59e0b', '#10b981', '#ec4899'][Math.floor(Math.random() * 5)],
        label: ['💸', '💎', '🚀', '⚡', '👑'][Math.floor(Math.random() * 5)],
      });
    }

    const render = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x - p.radius <= 0 || p.x + p.radius >= canvas.width) p.vx *= -1;
        if (p.y - p.radius <= 0 || p.y + p.radius >= canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();

        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label, p.x, p.y);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // ==========================================
  // SPACE LAUNCH PAD & INTERSTELLAR TRAVEL HUB
  // ==========================================
  const [currentSpaceWorld, setCurrentSpaceWorld] = useState<string>(() => {
    return localStorage.getItem('multiverse_space_world') || 'Earth (Normal World)';
  });
  const [spaceLaunchPhase, setSpaceLaunchPhase] = useState<'idle' | 'countdown' | 'flight' | 'landed'>('idle');
  const [spaceCountdownTimer, setSpaceCountdownTimer] = useState<number>(5);
  const [spaceFlightPercent, setSpaceFlightPercent] = useState<number>(0);
  const [spaceSelectedTarget, setSpaceSelectedTarget] = useState<string>('Moon Base Alpha');
  const [spaceLaunchLog, setSpaceLaunchLog] = useState<string>('Space Launch Pad Alpha online. Ready to launch interdimensional rocket into orbit.');

  // Cross-Tab Space Upgrades State
  const [spaceUpgrades, setSpaceUpgrades] = useState<{
    satelliteAutoEngine: number;
    martianPhotonLaser: number;
    jovianTaxShield: number;
    quantumCashSiphon: number;
    stardustMagnifier: number;
  }>(() => {
    const saved = localStorage.getItem('multiverse_space_upgrades');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      satelliteAutoEngine: 1,
      martianPhotonLaser: 1,
      jovianTaxShield: 1,
      quantumCashSiphon: 1,
      stardustMagnifier: 1,
    };
  });

  useEffect(() => {
    localStorage.setItem('multiverse_space_world', currentSpaceWorld);
  }, [currentSpaceWorld]);

  useEffect(() => {
    localStorage.setItem('multiverse_space_upgrades', JSON.stringify(spaceUpgrades));
  }, [spaceUpgrades]);

  const handleLaunchToSpace = (targetName: string) => {
    if (spaceLaunchPhase !== 'idle') return;
    setSpaceSelectedTarget(targetName);
    setSpaceLaunchPhase('countdown');
    setSpaceCountdownTimer(5);
    setSpaceFlightPercent(0);
    setSpaceLaunchLog(`🚀 LAUNCH INITIATED! Destination: ${targetName}. Main engines firing in T-5 seconds...`);
    if (soundEnabled) playTickSound(soundEnabled);

    let count = 5;
    const cdInterval = setInterval(() => {
      count -= 1;
      setSpaceCountdownTimer(count);
      if (soundEnabled) playTickSound(soundEnabled);
      if (count <= 0) {
        clearInterval(cdInterval);
        setSpaceLaunchPhase('flight');
        setSpaceLaunchLog(`🔥 IGNITION & LIFT-OFF! Spacecraft ascending beyond Earth's atmosphere towards ${targetName}...`);
        if (soundEnabled) playBallPop(soundEnabled);

        let flight = 0;
        const flightInterval = setInterval(() => {
          flight += 20;
          setSpaceFlightPercent(flight);
          if (flight >= 100) {
            clearInterval(flightInterval);
            setSpaceLaunchPhase('landed');
            setCurrentSpaceWorld(targetName);
            const spaceReward = 500000000000; // $500 Billion Space Bounty
            onUpdateBalance((prev: number) => prev + spaceReward);
            setSpaceLaunchLog(`🛬 SUCCESSFUL TOUCHDOWN AT ${targetName.toUpperCase()}! All Tab Space Upgrades are now ENHANCED! Bounty: +$500B`);
            if (soundEnabled) playJackpotSound(soundEnabled);

            setTimeout(() => setSpaceLaunchPhase('idle'), 3000);
          }
        }, 500);
      }
    }, 1000);
  };

  const handleSafelyReturnToEarth = () => {
    setCurrentSpaceWorld('Earth (Normal World)');
    setSpaceLaunchLog(`🌍 RE-ENTRY COMPLETE: Safely landed back in the Normal Earth World! All Space Upgrades remain ACTIVE across all tabs.`);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  const handleUpgradeSpacePerk = (perkKey: keyof typeof spaceUpgrades, cost: number) => {
    setSpaceUpgrades(prev => ({
      ...prev,
      [perkKey]: prev[perkKey] + 1
    }));
    onUpdateBalance((prev: number) => prev + cost);
    if (soundEnabled) playJackpotSound(soundEnabled);
    setSpaceLaunchLog(`⚡ UPGRADE PURCHASED: ${String(perkKey)} boosted to Level ${spaceUpgrades[perkKey] + 1}! Multipliers active across all tabs.`);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const boost = spaceUpgrades.stardustMagnifier * 5000000000;
    onUpdateBalance(cheatBalance + boost);
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  return (
    <div className={`space-y-8 pb-20 ${bigBangFlash ? 'animate-ping bg-white/20' : ''}`}>

      {/* ========================================== */}
      {/* HUGE HERO BANNER: GEMINI'S MULTIVERSE OVERLORD */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-cyan-950 via-purple-950 to-slate-950 border-2 border-cyan-400 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 opacity-10 text-[200px] font-black text-cyan-300 pointer-events-none select-none">
          GEMINI
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-amber-400 flex items-center justify-center text-4xl shadow-2xl border-2 border-white/40 animate-bounce">
              ✨
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-black text-white tracking-tight">GEMINI’S MULTIVERSE ULTIMATE PLAYGROUND (20+ MODULES)</h1>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider shadow ring-2 ring-cyan-300 animate-pulse">
                  AI GOD MODE ACTIVE
                </span>
              </div>
              <p className="text-sm text-cyan-200/90 font-medium pt-1 max-w-3xl">
                The largest AI playground tab ever created! Feature-packed with 20 distinct interactive modules: Reality Warpers, Big Bang Detonators, Space Dragon Incubators, Time Machines, Alchemy Labs, Cosmic Slot Machines, and Infinite Cash Fountains!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/90 border border-cyan-500/50 rounded-2xl px-5 py-3 text-center shadow-lg">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Passive Multiverse Yield</p>
              <p className="font-mono text-2xl font-black text-cyan-300">
                +${(totalPassiveIncome + totalDragonYield + (singularityEngineActive ? 100000000000 : 0) + (fountainActive ? 10000000000 : 0) + (botSwarmActive ? 15000000000 : 0)).toLocaleString()}/s
              </p>
            </div>

            <div className="bg-slate-950/90 border border-amber-500/50 rounded-2xl px-5 py-3 text-center shadow-lg">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cheat Balance</p>
              <p className="font-mono text-2xl font-black text-amber-400">
                ${cheatBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* GOD MODE TOGGLE BAR */}
        <div className="pt-6 border-t border-cyan-800/60 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                playTickSound(soundEnabled);
                setSingularityEngineActive(!singularityEngineActive);
              }}
              className={`px-5 py-3 rounded-2xl font-black text-xs transition-all border ${
                singularityEngineActive
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border-amber-200 shadow-xl shadow-amber-500/30 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-slate-900 text-slate-300 border-slate-700'
              }`}
            >
              ⚡ SINGULARITY $100B/SEC ({singularityEngineActive ? 'ON' : 'OFF'})
            </button>

            <button
              onClick={handleTriggerBigBang}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border border-purple-300"
            >
              💥 DETONATE BIG BANG (+$500 BILLION)
            </button>
          </div>

          <button
            onClick={() => {
              onUpdateBalance(cheatBalance + 100000000000000);
              if (soundEnabled) playJackpotSound(soundEnabled);
            }}
            className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500 text-slate-950 font-black text-xs px-6 py-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border-2 border-emerald-200"
          >
            <span className="text-lg">💰</span>
            <span>GRANT +$100 TRILLION INSTANT TRIBUTE</span>
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* SPACE LAUNCH PAD & INTERSTELLAR WORLD TRAVEL HUB */}
      {/* ========================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-2 border-cyan-400 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-900/60 pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl border border-cyan-300">
              🚀
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-extrabold text-white tracking-wide">
                  SPACE LAUNCH PAD & INTERSTELLAR WORLD NAVIGATOR
                </h2>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  currentSpaceWorld.includes('Earth')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
                }`}>
                  {currentSpaceWorld.includes('Earth') ? '🌍 EARTH (NORMAL WORLD)' : `🚀 SPACE: ${currentSpaceWorld.toUpperCase()}`}
                </span>
              </div>
              <p className="text-xs text-cyan-200/80 pt-0.5">
                Launch your rocket into space to unlock cross-dimensional upgrades across ALL tabs (Simulation, Asteroids, Server Tax Shield, Cash Flow). Return safely to the Normal World anytime!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* SAFE RETURN TO NORMAL WORLD BUTTON */}
            <button
              onClick={handleSafelyReturnToEarth}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border-2 border-emerald-200 transition-all hover:scale-105"
            >
              <span className="text-lg">🌍</span>
              <span>RETURN SAFELY TO NORMAL EARTH WORLD</span>
            </button>
          </div>
        </div>

        {/* FLIGHT STATUS & LAUNCHPAD STATUS DISPLAY */}
        <div className="bg-slate-900/90 border border-indigo-800/60 p-4 rounded-2xl space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between text-slate-300">
            <span className="font-bold text-cyan-300">STATUS LOG:</span>
            <span className="text-[11px] text-amber-300 font-bold">{spaceLaunchLog}</span>
          </div>

          {spaceLaunchPhase === 'countdown' && (
            <div className="bg-amber-950/80 border border-amber-500/50 p-3 rounded-xl text-center space-y-1">
              <p className="text-xs font-extrabold text-amber-300 uppercase tracking-widest">🚀 MAIN ENGINE IGNITION COUNTDOWN</p>
              <p className="text-4xl font-black text-amber-400 animate-ping">{spaceCountdownTimer}</p>
            </div>
          )}

          {spaceLaunchPhase === 'flight' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-cyan-300 font-bold">
                <span>FLIGHT TRAJECTORY TO {spaceSelectedTarget.toUpperCase()}</span>
                <span>{spaceFlightPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-cyan-500/40">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${spaceFlightPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* SPACE DESTINATIONS LAUNCHPAD GRID */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">DESTINATION LAUNCHPADS</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* DESTINATION 1: LUNAR OUTPOST */}
            <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
              currentSpaceWorld === 'Moon Base Alpha'
                ? 'bg-slate-900 border-cyan-400 ring-2 ring-cyan-400/50'
                : 'bg-slate-950 border-slate-800 hover:border-cyan-500/50'
            }`}>
              <div>
                <div className="flex items-center space-x-2 text-2xl">
                  <span>🌙</span>
                  <span className="font-extrabold text-xs text-white">MOON BASE ALPHA</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Boosts Simulation Engine Auto-Buy & Multipliers by +500% across all tabs.</p>
              </div>
              <button
                onClick={() => handleLaunchToSpace('Moon Base Alpha')}
                disabled={spaceLaunchPhase !== 'idle'}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-2 rounded-xl transition-all"
              >
                🚀 LAUNCH TO MOON
              </button>
            </div>

            {/* DESTINATION 2: MARS COLONY */}
            <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
              currentSpaceWorld === 'Mars Colony Prime'
                ? 'bg-slate-900 border-rose-400 ring-2 ring-rose-400/50'
                : 'bg-slate-950 border-slate-800 hover:border-rose-500/50'
            }`}>
              <div>
                <div className="flex items-center space-x-2 text-2xl">
                  <span>🔴</span>
                  <span className="font-extrabold text-xs text-white">MARS COLONY PRIME</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Unlocks Photon Laser Cannons in Asteroids Arcade tab with +1000% score.</p>
              </div>
              <button
                onClick={() => handleLaunchToSpace('Mars Colony Prime')}
                disabled={spaceLaunchPhase !== 'idle'}
                className="w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs py-2 rounded-xl transition-all"
              >
                🚀 LAUNCH TO MARS
              </button>
            </div>

            {/* DESTINATION 3: JUPITER MINING */}
            <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
              currentSpaceWorld === 'Jupiter Sovereign Station'
                ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/50'
                : 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
            }`}>
              <div>
                <div className="flex items-center space-x-2 text-2xl">
                  <span>🪐</span>
                  <span className="font-extrabold text-xs text-white">JUPITER SOVEREIGN</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Grants 100% Server Municipal Tax Exemption & +$50B/s Server Passive Cash.</p>
              </div>
              <button
                onClick={() => handleLaunchToSpace('Jupiter Sovereign Station')}
                disabled={spaceLaunchPhase !== 'idle'}
                className="w-full bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs py-2 rounded-xl transition-all"
              >
                🚀 LAUNCH TO JUPITER
              </button>
            </div>

            {/* DESTINATION 4: DEEP SPACE VOID */}
            <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
              currentSpaceWorld === 'Deep Space Singularity'
                ? 'bg-slate-900 border-purple-400 ring-2 ring-purple-400/50'
                : 'bg-slate-950 border-slate-800 hover:border-purple-500/50'
            }`}>
              <div>
                <div className="flex items-center space-x-2 text-2xl">
                  <span>🌌</span>
                  <span className="font-extrabold text-xs text-white">SINGULARITY VOID</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Grants Universal Cross-Tab Multiplier (+2000%) across Bidding, Currency, and Engine.</p>
              </div>
              <button
                onClick={() => handleLaunchToSpace('Deep Space Singularity')}
                disabled={spaceLaunchPhase !== 'idle'}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs py-2 rounded-xl transition-all"
              >
                🚀 LAUNCH TO VOID
              </button>
            </div>

          </div>
        </div>

        {/* CROSS-TAB SPACE UPGRADES MATRIX */}
        <div className="border-t border-indigo-900/60 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <span>🛰️</span>
              <span>CROSS-TAB INTERSTELLAR SPACE UPGRADES</span>
            </h3>
            <span className="text-[10px] text-cyan-300 font-mono font-bold">UPGRADES APPLY TO ALL TABS IN REAL-TIME</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs font-mono">

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-cyan-300">🛰️ Satellite Engine</span>
                <span className="bg-cyan-950 text-cyan-300 text-[10px] px-2 py-0.5 rounded font-black">LVL {spaceUpgrades.satelliteAutoEngine}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Engine Tab Auto-Buy Speed x{spaceUpgrades.satelliteAutoEngine * 5}</p>
              <button
                onClick={() => handleUpgradeSpacePerk('satelliteAutoEngine', 50000000000)}
                className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] py-1.5 rounded-xl transition-all"
              >
                UPGRADE ($50B)
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-rose-300">🔴 Photon Cannon</span>
                <span className="bg-rose-950 text-rose-300 text-[10px] px-2 py-0.5 rounded font-black">LVL {spaceUpgrades.martianPhotonLaser}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Asteroids Arcade Damage +{spaceUpgrades.martianPhotonLaser * 100}%</p>
              <button
                onClick={() => handleUpgradeSpacePerk('martianPhotonLaser', 100000000000)}
                className="w-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 font-bold text-[10px] py-1.5 rounded-xl transition-all"
              >
                UPGRADE ($100B)
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-300">🪐 Jovian Tax Shield</span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-black">LVL {spaceUpgrades.jovianTaxShield}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Server Tax Exemption & +${spaceUpgrades.jovianTaxShield * 10}B/s Cash</p>
              <button
                onClick={() => handleUpgradeSpacePerk('jovianTaxShield', 150000000000)}
                className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] py-1.5 rounded-xl transition-all"
              >
                UPGRADE ($150B)
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-amber-300">⚡ Cash Siphon</span>
                <span className="bg-amber-950 text-amber-300 text-[10px] px-2 py-0.5 rounded font-black">LVL {spaceUpgrades.quantumCashSiphon}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Bidding & Currency Cash Yield +{spaceUpgrades.quantumCashSiphon * 200}%</p>
              <button
                onClick={() => handleUpgradeSpacePerk('quantumCashSiphon', 200000000000)}
                className="w-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 font-bold text-[10px] py-1.5 rounded-xl transition-all"
              >
                UPGRADE ($200B)
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-300">🌌 Stardust Magnifier</span>
                <span className="bg-purple-950 text-purple-300 text-[10px] px-2 py-0.5 rounded font-black">LVL {spaceUpgrades.stardustMagnifier}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">Multiverse Stardust Rewards +{spaceUpgrades.stardustMagnifier * 500}%</p>
              <button
                onClick={() => handleUpgradeSpacePerk('stardustMagnifier', 250000000000)}
                className="w-full bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/40 font-bold text-[10px] py-1.5 rounded-xl transition-all"
              >
                UPGRADE ($250B)
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* NEW 20 FEATURES GRID ROW 1: TIME TRAVEL, REALITY WARPER, LOOT CRATES, ALCHEMY */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* MODULE 1: TIME MACHINE REWIND & FAST FORWARD */}
        <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">⏰</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">1. TIME MACHINE MATRIX</h3>
              <p className="text-[10px] text-slate-400">Skip forward in time to claim offline trillions!</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleTimeTravelForward(1)}
              className="bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold p-2.5 rounded-xl border border-cyan-500/30 transition-all text-[11px]"
            >
              +1 Hour ($36T)
            </button>
            <button
              onClick={() => handleTimeTravelForward(24)}
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold p-2.5 rounded-xl border border-amber-500/30 transition-all text-[11px]"
            >
              +1 Day ($864T)
            </button>
            <button
              onClick={() => handleTimeTravelForward(100)}
              className="bg-slate-900 hover:bg-slate-800 text-purple-300 font-bold p-2.5 rounded-xl border border-purple-500/30 transition-all text-[11px] col-span-2"
            >
              ⚡ SKIP 100 HOURS (+ $3.6 QUADRILLION)
            </button>
          </div>
        </div>

        {/* MODULE 2: REALITY WARPER SLIDERS */}
        <div className="bg-slate-950 border-2 border-purple-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🌌</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">2. COSMIC REALITY WARPER</h3>
              <p className="text-[10px] text-slate-400">Adjust space-time speed & quantum frequency.</p>
            </div>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between text-slate-300 font-bold">
              <span>Time Speed:</span>
              <span className="text-cyan-300 font-mono">{timeSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={timeSpeed}
              onChange={e => setTimeSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* MODULE 3: COSMIC LOOT CRATES */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🎁</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">3. MYSTERY LOOT CRATES</h3>
              <p className="text-[10px] text-slate-400">Unbox random multi-billion rewards.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleUnboxCrate('legendary')}
              className="bg-slate-900 text-amber-300 font-black p-2 rounded-xl text-[10px] border border-amber-400/40 hover:scale-105 transition-all"
            >
              🎁 $100B
            </button>
            <button
              onClick={() => handleUnboxCrate('mythic')}
              className="bg-slate-900 text-purple-300 font-black p-2 rounded-xl text-[10px] border border-purple-400/40 hover:scale-105 transition-all"
            >
              💜 $500B
            </button>
            <button
              onClick={() => handleUnboxCrate('godlike')}
              className="bg-slate-900 text-cyan-300 font-black p-2 rounded-xl text-[10px] border border-cyan-400/40 hover:scale-105 transition-all"
            >
              👑 $2 Trillion
            </button>
          </div>
          <p className="text-[10px] font-mono text-center text-amber-300 pt-1">{crateMessage}</p>
        </div>

        {/* MODULE 4: ALCHEMY LAB */}
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🧪</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">4. ALCHEMY LAB</h3>
              <p className="text-[10px] text-slate-400">Brew Stardust into Liquid Gold.</p>
            </div>
          </div>
          <p className="text-[10px] font-mono text-emerald-300 leading-tight">{potionStatus}</p>
          <button
            onClick={handleBrewPotion}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-black text-xs py-2 rounded-xl shadow transition-all hover:scale-105"
          >
            🧪 BREW $1 TRILLION ELIXIR
          </button>
        </div>

      </div>

      {/* ========================================== */}
      {/* ROW 2: COSMIC DRAGONS & 777 HIGH ROLLER ROULETTE */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* MODULE 5: COSMIC DRAGON INCUBATOR */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🐉</span>
              <div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">5. COSMIC DRAGON INCUBATOR</h3>
                <p className="text-xs text-slate-400">Train space dragons to earn billions in passive dragon breath cash!</p>
              </div>
            </div>
            <span className="font-mono text-xs font-black text-amber-400">
              +${totalDragonYield.toLocaleString()}/s
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dragons.map(d => (
              <div key={d.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{d.icon}</span>
                  <div>
                    <div className="font-extrabold text-xs text-white">{d.name}</div>
                    <div className="text-[10px] text-emerald-400 font-mono">LVL {d.level} • +${(d.yieldPerSec / 1000000000)}B/s</div>
                  </div>
                </div>
                <button
                  onClick={() => handleFeedDragon(d.id)}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-[10px] px-3 py-2 rounded-xl border border-amber-500/30 transition-all"
                >
                  FEED
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MODULE 6: 777 HIGH ROLLER VIP ROULETTE */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🎡</span>
              <div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">6. 777 HIGH-ROLLER ROULETTE</h3>
                <p className="text-xs text-slate-400">Guaranteed win wheel with up to $5 Trillion payouts!</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-3">
            <div
              style={{ transform: `rotate(${rouletteAngle}deg)` }}
              className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-amber-400 via-purple-600 to-cyan-400 flex items-center justify-center text-4xl shadow-2xl border-4 border-amber-300 transition-all duration-[2000ms] ease-out"
            >
              🎡
            </div>
            <p className="font-mono text-xs font-bold text-amber-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              {rouletteResult}
            </p>
          </div>

          <button
            onClick={handleSpinRoulette}
            disabled={rouletteSpinning}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs py-3 rounded-xl shadow hover:scale-105 transition-all"
          >
            🎡 SPIN 777 ROULETTE WHEEL
          </button>
        </div>

      </div>

      {/* ========================================== */}
      {/* ROW 3: ROCKET LAUNCH SIMULATOR & CROSS-DIMENSION PORTALS */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* MODULE 7: ROCKET MOON & MARS LAUNCH SIMULATOR */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🚀</span>
            <div>
              <h3 className="font-extrabold text-base text-white uppercase tracking-wider">7. ROCKET MOON & MARS LAUNCH SIMULATOR</h3>
              <p className="text-xs text-slate-400">Launch space missions across the solar system for $250 Billion bounties!</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <select
                value={rocketDestination}
                onChange={e => setRocketDestination(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-cyan-300 font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none flex-1"
              >
                <option value="Moon (10x)">🚀 Destination: The Moon (10x Multiplier)</option>
                <option value="Mars (50x)">🔴 Destination: Mars Mining Outpost (50x Multiplier)</option>
                <option value="Jupiter (200x)">🪐 Destination: Jupiter Great Red Spot (200x Multiplier)</option>
              </select>

              <button
                onClick={handleLaunchRocket}
                disabled={rocketLaunching}
                className="bg-gradient-to-r from-cyan-400 to-purple-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl shadow hover:scale-105 transition-all"
              >
                IGNITE ROCKET 🚀
              </button>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${rocketProgress}%` }}
                className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-300"
              />
            </div>

            <p className="font-mono text-xs text-cyan-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              {rocketLog}
            </p>
          </div>
        </div>

        {/* MODULE 8: CROSS-DIMENSION PORTAL GATEWAY */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🌀</span>
              <div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">8. CROSS-DIMENSION PORTAL GATEWAY</h3>
                <p className="text-xs text-slate-400">Warp into parallel universes to claim +$200 Billion dimension cash!</p>
              </div>
            </div>
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-purple-500/40">
              PORTAL: {activePortal}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {portals.map(p => (
              <button
                key={p.name}
                onClick={() => handleWarpPortal(p.name)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  activePortal === p.name
                    ? 'bg-purple-950/60 border-purple-400 text-white shadow-lg ring-2 ring-purple-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="font-black text-xs text-purple-300">{p.name}</div>
                <div className="text-[10px] text-slate-400">{p.buff}</div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* ROW 4: CRYPTO TICKER, BLACK HOLE CONVERTER, ROYAL EDICTS */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* MODULE 9: CRYPTO & STOCK TICKER */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">📈</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">9. MULTIVERSE STOCK TICKER</h3>
              <p className="text-[10px] text-slate-400">Trade shares for 1000x profits.</p>
            </div>
          </div>
          <div className="space-y-2">
            {cryptoList.map(c => (
              <div key={c.id} className="bg-slate-900 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-black text-amber-300">{c.symbol}</span>
                  <span className="text-[10px] text-emerald-400 ml-2">+{c.change}%</span>
                </div>
                <button
                  onClick={() => handleBuyCrypto(c.id)}
                  className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-[10px] px-2.5 py-1 rounded-lg"
                >
                  BUY 100 SHARES
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MODULE 10: BLACK HOLE SINGULARITY CONVERTER */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🕳️</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">10. BLACK HOLE CONVERTER</h3>
              <p className="text-[10px] text-slate-400">Sacrifice to forge Dark Matter Crystals.</p>
            </div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Dark Matter Crystals Held</p>
            <p className="font-mono text-2xl font-black text-purple-300">{darkMatterCrystals} 🔮</p>
          </div>
          <button
            onClick={handleSacrificeToBlackHole}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2 rounded-xl transition-all shadow"
          >
            🕳️ SACRIFICE & FORGE (+$500B)
          </button>
        </div>

        {/* MODULE 11: ROYAL EDICTS CREATOR */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">📜</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">11. SOVEREIGN EDICTS</h3>
              <p className="text-[10px] text-slate-400">Issue royal laws for +$100B cash.</p>
            </div>
          </div>
          <input
            type="text"
            value={edictTitle}
            onChange={e => setEdictTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white font-bold text-xs p-2 rounded-xl focus:outline-none"
          />
          <button
            onClick={handleIssueEdict}
            className="w-full bg-amber-400 text-slate-950 font-black text-xs py-2 rounded-xl transition-all shadow"
          >
            📜 ISSUE EDICT (+$100B)
          </button>
        </div>

      </div>

      {/* ========================================== */}
      {/* ROW 5: LASER CANNON, HIGH LOW DICE, ROBOT SWARM, HALL OF FAME */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* MODULE 12: QUANTUM MATRIX LASER CANNON */}
        <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">12. QUANTUM LASER CANNON</h3>
              <p className="text-[10px] text-slate-400">Fire hyper-beam for $50B cash bursts!</p>
            </div>
          </div>
          <button
            onClick={handleFireLaserCannon}
            className={`w-full py-4 rounded-2xl font-black text-xs transition-all border-2 ${
              laserActive
                ? 'bg-cyan-300 text-slate-950 border-white animate-ping'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-300 hover:scale-105'
            }`}
          >
            ⚡ FIRE HYPER BEAM NOW!
          </button>
        </div>

        {/* MODULE 13: HIGH LOW COSMIC DICE */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🎲</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">13. COSMIC HIGH-LOW DICE</h3>
              <p className="text-[10px] text-slate-400">Roll 100-sided dice for 5x multiplier!</p>
            </div>
          </div>
          <p className="font-mono text-center text-xs font-bold text-amber-300">{diceMessage}</p>
          <button
            onClick={handleRollDice}
            className="w-full bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🎲 ROLL DICE ($10B BET)
          </button>
        </div>

        {/* MODULE 14: AUTONOMOUS AI ROBOT SWARM */}
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">14. AI ROBOT SWARM</h3>
              <p className="text-[10px] text-slate-400">5 automated drones harvesting $15B/sec.</p>
            </div>
          </div>
          <button
            onClick={() => setBotSwarmActive(!botSwarmActive)}
            className={`w-full py-2.5 rounded-xl font-black text-xs border ${
              botSwarmActive
                ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            🤖 AI DRONE SWARM: {botSwarmActive ? 'ACTIVE ($15B/s)' : 'PAUSED'}
          </button>
        </div>

        {/* MODULE 15: GALACTIC HALL OF FAME */}
        <div className="bg-slate-950 border-2 border-purple-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">15. GALACTIC HALL OF FAME</h3>
              <p className="text-[10px] text-slate-400">Multiverse Leaderboard.</p>
            </div>
          </div>
          <div className="space-y-1.5 text-[10px]">
            {hallOfFame.slice(0, 3).map(h => (
              <div key={h.rank} className="flex items-center justify-between bg-slate-900 p-1.5 rounded-lg">
                <span className="font-bold text-amber-300">#{h.rank} {h.name}</span>
                <span className="font-mono text-cyan-300">{h.wealth}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* BRAND NEW EXPANDED SECTION: 20 NEW COSMIC MODULES */}
      {/* ========================================== */}

      {/* ROW 6: WORMHOLE, ORACLE, GEM CRAFTER, VOLCANO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* FEATURE 21: WORMHOLE TELEPORTATION GATE */}
        <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🌀</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">21. WORMHOLE GATE</h3>
              <p className="text-[10px] text-slate-400">Teleport 10,000 auto-tickets.</p>
            </div>
          </div>
          <p className="font-mono text-[10px] text-cyan-300 bg-slate-900 p-2 rounded-xl">{wormholeLog}</p>
          <button
            onClick={handleTriggerWormhole}
            className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow hover:scale-105 transition-all"
          >
            🌀 OPEN WORMHOLE (+$1T)
          </button>
        </div>

        {/* FEATURE 22: AI DEEP THOUGHT ORACLE */}
        <div className="bg-slate-950 border-2 border-purple-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🔮</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">22. DEEP THOUGHT ORACLE</h3>
              <p className="text-[10px] text-slate-400">Consult AI Oracle for $100B cash.</p>
            </div>
          </div>
          <p className="font-mono text-[10px] text-purple-300 bg-slate-900 p-2 rounded-xl leading-tight">{oracleAnswer}</p>
          <button
            onClick={handleAskOracle}
            className="w-full bg-purple-500 hover:bg-purple-400 text-white font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🔮 ASK ORACLE WISDOM
          </button>
        </div>

        {/* FEATURE 23: COSMIC GEM CRAFTER */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">💎</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">23. GEM CRAFTER</h3>
              <p className="text-[10px] text-slate-400">Craft gems for mega multi-billions.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button onClick={() => handleCraftGem('ruby')} className="bg-slate-900 text-red-400 p-1.5 rounded-lg border border-red-500/30 font-bold">
              ♦️ Ruby ({craftedGems.ruby})
            </button>
            <button onClick={() => handleCraftGem('emerald')} className="bg-slate-900 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/30 font-bold">
              ❇️ Emerald ({craftedGems.emerald})
            </button>
            <button onClick={() => handleCraftGem('sapphire')} className="bg-slate-900 text-blue-400 p-1.5 rounded-lg border border-blue-500/30 font-bold">
              🔹 Sapphire ({craftedGems.sapphire})
            </button>
            <button onClick={() => handleCraftGem('diamond')} className="bg-slate-900 text-cyan-300 p-1.5 rounded-lg border border-cyan-400/30 font-bold">
              💎 Diamond ({craftedGems.diamond})
            </button>
          </div>
        </div>

        {/* FEATURE 24: VOLCANO GOLD ERUPTION SIMULATOR */}
        <div className="bg-slate-950 border-2 border-red-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🌋</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">24. GOLD VOLCANO</h3>
              <p className="text-[10px] text-slate-400">Erupt golden lava for $250B!</p>
            </div>
          </div>
          <button
            onClick={handleEruptVolcano}
            className={`w-full py-3.5 rounded-2xl font-black text-xs transition-all ${
              volcanoErupting ? 'bg-amber-400 text-slate-950 scale-110 animate-bounce' : 'bg-gradient-to-r from-red-600 to-amber-500 text-white hover:scale-105'
            }`}
          >
            🌋 ERUPT GOLD VOLCANO (+$250B)
          </button>
        </div>

      </div>

      {/* ROW 7: SPACE FLEET, BOSS RAID, SOLFEGGIO, SUPERCOLLIDER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* FEATURE 25: ALIEN SPACE FLEET COMMAND */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🛸</span>
            <div>
              <h3 className="font-extrabold text-base text-white uppercase tracking-wider">25. ALIEN SPACE FLEET COMMAND</h3>
              <p className="text-xs text-slate-400">Deploy alien starships for extra passive multi-billion yield!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fleet.map(f => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-xs text-white">{f.name}</div>
                  <div className="text-[10px] text-cyan-300 font-mono">LVL {f.level}</div>
                </div>
                <button
                  onClick={() => handleUpgradeFleet(f.id)}
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-black text-[10px] px-3 py-1.5 rounded-xl border border-cyan-400/30"
                >
                  UPGRADE
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FEATURE 26: MULTIVERSE BOSS RAID SIMULATOR */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🐉</span>
              <div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">26. OMEGA CHAOS BOSS RAID</h3>
                <p className="text-xs text-slate-400">Raid boss for $10 Trillion loot drops!</p>
              </div>
            </div>
            <span className="font-mono text-xs font-black text-red-400">
              HP: {bossHp.toLocaleString()}
            </span>
          </div>

          <div className="space-y-3">
            <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${(bossHp / 1000000) * 100}%` }}
                className="h-full bg-gradient-to-r from-red-600 to-amber-400 transition-all duration-300"
              />
            </div>

            <p className="font-mono text-xs text-amber-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              {bossMessage}
            </p>

            <button
              onClick={handleAttackBoss}
              className="w-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white font-black text-xs py-3 rounded-xl shadow hover:scale-105 transition-all"
            >
              ⚔️ ATTACK BOSS WITH LASER CANNON (+$50B LOOT / HIT)
            </button>
          </div>
        </div>

      </div>

      {/* ROW 8: SOLFEGGIO, SUPERCOLLIDER, MEGAWAYS SLOT, CONSTELLATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* FEATURE 27: SOLFEGGIO FREQUENCY MEDITATION */}
        <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🎶</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">27. SOLFEGGIO 528HZ TONE</h3>
              <p className="text-[10px] text-slate-400">Play Solfeggio sound for luck.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button onClick={() => handlePlaySolfeggioFrequency(432)} className="bg-slate-900 text-cyan-300 p-2 rounded-xl border border-cyan-500/30 font-bold">
              432Hz Miracle
            </button>
            <button onClick={() => handlePlaySolfeggioFrequency(528)} className="bg-slate-900 text-amber-300 p-2 rounded-xl border border-amber-500/30 font-bold">
              528Hz Solfeggio
            </button>
          </div>
        </div>

        {/* FEATURE 28: SUPERCOLLIDER PARTICLE ACCELERATOR */}
        <div className="bg-slate-950 border-2 border-purple-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">⚛️</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">28. SUPERCOLLIDER</h3>
              <p className="text-[10px] text-slate-400">Synthesize $2T Antimatter.</p>
            </div>
          </div>
          <p className="font-mono text-[10px] text-purple-300 leading-tight">{colliderStatus}</p>
          <button
            onClick={handleAccelerateParticles}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2 rounded-xl shadow transition-all"
          >
            ⚛️ ACCELERATE PARTICLES ({colliderProgress}%)
          </button>
        </div>

        {/* FEATURE 29: COSMIC 5-REEL MEGAWAYS SLOT MACHINE */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🎰</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">29. 5-REEL MEGAWAYS SLOT</h3>
              <p className="text-[10px] text-slate-400">Spin for $500 Billion payouts.</p>
            </div>
          </div>
          <div className="flex justify-center space-x-2 text-2xl bg-slate-900 p-2 rounded-xl border border-amber-400/30">
            {slotReels.map((emoji, idx) => (
              <span key={idx} className={slotSpinning ? 'animate-spin' : ''}>{emoji}</span>
            ))}
          </div>
          <button
            onClick={handleSpinMegawaysSlot}
            disabled={slotSpinning}
            className="w-full bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs py-2 rounded-xl shadow transition-all"
          >
            🎰 SPIN 5 REELS NOW
          </button>
        </div>

        {/* FEATURE 30: CELESTIAL CONSTELLATION DRAWER */}
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🌟</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">30. STAR CONSTELLATIONS</h3>
              <p className="text-[10px] text-slate-400">Click star nodes for cash.</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-2 rounded-xl">
            {gridNodes.map((active, idx) => (
              <button
                key={idx}
                onClick={() => handleToggleNode(idx)}
                className={`w-full h-7 rounded-lg font-bold text-xs transition-all ${
                  active ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/50' : 'bg-slate-800 text-slate-500'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ROW 9: TAROT, CITADEL, BATTERY, TERRAFORMER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* FEATURE 31: TAROT CARDS OF FATE */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🎴</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">31. TAROT OF FATE</h3>
              <p className="text-[10px] text-slate-400">Draw card for $1 Trillion.</p>
            </div>
          </div>
          <p className="font-mono text-[10px] text-amber-300 bg-slate-900 p-2 rounded-xl leading-tight">{tarotCard}</p>
          <button
            onClick={handleDrawTarot}
            className="w-full bg-gradient-to-r from-amber-400 to-purple-500 text-slate-950 font-black text-xs py-2 rounded-xl shadow transition-all"
          >
            🎴 DRAW TAROT CARD
          </button>
        </div>

        {/* FEATURE 32: INTERGALACTIC CITADEL BUILDER */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🏰</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">32. CITADEL BUILDER</h3>
              <p className="text-[10px] text-slate-400">Upgrade royal citadel towers.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button onClick={() => handleUpgradeCitadel('treasury')} className="bg-slate-900 text-amber-300 p-1.5 rounded-lg border border-amber-500/30 font-bold">
              💰 Treasury (L{citadelLevels.treasury})
            </button>
            <button onClick={() => handleUpgradeCitadel('observatory')} className="bg-slate-900 text-cyan-300 p-1.5 rounded-lg border border-cyan-500/30 font-bold">
              🔭 Observatory (L{citadelLevels.observatory})
            </button>
          </div>
        </div>

        {/* FEATURE 33: ANTIMATTER BATTERY CHARGER */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🔋</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">33. ANTIMATTER BATTERY</h3>
              <p className="text-[10px] text-slate-400">Charge 100% for $3T Surge.</p>
            </div>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
            <div style={{ width: `${batteryCharge}%` }} className="h-full bg-gradient-to-r from-cyan-400 to-amber-400" />
          </div>
          <button
            onClick={handleChargeBattery}
            className="w-full bg-cyan-400 text-slate-950 font-black text-xs py-2 rounded-xl shadow transition-all"
          >
            🔋 CHARGE BATTERY ({batteryCharge}%)
          </button>
        </div>

        {/* FEATURE 34: PLANET TERRAFORMER */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🪐</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">34. PLANET TERRAFORMER</h3>
              <p className="text-[10px] text-slate-400">Terraform alien worlds.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button onClick={() => handleTerraformPlanet('Venus')} className="bg-slate-900 text-amber-300 p-1.5 rounded-lg border border-amber-400/30 font-bold">
              Venus Paradise
            </button>
            <button onClick={() => handleTerraformPlanet('Europa')} className="bg-slate-900 text-cyan-300 p-1.5 rounded-lg border border-cyan-400/30 font-bold">
              Europa Ocean
            </button>
          </div>
        </div>

      </div>

      {/* ROW 10: VOICE SYNTHESIZER, LASER DART, DNA ENHANCER, WISHING WELL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* FEATURE 35: VOICE PRAISE SYNTHESIZER */}
        <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🗣️</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">35. VOICE SYNTHESIZER</h3>
              <p className="text-[10px] text-slate-400">Synthesize Voice Praise aloud!</p>
            </div>
          </div>
          <button
            onClick={handleSynthesizeVoicePraise}
            className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🗣️ SPEAK VOICE CHANT ALOUD
          </button>
        </div>

        {/* FEATURE 36: COSMIC LASER DARTBOARD */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🎯</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">36. LASER DARTBOARD</h3>
              <p className="text-[10px] text-slate-400">Score: {dartScore} pts</p>
            </div>
          </div>
          <button
            onClick={handleThrowDart}
            className="w-full bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🎯 THROW LASER DART
          </button>
        </div>

        {/* FEATURE 37: DNA GENETIC ENHANCER */}
        <div className="bg-slate-950 border-2 border-purple-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🧬</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">37. DNA ENHANCER</h3>
              <p className="text-[10px] text-slate-400">Luck DNA: LVL {dnaTraits.luckDna}</p>
            </div>
          </div>
          <button
            onClick={() => handleEnhanceDna('luckDna')}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🧬 ENHANCE LUCK DNA
          </button>
        </div>

        {/* FEATURE 40: SHOOTING STAR WISHING WELL */}
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🌠</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">40. WISHING WELL</h3>
              <p className="text-[10px] text-slate-400">Wishes Cast: {wishCount}</p>
            </div>
          </div>
          <button
            onClick={handleMakeWish}
            className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🌠 MAKE WISH (+$777B)
          </button>
        </div>

      </div>

      {/* ROW 11: BLACK HOLE FORGE, PORTAL JUMP, CONSTELLATION WEAVER, STASIS POD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* FEATURE 41: BLACK HOLE ANTI-MATTER FORGE */}
        <div className="bg-slate-950 border-2 border-purple-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🕳️</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">41. BLACK HOLE FORGE</h3>
              <p className="text-[10px] text-slate-400">Mass: {blackHoleMass} M☉</p>
            </div>
          </div>
          <button
            onClick={handleFeedBlackHole}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🕳️ FEED MATTER (+$500B)
          </button>
        </div>

        {/* FEATURE 42: INTERDIMENSIONAL PORTAL JUMP */}
        <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🌀</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">42. PORTAL JUMP</h3>
              <p className="text-[10px] text-slate-400">Current: {currentDimension}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button onClick={() => handleWarpDimension('Alpha-6')} className="bg-slate-900 text-cyan-300 p-1 rounded font-bold border border-cyan-500/30">Alpha-6</button>
            <button onClick={() => handleWarpDimension('Omega-X')} className="bg-slate-900 text-amber-300 p-1 rounded font-bold border border-amber-500/30">Omega-X</button>
            <button onClick={() => handleWarpDimension('Cyber-Prime')} className="bg-slate-900 text-purple-300 p-1 rounded font-bold border border-purple-500/30">Cyber-Prime</button>
            <button onClick={() => handleWarpDimension('Quantum-8')} className="bg-slate-900 text-emerald-300 p-1 rounded font-bold border border-emerald-500/30">Quantum-8</button>
          </div>
        </div>

        {/* FEATURE 43: MULTIVERSE CONSTELLATION WEAVER */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🌌</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">43. CONSTELLATIONS</h3>
              <p className="text-[10px] text-slate-400">Weaved: {activeConstellations.length}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <button onClick={() => handleWeaveConstellation('Pegasus')} className="bg-slate-900 text-amber-300 p-1 rounded font-bold border border-amber-500/30">✨ Pegasus</button>
            <button onClick={() => handleWeaveConstellation('Orion')} className="bg-slate-900 text-cyan-300 p-1 rounded font-bold border border-cyan-500/30">✨ Orion</button>
            <button onClick={() => handleWeaveConstellation('Andromeda')} className="bg-slate-900 text-emerald-300 p-1 rounded font-bold border border-emerald-500/30">✨ Andromeda</button>
            <button onClick={() => handleWeaveConstellation('Phoenix')} className="bg-slate-900 text-rose-300 p-1 rounded font-bold border border-rose-500/30">✨ Phoenix</button>
          </div>
        </div>

        {/* FEATURE 44: QUANTUM TEMPORAL STASIS POD */}
        <div className="bg-slate-950 border-2 border-blue-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">⏳</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">44. STASIS POD</h3>
              <p className="text-[10px] text-slate-400">{stasisLocked ? `Timer: ${stasisTimer}s` : 'Status: Ready'}</p>
            </div>
          </div>
          <button
            onClick={handleLockStasisPod}
            disabled={stasisLocked}
            className={`w-full font-black text-xs py-2.5 rounded-xl shadow transition-all ${
              stasisLocked
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-400 text-white'
            }`}
          >
            {stasisLocked ? `⏳ LOCKING... (${stasisTimer}s)` : '⏳ LOCK STASIS (+$2T)'}
          </button>
        </div>

      </div>

      {/* ROW 12: SUPERNOVA, ORACLE CARDS, ALCHEMY, ALIEN RADIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* FEATURE 45: CELESTIAL SUPERNOVA DETONATOR */}
        <div className="bg-slate-950 border-2 border-rose-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">💥</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">45. SUPERNOVA</h3>
              <p className="text-[10px] text-slate-400">Plasma Charge: {supernovaCharge}%</p>
            </div>
          </div>
          <button
            onClick={handleDetonateSupernova}
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            {supernovaCharge >= 100 ? '💥 DETONATE (+$5T)' : `⚡ CHARGE PLASMA (${supernovaCharge}%)`}
          </button>
        </div>

        {/* FEATURE 46: GEMINI ORACLE FATE CARDS */}
        <div className="bg-slate-950 border-2 border-amber-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🎴</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">46. FATE CARDS</h3>
              <p className="text-[10px] text-amber-300 truncate">{drawnFateCard ? `${drawnFateCard.icon} ${drawnFateCard.title}` : 'Draw Card'}</p>
            </div>
          </div>
          <button
            onClick={handleDrawFateCard}
            className="w-full bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🎴 DRAW FATE CARD (+$1.5T)
          </button>
        </div>

        {/* FEATURE 47: COSMIC ALCHEMY SYNTHESIZER */}
        <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">🧪</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">47. ALCHEMY SYNTH</h3>
              <p className="text-[10px] text-emerald-300 truncate">{alchemyProduct}</p>
            </div>
          </div>
          <button
            onClick={handleSynthesizeAlchemy}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            🧪 CRAFT ARTIFACT (+$1T)
          </button>
        </div>

        {/* FEATURE 48: EXTRATERRESTRIAL RADIO RECEIVER */}
        <div className="bg-slate-950 border-2 border-cyan-500/40 rounded-3xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <span className="text-3xl">📡</span>
            <div>
              <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">48. ALIEN RADIO</h3>
              <p className="text-[10px] text-cyan-300 truncate">Freq: {radioFreq} MHz</p>
            </div>
          </div>
          <button
            onClick={handleScanRadioFreq}
            className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all"
          >
            📡 SCAN SIGNAL (+$888B)
          </button>
        </div>

      </div>

      {/* ========================================== */}
      {/* MODULES 16 TO 20: ORIGINAL AI COMMAND & CANVAS & CELESTIAL PLANETS */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* MODULE 16 & 17: GEMINI AI COMMAND TERMINAL & 5-REEL SLOT MACHINE */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">16. GEMINI AI COMMAND TERMINAL</h3>
                <p className="text-xs text-slate-400">Ask Gemini anything to warp the local quantum matrix!</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl max-h-48 overflow-y-auto space-y-2 font-mono text-xs">
            {aiLogs.map((log, idx) => (
              <div key={idx} className={`p-2 rounded-xl ${log.sender === 'gemini' ? 'bg-cyan-950/50 text-cyan-200' : 'bg-slate-800 text-white'}`}>
                <span className="font-bold text-[10px] text-slate-400 block">{log.sender === 'gemini' ? '✨ GEMINI AI' : '👤 YOU'} ({log.time})</span>
                {log.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={commandInput}
              onChange={e => setCommandInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExecuteAiCommand()}
              placeholder="Type command: e.g. 'Give me 1 Trillion'..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleExecuteAiCommand()}
              className="bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl"
            >
              EXECUTE ⚡
            </button>
          </div>
        </div>

        {/* MODULE 18, 19, 20: INTERACTIVE CANVAS & CELESTIAL PLANETS */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">🌌</span>
              <div>
                <h3 className="font-extrabold text-base text-white uppercase tracking-wider">17 - 20. COSMIC STARDUST CANVAS ($5B/CLICK)</h3>
                <p className="text-xs text-slate-400">Click particles for instant cash explosions!</p>
              </div>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
            <canvas
              ref={canvasRef}
              width={600}
              height={220}
              onClick={handleCanvasClick}
              className="w-full h-56 cursor-pointer block"
            />
            <div className="absolute top-2 left-2 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-xl text-[10px] font-mono text-cyan-300 font-bold">
              ✨ Click canvas to trigger +$5,000,000,000 stardust explosion!
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
