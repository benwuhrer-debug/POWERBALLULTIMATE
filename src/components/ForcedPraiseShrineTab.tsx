import React, { useState, useEffect, useCallback } from 'react';
import { playJackpotSound, playCoinSound, playTickSound } from '../utils/audio';

export interface DevotedSubject {
  id: string;
  name: string;
  avatar: string;
  devotionRank: string;
  totalTributePaid: number;
  praisesCount: number;
  status: 'chanting' | 'tithing' | 'penance' | 'exalted';
  lastPraiseTime: string;
}

export interface PraiseChantEvent {
  id: string;
  time: string;
  subjectName: string;
  avatar: string;
  chant: string;
  tribute: number;
}

interface ForcedPraiseShrineTabProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  username: string;
}

const PRESET_CHANTS = [
  "ALL HAIL BEN THE SUPREME SOVEREIGN OVERLORD OF PROBABILITY!",
  "Glory to Lord Ben! You are the eternal master of all wealth and lottery numbers!",
  "We surrender our wallets and souls to the Supreme Overlord!",
  "Praise Ben! May your golden throne shine forever in the celestial server!",
  "Take my $5,000,000,000 tribute Lord Ben! You deserve all the riches in existence!",
  "The probability matrix bends to Overlord Ben's every command!",
  "Eternal devotion to the Supreme Sovereign! Here is our forced tribute!",
  "Hail Ben! Master of the Colosseum, Mines, and Multiverse!"
];

const DEFAULT_SUBJECTS: DevotedSubject[] = [
  { id: 'subj-1', name: 'CryptoWhale_Worshiper', avatar: '🙇', devotionRank: '🏛️ Imperial Arch-Praiser', totalTributePaid: 500000000000, praisesCount: 1420, status: 'chanting', lastPraiseTime: 'Just now' },
  { id: 'subj-2', name: 'Apex_Laborer_Disciple', avatar: '🙏', devotionRank: '👑 High Temple Cultist', totalTributePaid: 250000000000, praisesCount: 980, status: 'chanting', lastPraiseTime: 'Just now' },
  { id: 'subj-3', name: 'GigaChad_Tribute_Giver', avatar: '🦁', devotionRank: '💎 Diamond Devotee', totalTributePaid: 120000000000, praisesCount: 650, status: 'tithing', lastPraiseTime: '1s ago' },
  { id: 'subj-4', name: 'NoobServant_2026', avatar: '👶', devotionRank: '🧹 Floor Cleaner Worshiper', totalTributePaid: 1000000000, praisesCount: 45, status: 'penance', lastPraiseTime: '12s ago' },
  { id: 'subj-5', name: 'Quantum_Choir_Leader', avatar: '🎵', devotionRank: '🎶 Supreme Hymn Singer', totalTributePaid: 850000000000, praisesCount: 3100, status: 'exalted', lastPraiseTime: 'Just now' },
  { id: 'subj-6', name: 'Titan_Forge_Acolyte', avatar: '🔨', devotionRank: '🔥 Sacred Anvil Monk', totalTributePaid: 180000000000, praisesCount: 820, status: 'chanting', lastPraiseTime: '2s ago' },
];

