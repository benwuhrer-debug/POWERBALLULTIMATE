/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';
import { UserProfile } from './UserProfileSettings';

export interface ConnectedPlayer {
  id: string;
  name: string;
  avatar: string;
  title: string;
  vipLevel: number;
  balance: number;
  role: 'host' | 'admin' | 'member' | 'bot';
  status: 'online' | 'away' | 'offline' | 'banned';
  joinedAt: string;
  pingMs: number;
  bio?: string;
  cardTheme?: string;
  isMuted?: boolean;
  isFrozen?: boolean;
  autoBidder?: boolean;
  totalSpent?: number;
  winsCount?: number;
  clanTag?: string;
}

export interface ServerRoom {
  id: string;
  name: string;
  hostName: string;
  hostAvatar: string;
  maxPlayers: number;
  currentPlayers: number;
  treasuryBalance: number;
  sharedFundPolicy: 'open' | 'host_approval' | 'tax_auto_share';
  isPrivate: boolean;
  region: string;
  ipAddress: string;
  taxRatePercent: number;
  taxOwed?: number;
  totalTaxesPaid?: number;
  autoPayTax?: boolean;
  lastTaxPaidAt?: string;
}

export interface ServerActivityLog {
  id: string;
  text: string;
  type: 'join' | 'leave' | 'fund' | 'login_control' | 'system' | 'kick' | 'action' | 'chat';
  timestamp: string;
}

interface MultiplayerServerManagerProps {
  currentProfile: UserProfile;
  currentBalance: number;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateBalance: (newBalance: number) => void;
  soundEnabled: boolean;
}

const INITIAL_SERVERS: ServerRoom[] = [
  {
    id: 'srv-1',
    name: "Ben's Sovereign Overlord Realm [OP HOST]",
    hostName: 'Ben',
    hostAvatar: '👑',
    maxPlayers: 200,
    currentPlayers: 12,
    treasuryBalance: 5000000000,
    sharedFundPolicy: 'open',
    isPrivate: false,
    region: 'US-East (Virginia)',
    ipAddress: '192.168.1.100:25565',
    taxRatePercent: 5,
    taxOwed: 250000000,
    totalTaxesPaid: 1250000000,
    autoPayTax: true,
    lastTaxPaidAt: '08:00:00',
  },
  {
    id: 'srv-2',
    name: 'Builderman MetaVerse Trade Guild',
    hostName: 'Builderman_Official',
    hostAvatar: '👷',
    maxPlayers: 100,
    currentPlayers: 45,
    treasuryBalance: 1200000000,
    sharedFundPolicy: 'tax_auto_share',
    isPrivate: false,
    region: 'US-West (California)',
    ipAddress: '10.0.0.42:25565',
    taxRatePercent: 5,
    taxOwed: 60000000,
    totalTaxesPaid: 300000000,
    autoPayTax: true,
    lastTaxPaidAt: '08:00:00',
  },
  {
    id: 'srv-3',
    name: 'CryptoWhale High-Stakes HODL Server',
    hostName: 'CryptoWhale_99',
    hostAvatar: '🐳',
    maxPlayers: 50,
    currentPlayers: 18,
    treasuryBalance: 25000000000,
    sharedFundPolicy: 'host_approval',
    isPrivate: false,
    region: 'EU-Central (Frankfurt)',
    ipAddress: '172.16.0.88:25565',
    taxRatePercent: 10,
    taxOwed: 2500000000,
    totalTaxesPaid: 5000000000,
    autoPayTax: true,
    lastTaxPaidAt: '08:00:00',
  },
];

const PRESET_NAMES = [
  'ApexPredator_99', 'CryptoGod_X', 'VipWhale_77', 'NoobMaster_2026', 'RobloxTrader_Pro',
  'DiamondHands_HODL', 'Sovereign_Overlord', 'CyberNinja_X', 'GoldMiner_88', 'GigaChad_Billionaire',
  'MatrixCoder_101', 'SpeedRunner_Pro', 'WallStreet_Wolf', 'LootBox_King', 'PixelKnight_9',
  'CasinoBoss_VIP', 'ShadowAssassin_7', 'AlphaTrader_33', 'HyperDrive_V8', 'ZeroLatency_5G',
  'QuantumPhysicist', 'ByteSurfer_2026', 'NeonRider_Synth', 'IronShield_OP', 'VortexGamer_99',
  'TitanWhale_100', 'MoonShooter_BTC', 'BullRunner_ETH', 'SolanaGigaChad', 'RocketMan_Mars'
];

const PRESET_TITLES = [
  '💸 WallStreet Daytrader', '🪙 Bitcoin Billionaire', '👶 Rookie Gambler', '🎮 High Roller Champion',
  '🧱 Roblox Arch-Architect', '⚡ Speedrunner Demigod', '👑 Guild Master', '💎 Diamond HODL Legend',
  '🔥 Auction Sniper', '🚀 Moonshot Syndicate', '🛡️ Server Co-Host', '🤖 Automated Trading Bot'
];

const PRESET_AVATARS = ['🚀', '🐳', '⚡', '👷', '👑', '👶', '🎮', '🦁', '🐉', '🤖', '👾', '💎', '🔥', '🏆', '🎯', '💰'];

const DEFAULT_CONNECTED_PLAYERS: ConnectedPlayer[] = [
  {
    id: 'plr-host',
    name: 'Ben',
    avatar: '👑',
    title: '👑 Sovereign Overlord (SERVER HOST)',
    vipLevel: 10,
    balance: 1000000000,
    role: 'host',
    status: 'online',
    joinedAt: '08:00:00',
    pingMs: 2,
    bio: 'Server Host with absolute operational control over all connected player accounts.',
    cardTheme: 'gold',
  },
  {
    id: 'plr-1',
    name: 'Alex_Trader99',
    avatar: '🚀',
    title: '💸 WallStreet Daytrader',
    vipLevel: 7,
    balance: 45000000,
    role: 'member',
    status: 'online',
    joinedAt: '08:02:15',
    pingMs: 22,
    bio: 'Daytrading crypto and auction items 24/7.',
  },
  {
    id: 'plr-2',
    name: 'CryptoKing_X',
    avatar: '🐳',
    title: '🪙 Bitcoin Billionaire',
    vipLevel: 9,
    balance: 850000000,
    role: 'admin',
    status: 'online',
    joinedAt: '08:05:30',
    pingMs: 18,
    bio: 'Whale investor holding server treasury reserves.',
  },
  {
    id: 'plr-3',
    name: 'NoobLover2026',
    avatar: '👶',
    title: '👶 Rookie Gambler',
    vipLevel: 1,
    balance: 50000,
    role: 'member',
    status: 'online',
    joinedAt: '08:10:45',
    pingMs: 45,
    bio: 'Just joined the server! Need free cash donations!',
  },
  {
    id: 'plr-4',
    name: 'VipGamer_Pro',
    avatar: '⚡',
    title: '🎮 High Roller Champion',
    vipLevel: 8,
    balance: 120000000,
    role: 'member',
    status: 'online',
    joinedAt: '08:12:10',
    pingMs: 12,
  },
  {
    id: 'plr-5',
    name: 'Builderman_Guest',
    avatar: '👷',
    title: '🧱 Roblox Arch-Architect',
    vipLevel: 10,
    balance: 500000000,
    role: 'admin',
    status: 'online',
    joinedAt: '08:15:00',
    pingMs: 9,
  },
];

