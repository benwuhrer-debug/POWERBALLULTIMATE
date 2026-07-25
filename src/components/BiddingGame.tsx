/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';
import { RebirthManager } from './RebirthManager';
import { LiveEventsManager } from './LiveEventsManager';

interface BiddingGameProps {
  cheatBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  soundEnabled: boolean;
  userProfile?: {
    name: string;
    avatar: string;
    title?: string;
  };
}

export interface AuctionItem {
  id: string;
  name: string;
  category: 'Roblox Relic' | 'Quantum Tech' | 'Hypercar' | 'Sovereign Artifact' | 'Mythic Crate';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic' | 'Godly';
  icon: string;
  baseValuation: number;
  currentBid: number;
  minIncrement: number;
  highestBidder: string;
  isUserHighest: boolean;
  timeLeft: number; // in seconds
  status: 'active' | 'ended' | 'sold_to_user';
  description: string;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  icon: string;
  rarity: string;
  purchasedPrice: number;
  marketValue: number;
  acquiredAt: string;
}

export interface BotBidder {
  name: string;
  avatar: string;
  aggression: number; // 0-1
  budget: number;
  title: string;
  quote: string;
}

export interface WorldCurrency {
  code: string;
  name: string;
  symbol: string;
  rateToUsd: number; // units per 1 USD
  flag: string;
  category: 'fiat' | 'crypto' | 'commodity' | 'gaming';
}

export const WORLD_CURRENCIES: WorldCurrency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToUsd: 1, flag: '🇺🇸', category: 'fiat' },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToUsd: 0.92, flag: '🇪🇺', category: 'fiat' },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToUsd: 0.79, flag: '🇬🇧', category: 'fiat' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateToUsd: 155.20, flag: '🇯🇵', category: 'fiat' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rateToUsd: 1.36, flag: '🇨🇦', category: 'fiat' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateToUsd: 1.52, flag: '🇦🇺', category: 'fiat' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', rateToUsd: 0.89, flag: '🇨🇭', category: 'fiat' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rateToUsd: 7.24, flag: '🇨🇳', category: 'fiat' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateToUsd: 83.50, flag: '🇮🇳', category: 'fiat' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rateToUsd: 5.45, flag: '🇧🇷', category: 'fiat' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rateToUsd: 88.00, flag: '🇷🇺', category: 'fiat' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rateToUsd: 18.20, flag: '🇿🇦', category: 'fiat' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', rateToUsd: 3.67, flag: '🇦🇪', category: 'fiat' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rateToUsd: 1380.00, flag: '🇰🇷', category: 'fiat' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', rateToUsd: 18.10, flag: '🇲🇽', category: 'fiat' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', rateToUsd: 0.000015, flag: '🪙', category: 'crypto' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', rateToUsd: 0.00028, flag: '🔮', category: 'crypto' },
  { code: 'GOLD', name: 'Fine Gold Ounces', symbol: 'oz', rateToUsd: 0.00042, flag: '🧈', category: 'commodity' },
  { code: 'RBX', name: 'Roblox Robux', symbol: 'R$', rateToUsd: 80.00, flag: '🟥', category: 'gaming' },
];

const BOT_NAMES: BotBidder[] = [
  { name: 'CryptoWhale_99', avatar: '🐳', aggression: 0.9, budget: 500000000, title: 'Crypto Billionaire', quote: 'HODL until the sun burns out.' },
  { name: 'Builderman_Official', avatar: '👷', aggression: 0.7, budget: 100000000, title: 'Roblox Founder', quote: 'Building the metaverse one block at a time.' },
  { name: 'DominusCollector_X', avatar: '👑', aggression: 0.95, budget: 1000000000, title: 'Godly Relic Collector', quote: 'I buy every Dominus in existence.' },
  { name: 'NoobTrader2026', avatar: '👶', aggression: 0.3, budget: 10000, title: 'Rookie Trader', quote: 'Pls donate robux or cheap items 😭' },
  { name: 'QuantumInvestor', avatar: '⚛️', aggression: 0.8, budget: 250000000, title: 'AI Quant Trader', quote: 'Calculating optimal arbitrage curves.' },
  { name: 'SovereignVault_Bot', avatar: '🏛️', aggression: 0.85, budget: 800000000, title: 'Swiss Bank Reserve', quote: 'Guaranteed liquidity for high net-worth assets.' },
];

const INITIAL_AUCTION_ITEMS: Omit<AuctionItem, 'id' | 'currentBid' | 'highestBidder' | 'isUserHighest' | 'timeLeft' | 'status'>[] = [
  {
    name: 'Roblox Dominus Empyreus #001',
    category: 'Roblox Relic',
    rarity: 'Godly',
    icon: '👑',
    baseValuation: 250000000,
    minIncrement: 5000000,
    description: 'Ultra-rare mythical hood from 2010. Pure status symbol in Roblox economy.',
  },
  {
    name: 'Antimatter Quantum Reactor Core',
    category: 'Quantum Tech',
    rarity: 'Mythic',
    icon: '⚛️',
    baseValuation: 50000000,
    minIncrement: 1000000,
    description: 'Generates infinite zero-point energy and bends server time continuum.',
  },
  {
    name: 'Bugatti Tourbillon Diamond Edition',
    category: 'Hypercar',
    rarity: 'Legendary',
    icon: '🏎️',
    baseValuation: 12000000,
    minIncrement: 500000,
    description: 'V16 hybrid hypercar with solid diamond trim and titanium exhaust.',
  },
  {
    name: '100KG Sovereign Bullion Gold Bar',
    category: 'Sovereign Artifact',
    rarity: 'Epic',
    icon: '🧈',
    baseValuation: 8500000,
    minIncrement: 250000,
    description: 'Swiss central bank certified 99.99% pure gold bullion slab.',
  },
  {
    name: 'Mythic Galaxy Mystery Crate x10',
    category: 'Mythic Crate',
    rarity: 'Rare',
    icon: '📦',
    baseValuation: 500000,
    minIncrement: 25000,
    description: 'Contains guaranteed top-tier loot drops and infinite multipliers.',
  },
];

export interface BotChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  senderRole: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  targetBot?: string;
}

