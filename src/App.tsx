/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { Ticket, AdminSettings, SimulatorStats, ParallelPlayer, SaveSlot, DebugConsoleMsg, PrizeTier } from './types';
import {
  DEFAULT_PRIZE_TIERS,
  stringToSeed,
  getRNGFloat,
  generateBallsByRNG,
  calculateTaxAdjustment,
  calculateExpectedValue,
  createTicket,
  matchTicket,
  runMonteCarloSim,
  getBotTicket
} from './utils/lottery';
import { playBallPop, playCoinSound, playJackpotSound, playTickSound } from './utils/audio';

import { VisualDraw } from './components/VisualDraw';
import { ManualNumbersModal } from './components/ManualNumbersModal';
import { VisualChart } from './components/VisualChart';
import { ConsoleTerminal } from './components/ConsoleTerminal';
import { Leaderboard } from './components/Leaderboard';
import { ExpectedValueDocs } from './components/ExpectedValueDocs';
import { NewsTicker } from './components/NewsTicker';
import { CurrencyExchange } from './components/CurrencyExchange';
import { DVDBouncingCash } from './components/DVDBouncingCash';
import { AudioVisualRig } from './components/AudioVisualRig';
import { QuantumSandboxels } from './components/QuantumSandboxels';
import { ThrowACoinGame } from './components/ThrowACoinGame';
import { BiddingGame } from './components/BiddingGame';
import { UserProfileSettings, UserProfile } from './components/UserProfileSettings';
import { MultiplayerServerManager } from './components/MultiplayerServerManager';
import { RebirthManager } from './components/RebirthManager';
import { LiveEventsManager } from './components/LiveEventsManager';
import { SovereignPraiseManager } from './components/SovereignPraiseManager';
import { GeminiMultiverseTab } from './components/GeminiMultiverseTab';
import { AsteroidsGameTab } from './components/AsteroidsGameTab';
import { StockExchangeTab } from './components/StockExchangeTab';
import { CustomTabManager, CustomUserTab } from './components/CustomTabManager';
import { BeginnerHubTab } from './components/BeginnerHubTab';
import { AccountControlTab } from './components/AccountControlTab';
import { HackerTerminalTab } from './components/HackerTerminalTab';
import { CasinoRoyaleTab } from './components/CasinoRoyaleTab';
import { BotCasinoTab } from './components/BotCasinoTab';
import { GalaxyShooterArcadeTab } from './components/GalaxyShooterArcadeTab';
import { ForcedLaborColosseumTab } from './components/ForcedLaborColosseumTab';
import { ForcedLaborMinesTab } from './components/ForcedLaborMinesTab';
import { ForcedPraiseShrineTab } from './components/ForcedPraiseShrineTab';
import { LaborProductivityHeatmap } from './components/LaborProductivityHeatmap';
import { InteractiveScrollQuarryTab } from './components/InteractiveScrollQuarryTab';
import {
  ForcedLaborQuarryTab,
  ForcedLaborCyberAssemblyTab,
  ForcedLaborFarmTab,
  ForcedLaborSweatshopTab,
  ForcedLaborFoundryTab,
  ForcedLaborPrisonTab,
  ForcedLaborOrbitalTab,
  ForcedLaborVaultTab,
  ForcedLaborSalvageTab,
  ForcedLaborAcademyTab,
} from './components/TenForcedLaborTabs';

