/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

export interface UserProfile {
  name: string;
  avatar: string; // Emoji or image URL
  avatarType: 'emoji' | 'url';
  title: string;
  titleColor: 'amber' | 'emerald' | 'cyan' | 'rose' | 'purple' | 'yellow';
  cardTheme: 'obsidian' | 'gold' | 'neon' | 'cyber' | 'matrix' | 'roseGold';
  bio: string;
  vipLevel: number;
  vipXp: number;
  luckyWhiteBalls: number[];
  luckyPowerball: number;
  badges: string[];
  autoSyncTicket: boolean;
  autoSyncBiddingName: boolean;
}

interface UserProfileSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  cheatBalance: number;
  soundEnabled: boolean;
  onSyncLuckyNumbersToTicket?: (white: number[], pb: number) => void;
}

const PRESET_AVATARS = [
  '👑', '⚡', '🏎️', '🐋', '🏆', '💎', '🐉', '🤖',
  '🦄', '🦸', '🚀', '🕹️', '🌟', '🎩', '🦁', '🔥'
];

const PRESET_TITLES = [
  '👑 Sovereign Overlord',
  '💸 High Roller Syndicate',
  '⚛️ Quantum Mastermind',
  '⚡ Cyber Net-Hacker',
  '🏆 Grand Champion',
  '🎲 RNG Deity',
  '🚀 Trillionaire Visionary',
  '🎮 Pro Gaming Legend',
  '🔨 Auction House Monopoly',
  '🪙 Coin Toss Billionaire',
  '🛡️ Apex Predator'
];

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  profile,
  onUpdateProfile,
  cheatBalance,
  soundEnabled,
  onSyncLuckyNumbersToTicket,
}) => {
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<boolean>(false);

  // Sync state if props change externally
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);

  const handleFieldChange = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    const updated = { ...localProfile, [field]: value };
    setLocalProfile(updated);
    onUpdateProfile(updated);
  };

  const handleSaveProfile = () => {
    onUpdateProfile(localProfile);
    setSaveSuccessMsg(true);
    if (soundEnabled) playJackpotSound(soundEnabled);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  const handleClaimVipXp = () => {
    const newXp = localProfile.vipXp + 250;
    let newLevel = localProfile.vipLevel;
    const xpNeeded = newLevel * 500;

    if (newXp >= xpNeeded) {
      newLevel += 1;
      if (soundEnabled) playJackpotSound(soundEnabled);
    } else if (soundEnabled) {
      playCoinSound(soundEnabled);
    }

    handleFieldChange('vipXp', newXp);
    handleFieldChange('vipLevel', newLevel);
  };

  const handleLuckyBallChange = (index: number, val: number) => {
    const clamped = Math.max(1, Math.min(69, val || 1));
    const newWhite = [...localProfile.luckyWhiteBalls];
    newWhite[index] = clamped;
    handleFieldChange('luckyWhiteBalls', newWhite);
  };

  const handleLuckyPbChange = (val: number) => {
    const clamped = Math.max(1, Math.min(26, val || 1));
    handleFieldChange('luckyPowerball', clamped);
  };

  const titleColorClasses = {
    amber: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    emerald: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    cyan: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    rose: 'text-rose-400 border-rose-500/40 bg-rose-500/10',
    purple: 'text-purple-400 border-purple-500/40 bg-purple-500/10',
    yellow: 'text-yellow-300 border-yellow-500/40 bg-yellow-500/10',
  };

  const cardThemeClasses = {
    obsidian: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-800',
    gold: 'bg-gradient-to-br from-amber-950/80 via-yellow-950/60 to-slate-900 border-amber-500/40',
    neon: 'bg-gradient-to-br from-cyan-950/80 via-slate-900 to-purple-950/80 border-cyan-500/40',
    cyber: 'bg-gradient-to-br from-purple-950/80 via-slate-900 to-pink-950/80 border-purple-500/40',
    matrix: 'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border-emerald-500/40',
    roseGold: 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-amber-950/80 border-rose-500/40',
  };

  return (
    <div className="space-y-6">
      {/* Save Toast Notification */}
      {saveSuccessMsg && (
        <div className="bg-emerald-500 text-slate-950 font-black p-3.5 rounded-xl text-center shadow-2xl animate-bounce flex items-center justify-center space-x-2">
          <span>✨</span>
          <span>PROFILE SETTINGS & CUSTOMIZATIONS SAVED SUCCESSFULLY!</span>
        </div>
      )}

      {/* Top Profile Card Showcase Preview */}
      <div className={`p-6 rounded-2xl border shadow-2xl space-y-4 transition-all ${cardThemeClasses[localProfile.cardTheme]}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Avatar Circle */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-amber-400/80 flex items-center justify-center text-4xl shadow-xl overflow-hidden shrink-0">
                {localProfile.avatarType === 'url' && localProfile.avatar.startsWith('http') ? (
                  <img src={localProfile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{localProfile.avatar}</span>
                )}
              </div>
              <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-900 shadow">
                VIP {localProfile.vipLevel}
              </span>
            </div>

            {/* Profile Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">{localProfile.name || 'Unnamed Player'}</h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${titleColorClasses[localProfile.titleColor]}`}>
                  {localProfile.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 italic max-w-lg">"{localProfile.bio || 'No bio specified yet.'}"</p>
              
              <div className="flex items-center space-x-4 pt-1 text-xs font-mono text-slate-300">
                <span>💰 Cheat Balance: <strong className="text-emerald-400">${cheatBalance.toLocaleString()}</strong></span>
                <span>⭐ Prestige: <strong className="text-amber-400">Level {localProfile.vipLevel}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={handleClaimVipXp}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all shrink-0"
          >
            <span>🎁</span>
            <span>Claim +250 Daily VIP XP</span>
          </button>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>VIP Prestige XP Level {localProfile.vipLevel}</span>
            <span>{localProfile.vipXp} / {localProfile.vipLevel * 500} XP</span>
          </div>
          <div className="w-full bg-slate-900/90 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (localProfile.vipXp / (localProfile.vipLevel * 500)) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Identity & Customization */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <span className="text-xl">👤</span>
            <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">Player Identity & Customization</h2>
          </div>

          {/* Player Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Player Display Name</label>
            <input
              type="text"
              value={localProfile.name}
              onChange={e => handleFieldChange('name', e.target.value)}
              placeholder="Enter your player name..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            />
            <p className="text-[10px] text-slate-400">Appears across Bidding Game, Leaderboards, and Log Feeds.</p>
          </div>

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">Choose Profile Emoji Avatar</label>
            <div className="grid grid-cols-8 gap-1.5">
              {PRESET_AVATARS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    handleFieldChange('avatar', emoji);
                    handleFieldChange('avatarType', 'emoji');
                    if (soundEnabled) playTickSound(soundEnabled);
                  }}
                  className={`w-9 h-9 rounded-lg border flex items-center justify-center text-lg transition-all ${
                    localProfile.avatarType === 'emoji' && localProfile.avatar === emoji
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-110'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Image Avatar URL */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-bold text-slate-300">Or Custom Avatar Image URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customAvatarUrl}
                onChange={e => setCustomAvatarUrl(e.target.value)}
                placeholder="https://example.com/my-avatar.png"
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                onClick={() => {
                  if (customAvatarUrl) {
                    handleFieldChange('avatar', customAvatarUrl);
                    handleFieldChange('avatarType', 'url');
                    if (soundEnabled) playCoinSound(soundEnabled);
                  }
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Player Title Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Select Player Title / Badge</label>
            <select
              value={localProfile.title}
              onChange={e => handleFieldChange('title', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            >
              {PRESET_TITLES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Title Color Picker */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Title Accent Color</label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { id: 'amber', name: 'Gold', bg: 'bg-amber-500' },
                { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
                { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500' },
                { id: 'rose', name: 'Rose', bg: 'bg-rose-500' },
                { id: 'purple', name: 'Purple', bg: 'bg-purple-500' },
                { id: 'yellow', name: 'Yellow', bg: 'bg-yellow-400' },
              ].map(color => (
                <button
                  key={color.id}
                  onClick={() => handleFieldChange('titleColor', color.id as any)}
                  className={`py-1.5 rounded-lg border text-[10px] font-bold text-slate-950 flex flex-col items-center gap-1 transition-all ${
                    localProfile.titleColor === color.id ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                  } ${color.bg}`}
                >
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bio / Quote */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Player Bio / Status Quote</label>
            <textarea
              value={localProfile.bio}
              onChange={e => handleFieldChange('bio', e.target.value)}
              rows={2}
              placeholder="Write a custom bio or tagline..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>
        </div>

        {/* Section 2: Card Themes & Lucky Numbers & Syncing */}
        <div className="space-y-4">
          {/* Card Visual Theme Selection */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <span className="text-xl">🎨</span>
              <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">Profile Card Background Theme</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'obsidian', label: 'Cosmic Obsidian', icon: '🌌' },
                { id: 'gold', label: 'Sovereign Gold', icon: '🧈' },
                { id: 'neon', label: 'Holographic Cyber', icon: '⚡' },
                { id: 'cyber', label: 'Synthwave Purple', icon: '👾' },
                { id: 'matrix', label: 'Emerald Matrix', icon: '🟢' },
                { id: 'roseGold', label: 'Rose Gold Luxury', icon: '🌸' },
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleFieldChange('cardTheme', theme.id as any)}
                  className={`p-2 rounded-lg border text-xs font-bold text-left flex items-center space-x-1.5 transition-all ${
                    localProfile.cardTheme === theme.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{theme.icon}</span>
                  <span className="truncate">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Favorite Lucky Numbers Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎰</span>
                <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">Favorite Lucky Numbers</h2>
              </div>

              {onSyncLuckyNumbersToTicket && (
                <button
                  onClick={() => {
                    onSyncLuckyNumbersToTicket(localProfile.luckyWhiteBalls, localProfile.luckyPowerball);
                    if (soundEnabled) playCoinSound(soundEnabled);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow transition-all"
                >
                  Sync to Ticket Pick
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">5 Lucky White Balls (1 to 69)</label>
              <div className="flex items-center gap-2">
                {localProfile.luckyWhiteBalls.map((val, idx) => (
                  <input
                    key={idx}
                    type="number"
                    min={1}
                    max={69}
                    value={val}
                    onChange={e => handleLuckyBallChange(idx, parseInt(e.target.value))}
                    className="w-11 h-10 bg-slate-950 border border-slate-700/80 rounded-lg text-center text-sm font-extrabold font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">1 Lucky Red Powerball (1 to 26)</label>
              <input
                type="number"
                min={1}
                max={26}
                value={localProfile.luckyPowerball}
                onChange={e => handleLuckyPbChange(parseInt(e.target.value))}
                className="w-14 h-10 bg-slate-950 border border-rose-500/40 rounded-lg text-center text-sm font-extrabold font-mono text-rose-400 focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          {/* Synergy Auto-Sync Toggles */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              <span className="text-xl">🔄</span>
              <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">Cross-Game Sync Preferences</h2>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">Auto-Sync Name to Bidding War</p>
                  <p className="text-[10px] text-slate-400">Use player handle in high-stakes auction hall</p>
                </div>
                <button
                  onClick={() => handleFieldChange('autoSyncBiddingName', !localProfile.autoSyncBiddingName)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    localProfile.autoSyncBiddingName ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {localProfile.autoSyncBiddingName ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">Auto-Sync Lucky Numbers to Play Ticket</p>
                  <p className="text-[10px] text-slate-400">Keep ticket sync active across simulator resets</p>
                </div>
                <button
                  onClick={() => handleFieldChange('autoSyncTicket', !localProfile.autoSyncTicket)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    localProfile.autoSyncTicket ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {localProfile.autoSyncTicket ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Changes take effect instantly and persist across game tabs.
        </div>
        <button
          onClick={handleSaveProfile}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all"
        >
          <span>💾</span>
          <span>Save Profile Changes</span>
        </button>
      </div>
    </div>
  );
};