export const MultiplayerServerManager: React.FC<MultiplayerServerManagerProps> = ({
  currentProfile,
  currentBalance,
  onUpdateProfile,
  onUpdateBalance,
  soundEnabled,
}) => {
  // Active Server State
  const [servers, setServers] = useState<ServerRoom[]>(INITIAL_SERVERS);
  const [activeServer, setActiveServer] = useState<ServerRoom>(INITIAL_SERVERS[0]);
  const [players, setPlayers] = useState<ConnectedPlayer[]>(DEFAULT_CONNECTED_PLAYERS);

  // Active Logged-in Profile Tracking (Complete Account Impersonation Control)
  const [hostOriginalProfile, setHostOriginalProfile] = useState<UserProfile>(currentProfile);
  const [hostOriginalBalance, setHostOriginalBalance] = useState<number>(currentBalance);
  const [loggedInPlayerId, setLoggedInPlayerId] = useState<string>('plr-host');

  // Filter, Search, Sort
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'balance' | 'name' | 'vip' | 'joined'>('balance');

  // Account Control Modal / Drawer State
  const [selectedPlayerForControl, setSelectedPlayerForControl] = useState<ConnectedPlayer | null>(null);
  const [activeControlTab, setActiveControlTab] = useState<'login' | 'finance' | 'actions' | 'edit' | 'chat'>('login');

  // Single Transfer Form
  const [transferTargetId, setTransferTargetId] = useState<string>('plr-1');
  const [transferAmount, setTransferAmount] = useState<number>(1000000);

  // Treasury Form
  const [treasuryPoolAmount, setTreasuryPoolAmount] = useState<number>(10000000);

  // Custom Edit Form inside drawer
  const [editNameInput, setEditNameInput] = useState<string>('');
  const [editAvatarInput, setEditAvatarInput] = useState<string>('');
  const [editTitleInput, setEditTitleInput] = useState<string>('');
  const [editBalanceInput, setEditBalanceInput] = useState<number>(0);
  const [editVipInput, setEditVipInput] = useState<number>(1);
  const [editClanTagInput, setEditClanTagInput] = useState<string>('');

  // Modals
  const [showAddPlayerModal, setShowAddPlayerModal] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerAvatar, setNewPlayerAvatar] = useState<string>('🎮');
  const [newPlayerBalance, setNewPlayerBalance] = useState<number>(10000000);
  const [newPlayerTitle, setNewPlayerTitle] = useState<string>('🎲 Server Member');

  const [showCreateServerModal, setShowCreateServerModal] = useState<boolean>(false);
  const [newServerName, setNewServerName] = useState<string>('');
  const [newServerMaxPlayers, setNewServerMaxPlayers] = useState<number>(100);

  // Activity Logs
  const [logs, setLogs] = useState<ServerActivityLog[]>([
    { id: '1', text: "Server 'Ben's Sovereign Overlord Realm' initialized on Port 25565", type: 'system', timestamp: '08:00:00' },
    { id: '2', text: "Host Ben synchronized $1,000,000,000 wallet to server treasury", type: 'fund', timestamp: '08:00:05' },
    { id: '3', text: "Player Alex_Trader99 joined the server", type: 'join', timestamp: '08:02:15' },
    { id: '4', text: "Host initialized complete account control & impersonation engine", type: 'login_control', timestamp: '08:06:00' },
  ]);

  const addLog = (text: string, type: ServerActivityLog['type'] = 'system') => {
    setLogs(prev => [
      ...prev.slice(-60),
      {
        id: Date.now().toString() + Math.random(),
        text,
        type,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };

  // Keep Host original profile synchronized if user modifies host profile in user settings
  useEffect(() => {
    if (loggedInPlayerId === 'plr-host') {
      setHostOriginalProfile(currentProfile);
      setHostOriginalBalance(currentBalance);
    }
  }, [currentProfile, currentBalance, loggedInPlayerId]);

  // Keep Host name and player roster aligned with active user profile
  useEffect(() => {
    if (loggedInPlayerId === 'plr-host') {
      setPlayers(prev => prev.map(p => {
        if (p.id === 'plr-host') {
          return {
            ...p,
            name: currentProfile.name,
            avatar: currentProfile.avatar,
            title: currentProfile.title,
          };
        }
        return p;
      }));

      setActiveServer(prev => ({
        ...prev,
        hostName: currentProfile.name,
        hostAvatar: currentProfile.avatar,
      }));
    }
  }, [currentProfile.name, currentProfile.avatar, currentProfile.title, loggedInPlayerId]);

  // Sync current balance back into active connected player's object in real-time
  useEffect(() => {
    setPlayers(prev => prev.map(p => {
      if (p.id === loggedInPlayerId) {
        return { ...p, balance: currentBalance };
      }
      return p;
    }));
  }, [currentBalance, loggedInPlayerId]);

  // Background Server Loop: Passive Revenue & Auto Server Tax Payment
  useEffect(() => {
    const bgTimer = setInterval(() => {
      setActiveServer(prev => {
        const connectedCount = players.length;
        const revenueGenerated = connectedCount * 100000;
        let newTreasury = prev.treasuryBalance + revenueGenerated;
        let newTaxOwed = (prev.taxOwed || 0) + Math.floor(revenueGenerated * (prev.taxRatePercent / 100));
        let newTaxesPaid = prev.totalTaxesPaid || 0;
        let lastPaid = prev.lastTaxPaidAt;

        // Auto-pay server tax if autoPayTax is true
        if (prev.autoPayTax && newTaxOwed > 0) {
          if (newTreasury >= newTaxOwed) {
            newTreasury -= newTaxOwed;
            newTaxesPaid += newTaxOwed;
            newTaxOwed = 0;
            lastPaid = new Date().toLocaleTimeString();
          }
        }

        return {
          ...prev,
          treasuryBalance: newTreasury,
          taxOwed: newTaxOwed,
          totalTaxesPaid: newTaxesPaid,
          lastTaxPaidAt: lastPaid,
        };
      });
    }, 3000);

    return () => clearInterval(bgTimer);
  }, [players.length]);

  // ==========================================
  // SERVER MUNICIPAL & HOSTING TAX HANDLERS
  // ==========================================
  const handlePayServerTax = () => {
    const taxBill = activeServer.taxOwed !== undefined && activeServer.taxOwed > 0
      ? activeServer.taxOwed
      : Math.floor(activeServer.treasuryBalance * (activeServer.taxRatePercent / 100));

    if (taxBill <= 0) {
      addLog(`🏛️ SERVER TAX BUREAU: Server '${activeServer.name}' has $0 pending tax bills!`, 'system');
      return;
    }

    if (activeServer.treasuryBalance >= taxBill) {
      setActiveServer(prev => ({
        ...prev,
        treasuryBalance: prev.treasuryBalance - taxBill,
        taxOwed: 0,
        totalTaxesPaid: (prev.totalTaxesPaid || 0) + taxBill,
        lastTaxPaidAt: new Date().toLocaleTimeString(),
      }));
      if (soundEnabled) playJackpotSound(soundEnabled);
      addLog(`🏛️ TAX DEDUCTED FROM TREASURY: Server paid $${taxBill.toLocaleString()} in Municipal Infrastructure Taxes!`, 'fund');
    } else if (currentBalance >= taxBill) {
      onUpdateBalance(currentBalance - taxBill);
      setActiveServer(prev => ({
        ...prev,
        taxOwed: 0,
        totalTaxesPaid: (prev.totalTaxesPaid || 0) + taxBill,
        lastTaxPaidAt: new Date().toLocaleTimeString(),
      }));
      if (soundEnabled) playJackpotSound(soundEnabled);
      addLog(`🏛️ TAX DEDUCTED FROM HOST WALLET: Host ${currentProfile.name} paid $${taxBill.toLocaleString()} Server Tax!`, 'fund');
    } else {
      addLog(`⚠️ INSUFFICIENT FUNDS: Treasury ($${activeServer.treasuryBalance.toLocaleString()}) cannot pay $${taxBill.toLocaleString()} tax bill!`, 'system');
    }
  };

  const handleToggleAutoPayServerTax = () => {
    const nextVal = !activeServer.autoPayTax;
    setActiveServer(prev => ({ ...prev, autoPayTax: nextVal }));
    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`⚙️ TAX CONFIG: Auto-Pay Server Tax set to ${nextVal ? 'ENABLED (Auto-Deduct)' : 'DISABLED (Manual Invoice)'}`, 'system');
  };

  const handleTriggerTaxAudit = () => {
    const auditTax = Math.floor(activeServer.treasuryBalance * (activeServer.taxRatePercent / 100)) + 50000000;
    setActiveServer(prev => ({ ...prev, taxOwed: (prev.taxOwed || 0) + auditTax }));
    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`🚨 MUNICIPAL TAX AUDIT: Levied +$${auditTax.toLocaleString()} Server Tax Invoice at ${activeServer.taxRatePercent}% rate!`, 'fund');
  };

  const handleChangeServerTaxRate = (newRate: number) => {
    setActiveServer(prev => ({ ...prev, taxRatePercent: newRate }));
    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`⚙️ TAX RATE UPDATED: ${activeServer.name} tax rate set to ${newRate}%!`, 'system');
  };

  // ==========================================
  // MASS ACCOUNT GENERATOR (Generate 10 / 50 / 100 Accounts)
  // ==========================================
  const handleGenerateMassAccounts = (count: number) => {
    const newGeneratedPlayers: ConnectedPlayer[] = [];

    for (let i = 0; i < count; i++) {
      const randomName = PRESET_NAMES[Math.floor(Math.random() * PRESET_NAMES.length)] + '_' + Math.floor(Math.random() * 9999);
      const randomTitle = PRESET_TITLES[Math.floor(Math.random() * PRESET_TITLES.length)];
      const randomAvatar = PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];
      const randomVip = Math.floor(Math.random() * 10) + 1;
      const randomBalance = Math.floor(Math.random() * 500000000) + 10000;
      const isBot = Math.random() > 0.4;
      const isAdmin = Math.random() > 0.85;

      newGeneratedPlayers.push({
        id: 'plr-gen-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substr(2, 4),
        name: randomName,
        avatar: randomAvatar,
        title: randomTitle,
        vipLevel: randomVip,
        balance: randomBalance,
        role: isAdmin ? 'admin' : isBot ? 'bot' : 'member',
        status: 'online',
        joinedAt: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString(),
        pingMs: Math.floor(Math.random() * 60) + 5,
        bio: isBot ? 'Automated server trader bot' : 'Connected player account',
        cardTheme: randomVip > 7 ? 'gold' : 'standard',
        autoBidder: isBot,
      });
    }

    setPlayers(prev => [...prev, ...newGeneratedPlayers]);
    setActiveServer(prev => ({ ...prev, currentPlayers: prev.currentPlayers + count }));

    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog(`🚀 MASS GENERATION: Created and auto-connected ${count} brand new player accounts to ${activeServer.name}!`, 'join');
  };

  // ==========================================
  // ACCOUNT LOGIN & IMPERSONATION OVERRIDE
  // ==========================================
  const handleLoginToPlayerAccount = (player: ConnectedPlayer) => {
    if (player.status === 'banned') {
      addLog(`❌ Cannot log into ${player.name}: Account is BANNED!`, 'system');
      return;
    }

    if (soundEnabled) playJackpotSound(soundEnabled);

    // If logging into host account
    if (player.id === 'plr-host') {
      setLoggedInPlayerId('plr-host');
      onUpdateProfile(hostOriginalProfile);
      onUpdateBalance(hostOriginalBalance);
      addLog(`🔑 LOGGED OUT of player account. Switched back to HOST account (${hostOriginalProfile.name})!`, 'login_control');
      return;
    }

    // Save host state if switching away for first time
    if (loggedInPlayerId === 'plr-host') {
      setHostOriginalProfile(currentProfile);
      setHostOriginalBalance(currentBalance);
    }

    // Update active profile in main App state to match player!
    const playerUserProfile: UserProfile = {
      name: player.name,
      avatar: player.avatar,
      avatarType: 'emoji',
      title: player.title,
      titleColor: 'amber',
      cardTheme: player.cardTheme === 'gold' ? 'gold' : 'obsidian',
      bio: player.bio || `Multiplayer Server Account [Connected to ${activeServer.name}]`,
      vipLevel: player.vipLevel,
      vipXp: player.vipLevel * 100,
      luckyWhiteBalls: [1, 2, 3, 4, 5],
      luckyPowerball: 6,
      badges: ['Multiplayer Player', player.role.toUpperCase()],
      autoSyncTicket: true,
      autoSyncBiddingName: true,
    };

    setLoggedInPlayerId(player.id);
    onUpdateProfile(playerUserProfile);
    onUpdateBalance(player.balance);

    addLog(`🔑 HOST OVERRIDE: Logged into ${player.name}'s account! Full operational control over wallet ($${player.balance.toLocaleString()}) & inventory activated!`, 'login_control');
  };

  // ==========================================
  // ACCOUNT MANIPULATIONS & ACTIONS (100+ THINGS)
  // ==========================================

  // 1. Force Seize 100% Funds
  const handleSeizePlayerFunds = (player: ConnectedPlayer) => {
    if (player.balance <= 0) {
      addLog(`⚠️ ${player.name} has no funds to seize!`, 'system');
      return;
    }

    const seized = player.balance;
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, balance: 0 } : p));
    onUpdateBalance(currentBalance + seized);

    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog(`👑 FORCE SEIZE: Confiscated 100% wallet funds ($${seized.toLocaleString()}) from ${player.name} into your active wallet!`, 'fund');
  };

  // 2. Inject Cash Stimulus
  const handleInjectCashToAccount = (player: ConnectedPlayer, amount: number) => {
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, balance: p.balance + amount } : p));

    if (loggedInPlayerId === player.id) {
      onUpdateBalance(currentBalance + amount);
    }

    if (soundEnabled) playCoinSound(soundEnabled);
    addLog(`💸 CASH STIMULUS: Injected +$${amount.toLocaleString()} into ${player.name}'s account balance!`, 'fund');
  };

  // 3. Freeze / Unfreeze Account Wallet
  const handleToggleFreezeAccount = (player: ConnectedPlayer) => {
    const nextState = !player.isFrozen;
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isFrozen: nextState } : p));

    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`❄️ WALLET LOCK: ${player.name}'s wallet is now ${nextState ? 'FROZEN (Disabled)' : 'UNFROZEN (Active)'}!`, 'action');
  };

  // 4. Force Bankrupt Account ($0 Balance)
  const handleForceBankruptAccount = (player: ConnectedPlayer) => {
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, balance: 0 } : p));
    if (loggedInPlayerId === player.id) onUpdateBalance(0);

    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`📉 BANKRUPTCY: Force wiped ${player.name}'s balance to $0!`, 'action');
  };

  // 5. Double Account Balance (2x Multiplier)
  const handleDoubleAccountBalance = (player: ConnectedPlayer) => {
    const newBal = player.balance * 2;
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, balance: newBal } : p));
    if (loggedInPlayerId === player.id) onUpdateBalance(newBal);

    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog(`📈 2X MULTIPLIER: Doubled ${player.name}'s wallet to $${newBal.toLocaleString()}!`, 'fund');
  };

  // 6. Promote / Demote Role
  const handleChangeAccountRole = (player: ConnectedPlayer, newRole: ConnectedPlayer['role']) => {
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, role: newRole } : p));

    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`🛡️ ROLE CHANGE: Promoted ${player.name} to '${newRole.toUpperCase()}'!`, 'action');
  };

  // 7. Toggle Mute Chat
  const handleToggleMuteAccount = (player: ConnectedPlayer) => {
    const nextMute = !player.isMuted;
    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, isMuted: nextMute } : p));

    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`🤐 MODERATION: ${player.name} has been ${nextMute ? 'MUTED' : 'UNMUTED'} in server chat!`, 'action');
  };

  // 8. Force Spam Preset Chat Message
  const handleForceAccountChatSpam = (player: ConnectedPlayer, msgText: string) => {
    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`💬 [${player.name}]: "${msgText}"`, 'chat');
  };

  // 9. Kick / Ban Account
  const handleToggleKickOrBan = (player: ConnectedPlayer) => {
    if (player.role === 'host') {
      addLog(`⚠️ Cannot kick or ban the Server Host!`, 'system');
      return;
    }

    const isBanned = player.status === 'banned';
    const nextStatus = isBanned ? 'online' : 'banned';

    setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, status: nextStatus } : p));

    // If currently logged into that player, switch back to host
    if (loggedInPlayerId === player.id) {
      handleLoginToPlayerAccount(players.find(p => p.id === 'plr-host')!);
    }

    if (soundEnabled) playTickSound(soundEnabled);
    addLog(`🚫 SERVER ACTION: ${player.name} has been ${isBanned ? 'UNBANNED' : 'BANNED & KICKED'} from the server!`, 'kick');
  };

  // 10. Save Custom Edits to Account Profile
  const handleSaveAccountProfileEdits = () => {
    if (!selectedPlayerForControl) return;

    setPlayers(prev => prev.map(p => {
      if (p.id === selectedPlayerForControl.id) {
        return {
          ...p,
          name: editNameInput || p.name,
          avatar: editAvatarInput || p.avatar,
          title: editTitleInput || p.title,
          balance: editBalanceInput,
          vipLevel: editVipInput,
          clanTag: editClanTagInput,
        };
      }
      return p;
    }));

    if (loggedInPlayerId === selectedPlayerForControl.id) {
      onUpdateProfile({
        ...currentProfile,
        name: editNameInput || currentProfile.name,
        avatar: editAvatarInput || currentProfile.avatar,
        title: editTitleInput || currentProfile.title,
        vipLevel: editVipInput,
      });
      onUpdateBalance(editBalanceInput);
    }

    if (soundEnabled) playCoinSound(soundEnabled);
    addLog(`✏️ PROFILE UPDATED: Saved custom modifications for ${selectedPlayerForControl.name}!`, 'action');
  };

  // ==========================================
  // MASS BATCH SERVER OPERATIONS
  // ==========================================
  const handleMassStimulusCheck = (amount: number) => {
    setPlayers(prev => prev.map(p => ({ ...p, balance: p.balance + amount })));
    onUpdateBalance(currentBalance + amount);

    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog(`💸 MASS STIMULUS: Distributed +$${amount.toLocaleString()} to ALL ${players.length} connected player accounts!`, 'fund');
  };

  const handleMassForceSeizeAllFunds = () => {
    let totalSeized = 0;
    setPlayers(prev => prev.map(p => {
      if (p.role !== 'host') {
        totalSeized += p.balance;
        return { ...p, balance: 0 };
      }
      return p;
    }));

    onUpdateBalance(currentBalance + totalSeized);

    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog(`👑 MASS SEIZE: Confiscated total $${totalSeized.toLocaleString()} from ALL connected accounts into Host Vault!`, 'fund');
  };

  const handleMassSetVipMax = () => {
    setPlayers(prev => prev.map(p => ({ ...p, vipLevel: 10, cardTheme: 'gold' })));

    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog(`👑 MASS VIP: Upgraded ALL accounts to VIP Level 10 Sovereign Status!`, 'action');
  };

  const handleMassChatCheer = () => {
    addLog(`💬 MASS CHEER: All ${players.length} players spammed: "ALL HAIL SERVER OVERLORD BEN!"`, 'chat');
  };

  const handleClearNonHostAccounts = () => {
    setPlayers(prev => prev.filter(p => p.role === 'host'));
    if (loggedInPlayerId !== 'plr-host') {
      handleLoginToPlayerAccount(players.find(p => p.id === 'plr-host')!);
    }

    addLog(`🧹 SERVER PURGE: Cleared all non-host accounts from server!`, 'system');
  };

  // Direct Fund Transfer
  const handleTransferFundsToPlayer = (targetId: string, amount: number) => {
    if (amount <= 0) return;
    if (currentBalance < amount) {
      addLog(`⚠️ Insufficient active balance to send $${amount.toLocaleString()}`, 'system');
      return;
    }

    const targetPlr = players.find(p => p.id === targetId);
    if (!targetPlr) return;

    onUpdateBalance(currentBalance - amount);
    setPlayers(prev => prev.map(p => p.id === targetId ? { ...p, balance: p.balance + amount } : p));

    if (soundEnabled) playCoinSound(soundEnabled);
    addLog(`💸 SHARED FUNDS: Transferred $${amount.toLocaleString()} from ${currentProfile.name} to ${targetPlr.name}!`, 'fund');
  };

  // Shared Treasury Pool Actions
  const handleDepositToTreasury = (amount: number) => {
    if (amount <= 0 || currentBalance < amount) return;

    onUpdateBalance(currentBalance - amount);
    setActiveServer(prev => ({
      ...prev,
      treasuryBalance: prev.treasuryBalance + amount,
    }));

    if (soundEnabled) playCoinSound(soundEnabled);
    addLog(`🏛️ TREASURY DEPOSIT: ${currentProfile.name} deposited $${amount.toLocaleString()} into Server Bank!`, 'fund');
  };

  const handleDistributeTreasuryDividends = () => {
    if (activeServer.treasuryBalance <= 0) return;

    const activePlayers = players.filter(p => p.status !== 'banned');
    if (activePlayers.length === 0) return;

    const sharePerPlayer = Math.floor(activeServer.treasuryBalance / activePlayers.length);

    setPlayers(prev => prev.map(p => p.status !== 'banned' ? { ...p, balance: p.balance + sharePerPlayer } : p));
    onUpdateBalance(currentBalance + sharePerPlayer);
    setActiveServer(prev => ({ ...prev, treasuryBalance: 0 }));

    if (soundEnabled) playJackpotSound(soundEnabled);
    addLog(`🎉 DIVIDENDS DISTRIBUTED: $${sharePerPlayer.toLocaleString()} distributed to each connected player!`, 'fund');
  };

  // Add Custom Player Account
  const handleCreateNewPlayerAccount = () => {
    if (!newPlayerName.trim()) return;

    const newPlr: ConnectedPlayer = {
      id: 'plr-custom-' + Date.now(),
      name: newPlayerName.trim(),
      avatar: newPlayerAvatar || '🎮',
      title: newPlayerTitle || '🎲 Server Member',
      vipLevel: 5,
      balance: newPlayerBalance,
      role: 'member',
      status: 'online',
      joinedAt: new Date().toLocaleTimeString(),
      pingMs: Math.floor(Math.random() * 30) + 10,
    };

    setPlayers(prev => [...prev, newPlr]);
    setActiveServer(prev => ({ ...prev, currentPlayers: prev.currentPlayers + 1 }));
    setShowAddPlayerModal(false);
    setNewPlayerName('');

    if (soundEnabled) playCoinSound(soundEnabled);
    addLog(`👤 NEW ACCOUNT JOINED: Created account '${newPlr.name}' with $${newPlr.balance.toLocaleString()} balance!`, 'join');
  };

  // Open Drawer for account control
  const openPlayerControlDrawer = (player: ConnectedPlayer) => {
    setSelectedPlayerForControl(player);
    setEditNameInput(player.name);
    setEditAvatarInput(player.avatar);
    setEditTitleInput(player.title);
    setEditBalanceInput(player.balance);
    setEditVipInput(player.vipLevel);
    setEditClanTagInput(player.clanTag || '');
    setActiveControlTab('login');
  };

  // Filter & Sort Logic
  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || p.role === filterRole;
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    if (sortBy === 'balance') return b.balance - a.balance;
    if (sortBy === 'vip') return b.vipLevel - a.vipLevel;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const totalServerWealth = players.reduce((sum, p) => sum + p.balance, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Account Impersonation Banner Alert */}
      {loggedInPlayerId !== 'plr-host' && (
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-4 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 flex flex-wrap items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-extrabold text-sm uppercase tracking-wider">
                IMPERSONATION CONTROL ACTIVE: LOGGED INTO PLAYER ACCOUNT [{currentProfile.name}]
              </p>
              <p className="text-xs font-semibold text-slate-900">
                You are playing with <strong className="underline">{currentProfile.name}</strong>'s balance (${currentBalance.toLocaleString()}) and profile!
              </p>
            </div>
          </div>

          <button
            onClick={() => handleLoginToPlayerAccount(players.find(p => p.id === 'plr-host')!)}
            className="bg-slate-950 hover:bg-slate-900 text-amber-300 font-extrabold text-xs px-4 py-2 rounded-xl border border-amber-400 shadow-lg flex items-center space-x-1.5 transition-all"
          >
            <span>🔓 LOG OUT & RETURN TO HOST ACCOUNT</span>
          </button>
        </div>
      )}

      {/* Main Server Header Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-lg">
              🌐
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-extrabold text-base text-white">{activeServer.name}</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  ONLINE ({players.filter(p => p.status !== 'banned').length} Accounts)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Host: <span className="text-amber-300 font-bold">{activeServer.hostAvatar} {activeServer.hostName}</span> • Total Server Wealth: <span className="font-mono text-emerald-400 font-bold">${totalServerWealth.toLocaleString()}</span>
              </p>
            </div>
          </div>

          {/* Quick Actions & Mass Generators */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleGenerateMassAccounts(10)}
              className="bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-all"
            >
              🚀 +10 Accounts
            </button>
            <button
              onClick={() => handleGenerateMassAccounts(50)}
              className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-all"
            >
              🌐 +50 Accounts
            </button>
            <button
              onClick={() => handleGenerateMassAccounts(100)}
              className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 text-xs font-black px-3 py-1.5 rounded-xl shadow transition-all"
            >
              💥 +100 Accounts
            </button>
            <button
              onClick={() => setShowAddPlayerModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow transition-all"
            >
              ➕ Custom Account
            </button>
          </div>
        </div>

        {/* Server Switcher Ribbon */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold shrink-0">Server Network:</span>
          {servers.map(srv => (
            <button
              key={srv.id}
              onClick={() => {
                setActiveServer(srv);
                if (soundEnabled) playTickSound(soundEnabled);
              }}
              className={`px-3 py-1.5 rounded-xl border font-bold shrink-0 flex items-center space-x-1.5 transition-all ${
                activeServer.id === srv.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/50'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{srv.hostAvatar}</span>
              <span className="truncate max-w-[160px]">{srv.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mass Server-Wide Controls Bar (100+ Operations Suite) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-extrabold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <span>⚡ MASS SERVER-WIDE CONTROLS & BATCH OPERATIONS</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Connected Accounts: <strong className="text-white">{players.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
          <button
            onClick={() => handleMassStimulusCheck(100000000)}
            className="bg-slate-950 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-bold p-2 rounded-xl text-left transition-all"
          >
            <div className="font-black">💸 +$100M Stimulus</div>
            <div className="text-[10px] text-slate-400">Give $100M to ALL</div>
          </button>

          <button
            onClick={handleMassForceSeizeAllFunds}
            className="bg-slate-950 hover:bg-red-950/60 border border-red-500/30 text-red-300 font-bold p-2 rounded-xl text-left transition-all"
          >
            <div className="font-black">👑 Force Seize ALL</div>
            <div className="text-[10px] text-slate-400">Drain ALL wallets</div>
          </button>

          <button
            onClick={handleMassSetVipMax}
            className="bg-slate-950 hover:bg-amber-950/60 border border-amber-500/30 text-amber-300 font-bold p-2 rounded-xl text-left transition-all"
          >
            <div className="font-black">👑 Mass VIP Max</div>
            <div className="text-[10px] text-slate-400">Upgrade ALL to LVL 10</div>
          </button>

          <button
            onClick={handleMassChatCheer}
            className="bg-slate-950 hover:bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-bold p-2 rounded-xl text-left transition-all"
          >
            <div className="font-black">💬 Mass Cheer Chat</div>
            <div className="text-[10px] text-slate-400">Spam praise in log</div>
          </button>

          <button
            onClick={() => handleDistributeTreasuryDividends()}
            className="bg-slate-950 hover:bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 font-bold p-2 rounded-xl text-left transition-all"
          >
            <div className="font-black">🏛️ Treasury Payout</div>
            <div className="text-[10px] text-slate-400">Distribute Vault</div>
          </button>

          <button
            onClick={handleClearNonHostAccounts}
            className="bg-slate-950 hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 font-bold p-2 rounded-xl text-left transition-all"
          >
            <div className="font-black">🧹 Clear Bots/Members</div>
            <div className="text-[10px] text-slate-400">Purge except Host</div>
          </button>
        </div>
      </div>

      {/* SERVER MUNICIPAL & HOSTING TAX BUREAU CARD */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🏛️</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">
                  SERVER MUNICIPAL & HOSTING TAX BUREAU
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  (activeServer.taxOwed || 0) > 0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {(activeServer.taxOwed || 0) > 0 ? '⚠️ TAX INVOICE DUE' : '✅ TAXES PAID & COMPLIANT'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Server Name: <span className="text-cyan-300 font-bold">{activeServer.name}</span> • Host Tax Rate: <span className="text-emerald-400 font-bold">{activeServer.taxRatePercent}%</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePayServerTax}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg transition-all"
            >
              🏛️ PAY SERVER TAX (${(activeServer.taxOwed || Math.floor(activeServer.treasuryBalance * (activeServer.taxRatePercent / 100))).toLocaleString()})
            </button>
            <button
              onClick={handleToggleAutoPayServerTax}
              className={`font-black text-xs px-3.5 py-2 rounded-xl border transition-all ${
                activeServer.autoPayTax
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {activeServer.autoPayTax ? '⚡ AUTO-PAY TAX: ON' : '⏸️ AUTO-PAY TAX: OFF'}
            </button>
            <button
              onClick={handleTriggerTaxAudit}
              className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 font-bold text-xs px-3 py-2 rounded-xl transition-all"
            >
              🚨 AUDIT TAX LEVY
            </button>
          </div>
        </div>

        {/* TAX STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">PENDING TAX BILL</div>
            <div className="text-amber-400 font-black text-sm mt-0.5">${(activeServer.taxOwed || 0).toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">CUMULATIVE TAXES PAID</div>
            <div className="text-emerald-400 font-black text-sm mt-0.5">${(activeServer.totalTaxesPaid || 1250000000).toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
            <div className="text-slate-400 text-[10px] uppercase">SERVER TREASURY VAULT</div>
            <div className="text-cyan-300 font-black text-sm mt-0.5">${activeServer.treasuryBalance.toLocaleString()}</div>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-[10px] uppercase">ADJUST TAX RATE</div>
              <div className="text-white font-bold text-xs mt-0.5">{activeServer.taxRatePercent}% Revenue Tax</div>
            </div>
            <select
              value={activeServer.taxRatePercent}
              onChange={e => handleChangeServerTaxRate(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-emerald-300 text-xs font-bold rounded-lg px-2 py-1"
            >
              <option value={2}>2% Low Tax</option>
              <option value={5}>5% Standard</option>
              <option value={10}>10% High Tax</option>
              <option value={15}>15% Heavy Levy</option>
              <option value={25}>25% Sovereign Tax</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Layout: Accounts Roster & Server Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (2 Cols): Accounts List & Toolbar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">

            {/* Filter / Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="🔍 Search account name or title..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 font-bold"
                >
                  <option value="all">All Roles ({players.length})</option>
                  <option value="host">Hosts</option>
                  <option value="admin">Admins</option>
                  <option value="member">Members</option>
                  <option value="bot">Bots</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300 font-bold"
                >
                  <option value="balance">Sort: Wealth ($)</option>
                  <option value="vip">Sort: VIP Level</option>
                  <option value="name">Sort: Name</option>
                </select>
              </div>
            </div>

            {/* Account Roster Cards List */}
            <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
              {filteredPlayers.map(player => {
                const isLoggedInHere = loggedInPlayerId === player.id;
                const isHost = player.role === 'host';

                return (
                  <div
                    key={player.id}
                    className={`p-3 rounded-2xl border transition-all flex flex-wrap items-center justify-between gap-3 ${
                      isLoggedInHere
                        ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/50'
                        : player.status === 'banned'
                        ? 'bg-red-950/20 border-red-900/60 opacity-60'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Player Info Left */}
                    <div className="flex items-center space-x-3 min-w-[220px]">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl relative shadow">
                        <span>{player.avatar}</span>
                        {isHost && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
                        {player.isFrozen && <span className="absolute -bottom-1 -right-1 text-xs">❄️</span>}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          {player.clanTag && (
                            <span className="text-cyan-400 font-mono text-xs font-bold">[{player.clanTag}]</span>
                          )}
                          <span className="font-extrabold text-sm text-white">{player.name}</span>

                          {isHost && (
                            <span className="bg-amber-500/20 text-amber-300 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                              HOST
                            </span>
                          )}
                          {isLoggedInHere && (
                            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded animate-pulse">
                              LOGGED IN
                            </span>
                          )}
                          {player.isMuted && (
                            <span className="bg-slate-800 text-slate-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              MUTED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{player.title} • VIP {player.vipLevel}</p>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="text-right font-mono min-w-[120px]">
                      <div className="text-xs text-slate-400">Balance:</div>
                      <div className="text-sm font-extrabold text-emerald-400">
                        ${player.balance.toLocaleString()}
                      </div>
                    </div>

                    {/* Actions Right */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleLoginToPlayerAccount(player)}
                        disabled={player.status === 'banned'}
                        className={`text-xs font-black px-3 py-1.5 rounded-xl border transition-all ${
                          isLoggedInHere
                            ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {isLoggedInHere ? '🔓 Active' : '🔑 Log In'}
                      </button>

                      <button
                        onClick={() => openPlayerControlDrawer(player)}
                        className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all"
                        title="Open Account Control Center"
                      >
                        ⚙️ Controls
                      </button>

                      {!isHost && (
                        <button
                          onClick={() => handleSeizePlayerFunds(player)}
                          className="bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all"
                          title="Force seize 100% wallet"
                        >
                          ⚡ Seize
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Transfer & Treasury Bank & Activity Log */}
        <div className="space-y-4">
          {/* Direct Share Funds Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
              <span>💸 Quick Share & Transfer Funds</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Select Player Recipient:</label>
                <select
                  value={transferTargetId}
                  onChange={e => setTransferTargetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
                >
                  {players.filter(p => p.status !== 'banned' && p.id !== loggedInPlayerId).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.avatar} {p.name} (Bal: ${p.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Transfer Amount ($ USD):</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={e => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[1000000, 10000000, 50000000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setTransferAmount(amt)}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-300 font-mono text-[10px] py-1 rounded-lg border border-slate-800"
                  >
                    +${(amt / 1000000).toFixed(0)}M
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleTransferFundsToPlayer(transferTargetId, transferAmount)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 transition-all mt-2"
              >
                <span>💸</span>
                <span>Send ${transferAmount.toLocaleString()} Cash</span>
              </button>
            </div>
          </div>

          {/* Shared Treasury Bank Pool Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                <span>🏛️ Shared Server Treasury Bank</span>
              </h3>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Guild Vault
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-1">
              <span className="text-xs text-slate-400">Total Pooled Vault Funds:</span>
              <div className="text-xl font-black text-amber-400 font-mono">
                ${activeServer.treasuryBalance.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={treasuryPoolAmount}
                  onChange={e => setTreasuryPoolAmount(Number(e.target.value))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-amber-300 font-mono font-bold text-xs"
                />
                <button
                  onClick={() => handleDepositToTreasury(treasuryPoolAmount)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow transition-all"
                >
                  Deposit
                </button>
              </div>

              <button
                onClick={() => handleDistributeTreasuryDividends()}
                disabled={activeServer.treasuryBalance <= 0}
                className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold text-xs py-2 rounded-xl border border-amber-500/40 flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>🎁</span>
                <span>Distribute Equal Dividends to All Players</span>
              </button>
            </div>
          </div>

          {/* Activity Ledger */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs font-extrabold text-slate-300">
              <span>📡 Server Transaction & Chat Ledger</span>
              <button onClick={() => setLogs([])} className="text-[10px] text-slate-500 hover:text-white">Clear</button>
            </div>
            <div className="h-44 overflow-y-auto space-y-1 font-mono text-[10.5px] pr-1">
              {logs.map(log => (
                <div
                  key={log.id}
                  className={`p-1.5 rounded border leading-tight ${
                    log.type === 'fund'
                      ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                      : log.type === 'login_control'
                      ? 'bg-amber-950/40 border-amber-900/60 text-amber-300'
                      : log.type === 'chat'
                      ? 'bg-cyan-950/40 border-cyan-900/60 text-cyan-300'
                      : log.type === 'kick'
                      ? 'bg-red-950/40 border-red-900/60 text-red-300'
                      : 'bg-slate-950 border-slate-800/60 text-slate-300'
                  }`}
                >
                  <span className="text-slate-500 mr-1.5">[{log.timestamp}]</span>
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* DRAWER / MODAL: COMPREHENSIVE ACCOUNT CONTROL CENTER (100+ ACCOUNT ACTIONS) */}
      {selectedPlayerForControl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xl w-full space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{selectedPlayerForControl.avatar}</span>
                <div>
                  <h3 className="font-black text-base text-white flex items-center gap-2">
                    <span>{selectedPlayerForControl.name}</span>
                    <span className="text-xs text-amber-300 font-mono">(${selectedPlayerForControl.balance.toLocaleString()})</span>
                  </h3>
                  <p className="text-xs text-slate-400">{selectedPlayerForControl.title} • Role: {selectedPlayerForControl.role.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPlayerForControl(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>

            {/* Control Drawer Navigation Tabs */}
            <div className="flex border-b border-slate-800 text-xs font-bold gap-1">
              {[
                { id: 'login', label: '🔑 Login & Impersonate' },
                { id: 'finance', label: '💸 Financial Actions' },
                { id: 'actions', label: '⚙️ Game Actions' },
                { id: 'chat', label: '💬 Chat & Moderation' },
                { id: 'edit', label: '✏️ Edit Profile' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveControlTab(tab.id as any)}
                  className={`px-3 py-2 border-b-2 transition-all ${
                    activeControlTab === tab.id
                      ? 'border-amber-400 text-amber-300 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: LOGIN & IMPERSONATE */}
            {activeControlTab === 'login' && (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <p className="text-slate-300 leading-relaxed">
                    By logging into <strong className="text-amber-300">{selectedPlayerForControl.name}</strong>'s account, you assume complete operational control over their wallet balance, profile settings, bidding inventory, and game progress!
                  </p>

                  <button
                    onClick={() => {
                      handleLoginToPlayerAccount(selectedPlayerForControl);
                      setSelectedPlayerForControl(null);
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-2.5 rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <span>🔑 LOG INTO THIS ACCOUNT NOW</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleChangeAccountRole(selectedPlayerForControl, 'admin')}
                    className="bg-slate-950 hover:bg-indigo-950 text-indigo-300 border border-indigo-800/60 p-2.5 rounded-xl font-bold text-left"
                  >
                    🛡️ Promote to Admin
                  </button>
                  <button
                    onClick={() => handleChangeAccountRole(selectedPlayerForControl, 'member')}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 p-2.5 rounded-xl font-bold text-left"
                  >
                    👤 Set to Member Role
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FINANCIAL ACTIONS */}
            {activeControlTab === 'finance' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSeizePlayerFunds(selectedPlayerForControl)}
                    className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 p-3 rounded-xl font-bold text-left"
                  >
                    <div className="font-black text-sm">⚡ Force Seize 100% Funds</div>
                    <div className="text-[10px] text-red-400">Drain balance into host wallet</div>
                  </button>

                  <button
                    onClick={() => handleInjectCashToAccount(selectedPlayerForControl, 50000000)}
                    className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 p-3 rounded-xl font-bold text-left"
                  >
                    <div className="font-black text-sm">💵 Inject +$50,000,000 Cash</div>
                    <div className="text-[10px] text-emerald-400">Add free cash stimulus</div>
                  </button>

                  <button
                    onClick={() => handleDoubleAccountBalance(selectedPlayerForControl)}
                    className="bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 p-3 rounded-xl font-bold text-left"
                  >
                    <div className="font-black text-sm">📈 Double Wallet (2x)</div>
                    <div className="text-[10px] text-amber-400">Multiply current balance</div>
                  </button>

                  <button
                    onClick={() => handleToggleFreezeAccount(selectedPlayerForControl)}
                    className="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 p-3 rounded-xl font-bold text-left"
                  >
                    <div className="font-black text-sm">❄️ {selectedPlayerForControl.isFrozen ? 'Unfreeze Wallet' : 'Freeze Wallet'}</div>
                    <div className="text-[10px] text-cyan-400">Toggle spending freeze</div>
                  </button>

                  <button
                    onClick={() => handleForceBankruptAccount(selectedPlayerForControl)}
                    className="bg-slate-950 hover:bg-rose-950 border border-rose-900 text-rose-300 p-3 rounded-xl font-bold text-left col-span-2"
                  >
                    <div className="font-black text-sm">📉 Wipe Wallet to $0</div>
                    <div className="text-[10px] text-rose-400">Force immediate bankruptcy</div>
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: GAME ACTIONS */}
            {activeControlTab === 'actions' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleForceAccountChatSpam(selectedPlayerForControl, "Placing $10,000,000 auto-bid on auction lot!")}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 p-3 rounded-xl font-bold text-left"
                  >
                    🔨 Force Place Auction Bid
                  </button>

                  <button
                    onClick={() => handleForceAccountChatSpam(selectedPlayerForControl, "Threw 500 Coins in Roblox Toss Game!")}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 p-3 rounded-xl font-bold text-left"
                  >
                    🪙 Force Throw Roblox Coins
                  </button>

                  <button
                    onClick={() => handleForceAccountChatSpam(selectedPlayerForControl, "Bought 100 Powerball Lottery Tickets!")}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 p-3 rounded-xl font-bold text-left"
                  >
                    🎟️ Force Buy Lottery Tickets
                  </button>

                  <button
                    onClick={() => handleForceAccountChatSpam(selectedPlayerForControl, "ALL HAIL BEN OVERLORD!")}
                    className="bg-slate-950 hover:bg-amber-950 border border-amber-800 text-amber-300 p-3 rounded-xl font-bold text-left"
                  >
                    👑 Force Praise Server Host
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CHAT & MODERATION */}
            {activeControlTab === 'chat' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleMuteAccount(selectedPlayerForControl)}
                    className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 p-3 rounded-xl font-bold text-left"
                  >
                    🤐 {selectedPlayerForControl.isMuted ? 'Unmute Chat' : 'Mute Chat'}
                  </button>

                  <button
                    onClick={() => handleToggleKickOrBan(selectedPlayerForControl)}
                    className="bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 p-3 rounded-xl font-bold text-left"
                  >
                    🚫 {selectedPlayerForControl.status === 'banned' ? 'Unban Account' : 'Ban & Kick Account'}
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <label className="text-slate-400 font-bold block mb-1">Make Account Say Chat Message:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="customChatMsg"
                      placeholder="e.g. Selling rare items!"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white"
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('customChatMsg') as HTMLInputElement;
                        if (el && el.value) handleForceAccountChatSpam(selectedPlayerForControl, el.value);
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-xl"
                    >
                      Send 💬
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EDIT PROFILE */}
            {activeControlTab === 'edit' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Display Name:</label>
                    <input
                      type="text"
                      value={editNameInput}
                      onChange={e => setEditNameInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Avatar Emoji:</label>
                    <input
                      type="text"
                      value={editAvatarInput}
                      onChange={e => setEditAvatarInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xl text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Title Badge:</label>
                    <input
                      type="text"
                      value={editTitleInput}
                      onChange={e => setEditTitleInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Clan Tag:</label>
                    <input
                      type="text"
                      value={editClanTagInput}
                      onChange={e => setEditClanTagInput(e.target.value)}
                      placeholder="e.g. GUILD"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-cyan-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Wallet Balance ($):</label>
                    <input
                      type="number"
                      value={editBalanceInput}
                      onChange={e => setEditBalanceInput(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">VIP Level (1-10):</label>
                    <input
                      type="number"
                      value={editVipInput}
                      onChange={e => setEditVipInput(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-amber-300 font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveAccountProfileEdits}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg mt-2"
                >
                  Save Account Edits ✏️
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Modal: Add New Custom Player Account */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white">➕ Add New Custom Player Account</h3>
              <button onClick={() => setShowAddPlayerModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Player Display Name:</label>
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  placeholder="e.g. SpeedRunner2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Avatar Emoji:</label>
                <input
                  type="text"
                  value={newPlayerAvatar}
                  onChange={e => setNewPlayerAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Title Badge:</label>
                <input
                  type="text"
                  value={newPlayerTitle}
                  onChange={e => setNewPlayerTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Starting Wallet Balance ($ USD):</label>
                <input
                  type="number"
                  value={newPlayerBalance}
                  onChange={e => setNewPlayerBalance(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddPlayerModal(false)}
                className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPlayerAccount}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs px-5 py-2 rounded-xl shadow-lg"
              >
                Create Account 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Server */}
      {showCreateServerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white">🖥️ Host New Multiplayer Server</h3>
              <button onClick={() => setShowCreateServerModal(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Server Name:</label>
                <input
                  type="text"
                  value={newServerName}
                  onChange={e => setNewServerName(e.target.value)}
                  placeholder="e.g. Ben's High-Stakes Overlord Network"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Max Player Capacity:</label>
                <input
                  type="number"
                  value={newServerMaxPlayers}
                  onChange={e => setNewServerMaxPlayers(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCreateServerModal(false)}
                className="bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newServerName.trim()) return;
                  const srv: ServerRoom = {
                    id: 'srv-' + Date.now(),
                    name: newServerName.trim(),
                    hostName: currentProfile.name,
                    hostAvatar: currentProfile.avatar,
                    maxPlayers: newServerMaxPlayers,
                    currentPlayers: 1,
                    treasuryBalance: 500000000,
                    sharedFundPolicy: 'open',
                    isPrivate: false,
                    region: 'US-East (Virginia)',
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 200)}:25565`,
                    taxRatePercent: 2,
                  };
                  setServers(prev => [srv, ...prev]);
                  setActiveServer(srv);
                  setShowCreateServerModal(false);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2 rounded-xl shadow-lg"
              >
                Launch Server 🖥️
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
