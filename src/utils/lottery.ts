/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ticket, AdminSettings, PrizeTier, RNGConfig, TaxSettings } from '../types';

export const DEFAULT_PRIZE_TIERS: PrizeTier[] = [
  { id: 'jackpot', name: 'Grand Jackpot', matchText: '5 White + PB', basePayout: 400000000, userPayout: 400000000, originalOddsText: '1 in 292.2 Million', originalOddsFraction: 1 / 292201338, customOddsFraction: 1 / 292201338, count: 0 },
  { id: 'match5', name: 'Match 5 White', matchText: '5 White', basePayout: 1000000, userPayout: 1000000, originalOddsText: '1 in 11.6 Million', originalOddsFraction: 1 / 11688053, customOddsFraction: 1 / 11688053, count: 0 },
  { id: 'match4_pb', name: 'Match 4 White + PB', matchText: '4 White + PB', basePayout: 50000, userPayout: 50000, originalOddsText: '1 in 913,129', originalOddsFraction: 1 / 913129, customOddsFraction: 1 / 913129, count: 0 },
  { id: 'match4', name: 'Match 4 White', matchText: '4 White', basePayout: 100, userPayout: 100, originalOddsText: '1 in 36,525', originalOddsFraction: 1 / 36525, customOddsFraction: 1 / 36525, count: 0 },
  { id: 'match3_pb', name: 'Match 3 White + PB', matchText: '3 White + PB', basePayout: 100, userPayout: 100, originalOddsText: '1 in 14,494', originalOddsFraction: 1 / 14494, customOddsFraction: 1 / 14494, count: 0 },
  { id: 'match3', name: 'Match 3 White', matchText: '3 White', basePayout: 7, userPayout: 7, originalOddsText: '1 in 580', originalOddsFraction: 1 / 579.76, customOddsFraction: 1 / 579.76, count: 0 },
  { id: 'match2_pb', name: 'Match 2 White + PB', matchText: '2 White + PB', basePayout: 7, userPayout: 7, originalOddsText: '1 in 701', originalOddsFraction: 1 / 701.33, customOddsFraction: 1 / 701.33, count: 0 },
  { id: 'match1_pb', name: 'Match 1 White + PB', matchText: '1 White + PB', basePayout: 4, userPayout: 4, originalOddsText: '1 in 92', originalOddsFraction: 1 / 91.98, customOddsFraction: 1 / 91.98, count: 0 },
  { id: 'match0_pb', name: 'Match 0 White + PB', matchText: 'PB Only', basePayout: 4, userPayout: 4, originalOddsText: '1 in 38', originalOddsFraction: 1 / 38.32, customOddsFraction: 1 / 38.32, count: 0 }
];

/**
 * Seedable linear congruential generator (LCG) / Mulberry32
 */
export function createSeedableRNG(seedValue: number): () => number {
  let h = seedValue;
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (((h ^= h >>> 16) >>> 0) / 4294967296);
  };
}

/**
 * Universal Seed generator from generic strings
 */
