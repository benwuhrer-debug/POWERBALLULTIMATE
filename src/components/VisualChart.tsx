/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';

interface VisualChartProps {
  history: number[]; // numerical sequence showing net gain/loss
  mode: 'player' | 'house';
  soundEnabled: boolean;
}

export const VisualChart: React.FC<VisualChartProps> = ({ history, mode }) => {
  const isPlayer = mode === 'player';
  
  // Calculate bounds
  const stats = useMemo(() => {
    if (history.length === 0) {
      return { min: 0, max: 100, points: [] };
    }
    let min = Math.min(...history);
    let max = Math.max(...history);
    
    // Add small default ranges to avoid division by zero
    if (min === max) {
      min -= 100;
      max += 100;
    }
    
    // Pad margins so graph doesn't hug boundaries tightly
    const padding = (max - min) * 0.1 || 50;
    const finalMin = min - padding;
    const finalMax = max + padding;

    return { min: finalMin, max: finalMax };
  }, [history]);

  // Transform coordinates to 100% responsive SVG dimensions (width 500, height 200)
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 70;
  const paddingY = 20;

  const chartPoints = useMemo(() => {
    if (history.length === 0) return '';
    const pointsXMax = svgWidth - paddingX - 10;
    const pointsYMax = svgHeight - paddingY - 15;
    
    return history.map((val, idx) => {
      // Scale X evenly along history points
      const x = paddingX + (idx / Math.max(1, history.length - 1)) * pointsXMax;
      
      // Scale Y relative to min/max
      const range = stats.max - stats.min;
      const normalizedY = (val - stats.min) / (range || 1);
      const y = svgHeight - paddingY - (normalizedY * pointsYMax);
      
      return { x, y, value: val };
    });
  }, [history, stats, paddingX, paddingY]);

  // Construct SVG components
  const pathString = useMemo(() => {
    if (chartPoints.length === 0) return '';
    return chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }, [chartPoints]);

  const areaString = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const startX = chartPoints[0].x;
    const endX = chartPoints[chartPoints.length - 1].x;
    const baselineY = svgHeight - paddingY;
    return `${pathString} L ${endX.toFixed(1)} ${baselineY.toFixed(1)} L ${startX.toFixed(1)} ${baselineY.toFixed(1)} Z`;
  }, [chartPoints, pathString]);

  // Format currency labels on the Y axis
  const yLabels = useMemo(() => {
    const labelsCount = 4;
    const labels = [];
    const step = (stats.max - stats.min) / (labelsCount - 1);
    for (let i = 0; i < labelsCount; i++) {
      const val = stats.min + (step * i);
      let shortVal = '';
      if (Math.abs(val) >= 1e9) {
        shortVal = (val / 1e9).toFixed(1) + 'B';
      } else if (Math.abs(val) >= 1e6) {
        shortVal = (val / 1e6).toFixed(1) + 'M';
      } else if (Math.abs(val) >= 1e3) {
        shortVal = (val / 1e3).toFixed(1) + 'k';
      } else {
        shortVal = val.toFixed(0);
      }
      
      const range = stats.max - stats.min;
      const normalizedY = (val - stats.min) / (range || 1);
      const y = svgHeight - paddingY - (normalizedY * (svgHeight - paddingY - 35));
      labels.push({ text: (val > 0 ? '+' : '') + '$' + shortVal, y });
    }
    return labels;
  }, [stats]);

  const accentColor = isPlayer ? '#ef444455' : '#10b98155'; // Player is in debt red, House is in green!
  const strokeColor = isPlayer ? '#f87171' : '#34d399';
  const gradientId = `chart-area-grad-${mode}`;

  return (
    <div id="financial_analytics_card" className="bg-slate-900 rounded-xl p-4 border border-slate-700/60 shadow-xl overflow-hidden">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h4 id="chart_title" className="text-sm font-semibold text-slate-200 tracking-tight font-sans">
            {isPlayer ? 'Player Net Wealth Trajectory' : 'House Vault Net Treasury'}
          </h4>
          <p className="text-xs text-slate-400 font-mono">
            {isPlayer 
              ? 'Negative slope represents lottery cash exhaust rate.' 
              : 'Positive accumulation shows customer purchase revenue minus prize payouts.'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
          <span className={`w-2 h-2 rounded-full ${isPlayer ? 'bg-red-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`}></span>
          REALTIME
        </div>
      </div>

      <div className="relative w-full h-[220px]">
        {history.length < 2 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-sans gap-2 text-xs text-center px-4">
            <svg className="w-8 h-8 text-slate-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Waiting for more sweeps... Play more tickets to compile real-time line mapping!
          </div>
        ) : (
          <svg className="w-full h-full select-none" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {yLabels.map((lbl, i) => (
              <line
                key={`grid-${i}`}
                x1={paddingX}
                y1={lbl.y}
                x2={svgWidth - 10}
                y2={lbl.y}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            ))}

            {/* Y Axis Labels */}
            {yLabels.map((lbl, i) => (
              <text
                key={`label-${i}`}
                x={paddingX - 10}
                y={lbl.y + 3}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
              >
                {lbl.text}
              </text>
            ))}

            {/* X Axis Baseline Line */}
            <line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - 10}
              y2={svgHeight - paddingY}
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* Drawn Area Fill */}
            <path d={areaString} fill={`url(#${gradientId})`} />

            {/* Drawn Chart Path */}
            <path
              d={pathString}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Node markers (limit render if too many) */}
            {chartPoints.length < 50 && chartPoints.map((pt, i) => {
              const isPeakWin = i > 0 && pt.value > history[i - 1] + 1000;
              return (
                <circle
                  key={`node-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={isPeakWin ? 4.5 : 2}
                  fill={isPeakWin ? '#fbbf24' : strokeColor}
                  className={isPeakWin ? 'animate-ping' : ''}
                  stroke="#0f172a"
                  strokeWidth="1"
                >
                  <title>{`Step ${i}: $${pt.value.toLocaleString()}`}</title>
                </circle>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};
