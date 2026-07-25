import React, { useState, useEffect } from 'react';
import { playCoinSound, playJackpotSound, playTickSound } from '../utils/audio';

export interface CustomUserTab {
  id: string;
  label: string;
  icon: string;
  description: string;
  payoutPerSec: number;
  embedUrl?: string;
  notes?: string;
  createdAt: string;
}

interface CustomTabManagerProps {
  currentBalance: number;
  onUpdateBalance: (newBalance: number | ((prev: number) => number)) => void;
  soundEnabled: boolean;
  onAddNewTabToNav: (tab: CustomUserTab) => void;
  onSelectTab: (tabId: string) => void;
  customTabsList: CustomUserTab[];
  onDeleteCustomTab: (tabId: string) => void;
}

export const CustomTabManager: React.FC<CustomTabManagerProps> = ({
  currentBalance,
  onUpdateBalance,
  soundEnabled,
  onAddNewTabToNav,
  onSelectTab,
  customTabsList,
  onDeleteCustomTab,
}) => {
  // Form State for creating a brand new tab
  const [newTabLabel, setNewTabLabel] = useState<string>('');
  const [newTabIcon, setNewTabIcon] = useState<string>('⚡');
  const [newTabDescription, setNewTabDescription] = useState<string>('');
  const [newTabPayout, setNewTabPayout] = useState<string>('1000000000'); // $1B/s
  const [newTabEmbedUrl, setNewTabEmbedUrl] = useState<string>('');
  const [newTabNotes, setNewTabNotes] = useState<string>('');

  const [managerLog, setManagerLog] = useState<string>('Custom Tab Engine Online. You can create unlimited dynamic tabs and add them directly to the UI sidebar.');

  const handleCreateTab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTabLabel.trim()) return;

    const newTabObj: CustomUserTab = {
      id: `custom-tab-${Date.now()}`,
      label: `${newTabIcon.trim() || '⚡'} ${newTabLabel.trim()}`,
      icon: newTabIcon.trim() || '⚡',
      description: newTabDescription.trim() || 'Custom user created feature tab in Powerball Multiverse.',
      payoutPerSec: parseFloat(newTabPayout) || 1000000000,
      embedUrl: newTabEmbedUrl.trim() || undefined,
      notes: newTabNotes.trim() || undefined,
      createdAt: new Date().toLocaleTimeString(),
    };

    onAddNewTabToNav(newTabObj);
    if (soundEnabled) playJackpotSound(soundEnabled);
    setManagerLog(`✨ TAB CREATED: Successfully added '${newTabObj.label}' to the UI bar! Navigating to new tab...`);

    // Reset form
    setNewTabLabel('');
    setNewTabDescription('');
    setNewTabEmbedUrl('');
    setNewTabNotes('');

    // Switch to newly created tab
    onSelectTab(newTabObj.id);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-r from-slate-950 via-cyan-950 to-slate-950 border-2 border-cyan-400 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg border border-cyan-200">
            ➕
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                DYNAMIC TAB CREATOR & AI FEATURE LAB
              </h2>
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-black px-3 py-1 rounded-full border border-cyan-500/40 animate-pulse">
                UNLIMITED UI TABS
              </span>
            </div>
            <p className="text-xs text-slate-300 pt-1">
              Add new custom tabs directly to the navigation sidebar bar with custom cash generators, embed views, and widgets!
            </p>
          </div>
        </div>

        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-400 uppercase">ACTIVE CUSTOM TABS</div>
          <div className="text-xl font-black text-cyan-300">{customTabsList.length} Tabs Added</div>
        </div>
      </div>

      {/* CREATE TAB FORM & USER TABS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* FORM PANEL */}
        <form onSubmit={handleCreateTab} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center space-x-2">
            <span>✨ CREATE & ADD NEW TAB TO SIDEBAR</span>
          </h3>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Emoji Icon</label>
              <input
                type="text"
                value={newTabIcon}
                onChange={e => setNewTabIcon(e.target.value)}
                placeholder="⚡"
                className="w-full bg-slate-950 border border-slate-700 text-center text-white font-bold text-sm px-3 py-2 rounded-xl"
              />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tab Title / Label</label>
              <input
                type="text"
                value={newTabLabel}
                onChange={e => setNewTabLabel(e.target.value)}
                placeholder="e.g. Quantum Particle Collider"
                required
                className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-sm px-3 py-2 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Tab Description & Tooltip</label>
            <input
              type="text"
              value={newTabDescription}
              onChange={e => setNewTabDescription(e.target.value)}
              placeholder="e.g. Particle collision cash generator and antimatter vault."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Passive Cash Output ($ / sec)</label>
              <input
                type="number"
                value={newTabPayout}
                onChange={e => setNewTabPayout(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold text-xs px-3 py-2 rounded-xl"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Optional Web Embed URL (iframe)</label>
              <input
                type="url"
                value={newTabEmbedUrl}
                onChange={e => setNewTabEmbedUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-950 border border-slate-700 text-cyan-300 font-mono text-xs px-3 py-2 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Custom Notes / Widget Content</label>
            <textarea
              rows={3}
              value={newTabNotes}
              onChange={e => setNewTabNotes(e.target.value)}
              placeholder="Write any custom instructions, rules, or formulas for this tab..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs p-3 rounded-xl custom-scrollbar"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white font-black text-xs py-3 rounded-xl shadow-xl transition-all"
          >
            ➕ ADD TAB TO UI SIDEBAR BAR NOW
          </button>
        </form>

        {/* CREATED TABS LIST PANEL */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex justify-between items-center">
              <span>🗂️ YOUR CUSTOM CREATED TABS ({customTabsList.length})</span>
            </h3>

            {customTabsList.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <span className="text-4xl">📥</span>
                <p className="text-xs text-slate-400 font-bold">No custom tabs created yet.</p>
                <p className="text-[10px] text-slate-500">Fill out the form on the left to add a brand new tab to the sidebar!</p>
              </div>
            ) : (
              <div className="space-y-3 mt-3 max-h-[380px] overflow-y-auto custom-scrollbar">
                {customTabsList.map(ctab => (
                  <div key={ctab.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3 font-mono text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>{ctab.icon}</span>
                        <span className="text-cyan-300">{ctab.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{ctab.description}</p>
                      <p className="text-[10px] text-emerald-400">Yield: +${ctab.payoutPerSec.toLocaleString()}/sec</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          if (soundEnabled) playTickSound(soundEnabled);
                          onSelectTab(ctab.id);
                        }}
                        className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        OPEN
                      </button>
                      <button
                        onClick={() => {
                          if (soundEnabled) playTickSound(soundEnabled);
                          onDeleteCustomTab(ctab.id);
                        }}
                        className="bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-1.5 rounded-lg transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono text-cyan-200/90">
            {managerLog}
          </div>
        </div>

      </div>
    </div>
  );
};