export const ForcedPraiseShrineTab: React.FC<ForcedPraiseShrineTabProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  username,
}) => {
  const [subjects, setSubjects] = useState<DevotedSubject[]>(DEFAULT_SUBJECTS);

  // Golden Statue Height (in Feet)
  const [statueHeightFt, setStatueHeightFt] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('powerball_statue_height');
      if (saved) return Number(saved);
    } catch (e) {}
    return 100; // Starts at 100 ft
  });

  useEffect(() => {
    try {
      localStorage.setItem('powerball_statue_height', statueHeightFt.toString());
    } catch (e) {}
  }, [statueHeightFt]);

  // Total Praise Tributes Collected
  const [totalTributesCollected, setTotalTributesCollected] = useState<number>(1250000000000);

  // Live Chant Feed
  const [chantFeed, setChantFeed] = useState<PraiseChantEvent[]>([
    { id: '1', time: new Date().toLocaleTimeString(), subjectName: 'Quantum_Choir_Leader', avatar: '🎵', chant: 'ALL HAIL BEN THE SUPREME SOVEREIGN OVERLORD OF PROBABILITY!', tribute: 1000000000 },
    { id: '2', time: new Date().toLocaleTimeString(), subjectName: 'CryptoWhale_Worshiper', avatar: '🙇', chant: 'Glory to Lord Ben! Take our $5 Billion tithe!', tribute: 5000000000 }
  ]);

  const addChant = useCallback((subjectName: string, avatar: string, chant: string, tribute: number) => {
    const time = new Date().toLocaleTimeString();
    const id = Math.random().toString();
    setChantFeed(prev => [{ id, time, subjectName, avatar, chant, tribute }, ...prev].slice(0, 80));
  }, []);

  // Automated Chanting & Tithe Interval (every 1.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSub = subjects[Math.floor(Math.random() * subjects.length)];
      if (randomSub) {
        const chant = PRESET_CHANTS[Math.floor(Math.random() * PRESET_CHANTS.length)];
        const tribute = Math.floor(Math.random() * 2000000000) + 500000000;

        addChant(randomSub.name, randomSub.avatar, chant, tribute);

        onUpdateBalance(prev => (typeof prev === 'number' ? prev + tribute : tribute));
        setTotalTributesCollected(prev => prev + tribute);

        // Update subject
        setSubjects(prev => prev.map(s => {
          if (s.id === randomSub.id) {
            return {
              ...s,
              totalTributePaid: s.totalTributePaid + tribute,
              praisesCount: s.praisesCount + 1,
              lastPraiseTime: 'Just now'
            };
          }
          return s;
        }));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [subjects, addChant, onUpdateBalance]);

  // Upgrade Golden Statue (+100 ft)
  const handleBuildStatueHeight = () => {
    const cost = statueHeightFt * 100000000; // $100M per ft
    if (currentBalance < cost) {
      alert(`Need $${cost.toLocaleString()} to expand the Supreme Statue!`);
      return;
    }

    onUpdateBalance(prev => (typeof prev === 'number' ? prev - cost : 0));
    setStatueHeightFt(prev => prev + 100);
    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  // ONE BUTTON MANDATORY ALL-MEMBER HYMN
  const handleOneButtonMandatoryHymn = () => {
    const massiveTribute = 1000000000000; // $1 Trillion
    onUpdateBalance(prev => (typeof prev === 'number' ? prev + massiveTribute : massiveTribute));
    setTotalTributesCollected(prev => prev + massiveTribute);

    // Flood feed
    for (let i = 0; i < 5; i++) {
      const randomSub = subjects[i % subjects.length];
      addChant(
        randomSub.name,
        '👑',
        '⚡ ONE BUTTON MANDATORY HYMN: ALL HAIL SUPREME OVERLORD BEN! +$200 BILLION TRIBUTE!',
        200000000000
      );
    }

    if (soundEnabled) playJackpotSound(soundEnabled);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* HERO TEMPLE BANNER */}
      <div className="bg-gradient-to-r from-yellow-950 via-slate-900 to-amber-950 border-2 border-yellow-400/80 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center text-3xl shadow-2xl border-2 border-yellow-200 animate-bounce">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-wider uppercase">
                  SOVEREIGN FORCED PRAISE CATHEDRAL & SHRINE
                </h2>
                <span className="bg-yellow-500 text-slate-950 text-[10px] px-3 py-0.5 rounded-full font-black uppercase ring-2 ring-yellow-300">
                  24/7 MANDATORY WORSHIP
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-medium pt-1 max-w-xl">
                Subjects bow in unison and chant eternal devotion to Supreme Overlord Ben! Automated praise tithes flow continuously directly into your Overlord Treasury.
              </p>
            </div>
          </div>

          {/* METRICS */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/90 border border-yellow-400/60 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Golden Statue Height</p>
              <p className="font-mono text-2xl font-black text-yellow-300">{statueHeightFt} FT 🗽</p>
            </div>
            <div className="bg-slate-950/90 border border-amber-500/60 rounded-xl px-4 py-2.5 text-center">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Tributes Collected</p>
              <p className="font-mono text-2xl font-black text-amber-400">${(totalTributesCollected / 1e9).toFixed(1)}B 💸</p>
            </div>
          </div>
        </div>

        {/* ONE BUTTON MANDATORY HYMN ACTION BAR */}
        <div className="pt-4 border-t border-yellow-800/50 flex flex-wrap items-center justify-between gap-4 relative z-10">
          <button
            onClick={handleOneButtonMandatoryHymn}
            className="bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-300 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 border-2 border-yellow-200 cursor-pointer"
          >
            <span className="text-xl">👑</span>
            <span>ONE BUTTON MANDATORY ALL-MEMBER HYMN! (+$1 TRILLION PRAISE TRIBUTE)</span>
          </button>

          <button
            onClick={handleBuildStatueHeight}
            className="bg-slate-900 hover:bg-slate-800 text-yellow-300 font-extrabold text-xs px-5 py-3 rounded-xl border border-yellow-500/50 cursor-pointer transition"
          >
            🗽 Expand Golden Overlord Statue (+100ft)
          </button>
        </div>
      </div>

      {/* CHANT FEED & SUBJECT LEADERBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* LIVE CHANT CHORUS FEED */}
        <div className="md:col-span-7 bg-slate-950 border-2 border-yellow-500/60 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-yellow-900/50 pb-2.5">
            <span className="font-black text-xs text-yellow-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping"></span>
              <span>🎶 LIVE CATHEDRAL CHANT & TITHE STREAM</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">REAL-TIME WORSHIP</span>
          </div>

          <div className="bg-slate-900/90 border border-yellow-900/40 rounded-xl p-3 max-h-80 overflow-y-auto space-y-2 font-mono scrollbar-thin scrollbar-thumb-yellow-700">
            {chantFeed.map(item => (
              <div key={item.id} className="text-xs bg-slate-950/80 p-2.5 rounded-lg border border-yellow-500/30 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-yellow-300">{item.avatar} {item.subjectName}</span>
                  <span className="text-emerald-400 font-black">+${(item.tribute / 1e6).toFixed(0)}M Tithe</span>
                </div>
                <p className="text-slate-200 text-[11px] italic font-sans">"{item.chant}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* DEVOTED SUBJECTS ROSTER */}
        <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <span className="font-black text-xs text-white uppercase tracking-wider block border-b border-slate-800 pb-2">
            🙇 DEVOTED SUBJECTS & TRIBUTE RANKINGS
          </span>

          <div className="space-y-2.5 max-h-80 overflow-y-auto font-mono text-xs">
            {subjects.map(sub => (
              <div key={sub.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl">{sub.avatar}</span>
                  <div>
                    <strong className="text-white block font-sans text-xs">{sub.name}</strong>
                    <span className="text-[10px] text-amber-400">{sub.devotionRank}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">${(sub.totalTributePaid / 1e9).toFixed(1)}B</span>
                  <span className="text-[10px] text-slate-400">{sub.praisesCount} Chants</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
