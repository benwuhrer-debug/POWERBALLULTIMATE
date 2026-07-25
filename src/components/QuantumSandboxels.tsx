/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Droplet, 
  Wind, 
  Zap, 
  RefreshCw, 
  Eraser, 
  Play, 
  Pause, 
  Trash2, 
  HelpCircle, 
  Sparkles,
  Settings,
  Scale,
  Thermometer,
  Shield,
  Coins
} from 'lucide-react';
import { playTickSound, playBallPop, playCoinSound, playJackpotSound } from '../utils/audio';

// Dynamic Element Registry symbols
const symbols = "H,He,Li,Be,B,C,N,O,F,Ne,Na,Mg,Al,Si,P,S,Cl,Ar,K,Ca,Sc,Ti,V,Cr,Mn,Fe,Co,Ni,Cu,Zn,Ga,Ge,As,Se,Br,Kr,Rb,Sr,Y,Zr,Nb,Mo,Tc,Ru,Rh,Pd,Ag,Cd,In,Sn,Sb,Te,I,Xe,Cs,Ba,La,Ce,Pr,Nd,Pm,Sm,Eu,Gd,Tb,Dy,Ho,Er,Tm,Yb,Lu,Hf,Ta,W,Re,Os,Ir,Pt,Au,Hg,Tl,Pb,Bi,Po,At,Rn,Fr,Ra,Ac,Th,Pa,U,Np,Pu,Am,Cm,Bk,Cf,Es,Fm,Md,No,Lr,Rf,Db,Sg,Bh,Hs,Mt,Ds,Rg,Cn,Nh,Fl,Mc,Lv,Ts,Og".split(",");

const names: Record<string, string> = {
  H: "Hydrogen", He: "Helium", Li: "Lithium", Be: "Beryllium", B: "Boron", C: "Carbon", N: "Nitrogen", O: "Oxygen", F: "Fluorine", Ne: "Neon",
  Na: "Sodium", Mg: "Magnesium", Al: "Aluminum", Si: "Silicon", P: "Phosphorus", S: "Sulfur", Cl: "Chlorine", Ar: "Argon", K: "Potassium", Ca: "Calcium",
  Sc: "Scandium", Ti: "Titanium", V: "Vanadium", Cr: "Chromium", Mn: "Manganese", Fe: "Iron", Co: "Cobalt", Ni: "Nickel", Cu: "Copper", Zn: "Zinc",
  Ga: "Gallium", Ge: "Germanium", As: "Arsenic", Se: "Selenium", Br: "Bromine", Kr: "Krypton", Rb: "Rubidium", Sr: "Strontium", Y: "Yttrium", Zr: "Zirconium",
  Nb: "Niobium", Mo: "Molybdenum", Tc: "Technetium", Ru: "Ruthenium", Rh: "Rhodium", Pd: "Palladium", Ag: "Silver", Cd: "Cadmium", In: "Indium", Sn: "Tin",
  Sb: "Antimony", Te: "Tellurium", I: "Iodine", Xe: "Xenon", Cs: "Cesium", Ba: "Barium", La: "Lanthanum", Ce: "Cerium", Pr: "Praseodymium", Nd: "Neodymium",
  Pm: "Promethium", Sm: "Samarium", Eu: "Europium", Gd: "Gadolinium", Tb: "Terbium", Dy: "Dysprosium", Ho: "Holmium", Er: "Erbium", Tm: "Thulium", Yb: "Ytterbium",
  Lu: "Lutetium", Hf: "Hafnium", Ta: "Tantalum", W: "Tungsten", Re: "Rhenium", Os: "Osmium", Ir: "Iridium", Pt: "Platinum", Au: "Gold", Hg: "Mercury",
  Tl: "Thallium", Pb: "Lead", Bi: "Bismuth", Po: "Polonium", At: "Astatine", Rn: "Radon", Fr: "Francium", Ra: "Radium", Ac: "Actinium", Th: "Thorium",
  Pa: "Protactinium", U: "Uranium", Np: "Neptunium", Pu: "Plutonium", Am: "Americium", Cm: "Curium", Bk: "Berkelium", Cf: "Californium", Es: "Einsteinium",
  Fm: "Fermium", Md: "Mendelevium", No: "Nobelium", Lr: "Lawrencium", Rf: "Rutherfordium", Db: "Dubnium", Sg: "Seaborgium", Bh: "Bohrium", Hs: "Hassium",
  Mt: "Meitnerium", Ds: "Darmstadtium", Rg: "Roentgenium", Cn: "Copernicium", Nh: "Nihonium", Fl: "Flerovium", Mc: "Moscovium", Lv: "Livermorium", Ts: "Tennessine", Og: "Oganesson"
};

export interface PeriodicElement {
  num: number;
  symbol: string;
  name: string;
  series: 'alkali' | 'alkaline_earth' | 'transition' | 'basic_metal' | 'metalloid' | 'nonmetal' | 'halogen' | 'noble_gas' | 'lanthanide' | 'actinide';
  state: 'solid' | 'liquid' | 'gas';
  color: string;
  desc: string;
  density?: number;
}

export const PERIODIC_ELEMENTS: PeriodicElement[] = symbols.map((sym, index) => {
  const num = index + 1;
  const name = names[sym] || sym;
  let series: any = 'transition';
  let state: any = 'solid';
  let color = '#38bdf8';
  let desc = 'Metallic metal element.';

  if (sym === 'H') {
    series = 'nonmetal';
    state = 'gas';
    color = '#fb923c';
    desc = 'Highly explosive light element gas.';
  } else if ([2, 10, 18, 36, 54, 86, 118].includes(num)) {
    series = 'noble_gas';
    state = 'gas';
    color = '#f472b6';
    desc = 'Inert noble gas, glows brightly under electrical spark.';
  } else if ([3, 11, 19, 37, 55, 87].includes(num)) {
    series = 'alkali';
    color = '#f87171';
    desc = 'Extremely reactive alkali metal. Explodes violently upon contact with water or acids.';
  } else if ([4, 12, 20, 38, 56, 88].includes(num)) {
    series = 'alkaline_earth';
    color = '#fbbf24';
    desc = 'Alkaline earth metal. Magnesium (Mg) burns with a blinding hot white plasma flare.';
  } else if ([9, 17, 35, 53, 85, 117].includes(num)) {
    series = 'halogen';
    state = sym === 'Br' ? 'liquid' : 'gas';
    color = '#2dd4bf';
    desc = 'Aggressive halogen. Corrosive and produces hazardous toxic gas or fumes.';
  } else if ([5, 14, 32, 33, 51, 52, 84].includes(num)) {
    series = 'metalloid';
    color = '#34d399';
    desc = 'Metalloid semiconductor. Silicon (Si) is highly stable.';
  } else if ([6, 7, 8, 15, 16, 34].includes(num)) {
    series = 'nonmetal';
    state = ['N', 'O'].includes(sym) ? 'gas' : 'solid';
    color = '#fb923c';
    desc = sym === 'O' ? 'Oxygen gas, supports high-speed combustion.' : sym === 'C' ? 'Carbon solid powder, burns into ash.' : 'Smelly solid nonmetal, highly flammable.';
  } else if (num >= 57 && num <= 71) {
    series = 'lanthanide';
    color = '#c084fc';
    desc = 'Rare earth lanthanide element.';
  } else if (num >= 89 && num <= 103) {
    series = 'actinide';
    color = '#a3e635';
    desc = 'Actinide nuclear fuel. Uranium (U) and Plutonium (Pu) undergo fission chain reactions.';
  } else if ([13, 31, 49, 50, 81, 82, 83, 113, 114, 115, 116].includes(num)) {
    series = 'basic_metal';
    color = '#94a3b8';
    desc = sym === 'Pb' ? 'Dense protective shielding metal. Absorbs toxic neutrons.' : 'Post-transition metal.';
  } else {
    if (sym === 'Hg') {
      state = 'liquid';
      color = '#cbd5e1';
      desc = 'Liquid mercury metal. Sinks deeply under water, acid, and oil.';
    } else if (sym === 'Au') {
      color = '#fbbf24';
      desc = 'Beautiful gold metal. High electrical conductivity, rust resistant.';
    } else if (sym === 'Cu') {
      color = '#ea580c';
      desc = 'Copper metal. Excellent electricity conductor.';
    } else if (sym === 'Fe') {
      color = '#8898a5';
      desc = 'Metallic iron. Rusts into powder when touching water/acids.';
    } else if (sym === 'W') {
      color = '#475569';
      desc = 'Tungsten. Infinite heat point, immune to melting and fire.';
    } else if (sym === 'Pt') {
      color = '#e2e8f0';
      desc = 'Platinum. Inert and highly conductive heavy metal.';
    }
  }

  return { num, symbol: sym, name, series, state, color, desc };
});

