import React, { useState } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface CasinoRoyaleTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

export const CasinoRoyaleTab: React.FC<CasinoRoyaleTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
}) => {
  // Blackjack & Casino State
  const [betAmount, setBetAmount] = useState<string>('1000000000'); // $1B default bet
  const [opAlwaysWinCheat, setOpAlwaysWinCheat] = useState<boolean>(true);
  const [gameLog, setGameLog] = useState<string[]>([
    '🎰 Welcome to Sovereign Casino Royale & High-Roller VIP Lounge!',
    '👑 OP Admin Rigging System Active: Always Win Cheat is ON.'
  ]);

  // High-Low Card Game State
  const [currentCardVal, setCurrentCardVal] = useState<number>(7);
  const [streakCount, setStreakCount] = useState<number>(0);

  // Wheel Spin State
  const [isSpinningWheel, setIsSpinningWheel] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);

  const handlePlayBlackjack = () => {
    const bet = parseFloat(betAmount) || 0;
    if (bet <= 0) return;
    if (bet > currentBalance) {
      setGameLog(prev => [`⚠️ Bet failed: Insufficient wallet balance!`, ...prev]);
      return;
    }

    if (opAlwaysWinCheat) {
      // Guaranteed 21 Blackjack
      const winPayout = bet * 3;
      onUpdateBalance(prev => prev + winPayout);
      if (soundEnabled) playJackpotSound(soundEnabled);
      setGameLog(prev => [
        `🎉 BLACKJACK 21! Player ${username} hit 21! Won +$${winPayout.toLocaleString()} (3x Multiplier)!`,
        ...prev
      ]);
    } else {
      const isWin = Math.random() > 0.4;
      if (isWin) {
        const winPayout = bet * 2;
        onUpdateBalance(prev => prev + winPayout);
        if (soundEnabled) playCoinSound(soundEnabled);
        setGameLog(prev => [`✅ WON DEALER: Player beat dealer! Won +$${winPayout.toLocaleString()}`, ...prev]);
      } else {
        onUpdateBalance(prev => prev - bet);
        if (soundEnabled) playTickSound(soundEnabled);
        setGameLog(prev => [`❌ DEALER WON: Lost -$${bet.toLocaleString()} bet. Enable OP Always Win cheat to never lose!`, ...prev]);
      }
    }
  };

  const handleHighLowBet = (prediction: 'HIGHER' | 'LOWER') => {
    const nextCard = opAlwaysWinCheat
      ? (prediction === 'HIGHER' ? Math.min(13, currentCardVal + Math.floor(Math.random() * 5) + 1) : Math.max(1, currentCardVal - Math.floor(Math.random() * 5) - 1))
      : Math.floor(Math.random() * 13) + 1;

    const isCorrect = prediction === 'HIGHER' ? nextCard >= currentCardVal : nextCard <= currentCardVal;
    setCurrentCardVal(nextCard);

    if (isCorrect || opAlwaysWinCheat) {
      const reward = 5000000000 * (streakCount + 1); // $5B base
      setStreakCount(prev => prev + 1);
      onUpdateBalance(prev => prev + reward);
      if (soundEnabled) playJackpotSound(soundEnabled);
      setGameLog(prev => [`🃏 HIGH-LOW WIN: Card was ${nextCard}! Streak ${streakCount + 1}x! Won +$${reward.toLocaleString()}`, ...prev]);
    } else {
      setStreakCount(0);
      if (soundEnabled) playTickSound(soundEnabled);
      setGameLog(prev => [`💔 HIGH-LOW LOSS: Card was ${nextCard}. Streak reset!`, ...prev]);
    }
  };

  const handleSpinWheel = () => {
    if (isSpinningWheel) return;
    setIsSpinningWheel(true);
    const spins = 1440 + Math.floor(Math.random() * 360);
    setWheelRotation(prev => prev + spins);
    if (soundEnabled) playTickSound(soundEnabled);

    setTimeout(() => {
      setIsSpinningWheel(false);
      const jackpotReward = opAlwaysWinCheat ? 1000000000000 : 50000000000; // $1 Trillion if rigged
      onUpdateBalance(prev => prev + jackpotReward);
      if (soundEnabled) playJackpotSound(soundEnabled);
      setGameLog(prev => [
        `🎡 WHEEL OF FORTUNE JACKPOT! Wheel landed on TOP MULTIPLIER! Payout: +$${jackpotReward.toLocaleString()}!`,
        ...prev
      ]);
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-mono">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center text-3xl shadow-lg border border-amber-200">
            🎰
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                SOVEREIGN CASINO ROYALE & VIP LOUNGE
              </h2>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-500/40">
                HIGH-ROLLER VIP
              </span>
            </div>
            <p className="text-xs text-amber-200/80 pt-1">
              High-stakes Blackjack, High-Low card predictor, and Wheel of Fortune with OP Admin rigging controls!
            </p>
          </div>
        </div>

        {/* OP ADMIN RIGGING TOGGLE */}
        <button
          onClick={() => {
            setOpAlwaysWinCheat(prev => !prev);
            if (soundEnabled) playTickSound(soundEnabled);
          }}
          className={`font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition-all border flex items-center space-x-2 ${
            opAlwaysWinCheat
              ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50'
              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <span>👑 OP ALWAYS WIN CHEAT:</span>
          <span className="underline uppercase">{opAlwaysWinCheat ? 'ACTIVE (100% WINS)' : 'OFF (NORMAL)'}</span>
        </button>
      </div>

      {/* GAMES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* GAME 1: HIGH-STAKES BLACKJACK */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🃏</span>
                <h3 className="font-extrabold text-sm text-white">HIGH-STAKES BLACKJACK 21</h3>
              </div>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                3X PAYOUT
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Bet Amount ($ Cash)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={e => setBetAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-sm px-3 py-2 rounded-xl"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                <div className="text-[10px] text-slate-400">YOUR HAND</div>
                <div className="text-2xl font-black text-emerald-400 pt-1">
                  {opAlwaysWinCheat ? '🂡 🂮 (BLACKJACK 21)' : '🂱 🂺 (20)'}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlayBlackjack}
            className="w-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-xl transition-all"
          >
            🎰 DEAL & PLAY BLACKJACK
          </button>
        </div>

        {/* GAME 2: HIGH-LOW CARD PREDICTOR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🎴</span>
                <h3 className="font-extrabold text-sm text-white">HIGH-LOW CARD PREDICTOR</h3>
              </div>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                STREAK: {streakCount}X
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-center space-y-2">
              <div className="text-[10px] text-slate-400 uppercase">CURRENT CARD VALUE</div>
              <div className="text-4xl font-black text-amber-300">
                {currentCardVal === 1 ? 'A (1)' : currentCardVal === 11 ? 'J (11)' : currentCardVal === 12 ? 'Q (12)' : currentCardVal === 13 ? 'K (13)' : currentCardVal}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleHighLowBet('HIGHER')}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg transition-all"
            >
              ⬆️ HIGHER
            </button>
            <button
              onClick={() => handleHighLowBet('LOWER')}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition-all"
            >
              ⬇️ LOWER
            </button>
          </div>
        </div>

        {/* GAME 3: WHEEL OF FORTUNE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-3xl">🎡</span>
                <h3 className="font-extrabold text-sm text-white">WHEEL OF FORTUNE</h3>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                $1 TRILLION MAX
              </span>
            </div>

            <div className="flex justify-center my-2">
              <div
                className="w-24 h-24 rounded-full border-4 border-amber-400 bg-gradient-to-tr from-purple-600 via-amber-500 to-emerald-500 flex items-center justify-center text-3xl shadow-xl transition-transform duration-[2000ms] ease-out"
                style={{ transform: `rotate(${wheelRotation}deg)` }}
              >
                🎯
              </div>
            </div>
          </div>

          <button
            onClick={handleSpinWheel}
            disabled={isSpinningWheel}
            className="w-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white font-black text-xs py-3.5 rounded-xl shadow-xl transition-all"
          >
            {isSpinningWheel ? '🌀 SPINNING WHEEL...' : '🎡 SPIN WHEEL OF FORTUNE'}
          </button>
        </div>

      </div>

      {/* CASINO LOG */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">LIVE CASINO AUDIT LOG</h4>
        <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar text-xs text-amber-200/90">
          {gameLog.map((log, i) => (
            <div key={i} className="border-b border-slate-900 pb-1">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
