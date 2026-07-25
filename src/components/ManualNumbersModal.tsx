/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { playTickSound } from '../utils/audio';

interface ManualNumbersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (whiteBalls: number[], powerball: number) => void;
  initialWhiteBalls: number[];
  initialPowerball: number;
  soundEnabled: boolean;
}

export const ManualNumbersModal: React.FC<ManualNumbersModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialWhiteBalls,
  initialPowerball,
  soundEnabled
}) => {
  const [selectedWhite, setSelectedWhite] = useState<number[]>([]);
  const [selectedPB, setSelectedPB] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedWhite([...initialWhiteBalls].sort((a, b) => a - b));
      setSelectedPB(initialPowerball > 0 ? initialPowerball : null);
    }
  }, [isOpen, initialWhiteBalls, initialPowerball]);

  if (!isOpen) return null;

  const toggleWhite = (num: number) => {
    playTickSound(soundEnabled);
    if (selectedWhite.includes(num)) {
      setSelectedWhite(selectedWhite.filter(n => n !== num));
    } else {
      if (selectedWhite.length < 5) {
        setSelectedWhite([...selectedWhite, num].sort((a, b) => a - b));
      }
    }
  };

  const selectPB = (num: number) => {
    playTickSound(soundEnabled);
    setSelectedPB(num);
  };

  const handleQuickPick = () => {
    playTickSound(soundEnabled);
    // Draw 5 unique whites
    const whites: number[] = [];
    while (whites.length < 5) {
      const num = Math.floor(Math.random() * 69) + 1;
      if (!whites.includes(num)) {
        whites.push(num);
      }
    }
    whites.sort((a, b) => a - b);
    const pb = Math.floor(Math.random() * 26) + 1;

    setSelectedWhite(whites);
    setSelectedPB(pb);
  };

  const handleSave = () => {
    if (selectedWhite.length === 5 && selectedPB !== null) {
      onSave(selectedWhite, selectedPB);
      onClose();
    }
  };

  const isSaveDisabled = selectedWhite.length !== 5 || selectedPB === null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/20 rounded-t-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-100 tracking-tight">Select Custom Ticket Numbers</h3>
            <p className="text-xs text-slate-400">Choose exactly 5 White Balls and 1 red Powerball</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg font-bold p-1 hover:bg-slate-800 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Contents representing betting slip */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          
          {/* Quick Info & Preview Strip */}
          <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-2 items-center">
              <span className="text-xs font-mono text-slate-400">Preview:</span>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const val = selectedWhite[idx];
                  return (
                    <span
                      key={`preview-white-${idx}`}
                      className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center border ${
                        val 
                          ? 'bg-slate-100 text-slate-900 border-white' 
                          : 'bg-transparent text-slate-600 border-dashed border-slate-800'
                      }`}
                    >
                      {val || '-'}
                    </span>
                  );
                })}
                <span
                  className={`w-7 h-7 rounded-full text-xs font-mono font-extrabold flex items-center justify-center border ${
                    selectedPB 
                      ? 'bg-red-500 text-white border-red-400' 
                      : 'bg-transparent text-red-900/60 border-dashed border-red-950/60'
                  }`}
                >
                  {selectedPB || '-'}
                </span>
              </div>
            </div>
            <button
              onClick={handleQuickPick}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1.5 px-3 bg-cyan-950/45 hover:bg-cyan-950 border border-cyan-800 rounded-lg transition"
            >
              ⚡ Random Quick Pick
            </button>
          </div>

          {/* Section 1: White Balls (1-69) */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-slate-300 tracking-wider">WHITE BALLS (1 - 69)</label>
              <span className="text-xs font-mono text-slate-400">
                Selected: <span className="text-cyan-400 font-bold">{selectedWhite.length}/5</span>
              </span>
            </div>
            
            <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50 max-h-[220px] overflow-y-auto">
              {Array.from({ length: 69 }, (_, i) => i + 1).map(num => {
                const isSelected = selectedWhite.includes(num);
                const isMaxed = selectedWhite.length >= 5 && !isSelected;
                return (
                  <button
                    key={`slip-white-${num}`}
                    type="button"
                    disabled={isMaxed}
                    onClick={() => toggleWhite(num)}
                    className={`h-9 rounded-lg font-mono text-xs font-semibold flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-sky-950 border-cyan-300 font-extrabold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                        : isMaxed
                          ? 'bg-slate-900/40 border-slate-950 text-slate-700 cursor-not-allowed'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Powerball (1-26) */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold text-red-400 tracking-wider">POWERBALL (1 - 26)</label>
              <span className="text-xs font-mono text-red-500/80">
                Selected: <span className="font-bold">{selectedPB !== null ? '1/1' : '0/1'}</span>
              </span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
              {Array.from({ length: 26 }, (_, i) => i + 1).map(num => {
                const isSelected = selectedPB === num;
                return (
                  <button
                    key={`slip-pb-${num}`}
                    type="button"
                    onClick={() => selectPB(num)}
                    className={`h-9 rounded-lg font-mono text-xs font-bold flex items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-red-500 text-white border-red-300 font-extrabold shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                        : 'bg-slate-900 border-slate-800 text-red-400/80 hover:bg-red-950/50 hover:text-red-300'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/35 rounded-b-2xl flex justify-between gap-3">
          <button
            onClick={() => {
              playTickSound(soundEnabled);
              setSelectedWhite([]);
              setSelectedPB(null);
            }}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            Clear Selected
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition border border-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaveDisabled}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition shadow-lg ${
                isSaveDisabled
                  ? 'bg-slate-800 text-slate-500 border border-slate-900 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:translate-y-[-1px] active:translate-y-[0px]'
              }`}
            >
              Lock in Ticket
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
