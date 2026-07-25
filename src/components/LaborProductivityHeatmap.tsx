/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { playCoinSound, playJackpotSound } from '../utils/audio';

export interface SectorMetric {
  id: string;
  name: string;
  icon: string;
  baseYield: number; // in $ per second
  efficiency: number[]; // 6 shifts (0-100%)
  laborCount: number;
  status: 'optimal' | 'warning' | 'underperforming' | 'overclocked';
}

const INITIAL_SECTORS: SectorMetric[] = [
  {
    id: 'mines',
    name: 'Production Mines',
    icon: '🏭',
    baseYield: 100000000,
    efficiency: [88, 92, 95, 84, 78, 91],
    laborCount: 2500,
    status: 'optimal',
  },
  {
    id: 'shrine',
    name: 'Praise Cathedral',
    icon: '🏛️',
    baseYield: 85000000,
    efficiency: [94, 98, 99, 92, 95, 97],
    laborCount: 1800,
    status: 'overclocked',
  },
  {
    id: 'quarry',
    name: 'Antimatter Quarry',
    icon: '💎',
    baseYield: 500000000,
    efficiency: [42, 55, 61, 48, 38, 52],
    laborCount: 4500,
    status: 'underperforming',
  },
  {
    id: 'cyber',
    name: 'Cyber Assembly',
    icon: '🤖',
    baseYield: 350000000,
    efficiency: [81, 85, 89, 92, 90, 86],
    laborCount: 3200,
    status: 'optimal',
  },
  {
    id: 'farm',
    name: 'Agrarian Plantation',
    icon: '🌾',
    baseYield: 150000000,
    efficiency: [76, 82, 70, 65, 59, 74],
    laborCount: 6000,
    status: 'warning',
  },
  {
    id: 'sweatshop',
    name: 'Armor Sweatshop',
    icon: '🧵',
    baseYield: 200000000,
    efficiency: [62, 58, 64, 49, 45, 53],
    laborCount: 2100,
    status: 'underperforming',
  },
  {
    id: 'foundry',
    name: 'Metal Foundry',
    icon: '🔥',
    baseYield: 400000000,
    efficiency: [89, 93, 96, 91, 88, 94],
    laborCount: 1900,
    status: 'optimal',
  },
  {
    id: 'prison',
    name: 'Labor Prison Block',
    icon: '🔒',
    baseYield: 120000000,
    efficiency: [71, 74, 79, 82, 75, 78],
    laborCount: 8500,
    status: 'warning',
  },
  {
    id: 'orbital',
    name: 'Orbital Construction',
    icon: '🛰️',
    baseYield: 600000000,
    efficiency: [91, 95, 97, 98, 94, 96],
    laborCount: 1200,
    status: 'overclocked',
  },
  {
    id: 'vault',
    name: 'Sovereign Vaults',
    icon: '💰',
    baseYield: 800000000,
    efficiency: [85, 88, 90, 87, 83, 89],
    laborCount: 1500,
    status: 'optimal',
  },
];

const SHIFT_NAMES = ['Shift Alpha (00-04h)', 'Shift Beta (04-08h)', 'Shift Gamma (08-12h)', 'Shift Delta (12-16h)', 'Shift Epsilon (16-20h)', 'Shift Zeta (20-24h)'];

interface Props {
  soundEnabled?: boolean;
  onOverclockAll?: () => void;
}

