import React, { useState } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

interface TargetAccount {
  id: string;
  username: string;
  avatar: string;
  balance: number;
  vipRank: string;
  status: 'ONLINE' | 'FROZEN' | 'SHADOWBANNED' | 'LOCKED';
  title: string;
  lastActive: string;
}

interface AccountControlTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  currentUser: string;
}

export const AccountControlTab: React.FC<AccountControlTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  currentUser,
}) => {
  const [accounts, setAccounts] = useState<TargetAccount[]>([
    { id: 'acc-1', username: 'CryptoWhale_88', avatar: '👑', balance: 85000000000, vipRank: 'SOVEREIGN VIP', status: 'ONLINE', title: 'Multiverse Billionaire', lastActive: 'Just now' },
    { id: 'acc-2', username: 'LuckyWinner99', avatar: '🎰', balance: 142000000, vipRank: 'GOLD VIP', status: 'ONLINE', title: 'Jackpot Master', lastActive: '1m ago' },
    { id: 'acc-3', username: 'ServerAdminBot', avatar: '🤖', balance: 999000000000, vipRank: 'SYSTEM OVERLORD', status: 'ONLINE', title: 'Automated Sentinel', lastActive: 'Active' },
    { id: 'acc-4', username: 'Rookie_Trader', avatar: '🌱', balance: 5000, vipRank: 'STANDARD', status: 'ONLINE', title: 'Novice Clicker', lastActive: '5m ago' },
    { id: 'acc-5', username: 'Shadow_Rival', avatar: '🥷', balance: 4500000000, vipRank: 'PLATINUM VIP', status: 'ONLINE', title: 'Darkpool Speculator', lastActive: 'Just now' },
  ]);

  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc-1');
  const [customTargetInput, setCustomTargetInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('SovereignPwned123');
  const [newAvatarInput, setNewAvatarInput] = useState<string>('🤡');
  const [newTitleInput, setNewTitleInput] = useState<string>('Sovereign Slave');

  const [controlLog, setControlLog] = useState<string[]>([
    '🌐 Account Takeover & Remote Control Network Online.',
    '⚡ Connected to Central Sovereign User Database.'
  ]);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0];

  const handleAddCustomTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTargetInput.trim()) return;
    const newAcc: TargetAccount = {
      id: `acc-${Date.now()}`,
      username: customTargetInput.trim(),
      avatar: '👤',
      balance: Math.floor(Math.random() * 1000000000) + 10000,
      vipRank: 'TARGETED USER',
      status: 'ONLINE',
      title: 'Targeted Network Player',
      lastActive: 'Just now'
    };

    setAccounts(prev => [newAcc, ...prev]);
    setSelectedAccountId(newAcc.id);
    setCustomTargetInput('');
    if (soundEnabled) playTickSound(soundEnabled);
    setControlLog(prev => [`🎯 TARGET ADDED: Added account '${newAcc.username}' to Remote Hack Console!`, ...prev]);
  };

  // 1. Siphon Balance
  const handleSiphonBalance = () => {
    if (selectedAccount.balance <= 0) {
      setControlLog(prev => [`⚠️ Target '${selectedAccount.username}' has $0 balance to siphon!`, ...prev]);
      return;
    }

    const stolen = selectedAccount.balance;
    onUpdateBalance(prev => prev + stolen);
    setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? { ...a, balance: 0 } : a));
    if (soundEnabled) playJackpotSound(soundEnabled);
    setControlLog(prev => [
      `💰 REMOTE BALANCE SIPHON: Stole +$${stolen.toLocaleString()} from '${selectedAccount.username}' and credited to ${currentUser}'s wallet!`,
      ...prev
    ]);
  };

  // 2. Inject Cash
  const handleInjectCash = (amount: number) => {
    setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? { ...a, balance: a.balance + amount } : a));
    if (soundEnabled) playCoinSound(soundEnabled);
    setControlLog(prev => [
      `💵 REMOTE CASH INJECTION: Injected +$${amount.toLocaleString()} into '${selectedAccount.username}' account balance.`,
      ...prev
    ]);
  };

  // 3. Freeze/Lock Account
  const handleToggleFreeze = () => {
    const nextStatus = selectedAccount.status === 'FROZEN' ? 'ONLINE' : 'FROZEN';
    setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? { ...a, status: nextStatus } : a));
    if (soundEnabled) playTickSound(soundEnabled);
    setControlLog(prev => [
      `🔒 REMOTE ACCOUNT FREEZE: Set status of '${selectedAccount.username}' to ${nextStatus}!`,
      ...prev
    ]);
  };

  // 4. Force Password Override
  const handleOverridePassword = () => {
    if (soundEnabled) playJackpotSound(soundEnabled);
    setControlLog(prev => [
      `🔑 PASSWORD OVERRIDE SUCCESS: Changed login password for '${selectedAccount.username}' to '${newPasswordInput}'! Target locked out!`,
      ...prev
    ]);
  };

  // 5. Force Avatar & Title Change
  const handleModifyProfile = () => {
    setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? {
      ...a,
      avatar: newAvatarInput || a.avatar,
      title: newTitleInput || a.title
    } : a));
    if (soundEnabled) playTickSound(soundEnabled);
    setControlLog(prev => [
      `🎭 PROFILE REWRITE: Changed avatar of '${selectedAccount.username}' to ${newAvatarInput} and Title to '${newTitleInput}'!`,
      ...prev
    ]);
  };

  // 6. Shadowban to Negative Void
  const handleShadowbanVoid = () => {
    setAccounts(prev => prev.map(a => a.id === selectedAccount.id ? {
      ...a,
      status: 'SHADOWBANNED',
      balance: -999999999999,
      title: 'BANISHED TO VOID'
    } : a));
    if (soundEnabled) playJackpotSound(soundEnabled);
    setControlLog(prev => [
      `🚫 VOID EXILE: Shadowbanned '${selectedAccount.username}' and set balance to -$999,999,999,999!`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 border-2 border-purple-500/50 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg border border-purple-200">
            🕵️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                REMOTE ACCOUNT TAKEOVER & CONTROL CENTER
              </h2>
              <span className="bg-purple-500/20 text-purple-300 text-xs font-black px-3 py-1 rounded-full border border-purple-500/40 animate-pulse">
                CENTRAL OVERLORD ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-300 pt-1">
              Select any player or bot account on the network to siphon balance, lock credentials, override passwords, or banish them!
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-400 uppercase">ACCOUNTS ON NETWORK</div>
          <div className="text-xl font-black text-purple-300">{accounts.length} Target Accounts</div>
        </div>
      </div>

      {/* TARGET SELECTION & ADD CUSTOM TARGET */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ACCOUNTS LIST */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <h3 className="font-black text-xs text-white uppercase tracking-wider border-b border-slate-800 pb-2">
            👤 SELECT TARGET PLAYER ACCOUNT
          </h3>

          <form onSubmit={handleAddCustomTarget} className="flex gap-2">
            <input
              type="text"
              value={customTargetInput}
              onChange={e => setCustomTargetInput(e.target.value)}
              placeholder="Target username..."
              className="flex-1 bg-slate-950 border border-slate-700 text-xs text-white px-3 py-2 rounded-xl outline-none"
            />
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-2 rounded-xl"
            >
              ➕ TARGET
            </button>
          </form>

          <div className="space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
            {accounts.map(acc => {
              const isSelected = acc.id === selectedAccountId;
              return (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-950/80 border-purple-400 ring-2 ring-purple-400/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{acc.avatar}</span>
                    <div>
                      <div className="font-extrabold text-xs text-white">{acc.username}</div>
                      <div className="text-[10px] text-purple-300 font-mono">{acc.vipRank}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-black text-emerald-400">${acc.balance.toLocaleString()}</div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      acc.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                    }`}>
                      {acc.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE TARGET CONTROL PANEL */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-purple-500/40 flex items-center justify-center text-4xl shadow-inner">
                {selectedAccount.avatar}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center space-x-2">
                  <span>{selectedAccount.username}</span>
                  <span className="text-xs font-normal text-slate-400">({selectedAccount.id})</span>
                </h3>
                <p className="text-xs text-purple-300 font-mono">Title: {selectedAccount.title} • Rank: {selectedAccount.vipRank}</p>
                <p className="text-xs font-mono font-bold text-emerald-400">Account Balance: ${selectedAccount.balance.toLocaleString()}</p>
              </div>
            </div>

            <span className={`text-xs font-black px-3 py-1 rounded-full border ${
              selectedAccount.status === 'ONLINE'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              STATUS: {selectedAccount.status}
            </span>
          </div>

          {/* CONTROL ACTIONS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ACTION 1: SIPHON BALANCE */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">💰 BALANCE SIPHON</h4>
              <p className="text-[10px] text-slate-400">Drain 100% of target account's balance directly into your wallet.</p>
              <button
                onClick={handleSiphonBalance}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs py-2.5 rounded-lg shadow transition-all"
              >
                💸 SIPHON ALL CASH (${selectedAccount.balance.toLocaleString()})
              </button>
            </div>

            {/* ACTION 2: CASH INJECTION */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider">💵 REMOTE CASH INJECTION</h4>
              <p className="text-[10px] text-slate-400">Inject funds directly into target account's wallet.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleInjectCash(1000000000)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2 rounded-lg"
                >
                  +$1B
                </button>
                <button
                  onClick={() => handleInjectCash(100000000000)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs py-2 rounded-lg"
                >
                  +$100B
                </button>
              </div>
            </div>

            {/* ACTION 3: FREEZE / UNFREEZE */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider">🔒 FREEZE ACCOUNT UI</h4>
              <p className="text-[10px] text-slate-400">Lock target player from clicking or placing bets on the network.</p>
              <button
                onClick={handleToggleFreeze}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs py-2.5 rounded-lg transition-all"
              >
                {selectedAccount.status === 'FROZEN' ? '🔓 UNFREEZE ACCOUNT' : '🔒 LOCK & FREEZE ACCOUNT'}
              </button>
            </div>

            {/* ACTION 4: SHADOWBAN VOID */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-wider">🚫 SHADOWBAN TO NEGATIVE VOID</h4>
              <p className="text-[10px] text-slate-400">Banish user to the negative void with -$999B balance.</p>
              <button
                onClick={handleShadowbanVoid}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs py-2.5 rounded-lg transition-all"
              >
                💥 SHADOWBAN & VOID
              </button>
            </div>

          </div>

          {/* ADVANCED PROFILE OVERRIDE FORM */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <h4 className="text-xs font-black text-purple-300 uppercase tracking-wider">🔑 REMOTE CREDENTIALS & PROFILE OVERRIDE</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">New Password Override</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPasswordInput}
                    onChange={e => setNewPasswordInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs text-amber-300 font-mono px-3 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleOverridePassword}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-2 rounded-lg"
                  >
                    OVERRIDE
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">New Avatar & Title Badge</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAvatarInput}
                    onChange={e => setNewAvatarInput(e.target.value)}
                    placeholder="🤡"
                    className="w-12 bg-slate-900 border border-slate-700 text-center text-xs text-white px-2 py-2 rounded-lg"
                  />
                  <input
                    type="text"
                    value={newTitleInput}
                    onChange={e => setNewTitleInput(e.target.value)}
                    placeholder="Title..."
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2 rounded-lg"
                  />
                  <button
                    onClick={handleModifyProfile}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-2 rounded-lg"
                  >
                    REWRITE
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CONTROL LOG */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1 font-mono text-[11px]">
            <h5 className="text-[10px] text-slate-400 font-bold uppercase">REMOTE AUDIT COMMAND LOG</h5>
            <div className="space-y-1 max-h-28 overflow-y-auto custom-scrollbar text-purple-200">
              {controlLog.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
