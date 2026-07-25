/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { ParallelPlayer } from '../types';
import { UserProfile } from './UserProfileSettings';

export interface GlobalLeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  totalEarnings: number;
  vipLevel: number;
  vipBadge: string;
  simulationType: string;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  players: ParallelPlayer[];
  multiSessionCount: number;
  onUpdateSessionCount: (count: number) => void;
  activeStrategy: string;
  userProfile?: UserProfile;
  userEarnings?: number;
}

const DEFAULT_GLOBAL_HIGH_ROLLERS = [
  {
    id: 'g-1',
    username: 'CryptoWhale_Alpha',
    avatar: '🐳',
    totalEarnings: 85400000000,
    vipLevel: 9,
    vipBadge: '👑 VIP 9 (Imperial)',
    simulationType: 'Powerball & Quantum',
  },
  {
    id: 'g-2',
    username: 'Titan_Simulator_X',
    avatar: '🤖',
    totalEarnings: 62100000000,
    vipLevel: 8,
    vipBadge: '💎 VIP 8 (Diamond)',
    simulationType: 'Colosseum Deathmatch',
  },
  {
    id: 'g-3',
    username: 'Apex_Laborer_99',
    avatar: '🥷',
    totalEarnings: 48500000000,
    vipLevel: 7,
    vipBadge: '💎 VIP 7 (Diamond)',
    simulationType: 'Forced Labor Mines',
  },
  {
    id: 'g-4',
    username: 'Quantum_Printer_007',
    avatar: '🖨️',
    totalEarnings: 31200000000,
    vipLevel: 6,
    vipBadge: '🏰 VIP 6 (Gold)',
    simulationType: 'Bidding War Engine',
  },
  {
    id: 'g-5',
    username: 'GigaChad_Subject',
    avatar: '🦁',
    totalEarnings: 19800000000,
    vipLevel: 5,
    vipBadge: '🏰 VIP 5 (Gold)',
    simulationType: 'Monte Carlo Sweep',
  },
  {
    id: 'g-6',
    username: 'Gold_Digger_Alpha',
    avatar: '💰',
    totalEarnings: 12400000000,
    vipLevel: 4,
    vipBadge: '🏛️ VIP 4 (Silver)',
    simulationType: 'Casino Royale VIP',
  },
  {
    id: 'g-7',
    username: 'Spartan_Slave_77',
    avatar: '⚔️',
    totalEarnings: 7800000000,
    vipLevel: 3,
    vipBadge: '🏛️ VIP 3 (Silver)',
    simulationType: 'Throw A Coin Physics',
  },
  {
    id: 'g-8',
    username: 'Hyper_Builder_33',
    avatar: '🔨',
    totalEarnings: 3500000000,
    vipLevel: 2,
    vipBadge: '🏠 VIP 2 (Bronze)',
    simulationType: 'Bot Automation',
  },
  {
    id: 'g-9',
    username: 'NoobWorker_2026',
    avatar: '👶',
    totalEarnings: 1200000000,
    vipLevel: 1,
    vipBadge: '🏠 VIP 1 (Bronze)',
    simulationType: 'Beginner Starter Hub',
  },
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  multiSessionCount,
  onUpdateSessionCount,
  activeStrategy,
  userProfile,
  userEarnings = 150000000000,
}) => {
  const [activeTab, setActiveTab] = useState<'global' | 'parallel'>('global');

  // Compute Current User VIP Badge Title
  const userVipLevel = userProfile?.vipLevel ?? 10;
  const userVipBadge = useMemo(() => {
    if (userVipLevel >= 10) return `👑 VIP ${userVipLevel} (Sovereign Overlord)`;
    if (userVipLevel >= 8) return `💎 VIP ${userVipLevel} (Diamond Elite)`;
    if (userVipLevel >= 5) return `🏰 VIP ${userVipLevel} (Gold Champion)`;
    if (userVipLevel >= 3) return `🏛️ VIP ${userVipLevel} (Silver Veteran)`;
    return `🏠 VIP ${userVipLevel} (Bronze Novice)`;
  }, [userVipLevel]);

  // Global Top 10 Players across all simulations
  const top10GlobalPlayers = useMemo<GlobalLeaderboardEntry[]>(() => {
    const userEntry = {
      id: 'current-user-node',
      username: userProfile?.name || 'Ben (You)',
      avatar: userProfile?.avatar || '👑',
      totalEarnings: userEarnings,
      vipLevel: userVipLevel,
      vipBadge: userVipBadge,
      simulationType: 'All Active Simulations',
      isCurrentUser: true,
    };

    // Combine simulated top high rollers with active player
    const combined = [userEntry, ...DEFAULT_GLOBAL_HIGH_ROLLERS];

    // Add top parallel session bot if earnings high
    if (players && players.length > 0) {
      const topBot = [...players].sort((a, b) => b.totalWon - a.totalWon)[0];
      if (topBot && topBot.totalWon > 0) {
        combined.push({
          id: 'parallel-bot-top',
          username: `Bot_${topBot.name}`,
          avatar: '🤖',
          totalEarnings: topBot.totalWon,
          vipLevel: Math.min(10, Math.floor(topBot.totalWon / 1000000) + 1),
          vipBadge: `🤖 Bot VIP ${Math.min(10, Math.floor(topBot.totalWon / 1000000) + 1)}`,
          simulationType: 'Parallel Bot Thread',
          isCurrentUser: false,
        });
      }
    }

    // Sort by Total Earnings Descending
    combined.sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Assign Ranks and Slice Top 10
    return combined.slice(0, 10).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [userProfile, userEarnings, userVipLevel, userVipBadge, players]);

  // Sort parallel players by Net Gain/Loss descending
  const sortedParallelPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aNet = a.totalWon - a.totalSpent;
      const bNet = b.totalWon - b.totalSpent;
      return bNet - aNet;
    });
  }, [players]);

  return (
    <div className="bg-slate-900 border border-slate-700/60 p-5 rounded-2xl shadow-xl space-y-5 font-sans">
      {/* HEADER & VIEW TOGGLES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
              🏆 GLOBAL LEADERBOARD & SIMULATION RANKINGS
            </h3>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
              TOP 10 EARNERS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono pt-0.5">
            Real-time standings tracking top players based on total earnings across all simulations & engines.
          </p>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'global'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🏆 Global Top 10
          </button>
          <button
            onClick={() => setActiveTab('parallel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'parallel'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👥 Parallel Threads ({players.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: GLOBAL TOP 10 LEADERBOARD */}
      {activeTab === 'global' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Leaderboard Scope:</span>
              <span className="text-amber-300 font-black">🌍 Global Multi-Simulation</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Top Leader Rank 1:</span>
              <span className="text-emerald-400 font-bold">
                {top10GlobalPlayers[0]?.username} (${top10GlobalPlayers[0]?.totalEarnings.toLocaleString()})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Your Global Rank:</span>
              <span className="text-yellow-300 font-black">
                #{top10GlobalPlayers.find(p => p.isCurrentUser)?.rank || 'Unranked'} (VIP Level {userVipLevel})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
            <table className="w-full text-left font-mono text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-amber-400/90 uppercase bg-slate-900/80 tracking-wider">
                  <th className="py-3 px-3.5 font-black">Rank</th>
                  <th className="py-3 px-3.5 font-black">Player</th>
                  <th className="py-3 px-3.5 font-black">VIP Level</th>
                  <th className="py-3 px-3.5 font-black text-right">Total Earnings ($)</th>
                  <th className="py-3 px-3.5 font-black text-right">Primary Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {top10GlobalPlayers.map((player) => {
                  const medal =
                    player.rank === 1
                      ? '🥇 1st'
                      : player.rank === 2
                      ? '🥈 2nd'
                      : player.rank === 3
                      ? '🥉 3rd'
                      : `#${player.rank}`;

                  const rankColor =
                    player.rank === 1
                      ? 'text-yellow-300 font-black'
                      : player.rank === 2
                      ? 'text-slate-200 font-black'
                      : player.rank === 3
                      ? 'text-amber-500 font-black'
                      : 'text-slate-400 font-bold';

                  const isCurrentUser = player.isCurrentUser;

                  return (
                    <tr
                      key={player.id}
                      className={`transition-all hover:bg-slate-900/60 ${
                        isCurrentUser
                          ? 'bg-amber-950/30 border-l-4 border-l-amber-400 font-extrabold shadow-inner'
                          : ''
                      }`}
                    >
                      <td className={`py-3 px-3.5 text-sm ${rankColor}`}>
                        {medal}
                      </td>

                      <td className="py-3 px-3.5 font-sans font-bold">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl bg-slate-900 p-1 rounded border border-slate-800">{player.avatar}</span>
                          <div>
                            <span className="text-white block font-bold text-xs flex items-center gap-1.5">
                              {player.username}
                              {isCurrentUser && (
                                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded font-black uppercase">
                                  YOU
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold font-mono inline-block ${
                            player.vipLevel >= 10
                              ? 'bg-yellow-950 text-yellow-300 border border-yellow-500 shadow-sm animate-pulse'
                              : player.vipLevel >= 8
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                              : player.vipLevel >= 5
                              ? 'bg-amber-950 text-amber-300 border border-amber-500'
                              : player.vipLevel >= 3
                              ? 'bg-slate-800 text-slate-300 border border-slate-600'
                              : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {player.vipBadge}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-right font-mono font-black text-emerald-400 text-sm">
                        ${player.totalEarnings.toLocaleString()}
                      </td>

                      <td className="py-3 px-3.5 text-right text-[11px] text-slate-400 font-mono">
                        {player.simulationType}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: PARALLEL SIMULATION THREADS */}
      {activeTab === 'parallel' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Total Active Parallel Citizens:</span>
              <span className="text-slate-200 font-bold">{players.length} threads</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Active Team Strategy:</span>
              <span className="text-cyan-400 font-bold capitalize">{activeStrategy} Model</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10.5px] font-mono text-slate-400">Sessions:</span>
              <select
                value={multiSessionCount}
                onChange={(e) => onUpdateSessionCount(parseInt(e.target.value))}
                className="bg-slate-900 border border-slate-800 text-xs text-amber-300 outline-none p-1.5 rounded-lg font-bold font-mono"
              >
                <option value="5">5 Players</option>
                <option value="15">15 Players</option>
                <option value="30">30 Players</option>
                <option value="50">50 Players</option>
                <option value="100">100 Players</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90">
            <table className="w-full text-left font-mono text-xs text-slate-350 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 tracking-wider bg-slate-900/80">
                  <th className="py-2.5 px-3 font-bold">Rank</th>
                  <th className="py-2.5 px-3 font-bold">Player Alias</th>
                  <th className="py-2.5 px-3 font-bold text-right font-mono">Tickets</th>
                  <th className="py-2.5 px-3 font-bold text-right">Spent</th>
                  <th className="py-2.5 px-3 font-bold text-right">Total Won</th>
                  <th className="py-2.5 px-3 font-bold text-right font-bold text-amber-400">Net Wealth</th>
                  <th className="py-2.5 px-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {sortedParallelPlayers.slice(0, 15).map((player, idx) => {
                  const netValue = player.balance - 500;
                  const isProfit = netValue >= 0;
                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;

                  return (
                    <tr key={player.id} className="hover:bg-slate-850/35 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-400">{medal}</td>
                      <td className="py-2.5 px-3 font-sans font-bold text-slate-200">
                        <span className="flex items-center gap-1.5">
                          👤 {player.name}
                          {player.totalWon > 50000 && (
                            <span className="bg-amber-500/20 text-amber-300 font-sans border border-amber-500/30 text-[8px] px-1 rounded">
                              Lucky Spike
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{player.ticketsBought.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-450">${player.totalSpent.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">${player.totalWon.toLocaleString()}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-450'}`}>
                        ${netValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                            player.status === 'bankrupt'
                              ? 'bg-red-950/50 text-red-400 border border-red-900/40'
                              : 'bg-emerald-950/40 text-emerald-300 border border-emerald-900/40'
                          }`}
                        >
                          {player.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
