/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Sliders, 
  Tv, 
  Sun, 
  Sparkles, 
  Zap, 
  Waves, 
  Flame, 
  MonitorPlay,
  RotateCw
} from 'lucide-react';
import { 
  getGlobalVolume, 
  setGlobalVolume, 
  getGlobalPitch, 
  setGlobalPitch, 
  getGlobalSynthType, 
  setGlobalSynthType,
  playCoinSound,
  playJackpotSound,
  playTickSound,
  playBallPop
} from '../utils/audio';

interface AudioVisualRigProps {
  adminSettings: any;
  onUpdateSettings: (newSettings: any) => void;
}

export const AudioVisualRig: React.FC<AudioVisualRigProps> = ({
  adminSettings,
  onUpdateSettings,
}) => {
  // Sync initial parameters with default settings or set standard baselines
  const initialVolume = adminSettings.globalVolume !== undefined ? adminSettings.globalVolume : 0.5;
  const initialPitch = adminSettings.globalPitch !== undefined ? adminSettings.globalPitch : 1.0;
  const initialSynth = adminSettings.globalSynthType || 'sine';
  const initialBrightness = adminSettings.screenBrightness !== undefined ? adminSettings.screenBrightness : 100;
  const initialCrt = adminSettings.crtScanlines !== false && adminSettings.crtScanlines !== undefined;
  const initialGlow = adminSettings.neonGlowLevel !== undefined ? adminSettings.neonGlowLevel : 3;
  const initialShake = adminSettings.chaosForceShake !== undefined ? adminSettings.chaosForceShake : 0;
  const initialHue = adminSettings.colorHueRotate !== undefined ? adminSettings.colorHueRotate : 0;

  // Local React states
  const [volume, setVolume] = useState<number>(initialVolume);
  const [pitch, setPitch] = useState<number>(initialPitch);
  const [synthType, setSynthType] = useState<'sine' | 'square' | 'sawtooth' | 'triangle'>(initialSynth);
  const [brightness, setBrightness] = useState<number>(initialBrightness);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(initialCrt);
  const [neonGlow, setNeonGlow] = useState<number>(initialGlow);
  const [shakeLevel, setShakeLevel] = useState<number>(initialShake);
  const [hueRotation, setHueRotation] = useState<number>(initialHue);

  // Oscilloscope canvas reference
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const waveOffsetRef = useRef<number>(0);
  const activeExcitationRef = useRef<number>(0); // momentary amplitude jump on sound trigger

  // Sync state changes back to static Audio managers and App settings
  const updateVolume = (v: number) => {
    setVolume(v);
    setGlobalVolume(v);
    onUpdateSettings({ ...adminSettings, globalVolume: v });
  };

  const updatePitch = (p: number) => {
    setPitch(p);
    setGlobalPitch(p);
    onUpdateSettings({ ...adminSettings, globalPitch: p });
  };

  const updateSynth = (type: 'sine' | 'square' | 'sawtooth' | 'triangle') => {
    setSynthType(type);
    setGlobalSynthType(type);
    onUpdateSettings({ ...adminSettings, globalSynthType: type });
  };

  const updateBrightness = (b: number) => {
    setBrightness(b);
    onUpdateSettings({ ...adminSettings, screenBrightness: b });
  };

  const updateCrt = (enabled: boolean) => {
    setCrtEnabled(enabled);
    onUpdateSettings({ ...adminSettings, crtScanlines: enabled });
  };

  const updateGlow = (g: number) => {
    setNeonGlow(g);
    onUpdateSettings({ ...adminSettings, neonGlowLevel: g });
  };

  const updateShake = (s: number) => {
    setShakeLevel(s);
    onUpdateSettings({ ...adminSettings, chaosForceShake: s });
  };

  const updateHue = (h: number) => {
    setHueRotation(h);
    onUpdateSettings({ ...adminSettings, colorHueRotate: h });
  };

  // Sound triggering functions that also excite the live oscilloscope visualization
  const triggerTestSound = (soundType: 'tick' | 'pop' | 'coin' | 'jackpot') => {
    // Excite the visual wave based on pitch & sound style
    activeExcitationRef.current = soundType === 'jackpot' ? 2.5 : soundType === 'coin' ? 1.5 : 0.8;
    
    switch (soundType) {
      case 'tick':
        playTickSound(true);
        break;
      case 'pop':
        playBallPop(true);
        break;
      case 'coin':
        playCoinSound(true);
        break;
      case 'jackpot':
        playJackpotSound(true);
        break;
    }
  };

  // Automated tremor simulation shake trigger
  const [isTestShaking, setIsTestShaking] = useState(false);
  const triggerTestShake = () => {
    setIsTestShaking(true);
    let orig = adminSettings.chaosForceShake;
    updateShake(3.5); // set strong structural tremor
    setTimeout(() => {
      updateShake(0);
      setIsTestShaking(false);
    }, 1500);
  };

  // Draw simulated realtime audio signal waves (Oscilloscope) on Canvas
  useEffect(() => {
    const drawOscilloscope = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      
      // Keep resized resolution matching device pixels ratio
      if (canvas.clientWidth !== width || canvas.clientHeight !== height) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.fillStyle = '#020617'; // slate-950 background
      ctx.fillRect(0, 0, width, height);

      // Draw faint cyber grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Sine wave calculation
      ctx.beginPath();
      ctx.strokeStyle = synthType === 'square' ? '#10b981' : synthType === 'sawtooth' ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 2.5;
      
      // Apply neon glowing effect to canvas line
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle as string;

      const midY = height / 2;
      // Combine baseline animation waves with standard pitch frequencies and dynamic physical excitation decay
      waveOffsetRef.current += 0.05 + (pitch * 0.02);
      activeExcitationRef.current = Math.max(0, activeExcitationRef.current - 0.03); // decay rate

      // Generate waveform geometry matching synthesizer profile
      for (let x = 0; x < width; x++) {
        const normalizedX = x / width;
        const phase = normalizedX * Math.PI * 4 * pitch + waveOffsetRef.current;
        let amplitude = (height * 0.22) * (volume + 0.1) * (1 + activeExcitationRef.current);
        
        // Dampen edges to look like a hardware scope
        const edgeDampener = Math.sin(normalizedX * Math.PI);
        amplitude = amplitude * edgeDampener;

        let y = midY;
        if (synthType === 'sine') {
          y += Math.sin(phase) * amplitude;
        } else if (synthType === 'square') {
          y += (Math.sin(phase) >= 0 ? 1 : -1) * amplitude;
        } else if (synthType === 'sawtooth') {
          // modulo wave
          const val = (phase / Math.PI) % 2; // range 0 to 2
          y += (val - 1) * amplitude;
        } else if (synthType === 'triangle') {
          // abs triangle wave
          const val = (phase / Math.PI) % 2;
          y += (Math.abs(val - 1) * 2 - 1) * amplitude;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw horizontal baseline
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      animationRef.current = requestAnimationFrame(drawOscilloscope);
    };

    animationRef.current = requestAnimationFrame(drawOscilloscope);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [volume, pitch, synthType]);

  return (
    <div className="bg-slate-900 border border-slate-750 p-6 rounded-3xl shadow-2xl space-y-6 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background neon grid filter */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_0.2px,transparent_0.2px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

      {/* HEADER BAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-850 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest font-black uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-full">
              Engine Room A/V System
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-cyan-950/50 border border-cyan-900/40 text-cyan-400 rounded-md font-bold">
              Broadcaster Console
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-100 mt-1 flex items-center gap-2">
            🎛️ CINEMATIC EFFECTS, SYNTH AUDIO & DISPLAY CONTROLLER
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Configure raw synthesized acoustic properties, customize visual contrast filters, toggle analog tube monitors, and manipulate structural render parameters globally.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              updateVolume(0.5);
              updatePitch(1.0);
              updateSynth('sine');
              updateBrightness(100);
              updateCrt(true);
              updateGlow(3);
              updateShake(0);
              updateHue(0);
              triggerTestSound('tick');
            }}
            className="px-3.5 py-1.5 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-mono font-bold text-slate-300 rounded-lg transition-all"
          >
            🔄 RESET CODES TARGETS TO DEFAULT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: SOUND PARAMETERS & LIVE SPECTRUM OSCILLOSCOPE */}
        <div className="xl:col-span-6 space-y-6">
          
          {/* Waveform Generator Block */}
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black text-cyan-400 block uppercase tracking-wider">
                🔊 COGNITIVE SYNTHESIS SOUND BOARD
              </span>
              <Music className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Simulated Live Oscilloscope Canvas */}
            <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
              <canvas ref={canvasRef} className="w-full h-32 block" />
              <div className="absolute top-2 right-3 font-mono text-[9px] text-slate-500 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-850">
                ACTIVE VOICE SPECTRUM
              </div>
            </div>

            {/* Audio sliders */}
            <div className="space-y-4 font-mono text-xs pt-1">
              
              {/* Volume Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    {volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                    GLOBAL SYNTHESIZER VOLUME:
                  </span>
                  <span className={`font-bold ${volume > 0.7 ? 'text-rose-400' : 'text-cyan-400'}`}>
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => updateVolume(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                />
                <span className="text-[9.5px] text-slate-500">Applies a direct gain multiplier to all dynamic system oscillators.</span>
              </div>

              {/* Pitch Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    ACOUSTIC PITCH MULTIPLIER:
                  </span>
                  <span className="text-purple-400 font-bold">{pitch.toFixed(1)}x speed</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={pitch}
                  onChange={(e) => updatePitch(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                />
                <span className="text-[9.5px] text-slate-500">Bends frequencies from deep space low-frequency hums to retro video game chiptunes.</span>
              </div>

              {/* Waveform Selector */}
              <div className="space-y-1.5">
                <span className="text-[10.5px] text-slate-400 block uppercase">OSCILLATOR HARMONIC WAVEFORM STRUCTURE:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'sine', name: 'Sine', desc: 'Smooth, pure tone' },
                    { id: 'square', name: 'Square', desc: 'Chippy & retro' },
                    { id: 'sawtooth', name: 'Sawtooth', desc: 'Edgy & sharp' },
                    { id: 'triangle', name: 'Triangle', desc: 'Warm & balanced' },
                  ].map((wave) => (
                    <button
                      key={wave.id}
                      onClick={() => {
                        updateSynth(wave.id as any);
                        triggerTestSound('tick');
                      }}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-between ${
                        synthType === wave.id
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold text-[11.5px]">{wave.name}</span>
                      <span className="text-[8px] text-slate-550 block leading-tight mt-0.5">{wave.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Audio Acoustic Test Triggers */}
              <div className="border-t border-slate-900 pt-3.5 space-y-2">
                <span className="text-[9.5px] font-bold text-slate-450 block uppercase tracking-wide">💡 LIVE AUDIO TRANSMITTER TEST TRIGGERS</span>
                <div className="flex flex-wrap gap-2 text-[10.5px]">
                  <button
                    onClick={() => triggerTestSound('tick')}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-slate-100 rounded-lg transition"
                  >
                    🔊 Test Menu Click
                  </button>
                  <button
                    onClick={() => triggerTestSound('pop')}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-slate-100 rounded-lg transition"
                  >
                    🔊 Test Ball landing
                  </button>
                  <button
                    onClick={() => triggerTestSound('coin')}
                    className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 hover:text-emerald-300 rounded-lg transition font-bold"
                  >
                    💰 Test Cash Payout
                  </button>
                  <button
                    onClick={() => triggerTestSound('jackpot')}
                    className="px-3 py-1.5 bg-purple-950 border border-purple-800 text-purple-300 hover:bg-purple-900 hover:text-purple-200 rounded-lg transition font-bold"
                  >
                    🎰 Test jackpot Sweep
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CINEMATIC VISUAL DISPLAY MANAGEMENT PANEL */}
        <div className="xl:col-span-6 space-y-6">
          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black text-purple-400 block uppercase tracking-wider">
                🖥️ VISUAL DISPLAY RENDER CONTROLS
              </span>
              <Tv className="w-4 h-4 text-purple-400" />
            </div>

            <div className="space-y-4 font-mono text-xs">
              
              {/* Screen Brightness Filter */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    SCREEN BRIGHTNESS SCALE:
                  </span>
                  <span className="text-amber-400 font-bold">{brightness}% contrast</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="145"
                  step="5"
                  value={brightness}
                  onChange={(e) => updateBrightness(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                />
                <span className="text-[9.5px] text-slate-500">Globally shifts CSS elements brightness filter levels dynamically.</span>
              </div>

              {/* CRT Phosphor Scanline Filter Toggle */}
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-850">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <MonitorPlay className="w-3.5 h-1.5 text-cyan-400" />
                    CRT Arcade Scanlines System:
                  </span>
                  <p className="text-[9.5px] text-slate-500">Overlay retro CRT scanning raster grids over the dashboard viewports.</p>
                </div>
                <button
                  onClick={() => {
                    updateCrt(!crtEnabled);
                    triggerTestSound('tick');
                  }}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative shrink-0 ${
                    crtEnabled ? 'bg-cyan-500' : 'bg-slate-800'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shift transform transition-transform ${
                    crtEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Neon Glow Amplification Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    ATMOSPHERIC NEON GLOW INTENSITY:
                  </span>
                  <span className="text-rose-400 font-bold">Level {neonGlow} glow</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={neonGlow}
                  onChange={(e) => updateGlow(parseInt(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                />
                <span className="text-[9.5px] text-slate-500">Injects custom CSS variable shadows for gorgeous atmospheric backlighting.</span>
              </div>

              {/* Cybermatic Color Hue Rotation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                    SYSTEM Wavelength Hue Rotation:
                  </span>
                  <span className="text-indigo-400 font-bold">{hueRotation}° rotation</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={hueRotation}
                  onChange={(e) => updateHue(parseInt(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-lg appearance-none"
                />
                <span className="text-[9.5px] text-slate-500">Shifts color spectra globally using CSS hue filter maps. Allows trippy aesthetics!</span>
              </div>

              {/* Physics Vibration Screen Shake */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 block uppercase">STRESS VIBRATION & TREMOR SYSTEM:</span>
                <div className="flex items-center gap-4 bg-slate-900/60 p-3 rounded-lg border border-slate-850">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-slate-350">TREMOR AMPLITUDE MULTIPLIER:</span>
                      <span className="text-amber-500 font-bold">{shakeLevel}px threshold</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={shakeLevel}
                      onChange={(e) => updateShake(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-1 bg-slate-950 rounded-lg appearance-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      triggerTestSound('jackpot');
                      triggerTestShake();
                    }}
                    disabled={isTestShaking}
                    className="px-3.5 py-2 hover:bg-amber-900 hover:text-amber-300 text-amber-550 border border-amber-800 bg-slate-950 rounded-xl transition text-[11px] font-bold select-none shrink-0"
                  >
                    ⚡ {isTestShaking ? 'TREMOR CYCLING...' : 'TRIGGER TEST VIBRATE'}
                  </button>
                </div>
                <span className="text-[9.5px] text-slate-500 leading-tight block mt-0.5">Simulates ground tremors or structural breakdowns when winning grand lottery prizes.</span>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
