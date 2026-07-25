import React, { useState } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface BotCasinoTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

interface BotPlayer {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  cards: string[];
  status: 'active' | 'folded' | 'busted';
}

export const BotCasinoTab: React.FC<BotCasinoTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
}) => {
  const [activeCasinoTab, setActiveCasinoTab] = useState<'poker' | 'blackjack' | 'roulette' | 'duel'>('poker');

  // ==========================================
  // POKER VS BOTS STATE & ADMIN
  // ==========================================
  const [pokerPot, setPokerPot] = useState<number>(5000000000); // $5B pot
  const [pokerPlayerHand, setPokerPlayerHand] = useState<string[]>(['🂡', '🂮']);
  const [pokerCommunityCards, setPokerCommunityCards] = useState<string[]>(['🂽', '🂾', '🂺', '🂻', '🂱']);
  const [pokerBots, setPokerBots] = useState<BotPlayer[]>([
    { id: 'b1', name: 'CryptoWhale_99', avatar: '🐳', chips: 50000000000, cards: ['🂢', '🂧'], status: 'active' },
    { id: 'b2', name: 'DominusCollector_X', avatar: '👑', chips: 25000000000, cards: ['🂮', '🂥'], status: 'active' },
    { id: 'b3', name: 'Builderman_Official', avatar: '👷', chips: 10000000000, cards: ['🂨', '🂩'], status: 'active' },
    { id: 'b4', name: 'NoobTrader2026', avatar: '👶', chips: 500000, cards: ['🂲', '🂳'], status: 'active' },
  ]);

  // Poker Admin Cheats
  const [xrayVisionEnabled, setXrayVisionEnabled] = useState<boolean>(true);
  const [pokerAlwaysRoyalFlush, setPokerAlwaysRoyalFlush] = useState<boolean>(false);

  // ==========================================
  // BLACKJACK VS BOTS STATE & ADMIN
  // ==========================================
  const [bjPlayerTotal, setBjPlayerTotal] = useState<number>(20);
  const [bjDealerTotal, setBjDealerTotal] = useState<number>(18);
  const [bjDealerHiddenCard, setBjDealerHiddenCard] = useState<string>('🂺 (10)');
  const [bjBet, setBjBet] = useState<number>(1000000000);
  const [bjBotsAtTable, setBjBotsAtTable] = useState([
    { name: 'QuantumInvestor', avatar: '⚛️', hand: '🂺 🂹 (19)' },
    { name: 'Shadow_Rival', avatar: '🥷', hand: '🂡 🂷 (18)' },
  ]);

  // Blackjack Admin Cheats
  const [bjPeekDealer, setBjPeekDealer] = useState<boolean>(true);
  const [bjAutoBustDealer, setBjAutoBustDealer] = useState<boolean>(false);

  // ==========================================
  // ROULETTE VS BOTS STATE & ADMIN
  // ==========================================
  const [rouletteTargetNum, setRouletteTargetNum] = useState<number>(7);
  const [rouletteSelectedBet, setRouletteSelectedBet] = useState<string>('RED');
  const [rouletteLog, setRouletteLog] = useState<string[]>([
    '🎡 Bot Bettors placed $12B total bets on the Roulette table.'
  ]);

  // Roulette Admin Cheats
  const [rouletteRiggedWin, setRouletteRiggedWin] = useState<boolean>(true);

  // ==========================================
  // DUEL / COIN FLIP VS BOTS STATE & ADMIN
  // ==========================================
  const [selectedDuelBot, setSelectedDuelBot] = useState<string>('CryptoWhale_99');
  const [duelBet, setDuelBet] = useState<number>(10000000000);
  const [duelResult, setDuelResult] = useState<string>('');
  const [duelRiggedWin, setDuelRiggedWin] = useState<boolean>(true);

  // ==========================================
  // LOG ENGINE
  // ==========================================
  const [casinoAuditLog, setCasinoAuditLog] = useState<string[]>([
    '🎰 BOT CASINO ARENA ONLINE: All 4 games linked with OP Admin Control Panels.',
  ]);

  const addLog = (msg: string) => {
    setCasinoAuditLog(prev => [msg, ...prev]);
  };

  // ------------------------------------------
  // POKER HANDLERS & ADMIN ACTIONS
  // ------------------------------------------
  const handlePokerCall = () => {
    onUpdateBalance(prev => prev + pokerPot);
    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog(`👑 POKER WIN: You won the $${pokerPot.toLocaleString()} Pot against all 4 Bots!`);
    setPokerPot(10000000000);
  };

  const handleAdminPokerRoyalFlush = () => {
    setPokerPlayerHand(['🂡 A♠', '🂮 K♠']);
    setPokerCommunityCards(['🂽 Q♠', '🂻 J♠', '🂺 10♠', '🂱 A♥', '🂸 8♦']);
    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog('👑 POKER ADMIN: Injected Guaranteed Royal Flush into your hand!');
  };

  const handleAdminForceFoldAllBots = () => {
    setPokerBots(prev => prev.map(b => ({ ...b, status: 'folded' })));
    onUpdateBalance(prev => prev + pokerPot);
    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog('👑 POKER ADMIN: Force-folded all bot players! Claimed full pot!');
  };

  const handleAdminInjectPot = () => {
    setPokerPot(prev => prev + 100000000000);
    if (soundEnabled) playCoinSound(soundEnabled);
    addLog('👑 POKER ADMIN: Injected +$100,000,000,000 into table pot!');
  };

  // ------------------------------------------
  // BLACKJACK HANDLERS & ADMIN ACTIONS
  // ------------------------------------------
  const handlePlayBlackjackHand = () => {
    if (bjAutoBustDealer) {
      setBjDealerTotal(26); // Bust
      const payout = bjBet * 10;
      onUpdateBalance(prev => prev + payout);
      if (soundEnabled) playJackpotSound(soundEnabled);
      addLog(`👑 BLACKJACK ADMIN WIN: Dealer busted (26)! Won +$${payout.toLocaleString()}!`);
    } else {
      const isWin = bjPlayerTotal >= bjDealerTotal;
      if (isWin) {
        onUpdateBalance(prev => prev + bjBet * 2);
        if (soundEnabled) playCoinSound(soundEnabled);
        addLog(`✅ BLACKJACK WIN: Beat dealer! Won +$${(bjBet * 2).toLocaleString()}`);
      } else {
        onUpdateBalance(prev => prev - bjBet);
        if (soundEnabled) playTickSound(soundEnabled);
        addLog(`❌ BLACKJACK LOSS: Enable Admin Bust Dealer cheat to win!`);
      }
    }
  };

  const handleAdminForce21 = () => {
    setBjPlayerTotal(21);
    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog('👑 BLACKJACK ADMIN: Set player total to 21 (Blackjack)!');
  };

  // ------------------------------------------
  // ROULETTE HANDLERS & ADMIN ACTIONS
  // ------------------------------------------
  const handleSpinRoulette = () => {
    const landed = rouletteRiggedWin ? rouletteTargetNum : Math.floor(Math.random() * 37);
    const winAmount = 50000000000; // $50B
    onUpdateBalance(prev => prev + winAmount);
    if (soundEnabled) playJackpotSound(soundEnabled);
    setRouletteLog(prev => [`🎉 ROULETTE LANDED ON ${landed}! Won +$${winAmount.toLocaleString()}!`, ...prev]);
    addLog(`🎡 ROULETTE WIN: Landed on ${landed}! Won +$${winAmount.toLocaleString()} against bots!`);
  };

  const handleAdminDrainRouletteBots = () => {
    onUpdateBalance(prev => prev + 100000000000);
    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog('👑 ROULETTE ADMIN: Drained all bot roulette chips (+ $100B)!');
  };

  // ------------------------------------------
  // DUEL HANDLERS & ADMIN ACTIONS
  // ------------------------------------------
  const handlePlayDuel = () => {
    if (duelRiggedWin) {
      onUpdateBalance(prev => prev + duelBet * 2);
      if (soundEnabled) playJackpotSound(soundEnabled);
      setDuelResult(`🏆 VICTORY! Smashed ${selectedDuelBot} in high-stakes duel! Won +$${(duelBet * 2).toLocaleString()}`);
      addLog(`⚔️ DUEL WIN: Defeated ${selectedDuelBot}! Won +$${(duelBet * 2).toLocaleString()}`);
    } else {
      onUpdateBalance(prev => prev - duelBet);
      if (soundEnabled) playTickSound(soundEnabled);
      setDuelResult(`💔 DEFEAT: ${selectedDuelBot} won the duel. Enable Rigged Duel cheat!`);
      addLog(`❌ DUEL LOSS: Lost to ${selectedDuelBot}.`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-mono">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-2 border-indigo-400 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-xl border border-indigo-200">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                BOT CASINO ARENA & ALL-GAMES ADMIN SUITE
              </h2>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-black px-3 py-1 rounded-full border border-indigo-500/40 animate-pulse">
                OP ADMIN RIGGING ACTIVE IN ALL GAMES
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 pt-1">
              Play Poker, Blackjack, Roulette, and High-Stakes Duels against AI Bots. Every game has its own dedicated OP Admin Cheat Panel!
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-400 uppercase">ACTIVE BOTS AT TABLE</div>
          <div className="text-xl font-black text-indigo-300">6 High-Roller AI Bots</div>
        </div>
      </div>

      {/* GAME NAV TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'poker', label: '🃏 Texas Hold’em Poker vs Bots', icon: '👑' },
          { id: 'blackjack', label: '♠️ High-Stakes Blackjack vs Bots', icon: '🎰' },
          { id: 'roulette', label: '🎡 Bot Roulette Table', icon: '🎯' },
          { id: 'duel', label: '⚔️ $100B Coin Flip & Bot Duel', icon: '🪙' },
        ].map(g => (
          <button
            key={g.id}
            onClick={() => {
              if (soundEnabled) playTickSound(soundEnabled);
              setActiveCasinoTab(g.id as any);
            }}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center space-x-2 transition-all ${
              activeCasinoTab === g.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl ring-2 ring-indigo-400/50'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>{g.icon}</span>
            <span>{g.label}</span>
          </button>
        ))}
      </div>

      {/* ========================================== */}
      // GAME 1: TEXAS HOLD'EM POKER VS BOTS
      // ==========================================
      {activeCasinoTab === 'poker' && (
        <div className="space-y-6">
          {/* POKER ADMIN PANEL */}
          <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-400 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-indigo-800/60 pb-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center space-x-2">
                <span>👑 POKER OP ADMIN CONTROL PANEL</span>
              </span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">100% BOT CONTROL</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setXrayVisionEnabled(!xrayVisionEnabled)}
                className={`px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                  xrayVisionEnabled
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                👁️ X-Ray Vision (See Bot Cards): {xrayVisionEnabled ? 'ACTIVE' : 'OFF'}
              </button>

              <button
                onClick={handleAdminPokerRoyalFlush}
                className="bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow"
              >
                🂡 Force Royal Flush Hand
              </button>

              <button
                onClick={handleAdminForceFoldAllBots}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow"
              >
                🤏 Force Fold All Bots & Claim Pot
              </button>

              <button
                onClick={handleAdminInjectPot}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow"
              >
                💸 Inject +$100B into Pot
              </button>
            </div>
          </div>

          {/* POKER TABLE VISUAL */}
          <div className="bg-emerald-950/90 border-4 border-emerald-600 rounded-3xl p-6 shadow-2xl relative min-h-[380px] flex flex-col justify-between">
            {/* POT DISPLAY */}
            <div className="text-center space-y-1">
              <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-extrabold">TABLE POT</span>
              <div className="text-2xl font-black text-amber-300 bg-black/60 border border-amber-400/50 inline-block px-5 py-1.5 rounded-full shadow-inner">
                💰 ${pokerPot.toLocaleString()}
              </div>
            </div>

            {/* BOTS AT TABLE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
              {pokerBots.map(bot => (
                <div key={bot.id} className="bg-slate-950/90 border border-emerald-500/40 p-3 rounded-2xl text-center space-y-1 shadow-lg">
                  <div className="text-2xl">{bot.avatar}</div>
                  <div className="text-xs font-extrabold text-white">{bot.name}</div>
                  <div className="text-[10px] text-emerald-400 font-bold">${bot.chips.toLocaleString()}</div>
                  
                  {/* BOT CARDS (X-RAY SHOWS REVEALED) */}
                  <div className="pt-1 flex justify-center gap-1">
                    {bot.status === 'folded' ? (
                      <span className="text-[10px] text-rose-400 font-bold">FOLDED</span>
                    ) : xrayVisionEnabled ? (
                      bot.cards.map((card, i) => (
                        <span key={i} className="bg-amber-400 text-slate-950 font-black text-xs px-2 py-1 rounded shadow">
                          {card}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="bg-indigo-900 border border-indigo-400 text-indigo-300 text-xs px-2 py-1 rounded">🂠</span>
                        <span className="bg-indigo-900 border border-indigo-400 text-indigo-300 text-xs px-2 py-1 rounded">🂠</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* COMMUNITY CARDS & PLAYER HAND */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">COMMUNITY CARDS</span>
                <div className="flex gap-2 text-xl font-bold">
                  {pokerCommunityCards.map((c, idx) => (
                    <span key={idx} className="bg-white text-slate-950 px-3 py-1.5 rounded-lg shadow-md font-black">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-amber-300 block mb-1 uppercase font-bold">YOUR HAND</span>
                <div className="flex gap-2 text-2xl font-bold">
                  {pokerPlayerHand.map((c, idx) => (
                    <span key={idx} className="bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl shadow-xl font-black">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePokerCall}
                className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs px-6 py-4 rounded-2xl shadow-xl transition-all"
              >
                👑 CALL & WIN POT (${pokerPot.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      // GAME 2: HIGH-STAKES BLACKJACK VS BOTS
      // ==========================================
      {activeCasinoTab === 'blackjack' && (
        <div className="space-y-6">
          {/* BLACKJACK ADMIN PANEL */}
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-purple-950 border-2 border-purple-400 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-purple-800/60 pb-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
                👑 BLACKJACK OP ADMIN CONTROL PANEL
              </span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">TABLE RIG ENGINE</span>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAdminForce21}
                className="bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow"
              >
                🎯 Force Perfect 21 Hand
              </button>

              <button
                onClick={() => setBjAutoBustDealer(!bjAutoBustDealer)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                  bjAutoBustDealer
                    ? 'bg-rose-600 text-white border-rose-400 shadow-lg'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                💥 Auto Bust Dealer (Set Total 26): {bjAutoBustDealer ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() => setBjPeekDealer(!bjPeekDealer)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                  bjPeekDealer
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                👁️ Peek Dealer Hidden Card: {bjPeekDealer ? 'ACTIVE' : 'OFF'}
              </button>
            </div>
          </div>

          {/* BLACKJACK TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* DEALER HAND */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase">BOT DEALER HAND</span>
                <div className="text-3xl font-black text-rose-400">
                  TOTAL: {bjDealerTotal} {bjDealerTotal > 21 ? '(BUSTED!)' : ''}
                </div>
                <div className="text-xs text-amber-300 font-mono">
                  Hidden Card: {bjPeekDealer ? bjDealerHiddenCard : '🂠 [HIDDEN]'}
                </div>
              </div>

              {/* YOUR HAND */}
              <div className="bg-slate-950 border border-amber-500/40 p-5 rounded-2xl text-center space-y-2">
                <span className="text-[10px] text-amber-300 font-bold uppercase">YOUR HAND</span>
                <div className="text-3xl font-black text-emerald-400">
                  TOTAL: {bjPlayerTotal}
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Bet: ${bjBet.toLocaleString()}
                </div>
              </div>

            </div>

            {/* TABLE BOTS */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex justify-around">
              {bjBotsAtTable.map((b, i) => (
                <div key={i} className="text-center font-mono">
                  <span className="text-2xl">{b.avatar}</span>
                  <div className="text-xs font-bold text-white">{b.name}</div>
                  <div className="text-[10px] text-purple-300">{b.hand}</div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePlayBlackjackHand}
              className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm py-4 rounded-2xl shadow-2xl transition-all"
            >
              🎰 PLAY BLACKJACK HAND vs BOTS
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      // GAME 3: BOT ROULETTE TABLE
      // ==========================================
      {activeCasinoTab === 'roulette' && (
        <div className="space-y-6">
          {/* ROULETTE ADMIN PANEL */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-emerald-800/60 pb-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
                👑 ROULETTE OP ADMIN CONTROL PANEL
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">MAGNET WHEEL RIG</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setRouletteRiggedWin(!rouletteRiggedWin)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                  rouletteRiggedWin
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                🎯 Rig Roulette Land Target: {rouletteRiggedWin ? 'ACTIVE (100% WINS)' : 'OFF'}
              </button>

              <button
                onClick={handleAdminDrainRouletteBots}
                className="bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow"
              >
                🤖 Drain All Bot Roulette Chips (+$100B)
              </button>
            </div>
          </div>

          {/* ROULETTE WORKSPACE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="text-center space-y-2">
              <div className="text-5xl animate-bounce">🎡</div>
              <h3 className="font-extrabold text-base text-white">HIGH-ROLLER ROULETTE vs AI BOTS</h3>
              <p className="text-xs text-slate-300">Set target prediction and spin wheel!</p>
            </div>

            <div className="flex justify-center gap-3">
              {['RED 7', 'BLACK 18', 'GREEN 0', 'RED 36'].map(bet => (
                <button
                  key={bet}
                  onClick={() => setRouletteSelectedBet(bet)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all ${
                    rouletteSelectedBet === bet
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-950 text-slate-300 border-slate-800'
                  }`}
                >
                  {bet}
                </button>
              ))}
            </div>

            <button
              onClick={handleSpinRoulette}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-4 rounded-2xl shadow-2xl transition-all"
            >
              🎯 SPIN ROULETTE WHEEL
            </button>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 text-xs text-amber-200 font-mono max-h-28 overflow-y-auto custom-scrollbar">
              {rouletteLog.map((l, idx) => (
                <div key={idx}>{l}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      // GAME 4: COIN FLIP & BOT DUEL
      // ==========================================
      {activeCasinoTab === 'duel' && (
        <div className="space-y-6">
          {/* DUEL ADMIN PANEL */}
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-2 border-rose-400 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex justify-between items-center border-b border-rose-800/60 pb-2">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">
                👑 BOT DUEL OP ADMIN CONTROL PANEL
              </span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-bold">100% VICTORY ENGINE</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setDuelRiggedWin(!duelRiggedWin)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all border ${
                  duelRiggedWin
                    ? 'bg-rose-500 text-white border-rose-300 shadow-lg'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                🪙 Rig Coin Flip Side: {duelRiggedWin ? 'ACTIVE (100% WINS)' : 'OFF'}
              </button>
            </div>
          </div>

          {/* DUEL WORKSPACE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Select Opponent Bot</label>
                <select
                  value={selectedDuelBot}
                  onChange={e => setSelectedDuelBot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs p-3 rounded-xl outline-none"
                >
                  <option value="CryptoWhale_99">🐳 CryptoWhale_99 ($500B Wallet)</option>
                  <option value="DominusCollector_X">👑 DominusCollector_X ($250B Wallet)</option>
                  <option value="Builderman_Official">👷 Builderman_Official ($100B Wallet)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Bet Amount ($ Cash)</label>
                <input
                  type="number"
                  value={duelBet}
                  onChange={e => setDuelBet(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-xs p-3 rounded-xl outline-none"
                />
              </div>
            </div>

            <button
              onClick={handlePlayDuel}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-white font-black text-sm py-4 rounded-2xl shadow-2xl transition-all"
            >
              ⚔️ FLIP COIN & DUEL {selectedDuelBot}
            </button>

            {duelResult && (
              <div className="bg-slate-950 border border-amber-400 p-4 rounded-xl text-center text-xs text-amber-300 font-bold font-mono">
                {duelResult}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CASINO AUDIT LOG */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">ALL-GAMES CASINO TELEMETRY LOG</h4>
        <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar text-xs text-indigo-200 font-mono">
          {casinoAuditLog.map((log, i) => (
            <div key={i} className="border-b border-slate-900 pb-1">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