export function stringToSeed(str: string): number {
  let hash = 0;
  if (str.length === 0) return 9999;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate Next Random Float based on the selected generator
 */
export function getRNGFloat(rng: RNGConfig, seedStateRef: { current: number }): number {
  if (rng.useSeed) {
    // Progressive seed updating
    const generator = createSeedableRNG(seedStateRef.current);
    const val = generator();
    // mutate seed state to guarantee progressive drawing variations
    seedStateRef.current = Math.floor(val * 2147483647);
    return val;
  }

  if (rng.type === 'crypto' && typeof window !== 'undefined' && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / 4294967296;
  }

  if (rng.type === 'chaotic') {
    // High-entropy math formulas yielding extreme spikes
    const pseudoTime = Date.now();
    const trigVal = Math.abs(Math.sin(pseudoTime) * Math.cos(Math.random() * 999));
    return trigVal % 1.0;
  }

  // Standard fast math standard random
  return Math.random();
}

/**
 * Generate 5 uniquely drawn balls and 1 powerball using seedable generator
 */
export function generateBallsByRNG(
  rng: RNGConfig,
  seedStateRef: { current: number },
  whiteMax = 69,
  pbMax = 26
): { whiteBalls: number[]; powerball: number } {
  const whiteBalls: number[] = [];
  while (whiteBalls.length < 5) {
    // Draw ball with active generator bounds
    const floatVal = getRNGFloat(rng, seedStateRef);
    const num = Math.floor(floatVal * whiteMax) + 1;
    if (!whiteBalls.includes(num)) {
      whiteBalls.push(num);
    }
  }
  whiteBalls.sort((a, b) => a - b);
  
  const pbFloat = getRNGFloat(rng, seedStateRef);
  const powerball = Math.floor(pbFloat * pbMax) + 1;

  return { whiteBalls, powerball };
}

/**
 * Calculates tax deductions depending on federal, state, and payment options
 */
export function calculateTaxAdjustment(
  grossPayout: number,
  taxes: TaxSettings
): { taxPaid: number; netPayout: number } {
  if (!taxes.applyTaxes) {
    return { taxPaid: 0, netPayout: grossPayout };
  }

  // Large winnings (jackpot) typically take an immediate lump-sum cash option reduction
  const isLargeJackpot = grossPayout >= 10000000;
  const initialBase = isLargeJackpot 
    ? grossPayout * (1 - taxes.cashOptionReduction) 
    : grossPayout;

  const fedCut = initialBase * taxes.federalRate;
  const stateCut = initialBase * taxes.stateRate;
  const totalTax = fedCut + stateCut;
  const netAmount = initialBase - totalTax;

  return {
    taxPaid: Math.round(totalTax + (isLargeJackpot ? grossPayout * taxes.cashOptionReduction : 0)),
    netPayout: Math.round(netAmount)
  };
}

/**
 * Build dynamic Expected Value (EV) of a Powerball ticket
 */
export function calculateExpectedValue(
  customPayouts: Record<string, number>,
  customOdds: Record<string, number>,
  settings: AdminSettings
): {
  evWithoutTaxes: number;
  evWithTaxes: number;
  netROI: number;
  unpopularDateBonus: number;
} {
  let evBase = 0;
  let evTaxed = 0;

  DEFAULT_PRIZE_TIERS.forEach(tier => {
    // Resolve configurable payout
    const payoutRaw = customPayouts[tier.id] !== undefined 
      ? customPayouts[tier.id] 
      : (tier.id === 'jackpot' ? settings.jackpotValue : tier.basePayout);

    // Resolve customized odds fraction
    const oddsFrac = customOdds[tier.id] !== undefined
      ? customOdds[tier.id]
      : tier.originalOddsFraction;

    evBase += payoutRaw * oddsFrac;

    // Apply tax reduction logic on theoretical payouts
    const taxRes = calculateTaxAdjustment(payoutRaw, settings.taxes);
    evTaxed += taxRes.netPayout * oddsFrac;
  });

  const cost = settings.ticketPrice;
  const netROI = cost > 0 ? ((evTaxed - cost) / cost) * 100 : 0;

  return {
    evWithoutTaxes: parseFloat(evBase.toFixed(4)),
    evWithTaxes: parseFloat(evTaxed.toFixed(4)),
    netROI: parseFloat(netROI.toFixed(2)),
    unpopularDateBonus: 0.15 // fixed bias representation
  };
}

/**
 * Create a customizable ticket
 */
export function createTicket(
  winningWhite: number[] | null,
  winningPB: number | null,
  settings: AdminSettings,
  rng: RNGConfig,
  seedStateRef: { current: number }
): Ticket {
  const id = Math.random().toString(36).substring(2, 9);
  const powerPlay = settings.powerPlayEnabled && Math.random() < 0.55; // default simulated power play choice

  // Handle specific Rigged presets
  if (settings.riggedMode === 'guaranteeJackpot' && winningWhite && winningPB !== null) {
    return { id, whiteBalls: [...winningWhite].sort((a, b) => a - b), powerball: winningPB, isPowerPlay: powerPlay };
  }

  const hasLuckMode = 
    settings.clairvoyanceIndex > 0 || 
    settings.luckMultiplierPowerball > 1 || 
    settings.luckMultiplierWhite > 1 || 
    settings.riggedMode !== 'none';

  if (!hasLuckMode || !winningWhite || winningPB === null) {
    const r = generateBallsByRNG(rng, seedStateRef, 69, 26);
    return { id, whiteBalls: r.whiteBalls, powerball: r.powerball, isPowerPlay: powerPlay };
  }

  // Handle cursed luck (deliberately matching absolutely nothing)
  if (settings.riggedMode === 'cursed') {
    const pool = Array.from({ length: 69 }, (_, i) => i + 1).filter(n => !winningWhite.includes(n));
    const whiteBalls: number[] = [];
    while (whiteBalls.length < 5) {
      const idx = Math.floor(getRNGFloat(rng, seedStateRef) * pool.length);
      const val = pool[idx];
      if (!whiteBalls.includes(val)) {
        whiteBalls.push(val);
      }
    }
    whiteBalls.sort((a, b) => a - b);
    
    let powerball = Math.floor(getRNGFloat(rng, seedStateRef) * 26) + 1;
    while (powerball === winningPB) {
      powerball = Math.floor(getRNGFloat(rng, seedStateRef) * 26) + 1;
    }
    return { id, whiteBalls, powerball, isPowerPlay: powerPlay };
  }

  // Advanced luck and gravity multipliers
  let powerball = Math.floor(getRNGFloat(rng, seedStateRef) * 26) + 1;
  const pbRoll = getRNGFloat(rng, seedStateRef);
  if (pbRoll < settings.clairvoyanceIndex) {
    powerball = winningPB;
  } else if (settings.luckMultiplierPowerball > 1 && getRNGFloat(rng, seedStateRef) < (1 - 1 / settings.luckMultiplierPowerball)) {
    powerball = winningPB;
  }

  const whiteBalls: number[] = [];
  while (whiteBalls.length < 5) {
    const isClairvoyant = getRNGFloat(rng, seedStateRef) < settings.clairvoyanceIndex;
    const isLuckBoosted = settings.luckMultiplierWhite > 1 && getRNGFloat(rng, seedStateRef) < (1 - 1 / settings.luckMultiplierWhite);

    if (isClairvoyant || isLuckBoosted) {
      const chosenMatch = winningWhite[Math.floor(getRNGFloat(rng, seedStateRef) * winningWhite.length)];
      if (!whiteBalls.includes(chosenMatch)) {
        whiteBalls.push(chosenMatch);
        continue;
      }
    }

    const standardVal = Math.floor(getRNGFloat(rng, seedStateRef) * 69) + 1;
    if (!whiteBalls.includes(standardVal)) {
      whiteBalls.push(standardVal);
    }
  }

  whiteBalls.sort((a, b) => a - b);
  return { id, whiteBalls, powerball, isPowerPlay: powerPlay };
}

/**
 * High speed match ticket system with customized odds ratios
 */
export function matchTicket(
  ticket: Ticket,
  winningWhite: number[],
  winningPowerball: number,
  customPayouts: Record<string, number>,
  currentJackpot: number,
  taxes: TaxSettings,
  powerPlayActive = false
): {
  matchesWhite: number;
  matchesPowerball: boolean;
  tierId: string;
  tierName: string;
  payout: number;
  taxPaid: number;
  netPayout: number;
} {
  // Matching algorithm
  let matchesWhite = 0;
  for (let i = 0; i < ticket.whiteBalls.length; i++) {
    if (winningWhite.includes(ticket.whiteBalls[i])) {
      matchesWhite++;
    }
  }

  const matchesPowerball = ticket.powerball === winningPowerball;

  let tierId = 'none';
  let tierName = 'No Prize';
  let payout = 0;

  if (matchesWhite === 5 && matchesPowerball) {
    tierId = 'jackpot';
    tierName = 'Grand Jackpot';
    payout = customPayouts.jackpot ?? currentJackpot;
  } else if (matchesWhite === 5) {
    tierId = 'match5';
    tierName = 'Match 5 White';
    // Power play for match 5 maxes out at $2M
    payout = customPayouts.match5 ?? 1000000;
    if (powerPlayActive && ticket.isPowerPlay) {
      payout = 2000000;
    }
  } else if (matchesWhite === 4 && matchesPowerball) {
    tierId = 'match4_pb';
    tierName = 'Match 4 White + PB';
    payout = customPayouts.match4_pb ?? 50000;
  } else if (matchesWhite === 4) {
    tierId = 'match4';
    tierName = 'Match 4 White';
    payout = customPayouts.match4 ?? 100;
  } else if (matchesWhite === 3 && matchesPowerball) {
    tierId = 'match3_pb';
    tierName = 'Match 3 + PB';
    payout = customPayouts.match3_pb ?? 100;
  } else if (matchesWhite === 3) {
    tierId = 'match3';
    tierName = 'Match 3 White';
    payout = customPayouts.match3 ?? 7;
  } else if (matchesWhite === 2 && matchesPowerball) {
    tierId = 'match2_pb';
    tierName = 'Match 2 + PB';
    payout = customPayouts.match2_pb ?? 7;
  } else if (matchesWhite === 1 && matchesPowerball) {
    tierId = 'match1_pb';
    tierName = 'Match 1 + PB';
    payout = customPayouts.match1_pb ?? 4;
  } else if (matchesWhite === 0 && matchesPowerball) {
    tierId = 'match0_pb';
    tierName = 'PB Only';
    payout = customPayouts.match0_pb ?? 4;
  }

  // Multiplier support
  if (tierId !== 'none' && tierId !== 'jackpot' && tierId !== 'match5' && powerPlayActive && ticket.isPowerPlay) {
    const multipliers = [2, 3, 4, 5, 10];
    const selectMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    payout = payout * selectMultiplier;
  }

  const taxCalculation = calculateTaxAdjustment(payout, taxes);

  return {
    matchesWhite,
    matchesPowerball,
    tierId,
    tierName,
    payout,
    taxPaid: taxCalculation.taxPaid,
    netPayout: taxCalculation.netPayout
  };
}

/**
 * Fast parallel Monte Carlo simulation executor
 * Simulates sweeping numbers to determine speed probability curves quickly on standard single thread
 */
export function runMonteCarloSim(
  runsCount: number,
  ticketPrice: number,
  jackpotValue: number,
  customPayouts: Record<string, number>,
  customOdds: Record<string, number>,
  taxes: TaxSettings
): {
  totalSpent: number;
  totalWon: number;
  netLoss: number;
  highestPayoutHit: number;
  jackpotsWon: number;
  tierCounts: Record<string, number>;
  roi: number;
} {
  let spent = 0;
  let won = 0;
  let highestPayoutVal = 0;
  let jackpotCountsVal = 0;
  const tierCountsMap: Record<string, number> = {};

  // Build aggregated array for weights
  const cumulativeOdds: { tierId: string; limit: number; payout: number }[] = [];
  let runningOddsSum = 0;

  DEFAULT_PRIZE_TIERS.forEach(tier => {
    const specificOdds = customOdds[tier.id] ?? tier.originalOddsFraction;
    runningOddsSum += specificOdds;
    
    const configuredPayout = customPayouts[tier.id] !== undefined
      ? customPayouts[tier.id]
      : (tier.id === 'jackpot' ? jackpotValue : tier.basePayout);

    cumulativeOdds.push({
      tierId: tier.id,
      limit: runningOddsSum,
      payout: configuredPayout
    });
  });

  // Execute fast math rolls
  for (let i = 0; i < runsCount; i++) {
    spent += ticketPrice;
    const roll = Math.random();

    // Check if user hit any prize tiers using the aggregated mathematical odds distribution
    let hitPayout = 0;
    let hitTier = 'none';

    for (let c = 0; c < cumulativeOdds.length; c++) {
      if (roll < cumulativeOdds[c].limit) {
        hitTier = cumulativeOdds[c].tierId;
        hitPayout = cumulativeOdds[c].payout;
        break;
      }
    }

    if (hitTier !== 'none') {
      const taxesAdjustment = calculateTaxAdjustment(hitPayout, taxes);
      won += taxesAdjustment.netPayout;
      tierCountsMap[hitTier] = (tierCountsMap[hitTier] || 0) + 1;

      if (hitPayout > highestPayoutVal) {
        highestPayoutVal = hitPayout;
      }
      if (hitTier === 'jackpot') {
        jackpotCountsVal++;
      }
    }
  }

  const netResult = won - spent;

  return {
    totalSpent: spent,
    totalWon: won,
    netLoss: netResult,
    highestPayoutHit: highestPayoutVal,
    jackpotsWon: jackpotCountsVal,
    tierCounts: tierCountsMap,
    roi: spent > 0 ? parseFloat(((won - spent) / spent * 100).toFixed(2)) : 0
  };
}

/**
 * Select Bot ticket numbers based on specialized strategy
 */
export function getBotTicket(
  strategy: 'random' | 'lucky' | 'martingale' | 'hotcold' | 'avoidOthers',
  hotNumbers: number[],
  coldNumbers: number[]
): { whiteBalls: number[]; powerball: number } {
  const whiteBalls: number[] = [];

  if (strategy === 'lucky') {
    // User static lucky numbers representing birthdates etc.
    return { whiteBalls: [4, 8, 15, 16, 23], powerball: 42 };
  }

  if (strategy === 'avoidOthers') {
    // Numbers above 31 (days in month) to avoid sharing jackpot splits with normal real world humans
    while (whiteBalls.length < 5) {
      const ballValue = Math.floor(Math.random() * (69 - 32 + 1)) + 32;
      if (!whiteBalls.includes(ballValue)) {
        whiteBalls.push(ballValue);
      }
    }
    whiteBalls.sort((a, b) => a - b);
    const powerballVal = Math.floor(Math.random() * (26 - 13 + 1)) + 13;
    return { whiteBalls, powerball: powerballVal };
  }

  if (strategy === 'hotcold') {
    // Top hot numbers for white, cold power play for pb
    const sourceWhites = hotNumbers.length >= 5 ? hotNumbers : Array.from({ length: 69 }, (_, i) => i + 1);
    while (whiteBalls.length < 5) {
      const idx = Math.floor(Math.random() * sourceWhites.length);
      const chosenNum = sourceWhites[idx];
      if (!whiteBalls.includes(chosenNum)) {
        whiteBalls.push(chosenNum);
      }
    }
    whiteBalls.sort((a, b) => a - b);
    const pb = coldNumbers.length > 0 ? coldNumbers[0] : 12;
    return { whiteBalls, powerball: pb };
  }

  // Standard random generator drawing
  while (whiteBalls.length < 5) {
    const val = Math.floor(Math.random() * 69) + 1;
    if (!whiteBalls.includes(val)) {
      whiteBalls.push(val);
    }
  }
  whiteBalls.sort((a, b) => a - b);
  const pb = Math.floor(Math.random() * 26) + 1;
  return { whiteBalls, powerball: pb };
}
