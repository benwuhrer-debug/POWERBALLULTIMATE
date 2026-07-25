/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ticket {
  id: string;
  whiteBalls: number[]; // 5 sorted numbers
  powerball: number;     // 1 number
  isPowerPlay: boolean;
}

export interface DrawHistoryEntry {
  id: string;
  drawId: number;
  winningWhite: number[];
  winningPowerball: number;
  playerWhite: number[];
  playerPowerball: number;
  matchesWhite: number;
  matchesPowerball: boolean;
  tierId: string;
  tierName: string;
  payout: number;
  taxPaid: number;
  netPayout: number;
  multiplier: number; // Power play multiplier
  timestamp: string;
}

export interface PrizeTier {
  id: string;
  name: string;
  matchText: string;
  basePayout: number;
  userPayout: number; // custom payout set by admin
  originalOddsText: string;
  originalOddsFraction: number; // e.g. 1 / 292201338
  customOddsFraction: number;   // configurable odds
  count: number;
}

export type RiggedMode = 'none' | 'forceWin' | 'cursed' | 'guaranteeJackpot';

export interface RNGConfig {
  seed: string;
  type: 'crypto' | 'lcg' | 'chaotic';
  useSeed: boolean;
  currentSeedVal: number;
}

export interface TaxSettings {
  applyTaxes: boolean;
  federalRate: number; // 0 to 1 (e.g. 0.24 = 24%)
  stateRate: number;   // 0 to 1 (e.g. 0.08 = 8%)
  cashOptionReduction: number; // e.g. 0.38 (lump sum fee)
}

export interface BotConfig {
  active: boolean;
  strategy: 'random' | 'lucky' | 'martingale' | 'hotcold' | 'avoidOthers';
  martingaleTargetTier: string;
  ticketsPerRun: number;
  stopThresholdSpent: number;
  stopThresholdWon: number;
}

export interface ParallelPlayer {
  id: string;
  name: string;
  balance: number;
  ticketsBought: number;
  totalSpent: number;
  totalWon: number;
  status: 'active' | 'bankrupt' | 'retired';
  lastBigWin: string;
}

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  stats: SimulatorStats;
  settings: AdminSettings;
  customPayouts: Record<string, number>;
  customOdds: Record<string, number>;
  chartHistory: number[];
}

export interface DebugConsoleMsg {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'dev' | 'chaotic';
}

export interface AdminSettings {
  ticketPrice: number;
  jackpotValue: number;
  jackpotEnabled: boolean;
  jackpotGrowthRate: number; // dollar per unsold sweep, e.g. 0.50
  powerPlayPricing: number; // cost extra
  powerPlayEnabled: boolean;

  // Speed settings
  simSpeed: number; // loops per iteration tick (1 to 10000)
  ticketsPerSecond: number; // throttle (not actively blocking, simulated inside ticks)

  // Luck modifiers
  luckMultiplierPowerball: number; // 1 to 100
  luckMultiplierWhite: number;     // 1 to 100
  clairvoyanceIndex: number;       // 0 to 1
  quantumMultiverse: boolean;      // draw parallel universes, take best
  riggedMode: RiggedMode;
  forcedDrawNumbers: {
    whiteBalls: number[];
    powerball: number;
    active: boolean;
  };
  forceWinTierSelection: string; // tier ID to force

  // RNG Configuration
  rng: RNGConfig;

  // Taxes
  taxes: TaxSettings;

  // Money Cheats
  infiniteMoney: boolean;
  cheatBalance: number;

  // Sound, Animations, Theme configs
  soundEnabled: boolean;
  themeName: 'midnight' | 'cyberpunk' | 'matrix' | 'hot_pink' | 'nuclear_green';
  animationSpeed: 'normal' | 'fast' | 'instant';
  confettiEnabled: boolean;
  darkHumourActive: boolean;

  // New Advanced Audio-Visual & Labor Performance Specifiers
  globalVolume?: number;
  globalPitch?: number;
  globalSynthType?: 'sine' | 'square' | 'sawtooth' | 'triangle';
  screenBrightness?: number;
  crtScanlines?: boolean;
  neonGlowLevel?: number;
  chaosForceShake?: number;
  stickmanDensityMultiplier?: number; // Caps max stickmen per labor tab (0.1x to 5.0x)

  // Stats
  multiSessionCount: number;
}

export interface SimulatorStats {
  ticketsBought: number;
  totalSpent: number;
  totalWon: number;
  netGainLoss: number;
  drawsCount: number;
  lastDrawResult: {
    winningWhite: number[];
    winningPowerball: number;
    playerWhite: number[];
    playerPowerball: number;
    matchesWhite: number;
    matchesPowerball: boolean;
    tierId: string;
    payout: number;
    taxPaid: number;
    netPayout: number;
    powerPlayActive: boolean;
  } | null;
  tierCounts: Record<string, number>;
}