export default function App() {
  // Collapsible left navigation sidebar
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('engine');
  const [navSearchFilter, setNavSearchFilter] = useState('');

  // User-created custom tabs list
  const [customTabsList, setCustomTabsList] = useState<CustomUserTab[]>(() => {
    try {
      const saved = localStorage.getItem('powerball_custom_user_tabs');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const handleAddNewTabToNav = (newTab: CustomUserTab) => {
    const updated = [newTab, ...customTabsList];
    setCustomTabsList(updated);
    try {
      localStorage.setItem('powerball_custom_user_tabs', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleDeleteCustomTab = (tabId: string) => {
    const updated = customTabsList.filter(t => t.id !== tabId);
    setCustomTabsList(updated);
    try {
      localStorage.setItem('powerball_custom_user_tabs', JSON.stringify(updated));
    } catch (e) {}
    if (activeTab === tabId) setActiveTab('custom_tab_manager');
  };

  // User Profile Settings State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('powerball_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: 'Ben',
      avatar: '👑',
      avatarType: 'emoji',
      title: '👑 Sovereign Overlord',
      titleColor: 'amber',
      cardTheme: 'obsidian',
      bio: 'Master of high-stakes bidding, coin toss physics, and quantum sandboxes.',
      vipLevel: 10,
      vipXp: 1250,
      luckyWhiteBalls: [7, 14, 21, 35, 49],
      luckyPowerball: 7,
      badges: ['First Big Win', 'Auction Master', 'Quantum Physicist'],
      autoSyncTicket: true,
      autoSyncBiddingName: true,
    };
  });

  // Persist userProfile changes to localStorage
  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('powerball_user_profile', JSON.stringify(updated));
    } catch (e) {
      // Storage error ignored
    }
  };

  // Custom Odds fraction override map
  const [customOdds, setCustomOdds] = useState<Record<string, number>>({});
  // Custom Payouts override map
  const [customPayouts, setCustomPayouts] = useState<Record<string, number>>({});

  // Active Admin parameters
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    ticketPrice: 2,
    jackpotValue: 40000000,
    jackpotEnabled: true,
    jackpotGrowthRate: 0.50, // $0.50 added per unsold ticket
    powerPlayPricing: 1,
    powerPlayEnabled: false,
    simSpeed: 10,
    ticketsPerSecond: 10,
    luckMultiplierPowerball: 1,
    luckMultiplierWhite: 1,
    clairvoyanceIndex: 0,
    quantumMultiverse: false,
    riggedMode: 'none',
    forcedDrawNumbers: {
      whiteBalls: [10, 20, 30, 40, 50],
      powerball: 6,
      active: false
    },
    forceWinTierSelection: 'match3_pb',
    rng: {
      seed: 'antigravity-999',
      type: 'lcg',
      useSeed: true,
      currentSeedVal: 9999
    },
    taxes: {
      applyTaxes: true,
      federalRate: 0.24,
      stateRate: 0.08,
      cashOptionReduction: 0.38
    },
    infiniteMoney: false,
    cheatBalance: 500, // starting funds
    soundEnabled: true,
    themeName: 'midnight',
    animationSpeed: 'fast',
    confettiEnabled: true,
    darkHumourActive: true,
    multiSessionCount: 5,
    stickmanDensityMultiplier: 1.0
  });

  // Hot & Cold Number Frequency maps (for white balls 1 to 69, red ball 1 to 26)
  const [whiteFreqMap, setWhiteFreqMap] = useState<Record<number, number>>({});
  const [pbFreqMap, setPbFreqMap] = useState<Record<number, number>>({});

  // Active User Pick Card Number Settings
  const [activeTicket, setActiveTicket] = useState<Ticket>({
    id: 'user-standard',
    whiteBalls: [8, 14, 23, 41, 55],
    powerball: 12,
    isPowerPlay: false
  });

  // Current Drawn machine status values
  const [winningWhite, setWinningWhite] = useState<number[]>([0, 0, 0, 0, 0]);
  const [winningPowerball, setWinningPowerball] = useState<number>(0);

  // Statistics trackers
  const [stats, setStats] = useState<SimulatorStats>({
    ticketsBought: 0,
    totalSpent: 0,
    totalWon: 0,
    netGainLoss: 0,
    drawsCount: 0,
    lastDrawResult: null,
    tierCounts: {
      jackpot: 0,
      match5: 0,
      match4_pb: 0,
      match4: 0,
      match3_pb: 0,
      match3: 0,
      match2_pb: 0,
      match1_pb: 0,
      match0_pb: 0,
    }
  });

  // Chart tracking
  const [chartHistory, setChartHistory] = useState<number[]>([500]);

  // Autoplay loop state flag
  const [isAutoplayOn, setIsAutoplayOn] = useState(false);
  const [isManualSlipOpen, setIsManualSlipOpen] = useState(false);
  const [playModeOption, setPlayModeOption] = useState<'same' | 'random'>('random');

  // History array of last draws (up to 10,000 searchable lists with pagination or slicing)
  const [drawHistory, setDrawHistory] = useState<any[]>([]);
  const [searchFilterText, setSearchFilterText] = useState('');
  const [historicMinWin, setHistoricMinWin] = useState(0);

  // Parallel Player list for multi-session Bot simulations
  const [parallelPlayers, setParallelPlayers] = useState<ParallelPlayer[]>([]);

  // Debug Console lines list
  const [logs, setLogs] = useState<DebugConsoleMsg[]>([]);

  // Save Slots loaded from localStorage
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [customSlotNameInput, setCustomSlotNameInput] = useState('');

  // Monte Carlo simulation state results
  const [monteCarloRuns, setMonteCarloRuns] = useState(10000);
  const [isMonteCarloRunning, setIsMonteCarloRunning] = useState(false);
  const [monteCarloResult, setMonteCarloResult] = useState<any | null>(null);

  // Manual Money Adjustment states
  const [manualMoneyAdjustText, setManualMoneyAdjustText] = useState('1000');

  // Dynamic seed generator state reference
  const seedStateRef = useRef<number>(9999);
  const loopRef = useRef<number | null>(null);

  // Setup initial state and key bindings
  useEffect(() => {
    // Generate initial parallel players
    generateParallelPlayers(adminSettings.multiSessionCount);
    // Sync seed ref
    seedStateRef.current = stringToSeed(adminSettings.rng.seed);

    // Initial log
    addLogLine('System initialised. Standard Powerball laws compiled.', 'info');

    // Load Save Slots
    try {
      const persistedStr = localStorage.getItem('powerball_sim_saves');
      if (persistedStr) {
        setSaveSlots(JSON.parse(persistedStr));
      }
    } catch {
      // Ignored
    }

    // Connect keyboard shortcuts
    const handleShortcuts = (e: KeyboardEvent) => {
      // If we focus inside inputs, do not fire shortcuts
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsAutoplayOn(prev => !prev);
      } else if (e.code === 'KeyD' || e.code === 'KeyS') {
        playSweepStep(1);
      } else if (e.code === 'KeyR') {
        resetSimulator();
      } else if (e.code === 'KeyM') {
        handleInjectMoney(10000);
        addLogLine('Keyboard shortcut: Injected $10,000 cash.', 'dev');
      } else if (e.code === 'KeyI') {
        setAdminSettings(prev => {
          const nextVal = !prev.infiniteMoney;
          addLogLine(`Keyboard shortcut: Infinite Money toggled to ${nextVal ? 'ON' : 'OFF'}.`, 'dev');
          return { ...prev, infiniteMoney: nextVal };
        });
      } else if (e.code === 'KeyG') {
        setAdminSettings(prev => {
          addLogLine('Keyboard shortcut: God Mode win target queued!', 'warn');
          return { ...prev, riggedMode: 'guaranteeJackpot' };
        });
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => {
      window.removeEventListener('keydown', handleShortcuts);
    };
  }, []);

  // Quick helper to write log entries
  const addLogLine = (text: string, type: DebugConsoleMsg['type'] = 'info') => {
    const timestampStr = new Date().toLocaleTimeString();
    const newLogItem: DebugConsoleMsg = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: timestampStr,
      text,
      type
    };
    setLogs(prev => {
      const updated = [...prev, newLogItem];
      if (updated.length > 200) updated.shift();
      return updated;
    });
  };

  // Generate multi-session concurrent players lists
  const generateParallelPlayers = (count: number) => {
    const names = [
      'John Hustler', 'Degen Larry', 'Aunt Susan', 'WallS_Bet77', 'GamblingGrandma',
      'FOMO_Freddy', 'DiamondHands', 'Crypto_Chad', 'SunkCostSally', 'RichieRich',
      'Penniless Pete', 'RiskTaker99', 'RetirementChaser', 'Unlucky_Luke', 'RaffleQueen'
    ];
    const pool: ParallelPlayer[] = [];
    for (let i = 0; i < count; i++) {
      const nameSel = names[i % names.length] + ' ' + (Math.floor(i / names.length) || '');
      pool.push({
        id: `parallel-bot-${i}`,
        name: nameSel.trim(),
        balance: 500, // starting
        ticketsBought: 0,
        totalSpent: 0,
        totalWon: 0,
        status: 'active',
        lastBigWin: 'N/A'
      });
    }
    setParallelPlayers(pool);
  };

  // Synchronise sessions bounds slider
  const handleUpdateSessionCount = (newCount: number) => {
    setAdminSettings(prev => ({ ...prev, multiSessionCount: newCount }));
    generateParallelPlayers(newCount);
    addLogLine(`Reconfigured parallel universes count to: ${newCount}`, 'dev');
  };

  // Add/Subtract balance utilities
  const handleBalanceModifier = (type: 'add' | 'subtract') => {
    const cashValue = parseFloat(manualMoneyAdjustText);
    if (isNaN(cashValue) || cashValue <= 0) return;

    setAdminSettings(prev => {
      const offset = type === 'add' ? cashValue : -cashValue;
      const finalAmt = prev.cheatBalance + offset;
      addLogLine(`Balance Manual Adjustment: ${type === 'add' ? '+' : '-'}$${cashValue.toLocaleString()} | New sum: $${finalAmt.toLocaleString()}`, 'dev');
      
      // Update chart line points
      setChartHistory(hist => {
        const next = [...hist, finalAmt];
        if (next.length > 50) next.shift();
        return next;
      });

      return {
        ...prev,
        cheatBalance: finalAmt
      };
    });
  };

  // Standard injection callback
  const handleInjectMoney = (amount: number) => {
    setAdminSettings(prev => {
      const val = prev.cheatBalance + amount;
      setChartHistory(h => {
        const n = [...h, val];
        if (n.length > 50) n.shift();
        return n;
      });
      return { ...prev, cheatBalance: val };
    });
  };

  // Clear simulator stats
  const resetSimulator = () => {
    setIsAutoplayOn(false);
    setWinningWhite([0, 0, 0, 0, 0]);
    setWinningPowerball(0);
    setStats({
      ticketsBought: 0,
      totalSpent: 0,
      totalWon: 0,
      netGainLoss: 0,
      drawsCount: 0,
      lastDrawResult: null,
      tierCounts: {
        jackpot: 0, match5: 0, match4_pb: 0, match4: 0,
        match3_pb: 0, match3: 0, match2_pb: 0, match1_pb: 0, match0_pb: 0
      }
    });
    setChartHistory([adminSettings.cheatBalance]);
    setWhiteFreqMap({});
    setPbFreqMap({});
    setDrawHistory([]);
    addLogLine('Simulation metrics flushed down the memory hole.', 'warn');
  };

  // Handle single dynamic sweep step iteration
  const playSweepStep = (iterationsCount: number) => {
    const isPlayerOutOfMoney = adminSettings.cheatBalance < adminSettings.ticketPrice * iterationsCount && !adminSettings.infiniteMoney;

    if (isPlayerOutOfMoney) {
      setIsAutoplayOn(false);
      addLogLine('Transaction Refused: Insufficient simulated wallet resources.', 'error');
      // trigger alert warning buzzer
      playTickSound(adminSettings.soundEnabled);
      return;
    }

    setStats(prevStats => {
      let finalTicketsBought = prevStats.ticketsBought;
      let finalTotalSpent = prevStats.totalSpent;
      let finalTotalWon = prevStats.totalWon;
      let finalDrawsCount = prevStats.drawsCount;
      const updatedTiers = { ...prevStats.tierCounts };
      let lastResultData = prevStats.lastDrawResult;

      let drawWhite: number[] = [];
      let drawPB = 0;
      let workingTicket: Ticket = activeTicket;

      const costOffset = iterationsCount * adminSettings.ticketPrice;

      // Local frequency updates
      const updatedWhiteFreqs = { ...whiteFreqMap };
      const updatedPbFreqs = { ...pbFreqMap };
      const incomingDrawEntries: any[] = [];

      // Loop iterations
      for (let s = 0; s < iterationsCount; s++) {
        // Draw winning balls
        let drawnGroup = generateBallsByRNG(adminSettings.rng, seedStateRef, 69, 26);
        
        // Rigid forced numbers override
        if (adminSettings.forcedDrawNumbers.active) {
          drawnGroup = {
            whiteBalls: adminSettings.forcedDrawNumbers.whiteBalls,
            powerball: adminSettings.forcedDrawNumbers.powerball
          };
        }

        drawWhite = drawnGroup.whiteBalls;
        drawPB = drawnGroup.powerball;

        // Force a specific win tier if setting is active
        if (adminSettings.riggedMode === 'forceWin') {
          // Resolve target balls configuration representing selected forced tier
          const forceTierId = adminSettings.forceWinTierSelection;
          if (forceTierId === 'jackpot') {
            workingTicket = { id: 'forced-win-ticket', whiteBalls: [...drawWhite], powerball: drawPB, isPowerPlay: false };
          } else {
            // Pick subset of white balls
            let forcedWhiteToMatch = 0;
            let forcePB = false;
            if (forceTierId === 'match5') forcedWhiteToMatch = 5;
            else if (forceTierId === 'match4_pb') { forcedWhiteToMatch = 4; forcePB = true; }
            else if (forceTierId === 'match4') forcedWhiteToMatch = 4;
            else if (forceTierId === 'match3_pb') { forcedWhiteToMatch = 3; forcePB = true; }
            else if (forceTierId === 'match3') forcedWhiteToMatch = 3;
            else if (forceTierId === 'match2_pb') { forcedWhiteToMatch = 2; forcePB = true; }
            else if (forceTierId === 'match1_pb') { forcedWhiteToMatch = 1; forcePB = true; }
            else if (forceTierId === 'match0_pb') { forcedWhiteToMatch = 0; forcePB = true; }

            const whites: number[] = [];
            // Match subset from drawn whites
            for (let i = 0; i < forcedWhiteToMatch; i++) {
              whites.push(drawWhite[i]);
            }
            // Populate remainder with random balls that don't match draw
            while (whites.length < 5) {
              const dumpVal = Math.floor(Math.random() * 69) + 1;
              if (!drawWhite.includes(dumpVal) && !whites.includes(dumpVal)) {
                whites.push(dumpVal);
              }
            }
            whites.sort((a, b) => a - b);
            const pbVal = forcePB ? drawPB : (drawPB === 26 ? 1 : drawPB + 1);
            workingTicket = { id: 'forced-match-tier', whiteBalls: whites, powerball: pbVal, isPowerPlay: false };
          }
        } else if (playModeOption === 'random') {
          workingTicket = createTicket(drawWhite, drawPB, adminSettings, adminSettings.rng, seedStateRef);
        } else {
          workingTicket = activeTicket;
        }

        // Apply Quantum Multiverse evaluation
        if (adminSettings.quantumMultiverse) {
          // evaluate multiple timelines quickly, pick best
          let bestPayout = -1;
          let bestDrawnWhite = drawWhite;
          let bestDrawnPB = drawPB;

          for (let u = 0; u < 10; u++) {
            const alternateDraw = generateBallsByRNG(adminSettings.rng, seedStateRef, 69, 26);
            const matchRes = matchTicket(workingTicket, alternateDraw.whiteBalls, alternateDraw.powerball, customPayouts, adminSettings.jackpotValue, adminSettings.taxes);
            if (matchRes.payout > bestPayout) {
              bestPayout = matchRes.payout;
              bestDrawnWhite = alternateDraw.whiteBalls;
              bestDrawnPB = alternateDraw.powerball;
            }
          }
          drawWhite = bestDrawnWhite;
          drawPB = bestDrawnPB;
        }

        // Match Ticket evaluation
        const powerPlayActive = adminSettings.powerPlayEnabled && getRNGFloat(adminSettings.rng, seedStateRef) < 0.33;
        const evaluation = matchTicket(
          workingTicket,
          drawWhite,
          drawPB,
          customPayouts,
          adminSettings.jackpotValue,
          adminSettings.taxes,
          powerPlayActive
        );

        finalTicketsBought += 1;
        finalTotalSpent += adminSettings.ticketPrice;
        finalDrawsCount += 1;

        // Record frequencies
        drawWhite.forEach(n => {
          updatedWhiteFreqs[n] = (updatedWhiteFreqs[n] || 0) + 1;
        });
        updatedPbFreqs[drawPB] = (updatedPbFreqs[drawPB] || 0) + 1;

        if (evaluation.tierId !== 'none') {
          finalTotalWon += evaluation.payout;
          updatedTiers[evaluation.tierId] = (updatedTiers[evaluation.tierId] || 0) + 1;

          // Sound triggers
          if (evaluation.payout >= 1000) {
            playJackpotSound(adminSettings.soundEnabled);
          } else {
            playCoinSound(adminSettings.soundEnabled);
          }

          // Trigger log on wins
          addLogLine(`WINNER! [${evaluation.tierName}] matches: ${evaluation.matchesWhite}W + ${evaluation.matchesPowerball ? 'PB' : 'no pb'} payout: $${evaluation.payout.toLocaleString()}`, 'success');
        }

        // Add history item
        if (incomingDrawEntries.length < 500) {
          incomingDrawEntries.push({
            id: Math.random().toString(36).substring(2, 9),
            drawId: finalDrawsCount,
            winningWhite: [...drawWhite],
            winningPowerball: drawPB,
            playerWhite: [...workingTicket.whiteBalls],
            playerPowerball: workingTicket.powerball,
            matchesWhite: evaluation.matchesWhite,
            matchesPowerball: evaluation.matchesPowerball,
            tierId: evaluation.tierId,
            tierName: evaluation.tierName,
            payout: evaluation.payout,
            taxPaid: evaluation.taxPaid,
            netPayout: evaluation.netPayout,
            multiplier: powerPlayActive ? 3 : 1,
            timestamp: new Date().toLocaleTimeString()
          });
        }

        // Cache last draw result
        if (s === iterationsCount - 1) {
          lastResultData = {
            winningWhite: drawWhite,
            winningPowerball: drawPB,
            playerWhite: workingTicket.whiteBalls,
            playerPowerball: workingTicket.powerball,
            matchesWhite: evaluation.matchesWhite,
            matchesPowerball: evaluation.matchesPowerball,
            tierId: evaluation.tierId,
            payout: evaluation.payout,
            taxPaid: evaluation.taxPaid,
            netPayout: evaluation.netPayout,
            powerPlayActive
          };
        }
      }

      // Roll forward the parallel player citizens under similar chances
      setParallelPlayers(prevPlayers => {
        return prevPlayers.map(p => {
          if (p.status === 'bankrupt') return p;
          
          let pBalance = p.balance;
          let pTicketsBought = p.ticketsBought;
          let pSpent = p.totalSpent;
          let pWon = p.totalWon;
          let pLastBig = p.lastBigWin;

          for (let b = 0; b < iterationsCount; b++) {
            if (pBalance < adminSettings.ticketPrice) {
              p.status = 'bankrupt';
              break;
            }

            pBalance -= adminSettings.ticketPrice;
            pSpent += adminSettings.ticketPrice;
            pTicketsBought += 1;

            // Generate bot ticket & draw
            const botSlip = getBotTicket(activeBotStrategy, Object.keys(updatedWhiteFreqs).map(Number), Object.keys(updatedPbFreqs).map(Number));
            const botDraw = generateBallsByRNG(adminSettings.rng, seedStateRef, 69, 26);
            const resMatch = matchTicket(
              { id: 'bot-slip', ...botSlip, isPowerPlay: false },
              botDraw.whiteBalls,
              botDraw.powerball,
              customPayouts,
              adminSettings.jackpotValue,
              adminSettings.taxes
            );

            if (resMatch.tierId !== 'none') {
              pBalance += resMatch.netPayout;
              pWon += resMatch.netPayout;
              if (resMatch.payout >= 100) {
                pLastBig = `${resMatch.tierName} ($${resMatch.payout})`;
              }
            }
          }

          return {
            ...p,
            balance: Math.round(pBalance),
            ticketsBought: pTicketsBought,
            totalSpent: pSpent,
            totalWon: pWon,
            lastBigWin: pLastBig
          };
        });
      });

      // Update states
      setWinningWhite(drawWhite);
      setWinningPowerball(drawPB);
      setWhiteFreqMap(updatedWhiteFreqs);
      setPbFreqMap(updatedPbFreqs);

      // Concat to master draw list, keeping last 10,000 max
      setDrawHistory(prevHist => {
        const joined = [...incomingDrawEntries, ...prevHist];
        if (joined.length > 10000) return joined.slice(0, 10000);
        return joined;
      });

      if (playModeOption === 'random') {
        setActiveTicket(workingTicket);
      }

      const freshWinnings = finalTotalWon - prevStats.totalWon;
      const nextRemainingBalance = adminSettings.cheatBalance - costOffset + freshWinnings;

      // Realistic rollover growth if jackpot was not hit
      let newJackpotVal = adminSettings.jackpotValue;
      if (adminSettings.jackpotEnabled) {
        const isJackpotHit = updatedTiers.jackpot > prevStats.tierCounts.jackpot;
        if (isJackpotHit) {
          addLogLine('🚨 COSMIC WINNER OF GRAND JACKPOT ALERT!!! 🚨', 'success');
          newJackpotVal = 40000000; // Reset to standard baseline $40M
        } else {
          // Standard real-time accumulation per unsold sheet
          newJackpotVal += adminSettings.jackpotGrowthRate * iterationsCount;
        }
      }

      setAdminSettings(prev => ({
        ...prev,
        cheatBalance: prev.infiniteMoney ? prev.cheatBalance : nextRemainingBalance,
        jackpotValue: newJackpotVal
      }));

      // Append chart balance
      setChartHistory(h => {
        const copy = [...h, nextRemainingBalance];
        if (copy.length > 50) copy.shift();
        return copy;
      });

      playBallPop(adminSettings.soundEnabled);

      return {
        ticketsBought: finalTicketsBought,
        totalSpent: finalTotalSpent,
        totalWon: finalTotalWon,
        netGainLoss: finalTotalWon - finalTotalSpent,
        drawsCount: finalDrawsCount,
        lastDrawResult: lastResultData,
        tierCounts: updatedTiers
      };
    });
  };

  // Bot configuration preset
  const [activeBotStrategy, setActiveBotStrategy] = useState<'random' | 'lucky' | 'martingale' | 'hotcold' | 'avoidOthers'>('random');

  // Keep a ref to the latest playSweepStep so the autoplay loop doesn't have stale closures
  const playSweepStepRef = useRef(playSweepStep);
  useEffect(() => {
    playSweepStepRef.current = playSweepStep;
  });

  // Trigger Autoplay loops
  useEffect(() => {
    if (isAutoplayOn) {
      const runCycleStep = () => {
        if (!isAutoplayOn) return;
        playSweepStepRef.current(adminSettings.simSpeed);
        loopRef.current = requestAnimationFrame(runCycleStep);
      };
      loopRef.current = requestAnimationFrame(runCycleStep);
    } else {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    }
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [isAutoplayOn, adminSettings.simSpeed]);

  // Global Background Activity Loop (Runs activated passive generators & interstellar space perks in background across all tabs)
  useEffect(() => {
    const bgLoop = setInterval(() => {
      setAdminSettings(prev => {
        // Read space upgrades from localStorage for real-time background boosts
        let spaceBoostMultiplier = 1;
        try {
          const spaceRaw = localStorage.getItem('multiverse_space_upgrades');
          if (spaceRaw) {
            const parsed = JSON.parse(spaceRaw);
            const totalLevels = (parsed.satelliteAutoEngine || 1) + (parsed.quantumCashSiphon || 1) + (parsed.jovianTaxShield || 1);
            spaceBoostMultiplier = 1 + (totalLevels * 10);
          }
        } catch (e) {}

        // Base passive income from background features & space travel ($10,000,000 / sec * multiplier)
        const bgPassiveIncome = 10000000 * spaceBoostMultiplier;
        if (prev.cheatBalance >= 0 && !isNaN(prev.cheatBalance)) {
          return {
            ...prev,
            cheatBalance: prev.cheatBalance + bgPassiveIncome
          };
        }
        return prev;
      });
    }, 2000);

    return () => clearInterval(bgLoop);
  }, []);

  // Execute quick pick for active selection
  const makeQuickPickUserTicket = () => {
    const drawing = generateBallsByRNG(adminSettings.rng, seedStateRef, 69, 26);
    setActiveTicket({
      id: 'user-standard',
      whiteBalls: drawing.whiteBalls,
      powerball: drawing.powerball,
      isPowerPlay: adminSettings.powerPlayEnabled
    });
    playBallPop(adminSettings.soundEnabled);
  };

  // Save selection numbers modal
  const handleSaveSlipNumbers = (whites: number[], pb: number) => {
    setActiveTicket({
      id: 'user-standard',
      whiteBalls: whites,
      powerball: pb,
      isPowerPlay: adminSettings.powerPlayEnabled
    });
    addLogLine(`Updated played numbers to customized slip selections: ${whites.join(', ')} PB: ${pb}`, 'info');
  };

  // Execute high speed Monte Carlo
  const handleExecuteMonteCarlo = () => {
    setIsMonteCarloRunning(true);
    playTickSound(adminSettings.soundEnabled);
    
    // Defer execution slightly to let UI render loading spinner
    setTimeout(() => {
      try {
        const res = runMonteCarloSim(
          monteCarloRuns,
          adminSettings.ticketPrice,
          adminSettings.jackpotValue,
          customPayouts,
          customOdds,
          adminSettings.taxes
        );
        setMonteCarloResult(res);
        addLogLine(`Executed instant Monte Carlo math sweep of ${monteCarloRuns.toLocaleString()} games!`, 'success');
      } catch (err: any) {
        addLogLine(`Monte Carlo error: ${err?.message || 'Calculation limit exceeded'}`, 'error');
      } finally {
        setIsMonteCarloRunning(false);
      }
    }, 150);
  };

  // Preset Configurations Loader
  const handleLoadPresetScenario = (id: string) => {
    playTickSound(adminSettings.soundEnabled);
    
    if (id === 'standard_powerball') {
      setAdminSettings(prev => ({
        ...prev,
        ticketPrice: 2,
        jackpotValue: 40000000,
        luckMultiplierPowerball: 1,
        luckMultiplierWhite: 1,
        clairvoyanceIndex: 0,
        riggedMode: 'none',
        infiniteMoney: false
      }));
      setCustomPayouts({});
      setCustomOdds({});
      addLogLine('Loaded Preset: Standard 2026 Powerball Scenario.', 'info');
    } else if (id === 'insane_jackpot') {
      setAdminSettings(prev => ({
        ...prev,
        ticketPrice: 2,
        jackpotValue: 5000000000, // $5 Billion pool!
        luckMultiplierPowerball: 1,
        luckMultiplierWhite: 1,
        clairvoyanceIndex: 0,
        riggedMode: 'none'
      }));
      addLogLine('Loaded Preset: Insane $5 Billion Jackpot Extravaganza.', 'info');
    } else if (id === 'god_mode') {
      setAdminSettings(prev => ({
        ...prev,
        ticketPrice: 0, // completely free!
        clairvoyanceIndex: 0.90, // 90% clairvoyance
        luckMultiplierPowerball: 80,
        luckMultiplierWhite: 80,
        riggedMode: 'forceWin',
        forceWinTierSelection: 'jackpot',
        infiniteMoney: true
      }));
      addLogLine('Loaded Preset: Guaranteed Multi-Jackpot Overlord Mode!', 'success');
    } else if (id === 'worst_luck') {
      setAdminSettings(prev => ({
        ...prev,
        ticketPrice: 5, // high inflation entry cost
        riggedMode: 'cursed', // cursed lock ensures 100% loss
        clairvoyanceIndex: 0,
        luckMultiplierPowerball: 1,
        luckMultiplierWhite: 1
      }));
      addLogLine('Loaded Preset: The Worst Luck Ever. Infinite Despair.', 'error');
    }
  };

  // Local Saving Slots manager
  const handleSaveSlot = () => {
    if (!customSlotNameInput.trim()) return;
    playTickSound(adminSettings.soundEnabled);

    const slotPayload: SaveSlot = {
      id: Math.random().toString(36).substring(2, 9),
      name: customSlotNameInput.trim(),
      timestamp: Date.now(),
      stats,
      settings: adminSettings,
      customPayouts,
      customOdds,
      chartHistory
    };

    const nextSlots = [...saveSlots, slotPayload];
    setSaveSlots(nextSlots);
    localStorage.setItem('powerball_sim_saves', JSON.stringify(nextSlots));
    setCustomSlotNameInput('');
    addLogLine(`Saved database slot state: "${slotPayload.name}"`, 'success');
  };

  const handleLoadSlot = (slot: SaveSlot) => {
    playTickSound(adminSettings.soundEnabled);
    setStats(slot.stats);
    setAdminSettings(slot.settings);
    setCustomPayouts(slot.customPayouts || {});
    setCustomOdds(slot.customOdds || {});
    setChartHistory(slot.chartHistory || [slot.settings.cheatBalance]);
    addLogLine(`Restored saved snapshot state of: "${slot.name}"`, 'info');
  };

  const handleDeleteSlot = (id: string) => {
    playTickSound(adminSettings.soundEnabled);
    const updated = saveSlots.filter(s => s.id !== id);
    setSaveSlots(updated);
    localStorage.setItem('powerball_sim_saves', JSON.stringify(updated));
    addLogLine('Removed saved slot snapshot.', 'warn');
  };

  // Base64 Import/Export
  const handleExportStateBase64 = () => {
    playTickSound(adminSettings.soundEnabled);
    try {
      const stateObj = {
        adminSettings,
        stats,
        customPayouts,
        customOdds
      };
      const base64Code = btoa(JSON.stringify(stateObj));
      // Copy to clipboard
      navigator.clipboard.writeText(window.location.origin + '?import=' + base64Code);
      addLogLine('Copied shareable Base64 hyperlink to clipboard!', 'success');
      alert(`Success! Copied Base64 link to clipboard:\n\n${window.location.origin}?import=${base64Code.slice(0,60)}...`);
    } catch (err: any) {
      addLogLine(`Base64 export failure: ${err?.message}`, 'error');
    }
  };

  // Extract logs CSV
  const handleExportCSVHistory = () => {
    if (drawHistory.length === 0) return;
    playTickSound(adminSettings.soundEnabled);
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "DrawNumber,WinningWhites,WinningPB,PlayerWhites,PlayerPB,MatchesCount,Payout,TaxPaid\n";
      
      drawHistory.forEach(d => {
        csvContent += `${d.drawId},"${d.winningWhite.join('-')}",${d.winningPowerball},"${d.playerWhite.join('-')}",${d.playerPowerball},${d.matchesWhite},${d.payout},${d.taxPaid}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `lottery_sim_history_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLogLine('Downloaded draw history CSV log file.', 'success');
    } catch {
      // Failed
    }
  };

  // RNG Error and exception simulation callbacks
  const handleInjectError = (errorName: string) => {
    playTickSound(adminSettings.soundEnabled);
    if (errorName === 'RNG_ENTROPY_FAULT') {
      addLogLine('⚠️ HW_EXCEPTION: THERMAL NOISE SAMPLER UNSTABLE. Falling back to low fidelity seeds.', 'error');
      setAdminSettings(prev => ({
        ...prev,
        rng: { ...prev.rng, type: 'lcg' }
      }));
    } else if (errorName === 'MEMORY_BURN_OVERFLOW') {
      addLogLine('🔥 CORE OVERHEAT: Threads simulation speed locked below 10 cycles/sec to cool transistors.', 'error');
      setAdminSettings(prev => ({
        ...prev,
        simSpeed: 1
      }));
    } else if (errorName === 'DATABASE_DRIFT_ERR') {
      addLogLine('📂 DATASTORE_SLATE_DRIFT: Save indices re-indexing... Mock SQL transaction latency spiked +8000ms.', 'warn');
    }
  };

  // Chaos Buttons Trigger clicks
  const handleChaosClick = (chaosType: string) => {
    playTickSound(adminSettings.soundEnabled);
    if (chaosType === 'matrix_flicker') {
      addLogLine('💥 CHAOS CORE INTERLINK: Glitching matrix vectors! CSS rules skewing...', 'chaotic');
      document.body.classList.add('animate-pulse');
      setTimeout(() => document.body.classList.remove('animate-pulse'), 5000);
    } else if (chaosType === 'payout_surge') {
      addLogLine('💥 CHAOS RECONFIGURATOR: Multi-tier prize payouts multiplied by 500x randomly for 3 ticks!', 'chaotic');
      const boostedPayouts: Record<string, number> = {};
      DEFAULT_PRIZE_TIERS.forEach(t => {
        boostedPayouts[t.id] = (customPayouts[t.id] || t.basePayout) * 500;
      });
      setCustomPayouts(boostedPayouts);
    } else if (chaosType === 'nan_break') {
      addLogLine('💥 FLOATING_POINT_CRASH: Bank balance re-cast as NaN limits.', 'chaotic');
      setAdminSettings(prev => ({ ...prev, cheatBalance: NaN }));
    }
  };

  // Map theme variables based on administrator setting selection name
  const themeClasses = useMemo(() => {
    switch (adminSettings.themeName) {
      case 'cyberpunk':
        return {
          bg: 'bg-violet-950 text-yellow-300',
          card: 'bg-violet-900/80 border-fuchsia-500/60 text-yellow-100',
          accent: 'text-fuchsia-400',
          accentBg: 'bg-fuchsia-950/50 border-fuchsia-800',
          btnPrimary: 'bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 border-fuchsia-300/40',
          badge: 'bg-fuchsia-900 text-fuchsia-250',
          sliderColor: 'accent-fuchsia-500',
          glass: 'shadow-[0_0_20px_rgba(240,46,170,0.25)] border-fuchsia-500'
        };
      case 'matrix':
        return {
          bg: 'bg-black text-green-500 font-mono',
          card: 'bg-slate-950 border-emerald-800 text-green-400',
          accent: 'text-green-300',
          accentBg: 'bg-emerald-950/40 border-emerald-990',
          btnPrimary: 'bg-green-600 hover:bg-green-500 text-black border-lime-400/30 font-bold',
          badge: 'bg-emerald-950 text-lime-400 border-lime-800',
          sliderColor: 'accent-green-500',
          glass: 'shadow-[inset_0_0_20px_rgba(16,185,129,0.3)] border-emerald-500'
        };
      case 'hot_pink':
        return {
          bg: 'bg-neutral-950 text-pink-300',
          card: 'bg-neutral-900 border-pink-500 text-pink-100',
          accent: 'text-pink-400',
          accentBg: 'bg-pink-950/50 border-pink-905',
          btnPrimary: 'bg-pink-600 hover:bg-pink-500 text-white border-pink-400',
          badge: 'bg-pink-950 text-pink-300 border-pink-900',
          sliderColor: 'accent-pink-500',
          glass: 'shadow-[0_0_15px_rgba(236,72,153,0.3)] border-pink-500'
        };
      case 'nuclear_green':
        return {
          bg: 'bg-zinc-950 text-lime-400',
          card: 'bg-zinc-900 border-lime-500 text-slate-200',
          accent: 'text-lime-300',
          accentBg: 'bg-lime-950/30 border-lime-800',
          btnPrimary: 'bg-lime-500 hover:bg-lime-400 text-neutral-950 border-lime-300',
          badge: 'bg-lime-950 text-lime-300 border-lime-900',
          sliderColor: 'accent-lime-500',
          glass: 'shadow-[inset_0_0_15px_rgba(132,204,22,0.4)] border-lime-500'
        };
      default: // default cobalt midnight
        return {
          bg: 'bg-slate-950 text-slate-100',
          card: 'bg-slate-900/80 border-slate-700/60 text-slate-100',
          accent: 'text-cyan-400',
          accentBg: 'bg-slate-950/60 border-slate-800',
          btnPrimary: 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 border-cyan-400/30 font-bold',
          badge: 'bg-slate-800 text-cyan-400 border-slate-700/80',
          sliderColor: 'accent-cyan-550',
          glass: 'shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border-slate-700'
        };
    }
  }, [adminSettings.themeName]);

  // Compute live analytical indicators
  const calculatedEVStats = useMemo(() => {
    return calculateExpectedValue(customPayouts, customOdds, adminSettings);
  }, [customPayouts, customOdds, adminSettings]);

  // Filtering list draws
  const filteredDrawsList = useMemo(() => {
    return drawHistory.filter(d => {
      if (searchFilterText) {
        const query = searchFilterText.toLowerCase();
        const matchesQuery = 
          d.drawId.toString().includes(query) ||
          d.tierName.toLowerCase().includes(query) ||
          d.winningWhite.join('-').includes(query) ||
          d.playerWhite.join('-').includes(query);
        if (!matchesQuery) return false;
      }
      if (historicMinWin > 0 && d.payout < historicMinWin) {
        return false;
      }
      return true;
    });
  }, [drawHistory, searchFilterText, historicMinWin]);

  return (
    <div 
      className={`min-h-screen flex text-slate-100 font-sans transition-colors duration-500 bg-slate-950`}
      style={{
        filter: `brightness(${adminSettings.screenBrightness ?? 100}%) hue-rotate(${adminSettings.colorHueRotate ?? 0}deg)`,
        animation: adminSettings.chaosForceShake && adminSettings.chaosForceShake > 0
          ? `appShake ${Math.max(0.04, 0.3 / adminSettings.chaosForceShake)}s infinite alternate`
          : undefined,
        boxShadow: adminSettings.neonGlowLevel && adminSettings.neonGlowLevel > 0
          ? `inset 0 0 ${adminSettings.neonGlowLevel * 12}px rgba(16, 185, 129, ${adminSettings.neonGlowLevel * 0.12})`
          : undefined,
      }}
    >
      {adminSettings.crtScanlines && (
        <div className="crt-scanlayer" />
      )}
      
      {/* ========================================== */}
      {/* 2. RECONSTRUCTED COLLAPSIBLE SIDEBAR */}
      {/* ========================================== */}
      <aside
        className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-50 sticky top-0 h-screen shrink-0 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col">
          {/* Top Logo Panel with Toggle controls */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between overflow-hidden">
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-md select-none shadow">
                  💰
                </div>
                <div>
                  <h1 className="text-xs font-black tracking-tight leading-none text-slate-100">POWERBALL</h1>
                  <span className="text-[9px] font-mono tracking-widest text-slate-400">ULTIMATE_SIM</span>
                </div>
              </div>
            )}
            <button
              id="sidebar_collapse_trigger"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition text-xs"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? '▶' : '◀'}
            </button>
          </div>

          {/* Navigation Items & Search Filter */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            {!isSidebarCollapsed && (
              <div className="space-y-2 animate-fadeIn">
                <input
                  type="text"
                  value={navSearchFilter}
                  onChange={e => setNavSearchFilter(e.target.value)}
                  placeholder="🔍 Search tabs..."
                  className="w-full bg-slate-950 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg font-mono text-slate-200 outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => {
                    playTickSound(adminSettings.soundEnabled);
                    setActiveTab('custom_tab_manager');
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs py-2 px-3 rounded-lg shadow-md flex items-center justify-center space-x-1 transition-all"
                >
                  <span>➕</span>
                  <span>ADD / CREATE TAB</span>
                </button>
              </div>
            )}
            {isSidebarCollapsed && (
              <button
                onClick={() => {
                  playTickSound(adminSettings.soundEnabled);
                  setActiveTab('custom_tab_manager');
                }}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-xs py-2 rounded-lg font-bold shadow"
                title="Add new custom tab"
              >
                ➕
              </button>
            )}
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)] custom-scrollbar">
            {[
              { id: 'interactive_scroll_quarry', label: '⛏️ Scroll Down Quarry & X-Ray', tooltip: 'Whole page interactive scroll-down quarry shaft with stickman workers, X-Ray gem scanner & customizable chisel tool' },
              { id: 'colosseum', label: '⚔️ Forced Labor Colosseum', tooltip: 'Forced labor deathmatch arena! Winner gets $50B & VIP House, Loser loses all cash & gets PERMANENTLY BANNED' },
              { id: 'forced_labor_mines', label: '🏭 Forced Labor Production Mines', tooltip: 'Heavy forced labor mining shafts, money presses, Overlord electric whips, & $100B production quotas' },
              { id: 'forced_praise_shrine', label: '🏛️ Forced Praise Cathedral', tooltip: 'Mandatory 24/7 cathedral worship, live praise chants, 1000ft Golden Overlord Statue, & praise tithes' },
              { id: 'forced_quarry', label: '💎 Antimatter Gem Quarry', tooltip: 'Deep 2,000ft underground rock chiseling & raw antimatter gem excavation' },
              { id: 'forced_cyber', label: '🤖 Cybernetic Bionic Assembly', tooltip: 'Drone soldering, neural AI chips, & robotic overseer surveillance' },
              { id: 'forced_farm', label: '🌾 Overlord Agrarian Plantation', tooltip: 'Massive bio-grain fields, energy-kelp harvesting, & automated threshers' },
              { id: 'forced_sweatshop', label: '🧵 Quantum Armor Sweatshop', tooltip: 'Stitching Sovereign silk robes, Kevlar battle suits, & VIP cloaks' },
              { id: 'forced_foundry', label: '🔥 Heavy Titan Metal Foundry', tooltip: '5000°F blast furnaces smelting gold ingots & titanium armor plates' },
              { id: 'forced_prison', label: '🔒 High-Security Labor Prison', tooltip: 'Inmate quarrying, gold license plate stamping, & cell sweeps' },
              { id: 'forced_orbital', label: '🛰️ Orbital Space Construction Yard', tooltip: 'Zero-G satellite hull welding & planetary thruster engineering' },
              { id: 'forced_vault', label: '💰 Sovereign Vault Stackers', tooltip: 'Manual cash pallet stacking & $10T subterranean gold vault loads' },
              { id: 'forced_salvage', label: '☣️ Toxic Shipwreck Scavengers', tooltip: 'Dismantling alien starships, nuclear reactors, & hyper-alloys' },
              { id: 'forced_academy', label: '🎓 Forced Indoctrination Camp', tooltip: 'Loyalty drills, obedience exams, & speed-mining recruitment camp' },
              { id: 'beginner', label: '🌱 Beginner Starter Hub', tooltip: 'Beginner playground with starter cash grants, quests, & secret code sign (NO ADMIN VISIBLE)' },
              { id: 'account_control', label: '🕵️ Account Control & Takeover', tooltip: 'Remote player account hijacking, balance siphoning, password override, & shadowbans' },
              { id: 'hacker_terminal', label: '💻 Cyber Hacknet & Darknet', tooltip: 'Live matrix hacker shell, brute-force bank exploits, DDoS node overloads & instant cash commands' },
              { id: 'galaxy_arcade', label: '👾 Galaxy Shooter Arcade', tooltip: 'Retro Space Shooter Arcade with alien fleets, plasma lasers, cash brick breaker & OP Admin Cheats' },
              { id: 'bot_casino', label: '🎰 Bot Casino Arena (OP Admin)', tooltip: 'Play Poker, Blackjack, Roulette & Duels vs AI Bots with OP Admin Control Panels in ALL games' },
              { id: 'casino_royale', label: '🎲 VIP Casino Royale', tooltip: 'High-roller Blackjack, High-Low card predictor, Wheel of Fortune & OP Always Win cheat engine' },
              { id: 'asteroids', label: '🚀 Asteroids Arcade', tooltip: 'Classic vector space arcade shooter with custom themes, high scores & wave levels' },
              { id: 'gemini', label: '✨ Gemini’s Multiverse', tooltip: 'AI God Mode, Cosmic 5-Reel Slot Machine, Celestial Space Empire & AI Command Terminal' },
              { id: 'stocks', label: '📈 Stock & Crypto Exchange', tooltip: 'Wall Street crypto/stock exchange, 100x leverage trading, market pump cheats & $100B bailouts' },
              { id: 'custom_tab_manager', label: '➕ Custom Tab Creator', tooltip: 'Create dynamic custom tabs with cash generators, embed views, and custom notes' },
              { id: 'praise', label: '👑 Forced Praise & Labor', tooltip: 'Force add people/bots to server, force them to praise you for $1B cash, and force labor' },
              { id: 'profile', label: '👤 Profile & Settings', tooltip: 'Customize display name, title badges, avatar, VIP rank & lucky numbers' },
              { id: 'server', label: '🌐 Server Hub & Accounts', tooltip: 'Host/join multiplayer server, share funds, & full control to log into connected player accounts' },
              { id: 'bidding', label: '🔨 Bidding War (OP Admin)', tooltip: 'High-stakes auction bidding game linked to wallet with live bots, rare item inventory & super OP admin cheats' },
              { id: 'coin', label: '🪙 Roblox Throw a Coin (OP Admin)', tooltip: 'Roblox #115681808123944 linked coin toss physics game & super OP admin cheat engine' },
              { id: 'engine', label: '🎛️ Simulation Engine', tooltip: 'Auto Buy, Multipliers, Core Balance adjustments' },
              { id: 'rebirth', label: '🌀 Zero-Reset Rebirth', tooltip: 'Perks, multipliers, and prestige without resetting money or inventory' },
              { id: 'events', label: '🌐 200+ Live World Events', tooltip: 'Trigger real-time financial market crashes, money rains, and cosmic glitches' },
              { id: 'currency', label: '🏛️ Forex Reserve', tooltip: 'Global Forex exchanges, central banking sovereign controls, print money, darkpools' },
              { id: 'dvd', label: '📀 DVD Corner Hack', tooltip: 'Bouncing DVD logo cash creator with trajectory lock rigs' },
              { id: 'sandbox', label: '⚛️ Quantum Sandboxels', tooltip: 'Thermonuclear physics sand game, 118 periodic table elements, explosive fusion chain reaction mining' },
              { id: 'rng', label: '🎲 Draw & RNG God', tooltip: 'Seed controls, Probabilities, Forces, History log' },
              { id: 'prize', label: '💸 Prize & Economics', tooltip: 'Rollovers, Tax bracket configurations, Monte Carlo' },
              { id: 'stats', label: '📊 Stats & Heatmaps', tooltip: 'Win counts metrics, white/red frequencies, luck tiers' },
              { id: 'bots', label: '🤖 Advanced Bots', tooltip: 'Parallel universes, Lucky numbers, Martingale bet logs' },
              { id: 'av', label: '📺 AV Control Room', tooltip: 'Adjust synthesizer volume, frequencies, CRT TV scanlines, screen shake & hues' },
              { id: 'visuals', label: '🎭 Custom Theme FX', tooltip: 'Sound configurations, confettis, velocity limits' },
              { id: 'saves', label: '💾 Slot Saves Presets', tooltip: 'Export Base64 strings, loading slot setups' },
              { id: 'debug', label: '🛠️ Developer Tools', tooltip: 'Live cli Calculations Console, Error Injectors, Chaos keys' },
              ...customTabsList.map(ct => ({
                id: ct.id,
                label: ct.label,
                tooltip: ct.description
              }))
            ]
            .filter(item => !navSearchFilter.trim() || item.label.toLowerCase().includes(navSearchFilter.toLowerCase()))
            .map(item => {
              const active = activeTab === item.id;
              const isCustom = item.id.startsWith('custom-tab-');
              return (
                <button
                  key={`nav-link-${item.id}`}
                  onClick={() => {
                    playTickSound(adminSettings.soundEnabled);
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                    active
                      ? 'bg-gradient-to-r from-cyan-950 to-slate-800 text-cyan-400 border border-slate-700/50 shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                  title={item.tooltip}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="shrink-0">{item.label.split(' ')[0]}</span>
                    {!isSidebarCollapsed && <span className="animate-fadeIn truncate text-left">{item.label.split(' ').slice(1).join(' ')}</span>}
                  </div>
                  {!isSidebarCollapsed && isCustom && (
                    <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-black shrink-0">
                      CUSTOM
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Workspace Info at footer */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-[9.5px] font-mono text-slate-505 space-y-1 animate-fadeIn leading-relaxed">
            <p>⌨ Shortcuts Activated:</p>
            <p>• <span className="text-cyan-400 font-bold">Space</span> : Play/Pause</p>
            <p>• <span className="text-cyan-400 font-bold">D / S</span> : Manual Step</p>
            <p>• <span className="text-cyan-400 font-bold">R</span> : Reset Session</p>
            <p>• <span className="text-cyan-400 font-bold">M</span> : Inject $10k cash</p>
            <div className="pt-1.5 flex gap-1 border-t border-slate-900 justify-between items-center text-[8px] text-slate-600">
              <span>LOC: 2026-06-06</span>
              <span>v9.4</span>
            </div>
          </div>
        )}
      </aside>

      {/* ========================================== */}
      {/* 3. PRIMARY CONTENT PANEL */}
      {/* ========================================== */}
      <main className="flex-1 min-w-0 overflow-y-auto px-4 py-6 sm:p-8 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* Top Info Bar including news feeds and savage commentator */}
          <NewsTicker
            totalSpent={stats.totalSpent}
            totalWon={stats.totalWon}
            netGainLoss={stats.netGainLoss}
            ticketsBought={stats.ticketsBought}
            drawsCount={stats.drawsCount}
            darkHumor={adminSettings.darkHumourActive}
          />

          {/* User Profile Header Pill Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <button
              onClick={() => {
                playTickSound(adminSettings.soundEnabled);
                setActiveTab('profile');
              }}
              className="flex items-center space-x-3 hover:bg-slate-800/80 p-1.5 rounded-xl transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-amber-400/60 flex items-center justify-center text-2xl shadow">
                {userProfile.avatarType === 'url' && userProfile.avatar.startsWith('http') ? (
                  <img src={userProfile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span>{userProfile.avatar}</span>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-white group-hover:text-amber-300 transition-colors">{userProfile.name}</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    VIP {userProfile.vipLevel}
                  </span>
                  <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30 hidden md:inline-block">
                    🌐 ALL TABS OWNED BY {userProfile.name.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{userProfile.title}</p>
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  playTickSound(adminSettings.soundEnabled);
                  setActiveTab('colosseum');
                }}
                className="bg-red-950 hover:bg-red-900 text-amber-300 border border-red-500/50 text-xs font-black px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all shadow shadow-red-900/30 animate-pulse cursor-pointer"
              >
                <span>⚔️ Colosseum</span>
              </button>
              <button
                onClick={() => {
                  playTickSound(adminSettings.soundEnabled);
                  setActiveTab('forced_labor_mines');
                }}
                className="bg-amber-950 hover:bg-amber-900 text-yellow-300 border border-amber-500/50 text-xs font-black px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all shadow cursor-pointer"
              >
                <span>🏭 Labor Mines</span>
              </button>
              <button
                onClick={() => {
                  playTickSound(adminSettings.soundEnabled);
                  setActiveTab('forced_praise_shrine');
                }}
                className="bg-yellow-950 hover:bg-yellow-900 text-amber-200 border border-yellow-500/50 text-xs font-black px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all shadow cursor-pointer"
              >
                <span>🏛️ Praise Cathedral</span>
              </button>
              <button
                onClick={() => {
                  playTickSound(adminSettings.soundEnabled);
                  setActiveTab('praise');
                }}
                className="bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/40 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all shadow"
              >
                <span>👑 Forced Praise & Labor</span>
              </button>
              <button
                onClick={() => {
                  playTickSound(adminSettings.soundEnabled);
                  setActiveTab('server');
                }}
                className="bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all shadow"
              >
                <span>🏛️ Server Tax & Accounts</span>
              </button>
              <button
                onClick={() => {
                  playTickSound(adminSettings.soundEnabled);
                  setActiveTab('profile');
                }}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all"
              >
                <span>⚙️ Profile & Settings</span>
              </button>
            </div>
          </div>

          {/* Quick Stats overview HUD at upper frame */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 border border-slate-805/50 p-4 rounded-2xl shadow-xl">
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 tracking-wider">CURRENT BALANCE</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg sm:text-2xl font-black font-mono text-slate-105">
                  {adminSettings.infiniteMoney ? 'INFINITY' : `$${adminSettings.cheatBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                </span>
                {!adminSettings.infiniteMoney && <span className="text-[10px] font-bold text-slate-500">USD</span>}
              </div>
            </div>
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 tracking-wider">TICKETS BOUGHT</span>
              <p className="text-lg sm:text-2xl font-black font-mono mt-0.5 text-slate-100">
                {stats.ticketsBought.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[9.5px] font-mono text-emerald-400 tracking-wider">GROSS RECLAIMED</span>
              <p className="text-lg sm:text-2xl font-black font-mono mt-0.5 text-emerald-400">
                ${stats.totalWon.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <span className="text-[9.5px] font-mono text-slate-400 tracking-wider">NET PROFIT/LOSS</span>
              <p className={`text-lg sm:text-2xl font-black font-mono mt-0.5 ${stats.netGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${stats.netGainLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Core App Layout: Bipartite setup */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* LEFT CONTAINER: Live physical machine drawer */}
            <div className="xl:col-span-4 space-y-6">
              <VisualDraw
                winningWhite={winningWhite}
                winningPowerball={winningPowerball}
                playerWhite={activeTicket.whiteBalls}
                playerPowerball={activeTicket.powerball}
                isDrawing={isAutoplayOn}
                clairvoyanceIndex={adminSettings.clairvoyanceIndex}
                riggedMode={adminSettings.riggedMode}
              />

              {/* Dynamic Jackpot rollovers progress */}
              <div className="bg-slate-900 border border-slate-805 p-5 rounded-2xl shadow-xl space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-mono text-slate-400">CURRENT STANDING JACKPOT:</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/50 border border-emerald-900/60 px-2 py-0.5 rounded">
                    Est. Real Rollover Active
                  </span>
                </div>
                <p className="text-2xl sm:text-3xl font-black tracking-tight text-yellow-300 font-mono">
                  ${Math.round(adminSettings.jackpotValue).toLocaleString()}
                </p>
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>Increment/Unsold draw: +${(adminSettings.jackpotGrowthRate * 100).toFixed(0)}% ticket sale cost</span>
                  <span>Baseline reset: $40,000,000</span>
                </div>
              </div>
            </div>

            {/* RIGHT CONTAINER: Deep Section Submodules */}
            <div className="xl:col-span-8">
              
              {/* ========================================== */}
              {/* TAB 1: SITE ENGINE MODULE */}
              {/* ========================================== */}
              {activeTab === 'engine' && (
                <div className="bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Global Controls & Simulation Engine</h2>
                      <p className="text-xs text-slate-400">Primary simulation cycle pacing, multipliers, and balance injectors.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Run autoplays speed multiplier keys */}
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3.5">
                        <span className="text-[10.5px] font-mono text-cyan-400 font-bold block uppercase">AUTOPLAY WARP ENGINES</span>
                        
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-mono text-slate-300 flex justify-between">
                            <span>Draws executed per game tick cycle:</span>
                            <span className="text-cyan-400 font-bold">{adminSettings.simSpeed.toLocaleString()} draws</span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="10000"
                            step={adminSettings.simSpeed > 500 ? 100 : 10}
                            value={adminSettings.simSpeed}
                            onChange={(e) => setAdminSettings(prev => ({ ...prev, simSpeed: parseInt(e.target.value) }))}
                            className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
                          />
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                            <span>1x (Real Slow)</span>
                            <span>1,000x (Warp speed)</span>
                            <span>10,000x (Extreme Multi-Thread)</span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => setIsAutoplayOn(prev => !prev)}
                            className={`w-full py-3 rounded-xl font-black text-xs transition relative overflow-hidden flex items-center justify-center gap-2 select-none shadow-lg ${
                              isAutoplayOn
                                ? 'bg-red-650 hover:bg-red-600 text-white animate-pulse'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300/40'
                            }`}
                          >
                            {isAutoplayOn ? '⏸ STOP SIMULATION RUN' : '⚡ START AUTOPLAY SIMULATOR'}
                          </button>
                        </div>
                      </div>

                      {/* Manual draw and quick pick triggers */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3">
                        <span className="text-[10.5px] font-mono text-slate-400 font-bold block uppercase">SINGLE MANUAL EVENT SLIPS</span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button
                            onClick={() => playSweepStep(1)}
                            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold border border-slate-705 text-slate-200 transition"
                          >
                            Buy 1 Slip ($2)
                          </button>
                          <button
                            onClick={() => playSweepStep(100)}
                            className="py-2.5 px-3 bg-slate-850 hover:bg-slate-750 text-slate-200 rounded-lg font-mono font-bold transition"
                          >
                            Buy 100 Slips ($200)
                          </button>
                          <button
                            onClick={makeQuickPickUserTicket}
                            className="py-2.5 px-3 bg-slate-950 border border-slate-800 font-bold text-cyan-400 rounded-lg transition"
                          >
                            🎲 Quick Pick User Card
                          </button>
                          <button
                            onClick={() => setIsManualSlipOpen(true)}
                            className="py-2.5 px-3 bg-cyan-950/40 hover:bg-cyan-950 text-cyan-300 border border-cyan-900 rounded-lg transition text-xs font-bold"
                          >
                            ✏ Custom Pick Overrides
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Money controls, gods mode toggles */}
                    <div className="space-y-4">
                      {/* Change Your Money Balance utilities */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3">
                        <span className="text-[10.5px] font-mono text-amber-400 font-bold block uppercase">➕ CHANGE YOUR MONEY WALLET (ADD/SUBTRACT)</span>
                        <p className="text-[10.5px] text-slate-400 leading-normal font-sans">
                          Dial any sum. Wire funds directly inside or extract from virtual player balance holdings.
                        </p>
                        
                        <div className="flex gap-2">
                          <div className="flex items-center bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex-1">
                            <span className="text-slate-500 font-mono font-bold text-xs">$</span>
                            <input
                              type="number"
                              value={manualMoneyAdjustText}
                              onChange={(e) => setManualMoneyAdjustText(e.target.value)}
                              className="w-full bg-transparent outline-none text-xs text-slate-200 font-mono text-right font-black"
                              placeholder="1000"
                            />
                          </div>
                          
                          <button
                            onClick={() => handleBalanceModifier('add')}
                            className="px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition"
                          >
                            + ADD
                          </button>
                          <button
                            onClick={() => handleBalanceModifier('subtract')}
                            className="px-3 bg-red-950 text-red-200 hover:bg-red-900 font-bold border border-red-900/60 rounded-lg text-xs transition"
                          >
                            - SUBTRACT
                          </button>
                        </div>
                      </div>

                      {/* Infinite and God Mode toggles */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3.5">
                        <span className="text-[10.5px] font-mono text-purple-400 font-bold block uppercase">🛸 SUPER-GOD CHEAT INDUCTION MATRIX</span>
                        
                        <div className="space-y-3 text-xs leading-normal">
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="text-slate-200 block">Infinite Bankrolls Limit</strong>
                              <span className="text-[10px] text-slate-450">Locks budget balance. Defeats debt cap.</span>
                            </div>
                            <button
                              onClick={() => setAdminSettings(prev => ({ ...prev, infiniteMoney: !prev.infiniteMoney }))}
                              className={`w-11 h-6 rounded-full p-1 transition-colors ${adminSettings.infiniteMoney ? 'bg-emerald-500' : 'bg-slate-800'}`}
                            >
                              <div className={`bg-white w-4 h-4 rounded-full shift-x transform transition-transform ${adminSettings.infiniteMoney ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-900 pt-2.5">
                            <div>
                              <strong className="text-slate-200 block">God Win Mode (Auto Match Override)</strong>
                              <span className="text-[10px] text-slate-450">Rig tumbler physics to guarantee a win on next draw.</span>
                            </div>
                            <button
                              onClick={() => setAdminSettings(prev => ({ ...prev, riggedMode: prev.riggedMode === 'forceWin' ? 'none' : 'forceWin' }))}
                              className={`w-11 h-6 rounded-full p-1 transition-colors ${adminSettings.riggedMode === 'forceWin' ? 'bg-purple-650' : 'bg-slate-800'}`}
                            >
                              <div className={`bg-white w-4 h-4 rounded-full shift-x transform transition-transform ${adminSettings.riggedMode === 'forceWin' ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 2: RNG GOD MODULE */}
              {/* ========================================== */}
              {activeTab === 'rng' && (
                <div className="bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Draw & RNG God Panel</h2>
                      <p className="text-xs text-slate-400">Configure machine seed generators, forced draw numbers, and probabilities coefficients.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Seed and custom RNG algorithm selectors */}
                    <div className="space-y-4">
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3.5">
                        <span className="text-[10.5px] font-mono text-cyan-400 font-bold block uppercase">RNG SOURCE TRANSISTOR</span>
                        
                        <div className="space-y-3 text-xs leading-normal">
                          <div className="space-y-1">
                            <label className="text-[11.5px] font-mono text-slate-400">Determinism Algorithm:</label>
                            <select
                              value={adminSettings.rng.type}
                              onChange={(e) => setAdminSettings(prev => ({
                                ...prev,
                                rng: { ...prev.rng, type: e.target.value as any }
                              }))}
                              className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-205 rounded-lg text-xs font-bold"
                            >
                              <option value="lcg">Linear Congruential LCG (Seed deterministic)</option>
                              <option value="crypto">Cryptographic Hardware API (Highly secure true random)</option>
                              <option value="chaotic">Thermal Chaotic Trigonometrics (Extreme entropy spike)</option>
                            </select>
                          </div>

                          <div className="border-t border-slate-900 pt-3 flex items-center justify-between">
                            <div>
                              <strong className="text-slate-300 block">Toggle Seed Lock</strong>
                              <span className="text-[10px] text-slate-450">Ensure duplicate sequence when draw seeds match.</span>
                            </div>
                            <button
                              onClick={() => setAdminSettings(prev => ({
                                ...prev,
                                rng: { ...prev.rng, useSeed: !prev.rng.useSeed }
                              }))}
                              className={`w-11 h-6 rounded-full p-1 transition-colors ${adminSettings.rng.useSeed ? 'bg-cyan-550' : 'bg-slate-800'}`}
                            >
                              <div className={`bg-white w-4 h-4 rounded-full transform transition-transform ${adminSettings.rng.useSeed ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>

                          {adminSettings.rng.useSeed && (
                            <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                              <label className="text-[10px] text-slate-400 font-mono">Custom Seeds Key String:</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={adminSettings.rng.seed}
                                  onChange={(e) => {
                                    const nextSeedVal = e.target.value;
                                    setAdminSettings(prev => ({
                                      ...prev,
                                      rng: { ...prev.rng, seed: nextSeedVal }
                                    }));
                                    seedStateRef.current = stringToSeed(nextSeedVal);
                                  }}
                                  className="bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-slate-200 flex-1 px-2 py-1 rounded"
                                />
                                <button
                                  onClick={() => {
                                    const randKey = Math.random().toString(36).substring(2, 9);
                                    setAdminSettings(prev => ({
                                      ...prev,
                                      rng: { ...prev.rng, seed: randKey }
                                    }));
                                    seedStateRef.current = stringToSeed(randKey);
                                    addLogLine(`Re-seeded RNG pipeline key to: "${randKey}"`, 'dev');
                                  }}
                                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono px-2 rounded"
                                >
                                  RE-SEED
                                </button>
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono block leading-none pt-0.5">
                                Computed Integer Seed Index: {seedStateRef.current.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Probability Sliders */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-4">
                        <span className="text-[10.5px] font-mono text-purple-400 font-semibold block uppercase">🛸 FORCE SELECT WIN TIER DIVISION</span>
                        <div className="space-y-3.5 text-xs leading-normal">
                          <div className="space-y-1">
                            <label className="text-[11px] font-mono text-slate-400">Select target division to trigger next win event:</label>
                            <select
                              value={adminSettings.forceWinTierSelection}
                              onChange={(e) => setAdminSettings(prev => ({ ...prev, forceWinTierSelection: e.target.value }))}
                              className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-205 rounded-lg text-xs font-bold font-sans"
                            >
                              {DEFAULT_PRIZE_TIERS.map(t => (
                                <option key={`tier-choice-${t.id}`} value={t.id}>{t.name} (matches {t.matchText})</option>
                              ))}
                            </select>
                          </div>
                          
                          <button
                            onClick={() => {
                              setAdminSettings(prev => ({ ...prev, riggedMode: 'forceWin' }));
                              playSweepStep(1);
                              addLogLine(`Force Win: Leveraged physics to matching ${adminSettings.forceWinTierSelection} successfully!`, 'success');
                            }}
                            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-lg shadow-md hover:shadow-purple-700/20 shadow-purple-500/10 transition leading-none flex items-center justify-center border border-purple-400/30"
                          >
                            💥 Force Win Match On Next Draw!
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Probability coefficient editor lists */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-4">
                      <span className="text-[10.5px] font-mono text-slate-300 font-bold block uppercase">🍀 PROBABILITY THEORY FORCE MULTIPLIERS</span>
                      
                      <div className="space-y-4 text-xs leading-normal">
                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-400">White Balls Draw Gravity:</span>
                            <span className="text-cyan-400 font-bold">{adminSettings.luckMultiplierWhite === 1 ? '1.0x (Fair/Normal)' : `${adminSettings.luckMultiplierWhite}x Magnet`}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={adminSettings.luckMultiplierWhite}
                            onChange={(e) => setAdminSettings(prev => ({ ...prev, luckMultiplierWhite: parseInt(e.target.value) }))}
                            className="w-full accent-cyan-400 h-1 bg-slate-900 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-400">Powerball Pull Coef:</span>
                            <span className="text-red-400 font-bold">
                              {adminSettings.luckMultiplierPowerball === 1 ? '1.0x (Normal)' : adminSettings.luckMultiplierPowerball === 100 ? 'AUTO MATCH PB' : `${adminSettings.luckMultiplierPowerball}x Boost`}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            step="1"
                            value={adminSettings.luckMultiplierPowerball}
                            onChange={(e) => setAdminSettings(prev => ({ ...prev, luckMultiplierPowerball: parseInt(e.target.value) }))}
                            className="w-full accent-red-400 h-1 bg-slate-900 rounded-lg cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[11px]">
                            <span className="text-slate-400">Precognition Clairvoyance Factor:</span>
                            <span className="text-purple-400 font-bold">{(adminSettings.clairvoyanceIndex * 100).toFixed(0)}% Omniscience</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={adminSettings.clairvoyanceIndex}
                            onChange={(e) => setAdminSettings(prev => ({ ...prev, clairvoyanceIndex: parseFloat(e.target.value) }))}
                            className="w-full accent-purple-400 h-1 bg-slate-900 rounded-lg cursor-pointer"
                          />
                          <p className="text-[9.5px] text-slate-500 font-sans leading-tight">
                            Subtly forces played ticket inputs to align straight into actual drawn numbers postdrawing.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Draw History List Table */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-2.5">
                      <span className="text-[10.5px] font-mono text-slate-300 font-bold block uppercase">📜 HISTORY ARCHIVE LOGS (LAST 10,000 DRAWS)</span>
                      
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          placeholder="Search tier, whites..."
                          value={searchFilterText}
                          onChange={(e) => setSearchFilterText(e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-[10.5px] px-2 py-1 rounded w-28 font-mono outline-none text-slate-205"
                        />
                        <button
                          onClick={handleExportCSVHistory}
                          disabled={drawHistory.length === 0}
                          className="bg-slate-800 border border-slate-700 hover:border-slate-600 disabled:opacity-30 disabled:hover:border-transparent transition text-[10px] font-mono font-bold text-slate-250 px-2 py-1 rounded"
                        >
                          EXPORT CSV
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto max-h-56 overflow-y-auto font-mono text-[10.5px] text-slate-350">
                      {filteredDrawsList.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 italic">No historical matches loaded. Start simulations to accumulate log sheets.</div>
                      ) : (
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-505 font-bold uppercase text-[9px]">
                              <th className="pb-1.5">Draw ID</th>
                              <th className="pb-1.5">Winning Drawn Number</th>
                              <th className="pb-1.5 text-center">Played Slip</th>
                              <th className="pb-1.5 text-right">Hit Division</th>
                              <th className="pb-1.5 text-right">Payouts Received</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-905">
                            {filteredDrawsList.slice(0, 100).map(d => (
                              <tr key={d.id} className="hover:bg-slate-900/30">
                                <td className="py-1">#{d.drawId}</td>
                                <td className="py-1">
                                  <span className="text-slate-201 font-black">{d.winningWhite.join(' ')}</span>
                                  <span className="text-red-400 font-black ml-1.5">{d.winningPowerball}</span>
                                </td>
                                <td className="py-1 text-center font-mono text-slate-400">
                                  {d.playerWhite.join(' ')} - red {d.playerPowerball}
                                </td>
                                <td className="py-1 text-right text-cyan-400 font-bold">{d.tierName}</td>
                                <td className="py-1 text-right font-black text-emerald-450">${d.payout.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 3: PRIZE & ECONOMICS MODULE */}
              {/* ========================================== */}
              {activeTab === 'prize' && (
                <div className="bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Prize & Economics Engine</h2>
                      <p className="text-xs text-slate-400">Full payout reconfiguration, inflation ticket parameters, taxes sliders, and positive mathematical EVs.</p>
                    </div>
                  </div>

                  {/* Expected Value Document equations */}
                  <ExpectedValueDocs />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tax Bracket Configuration Sliders */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-4">
                      <span className="text-[10.5px] font-mono text-amber-400 font-bold block uppercase">📋 TAX STRUCTURE WITHHOLDINGS PANEL</span>
                      
                      <div className="space-y-4 text-xs">
                        <div className="flex justify-between items-center">
                          <strong>Enable Tax Deductions</strong>
                          <button
                            onClick={() => setAdminSettings(prev => ({
                              ...prev,
                              taxes: { ...prev.taxes, applyTaxes: !prev.taxes.applyTaxes }
                            }))}
                            className={`w-11 h-6 rounded-full p-1 transition-colors ${adminSettings.taxes.applyTaxes ? 'bg-amber-500' : 'bg-slate-800'}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shift transform transition-transform ${adminSettings.taxes.applyTaxes ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        {adminSettings.taxes.applyTaxes && (
                          <div className="space-y-4 border-t border-slate-900 pt-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-mono text-slate-450 flex justify-between">
                                <span>IRS IRS Federal Withholding Bracket:</span>
                                <span className="font-bold text-slate-200">{(adminSettings.taxes.federalRate * 100).toFixed(0)}%</span>
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="0.50"
                                step="0.01"
                                value={adminSettings.taxes.federalRate}
                                onChange={(e) => setAdminSettings(prev => ({
                                  ...prev,
                                  taxes: { ...prev.taxes, federalRate: parseFloat(e.target.value) }
                                }))}
                                className="w-full h-1 accent-amber-500 cursor-pointer bg-slate-900 rounded-lg"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-mono text-slate-450 flex justify-between">
                                <span>State Tax Surcharge Rate:</span>
                                <span className="font-bold text-slate-200">{(adminSettings.taxes.stateRate * 100).toFixed(0)}%</span>
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="0.25"
                                step="0.01"
                                value={adminSettings.taxes.stateRate}
                                onChange={(e) => setAdminSettings(prev => ({
                                  ...prev,
                                  taxes: { ...prev.taxes, stateRate: parseFloat(e.target.value) }
                                }))}
                                className="w-full h-1 accent-amber-450 cursor-pointer bg-slate-900 rounded-lg"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-mono text-slate-450 flex justify-between">
                                <span>Lump Sum Cash Option Penalty:</span>
                                <span className="font-bold text-slate-200">{(adminSettings.taxes.cashOptionReduction * 100).toFixed(0)}% reduction</span>
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="0.70"
                                step="0.01"
                                value={adminSettings.taxes.cashOptionReduction}
                                onChange={(e) => setAdminSettings(prev => ({
                                  ...prev,
                                  taxes: { ...prev.taxes, cashOptionReduction: parseFloat(e.target.value) }
                                }))}
                                className="w-full h-1 accent-red-500 cursor-pointer bg-slate-900 rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ticket price inflation adjustments */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-4">
                      <span className="text-[10.5px] font-mono text-slate-350 font-bold block uppercase">💳 INFLATION & EXTRAS</span>
                      
                      <div className="space-y-4 text-xs leading-normal">
                        <div className="flex justify-between items-center">
                          <div>
                            <strong className="text-slate-205">Ticket Purchase Entry Fee:</strong>
                            <p className="text-[10px] text-slate-500">Standard MSRP ticket cost.</p>
                          </div>
                          <div className="flex items-center bg-slate-900 px-2 py-1 rounded border border-slate-800">
                            <span className="text-[10px] font-mono text-slate-550 mr-1">$</span>
                            <input
                              type="number"
                              value={adminSettings.ticketPrice}
                              onChange={(e) => setAdminSettings(prev => ({ ...prev, ticketPrice: parseFloat(e.target.value) || 0 }))}
                              className="bg-transparent text-right font-mono font-bold w-12 outline-none text-slate-201"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                          <div>
                            <strong className="text-slate-205">Enable red Power Play Feature:</strong>
                            <p className="text-[10px] text-slate-500">Provides multipliers up to 10x on non-jackpot tiers.</p>
                          </div>
                          <button
                            onClick={() => setAdminSettings(prev => ({ ...prev, powerPlayEnabled: !prev.powerPlayEnabled }))}
                            className={`w-11 h-6 rounded-full p-1 transition-colors ${adminSettings.powerPlayEnabled ? 'bg-cyan-555' : 'bg-slate-800'}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shift transform transition-transform ${adminSettings.powerPlayEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instant high speed Monte Carlo Sandbox */}
                  <div className="bg-slate-955 p-4 rounded-xl border border-rose-500/10 space-y-4">
                    <span className="text-[11.5px] font-mono text-yellow-300 font-extrabold block uppercase">🎰 MONTE CARLO PROBABILITY SWEEP ACCELERATOR</span>
                    <p className="text-[10.5px] text-slate-400 leading-normal">
                      Instantly sweep up to 1,000,000 games on paper using mathematical weight coefficients to establish final outcomes.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-400 uppercase">Trial sweeps volume:</label>
                        <select
                          value={monteCarloRuns}
                          onChange={(e) => setMonteCarloRuns(parseInt(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-205 rounded-lg text-xs font-mono font-bold"
                        >
                          <option value="1000">1,000 runs (Instant)</option>
                          <option value="10000">10,000 runs (Very fast)</option>
                          <option value="100000">100,000 runs (Speedy)</option>
                          <option value="1000000">1,000,000 runs (Mathematical warp)</option>
                        </select>
                      </div>

                      <button
                        onClick={handleExecuteMonteCarlo}
                        disabled={isMonteCarloRunning}
                        className="py-2.5 bg-yellow-500 hover:bg-yellow-450 text-slate-950 font-black rounded-lg text-xs transition col-span-1 shadow shadow-yellow-500/10"
                      >
                        {isMonteCarloRunning ? '🧮 SWEEPING MATRICES...' : '⚡ INSTA-RUN SIMS'}
                      </button>

                      {monteCarloResult && (
                        <div className="col-span-1 sm:col-span-2 text-[10px] font-mono px-3.5 py-1 text-slate-400 bg-slate-950/60 rounded border border-slate-800">
                          <span className="text-yellow-400 font-bold text-[10.5px] block">M-C OUTCOME SUMMARY:</span>
                          Spent: <strong className="text-slate-201">${monteCarloResult.totalSpent.toLocaleString()}</strong> | 
                          Won: <strong className="text-emerald-450">${monteCarloResult.totalWon.toLocaleString()}</strong> <br/>
                          Net Loss: <strong className="text-rose-400">-${Math.abs(monteCarloResult.netLoss).toLocaleString()}</strong> | 
                          ROI: <strong className={monteCarloResult.roi >= -50 ? 'text-cyan-400' : 'text-rose-450'}>{monteCarloResult.roi}%</strong> <br />
                          Jackpots Hit: <strong className="text-yellow-405 font-black">{monteCarloResult.jackpotsWon}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 4: STATISTICS & ANALYTICS DASHBOARD */}
              {/* ========================================== */}
              {activeTab === 'stats' && (
                <div className="bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Statistics & Analytics Dashboard</h2>
                      <p className="text-xs text-slate-400">Heatmaps of number frequency (white balls + Powerball) and structural analytics graphs.</p>
                    </div>
                  </div>

                  {/* Financial area line chart */}
                  <VisualChart
                    history={chartHistory}
                    mode="player"
                    soundEnabled={adminSettings.soundEnabled}
                  />

                  {/* Grid for White Balls heat map */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3">
                    <span className="text-[10.5px] font-mono text-cyan-400 font-bold block uppercase">🔥 WHITE BALLS DRAWINGS FREQUENCY HEATMAP (1-69)</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Visual intensity indicates count drawn matching events relative to session history. Hover boxes to check metrics.
                    </p>

                    <div className="grid grid-cols-10 sm:grid-cols-15 gap-1 pt-1.5">
                      {Array.from({ length: 69 }, (_, i) => i + 1).map(num => {
                        const freq = whiteFreqMap[num] || 0;
                        // Calculate color weight relative to standard baseline
                        const maxFreq = Math.max(...(Object.values(whiteFreqMap) as number[]), 1);
                        const weight = freq / maxFreq;
                        
                        let cellBg = 'bg-slate-900/60 border-slate-850 text-slate-550';
                        if (freq > 0) {
                          if (weight < 0.25) cellBg = 'bg-cyan-950/40 border-cyan-900/60 text-cyan-400';
                          else if (weight < 0.5) cellBg = 'bg-cyan-900/50 border-cyan-805 text-cyan-300';
                          else if (weight < 0.75) cellBg = 'bg-amber-955/50 border-amber-801 text-amber-300';
                          else cellBg = 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.25)]';
                        }

                        return (
                          <div
                            key={`white-cell-${num}`}
                            className={`h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center border transition-all hover:scale-110 cursor-help ${cellBg}`}
                            title={`White Ball #${num} | Drawn: ${freq} times`}
                          >
                            {num}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Grid for Powerballs heat map */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3">
                    <span className="text-[10.5px] font-mono text-red-400 font-bold block uppercase">🔥 RED POWERBALL DRAWINGS FREQUENCY HEATMAP (1-26)</span>
                    
                    <div className="grid grid-cols-7 sm:grid-cols-13 gap-1 pt-1">
                      {Array.from({ length: 26 }, (_, i) => i + 1).map(num => {
                        const freq = pbFreqMap[num] || 0;
                        const maxFreq = Math.max(...(Object.values(pbFreqMap) as number[]), 1);
                        const weight = freq / maxFreq;

                        let cellBg = 'bg-slate-900/60 border-slate-850 text-slate-550';
                        if (freq > 0) {
                          if (weight < 0.3) cellBg = 'bg-rose-955/30 border-rose-900/50 text-rose-450';
                          else if (weight < 0.6) cellBg = 'bg-rose-950/70 border-rose-800 text-rose-300';
                          else cellBg = 'bg-red-600/80 border-red-400 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse';
                        }

                        return (
                          <div
                            key={`pb-cell-${num}`}
                            className={`h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center border transition-all hover:scale-110 cursor-help ${cellBg}`}
                            title={`Powerball #${num} | Drawn: ${freq} times`}
                          >
                            {num}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Labor Productivity Heatmap (D3 Visualization) */}
                  <LaborProductivityHeatmap
                    soundEnabled={adminSettings.soundEnabled}
                  />

                  {/* Leaderboard panel list */}
                  <Leaderboard
                    players={parallelPlayers}
                    multiSessionCount={adminSettings.multiSessionCount}
                    onUpdateSessionCount={handleUpdateSessionCount}
                    activeStrategy={activeBotStrategy}
                    userProfile={userProfile}
                    userEarnings={stats.totalWon + adminSettings.cheatBalance}
                  />
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 5: ADVANCED COMPULSION BOTS */}
              {/* ========================================== */}
              {activeTab === 'bots' && (
                <div className="bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Advanced Automation & Bots</h2>
                      <p className="text-xs text-slate-400">Launch designated logic bots or concurrent citizen sessions.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* GLOBAL STICKMAN DENSITY MULTIPLIER SLIDER */}
                    <div className="bg-slate-950 p-5 rounded-2xl border-2 border-cyan-500/60 space-y-4 shadow-xl col-span-1 md:col-span-2">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-2xl shadow">
                            🏃‍♂️
                          </div>
                          <div>
                            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                              <span>GLOBAL STICKMAN DENSITY MULTIPLIER</span>
                              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40">
                                ACTIVE CONTROL
                              </span>
                            </h3>
                            <p className="text-xs text-slate-400 pt-0.5">
                              Caps the maximum number of stickmen rendered per labor tab to prevent UI performance drops, lagging, and visual overcrowding.
                            </p>
                          </div>
                        </div>
                        <div className="bg-cyan-950 border border-cyan-400/60 px-4 py-2 rounded-xl font-mono text-right shadow">
                          <span className="text-[10px] text-cyan-300 block uppercase font-bold">Effective Visual Cap</span>
                          <span className="text-xl font-black text-cyan-300">
                            {Math.max(5, Math.round(50 * (adminSettings.stickmanDensityMultiplier ?? 1.0)))} Stickmen / Tab
                          </span>
                          <span className="text-[10px] text-slate-400 block font-bold">
                            ({((adminSettings.stickmanDensityMultiplier ?? 1.0) * 100).toFixed(0)}% Density)
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-mono font-bold">
                          <span className="text-slate-300">Density Multiplier Slider (0.1x - 5.0x):</span>
                          <span className="text-cyan-400 font-black text-sm bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                            {(adminSettings.stickmanDensityMultiplier ?? 1.0).toFixed(1)}x Multiplier
                          </span>
                        </div>

                        <input
                          type="range"
                          min="0.1"
                          max="5.0"
                          step="0.1"
                          value={adminSettings.stickmanDensityMultiplier ?? 1.0}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setAdminSettings(prev => ({ ...prev, stickmanDensityMultiplier: val }));
                            addLogLine(`Adjusted Global Stickman Density Multiplier to ${val.toFixed(1)}x (${Math.max(5, Math.round(50 * val))} max stickmen per labor tab)`, 'dev');
                          }}
                          className="w-full h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800 shadow-inner"
                        />

                        {/* PRESET QUICK BUTTONS */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {[
                            { label: '⚡ Ultra Low (0.2x / 10 Cap)', val: 0.2 },
                            { label: '⚖️ Standard (1.0x / 50 Cap)', val: 1.0 },
                            { label: '🔥 High Density (2.0x / 100 Cap)', val: 2.0 },
                            { label: '💥 Overlord Swarm (5.0x / 250 Cap)', val: 5.0 },
                          ].map((preset) => (
                            <button
                              key={preset.val}
                              onClick={() => {
                                setAdminSettings(prev => ({ ...prev, stickmanDensityMultiplier: preset.val }));
                                addLogLine(`Set Stickman Density Multiplier preset to ${preset.val}x`, 'dev');
                              }}
                              className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                                (adminSettings.stickmanDensityMultiplier ?? 1.0) === preset.val
                                  ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black ring-2 ring-cyan-400 shadow-md'
                                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bot Logic configuration selection */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3.5">
                      <span className="text-[10.5px] font-mono text-cyan-400 font-bold block uppercase">SELECT ROBOT STRATEGY</span>
                      
                      <div className="space-y-3 text-xs">
                        <select
                          value={activeBotStrategy}
                          onChange={(e) => {
                            setActiveBotStrategy(e.target.value as any);
                            addLogLine(`Reconfigured active logic bot strategy type: ${e.target.value}`, 'dev');
                          }}
                          className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-205 rounded-lg text-xs font-sans font-bold capitalize"
                        >
                          <option value="random">Random Walk (Quick picks standard)</option>
                          <option value="lucky">Static Lucky Numbers (Repeats 4-8-15-16-23 PB:42)</option>
                          <option value="avoidOthers">Avoid Unpopular Numbers (Select above 31, minimize jackpot splits)</option>
                          <option value="hotcold">Statistical Hot/Cold (Drafts top-frequency counts drawn)</option>
                        </select>

                        <div className="space-y-1.5 p-3 rounded-lg bg-slate-900/40 border border-slate-850 leading-relaxed text-slate-400">
                          {activeBotStrategy === 'lucky' && (
                            <p>🎯 <strong>Lucky Numbers Bot:</strong> Plays exact static sequence of values representing common birthdates. Suffer extremely high duplicate coefficient overlap!</p>
                          )}
                          {activeBotStrategy === 'avoidOthers' && (
                            <p>🛡 <strong>Avoid Unpopular Numbers Bot:</strong> Selects numbers exclusively above 31 (days in month) to prevent shared jackpot payouts against average people on real pools.</p>
                          )}
                          {activeBotStrategy === 'hotcold' && (
                            <p>📈 <strong>Hot/Cold Tracker Bot:</strong> Analyzes previous counts frequency map on white and red balls to draft highest-occurence combinations iteratively.</p>
                          )}
                          {activeBotStrategy === 'random' && (
                            <p>🎲 <strong>Random Quick Pick:</strong> Baseline fast mathematical simulation model.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Auto run thresholds sliders */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3.5">
                      <span className="text-[10.5px] font-mono text-slate-300 font-bold block uppercase">SCHEDULE AUTO-STOP TRIGGERS</span>
                      
                      <div className="space-y-4 text-xs">
                        <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                          Unattended robots run indefinitely inside loop ticks until any designated limit threshold triggers.
                        </p>
                        
                        <div className="space-y-1 bg-slate-900/60 p-2.5 rounded border border-slate-850">
                          <strong className="text-slate-202 block">Target Objective:</strong>
                          <span className="text-[10px] text-slate-400 block pb-1">Auto stop simulation if reached:</span>
                          <div className="bg-slate-950/70 p-1.5 rounded text-cyan-400 font-bold font-mono">
                            • Run till bankrupt (balance matches zero)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 6: CUSTOM THEME VISUALS */}
              {/* ========================================== */}
              {activeTab === 'visuals' && (
                <div className="bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Visual & UI Customization</h2>
                      <p className="text-xs text-slate-400">Personalise style themes, confetti animations on mega wins, and audio preferences.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Theme choice dropdown */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3.5">
                      <span className="text-[10.5px] font-mono text-cyan-400 font-bold block uppercase">SELECT MACHINE SYSTEM THEME</span>
                      
                      <div className="space-y-1">
                        <label className="text-[11.5px] font-mono text-slate-400">Available profiles:</label>
                        <select
                          value={adminSettings.themeName}
                          onChange={(e) => {
                            setAdminSettings(prev => ({ ...prev, themeName: e.target.value as any }));
                            addLogLine(`Transitioned UI layout canvas styles to: ${e.target.value.toUpperCase()}`, 'dev');
                          }}
                          className="w-full bg-slate-900 border border-slate-800 p-2 text-slate-205 rounded-lg text-xs font-bold"
                        >
                          <option value="midnight"> Midnight Cobalt (Clean high-contrast dark)</option>
                          <option value="cyberpunk">👾 Cyberpunk Neon (Fuchsia/Yellow glowing grids)</option>
                          <option value="matrix">📟 Matrix Digital Terminal (Cascading emerald terminal)</option>
                          <option value="hot_pink">🎀 High Society Pink (Vibrant luxury magenta outlines)</option>
                          <option value="nuclear_green">☢ Nuclear Fallout Hazard (Vast yellow-lime hazard alerts)</option>
                        </select>
                      </div>
                    </div>

                    {/* SFX and Confetti Toggles */}
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-4">
                      <span className="text-[10.5px] font-mono text-slate-350 font-bold block uppercase">MISCELLANEOUS PARTICLES & AUDIO</span>
                      
                      <div className="space-y-3 text-xs leading-normal">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>Audio Synthesizer Module</strong>
                            <p className="text-[9.5px] text-slate-500">Play mechanical pops on drawings.</p>
                          </div>
                          <button
                            onClick={() => setAdminSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                            className={`w-11 h-6 rounded-full p-1 transition-colors ${adminSettings.soundEnabled ? 'bg-cyan-505' : 'bg-slate-800'}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shift transform transition-transform ${adminSettings.soundEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                          <div>
                            <strong>Dark Humor Roasts</strong>
                            <p className="text-[9.5px] text-slate-500">Enable AI Critic comments on deficits.</p>
                          </div>
                          <button
                            onClick={() => setAdminSettings(prev => ({ ...prev, darkHumourActive: !prev.darkHumourActive }))}
                            className={`w-11 h-6 rounded-full p-1 transition-colors ${adminSettings.darkHumourActive ? 'bg-indigo-600' : 'bg-slate-800'}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shift transform transition-transform ${adminSettings.darkHumourActive ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* TAB 7: SAVE / LOAD PRESETS */}
              {/* ========================================== */}
              {activeTab === 'saves' && (
                <div className="bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Save / Load / Presets Sandbox</h2>
                      <p className="text-xs text-slate-400">Save snapshot states to localStorage or import shareable Base64 hyperlinks.</p>
                    </div>
                  </div>

                  {/* Preset Scenarios list */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3">
                    <span className="text-[10.5px] font-mono text-cyan-400 font-bold block uppercase">PRESET EMULATION SCENARIOS</span>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Instantly override active engine presets to recreate historic or extreme test curves.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-semibold">
                      <button
                        onClick={() => handleLoadPresetScenario('standard_powerball')}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-center"
                      >
                        🇺🇸 Realistic standard Powerball
                      </button>
                      <button
                        onClick={() => handleLoadPresetScenario('insane_jackpot')}
                        className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-805 text-emerald-400 rounded-lg text-center"
                      >
                        💰 Est. $5 Billion Insane Jackpots
                      </button>
                      <button
                        onClick={() => handleLoadPresetScenario('god_mode')}
                        className="py-2 px-3 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/50 text-purple-200 rounded-lg text-center"
                      >
                        👑 Perfect God luck
                      </button>
                      <button
                        onClick={() => handleLoadPresetScenario('worst_luck')}
                        className="py-2 px-3 bg-rose-950/40 hover:bg-rose-900/30 border border-rose-900 text-rose-300 rounded-lg text-center"
                      >
                        💀 Underworld Abyss (0% Odds)
                      </button>
                    </div>
                  </div>

                  {/* Local Database Slot Saves */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-4">
                      <span className="text-[10.5px] font-mono text-slate-300 font-bold block uppercase">📝 FILE A NEW SAVE SLOT STATE</span>
                      
                      <div className="space-y-2">
                        <label className="text-[11px] text-slate-450 block font-mono">Slot description name:</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. My Run at $1.5 Billion"
                            value={customSlotNameInput}
                            onChange={(e) => setCustomSlotNameInput(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-205 font-medium flex-1 outline-none font-sans"
                          />
                          <button
                            onClick={handleSaveSlot}
                            disabled={!customSlotNameInput.trim()}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:hover:bg-cyan-600 text-slate-950 font-black text-xs px-4 py-1.5 rounded transition shadow"
                          >
                            SAVE SLOT
                          </button>
                        </div>
                      </div>

                      {/* Share hyperlink exporter */}
                      <div className="border-t border-slate-900 pt-3">
                        <button
                          onClick={handleExportStateBase64}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold font-mono text-xs rounded transition flex items-center justify-center gap-1.5"
                        >
                          🔗 Export Shareable Base64 Hyperlink Key
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3.5">
                      <span className="text-[10.5px] font-mono text-slate-450 font-semibold block uppercase">📂 DEPOSITED SAVES MATRIX</span>
                      
                      <div className="space-y-2 max-h-40 overflow-y-auto text-xs font-mono">
                        {saveSlots.length === 0 ? (
                          <div className="text-center py-8 text-slate-500 italic">No slot deposited states yet.</div>
                        ) : (
                          saveSlots.map(s => (
                            <div key={s.id} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-850">
                              <div>
                                <strong className="text-slate-205">{s.name}</strong>
                                <span className="text-[9px] text-slate-500 block">Drawn count: {s.stats.drawsCount} | Spent: ${s.stats.totalSpent.toLocaleString()}</span>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => handleLoadSlot(s)}
                                  className="text-[10.5px] bg-slate-950 px-2 py-0.5 rounded text-cyan-400 font-bold border border-slate-800"
                                >
                                  LOAD
                                </button>
                                <button
                                  onClick={() => handleDeleteSlot(s.id)}
                                  className="text-[10.5px] bg-rose-950/40 text-rose-300 px-1.5 py-0.5 rounded border border-rose-900/40"
                                >
                                  ⚠️
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================== */}
              {/* BRAND NEW: GLOBAL CURRENCY EXCHANGE & RESERVES */}
              {/* ========================================== */}
              {activeTab === 'currency' && (
                <CurrencyExchange
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: DVD BOUNCING LOGO REWARDS RIG */}
              {/* ========================================== */}
              {activeTab === 'dvd' && (
                <DVDBouncingCash
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: QUANTUM SANDBOXELS REACTOR */}
              {/* ========================================== */}
              {activeTab === 'sandbox' && (
                <QuantumSandboxels
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: ROBLOX THROW A COIN GAME & OP ADMIN */}
              {/* ========================================== */}
              {activeTab === 'coin' && (
                <ThrowACoinGame
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: HIGH-STAKES BIDDING WAR & OP ADMIN */}
              {/* ========================================== */}
              {activeTab === 'bidding' && (
                <BiddingGame
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  userProfile={userProfile}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: USER PROFILE & SETTINGS */}
              {/* ========================================== */}
              {activeTab === 'profile' && (
                <UserProfileSettings
                  profile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                  cheatBalance={adminSettings.cheatBalance}
                  soundEnabled={adminSettings.soundEnabled}
                  onSyncLuckyNumbersToTicket={(white, pb) => {
                    setActiveTicket({
                      id: 'user-standard',
                      whiteBalls: white,
                      powerball: pb,
                      isPowerPlay: activeTicket.isPowerPlay
                    });
                  }}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: MULTIPLAYER SERVER MANAGER & ACCOUNTS CONTROL */}
              {/* ========================================== */}
              {activeTab === 'server' && (
                <MultiplayerServerManager
                  currentProfile={userProfile}
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateProfile={handleUpdateProfile}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: ZERO-RESET REBIRTH SYSTEM */}
              {/* ========================================== */}
              {activeTab === 'rebirth' && (
                <RebirthManager
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                  adminSettings={adminSettings}
                  onUpdateAdminSettings={setAdminSettings}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: 200+ LIVE WORLD EVENTS ENGINE */}
              {/* ========================================== */}
              {activeTab === 'events' && (
                <LiveEventsManager
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  adminSettings={adminSettings}
                  onUpdateAdminSettings={setAdminSettings}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: GEMINI'S MULTIVERSE ULTIMATE PLAYGROUND */}
              {/* ========================================== */}
              {activeTab === 'gemini' && (
                <GeminiMultiverseTab
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  userProfile={userProfile}
                  onUpdateProfile={setUserProfile}
                  adminSettings={adminSettings}
                  onUpdateAdminSettings={setAdminSettings}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: FORCED SERVER PRAISE & LABOR DOMAIN */}
              {/* ========================================== */}
              {activeTab === 'praise' && (
                <SovereignPraiseManager
                  cheatBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  userProfile={userProfile}
                  adminSettings={adminSettings}
                  onUpdateAdminSettings={setAdminSettings}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: BEGINNER STARTER HUB */}
              {/* ========================================== */}
              {activeTab === 'beginner' && (
                <BeginnerHubTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                  onUnlockAdmin={() => setActiveTab('gemini')}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: REMOTE ACCOUNT CONTROL & TAKEOVER */}
              {/* ========================================== */}
              {activeTab === 'account_control' && (
                <AccountControlTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  currentUser={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: CYBER HACKNET & DARKNET TERMINAL */}
              {/* ========================================== */}
              {activeTab === 'hacker_terminal' && (
                <HackerTerminalTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: INTERACTIVE SCROLL QUARRY & X-RAY CHISEL */}
              {/* ========================================== */}
              {activeTab === 'interactive_scroll_quarry' && (
                <InteractiveScrollQuarryTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: FORCED LABOR COLOSSEUM DEATHMATCH */}
              {/* ========================================== */}
              {activeTab === 'colosseum' && (
                <ForcedLaborColosseumTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: FORCED LABOR PRODUCTION MINES */}
              {/* ========================================== */}
              {activeTab === 'forced_labor_mines' && (
                <ForcedLaborMinesTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: FORCED PRAISE CATHEDRAL & SHRINE */}
              {/* ========================================== */}
              {activeTab === 'forced_praise_shrine' && (
                <ForcedPraiseShrineTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 1. Antimatter Gem Quarry */}
              {activeTab === 'forced_quarry' && (
                <ForcedLaborQuarryTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 2. Cybernetic Bionic Assembly */}
              {activeTab === 'forced_cyber' && (
                <ForcedLaborCyberAssemblyTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 3. Overlord Agrarian Plantation */}
              {activeTab === 'forced_farm' && (
                <ForcedLaborFarmTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 4. Quantum Armor Sweatshop */}
              {activeTab === 'forced_sweatshop' && (
                <ForcedLaborSweatshopTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 5. Heavy Titan Metal Foundry */}
              {activeTab === 'forced_foundry' && (
                <ForcedLaborFoundryTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 6. High-Security Labor Prison */}
              {activeTab === 'forced_prison' && (
                <ForcedLaborPrisonTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 7. Orbital Space Construction Yard */}
              {activeTab === 'forced_orbital' && (
                <ForcedLaborOrbitalTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 8. Sovereign Vault Stackers */}
              {activeTab === 'forced_vault' && (
                <ForcedLaborVaultTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 9. Toxic Shipwreck Scavengers */}
              {activeTab === 'forced_salvage' && (
                <ForcedLaborSalvageTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* 10. Forced Indoctrination Camp */}
              {activeTab === 'forced_academy' && (
                <ForcedLaborAcademyTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: GALAXY SHOOTER ARCADE */}
              {/* ========================================== */}
              {activeTab === 'galaxy_arcade' && (
                <GalaxyShooterArcadeTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: BOT CASINO ARENA & ALL-GAMES ADMIN */}
              {/* ========================================== */}
              {activeTab === 'bot_casino' && (
                <BotCasinoTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: CASINO ROYALE & VIP LOUNGE */}
              {/* ========================================== */}
              {activeTab === 'casino_royale' && (
                <CasinoRoyaleTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: ASTEROIDS ARCADE TAB */}
              {/* ========================================== */}
              {activeTab === 'asteroids' && (
                <AsteroidsGameTab
                  soundEnabled={adminSettings.soundEnabled}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: STOCK & CRYPTO EXCHANGE TAB */}
              {/* ========================================== */}
              {activeTab === 'stocks' && (
                <StockExchangeTab
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  username={userProfile.name}
                />
              )}

              {/* ========================================== */}
              {/* BRAND NEW: DYNAMIC TAB CREATOR & AI LAB */}
              {/* ========================================== */}
              {activeTab === 'custom_tab_manager' && (
                <CustomTabManager
                  currentBalance={adminSettings.cheatBalance}
                  onUpdateBalance={(newBal) => {
                    setAdminSettings(prev => ({
                      ...prev,
                      cheatBalance: typeof newBal === 'function' ? (newBal as (b: number) => number)(prev.cheatBalance) : newBal
                    }));
                  }}
                  soundEnabled={adminSettings.soundEnabled}
                  onAddNewTabToNav={handleAddNewTabToNav}
                  onSelectTab={(tabId) => setActiveTab(tabId)}
                  customTabsList={customTabsList}
                  onDeleteCustomTab={handleDeleteCustomTab}
                />
              )}

              {/* ========================================== */}
              {/* DYNAMIC USER CREATED TAB VIEW */}
              {/* ========================================== */}
              {activeTab.startsWith('custom-tab-') && (() => {
                const customTab = customTabsList.find(t => t.id === activeTab);
                if (!customTab) {
                  return (
                    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 text-center space-y-4">
                      <p className="text-slate-400">Tab not found or deleted.</p>
                      <button
                        onClick={() => setActiveTab('custom_tab_manager')}
                        className="bg-cyan-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                      >
                        Return to Tab Manager
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-6 animate-fadeIn pb-12">
                    <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 border-2 border-cyan-400 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg border border-cyan-200">
                          {customTab.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-extrabold text-white tracking-wide uppercase">
                              {customTab.label}
                            </h2>
                            <span className="bg-cyan-500/20 text-cyan-300 text-xs font-black px-3 py-1 rounded-full border border-cyan-500/40">
                              CUSTOM TAB
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 pt-1">{customTab.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 font-mono">
                        <button
                          onClick={() => {
                            const payout = customTab.payoutPerSec * 10;
                            setAdminSettings(prev => ({ ...prev, cheatBalance: prev.cheatBalance + payout }));
                            playCoinSound(adminSettings.soundEnabled);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
                        >
                          💸 CLAIM BOOST (+${(customTab.payoutPerSec * 10).toLocaleString()})
                        </button>
                        <button
                          onClick={() => handleDeleteCustomTab(customTab.id)}
                          className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 font-bold text-xs px-3 py-2.5 rounded-xl transition-all"
                        >
                          🗑️ DELETE TAB
                        </button>
                      </div>
                    </div>

                    {/* NOTES CARD */}
                    {customTab.notes && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
                        <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">📝 CUSTOM WORKSPACE NOTES</h3>
                        <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap">{customTab.notes}</p>
                      </div>
                    )}

                    {/* OPTIONAL EMBED VIEW */}
                    {customTab.embedUrl && (
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
                        <h3 className="font-extrabold text-xs text-white uppercase tracking-wider">🌐 EMBEDDED WEB VIEW</h3>
                        <div className="w-full h-96 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                          <iframe
                            src={customTab.embedUrl}
                            className="w-full h-full border-0"
                            title={customTab.label}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* ========================================== */}
              {/* BRAND NEW: GLOBAL A/V CONTROL ROOM DECK */}
              {/* ========================================== */}
              {activeTab === 'av' && (
                <AudioVisualRig
                  adminSettings={adminSettings}
                  onUpdateSettings={(newSettings) => {
                    setAdminSettings(newSettings);
                  }}
                />
              )}

              {/* ========================================== */}
              {/* TAB 8: DEVELOPER DEBUG TERMINAL */}
              {/* ========================================== */}
              {activeTab === 'debug' && (
                <div className="bg-slate-900/80 border border-slate-700/60 p-6 rounded-2xl shadow-xl space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-200">Debug & Developer Tools</h2>
                      <p className="text-xs text-slate-400">Live variables state inspection, FPS profilers, error injections, and break-the-game portals.</p>
                    </div>
                  </div>

                  {/* System console calculations logger */}
                  <ConsoleTerminal
                    logs={logs}
                    onClear={() => setLogs([])}
                    onInjectError={handleInjectError}
                    onChaosClick={handleChaosClick}
                  />

                  {/* Variables state inspector */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850/80 space-y-3 font-mono">
                    <span className="text-[10.5px] font-mono text-cyan-400 font-bold block uppercase">📂 LIVE SYSTEM STATE VARIABLE INSPECTOR</span>
                    
                    <div className="bg-slate-900/80 rounded-lg p-3 text-[10px] text-slate-350 max-h-48 overflow-y-auto leading-relaxed relative border border-slate-800/60">
                      <pre>{JSON.stringify({ adminSettings, stats }, null, 2)}</pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify({ adminSettings, stats }, null, 2));
                          addLogLine('Copied JSON state payload to clipboard.', 'success');
                        }}
                        className="py-1 px-2.5 rounded bg-slate-950 text-slate-450 border border-slate-800 absolute top-2 right-2 hover:text-slate-200"
                      >
                        Copy JSON String
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* Footer info card */}
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 font-mono mt-12 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>Galactic Powerball Ultimate Sandbox Simulator &copy; 2026. Custom LCG algorithms active.</p>
          <div className="flex gap-4">
            <span className="text-slate-600">Standard Powerball Odd matrices completely integrated.</span>
          </div>
        </footer>

      </main>

      {/* Manual Numbers Slip Modal */}
      <ManualNumbersModal
        isOpen={isManualSlipOpen}
        onClose={() => setIsManualSlipOpen(false)}
        onSave={handleSaveSlipNumbers}
        initialWhiteBalls={activeTicket.whiteBalls}
        initialPowerball={activeTicket.powerball}
        soundEnabled={adminSettings.soundEnabled}
      />

    </div>
  );
}
