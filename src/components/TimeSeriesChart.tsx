import React, { useState } from 'react';
import { TrendingUp, Zap, Clock } from 'lucide-react';

interface DataPoint {
  label: string;
  timestamp: number;
  deltaViews: number;
  velocityVpm: number;
  approxLikes?: number;
  approxSaves?: number;
}

interface TimeSeriesChartProps {
  data: DataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  periodLabel?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title = 'Tracción y Velocidad en el Tiempo',
  subtitle = 'Evolución de visualizaciones y velocidad de tracción (visitas/minuto)',
  height = 260,
  periodLabel = 'Últimas horas'
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        No hay datos de telemetría suficientes en este intervalo.
      </div>
    );
  }

  const padding = { top: 25, right: 35, bottom: 40, left: 55 };
  const width = 800; // viewBox width

  const maxDelta = Math.max(...data.map(d => d.deltaViews), 10);
  const maxVelocity = Math.max(...data.map(d => d.velocityVpm), 5);

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (data.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (data.length - 1)) * innerWidth;
  };

  const getYDelta = (val: number) => {
    return padding.top + innerHeight - (val / maxDelta) * innerHeight;
  };

  // Generate smooth SVG curve path for delta views
  const points = data.map((d, i) => `${getX(i)},${getYDelta(d.deltaViews)}`);
  const linePath = points.length > 0 ? `M ${points.join(' L ')}` : '';
  const areaPath = points.length > 0
    ? `M ${getX(0)},${padding.top + innerHeight} L ${points.join(' L ')} L ${getX(data.length - 1)},${padding.top + innerHeight} Z`
    : '';

  // Peak point
  let peakIdx = 0;
  let peakVpm = 0;
  data.forEach((d, i) => {
    if (d.velocityVpm > peakVpm) {
      peakVpm = d.velocityVpm;
      peakIdx = i;
    }
  });

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-xl relative backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-wide">{title}</h3>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {periodLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <span className="text-slate-300">Nuevas Visitas ($\Delta$)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#fe2c55] inline-block opacity-75" />
            <span className="text-slate-300">Velocidad (visitas/min)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="viewsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#00f2fe" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fe2c55" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fe2c55" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Grid horizontal lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + innerHeight * (1 - pct);
            const val = Math.round(maxDelta * pct);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="sans-serif"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Velocity Bars (Secondary metric) */}
          {data.map((d, i) => {
            const barW = Math.max(3, innerWidth / (data.length * 2.2));
            const barHeight = (d.velocityVpm / maxVelocity) * innerHeight;
            const x = getX(i) - barW / 2;
            const y = padding.top + innerHeight - barHeight;
            return (
              <rect
                key={`bar-${i}`}
                x={x}
                y={y}
                width={barW}
                height={Math.max(1, barHeight)}
                rx="2"
                fill="url(#barGradient)"
                className="transition-opacity duration-200"
                opacity={hoverIndex === null || hoverIndex === i ? 0.8 : 0.3}
              />
            );
          })}

          {/* Cumulative / Delta Area & Line */}
          <path d={areaPath} fill="url(#viewsAreaGradient)" />
          <path
            d={linePath}
            fill="none"
            stroke="#00f2fe"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="filter drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]"
          />

          {/* Interactive Nodes & Peak Marker */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getYDelta(d.deltaViews);
            const isHovered = hoverIndex === i;
            const isPeak = i === peakIdx && peakVpm > 0;

            return (
              <g key={`point-${i}`}>
                {/* Transparent hover capture rect */}
                <rect
                  x={cx - innerWidth / (data.length * 2)}
                  y={padding.top}
                  width={innerWidth / data.length}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />

                {/* Node circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : isPeak ? 4.5 : 2.5}
                  fill={isPeak ? '#f59e0b' : '#00f2fe'}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="pointer-events-none transition-all duration-150"
                />

                {/* Peak label badge if peak */}
                {isPeak && !isHovered && (
                  <g className="pointer-events-none">
                    <circle cx={cx} cy={cy} r="9" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
                  </g>
                )}
              </g>
            );
          })}

          {/* X Axis labels */}
          {data.map((d, i) => {
            // Display label every N points to avoid clutter
            const step = Math.ceil(data.length / 7);
            if (i % step !== 0 && i !== data.length - 1) return null;
            const x = getX(i);
            return (
              <text
                key={`x-${i}`}
                x={x}
                y={height - padding.bottom + 18}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                {d.label}
              </text>
            );
          })}

          {/* Active Hover Crosshair Line */}
          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={padding.top + innerHeight}
              stroke="#00f2fe"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.7"
              className="pointer-events-none"
            />
          )}
        </svg>
      </div>

      {/* Floating telemetry summary for hovered or current point */}
      {activePoint && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3 bg-slate-950/40 p-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tramo: <strong className="text-white font-medium">{activePoint.label}</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nuevas Visitas: <strong className="text-cyan-300 font-semibold">+{activePoint.deltaViews.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#fe2c55]" />
              <span>Velocidad: <strong className="text-[#fe2c55] font-semibold">{activePoint.velocityVpm} vpm</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
