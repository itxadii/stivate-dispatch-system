import React from 'react';
import { CardHeader } from '../ui';

export type TrendRange = '7days' | 'thisMonth' | '6months' | 'years';

interface DispatchTrendChartProps {
  trendData: { date: string; count: number }[];
  trendRange: TrendRange;
  setTrendRange: (range: TrendRange) => void;
  trendLoading: boolean;
}

export const DispatchTrendChart: React.FC<DispatchTrendChartProps> = ({
  trendData,
  trendRange,
  setTrendRange,
  trendLoading,
}) => {
  return (
    <div className="card">
      <CardHeader
        title="Dispatch trend"
        subtitle="Number of dispatches created over time"
        actions={
          <select
            value={trendRange}
            onChange={(e) => setTrendRange(e.target.value as TrendRange)}
            className="input input-sm w-auto"
            aria-label="Trend range"
          >
            <option value="7days">Last 7 active days</option>
            <option value="thisMonth">This month</option>
            <option value="6months">Last 6 months</option>
            <option value="years">By year</option>
          </select>
        }
      />
      <div className="card-body">
      {trendLoading ? (
        <div className="h-64 grid place-items-center text-sm text-slate-500">Loading trend…</div>
      ) : trendData && trendData.length > 0 ? (
        <div>
          {(() => {
            const counts = trendData.map((d) => d.count);
            const absoluteMin = Math.min(...counts);
            const absoluteMax = Math.max(...counts);

            let minVal = absoluteMin;
            let maxVal = absoluteMax;
            const diff = maxVal - minVal;

            if (diff === 0) {
              minVal = Math.max(0, absoluteMin - 10);
              maxVal = absoluteMax + 10;
            } else {
              const pad = diff * 0.15;
              minVal = Math.max(0, Math.floor(absoluteMin - pad));
              maxVal = Math.ceil(absoluteMax + pad);
            }

            const width = 800;
            const height = 260;
            const paddingX = 60;
            const paddingY = 30;

            const points = trendData.map((d, index) => {
              const x = paddingX + (index * (width - paddingX * 2)) / Math.max(trendData.length - 1, 1);
              const y = height - paddingY - ((d.count - minVal) / (maxVal - minVal || 1)) * (height - paddingY * 2);
              return { x, y, ...d };
            });

            const getSmoothWavyPath = (pts: { x: number; y: number }[]) => {
              if (pts.length === 0) return '';
              if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
              if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

              let path = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
              const tension = 0.2;

              for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[i === 0 ? i : i - 1];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

                const cp1x = p1.x + (p2.x - p0.x) * tension;
                const cp1y = p1.y + (p2.y - p0.y) * tension;
                const cp2x = p2.x - (p3.x - p1.x) * tension;
                const cp2y = p2.y - (p3.y - p1.y) * tension;

                path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
              }

              return path;
            };

            const pathD = getSmoothWavyPath(points);

            const areaD = points.length > 0
              ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
              : '';

            return (
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Value Labels next to Grid Lines */}
                <text x={paddingX - 12} y={paddingY + 4} textAnchor="end" className="text-2xs font-bold fill-slate-400 font-mono">{maxVal}</text>
                <text x={paddingX - 12} y={(height - paddingY * 2) / 2 + paddingY + 4} textAnchor="end" className="text-2xs font-bold fill-slate-400 font-mono">{Math.round((maxVal + minVal) / 2)}</text>
                <text x={paddingX - 12} y={height - paddingY + 4} textAnchor="end" className="text-2xs font-bold fill-slate-400 font-mono">{minVal}</text>

                {/* Grid Lines */}
                <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={paddingX} y1={(height - paddingY * 2) / 2 + paddingY} x2={width - paddingX} y2={(height - paddingY * 2) / 2 + paddingY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" strokeWidth="1.5" />

                {areaD && <path d={areaD} fill="url(#lineGrad)" />}
                {pathD && <path d={pathD} fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}

                {points.map((p, idx) => {
                  const label = p.date.length > 7 && p.date.includes('-') ? p.date.substring(5) : p.date;
                  const showDate = trendData.length <= 10 || idx % Math.ceil(trendData.length / 8) === 0 || idx === trendData.length - 1;
                  const showVal = trendData.length <= 10;

                  return (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r={trendData.length > 15 ? "3.5" : "5"} fill="#ffffff" stroke="#059669" strokeWidth={trendData.length > 15 ? "2" : "2.5"} />

                      {showVal && (
                        <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-2xs font-black fill-slate-700 font-mono">{p.count}</text>
                      )}

                      {showDate && (
                        <g>
                          <line x1={p.x} y1={height - paddingY} x2={p.x} y2={height - paddingY + 4} stroke="#cbd5e1" strokeWidth="1" />
                          <text x={p.x} y={height - 10} textAnchor="middle" className="text-2xs font-bold fill-slate-400">
                            {label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            );
          })()}
        </div>
      ) : (
        <div className="h-64 grid place-items-center text-sm text-slate-500">No dispatches in this range yet.</div>
      )}
      </div>
    </div>
  );
};
