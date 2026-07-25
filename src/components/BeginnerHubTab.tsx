import React, { useState } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface BeginnerHubTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
  onUnlockAdmin: () => void;
}

export const BeginnerHubTab: React.FC<BeginnerHubTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
  onUnlockAdmin,
}) => {
  // Beginner Starter State
  const [claimedDailyGrant, setClaimedDailyGrant] = useState<boolean>(false);
  const [starterQuests, setStarterQuests] = useState([
    { id: 'q1', text: 'Click the Starter Cash Generator 5 times', current: 0, target: 5, reward: 5000, completed: false },
    { id: 'q2', text: 'Spin the Beginner Fortune Wheel', completed: false, reward: 25000 },
    { id: 'q3', text: 'Find the Secret Door Sign', completed: false, reward: 100000 },
  ]);

  // Secret Admin Keypad Modal
  const [showKeypadModal, setShowKeypadModal] = useState<boolean>(false);
  const [passcodeAttempt, setPasscodeAttempt] = useState<string>('');
  const [keypadError, setKeypadError] = useState<string>('');

  const handleStarterClick = () => {
    onUpdateBalance(prev => prev + 1000);
    if (soundEnabled) playCoinSound(soundEnabled);

    // Update quest 1
    setStarterQuests(prev => prev.map(q => {
      if (q.id === 'q1' && !q.completed) {
        const nextVal = q.current! + 1;
        const done = nextVal >= q.target!;
        if (done) onUpdateBalance(b => b + q.reward);
        return { ...q, current: nextVal, completed: done };
      }
      return q;
    }));
  };

  const handleClaimDailyGrant = () => {
    if (claimedDailyGrant) return;
    setClaimedDailyGrant(true);
    onUpdateBalance(prev => prev + 50000);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  const handleKeypadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeAttempt === '1234') {
      if (soundEnabled) playJackpotSound(soundEnabled);
      setShowKeypadModal(false);
      setPasscodeAttempt('');
      setKeypadError('');
      onUnlockAdmin();
    } else {
      if (soundEnabled) playTickSound(soundEnabled);
      setKeypadError('❌ INCORRECT PASSCODE! Read the sign that says the code is 1234!');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* BEGINNER WELCOME BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-950 border-2 border-emerald-400 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-4xl shadow-xl border border-emerald-200">
            🌱
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                BEGINNER STARTER HUB & BOOSTER PARK
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/40">
                NOVICE LEVEL 1
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 pt-1">
              Welcome <span className="font-bold text-white">{username}</span>! Claim beginner grants, click the starter cash generator, and complete simple quests.
            </p>
          </div>
        </div>

        {/* SECRET DOOR ACCESS BUTTON */}
        <button
          onClick={() => {
            if (soundEnabled) playTickSound(soundEnabled);
            setShowKeypadModal(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-amber-500/50 hover:border-amber-400 font-black text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 transition-all hover:scale-105"
        >
          <span className="text-lg">🔐</span>
          <span>SECRET ADMIN OVERRIDE DOOR</span>
        </button>
      </div>

      {/* SIGN BOARD DISPLAYING THE CODE EXPLICITLY AS REQUESTED */}
      <div className="bg-gradient-to-r from-amber-950/90 via-yellow-950 to-amber-950 border-2 border-amber-400 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 font-mono">
        <div className="flex items-center space-x-4">
          <span className="text-4xl animate-bounce">🪧</span>
          <div>
            <div className="text-xs font-black text-amber-300 uppercase tracking-widest flex items-center space-x-2">
              <span>NOTICE SIGN BOARD</span>
              <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">IMPORTANT</span>
            </div>
            <p className="text-sm font-extrabold text-white pt-1">
              🔑 SECRET ADMIN DOOR ACCESS CODE: <span className="text-amber-300 underline font-mono text-base bg-amber-950 px-2 py-0.5 rounded border border-amber-500/50">1234</span>
            </p>
            <p className="text-[11px] text-amber-200/70 pt-0.5">
              Click the "Secret Admin Override Door" button above and enter code <b>1234</b> to unlock full OP Admin privileges.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setStarterQuests(prev => prev.map(q => q.id === 'q3' ? { ...q, completed: true } : q));
            onUpdateBalance(prev => prev + 100000);
            if (soundEnabled) playJackpotSound(soundEnabled);
          }}
          className="bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all"
        >
          🎯 READ SIGN (+ $100,000)
        </button>
      </div>

      {/* BEGINNER BOOSTS & GENERATORS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1: STARTER CASH TAPPER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">💵</span>
              <div>
                <h3 className="font-extrabold text-sm text-white">STARTER CASH TAPPER</h3>
                <p className="text-[10px] text-slate-400">+ $1,000 per tap for beginners</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tap the green button to earn instant beginner cash boosts directly into your wallet.
            </p>
          </div>

          <button
            onClick={handleStarterClick}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-xl transition-all hover:scale-102 flex items-center justify-center space-x-2"
          >
            <span>💸 TAP FOR + $1,000 CASH</span>
          </button>
        </div>

        {/* CARD 2: DAILY STARTER GRANT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">🎁</span>
              <div>
                <h3 className="font-extrabold text-sm text-white">NOVICE DAILY GRANT</h3>
                <p className="text-[10px] text-slate-400">One-time + $50,000 beginner bonus</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Claim your starter stipend to fund your initial investments in the Multiverse.
            </p>
          </div>

          <button
            onClick={handleClaimDailyGrant}
            disabled={claimedDailyGrant}
            className={`w-full font-black text-xs py-3.5 rounded-xl shadow-xl transition-all ${
              claimedDailyGrant
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950'
            }`}
          >
            {claimedDailyGrant ? '✅ ALREADY CLAIMED ($50,000)' : '🎁 CLAIM $50,000 STARTER GRANT'}
          </button>
        </div>

        {/* CARD 3: NOVICE QUEST LOG */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <h3 className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-2">
            <span>📜 NOVICE QUEST LOG</span>
          </h3>

          <div className="space-y-2 text-xs font-mono">
            {starterQuests.map(q => (
              <div key={q.id} className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-slate-200 text-[11px] font-bold">{q.text}</div>
                  <div className="text-[9px] text-emerald-400">Reward: +${q.reward.toLocaleString()}</div>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                  q.completed ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {q.completed ? 'COMPLETED' : q.target ? `${q.current}/${q.target}` : 'IN PROGRESS'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECRET ADMIN KEYPAD MODAL */}
      {showKeypadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-amber-400 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-amber-900/60 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🔐</span>
                <div>
                  <h3 className="font-extrabold text-base text-white">SECRET ADMIN OVERRIDE DOOR</h3>
                  <p className="text-[10px] text-amber-300 font-mono">AUTHORIZED PERSONNEL ONLY</p>
                </div>
              </div>
              <button
                onClick={() => setShowKeypadModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-xl text-center text-xs text-amber-200 font-mono">
              <p className="font-bold">🪧 SIGN REMINDER:</p>
              <p className="text-amber-300 text-sm font-black pt-0.5">THE CODE TO ENTER IS 1234</p>
            </div>

            <form onSubmit={handleKeypadSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Enter 4-Digit Secret Passcode</label>
                <input
                  type="password"
                  maxLength={4}
                  value={passcodeAttempt}
                  onChange={e => setPasscodeAttempt(e.target.value)}
                  placeholder="1234"
                  autoFocus
                  className="w-full bg-slate-900 border-2 border-amber-500/50 text-amber-300 font-mono text-center text-2xl font-black tracking-widest py-3 rounded-xl outline-none focus:border-amber-400"
                />
              </div>

              {keypadError && (
                <p className="text-xs text-rose-400 font-bold text-center font-mono">{keypadError}</p>
              )}

              <div className="flex gap-2">
                {['1', '2', '3', '4'].map(digit => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => setPasscodeAttempt(prev => (prev + digit).slice(0, 4))}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-black py-2.5 rounded-xl text-sm transition-all"
                  >
                    {digit}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-xl transition-all"
              >
                🔓 UNLOCK OP ADMIN PANEL (CODE: 1234)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
