import React from 'react';

interface SupervisorShareChartProps {
  dispatchesList: any[];
  supervisorShareFallback?: any[];
}

export const SupervisorShareChart: React.FC<SupervisorShareChartProps> = ({
  dispatchesList,
  supervisorShareFallback,
}) => {
  const supervisorShareData: { name: string; count: number; pallets: number }[] = (() => {
    if (dispatchesList && dispatchesList.length > 0) {
      const map = new Map<string, { count: number; pallets: number }>();
      dispatchesList.forEach((d: any) => {
        const rawName = (d.supplier_name || '').trim();
        const name = rawName ? rawName.toUpperCase() : 'UNASSIGNED';
        const p = Number(d.total_pallets) || 1;
        const existing = map.get(name) || { count: 0, pallets: 0 };
        existing.count += 1;
        existing.pallets += p;
        map.set(name, existing);
      });
      return Array.from(map.entries())
        .map(([name, val]) => ({ name, count: val.count, pallets: val.pallets }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }
    return (supervisorShareFallback || []).map((s: any) => ({
      name: (s.name || 'UNKNOWN').toUpperCase(),
      count: s.count || 0,
      pallets: s.pallets || 0,
    }));
  })();

  if (!supervisorShareData || supervisorShareData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center justify-between">
          <span>Supervisor Shares (Top 5 Distribution)</span>
          <span className="text-xs font-semibold text-slate-400 lowercase font-sans">
            {dispatchesList.length} total recorded
          </span>
        </h4>
        <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-bold uppercase">
          No supervisor share data available
        </div>
      </div>
    );
  }

  const total = supervisorShareData.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let accumulatedLength = 0;
  const colors = ['#059669', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  const slices = supervisorShareData.map((s, idx) => {
    const percentage = s.count / total;
    const strokeLength = percentage * circumference;
    const strokeOffset = -accumulatedLength;
    accumulatedLength += strokeLength;
    return {
      ...s,
      percentage: Math.round(percentage * 100),
      strokeLength,
      strokeOffset,
      color: colors[idx % colors.length],
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center justify-between">
        <span>Supervisor Shares (Top 5 Distribution)</span>
        <span className="text-xs font-semibold text-slate-400 lowercase font-sans">
          {dispatchesList.length} total recorded
        </span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-4">
        <div className="flex justify-center">
          <svg viewBox="0 0 200 200" className="w-56 h-56">
            <circle cx="100" cy="100" r="55" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
            {slices.map((slice, idx) => (
              <circle
                key={idx}
                cx="100"
                cy="100"
                r="55"
                fill="transparent"
                stroke={slice.color}
                strokeWidth="18"
                strokeDasharray={`${slice.strokeLength} ${circumference}`}
                strokeDashoffset={slice.strokeOffset}
                transform="rotate(-90 100 100)"
                className="transition-all duration-300 hover:stroke-[20px] cursor-pointer"
              />
            ))}
            <g>
              <text x="100" y="96" textAnchor="middle" className="text-[10px] font-extrabold fill-slate-400 uppercase tracking-wider">TOTAL</text>
              <text x="100" y="118" textAnchor="middle" className="text-[17px] font-black fill-slate-800 font-mono">{total}</text>
            </g>
          </svg>
        </div>

        <div className="flex flex-col gap-3.5 w-full max-w-md mx-auto">
          {slices.map((slice, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }}></span>
                <span className="font-bold text-slate-700 truncate uppercase">{slice.name}</span>
              </div>
              <div className="flex items-baseline gap-2 shrink-0 ml-4">
                <span className="font-mono font-bold text-slate-700 text-xs">
                  {slice.count} {slice.count === 1 ? 'dispatch' : 'dispatches'} ({slice.percentage}%)
                </span>
                {slice.pallets > 0 && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    • {slice.pallets} Pallets
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