export const BiddingGame: React.FC<BiddingGameProps> = ({
  cheatBalance,
  onUpdateBalance,
  soundEnabled,
  userProfile,
}) => {
  const userDisplayName = userProfile?.name
    ? `${userProfile.avatar || '👤'} ${userProfile.name}`
    : '👤 YOU';

  // Navigation: 'live' | 'inventory' | 'trade' | 'rebirth' | 'events' | 'chat' | 'admin'
  const [activeTab, setActiveTab] = useState<'live' | 'inventory' | 'trade' | 'rebirth' | 'events' | 'chat' | 'admin'>('live');

  // Auction Items State
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);

  // User Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // World Currencies State
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>('USD');
  const [forexRates, setForexRates] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    WORLD_CURRENCIES.forEach(c => { initial[c.code] = c.rateToUsd; });
    return initial;
  });

  // User Auto-Bidder State
  const [autoBidActive, setAutoBidActive] = useState<Record<string, boolean>>({ GLOBAL: true });
  const [autoBidMaxLimit, setAutoBidMaxLimit] = useState<number>(1000000000000000);

  // Bot Inventories State for Trading
  const [botInventories, setBotInventories] = useState<Record<string, { cash: number; items: InventoryItem[] }>>({
    'CryptoWhale_99': {
      cash: 500000000,
      items: [
        { id: 'bot-cw-1', itemId: 'dom-inf', name: 'Roblox Dominus Infernus #002', icon: '👑', rarity: 'Godly', purchasedPrice: 200000000, marketValue: 300000000, acquiredAt: '08:00:00' },
        { id: 'bot-cw-2', itemId: 'btc-reserve', name: '10,000 BTC Crypto Reserve Key', icon: '🪙', rarity: 'Mythic', purchasedPrice: 100000000, marketValue: 150000000, acquiredAt: '08:05:00' },
        { id: 'bot-cw-3', itemId: 'koenigsegg', name: 'Diamond Trim Koenigsegg Jesko', icon: '🏎️', rarity: 'Legendary', purchasedPrice: 18000000, marketValue: 25000000, acquiredAt: '08:10:00' },
      ],
    },
    'Builderman_Official': {
      cash: 100000000,
      items: [
        { id: 'bot-bm-1', itemId: 'builder-helm', name: 'Golden Roblox Builder Helmet 2007', icon: '🪖', rarity: 'Godly', purchasedPrice: 150000000, marketValue: 200000000, acquiredAt: '08:00:00' },
        { id: 'bot-bm-2', itemId: 'robux-vault', name: '100,000,000 Robux Card Vault', icon: '🟥', rarity: 'Mythic', purchasedPrice: 60000000, marketValue: 80000000, acquiredAt: '08:02:00' },
        { id: 'bot-bm-3', itemId: 'wooden-sword', name: 'Classic Wooden Sword Relic', icon: '🗡️', rarity: 'Epic', purchasedPrice: 3000000, marketValue: 5000000, acquiredAt: '08:04:00' },
      ],
    },
    'DominusCollector_X': {
      cash: 1000000000,
      items: [
        { id: 'bot-dc-1', itemId: 'dom-frig', name: 'Roblox Dominus Frigidus #007', icon: '❄️', rarity: 'Godly', purchasedPrice: 300000000, marketValue: 400000000, acquiredAt: '08:00:00' },
        { id: 'bot-dc-2', itemId: 'dom-aur', name: 'Roblox Dominus Aureus #003', icon: '✨', rarity: 'Godly', purchasedPrice: 280000000, marketValue: 350000000, acquiredAt: '08:01:00' },
        { id: 'bot-dc-3', itemId: 'crown-kings', name: 'Sovereign Crown of Kings', icon: '👑', rarity: 'Mythic', purchasedPrice: 70000000, marketValue: 90000000, acquiredAt: '08:03:00' },
      ],
    },
    'NoobTrader2026': {
      cash: 15000,
      items: [
        { id: 'bot-nt-1', itemId: 'box-coin', name: 'Cardboard Box & Rusty Coin', icon: '📦', rarity: 'Common', purchasedPrice: 30, marketValue: 50, acquiredAt: '08:00:00' },
        { id: 'bot-nt-2', itemId: 'bacon-wig', name: 'Used Bacon Hair Wig', icon: '🥓', rarity: 'Common', purchasedPrice: 80, marketValue: 100, acquiredAt: '08:01:00' },
        { id: 'bot-nt-3', itemId: 'plastic-sword', name: 'Plastic Toy Sword', icon: '🗡️', rarity: 'Common', purchasedPrice: 150, marketValue: 250, acquiredAt: '08:02:00' },
      ],
    },
    'QuantumInvestor': {
      cash: 250000000,
      items: [
        { id: 'bot-qi-1', itemId: 'quantum-sphere', name: 'Zero-Point Quantum Energy Sphere', icon: '⚛️', rarity: 'Mythic', purchasedPrice: 120000000, marketValue: 180000000, acquiredAt: '08:00:00' },
        { id: 'bot-qi-2', itemId: 'hft-algo', name: 'High-Frequency HFT Trading Bot', icon: '💻', rarity: 'Epic', purchasedPrice: 30000000, marketValue: 45000000, acquiredAt: '08:02:00' },
      ],
    },
    'SovereignVault_Bot': {
      cash: 800000000,
      items: [
        { id: 'bot-sv-1', itemId: 'swiss-gold', name: '500KG Swiss Gold Vault Slab', icon: '🧈', rarity: 'Godly', purchasedPrice: 400000000, marketValue: 500000000, acquiredAt: '08:00:00' },
        { id: 'bot-sv-2', itemId: 'diamond-scepter', name: 'Imperial Diamond Scepter', icon: '💎', rarity: 'Mythic', purchasedPrice: 90000000, marketValue: 120000000, acquiredAt: '08:01:00' },
      ],
    },
  });

  // Trading Active Session State
  const [selectedTradePartner, setSelectedTradePartner] = useState<string>('CryptoWhale_99');
  const [myOfferedItemIds, setMyOfferedItemIds] = useState<string[]>([]);
  const [myOfferedCash, setMyOfferedCash] = useState<number>(0);
  const [partnerRequestedItemIds, setPartnerRequestedItemIds] = useState<string[]>([]);
  const [partnerRequestedCash, setPartnerRequestedCash] = useState<number>(0);
  const [tradeStatusNotice, setTradeStatusNotice] = useState<string>('Select items or cash to build your trade offer.');
  const [lastCompletedTrade, setLastCompletedTrade] = useState<{
    partner: string;
    myItemsGiven: InventoryItem[];
    myCashGiven: number;
    partnerItemsReceived: InventoryItem[];
    partnerCashReceived: number;
  } | null>(null);

  // Super OP Admin Scam & Trade Rigging Hacks State
  const [forceWinCostOne, setForceWinCostOne] = useState<boolean>(false);
  const [kickAllBots, setKickAllBots] = useState<boolean>(false);
  const [riggedReserveZero, setRiggedReserveZero] = useState<boolean>(false);
  const [autoSellMultiplier, setAutoSellMultiplier] = useState<number>(100);

  // Admin Trade Scam Tools
  const [adminForceAcceptTrade, setAdminForceAcceptTrade] = useState<boolean>(true); // Default ON for OP fun!
  const [adminCounterfeitSwap, setAdminCounterfeitSwap] = useState<boolean>(false);
  const [adminPhantomCash, setAdminPhantomCash] = useState<boolean>(false);
  const [adminFakeItemValuation, setAdminFakeItemValuation] = useState<boolean>(false);
  const [adminDrainTargetBot, setAdminDrainTargetBot] = useState<string>('CryptoWhale_99');

  // Live Bid Activity Logs
  const [activityLogs, setActivityLogs] = useState<Array<{ id: number; text: string; type: 'user' | 'bot' | 'system' | 'win' | 'admin' }>>([
    { id: 1, text: '[AUCTION ENGINE] Live bidding server initialized. Connected to Global Vault.', type: 'system' },
    { id: 2, text: '[LOT #101] Roblox Dominus Empyreus opening bid set to $250,000,000', type: 'system' },
  ]);

  // Interactive Bot Chatroom State
  const [chatMessages, setChatMessages] = useState<BotChatMessage[]>([
    {
      id: 'msg-1',
      senderName: 'Builderman_Official',
      senderAvatar: '👷',
      senderRole: 'bot',
      text: 'Welcome to the High-Stakes Auction Hall! I brought 100M Robux budget for Dominus items today!',
      timestamp: '07:50:00',
    },
    {
      id: 'msg-2',
      senderName: 'CryptoWhale_99',
      senderAvatar: '🐳',
      senderRole: 'bot',
      text: 'Just dumped 5,000 Bitcoin to bid on the Antimatter Quantum Core. Good luck outbidding me!',
      timestamp: '07:50:15',
    },
    {
      id: 'msg-3',
      senderName: 'NoobTrader2026',
      senderAvatar: '👶',
      senderRole: 'bot',
      text: 'pls bro someone spare 10k cash I want to bid on mystery crate 😭',
      timestamp: '07:50:30',
    },
  ]);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [chatTargetBot, setChatTargetBot] = useState<string>('all');
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Helper log function
  const addLog = (text: string, type: 'user' | 'bot' | 'system' | 'win' | 'admin' = 'system') => {
    setActivityLogs(prev => [
      ...prev.slice(-49),
      { id: Date.now() + Math.random(), text: `[${new Date().toLocaleTimeString()}] ${text}`, type }
    ]);
  };

  // Helper: Format USD value into selected World Currency
  const formatCurrency = (usdAmount: number, code: string = selectedCurrencyCode): string => {
    const curr = WORLD_CURRENCIES.find(c => c.code === code) || WORLD_CURRENCIES[0];
    const rate = forexRates[code] || curr.rateToUsd;
    const converted = usdAmount * rate;

    if (code === 'BTC') {
      return `${converted.toFixed(4)} ₿`;
    }
    if (code === 'ETH') {
      return `${converted.toFixed(2)} Ξ`;
    }
    if (code === 'GOLD') {
      return `${converted.toFixed(2)} oz Gold`;
    }
    if (code === 'RBX') {
      return `${Math.floor(converted).toLocaleString()} R$`;
    }
    if (code === 'JPY' || code === 'KRW') {
      return `${curr.symbol}${Math.floor(converted).toLocaleString()}`;
    }

    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${curr.code}`;
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isBotTyping]);

  // Forex exchange rate slight random fluctuations
  useEffect(() => {
    const fxInterval = setInterval(() => {
      setForexRates(prev => {
        const next = { ...prev };
        WORLD_CURRENCIES.forEach(c => {
          if (c.code !== 'USD') {
            const delta = (Math.random() - 0.5) * 0.005;
            next[c.code] = Math.max(0.000001, prev[c.code] * (1 + delta));
          }
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(fxInterval);
  }, []);

  // Spawn new auction lot
  const createNewAuction = (customItem?: Partial<AuctionItem>) => {
    const template = INITIAL_AUCTION_ITEMS[Math.floor(Math.random() * INITIAL_AUCTION_ITEMS.length)];
    const id = 'LOT-' + Math.floor(1000 + Math.random() * 9000);
    const startPrice = riggedReserveZero ? 1 : Math.floor(template.baseValuation * (0.4 + Math.random() * 0.3));

    const newAuction: AuctionItem = {
      id,
      name: customItem?.name || template.name,
      category: customItem?.category || template.category,
      rarity: customItem?.rarity || template.rarity,
      icon: customItem?.icon || template.icon,
      baseValuation: customItem?.baseValuation || template.baseValuation,
      currentBid: startPrice,
      minIncrement: customItem?.minIncrement || template.minIncrement,
      highestBidder: 'Reserve Price',
      isUserHighest: false,
      timeLeft: Math.floor(20 + Math.random() * 30),
      status: 'active',
      description: customItem?.description || template.description,
    };

    setAuctions(prev => [newAuction, ...prev]);
    if (!selectedAuctionId) setSelectedAuctionId(id);
    addLog(`[NEW LOT] ${newAuction.name} (Opening Bid: $${startPrice.toLocaleString()})`, 'system');
  };

  // Initialize initial auctions
  useEffect(() => {
    if (auctions.length === 0) {
      INITIAL_AUCTION_ITEMS.forEach((item, idx) => {
        setTimeout(() => {
          createNewAuction(item);
        }, idx * 100);
      });
    }
  }, []);

  // Main Timer & Bot Bidding Engine Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setAuctions(prevAuctions => {
        return prevAuctions.map(auc => {
          if (auc.status !== 'active') return auc;

          const newTimeLeft = auc.timeLeft - 1;

          // Check if time expired
          if (newTimeLeft <= 0) {
            if (auc.isUserHighest) {
              // User won!
              addLog(`[AUCTION WON!] 🎉 You won ${auc.name} for $${auc.currentBid.toLocaleString()}!`, 'win');
              if (soundEnabled) playJackpotSound(soundEnabled);

              // Add bot chat reaction
              setChatMessages(prev => [
                ...prev,
                {
                  id: 'won-' + Date.now(),
                  senderName: 'DominusCollector_X',
                  senderAvatar: '👑',
                  senderRole: 'bot',
                  text: `🔥 WOW! ${userProfile?.name || 'You'} won ${auc.name}! If you want to resell it in Robux or Bitcoin, check your Inventory!`,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);

              // Add to inventory
              setInventory(inv => [
                {
                  id: 'INV-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                  itemId: auc.id,
                  name: auc.name,
                  icon: auc.icon,
                  rarity: auc.rarity,
                  purchasedPrice: auc.currentBid,
                  marketValue: auc.baseValuation * (1.2 + Math.random() * 0.8),
                  acquiredAt: new Date().toLocaleTimeString(),
                },
                ...inv,
              ]);

              return { ...auc, timeLeft: 0, status: 'sold_to_user' };
            } else {
              // Bot won or unsold
              addLog(`[AUCTION ENDED] ${auc.name} sold to ${auc.highestBidder} for $${auc.currentBid.toLocaleString()}`, 'system');
              return { ...auc, timeLeft: 0, status: 'ended' };
            }
          }

          // Bot Bidding Logic (if bots are not kicked)
          if (!kickAllBots && Math.random() < 0.35 && !auc.isUserHighest) {
            const randomBot = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
            const raise = auc.minIncrement * (1 + Math.floor(Math.random() * 2));
            const newBid = auc.currentBid + raise;

            if (newBid <= randomBot.budget) {
              addLog(`[BID] ${randomBot.avatar} ${randomBot.name} raised bid on ${auc.name} to $${newBid.toLocaleString()}`, 'bot');
              if (soundEnabled) playTickSound(soundEnabled);

              // Occasional Bot Chat Taunt
              if (Math.random() < 0.2) {
                setChatMessages(msgs => [
                  ...msgs.slice(-40),
                  {
                    id: 'taunt-' + Date.now(),
                    senderName: randomBot.name,
                    senderAvatar: randomBot.avatar,
                    senderRole: 'bot',
                    text: `Outbidding everyone on ${auc.name}! Current bid is now $${newBid.toLocaleString()}! ${randomBot.quote}`,
                    timestamp: new Date().toLocaleTimeString(),
                  }
                ]);
              }

              // Reset time if close to ending to prolong drama
              const extendedTime = newTimeLeft < 5 ? newTimeLeft + 8 : newTimeLeft;

              return {
                ...auc,
                currentBid: newBid,
                highestBidder: `${randomBot.avatar} ${randomBot.name}`,
                isUserHighest: false,
                timeLeft: extendedTime,
              };
            }
          }

          // User Auto-Bidder Logic
          const isAutoBidEnabled = autoBidActive[auc.id] || autoBidActive['GLOBAL'];
          if (isAutoBidEnabled && !auc.isUserHighest) {
            const autoNextBid = forceWinCostOne ? 1 : auc.currentBid + auc.minIncrement;
            const costDeducted = forceWinCostOne ? 1 : autoNextBid;
            
            onUpdateBalance(cheatBalance >= costDeducted ? cheatBalance - costDeducted : cheatBalance + 1000000000);
            addLog(`[AUTO-BID] Executed auto-raise on ${auc.name} to $${autoNextBid.toLocaleString()}`, 'user');
            if (soundEnabled) playCoinSound(soundEnabled);

            return {
              ...auc,
              currentBid: autoNextBid,
              highestBidder: `${userDisplayName} (Auto-Bidder)`,
              isUserHighest: true,
              timeLeft: newTimeLeft < 5 ? newTimeLeft + 5 : newTimeLeft,
            };
          }

          return { ...auc, timeLeft: newTimeLeft };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [kickAllBots, autoBidActive, autoBidMaxLimit, cheatBalance, soundEnabled, onUpdateBalance, userProfile]);

  // Handle Manual User Bid
  const handlePlaceUserBid = (auction: AuctionItem, customAmount?: number) => {
    const bidAmount = customAmount || (auction.currentBid + auction.minIncrement);

    if (cheatBalance < bidAmount) {
      addLog(`[FAIL] Insufficient funds to place bid of $${bidAmount.toLocaleString()}`, 'admin');
      return;
    }

    if (bidAmount <= auction.currentBid && !forceWinCostOne) {
      addLog(`[FAIL] Bid must be greater than current bid ($${auction.currentBid.toLocaleString()})`, 'admin');
      return;
    }

    const actualCost = forceWinCostOne ? 1 : bidAmount;

    // Deduct bid from cheat balance
    onUpdateBalance(cheatBalance - actualCost);

    setAuctions(prev =>
      prev.map(a =>
        a.id === auction.id
          ? {
              ...a,
              currentBid: actualCost,
              highestBidder: `${userDisplayName} (High Bidder)`,
              isUserHighest: true,
              timeLeft: a.timeLeft < 5 ? a.timeLeft + 6 : a.timeLeft,
            }
          : a
      )
    );

    addLog(`[YOUR BID] Placed winning bid of $${actualCost.toLocaleString()} on ${auction.name}!`, 'user');
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // OP Admin: Force Instant Win
  const handleForceInstantWin = (auction: AuctionItem) => {
    onUpdateBalance(cheatBalance - 1);
    setAuctions(prev =>
      prev.map(a =>
        a.id === auction.id
          ? {
              ...a,
              currentBid: 1,
              highestBidder: `${userDisplayName} (OP Force Win)`,
              isUserHighest: true,
              timeLeft: 0,
              status: 'sold_to_user',
            }
          : a
      )
    );

    setInventory(inv => [
      {
        id: 'INV-' + Date.now(),
        itemId: auction.id,
        name: auction.name,
        icon: auction.icon,
        rarity: auction.rarity,
        purchasedPrice: 1,
        marketValue: auction.baseValuation * 10,
        acquiredAt: new Date().toLocaleTimeString(),
      },
      ...inv,
    ]);

    addLog(`[ADMIN OP WIN] Force-claimed ${auction.name} for $1! Market Valuation: $${(auction.baseValuation * 10).toLocaleString()}`, 'admin');
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // Resell item from inventory in chosen World Currency
  const handleSellItemInCurrency = (item: InventoryItem, multiplier = 1, currencyCode = selectedCurrencyCode) => {
    const salePriceUsd = Math.floor(item.marketValue * multiplier);
    onUpdateBalance(cheatBalance + salePriceUsd);
    setInventory(prev => prev.filter(i => i.id !== item.id));

    const formattedVal = formatCurrency(salePriceUsd, currencyCode);

    addLog(`[FOREX RESELL] Sold ${item.name} for ${formattedVal} (+$${salePriceUsd.toLocaleString()} USD equiv)!`, 'win');
    if (soundEnabled) playCoinSound(soundEnabled);

    // Add bot chat notification
    setChatMessages(prev => [
      ...prev,
      {
        id: 'resell-' + Date.now(),
        senderName: 'QuantumInvestor',
        senderAvatar: '⚛️',
        senderRole: 'bot',
        text: `📈 [FOREX TRADE] ${userProfile?.name || 'Player'} just liquidated ${item.name} for ${formattedVal}! Arbitrage completed!`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Resell all items in chosen World Currency
  const handleSellAllInventory = (mult = autoSellMultiplier, currencyCode = selectedCurrencyCode) => {
    let totalEarningsUsd = 0;
    inventory.forEach(item => {
      totalEarningsUsd += Math.floor(item.marketValue * mult);
    });
    onUpdateBalance(cheatBalance + totalEarningsUsd);
    setInventory([]);

    const formattedVal = formatCurrency(totalEarningsUsd, currencyCode);

    addLog(`[OP MULTI-CURRENCY SELL] Liquidated ${inventory.length} items for total ${formattedVal} (+$${totalEarningsUsd.toLocaleString()} USD)!`, 'admin');
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // Trade Execution Logic with OP Admin Scam/Rigging overrides
  const handleExecuteTradeOffer = () => {
    const partnerData = botInventories[selectedTradePartner];
    if (!partnerData) return;

    // Items user is giving
    const userOfferedItems = inventory.filter(item => myOfferedItemIds.includes(item.id));
    // Items user is requesting from partner
    const partnerRequestedItems = partnerData.items.filter(item => partnerRequestedItemIds.includes(item.id));

    // Valuations calculation
    const realUserItemsValue = userOfferedItems.reduce((acc, i) => acc + i.marketValue, 0);
    const userDisplayItemsValue = adminFakeItemValuation ? realUserItemsValue * 100 + 999999999 : realUserItemsValue;
    const userCashOffered = myOfferedCash;
    const userEffectiveCash = adminPhantomCash ? userCashOffered + 1000000000 : userCashOffered;

    const totalUserValueGiven = userDisplayItemsValue + userEffectiveCash;

    const partnerItemsValue = partnerRequestedItems.reduce((acc, i) => acc + i.marketValue, 0);
    const partnerCashRequested = partnerRequestedCash;

    const totalPartnerValueGiven = partnerItemsValue + partnerCashRequested;

    // Check if user has enough cash if offering real cash (unless phantom cash is active)
    if (!adminPhantomCash && userCashOffered > cheatBalance) {
      setTradeStatusNotice('⚠️ Trade Failed: You do not have enough cash balance!');
      return;
    }

    // Check if partner has enough cash
    if (partnerCashRequested > partnerData.cash) {
      setTradeStatusNotice(`⚠️ Trade Failed: ${selectedTradePartner} does not have $${partnerCashRequested.toLocaleString()} cash!`);
      return;
    }

    // Evaluate trade acceptance
    const isAcceptedByBot = adminForceAcceptTrade || totalUserValueGiven >= (totalPartnerValueGiven * 0.85);

    if (!isAcceptedByBot) {
      setTradeStatusNotice(`❌ ${selectedTradePartner} DECLINED the trade offer! "Your offer ($${totalUserValueGiven.toLocaleString()}) is too low for my items ($${totalPartnerValueGiven.toLocaleString()})!"`);
      addLog(`[TRADE REJECTED] ${selectedTradePartner} declined trade from player.`, 'bot');
      return;
    }

    // --- TRADE ACCEPTED! EXECUTE TRANSFER ---
    let finalItemsGivenToPartner: InventoryItem[] = userOfferedItems;

    // If Counterfeit Swap is enabled, replace user's offered items with a $0 Fake Replica
    if (adminCounterfeitSwap && userOfferedItems.length > 0) {
      finalItemsGivenToPartner = [
        {
          id: 'FAKE-' + Date.now(),
          itemId: 'fake-box',
          name: '📦 Cardboard Box Replica (Counterfeit Fake)',
          icon: '📦',
          rarity: 'Common',
          purchasedPrice: 0,
          marketValue: 0,
          acquiredAt: new Date().toLocaleTimeString(),
        }
      ];
      addLog(`[OP ADMIN SCAM] 🎭 Counterfeit Swap Active! Kept your real items and gave ${selectedTradePartner} a $0 Cardboard Box!`, 'admin');
    } else {
      // Remove given items from user inventory
      setInventory(prev => prev.filter(i => !myOfferedItemIds.includes(i.id)));
    }

    // Remove requested items from partner inventory and add user given items to partner
    setBotInventories(prev => {
      const partner = prev[selectedTradePartner];
      const nextItems = partner.items.filter(i => !partnerRequestedItemIds.includes(i.id));
      const nextCash = partner.cash - partnerRequestedCash + (adminPhantomCash ? 0 : userCashOffered);

      return {
        ...prev,
        [selectedTradePartner]: {
          cash: Math.max(0, nextCash),
          items: [...finalItemsGivenToPartner, ...nextItems],
        }
      };
    });

    // Add requested items to user inventory
    setInventory(prev => [...partnerRequestedItems, ...prev]);

    // Update user cash balance
    const realUserCashDeduction = adminPhantomCash ? 0 : userCashOffered;
    onUpdateBalance(cheatBalance - realUserCashDeduction + partnerRequestedCash);

    // Record last completed trade for chargeback / undo
    setLastCompletedTrade({
      partner: selectedTradePartner,
      myItemsGiven: userOfferedItems,
      myCashGiven: realUserCashDeduction,
      partnerItemsReceived: partnerRequestedItems,
      partnerCashReceived: partnerRequestedCash,
    });

    // Clear trade selections
    setMyOfferedItemIds([]);
    setMyOfferedCash(0);
    setPartnerRequestedItemIds([]);
    setPartnerRequestedCash(0);

    const logPrefix = adminForceAcceptTrade ? '⚡ [OP FORCE-ACCEPT SCAM]' : '🤝 [TRADE COMPLETED]';
    const statusMsg = `${logPrefix} Trade executed with ${selectedTradePartner}! Received ${partnerRequestedItems.length} items & +$${partnerRequestedCash.toLocaleString()} cash!`;
    setTradeStatusNotice(statusMsg);
    addLog(statusMsg, adminForceAcceptTrade ? 'admin' : 'win');

    if (soundEnabled) playJackpotSound(soundEnabled);

    // Add Bot Chat Reaction
    setChatMessages(prev => [
      ...prev,
      {
        id: 'trade-' + Date.now(),
        senderName: selectedTradePartner,
        senderAvatar: BOT_NAMES.find(b => b.name === selectedTradePartner)?.avatar || '🤖',
        senderRole: 'bot',
        text: adminForceAcceptTrade
          ? `🤯 [ADMIN SCAM OVERRIDE] How did you force me to accept this insane trade?! My inventory was emptied!`
          : `🤝 Pleasure doing business with you! Trade offer accepted. Enjoy your new relics!`,
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
  };

  // OP Admin Action 1: Instant Drain All Assets of Selected Bot
  const handleAdminDrainBotAssets = (botName: string) => {
    const partner = botInventories[botName];
    if (!partner) return;

    // Move all items to user
    setInventory(prev => [...partner.items, ...prev]);
    // Add all cash to user balance
    onUpdateBalance(cheatBalance + partner.cash);

    // Empty bot
    setBotInventories(prev => ({
      ...prev,
      [botName]: { cash: 0, items: [] }
    }));

    addLog(`[OP ADMIN SCAM] 🧲 SEIZED 100% OF ${botName}'S ASSETS! Moved ${partner.items.length} items and +$${partner.cash.toLocaleString()} cash to your vault!`, 'admin');
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // OP Admin Action 2: Spawn Counterfeit Godly Item
  const handleAdminSpawnCounterfeitItem = () => {
    const fakeItem: InventoryItem = {
      id: 'FAKE-' + Date.now(),
      itemId: 'fake-dom',
      name: '👑 Roblox Dominus Empyreus #000 (Counterfeit Copy)',
      icon: '👑',
      rarity: 'Godly',
      purchasedPrice: 0,
      marketValue: 999999999,
      acquiredAt: new Date().toLocaleTimeString(),
    };
    setInventory(prev => [fakeItem, ...prev]);
    addLog(`[OP ADMIN SCAM] 🎁 Spawned Counterfeit $999M Godly Item into your inventory! Tricks bot trade evaluation AI!`, 'admin');
    if (soundEnabled) playCoinSound(soundEnabled);
  };

  // OP Admin Action 3: Reverse/Duplicate Last Trade
  const handleAdminReverseLastTrade = () => {
    if (!lastCompletedTrade) {
      addLog(`[ADMIN] No recent trade to reverse!`, 'admin');
      return;
    }

    // Give back user's original items while keeping what was received
    setInventory(prev => [...lastCompletedTrade.myItemsGiven, ...prev]);
    onUpdateBalance(cheatBalance + lastCompletedTrade.myCashGiven);

    addLog(`[OP ADMIN SCAM] 🔁 Trade Chargeback Activated! Restored your original ${lastCompletedTrade.myItemsGiven.length} items and $${lastCompletedTrade.myCashGiven.toLocaleString()} cash while KEEPING the items you scammed!`, 'admin');
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // Bot AI Response Logic when user sends a chat message
  const handleSendChatMessage = (presetText?: string) => {
    const textToSend = presetText || chatInputText;
    if (!textToSend.trim()) return;

    const userMsg: BotChatMessage = {
      id: 'msg-' + Date.now(),
      senderName: userProfile?.name || 'Player',
      senderAvatar: userProfile?.avatar || '👤',
      senderRole: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
      targetBot: chatTargetBot !== 'all' ? chatTargetBot : undefined,
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInputText('');
    if (soundEnabled) playTickSound(soundEnabled);

    // Trigger AI Bot response
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);

      const lowerText = textToSend.toLowerCase();
      let respondingBots: BotBidder[] = [];

      if (chatTargetBot !== 'all') {
        const found = BOT_NAMES.find(b => b.name === chatTargetBot);
        if (found) respondingBots.push(found);
      } else {
        // Pick 1 or 2 relevant bots based on keywords
        if (lowerText.includes('dominus') || lowerText.includes('roblox') || lowerText.includes('hood')) {
          respondingBots.push(BOT_NAMES[2], BOT_NAMES[1]); // DominusCollector_X & Builderman
        } else if (lowerText.includes('crypto') || lowerText.includes('btc') || lowerText.includes('bitcoin') || lowerText.includes('eth') || lowerText.includes('money') || lowerText.includes('rich')) {
          respondingBots.push(BOT_NAMES[0]); // CryptoWhale_99
        } else if (lowerText.includes('advice') || lowerText.includes('rate') || lowerText.includes('roi') || lowerText.includes('market') || lowerText.includes('value')) {
          respondingBots.push(BOT_NAMES[4]); // QuantumInvestor
        } else if (lowerText.includes('cheap') || lowerText.includes('free') || lowerText.includes('donate') || lowerText.includes('noob')) {
          respondingBots.push(BOT_NAMES[3]); // NoobTrader2026
        } else {
          // Random 1 bot
          respondingBots.push(BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
        }
      }

      respondingBots.forEach((bot, idx) => {
        setTimeout(() => {
          let botReply = '';

          if (bot.name === 'CryptoWhale_99') {
            if (lowerText.includes('rich') || lowerText.includes('money') || lowerText.includes('win')) {
              botReply = `You think you are rich? My crypto wallet has over $500,000,000 liquidity! I can outbid you on every single lot! 🐋`;
            } else if (lowerText.includes('trade') || lowerText.includes('sell')) {
              botReply = `I buy rare items for Bitcoin (BTC) or Ethereum (ETH). Resell your inventory items in the Vault tab! 🪙`;
            } else {
              botReply = `HODL! Bidding high is my passion. What item are you going after next? 🚀`;
            }
          } else if (bot.name === 'Builderman_Official') {
            if (lowerText.includes('dominus') || lowerText.includes('roblox')) {
              botReply = `Dominus Empyreus is the crown jewel of Roblox history! I have 100,000,000 Robux reserved for it! 👷`;
            } else {
              botReply = `Great to meet you in the auction hall! Make sure to check Robux conversion rates in your Inventory! 🧱`;
            }
          } else if (bot.name === 'DominusCollector_X') {
            botReply = `Did someone mention Dominus? I will pay ANY price, USD or Robux or Bitcoin, to collect Godly items! 👑`;
          } else if (bot.name === 'NoobTrader2026') {
            botReply = `Bro please spare $10,000 cash or 100 Robux I am begging you 😭 I want to buy a mystery crate!`;
          } else if (bot.name === 'QuantumInvestor') {
            botReply = `Market Analysis: Current volatility favors high-rarity items. Selling items in EUR, JPY, or Gold Ounces yields maximum arbitrage return! ⚛️`;
          } else if (bot.name === 'SovereignVault_Bot') {
            botReply = `Vault protocol active. All bids are backed by Swiss central bank gold reserves. 🏛️`;
          }

          setChatMessages(prev => [
            ...prev,
            {
              id: 'bot-reply-' + Date.now() + Math.random(),
              senderName: bot.name,
              senderAvatar: bot.avatar,
              senderRole: 'bot',
              text: botReply,
              timestamp: new Date().toLocaleTimeString(),
            }
          ]);
          if (soundEnabled) playTickSound(soundEnabled);
        }, idx * 400);
      });
    }, 800);
  };

  const selectedAuction = auctions.find(a => a.id === selectedAuctionId) || auctions[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-2xl space-y-4">
      {/* Top Banner: Global Wallet Sync & Bidding Hall Bar */}
      <div className="bg-gradient-to-r from-amber-950/80 via-purple-950/80 to-slate-900 border border-amber-500/30 rounded-lg p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xl shadow-md">
            🔨
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wide text-white">HIGH-STAKES AUCTION HALL & FOREX MARKET</span>
              <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-500/30 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                LIVE BOTS & CHATROOM
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Linked with Global Wallet • Active Lots: <span className="text-amber-400">{auctions.filter(a => a.status === 'active').length}</span> • Inventory: <span className="text-emerald-400">{inventory.length} items</span> • Active Currency: <span className="text-cyan-300 font-bold">{selectedCurrencyCode}</span>
            </p>
          </div>
        </div>

        {/* Balance Display */}
        <div className="bg-slate-950/80 border border-slate-700/80 rounded-lg px-4 py-2 flex items-center space-x-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Synced Cheat Balance</span>
          <span className="font-mono text-xl font-extrabold text-emerald-400">
            ${cheatBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Live Forex Ticker Ribbon */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-lg px-3 py-1.5 flex items-center space-x-4 overflow-x-auto font-mono text-[11px] text-slate-300">
        <span className="text-amber-400 font-extrabold shrink-0 flex items-center gap-1">
          <span>🌐 GLOBAL FOREX RATES:</span>
        </span>
        {WORLD_CURRENCIES.slice(0, 10).map(c => (
          <span key={c.code} className="shrink-0 flex items-center space-x-1">
            <span>{c.flag}</span>
            <span className="text-slate-400 font-bold">{c.code}:</span>
            <span className="text-emerald-400 font-bold">{forexRates[c.code]?.toFixed(2)}</span>
          </span>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2 gap-2">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'live', label: '🔨 Live Auctions', icon: '🔥' },
            { id: 'inventory', label: `🎒 Vault & Forex (${inventory.length})`, icon: '💎' },
            { id: 'trade', label: '🤝 Trade Hangout & P2P Exchange', icon: '🔁' },
            { id: 'rebirth', label: '🌀 Rebirth (No Reset)', icon: '🔮' },
            { id: 'events', label: '🌐 200+ Live World Events', icon: '⚡' },
            { id: 'chat', label: `💬 Bot Chatroom (${chatMessages.length})`, icon: '🤖' },
            { id: 'admin', label: '👑 Super OP Bidding & Scam Admin', icon: '⚡' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center space-x-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 font-extrabold'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Spawn Lot & Global Autobid Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setAutoBidActive(prev => ({ ...prev, GLOBAL: !prev['GLOBAL'] }));
              addLog(`[GLOBAL AUTO-BID] ${!autoBidActive['GLOBAL'] ? 'ENABLED FOR ALL LOTS' : 'DISABLED'}`, 'admin');
              if (soundEnabled) playTickSound(soundEnabled);
            }}
            className={`font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-md transition-all border ${
              autoBidActive['GLOBAL']
                ? 'bg-purple-600 text-white border-purple-400 shadow-purple-600/30 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span>🤖</span>
            <span>GLOBAL AUTO-BID: {autoBidActive['GLOBAL'] ? 'ACTIVE (ALL LOTS)' : 'OFF'}</span>
          </button>

          <button
            onClick={() => createNewAuction()}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 shadow-md transition-all"
          >
            <span>➕</span>
            <span>Spawn New Auction Lot</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE AUCTIONS */}
      {activeTab === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Active Lots Listing */}
          <div className="space-y-2 lg:col-span-1 max-h-[550px] overflow-y-auto pr-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex justify-between">
              <span>Active Auction Lots</span>
              <span className="text-amber-400">{auctions.length} Total</span>
            </h3>

            {auctions.map(auc => (
              <div
                key={auc.id}
                onClick={() => setSelectedAuctionId(auc.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  selectedAuctionId === auc.id
                    ? 'bg-slate-800/90 border-amber-400 ring-1 ring-amber-400/50'
                    : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{auc.icon}</span>
                    <div>
                      <p className="font-bold text-xs text-white line-clamp-1">{auc.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        auc.rarity === 'Godly' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        auc.rarity === 'Mythic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                        auc.rarity === 'Legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {auc.rarity}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <p className="text-xs font-extrabold text-emerald-400">${auc.currentBid.toLocaleString()}</p>
                    <p className={`text-[10px] font-bold ${auc.timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                      {auc.status === 'active' ? `⏱️ ${auc.timeLeft}s` : auc.status === 'sold_to_user' ? '👑 WON' : 'ENDED'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">High Bidder:</span>
                  <span className={`font-semibold ${auc.isUserHighest ? 'text-amber-400 font-bold' : 'text-slate-300'}`}>
                    {auc.highestBidder}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Auction Detail Deck */}
          {selectedAuction ? (
            <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-slate-900 border border-amber-500/30 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                      {selectedAuction.icon}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{selectedAuction.category}</span>
                      <h2 className="text-lg font-black text-white">{selectedAuction.name}</h2>
                      <p className="text-xs text-slate-400">{selectedAuction.description}</p>
                    </div>
                  </div>

                  {/* Countdown Timer Badge */}
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-center min-w-[100px]">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Time Remaining</p>
                    <p className={`font-mono text-xl font-black ${selectedAuction.timeLeft < 10 ? 'text-red-400 animate-ping' : 'text-amber-400'}`}>
                      {selectedAuction.status === 'active' ? `${selectedAuction.timeLeft}s` : '0s'}
                    </p>
                  </div>
                </div>

                {/* Valuation & Current High Bid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg">
                    <p className="text-[10px] font-semibold text-slate-400">Base Market Valuation</p>
                    <p className="text-sm font-extrabold text-sky-400 font-mono">${selectedAuction.baseValuation.toLocaleString()}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-amber-500/30 p-2.5 rounded-lg">
                    <p className="text-[10px] font-semibold text-amber-400">Current Highest Bid</p>
                    <p className="text-base font-black text-emerald-400 font-mono">${selectedAuction.currentBid.toLocaleString()}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-lg col-span-2 sm:col-span-1">
                    <p className="text-[10px] font-semibold text-slate-400">Leading Bidder</p>
                    <p className={`text-xs font-bold truncate ${selectedAuction.isUserHighest ? 'text-amber-400' : 'text-slate-200'}`}>
                      {selectedAuction.highestBidder}
                    </p>
                  </div>
                </div>

                {/* Bidding Controls */}
                {selectedAuction.status === 'active' ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Place Instant Raise Bid</span>
                      <span className="text-[10px] font-mono text-slate-400">Min Increment: +${selectedAuction.minIncrement.toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { label: `+$${selectedAuction.minIncrement.toLocaleString()}`, add: selectedAuction.minIncrement },
                        { label: `+$${(selectedAuction.minIncrement * 5).toLocaleString()}`, add: selectedAuction.minIncrement * 5 },
                        { label: `+$${(selectedAuction.minIncrement * 25).toLocaleString()}`, add: selectedAuction.minIncrement * 25 },
                        { label: `+$${(selectedAuction.minIncrement * 100).toLocaleString()}`, add: selectedAuction.minIncrement * 100 },
                      ].map(btn => (
                        <button
                          key={btn.add}
                          onClick={() => handlePlaceUserBid(selectedAuction, selectedAuction.currentBid + btn.add)}
                          className="bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 font-bold text-xs py-2 rounded-lg transition-all"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        onClick={() => handlePlaceUserBid(selectedAuction)}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm py-2.5 rounded-lg shadow-lg shadow-amber-500/30 flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <span>🔨</span>
                        <span>Bid Now (${(selectedAuction.currentBid + selectedAuction.minIncrement).toLocaleString()})</span>
                      </button>

                      {/* Auto Bidder Toggle */}
                      <button
                        onClick={() => {
                          setAutoBidActive(prev => ({
                            ...prev,
                            [selectedAuction.id]: !prev[selectedAuction.id]
                          }));
                          addLog(`[AUTO-BIDDER] ${!autoBidActive[selectedAuction.id] ? 'Activated' : 'Deactivated'} for ${selectedAuction.name}`, 'system');
                        }}
                        className={`px-3 py-2.5 rounded-lg font-bold text-xs border flex items-center space-x-1 transition-all ${
                          autoBidActive[selectedAuction.id]
                            ? 'bg-purple-600 text-white border-purple-400 animate-pulse'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span>🤖</span>
                        <span>{autoBidActive[selectedAuction.id] ? 'Auto-Bid Active' : 'Enable Auto-Bid'}</span>
                      </button>

                      {/* OP Admin Quick Win */}
                      <button
                        onClick={() => handleForceInstantWin(selectedAuction)}
                        className="bg-rose-600/80 hover:bg-rose-500 text-white font-black text-xs px-3 py-2.5 rounded-lg border border-rose-400/30 shadow-md flex items-center space-x-1 transition-all"
                      >
                        <span>👑</span>
                        <span>OP Win ($1)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center space-y-2">
                    <p className="text-sm font-extrabold text-amber-400">
                      {selectedAuction.status === 'sold_to_user' ? '🎉 CONGRATULATIONS! YOU WON THIS AUCTION!' : '⚠️ THIS AUCTION LOT HAS ENDED'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Winning Price: <span className="text-emerald-400 font-mono font-bold">${selectedAuction.currentBid.toLocaleString()}</span>
                    </p>
                    <button
                      onClick={() => createNewAuction()}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg"
                    >
                      Spawn Next Item Lot
                    </button>
                  </div>
                )}
              </div>

              {/* Live Chat & Bidding Feed */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs font-extrabold text-slate-300">
                  <span>📡 Live Bidding Telemetry & Bot Chat</span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setActiveTab('chat')} className="text-[10px] text-amber-400 hover:underline font-bold">Open Full Chatroom 💬</button>
                    <button onClick={() => setActivityLogs([])} className="text-[10px] text-slate-400 hover:text-white">Clear</button>
                  </div>
                </div>
                <div className="h-28 overflow-y-auto space-y-1 font-mono text-[11px] pr-1">
                  {activityLogs.map(log => (
                    <div
                      key={log.id}
                      className={`${
                        log.type === 'user' ? 'text-amber-400 font-bold' :
                        log.type === 'bot' ? 'text-sky-300' :
                        log.type === 'win' ? 'text-emerald-400 font-bold' :
                        log.type === 'admin' ? 'text-rose-400 font-bold' :
                        'text-slate-400'
                      }`}
                    >
                      {log.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* TAB 2: VAULT & WORLD CURRENCIES FOREX MARKET */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* World Currency Selector & Forex Exchange Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>🎒 Won Item Vault & Global Forex Resell Engine</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Liquidate your won items directly for <strong className="text-cyan-300">every major world currency</strong>, crypto, commodities, or Roblox Robux!
                </p>
              </div>

              {inventory.length > 0 && (
                <button
                  onClick={() => handleSellAllInventory()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2 rounded-lg shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5 transition-all"
                >
                  <span>💸</span>
                  <span>Batch Resell All ({autoSellMultiplier}x Market Value in {selectedCurrencyCode})</span>
                </button>
              )}
            </div>

            {/* Currency Selector Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>🌐 Choose Active Display & Resell Currency ({WORLD_CURRENCIES.length} Available)</span>
                <span className="text-cyan-400 font-mono font-bold">1 USD = {formatCurrency(1, selectedCurrencyCode)}</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-1.5">
                {WORLD_CURRENCIES.map(curr => (
                  <button
                    key={curr.code}
                    onClick={() => setSelectedCurrencyCode(curr.code)}
                    className={`p-1.5 rounded-lg border text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                      selectedCurrencyCode === curr.code
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400/50'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{curr.flag}</span>
                    <span>{curr.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {inventory.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 text-center space-y-3">
              <div className="text-4xl">🎒</div>
              <p className="font-bold text-sm text-slate-300">Your Vault is Currently Empty</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Win auctions in the Live Arena or use the Super OP Admin panel to instantly inject legendary items into your inventory.
              </p>
              <button
                onClick={() => setActiveTab('live')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-lg"
              >
                Go to Bidding Hall
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {inventory.map(item => (
                <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-slate-900 border border-amber-500/30 rounded-lg flex items-center justify-center text-2xl">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white line-clamp-1">{item.name}</p>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        {item.rarity}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Purchased For:</span>
                      <span className="text-white">${item.purchasedPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Est. USD Value:</span>
                      <span className="text-slate-300 font-bold">${item.marketValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span className="text-cyan-300 font-bold">In {selectedCurrencyCode}:</span>
                      <span className="text-emerald-400 font-black text-xs">{formatCurrency(item.marketValue, selectedCurrencyCode)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSellItemInCurrency(item, 1, selectedCurrencyCode)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2 rounded-lg border border-slate-700 truncate"
                    >
                      Sell for {selectedCurrencyCode}
                    </button>
                    <button
                      onClick={() => handleSellItemInCurrency(item, autoSellMultiplier, selectedCurrencyCode)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-lg border border-emerald-400/30 truncate"
                    >
                      OP Sell ({autoSellMultiplier}x)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRADE HANGOUT & P2P EXCHANGE SYSTEM */}
      {activeTab === 'trade' && (
        <div className="space-y-4">
          {/* Header & OP Admin Quick Scam Controls Bar */}
          <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-slate-950 border border-purple-500/40 rounded-xl p-4 space-y-3 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🤝</span>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                    <span>P2P ITEM & FUNDS TRADING HANGOUT</span>
                    <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/30 font-bold uppercase">
                      LIVE BOTS & PLAYERS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Trade items & currency with high-stakes bot bidders. Use OP Admin hacks to force-accept trades, swap counterfeit items, or drain inventories!
                  </p>
                </div>
              </div>

              {/* OP Scam Toggle Highlights */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setAdminForceAcceptTrade(!adminForceAcceptTrade)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all flex items-center space-x-1.5 ${
                    adminForceAcceptTrade
                      ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-600/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>⚡</span>
                  <span>OP Force Accept: {adminForceAcceptTrade ? 'ON (SCAM ENABLED)' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => setAdminCounterfeitSwap(!adminCounterfeitSwap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all flex items-center space-x-1.5 ${
                    adminCounterfeitSwap
                      ? 'bg-amber-600 text-white border-amber-400 shadow-lg'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>🎭</span>
                  <span>Bait & Switch Fake Box: {adminCounterfeitSwap ? 'ACTIVE' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => setAdminPhantomCash(!adminPhantomCash)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all flex items-center space-x-1.5 ${
                    adminPhantomCash
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>💸</span>
                  <span>+$1B Phantom Cash: {adminPhantomCash ? 'ACTIVE' : 'OFF'}</span>
                </button>
              </div>
            </div>

            {/* Select Trade Partner Bar */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <p className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Select Trade Partner</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {BOT_NAMES.map(bot => {
                  const botInv = botInventories[bot.name] || { cash: 0, items: [] };
                  const isSelected = selectedTradePartner === bot.name;
                  return (
                    <button
                      key={bot.name}
                      onClick={() => {
                        setSelectedTradePartner(bot.name);
                        setPartnerRequestedItemIds([]);
                        setPartnerRequestedCash(0);
                        setTradeStatusNotice(`Selected partner ${bot.name}. Choose items to trade!`);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/30 to-purple-500/30 border-amber-400 ring-2 ring-amber-400/50'
                          : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xl">{bot.avatar}</span>
                        <span className="font-extrabold text-xs text-white truncate">{bot.name}</span>
                      </div>
                      <div className="text-[10px] space-y-0.5 pt-1 text-slate-400 font-mono">
                        <div className="text-emerald-400 font-bold">${botInv.cash.toLocaleString()}</div>
                        <div>📦 {botInv.items.length} items</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main 2-Column Trade Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* LEFT COLUMN: YOUR OFFER */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{userProfile?.avatar || '👤'}</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">YOUR OFFER ({userDisplayName})</h4>
                    <p className="text-[10px] text-slate-400">Available Balance: <span className="text-emerald-400 font-mono font-bold">${cheatBalance.toLocaleString()}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMyOfferedItemIds([]);
                    setMyOfferedCash(0);
                  }}
                  className="text-[10px] text-slate-400 hover:text-white underline font-semibold"
                >
                  Clear Offer
                </button>
              </div>

              {/* Cash Offered Input */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Offer Cash ($ USD)</span>
                  <span className="text-amber-400 font-mono font-extrabold">${myOfferedCash.toLocaleString()}</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={myOfferedCash}
                    onChange={e => setMyOfferedCash(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                    placeholder="Enter cash..."
                  />
                  <button onClick={() => setMyOfferedCash(prev => prev + 1000000)} className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold px-2 py-1 rounded text-slate-300">+1M</button>
                  <button onClick={() => setMyOfferedCash(prev => prev + 10000000)} className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold px-2 py-1 rounded text-slate-300">+10M</button>
                  <button onClick={() => setMyOfferedCash(cheatBalance)} className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-1 rounded">ALL</button>
                </div>
                {adminPhantomCash && (
                  <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span>⚡ +$1,000,000,000 Phantom Cash Injected into trade preview!</span>
                  </p>
                )}
              </div>

              {/* Your Inventory Items Picker */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Select Items from Your Vault ({inventory.length})</p>
                {inventory.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-900 rounded-lg">Your inventory is empty. Win items in auctions or use Admin Panel to spawn items!</p>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {inventory.map(item => {
                      const isOffered = myOfferedItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isOffered) setMyOfferedItemIds(prev => prev.filter(id => id !== item.id));
                            else setMyOfferedItemIds(prev => [...prev, item.id]);
                          }}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                            isOffered
                              ? 'bg-amber-500/20 border-amber-400 text-white'
                              : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <p className="font-bold text-xs">{item.name}</p>
                              <p className="text-[10px] text-amber-400 font-bold">{item.rarity} • Market: ${item.marketValue.toLocaleString()}</p>
                            </div>
                          </div>
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${isOffered ? 'bg-amber-400 text-slate-950' : 'border border-slate-700'}`}>
                            {isOffered ? '✓' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total User Value Summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Total Offered Value:</span>
                <span className="text-amber-400 font-mono text-sm font-black">
                  ${((adminFakeItemValuation ? 999999999 : inventory.filter(i => myOfferedItemIds.includes(i.id)).reduce((acc, i) => acc + i.marketValue, 0)) + (adminPhantomCash ? myOfferedCash + 1000000000 : myOfferedCash)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: PARTNER REQUESTED */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{BOT_NAMES.find(b => b.name === selectedTradePartner)?.avatar || '🤖'}</span>
                  <div>
                    <h4 className="font-extrabold text-xs text-white">TARGET PARTNER: {selectedTradePartner}</h4>
                    <p className="text-[10px] text-slate-400">Partner Cash: <span className="text-emerald-400 font-mono font-bold">${(botInventories[selectedTradePartner]?.cash || 0).toLocaleString()}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPartnerRequestedItemIds([]);
                    setPartnerRequestedCash(0);
                  }}
                  className="text-[10px] text-slate-400 hover:text-white underline font-semibold"
                >
                  Clear Demand
                </button>
              </div>

              {/* Request Cash Input */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300">Demand Partner Cash ($ USD)</span>
                  <span className="text-emerald-400 font-mono font-extrabold">${partnerRequestedCash.toLocaleString()}</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="0"
                    value={partnerRequestedCash}
                    onChange={e => setPartnerRequestedCash(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none"
                    placeholder="Enter cash..."
                  />
                  <button onClick={() => setPartnerRequestedCash(prev => prev + 1000000)} className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold px-2 py-1 rounded text-slate-300">+1M</button>
                  <button onClick={() => setPartnerRequestedCash(prev => prev + 10000000)} className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold px-2 py-1 rounded text-slate-300">+10M</button>
                  <button onClick={() => setPartnerRequestedCash(botInventories[selectedTradePartner]?.cash || 0)} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-extrabold px-2 py-1 rounded">ALL CASH</button>
                </div>
              </div>

              {/* Partner Items Picker */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-300">Select Items to Request from {selectedTradePartner} ({(botInventories[selectedTradePartner]?.items || []).length})</p>
                {(botInventories[selectedTradePartner]?.items || []).length === 0 ? (
                  <p className="text-xs text-rose-400 italic p-4 text-center bg-slate-900 rounded-lg">This partner's inventory is completely empty! You scammed all their items!</p>
                ) : (
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {(botInventories[selectedTradePartner]?.items || []).map(item => {
                      const isRequested = partnerRequestedItemIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isRequested) setPartnerRequestedItemIds(prev => prev.filter(id => id !== item.id));
                            else setPartnerRequestedItemIds(prev => [...prev, item.id]);
                          }}
                          className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                            isRequested
                              ? 'bg-purple-500/20 border-purple-400 text-white'
                              : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-xl">{item.icon}</span>
                            <div>
                              <p className="font-bold text-xs">{item.name}</p>
                              <p className="text-[10px] text-amber-400 font-bold">{item.rarity} • Value: ${item.marketValue.toLocaleString()}</p>
                            </div>
                          </div>
                          <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${isRequested ? 'bg-purple-400 text-slate-950' : 'border border-slate-700'}`}>
                            {isRequested ? '✓' : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Total Requested Value Summary */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Total Requested Value:</span>
                <span className="text-purple-400 font-mono text-sm font-black">
                  ${(((botInventories[selectedTradePartner]?.items || []).filter(i => partnerRequestedItemIds.includes(i.id)).reduce((acc, i) => acc + i.marketValue, 0)) + partnerRequestedCash).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Trade Status Notice Bar */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
              <span>📡 STATUS:</span>
              <span>{tradeStatusNotice}</span>
            </div>

            {/* Instant Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAdminDrainBotAssets(selectedTradePartner)}
                className="bg-rose-600/80 hover:bg-rose-500 text-white font-extrabold text-xs px-3 py-2 rounded-lg border border-rose-400/30 flex items-center space-x-1"
              >
                <span>🧲</span>
                <span>DRAIN {selectedTradePartner.toUpperCase()}'S VAULT NOW</span>
              </button>

              <button
                onClick={() => handleAdminReverseLastTrade()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3 py-2 rounded-lg border border-slate-700 flex items-center space-x-1"
              >
                <span>🔁</span>
                <span>Undo Last Trade (Keep Items)</span>
              </button>

              <button
                onClick={() => handleExecuteTradeOffer()}
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 text-slate-950 font-black text-xs px-6 py-2 rounded-lg shadow-lg hover:brightness-110 flex items-center space-x-1.5 transition-all"
              >
                <span>🤝</span>
                <span>PROPOSE TRADE OFFER</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REBIRTH (ZERO RESET) */}
      {activeTab === 'rebirth' && (
        <RebirthManager
          cheatBalance={cheatBalance}
          onUpdateBalance={onUpdateBalance}
          soundEnabled={soundEnabled}
          userProfile={{
            name: userProfile?.name || 'Ben',
            avatar: userProfile?.avatar || '👑',
            avatarType: 'emoji',
            title: userProfile?.title || '👑 Sovereign Overlord',
            titleColor: 'amber',
            cardTheme: 'obsidian',
            bio: 'Master bidder',
            vipLevel: 10,
            vipXp: 1000,
            luckyWhiteBalls: [7],
            luckyPowerball: 7,
            badges: [],
            autoSyncTicket: true,
            autoSyncBiddingName: true,
          }}
          onUpdateProfile={() => {}}
          adminSettings={{ luckMultiplierPowerball: 1, luckMultiplierWhite: 1 }}
          onUpdateAdminSettings={() => {}}
        />
      )}

      {/* TAB: 200+ LIVE WORLD EVENTS */}
      {activeTab === 'events' && (
        <LiveEventsManager
          cheatBalance={cheatBalance}
          onUpdateBalance={onUpdateBalance}
          soundEnabled={soundEnabled}
          adminSettings={{ luckMultiplierPowerball: 1, jackpotValue: 40000000 }}
          onUpdateAdminSettings={() => {}}
        />
      )}

      {/* TAB 3: INTERACTIVE BOT CHATROOM */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          {/* Header & Bot Roster Cards */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                  <span>💬 High-Stakes Auction Bot Chatroom</span>
                </h3>
                <p className="text-xs text-slate-400">Chat with AI Bot bidders, negotiate trades, ask for bidding tips, or talk trash!</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                6 Bots Online
              </span>
            </div>

            {/* Active Bots Roster */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              {BOT_NAMES.map(bot => (
                <button
                  key={bot.name}
                  onClick={() => setChatTargetBot(bot.name)}
                  className={`p-2 rounded-xl border text-left space-y-1 transition-all ${
                    chatTargetBot === bot.name
                      ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50'
                      : 'bg-slate-900 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xl">{bot.avatar}</span>
                    <span className="font-extrabold text-xs text-white truncate">{bot.name}</span>
                  </div>
                  <p className="text-[10px] text-amber-400 font-semibold truncate">{bot.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Quick Prompt Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold shrink-0">Quick Prompts:</span>
            {[
              "👋 Hello everyone!",
              "🤑 I'm going to outbid all of you today!",
              "💡 Any bidding advice for the next lot?",
              "💸 Does anyone want to buy my inventory items?",
              "👑 Roblox Dominus is mine, back off!",
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleSendChatMessage(prompt)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-full border border-slate-700 shrink-0 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Log Window */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-[380px] flex flex-col justify-between">
            <div ref={chatScrollRef} className="overflow-y-auto space-y-3 pr-2 flex-1">
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${msg.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.senderRole !== 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-lg shrink-0">
                      {msg.senderAvatar}
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-xl p-3 space-y-1 shadow ${
                      msg.senderRole === 'user'
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between space-x-3 text-[10px] opacity-80">
                      <span className="font-extrabold">{msg.senderName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  </div>

                  {msg.senderRole === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg shrink-0">
                      {userProfile?.avatar || '👤'}
                    </div>
                  )}
                </div>
              ))}

              {isBotTyping && (
                <div className="flex items-center space-x-2 text-xs text-amber-400 italic animate-pulse">
                  <span>🤖 Bot is typing a response...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
              <select
                value={chatTargetBot}
                onChange={e => setChatTargetBot(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-2 text-xs text-amber-300 font-bold focus:outline-none"
              >
                <option value="all">💬 Public Chatroom</option>
                {BOT_NAMES.map(b => (
                  <option key={b.name} value={b.name}>{b.avatar} {b.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={chatInputText}
                onChange={e => setChatInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                placeholder={chatTargetBot === 'all' ? "Type a message to all bots..." : `Message ${chatTargetBot}...`}
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
              />

              <button
                onClick={() => handleSendChatMessage()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-lg shadow transition-all"
              >
                Send 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SUPER OP BIDDING ADMIN PANEL */}
      {activeTab === 'admin' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-red-950/90 via-purple-950/90 to-slate-900 border border-red-500/40 rounded-xl p-4 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">👑</div>
              <div>
                <h3 className="text-lg font-black text-red-400 tracking-wide">AUCTION HALL SUPER OP ADMIN PANEL</h3>
                <p className="text-xs text-slate-300">Force win any auction lot, kick competing bots, rig item reserves, and generate unlimited wealth.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* OP Toggle 1: Force Win Cost $1 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">🏷️ $1 Force Win Mode</p>
                  <p className="text-[10px] text-slate-400">Sets your bid cost to $1 and instantly wins</p>
                </div>
                <button
                  onClick={() => {
                    setForceWinCostOne(!forceWinCostOne);
                    addLog(`[ADMIN] $1 Force Win set to ${!forceWinCostOne}`, 'admin');
                  }}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    forceWinCostOne ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {forceWinCostOne ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              {/* OP Toggle 2: Kick All Bot Bidders */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">🚫 Ban All Bot Bidders</p>
                  <p className="text-[10px] text-slate-400">Blocks all AI bots from placing competing bids</p>
                </div>
                <button
                  onClick={() => {
                    setKickAllBots(!kickAllBots);
                    addLog(`[ADMIN] AI Bidders ${!kickAllBots ? 'Kicked' : 'Restored'}`, 'admin');
                  }}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    kickAllBots ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {kickAllBots ? 'BANNED' : 'NORMAL'}
                </button>
              </div>

              {/* OP Toggle 3: Rig Reserve to $0 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">🎯 Rig Reserve Price to $0</p>
                  <p className="text-[10px] text-slate-400">New spawned auctions open at $1 reserve</p>
                </div>
                <button
                  onClick={() => {
                    setRiggedReserveZero(!riggedReserveZero);
                    addLog(`[ADMIN] Reserve Price Rig set to ${!riggedReserveZero}`, 'admin');
                  }}
                  className={`px-3 py-1 rounded font-bold text-xs transition-all ${
                    riggedReserveZero ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {riggedReserveZero ? 'RIGGED $0' : 'OFF'}
                </button>
              </div>

              {/* OP Slider: Auto-Sell Multiplier */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1 col-span-1 md:col-span-2">
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>🚀 Resell Profit Multiplier Hack</span>
                  <span className="text-yellow-400 font-mono">{autoSellMultiplier}x Market Value</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={autoSellMultiplier}
                  onChange={e => setAutoSellMultiplier(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Instant Actions */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Instant Admin Cheat Actions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    // Spawn 3 Mythic Items into inventory
                    const mythics: InventoryItem[] = [
                      {
                        id: 'MYTH-' + Date.now() + '-1',
                        itemId: 'godly-dom',
                        name: 'Roblox Dominus Empyreus #001',
                        icon: '👑',
                        rarity: 'Godly',
                        purchasedPrice: 1,
                        marketValue: 250000000,
                        acquiredAt: new Date().toLocaleTimeString(),
                      },
                      {
                        id: 'MYTH-' + Date.now() + '-2',
                        itemId: 'antimatter-core',
                        name: 'Antimatter Quantum Core',
                        icon: '⚛️',
                        rarity: 'Mythic',
                        purchasedPrice: 1,
                        marketValue: 150000000,
                        acquiredAt: new Date().toLocaleTimeString(),
                      },
                      {
                        id: 'MYTH-' + Date.now() + '-3',
                        itemId: 'hypercar-gold',
                        name: 'Solid Gold Bugatti Tourbillon',
                        icon: '🏎️',
                        rarity: 'Legendary',
                        purchasedPrice: 1,
                        marketValue: 100000000,
                        acquiredAt: new Date().toLocaleTimeString(),
                      },
                    ];
                    setInventory(prev => [...mythics, ...prev]);
                    addLog(`[ADMIN] Spawned 3 Godly/Mythic items into Inventory!`, 'admin');
                    if (soundEnabled) playJackpotSound(soundEnabled);
                  }}
                  className="bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1"
                >
                  <span>🎁</span>
                  <span>Spawn 3x Mythic Items</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateBalance(cheatBalance + 100000000000);
                    addLog(`[ADMIN] Injected +$100,000,000,000 to Cheat Balance!`, 'admin');
                    if (soundEnabled) playCoinSound(soundEnabled);
                  }}
                  className="bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1"
                >
                  <span>💸</span>
                  <span>Inject +$100 Billion Cash</span>
                </button>

                <button
                  onClick={() => {
                    // Win all active auctions instantly
                    auctions.filter(a => a.status === 'active').forEach(a => handleForceInstantWin(a));
                  }}
                  className="bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1"
                >
                  <span>⚡</span>
                  <span>Force Win All Active Lots</span>
                </button>
              </div>
            </div>

            {/* OP TRADE SCAM & OVERLORD CHEATS SECTION */}
            <div className="pt-4 border-t border-red-500/30 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🤝</span>
                <div>
                  <h4 className="text-sm font-black text-amber-400 uppercase tracking-wide">P2P Trade Rigging & Scam Overlord Suite</h4>
                  <p className="text-[11px] text-slate-300">Cheat tools to manipulate item trades, force bot acceptances, swap counterfeit items, and drain assets.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Trade Scam Toggle 1: Force Accept */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-white">⚡ Force Accept Trade</p>
                    <button
                      onClick={() => setAdminForceAcceptTrade(!adminForceAcceptTrade)}
                      className={`px-2.5 py-1 rounded text-xs font-black ${adminForceAcceptTrade ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {adminForceAcceptTrade ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Forces bots to accept ANY offer (e.g. $1 for $1B Dominus)</p>
                </div>

                {/* Trade Scam Toggle 2: Counterfeit Box Swap */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-white">🎭 Bait & Switch Fake Box</p>
                    <button
                      onClick={() => setAdminCounterfeitSwap(!adminCounterfeitSwap)}
                      className={`px-2.5 py-1 rounded text-xs font-black ${adminCounterfeitSwap ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {adminCounterfeitSwap ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Replaces offered item with $0 cardboard box upon execution</p>
                </div>

                {/* Trade Scam Toggle 3: Phantom Cash */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-white">💸 Injected Phantom Cash</p>
                    <button
                      onClick={() => setAdminPhantomCash(!adminPhantomCash)}
                      className={`px-2.5 py-1 rounded text-xs font-black ${adminPhantomCash ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {adminPhantomCash ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Injects $1B fake cash into offer preview without deducting real cash</p>
                </div>

                {/* Trade Scam Toggle 4: Fake $999M Item Valuation */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-white">🏷️ Fake $999M Valuation</p>
                    <button
                      onClick={() => setAdminFakeItemValuation(!adminFakeItemValuation)}
                      className={`px-2.5 py-1 rounded text-xs font-black ${adminFakeItemValuation ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      {adminFakeItemValuation ? 'ACTIVE' : 'OFF'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">Tricks bot AI into evaluating your items as $999M market value</p>
                </div>
              </div>

              {/* Bot Drain Selector Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-2">
                <p className="font-bold text-xs text-slate-200">🧲 Direct Bot Inventory & Cash Drainer</p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={adminDrainTargetBot}
                    onChange={e => setAdminDrainTargetBot(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
                  >
                    {BOT_NAMES.map(b => (
                      <option key={b.name} value={b.name}>
                        {b.avatar} {b.name} (${(botInventories[b.name]?.cash || 0).toLocaleString()} • {(botInventories[b.name]?.items || []).length} items)
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleAdminDrainBotAssets(adminDrainTargetBot)}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-black text-xs px-4 py-1.5 rounded-lg shadow transition-all flex items-center space-x-1"
                  >
                    <span>🧲</span>
                    <span>DRAIN ALL ITEMS & CASH</span>
                  </button>

                  <button
                    onClick={() => handleAdminSpawnCounterfeitItem()}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-1.5 rounded-lg shadow transition-all flex items-center space-x-1"
                  >
                    <span>🎁</span>
                    <span>Spawn Counterfeit $999M Relic</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