// Custom core non-periodic elements
export interface CustomElement {
  id: string;
  name: string;
  category: 'essentials' | 'solids' | 'liquids' | 'gases' | 'energy';
  state: 'solid' | 'powder' | 'liquid' | 'gas' | 'energy' | 'immovable';
  color: string;
  desc: string;
  density?: number; // for liquids layering
}

const CUSTOM_ELEMENTS: CustomElement[] = [
  { id: 'eraser', name: 'Eraser', category: 'essentials', state: 'immovable', color: '#0f172a', desc: 'Erase painted blocks.' },
  { id: 'sand', name: 'Sand Powder', category: 'essentials', state: 'powder', color: '#fef08a', desc: 'Classic falling granular silicon dioxide.' },
  { id: 'water', name: 'Pure H₂O', category: 'essentials', state: 'liquid', color: '#38bdf8', desc: 'Flowing water. Dissolves salts, cools lava, reacts with Na/K.', density: 3 },
  { id: 'fire', name: 'Combustion Fire', category: 'essentials', state: 'energy', color: '#f97316', desc: 'Hot fire. Burns fuels, boils water, vaporizes gases.' },
  { id: 'lava', name: 'Molten Lava', category: 'essentials', state: 'liquid', color: '#ef4444', desc: 'Extremely hot viscous liquid. Burns things, turns to stone with water.', density: 6 },
  { id: 'acid', name: 'Corrosive Acid', category: 'essentials', state: 'liquid', color: '#84cc16', desc: 'Aggressive liquid. Dissolves metals, wood, plants into gas.', density: 4 },
  { id: 'oil', name: 'Viscous Crude Oil', category: 'liquids', state: 'liquid', color: '#1e293b', desc: 'Light flammable liquid. Floats on water, catches fire easily.', density: 2 },
  { id: 'honey', name: 'Viscous Honey', category: 'liquids', state: 'liquid', color: '#d97706', desc: 'Thick organic liquid. Flows very slowly.', density: 5 },
  { id: 'liquid_nitrogen', name: 'Liquid N₂', category: 'liquids', state: 'liquid', color: '#93c5fd', desc: 'Sub-zero liquid. Freezes water, extinguishes fire immediately.', density: 2 },
  { id: 'wood', name: 'Organic Wood', category: 'solids', state: 'immovable', color: '#78350f', desc: 'Solid organic structure. Burns slowly into ash.' },
  { id: 'plant', name: 'Living Plant', category: 'solids', state: 'immovable', color: '#22c55e', desc: 'Grows over dirt/water. Highly flammable.' },
  { id: 'soil', name: 'Organic Soil', category: 'solids', state: 'powder', color: '#451a03', desc: 'Fertile dirt powder. Absorbs water, grows plants.' },
  { id: 'glass', name: 'Silicon Glass', category: 'solids', state: 'immovable', color: '#e2e8f0', desc: 'Heat-resistant, acid-proof containment shield.' },
  { id: 'obsidian', name: 'Vitreous Obsidian', category: 'solids', state: 'immovable', color: '#030712', desc: 'Forged from lava and water. Extremely durable.' },
  { id: 'salt', name: 'Sodium Chloride (Salt)', category: 'solids', state: 'powder', color: '#f1f5f9', desc: 'Granular ionic crystal. Dissolves in water.' },
  { id: 'gunpowder', name: 'Black Gunpowder', category: 'solids', state: 'powder', color: '#475569', desc: 'Nitrate mixture. Detonates in contact with fire or sparks.' },
  { id: 'wall', name: 'Unbreakable Wall', category: 'solids', state: 'immovable', color: '#334155', desc: 'Indestructible concrete grid wall.' },
  { id: 'smoke', name: 'Carbon Smoke', category: 'gases', state: 'gas', color: '#64748b', desc: 'Light ash gas. Dissipates upwards.' },
  { id: 'steam', name: 'Water Steam', category: 'gases', state: 'gas', color: '#cbd5e1', desc: 'Boiled water vapor. Dissipates and condenses.' },
  { id: 'methane', name: 'Fossil Methane CH₄', category: 'gases', state: 'gas', color: '#a7f3d0', desc: 'Highly flammable gas. Explodes instantly with fire.' },
  { id: 'plasma', name: 'Thermonuclear Plasma', category: 'energy', state: 'energy', color: '#a855f7', desc: 'Hyperheated plasma gas. Vaporizes almost anything instantly.' },
  { id: 'spark', name: 'Electric Spark', category: 'energy', state: 'energy', color: '#22d3ee', desc: 'Electrical charge. Travels along metals, ignites combustibles.' },
  { id: 'void', name: 'Blackhole Void', category: 'energy', state: 'immovable', color: '#111827', desc: 'Supermassive pixel void. Swallows all neighboring elements.' }
];

interface ElementCell {
  type: string; // id or symbol
  isCustom: boolean; // custom vs periodic
  color: string;
  life: number; // tick duration
  charge?: number; // electricity charge
  temp?: number; // temperature
}

interface QuantumSandboxelsProps {
  cheatBalance: number;
  onUpdateBalance: (newBal: number) => void;
  soundEnabled: boolean;
}