export const LaborProductivityHeatmap: React.FC<Props> = ({ soundEnabled = true }) => {
  const [sectors, setSectors] = useState<SectorMetric[]>(INITIAL_SECTORS);
  const [metricMode, setMetricMode] = useState<'efficiency' | 'yield' | 'labor'>('efficiency');
  const [sortBy, setSortBy] = useState<'default' | 'efficiency' | 'yield'>('default');
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    sectorName: string;
    shiftName: string;
    val: number;
    status: string;
    labor: number;
    hourlyYield: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Live real-time fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSectors((prev) =>
        prev.map((s) => {
          const updatedEff = s.efficiency.map((val) => {
            const delta = (Math.random() - 0.48) * 4; // slight variance
            return Math.min(100, Math.max(20, Math.round(val + delta)));
          });
          const avg = updatedEff.reduce((a, b) => a + b, 0) / updatedEff.length;
          let newStatus: SectorMetric['status'] = 'optimal';
          if (avg > 92) newStatus = 'overclocked';
          else if (avg < 55) newStatus = 'underperforming';
          else if (avg < 75) newStatus = 'warning';

          return { ...s, efficiency: updatedEff, status: newStatus };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Sort sectors based on selected sorting
  const processedSectors = useMemo(() => {
    const clone = [...sectors];
    if (sortBy === 'efficiency') {
      clone.sort((a, b) => {
        const avgA = a.efficiency.reduce((x, y) => x + y, 0) / a.efficiency.length;
        const avgB = b.efficiency.reduce((x, y) => x + y, 0) / b.efficiency.length;
        return avgB - avgA;
      });
    } else if (sortBy === 'yield') {
      clone.sort((a, b) => b.baseYield - a.baseYield);
    }
    return clone;
  }, [sectors, sortBy]);

  // Overall Statistics
  const stats = useMemo(() => {
    let totalEff = 0;
    let totalLabor = 0;
    let totalHourlyRevenue = 0;
    let highestSector = processedSectors[0];
    let lowestSector = processedSectors[0];
    let highestAvg = 0;
    let lowestAvg = 100;

    processedSectors.forEach((s) => {
      const avg = s.efficiency.reduce((a, b) => a + b, 0) / s.efficiency.length;
      totalEff += avg;
      totalLabor += s.laborCount;
      const hourly = s.baseYield * (avg / 100) * 3600;
      totalHourlyRevenue += hourly;

      if (avg > highestAvg) {
        highestAvg = avg;
        highestSector = s;
      }
      if (avg < lowestAvg) {
        lowestAvg = avg;
        lowestSector = s;
      }
    });

    const fleetAvg = Math.round(totalEff / (processedSectors.length || 1));

    return {
      fleetAvg,
      totalLabor,
      totalHourlyRevenue,
      highestSectorName: highestSector ? `${highestSector.icon} ${highestSector.name}` : 'N/A',
      highestAvg: Math.round(highestAvg),
      lowestSectorName: lowestSector ? `${lowestSector.icon} ${lowestSector.name}` : 'N/A',
      lowestAvg: Math.round(lowestAvg),
    };
  }, [processedSectors]);

  // Overclock Whip Action
  const handleWhipBoostAll = useCallback(() => {
    setSectors((prev) =>
      prev.map((s) => ({
        ...s,
        efficiency: s.efficiency.map((val) => Math.min(100, val + 20)),
        status: 'overclocked',
      }))
    );
    if (soundEnabled) playJackpotSound(soundEnabled);
  }, [soundEnabled]);

  // Render D3 Heatmap
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 700;
    const margin = { top: 40, right: 30, bottom: 40, left: 180 };
    const height = processedSectors.length * 36 + margin.top + margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    svg.attr('width', width).attr('height', height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Shifts
    const xScale = d3
      .scaleBand()
      .range([0, innerWidth])
      .domain(SHIFT_NAMES)
      .padding(0.08);

    // Y Scale: Sectors
    const yScale = d3
      .scaleBand()
      .range([0, innerHeight])
      .domain(processedSectors.map((d) => d.name))
      .padding(0.1);

    // Color Interpolator: Red (<50%) -> Yellow (70%) -> Green/Cyan (>90%)
    const colorScale = d3
      .scaleSequential()
      .domain([30, 100])
      .interpolator(d3.interpolateRgbBasis(['#dc2626', '#f59e0b', '#10b981', '#06b6d4']));

    // X-Axis
    g.append('g')
      .attr('transform', `translate(0, -8)`)
      .call(d3.axisTop(xScale).tickSize(0))
      .select('.domain')
      .remove();

    g.selectAll('.tick text')
      .style('fill', '#94a3b8')
      .style('font-size', '10px')
      .style('font-family', 'monospace')
      .style('font-weight', 'bold');

    // Y-Axis
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .select('.domain')
      .remove();

    g.selectAll('g.tick')
      .each(function (_, i) {
        const sector = processedSectors[i];
        if (sector) {
          d3.select(this)
            .select('text')
            .text(`${sector.icon} ${sector.name}`)
            .style('fill', '#f8fafc')
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .style('font-family', 'sans-serif');
        }
      });

    // Draw Heatmap Cells
    processedSectors.forEach((sector) => {
      sector.efficiency.forEach((effVal, shiftIdx) => {
        const shiftName = SHIFT_NAMES[shiftIdx];
        const x = xScale(shiftName) || 0;
        const y = yScale(sector.name) || 0;
        const cellW = xScale.bandwidth();
        const cellH = yScale.bandwidth();

        // Metric display calculation
        let displayVal = `${effVal}%`;
        let fill = colorScale(effVal);

        if (metricMode === 'yield') {
          const hourlyYield = ((sector.baseYield * (effVal / 100) * 3600) / 1e9).toFixed(1);
          displayVal = `$${hourlyYield}B/h`;
        } else if (metricMode === 'labor') {
          displayVal = `${sector.laborCount} workers`;
        }

        const rect = g
          .append('rect')
          .attr('x', x)
          .attr('y', y)
          .attr('width', cellW)
          .attr('height', cellH)
          .attr('rx', 6)
          .attr('ry', 6)
          .attr('fill', fill)
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 2)
          .style('cursor', 'pointer')
          .style('opacity', 0.88)
          .style('transition', 'all 0.2s ease');

        // Hover animations & tooltip
        rect
          .on('mouseover', (event) => {
            rect.attr('stroke', '#f59e0b').attr('stroke-width', 3).style('opacity', 1);

            const [mouseX, mouseY] = d3.pointer(event, containerRef.current);
            const hourlyYieldFormatted = `$${((sector.baseYield * (effVal / 100) * 3600) / 1e9).toFixed(2)} Billion/hr`;

            setTooltip({
              visible: true,
              x: mouseX + 15,
              y: mouseY - 20,
              sectorName: `${sector.icon} ${sector.name}`,
              shiftName,
              val: effVal,
              status: sector.status.toUpperCase(),
              labor: sector.laborCount,
              hourlyYield: hourlyYieldFormatted,
            });
            if (soundEnabled) playCoinSound(soundEnabled);
          })
          .on('mouseout', () => {
            rect.attr('stroke', '#0f172a').attr('stroke-width', 2).style('opacity', 0.88);
            setTooltip(null);
          });

        // Cell Text Label
        g.append('text')
          .attr('x', x + cellW / 2)
          .attr('y', y + cellH / 2 + 3.5)
          .attr('text-anchor', 'middle')
          .style('fill', '#020617')
          .style('font-size', '10px')
          .style('font-family', 'monospace')
          .style('font-weight', '900')
          .style('pointer-events', 'none')
          .text(displayVal);
      });
    });
  }, [processedSectors, metricMode, soundEnabled]);

  return (
    <div className="bg-slate-900 border border-slate-700/60 p-5 rounded-2xl shadow-xl space-y-5 font-sans relative" ref={containerRef}>
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 uppercase tracking-wider">
              🔥 D3 LABOR PRODUCTIVITY & EFFICIENCY HEATMAP
            </h3>
            <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
              10 FORCED SECTORS
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono pt-0.5">
            D3-powered matrix mapping real-time output efficiency %, labor stress, and financial yields across operational shifts.
          </p>
        </div>

        {/* CONTROLS BAR */}
        <div className="flex flex-wrap items-center gap-2">
          {/* METRIC MODE SELECTOR */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setMetricMode('efficiency')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                metricMode === 'efficiency' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Efficiency %
            </button>
            <button
              onClick={() => setMetricMode('yield')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                metricMode === 'yield' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yield ($/h)
            </button>
            <button
              onClick={() => setMetricMode('labor')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                metricMode === 'labor' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Labor Force
            </button>
          </div>

          {/* SORT DROPDOWN */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-amber-300 font-mono p-1.5 rounded-xl outline-none"
          >
            <option value="default">Sort: Default Order</option>
            <option value="efficiency">Sort: Highest Efficiency</option>
            <option value="yield">Sort: Highest Base Yield</option>
          </select>

          {/* OVERCLOCK BOOST BUTTON */}
          <button
            onClick={handleWhipBoostAll}
            className="bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl border border-amber-400 shadow transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
          >
            ⚡ OVERCLOCK ALL SECTORS (+20%)
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW RIBBON */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
        <div>
          <span className="text-slate-500 block text-[10px]">Fleet Fleet Efficiency:</span>
          <span className={`font-black text-sm ${stats.fleetAvg > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {stats.fleetAvg}% Average
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Total Hourly Revenue:</span>
          <span className="text-amber-300 font-black text-sm">
            ${(stats.totalHourlyRevenue / 1e12).toFixed(2)} Trillion/hr
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Top Performing Sector:</span>
          <span className="text-emerald-300 font-bold block truncate">
            {stats.highestSectorName} ({stats.highestAvg}%)
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px]">Underperforming Sector:</span>
          <span className="text-red-400 font-bold block truncate">
            {stats.lowestSectorName} ({stats.lowestAvg}%)
          </span>
        </div>
      </div>

      {/* HEATMAP SVG CANVAS */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/90 p-2">
        <svg ref={svgRef} className="w-full block" />
      </div>

      {/* COLOR LEGEND */}
      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-3">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500">Efficiency Color Spectrum:</span>
          <div className="flex items-center space-x-1">
            <span className="w-4 h-3 rounded bg-red-600 block" />
            <span className="text-[10px] text-slate-400">&lt;50% Critical</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-4 h-3 rounded bg-amber-500 block" />
            <span className="text-[10px] text-slate-400">50-75% Moderate</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-4 h-3 rounded bg-emerald-500 block" />
            <span className="text-[10px] text-slate-400">75-90% Optimal</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-4 h-3 rounded bg-cyan-400 block" />
            <span className="text-[10px] text-slate-400">&gt;90% Overclocked</span>
          </div>
        </div>

        <div className="text-slate-500 text-[10px]">
          Total Forced Labor Force: <span className="text-slate-300 font-bold">{stats.totalLabor.toLocaleString()} Citizens</span>
        </div>
      </div>

      {/* D3 HOVER TOOLTIP */}
      {tooltip && tooltip.visible && (
        <div
          className="absolute z-50 bg-slate-950/95 border-2 border-amber-500/80 text-white p-3 rounded-xl shadow-2xl pointer-events-none font-mono text-xs space-y-1 backdrop-blur-md"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-bold text-amber-300 border-b border-slate-800 pb-1 flex justify-between gap-4">
            <span>{tooltip.sectorName}</span>
            <span className="text-[10px] text-slate-400">{tooltip.status}</span>
          </div>
          <div className="text-slate-300 text-[11px]"><span className="text-slate-500">Shift:</span> {tooltip.shiftName}</div>
          <div className="text-slate-300 text-[11px]"><span className="text-slate-500">Output Efficiency:</span> <span className="text-emerald-400 font-bold">{tooltip.val}%</span></div>
          <div className="text-slate-300 text-[11px]"><span className="text-slate-500">Assigned Laborers:</span> {tooltip.labor.toLocaleString()}</div>
          <div className="text-slate-300 text-[11px]"><span className="text-slate-500">Hourly Revenue:</span> <span className="text-amber-300 font-bold">{tooltip.hourlyYield}</span></div>
        </div>
      )}
    </div>
  );
};
