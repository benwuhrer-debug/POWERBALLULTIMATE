/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let globalVolume: number = 0.5; // 0.0 to 1.0
let globalPitch: number = 1.0;  // 0.2 to 3.0
let globalSynthType: OscillatorType = 'sine'; // 'sine' | 'square' | 'sawtooth' | 'triangle'

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getGlobalVolume(): number {
  return globalVolume;
}

export function setGlobalVolume(v: number): void {
  globalVolume = Math.max(0, Math.min(1, v));
}

export function getGlobalPitch(): number {
  return globalPitch;
}

export function setGlobalPitch(p: number): void {
  globalPitch = Math.max(0.1, Math.min(3.0, p));
}

export function getGlobalSynthType(): OscillatorType {
  return globalSynthType;
}

export function setGlobalSynthType(type: OscillatorType): void {
  globalSynthType = type;
}

/**
 * Play a gentle, satisfying modern "pop" sound to simulate a lottery ball landing.
 */
export function playBallPop(enabled: boolean): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use customized synth type or fallback sine
    osc.type = globalSynthType === 'sine' ? 'sine' : globalSynthType;
    const baseFreq = 150 * globalPitch;
    const destFreq = 60 * globalPitch;

    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(destFreq, ctx.currentTime + 0.08);

    const maxVolume = 0.12 * globalVolume;
    gain.gain.setValueAtTime(maxVolume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {
    console.warn('Audio Context Blocked or Unsupported:', e);
  }
}

/**
 * Play a high-pitched double-ring "coin drop" sound when winning common cash prizes.
 */
export function playCoinSound(enabled: boolean): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // First ring
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = globalSynthType;
    
    const freq1 = 987.77 * globalPitch; // B5
    osc1.frequency.setValueAtTime(freq1, now);
    
    const vol1 = 0.15 * globalVolume;
    gain1.gain.setValueAtTime(vol1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start();
    osc1.stop(now + 0.15);

    // Second ring, slightly delayed and higher pitch
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = globalSynthType;
        
        const freq2 = 1318.51 * globalPitch; // E6
        osc2.frequency.setValueAtTime(freq2, ctx.currentTime);
        
        const vol2 = 0.15 * globalVolume;
        gain2.gain.setValueAtTime(vol2, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.start();
        osc2.stop(ctx.currentTime + 0.25);
      } catch (err) {}
    }, 70);

  } catch (e) {
    console.warn(e);
  }
}

/**
 * Play a triumphant, sweeping cosmic electronic synthesizer arpeggio when hitting a giant payout (Jackpot).
 */
export function playJackpotSound(enabled: boolean): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    // C Major Arpeggio frequencies
    const baseFreqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

    baseFreqs.forEach((freq, idx) => {
      const delay = idx * 0.12;
      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          // Use sawtooth or the globally preferred synthesizer
          osc.type = globalSynthType === 'sine' ? 'sawtooth' : globalSynthType;
          
          const adjustedFreq = freq * globalPitch;
          osc.frequency.setValueAtTime(adjustedFreq, ctx.currentTime);
          
          const maxVol = 0.1 * globalVolume;
          gain.gain.setValueAtTime(maxVol, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (err) {}
      }, delay * 1000);
    });

  } catch (e) {
    console.warn(e);
  }
}

/**
 * Play a subtle click sound for menus or manual picks.
 */
export function playTickSound(enabled: boolean): void {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle'; // standard crisp click
    const baseFreq = 1200 * globalPitch;
    const destFreq = 100 * globalPitch;
    
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(destFreq, ctx.currentTime + 0.02);

    const clickVol = 0.06 * globalVolume;
    gain.gain.setValueAtTime(clickVol, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.02);
  } catch (e) {
    console.warn(e);
  }
}