export const QuantumSandboxels: React.FC<QuantumSandboxelsProps> = ({
  cheatBalance,
  onUpdateBalance,
  soundEnabled
}) => {
  // Grid config
  const gridWidth = 110;
  const gridHeight = 70;
  const scale = 6; // Canvas visual scaling

  // React states
  const [activeCategory, setActiveCategory] = useState<'essentials' | 'solids' | 'liquids' | 'gases' | 'energy' | 'periodic'>('essentials');
  const [selectedElement, setSelectedElement] = useState<{ id: string; isCustom: boolean }>({ id: 'sand', isCustom: true });
  const [brushSize, setBrushSize] = useState<number>(3);
  const [brushShape, setBrushShape] = useState<'circle' | 'square' | 'spray'>('circle');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(45);
  const [gravity, setGravity] = useState<'down' | 'up' | 'left' | 'right' | 'none'>('down');
  const [tempMode, setTempMode] = useState<'room' | 'cold' | 'hot' | 'nuclear'>('room');
  const [wrapBorders, setWrapBorders] = useState<boolean>(false);
  
  // integrated miner state
  const [minerActive, setMinerActive] = useState<boolean>(true);
  const [minedTotal, setMinedTotal] = useState<number>(0);
  const [reactionRate, setReactionRate] = useState<number>(0);

  // Canvas and Grid Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<ElementCell[]>(Array(gridWidth * gridHeight).fill(null).map(() => ({ type: 'empty', isCustom: true, color: '#090d16', life: 0 })));
  const requestRef = useRef<number | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);

  // Helper to resolve specific element characteristics
  const getElementInfo = (id: string, isCustom: boolean) => {
    if (isCustom) {
      return CUSTOM_ELEMENTS.find(e => e.id === id);
    }
    return PERIODIC_ELEMENTS.find(e => e.symbol === id);
  };

  // Safe color resolver for empty cells
  const getCellColor = (cell: ElementCell) => {
    if (cell.type === 'empty') return '#090d16';
    return cell.color;
  };

  // Re-seed grid with walls & custom patterns
  const clearGrid = () => {
    gridRef.current = Array(gridWidth * gridHeight).fill(null).map(() => ({
      type: 'empty',
      isCustom: true,
      color: '#090d16',
      life: 0
    }));
    playTickSound(soundEnabled);
  };

  const seedReactorLayout = () => {
    clearGrid();
    const grid = gridRef.current;
    
    // Create protective Glass & Tungsten container
    for (let x = 15; x < gridWidth - 15; x++) {
      // Bottom thick floor
      grid[(gridHeight - 8) * gridWidth + x] = { type: 'glass', isCustom: true, color: '#94a3b8', life: 100 };
      grid[(gridHeight - 7) * gridWidth + x] = { type: 'W', isCustom: false, color: '#475569', life: 100 };
      
      // Top ceiling
      grid[8 * gridWidth + x] = { type: 'glass', isCustom: true, color: '#94a3b8', life: 100 };
    }

    // Left and Right reactor core walls
    for (let y = 8; y < gridHeight - 7; y++) {
      grid[y * gridWidth + 15] = { type: 'glass', isCustom: true, color: '#94a3b8', life: 100 };
      grid[y * gridWidth + gridWidth - 16] = { type: 'glass', isCustom: true, color: '#94a3b8', life: 100 };
    }

    // Insert nuclear fuel rods (Uranium cells inside the reaction matrix)
    for (let x = 25; x < gridWidth - 25; x += 10) {
      for (let y = 15; y < gridHeight - 15; y += 2) {
        // Vertical fuel assemblies
        const idx = y * gridWidth + x;
        grid[idx] = { type: 'U', isCustom: false, color: '#a3e635', life: 250 };
        grid[idx + 1] = { type: 'U', isCustom: false, color: '#a3e635', life: 250 };
      }
    }

    // Inject Spark electric triggers to begin fuel combustion
    grid[12 * gridWidth + 20] = { type: 'spark', isCustom: true, color: '#22d3ee', life: 10 };
    grid[12 * gridWidth + 50] = { type: 'spark', isCustom: true, color: '#22d3ee', life: 10 };

    playJackpotSound(soundEnabled);
  };

  const seedChemistryDemo = () => {
    clearGrid();
    const grid = gridRef.current;

    // Fill bottom with deep pool of Acid and Water side-by-side
    for (let y = gridHeight - 15; y < gridHeight - 1; y++) {
      for (let x = 5; x < gridWidth / 2 - 2; x++) {
        grid[y * gridWidth + x] = { type: 'water', isCustom: true, color: '#38bdf8', life: 100 };
      }
      for (let x = gridWidth / 2 + 2; x < gridWidth - 5; x++) {
        grid[y * gridWidth + x] = { type: 'acid', isCustom: true, color: '#84cc16', life: 100 };
      }
    }

    // Suspend highly reactive alkali metal slabs (Na & K) directly above water pool
    for (let x = 12; x < gridWidth / 2 - 10; x++) {
      for (let y = gridHeight - 32; y < gridHeight - 26; y++) {
        grid[y * gridWidth + x] = { type: 'Na', isCustom: false, color: '#f87171', life: 200 };
      }
    }

    // Suspend combustible Phosphorus (P) and sulfur slabs above Acid pool
    for (let x = gridWidth / 2 + 10; x < gridWidth - 12; x++) {
      for (let y = gridHeight - 32; y < gridHeight - 26; y++) {
        grid[y * gridWidth + x] = { type: 'P', isCustom: false, color: '#fb923c', life: 200 };
      }
    }

    // Add wooden support scaffold beams
    for (let x = 2; x < gridWidth - 2; x++) {
      grid[(gridHeight - 22) * gridWidth + x] = { type: 'wood', isCustom: true, color: '#78350f', life: 100 };
    }

    playBallPop(soundEnabled);
  };

  // Drawing mouse/touch brush mechanics
  const drawBrush = (targetX: number, targetY: number) => {
    const grid = gridRef.current;
    const r = brushSize;
    const info = getElementInfo(selectedElement.id, selectedElement.isCustom);
    const color = info ? info.color : '#090d16';

    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = targetX + dx;
        const y = targetY + dy;

        if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
          // Brush shapes filtering
          if (brushShape === 'circle' && dx * dx + dy * dy > r * r) continue;
          if (brushShape === 'spray' && Math.random() > 0.3) continue;

          const idx = y * gridWidth + x;
          
          if (selectedElement.id === 'eraser') {
            grid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
          } else {
            // Only paint over empty cells, or everything if painting with wall/eraser
            if (grid[idx].type === 'empty' || selectedElement.id === 'wall' || info?.state === 'energy') {
              grid[idx] = {
                type: selectedElement.id,
                isCustom: selectedElement.isCustom,
                color,
                life: selectedElement.id === 'fire' ? 12 + Math.floor(Math.random() * 20) : 120,
                charge: selectedElement.id === 'spark' ? 5 : 0,
                temp: tempMode === 'hot' ? 300 : tempMode === 'nuclear' ? 5000 : tempMode === 'cold' ? -150 : 25
              };
            }
          }
        }
      }
    }
  };

  // Handle pointer inputs on Canvas
  const handleCanvasPointer = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = gridWidth / rect.width;
    const scaleY = gridHeight / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      drawBrush(x, y);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    handleCanvasPointer(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    handleCanvasPointer(e);
  };

  const handleMouseUpOrLeave = () => {
    isDrawingRef.current = false;
  };

  // Main Cellular Automata Engine Update Loop
  const updatePhysics = () => {
    const grid = gridRef.current;
    const nextGrid = [...grid];
    const updated = new Uint8Array(gridWidth * gridHeight);
    
    // Environmental baseline variables
    const ambientTemp = tempMode === 'hot' ? 120 : tempMode === 'nuclear' ? 1500 : tempMode === 'cold' ? -80 : 22;
    let localReactionsCount = 0;

    // Shuffle X indices to eliminate falling particle grid bias
    const xIndices = Array.from({ length: gridWidth }, (_, i) => i);
    for (let i = xIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [xIndices[i], xIndices[j]] = [xIndices[j], xIndices[i]];
    }

    // Set gravity direction indices
    const gx = gravity === 'left' ? -1 : gravity === 'right' ? 1 : 0;
    const gy = gravity === 'up' ? -1 : gravity === 'down' ? 1 : 0;

    // Loop from bottom up or top down depending on gravity direction
    const yStart = gy <= 0 ? 0 : gridHeight - 1;
    const yEnd = gy <= 0 ? gridHeight : -1;
    const yStep = gy <= 0 ? 1 : -1;

    for (let y = yStart; y !== yEnd; y += yStep) {
      for (const x of xIndices) {
        const idx = y * gridWidth + x;
        if (updated[idx]) continue;

        const cell = grid[idx];
        if (cell.type === 'empty') continue;

        const info = getElementInfo(cell.type, cell.isCustom);
        if (!info) continue;

        // Custom VOID logic: swallows all neighbors
        if (cell.type === 'void') {
          const neighbors = [
            idx - 1, idx + 1, idx - gridWidth, idx + gridWidth,
            idx - gridWidth - 1, idx - gridWidth + 1, idx + gridWidth - 1, idx + gridWidth + 1
          ];
          neighbors.forEach(nIdx => {
            if (nIdx >= 0 && nIdx < gridWidth * gridHeight) {
              if (grid[nIdx].type !== 'void' && grid[nIdx].type !== 'wall') {
                nextGrid[nIdx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                localReactionsCount++;
              }
            }
          });
          continue;
        }

        // Dissipate energy and radioactive cells over time
        if (info.state === 'energy' || cell.type === 'smoke' || cell.type === 'steam') {
          cell.life--;
          if (cell.life <= 0) {
            nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
            continue;
          }
        }

        // --- EXTREME ELEMENT CHEMICAL & NUCLEAR REACTIONS MATRIX ---
        
        // 1. NEUTRON / NUCLEAR RADIATION DECAY (Radioactive Actinides)
        if (cell.type === 'U' || cell.type === 'Pu' || cell.type === 'Ra' || cell.type === 'Rn') {
          const isActinide = cell.type === 'U' || cell.type === 'Pu';
          const decayChance = isActinide ? 0.0003 : 0.005; // natural decay rate

          // Radioactivity triggers periodic sparks / fast neutron release
          if (Math.random() < decayChance) {
            // Spawn an electrical radioactive spark
            const target = idx + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.5 ? 1 : gridWidth);
            if (target >= 0 && target < gridWidth * gridHeight && grid[target].type === 'empty') {
              nextGrid[target] = { type: 'spark', isCustom: true, color: '#22d3ee', life: 8 };
              localReactionsCount += 5;
            }
          }
        }

        // 2. FISSION CHAIN REACTION (Active neutron split)
        if (cell.type === 'spark' || cell.type === 'plasma') {
          // Check for neighboring Uranium / Plutonium fuel nodes
          const checkOffsets = [-1, 1, -gridWidth, gridWidth];
          checkOffsets.forEach(offset => {
            const targetIdx = idx + offset;
            if (targetIdx >= 0 && targetIdx < gridWidth * gridHeight) {
              const targetCell = grid[targetIdx];
              if (targetCell.type === 'U' || targetCell.type === 'Pu') {
                // Detonate radioactive core: fission blast!
                nextGrid[targetIdx] = { type: 'plasma', isCustom: true, color: '#c084fc', life: 10 + Math.floor(Math.random() * 15) };
                
                // Blast adjacent structures, converting them to hyperheated plasma & spark radiation
                const blastRadius = [-1, 1, -gridWidth, gridWidth, -gridWidth-1, -gridWidth+1, gridWidth-1, gridWidth+1];
                blastRadius.forEach(b => {
                  const bIdx = targetIdx + b;
                  if (bIdx >= 0 && bIdx < gridWidth * gridHeight && grid[bIdx].type !== 'glass') {
                    if (Math.random() < 0.7) {
                      nextGrid[bIdx] = { 
                        type: Math.random() > 0.4 ? 'spark' : 'plasma', 
                        isCustom: true, 
                        color: Math.random() > 0.4 ? '#22d3ee' : '#a855f7', 
                        life: 8 
                      };
                    }
                  }
                });

                localReactionsCount += 40;
                if (soundEnabled && Math.random() < 0.1) playBallPop(true);
              }
            }
          });
        }

        // 3. ALKALI METALS WATER/ACID EXPLOSIONS (Na, K, Li)
        if (cell.type === 'Na' || cell.type === 'K' || cell.type === 'Li') {
          const neighborIndices = [idx - 1, idx + 1, idx - gridWidth, idx + gridWidth];
          let touchingWater = false;
          neighborIndices.forEach(nIdx => {
            if (nIdx >= 0 && nIdx < gridWidth * gridHeight) {
              const type = grid[nIdx].type;
              if (type === 'water' || type === 'acid' || type === 'H') {
                touchingWater = true;
              }
            }
          });

          if (touchingWater) {
            // alkali detonation!
            nextGrid[idx] = { type: 'fire', isCustom: true, color: '#f97316', life: 30 };
            
            // Circular fire/plasma explosive payload
            const offsets = [
              -1, 1, -gridWidth, gridWidth, 
              -gridWidth-1, -gridWidth+1, gridWidth-1, gridWidth+1,
              -2, 2, -gridWidth*2, gridWidth*2
            ];
            
            offsets.forEach(offset => {
              const targetIdx = idx + offset;
              if (targetIdx >= 0 && targetIdx < gridWidth * gridHeight) {
                if (grid[targetIdx].type !== 'glass' && grid[targetIdx].type !== 'wall') {
                  nextGrid[targetIdx] = {
                    type: Math.random() > 0.5 ? 'fire' : 'spark',
                    isCustom: true,
                    color: Math.random() > 0.5 ? '#f97316' : '#22d3ee',
                    life: 15 + Math.floor(Math.random() * 15)
                  };
                }
              }
            });

            localReactionsCount += 60;
            if (soundEnabled) playCoinSound(true);
          }
        }

        // 4. ACID DISSOLUTION & METAL CORROSION
        if (cell.type === 'acid') {
          const adjacent = [idx - 1, idx + 1, idx - gridWidth, idx + gridWidth];
          let dissolved = false;

          for (const aIdx of adjacent) {
            if (aIdx >= 0 && aIdx < gridWidth * gridHeight) {
              const target = grid[aIdx];
              // Acid eats Wood, Iron, Rust, Plants, and most basic elements
              if (target.type !== 'empty' && target.type !== 'acid' && target.type !== 'glass' && target.type !== 'obsidian' && target.type !== 'wall' && target.type !== 'Au' && target.type !== 'Pt' && target.type !== 'W') {
                nextGrid[aIdx] = { type: 'smoke', isCustom: true, color: '#84cc16', life: 10 + Math.floor(Math.random() * 10) };
                dissolved = true;
              }
            }
          }

          if (dissolved) {
            nextGrid[idx] = { type: 'smoke', isCustom: true, color: '#64748b', life: 15 };
            localReactionsCount += 12;
            continue;
          }
        }

        // 5. THERMONUCLEAR LAVA COALESCENCE
        if (cell.type === 'lava') {
          const adjacent = [idx - 1, idx + 1, idx - gridWidth, idx + gridWidth];
          let cooled = false;

          for (const aIdx of adjacent) {
            if (aIdx >= 0 && aIdx < gridWidth * gridHeight) {
              const target = grid[aIdx];
              // Lava meets water or ice -> Turns to solid Stone/Obsidian, boils water to Steam!
              if (target.type === 'water' || target.type === 'liquid_nitrogen') {
                nextGrid[aIdx] = { type: 'steam', isCustom: true, color: '#e2e8f0', life: 25 };
                cooled = true;
              } else if (target.type !== 'empty' && target.type !== 'lava' && target.type !== 'obsidian' && target.type !== 'wall' && target.type !== 'glass' && target.type !== 'W') {
                // Lava burns surrounding combustible solids
                if (Math.random() < 0.15) {
                  nextGrid[aIdx] = { type: 'fire', isCustom: true, color: '#ef4444', life: 20 };
                  localReactionsCount += 8;
                }
              }
            }
          }

          if (cooled) {
            nextGrid[idx] = { type: 'obsidian', isCustom: true, color: '#0f172a', life: 100 };
            localReactionsCount += 25;
            continue;
          }
        }

        // 6. FIRE COMBUSTION SPREAD (Wood, plants, oil, gunpowder, C, P, S, methane)
        if (cell.type === 'fire') {
          const adjacent = [idx - 1, idx + 1, idx - gridWidth, idx + gridWidth];
          adjacent.forEach(aIdx => {
            if (aIdx >= 0 && aIdx < gridWidth * gridHeight) {
              const target = grid[aIdx];
              if (target.type === 'wood' || target.type === 'plant' || target.type === 'oil' || target.type === 'C' || target.type === 'S' || target.type === 'P') {
                nextGrid[aIdx] = { type: 'fire', isCustom: true, color: '#f97316', life: 25 + Math.floor(Math.random() * 25) };
                localReactionsCount += 15;
              } else if (target.type === 'gunpowder' || target.type === 'methane' || target.type === 'H') {
                // Explosive burst!
                nextGrid[aIdx] = { type: 'plasma', isCustom: true, color: '#f43f5e', life: 15 };
                localReactionsCount += 35;
                if (soundEnabled && Math.random() < 0.25) playBallPop(true);
              } else if (target.type === 'water') {
                // Extinguish
                nextGrid[idx] = { type: 'steam', isCustom: true, color: '#e2e8f0', life: 15 };
                localReactionsCount += 10;
              }
            }
          });
        }

        // --- CELL PHYSICS KINEMATICS & MOVEMENTS ---
        
        // Solid wall or glass elements have 0 movement vector
        if (info.state === 'immovable' || cell.type === 'wood' || cell.type === 'plant' || cell.type === 'glass' || cell.type === 'obsidian' || cell.type === 'wall') {
          continue;
        }

        // Basic physics displacement targets
        const tx = x + gx;
        const ty = y + gy;

        // Wrap or clamp coordinate indices
        let finalTx = tx;
        let finalTy = ty;
        let isOutOfBounds = false;

        if (tx < 0 || tx >= gridWidth || ty < 0 || ty >= gridHeight) {
          if (wrapBorders) {
            finalTx = (tx + gridWidth) % gridWidth;
            finalTy = (ty + gridHeight) % gridHeight;
          } else {
            isOutOfBounds = true;
          }
        }

        const targetIdx = finalTy * gridWidth + finalTx;

        // A. POWDERS / GRANULAR SLIDE (Sand, Soil, Salt, Gunpowder, Alkali metals, etc.)
        if (info.state === 'powder') {
          if (isOutOfBounds) continue;

          // 1. Try directly downwards (or in gravity vector)
          const targetCell = grid[targetIdx];
          
          if (targetCell.type === 'empty') {
            nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
            nextGrid[targetIdx] = cell;
            updated[targetIdx] = 1;
          } else if (targetCell.type === 'water' || targetCell.type === 'oil' || targetCell.type === 'acid') {
            // Displace lighter fluids upwards! Sinking effect
            nextGrid[idx] = targetCell;
            nextGrid[targetIdx] = cell;
            updated[targetIdx] = 1;
            updated[idx] = 1;
          } else {
            // 2. Try diagonal sliding
            const sideLeftX = (x - 1 + gridWidth) % gridWidth;
            const sideRightX = (x + 1) % gridWidth;
            
            const diagLeftIdx = ty * gridWidth + sideLeftX;
            const diagRightIdx = ty * gridWidth + sideRightX;

            const canLeft = sideLeftX >= 0 && sideLeftX < gridWidth && grid[diagLeftIdx]?.type === 'empty';
            const canRight = sideRightX >= 0 && sideRightX < gridWidth && grid[diagRightIdx]?.type === 'empty';

            if (canLeft && canRight) {
              const chooseLeft = Math.random() > 0.5;
              const destIdx = chooseLeft ? diagLeftIdx : diagRightIdx;
              nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
              nextGrid[destIdx] = cell;
              updated[destIdx] = 1;
            } else if (canLeft) {
              nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
              nextGrid[diagLeftIdx] = cell;
              updated[diagLeftIdx] = 1;
            } else if (canRight) {
              nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
              nextGrid[diagRightIdx] = cell;
              updated[diagRightIdx] = 1;
            }
          }
        }

        // B. LIQUIDS FLOW & HORIZONTAL LEVELING (Water, Lava, Acid, Mercury, Oil, Br)
        else if (info.state === 'liquid') {
          if (isOutOfBounds) continue;

          const targetCell = grid[targetIdx];
          const ownDensity = info.density || 3;

          // 1. Try directly downwards
          if (targetCell.type === 'empty') {
            nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
            nextGrid[targetIdx] = cell;
            updated[targetIdx] = 1;
          } else if (targetCell.isCustom === false || getElementInfo(targetCell.type, targetCell.isCustom)?.state === 'liquid') {
            // Liquid layering based on relative densities
            const targetInfo = getElementInfo(targetCell.type, targetCell.isCustom);
            const targetDensity = targetInfo?.density || 3;
            
            if (ownDensity > targetDensity) {
              nextGrid[idx] = targetCell;
              nextGrid[targetIdx] = cell;
              updated[targetIdx] = 1;
              updated[idx] = 1;
            } else {
              // Try diagonal spreading
              const sideLeftX = (x - 1 + gridWidth) % gridWidth;
              const sideRightX = (x + 1) % gridWidth;
              
              const diagLeftIdx = ty * gridWidth + sideLeftX;
              const diagRightIdx = ty * gridWidth + sideRightX;

              const canLeft = grid[diagLeftIdx]?.type === 'empty';
              const canRight = grid[diagRightIdx]?.type === 'empty';

              if (canLeft && canRight) {
                const destIdx = Math.random() > 0.5 ? diagLeftIdx : diagRightIdx;
                nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                nextGrid[destIdx] = cell;
                updated[destIdx] = 1;
              } else if (canLeft) {
                nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                nextGrid[diagLeftIdx] = cell;
                updated[diagLeftIdx] = 1;
              } else if (canRight) {
                nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                nextGrid[diagRightIdx] = cell;
                updated[diagRightIdx] = 1;
              } else {
                // 3. Try spreading horizontally sideways
                const horizLeftIdx = y * gridWidth + sideLeftX;
                const horizRightIdx = y * gridWidth + sideRightX;

                const canSideLeft = grid[horizLeftIdx]?.type === 'empty';
                const canSideRight = grid[horizRightIdx]?.type === 'empty';

                if (canSideLeft && canSideRight) {
                  const destIdx = Math.random() > 0.5 ? horizLeftIdx : horizRightIdx;
                  nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                  nextGrid[destIdx] = cell;
                  updated[destIdx] = 1;
                } else if (canSideLeft) {
                  nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                  nextGrid[horizLeftIdx] = cell;
                  updated[horizLeftIdx] = 1;
                } else if (canSideRight) {
                  nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                  nextGrid[horizRightIdx] = cell;
                  updated[horizRightIdx] = 1;
                }
              }
            }
          }
        }

        // C. GASES FLOATING & DISSIPATION (Smoke, Steam, Methane, Noble gases, H, Cl)
        else if (info.state === 'gas') {
          // Gases rise (opposite of gravity)
          const uy = y - gy;
          let finalUy = uy;
          let gasOOB = false;

          if (uy < 0 || uy >= gridHeight) {
            if (wrapBorders) {
              finalUy = (uy + gridHeight) % gridHeight;
            } else {
              gasOOB = true;
            }
          }

          if (gasOOB) {
            // Dissipate gas on out of bounds
            nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
            continue;
          }

          const riseIdx = finalUy * gridWidth + x;
          const riseCell = grid[riseIdx];

          // 1. Try directly rising
          if (riseCell?.type === 'empty') {
            nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
            nextGrid[riseIdx] = cell;
            updated[riseIdx] = 1;
          } else {
            // 2. Try random diagonal drift upwards
            const driftX = x + (Math.random() > 0.5 ? 1 : -1);
            if (driftX >= 0 && driftX < gridWidth) {
              const diagRiseIdx = finalUy * gridWidth + driftX;
              if (grid[diagRiseIdx]?.type === 'empty') {
                nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                nextGrid[diagRiseIdx] = cell;
                updated[diagRiseIdx] = 1;
              } else {
                // 3. Try random horizontal drift
                const sideIdx = y * gridWidth + driftX;
                if (grid[sideIdx]?.type === 'empty') {
                  nextGrid[idx] = { type: 'empty', isCustom: true, color: '#090d16', life: 0 };
                  nextGrid[sideIdx] = cell;
                  updated[sideIdx] = 1;
                }
              }
            }
          }
        }

        // D. LIGHTNING & ELECTRICITY CONDUCTANCE SPREAD
        else if (cell.type === 'spark') {
          const checkConductOffsets = [-1, 1, -gridWidth, gridWidth];
          checkConductOffsets.forEach(offset => {
            const cIdx = idx + offset;
            if (cIdx >= 0 && cIdx < gridWidth * gridHeight) {
              const neighbor = grid[cIdx];
              const neighborInfo = getElementInfo(neighbor.type, neighbor.isCustom);
              
              // Spark travels to copper, gold, iron, platinum, water
              if (neighbor.type === 'Cu' || neighbor.type === 'Au' || neighbor.type === 'Fe' || neighbor.type === 'Pt' || neighbor.type === 'water') {
                if (Math.random() < 0.65 && nextGrid[cIdx].type !== 'spark') {
                  nextGrid[cIdx] = { type: 'spark', isCustom: true, color: '#22d3ee', life: 6 };
                  localReactionsCount += 15;
                }
              }
            }
          });
        }
      }
    }

    // Apply computed grid state
    gridRef.current = nextGrid;

    // Trigger Crypto-Mining cash rewards
    if (minerActive && localReactionsCount > 0) {
      const minted = Math.floor(localReactionsCount * 0.18 * (tempMode === 'nuclear' ? 4.5 : 1));
      if (minted > 0) {
        onUpdateBalance(cheatBalance + minted);
        setMinedTotal(prev => prev + minted);
        setReactionRate(localReactionsCount);
      }
    } else {
      setReactionRate(0);
    }
  };

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTick = 0;

    const render = (time: number) => {
      const interval = 1000 / fps;
      const delta = time - lastTick;

      if (delta >= interval) {
        if (!isPaused) {
          updatePhysics();
        }

        // Draw current grid onto canvas
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const grid = gridRef.current;
        for (let y = 0; y < gridHeight; y++) {
          for (let x = 0; x < gridWidth; x++) {
            const idx = y * gridWidth + x;
            const cell = grid[idx];
            if (cell.type !== 'empty') {
              ctx.fillStyle = getCellColor(cell);
              ctx.fillRect(x * scale, y * scale, scale - 0.5, scale - 0.5);

              // Add nuclear glow effect for active fusion / sparks
              if (cell.type === 'spark' || cell.type === 'plasma') {
                ctx.fillStyle = 'rgba(34, 211, 238, 0.45)';
                ctx.fillRect((x - 1) * scale, (y - 1) * scale, scale * 3, scale * 3);
              }
            }
          }
        }

        lastTick = time;
      }

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPaused, fps, gravity, tempMode, wrapBorders, minerActive, cheatBalance]);

  return (
    <div className="bg-slate-900 border border-slate-750 p-6 rounded-3xl shadow-2xl space-y-6 text-slate-100 font-sans relative overflow-hidden">
      
      {/* Background grid visual overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_0.2px,transparent_0.2px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-850 pb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono tracking-widest font-black uppercase text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 rounded-full">
              Quantum Sandboxels V3
            </span>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-purple-950/50 border border-purple-900/40 text-purple-400 rounded-md font-bold">
              Sub-Atomic Reactor Simulator
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-100 mt-1 flex items-center gap-2">
            ⚛️ THERMONUCLEAR SANDBOX & PERIODIC REACTOR
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Simulate granular physics, flowing chemical compounds, and reactive elements. Click elements on the real 118-element periodic table to paint, combine substances, and chain reaction mine funds.
          </p>
        </div>

        {/* Crypto mining rig integration */}
        <div className="bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-2xl flex items-center gap-3.5 shrink-0 shadow-lg">
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800 flex items-center justify-center animate-pulse text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div className="font-mono text-left">
            <span className="text-[9.5px] text-slate-500 block leading-none">REACTION QUANTUM COIN-MINER</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-black text-amber-400">${cheatBalance.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 font-bold">+{reactionRate} reactions/s</span>
            </div>
            <span className="text-[8.5px] text-slate-400 block leading-none mt-0.5">Mined this session: <strong className="text-amber-500">${minedTotal}</strong></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT COLUMN: SIMULATOR CANVAS & TOOLBAR */}
        <div className="xl:col-span-7 space-y-4">
          
          {/* Main sandbox viewport */}
          <div className="relative rounded-2xl border-2 border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center p-1">
            <canvas
              ref={canvasRef}
              width={gridWidth * scale}
              height={gridHeight * scale}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="w-full h-auto block cursor-crosshair rounded-xl"
            />

            {/* Environmental ambient overlay state */}
            <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded font-mono text-[9px] text-slate-400 flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              SIMULATOR: {isPaused ? "PAUSED" : "ACTIVE"} | {gridWidth}x{gridHeight} CORE MATRIX
            </div>

            <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-850 px-2 py-1 rounded font-mono text-[9px] text-slate-400 flex items-center gap-1.5 backdrop-blur-sm">
              <Scale className="w-3 h-3 text-cyan-400" />
              GRAVITY: {gravity.toUpperCase()}
            </div>
          </div>

          {/* Quick core control buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setIsPaused(!isPaused); playTickSound(soundEnabled); }}
              className={`px-4 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                isPaused 
                  ? 'bg-emerald-950 border-emerald-800 text-emerald-400 hover:bg-emerald-900' 
                  : 'bg-slate-950 border-slate-850 text-slate-300 hover:bg-slate-900'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              {isPaused ? 'RESUME SIMULATION' : 'PAUSE TICK'}
            </button>

            <button
              onClick={() => { updatePhysics(); playTickSound(soundEnabled); }}
              disabled={!isPaused}
              className="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-mono font-bold text-slate-400 hover:text-slate-200 rounded-xl transition disabled:opacity-40"
              title="Manually advance single physics step"
            >
              STEP TICK ➔
            </button>

            <button
              onClick={seedReactorLayout}
              className="px-3.5 py-2 bg-purple-950/40 border border-purple-900 text-purple-300 hover:bg-purple-900 text-xs font-mono font-bold rounded-xl transition"
            >
              ⚛️ SEED NUCLEAR CORE
            </button>

            <button
              onClick={seedChemistryDemo}
              className="px-3.5 py-2 bg-blue-950/40 border border-blue-900 text-blue-300 hover:bg-blue-900 text-xs font-mono font-bold rounded-xl transition"
            >
              🧪 SEED REACTION POOL
            </button>

            <button
              onClick={clearGrid}
              className="px-3.5 py-2 bg-rose-950/50 border border-rose-900/60 text-rose-300 hover:bg-rose-900 hover:text-rose-200 text-xs font-mono font-bold rounded-xl transition ml-auto flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              CLEAR GRID
            </button>
          </div>

          {/* BRUSH & ENGINE CONFIGURATION PANELS */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Paintbrush tools settings */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10.5px] font-bold text-cyan-400 uppercase tracking-wide flex items-center gap-1">
                🖌️ PAINTBRUSH NOZZLE PROFILES
              </span>

              {/* Brush size slider */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">BRUSH RADIAL DIAMETER:</span>
                  <span className="text-cyan-400 font-bold">{brushSize}px radius</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer h-1 bg-slate-900 rounded appearance-none"
                />
              </div>

              {/* Brush shapes selectors */}
              <div className="space-y-1 pt-1">
                <span className="text-slate-400 text-[10px] block uppercase">BRUSH SPATIAL EMISSION PROFILE:</span>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {[
                    { id: 'circle', name: 'Solid Circle' },
                    { id: 'square', name: 'Solid Square' },
                    { id: 'spray', name: 'Circular Spray' },
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => { setBrushShape(shape.id as any); playTickSound(soundEnabled); }}
                      className={`py-1.5 rounded-lg border text-center transition font-bold ${
                        brushShape === shape.id
                          ? 'bg-cyan-950/60 border-cyan-600 text-cyan-300'
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {shape.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Environmental physics overrides */}
            <div className="space-y-3 font-mono text-xs">
              <span className="text-[10.5px] font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1">
                🎛️ ENVIRONMENTAL ATMOSPHERIC CONSTANTS
              </span>

              {/* Gravity vector selector */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] block">GRAVITATIONAL ACCELERATION VECTOR:</span>
                <div className="grid grid-cols-5 gap-1 text-[9.5px]">
                  {[
                    { id: 'down', name: '⬇️ Down' },
                    { id: 'up', name: '⬆️ Up' },
                    { id: 'left', name: '⬅️ Left' },
                    { id: 'right', name: '➡️ Right' },
                    { id: 'none', name: '🕳️ Zero-G' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => { setGravity(g.id as any); playTickSound(soundEnabled); }}
                      className={`py-1.5 rounded-lg border text-center transition font-bold truncate ${
                        gravity === g.id
                          ? 'bg-purple-950/60 border-purple-600 text-purple-300'
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature core states */}
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px] block">AMBIENT KINETIC TEMPERATURE:</span>
                <div className="grid grid-cols-4 gap-1 text-[9.5px]">
                  {[
                    { id: 'cold', name: '❄️ Sub-Zero' },
                    { id: 'room', name: '🌡️ 22°C Room' },
                    { id: 'hot', name: '🔥 120°C Hot' },
                    { id: 'nuclear', name: '☢️ Thermonuclear' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTempMode(t.id as any); playTickSound(soundEnabled); }}
                      className={`py-1.5 rounded-lg border text-center transition font-bold ${
                        tempMode === t.id
                          ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                          : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.name.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Wrap margins toggle and mining toggle */}
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850 font-mono text-xs">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wrapBorders}
                onChange={(e) => { setWrapBorders(e.target.checked); playTickSound(soundEnabled); }}
                className="rounded accent-cyan-500 w-3.5 h-3.5"
              />
              WARP GRID BORDERS (wrap-around pixels wrap)
            </label>

            <label className="flex items-center gap-2 text-amber-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={minerActive}
                onChange={(e) => { setMinerActive(e.target.checked); playTickSound(soundEnabled); }}
                className="rounded accent-amber-500 w-3.5 h-3.5"
              />
              ACTIVE REACTION CRYPTO-MINING (earns money)
            </label>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE ELEMENTS DRAWER & PERIODIC TABLE */}
        <div className="xl:col-span-5 space-y-4">
          
          {/* Categories Tab selector */}
          <div className="bg-slate-950 p-2 rounded-2xl border border-slate-850 flex flex-wrap gap-1 font-mono text-xs">
            {[
              { id: 'essentials', name: '🌟 Essentials' },
              { id: 'solids', name: '🧱 Solids' },
              { id: 'liquids', name: '💧 Liquids' },
              { id: 'gases', name: '☁️ Gases' },
              { id: 'energy', name: '⚡ Energy' },
              { id: 'periodic', name: '⚛️ Periodic Table (All 118)' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id as any); playTickSound(soundEnabled); }}
                className={`flex-1 min-w-[90px] py-1.5 rounded-xl border text-center transition font-bold text-[10.5px] ${
                  activeCategory === cat.id
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
                    : 'bg-slate-900 border-slate-900 text-slate-400 hover:text-slate-300 hover:bg-slate-850'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* ACTIVE DRAWER: PERIODIC TABLE VISUAL MATRIX */}
          {activeCategory === 'periodic' ? (
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="font-mono font-bold text-cyan-400 text-[10.5px] tracking-wide block">⚛️ INTERACTIVE PERIODIC TABLE PAINT CANVAS</span>
                <span className="font-mono text-[9px] text-slate-500 uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">All 118 Elements Loaded</span>
              </div>

              {/* Comprehensive elements grid, sorted atomic number order */}
              <div className="grid grid-cols-10 gap-1 overflow-y-auto max-h-[380px] pr-1 scrollbar-thin">
                {PERIODIC_ELEMENTS.map((el) => {
                  const active = selectedElement.id === el.symbol && !selectedElement.isCustom;
                  return (
                    <button
                      key={`periodic-btn-${el.symbol}`}
                      onClick={() => {
                        setSelectedElement({ id: el.symbol, isCustom: false });
                        playTickSound(soundEnabled);
                      }}
                      className={`p-1.5 rounded border transition flex flex-col justify-between h-14 ${
                        active
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 scale-105 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                          : 'bg-slate-900 border-slate-850 text-slate-350 hover:border-slate-700 hover:bg-slate-850'
                      }`}
                      style={{ borderLeft: `3px solid ${el.color}` }}
                      title={`${el.name} (Atomic ${el.num}) - ${el.desc}`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-[8px] text-slate-500">{el.num}</span>
                        <span className="font-mono text-[7px] text-slate-400 uppercase font-black">{el.state[0]}</span>
                      </div>
                      <span className="font-mono text-sm font-black leading-none block text-left mt-0.5" style={{ color: el.color }}>{el.symbol}</span>
                      <span className="text-[7.5px] truncate font-sans text-slate-400 leading-none text-left w-full mt-0.5">{el.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Group colors guide key */}
              <div className="border-t border-slate-900 pt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#f87171] rounded-sm" /> Alkali</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#fbbf24] rounded-sm" /> Alkali Earth</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#38bdf8] rounded-sm" /> Transition</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#94a3b8] rounded-sm" /> Post-Trans</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#34d399] rounded-sm" /> Metalloids</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#fb923c] rounded-sm" /> Nonmetals</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#2dd4bf] rounded-sm" /> Halogens</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#f472b6] rounded-sm" /> Noble Gases</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#c084fc] rounded-sm" /> Lanthanide</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#a3e635] rounded-sm" /> Actinide</span>
              </div>
            </div>
          ) : (
            /* ACTIVE DRAWER: CUSTOM ACCENTS CATEGORIES */
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-4 min-h-[400px]">
              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                <span className="font-mono font-bold text-cyan-400 text-[10.5px] uppercase tracking-wide">📦 SELECT COMPOSITION SUBSTANCES</span>
                <span className="font-mono text-[9.5px] text-slate-500 uppercase">CATEGORY DRAWER</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {CUSTOM_ELEMENTS.filter(e => e.category === activeCategory).map((el) => {
                  const active = selectedElement.id === el.id && selectedElement.isCustom;
                  return (
                    <button
                      key={`custom-btn-${el.id}`}
                      onClick={() => {
                        setSelectedElement({ id: el.id, isCustom: true });
                        playTickSound(soundEnabled);
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1 ${
                        active
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 scale-102 shadow-lg'
                          : 'bg-slate-900 border-slate-850 text-slate-350 hover:border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-mono text-[10.5px] font-black" style={{ color: el.color }}>{el.name}</span>
                        <span className="font-mono text-[8px] bg-slate-950 border border-slate-850 text-slate-500 px-1 py-0.2 rounded font-bold uppercase">{el.state}</span>
                      </div>
                      <p className="text-[10px] text-slate-450 leading-snug font-sans">{el.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE ELEMENT DETAILS VIEWPORT */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10 font-mono text-7xl font-black select-none uppercase pointer-events-none">
              {selectedElement.isCustom ? "CUSTOM" : "ATOM"}
            </div>

            {(() => {
              const info = getElementInfo(selectedElement.id, selectedElement.isCustom);
              if (!info) return null;
              
              const isAtomic = !selectedElement.isCustom;
              const sym = isAtomic ? (info as PeriodicElement).symbol : '';
              const atomicNum = isAtomic ? (info as PeriodicElement).num : '';
              
              return (
                <div className="font-mono text-left relative z-10 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
                    <h3 className="text-sm font-black text-slate-100 uppercase">
                      {info.name} {isAtomic && `(${sym})`}
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[9px] text-slate-400 font-bold uppercase rounded-md">
                      {isAtomic ? `ATOMIC NO: ${atomicNum}` : 'CORE SUBSTANCE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {info.desc}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[9.5px] text-slate-500 border-t border-slate-900 pt-2">
                    <div>
                      STATE OF MATTER: <strong className="text-slate-350">{info.state.toUpperCase()}</strong>
                    </div>
                    <div>
                      COMBUSTIBLE FUEL: <strong className="text-slate-350">
                        {['wood', 'plant', 'oil', 'gunpowder', 'C', 'S', 'P', 'H', 'methane'].includes(selectedElement.id) ? 'HIGH' : 'NONE'}
                      </strong>
                    </div>
                    <div>
                      ACID SOLUBLE: <strong className="text-slate-350">
                        {['glass', 'obsidian', 'wall', 'Au', 'Pt', 'W', 'acid'].includes(selectedElement.id) ? 'IMMUNE' : 'YES'}
                      </strong>
                    </div>
                    <div>
                      DENSITY MULTIPLIER: <strong className="text-slate-350">
                        {(info as any).density ? `${(info as any).density}g/cm³` : 'N/A (Solid/Gas)'}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>

      </div>

    </div>
  );
};
