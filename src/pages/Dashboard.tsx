import React, { useEffect, useState, useRef, useMemo } from 'react';
import { databaseService, settingsService, printService } from '../services/ipc';
import type { DashboardStats, Dispatch } from '../types';
import { getVehicleMaxPallets } from '../types';
import { ArrowRight, Truck, FileText, LayoutGrid, Search, Eye, X, ChevronDown, Check, Printer, Pencil, FileDown, Calendar } from 'lucide-react';
import { Modal } from '../components/Modal';
import { DispatchTable } from '../components/DispatchTable';
import { VehicleUtilizationExportModal, type DateRangeType } from '../components/VehicleUtilizationExportModal';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onEditDispatch: (id: number) => void;
}

const formatDateTimeDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const norm = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const dObj = new Date(norm);
    if (!isNaN(dObj.getTime())) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let hours = dObj.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mins = String(dObj.getMinutes()).padStart(2, '0');
      return `${dObj.getDate()}-${months[dObj.getMonth()]}-${dObj.getFullYear().toString().slice(-2)} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    }
  } catch (e) {}
  return dateStr;
};

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onEditDispatch }) => {
  const [stats, setStats] = useState<DashboardStats>({
    todayDispatches: 0,
    totalDispatches: 0,
    totalPullLists: 0,
    recentDispatches: [],
    allDispatches: [],
    trendData: [],
    supervisorShare: []
  });
  const [allDispatches, setAllDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<{ date: string; count: number }[]>([]);
  const [trendRange, setTrendRange] = useState<'7days' | 'thisMonth' | '6months' | 'years'>('7days');
  const [trendLoading, setTrendLoading] = useState(false);
  const [selectedTruckNumber, setSelectedTruckNumber] = useState<string>('all');
  const [truckSearchQuery, setTruckSearchQuery] = useState<string>('');
  const [isTruckDropdownOpen, setIsTruckDropdownOpen] = useState<boolean>(false);
  const [highlightedTruckIndex, setHighlightedTruckIndex] = useState<number>(-1);
  const [settings, setSettings] = useState<any>(null);
  const truckComboboxRef = useRef<HTMLDivElement>(null);

  // Vehicle Utilization Tracker Date Range & PDF Export State
  const [trackerDateRange, setTrackerDateRange] = useState<DateRangeType>('all');
  const [trackerCustomFrom, setTrackerCustomFrom] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [trackerCustomTo, setTrackerCustomTo] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Detail Modal State for viewing dispatches from dashboard
  const [selectedDispatch, setSelectedDispatch] = useState<(Dispatch & { items: any[] }) | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewDetails = async (id: number) => {
    try {
      const data = await databaseService.getDispatch(id);
      if (data) {
        setSelectedDispatch(data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to view dispatch details:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const [data, disps, sett] = await Promise.all([
        databaseService.getDashboardStats(),
        databaseService.getAllDispatches(),
        settingsService.load().catch(() => null)
      ]);
      setStats(data);
      setAllDispatches(disps && disps.length > 0 ? disps : (data.allDispatches || data.recentDispatches || []));
      if (sett) setSettings(sett);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async (range: string) => {
    setTrendLoading(true);
    try {
      const data = await databaseService.getTrendData(range);
      setTrendData(data);
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
    } finally {
      setTrendLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading && stats.trendData) {
      setTrendData(stats.trendData);
    }
  }, [loading, stats.trendData]);

  useEffect(() => {
    if (!loading) {
      fetchTrendData(trendRange);
    }
  }, [trendRange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (truckComboboxRef.current && !truckComboboxRef.current.contains(event.target as Node)) {
        setIsTruckDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const dispatchesList = allDispatches.length > 0 ? allDispatches : (stats.allDispatches || stats.recentDispatches);

  const recentCompletedIds = useMemo(() => {
    const list = allDispatches.length > 0 ? allDispatches : (stats.allDispatches || stats.recentDispatches || []);
    return list
      .filter((d: Dispatch) => d.status === 'completed')
      .slice(0, 5)
      .map((d: Dispatch) => d.id)
      .filter(Boolean) as number[];
  }, [allDispatches, stats]);

  // Date boundaries for Vehicle Utilization Tracker
  const trackerDateBoundaries = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const endStr = formatYMD(now);

    switch (trackerDateRange) {
      case 'all':
        return { startStr: '', endStr: '', label: 'All Time' };
      case '7days': {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past 7 Days (${startStr} to ${endStr})` };
      }
      case '30days': {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past 30 Days (${startStr} to ${endStr})` };
      }
      case '3months': {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 3);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past 3 Months (${startStr} to ${endStr})` };
      }
      case '6months': {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 6);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past 6 Months (${startStr} to ${endStr})` };
      }
      case '1year': {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past Year (${startStr} to ${endStr})` };
      }
      case 'thisMonth': {
        const d = new Date(now.getFullYear(), now.getMonth(), 1);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `This Month (${startStr} to ${endStr})` };
      }
      case 'thisYear': {
        const d = new Date(now.getFullYear(), 0, 1);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `This Year (${startStr} to ${endStr})` };
      }
      case 'custom': {
        const from = trackerCustomFrom || endStr;
        const to = trackerCustomTo || endStr;
        return { startStr: from, endStr: to, label: `${from} to ${to}` };
      }
      default:
        return { startStr: '', endStr: '', label: 'All Time' };
    }
  }, [trackerDateRange, trackerCustomFrom, trackerCustomTo]);

  // Filtered dispatches for Vehicle Utilization Tracker
  const trackerDispatchesList = useMemo(() => {
    const { startStr, endStr } = trackerDateBoundaries;
    if (!startStr && !endStr) return dispatchesList;
    return dispatchesList.filter((d: any) => {
      const dYmd = (d.date || '').substring(0, 10);
      if (startStr && dYmd < startStr) return false;
      if (endStr && dYmd > endStr) return false;
      return true;
    });
  }, [dispatchesList, trackerDateBoundaries]);

  let fleetLoadedPallets = 0;
  let fleetTotalCapacity = 0;

  dispatchesList.forEach((d: any) => {
    const curP = Number(d.total_pallets) || 1;
    const vSize = d.vehicle_size || '32 ft';
    const dispatchCap = getVehicleMaxPallets(vSize);
    fleetLoadedPallets += curP;
    fleetTotalCapacity += dispatchCap;
  });

  const rawFleetUtil = fleetTotalCapacity > 0 ? (fleetLoadedPallets / fleetTotalCapacity) * 100 : 0;
  const fleetUtilizationDisplay = rawFleetUtil % 1 === 0 ? rawFleetUtil.toFixed(0) : rawFleetUtil.toFixed(2);

  const cards = [
    {
      title: "Today's Dispatches",
      value: stats.todayDispatches,
      desc: "Created since 12:00 AM",
      icon: Truck,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600 bg-blue-50"
    },
    {
      title: "Total Dispatches",
      value: stats.totalDispatches,
      desc: "All recorded dispatches",
      icon: FileText,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "Fleet Truck Utilization",
      value: `${fleetUtilizationDisplay}%`,
      desc: `${fleetLoadedPallets.toLocaleString()}/${fleetTotalCapacity.toLocaleString()} Pallets Loaded`,
      icon: Truck,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-600 bg-amber-50"
    },
    {
      title: "Master Pull Lists",
      value: stats.totalPullLists,
      desc: "Imported SAP records",
      icon: LayoutGrid,
      color: "from-teal-500 to-emerald-600",
      textColor: "text-teal-600 bg-teal-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5 sm:space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.title}</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{c.value}</h3>
                <p className="text-xs text-slate-500 font-medium">{c.desc}</p>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl ${c.textColor} font-bold shrink-0`}>
                <Icon size={22} className="sm:w-6 sm:h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Stack */}
      <div className="space-y-6">
        {/* Trend Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-50 pb-3">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dispatches Trend Analytics</h4>
            <select
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="7days">Last 7 Active Days</option>
              <option value="thisMonth">This Month</option>
              <option value="6months">Last 6 Months</option>
              <option value="years">Yearly Trend</option>
            </select>
          </div>
          {trendLoading ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-medium">
              Loading trend analytics...
            </div>
          ) : trendData && trendData.length > 0 ? (
            <div className="pt-2">
              {(() => {
                const counts = trendData.map(d => d.count);
                const absoluteMin = Math.min(...counts);
                const absoluteMax = Math.max(...counts);

                // Calculate Y bounds with padding
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
                        <stop offset="0%" stopColor="#059669" stopOpacity="0.18"/>
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.0"/>
                      </linearGradient>
                    </defs>

                    {/* Y-Axis Value Labels next to Grid Lines */}
                    <text x={paddingX - 12} y={paddingY + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400 font-mono">{maxVal}</text>
                    <text x={paddingX - 12} y={(height - paddingY * 2) / 2 + paddingY + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400 font-mono">{Math.round((maxVal + minVal) / 2)}</text>
                    <text x={paddingX - 12} y={height - paddingY + 4} textAnchor="end" className="text-[10px] font-bold fill-slate-400 font-mono">{minVal}</text>
                    
                    {/* Grid Lines */}
                    <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={(height - paddingY * 2) / 2 + paddingY} x2={width - paddingX} y2={(height - paddingY * 2) / 2 + paddingY} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" strokeWidth="1.5" />
                    
                    {areaD && <path d={areaD} fill="url(#lineGrad)" />}
                    {pathD && <path d={pathD} fill="none" stroke="#059669" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                    
                    {points.map((p, idx) => {
                      const label = p.date.length > 7 && p.date.includes('-') ? p.date.substring(5) : p.date;
                      
                      // Spacing: hide date labels if there are many days to avoid overlapping
                      const showDate = trendData.length <= 10 || idx % Math.ceil(trendData.length / 8) === 0 || idx === trendData.length - 1;
                      const showVal = trendData.length <= 10;

                      return (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r={trendData.length > 15 ? "3.5" : "5"} fill="#ffffff" stroke="#059669" strokeWidth={trendData.length > 15 ? "2" : "2.5"} />
                          
                          {/* Value above the dot */}
                          {showVal && (
                            <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-[11px] font-extrabold fill-slate-700 font-mono">{p.count}</text>
                          )}
                          
                          {/* X-axis date labels */}
                          {showDate && (
                            <g>
                              <line x1={p.x} y1={height - paddingY} x2={p.x} y2={height - paddingY + 4} stroke="#cbd5e1" strokeWidth="1" />
                              <text x={p.x} y={height - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
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
            <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-bold uppercase">
              No trend data available
            </div>
          )}
        </div>

        {/* Supervisor Share Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider border-b border-slate-50 pb-3 flex items-center justify-between">
            <span>Supervisor Shares (Top 5 Distribution)</span>
            <span className="text-xs font-semibold text-slate-400 lowercase font-sans">
              {dispatchesList.length} total recorded
            </span>
          </h4>
          {(() => {
            // Aggregate supervisor shares from dispatchesList (fallback to stats.supervisorShare)
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
              return (stats.supervisorShare || []).map((s: any) => ({
                name: (s.name || 'UNKNOWN').toUpperCase(),
                count: s.count || 0,
                pallets: s.pallets || 0
              }));
            })();

            if (!supervisorShareData || supervisorShareData.length === 0) {
              return (
                <div className="h-64 flex items-center justify-center text-xs text-slate-400 font-bold uppercase">
                  No supervisor share data available
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
                color: colors[idx % colors.length]
              };
            });

            return (
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
            );
          })()}
        </div>
      </div>

      {/* Truck Utilization & Fleet Capacity Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        {/* Header Bar */}
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-200/80">
                <Truck size={18} />
              </span>
              <span>Truck Capacity & Fleet Utilization Tracker</span>
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Monitor vehicle load capacities, filter dispatches by date range, search trucks, and export utilization reports.
            </p>
          </div>

          {/* Date Filter & Export PDF Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex items-center">
              <select
                value={trackerDateRange}
                onChange={(e) => setTrackerDateRange(e.target.value as DateRangeType)}
                className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                title="Filter vehicle utilization by date range"
              >
                <option value="all">All Time</option>
                <option value="7days">Past 7 Days</option>
                <option value="30days">Past 30 Days</option>
                <option value="3months">Past 3 Months</option>
                <option value="6months">Past 6 Months</option>
                <option value="1year">Past Year</option>
                <option value="thisMonth">This Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>

            {trackerDateRange === 'custom' && (
              <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-50 p-1 rounded-xl border border-slate-200">
                <input
                  type="date"
                  value={trackerCustomFrom}
                  onChange={(e) => setTrackerCustomFrom(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                />
                <span className="text-slate-400 font-sans">to</span>
                <input
                  type="date"
                  value={trackerCustomTo}
                  onChange={(e) => setTrackerCustomTo(e.target.value)}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
              title="Export complete fleet or filtered vehicle utilization report to PDF"
            >
              <FileDown size={15} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Date Filter Active Pill */}
        {trackerDateRange !== 'all' && (
          <div className="px-3 py-1.5 bg-blue-50/80 border border-blue-200 rounded-lg flex items-center justify-between text-xs">
            <span className="text-blue-900 font-semibold flex items-center gap-1.5">
              <Calendar size={13} className="text-blue-600" />
              <span>Filtered by period: <strong>{trackerDateBoundaries.label}</strong> ({trackerDispatchesList.length} dispatches in range)</span>
            </span>
            <button
              type="button"
              onClick={() => setTrackerDateRange('all')}
              className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
            >
              Reset to All Time
            </button>
          </div>
        )}

        {/* Search, Filter & Quick Category Bar */}
        {(() => {
          // 1. Build a comprehensive map of all known trucks (from settings and dispatches)
          const allTruckMap = new Map<string, { vehicleNo: string; vehicleSize: string; totalDispatches: number; activeDispatches: number; latestDate: string }>();

          if (settings?.vehiclesList) {
            settings.vehiclesList.forEach((v: string) => {
              const vNo = (v || '').trim().toUpperCase();
              if (!vNo) return;
              allTruckMap.set(vNo, {
                vehicleNo: vNo,
                vehicleSize: settings.defaultVehicleSize || '32 ft',
                totalDispatches: 0,
                activeDispatches: 0,
                latestDate: ''
              });
            });
          }

          trackerDispatchesList.forEach((d: any) => {
            const vNo = (d.vehicle_no || '').trim().toUpperCase();
            if (!vNo) return;
            const existing = allTruckMap.get(vNo) || {
              vehicleNo: vNo,
              vehicleSize: d.vehicle_size || '32 ft',
              totalDispatches: 0,
              activeDispatches: 0,
              latestDate: d.date || ''
            };
            existing.totalDispatches += 1;
            if (d.status !== 'completed') {
              existing.activeDispatches += 1;
            }
            if (d.vehicle_size && (!existing.vehicleSize || existing.vehicleSize === '32 ft')) {
              existing.vehicleSize = d.vehicle_size;
            }
            if (!existing.latestDate || (d.date && d.date > existing.latestDate)) {
              existing.latestDate = d.date;
            }
            allTruckMap.set(vNo, existing);
          });

          const allTrucksList = Array.from(allTruckMap.values()).sort((a, b) => {
            if (a.activeDispatches > 0 && b.activeDispatches === 0) return -1;
            if (b.activeDispatches > 0 && a.activeDispatches === 0) return 1;
            if (b.totalDispatches !== a.totalDispatches) return b.totalDispatches - a.totalDispatches;
            return a.vehicleNo.localeCompare(b.vehicleNo);
          });

          const query = truckSearchQuery.trim().toUpperCase();
          const matchingTrucks = query
            ? allTrucksList.filter((t) => t.vehicleNo.includes(query))
            : allTrucksList;

          const isSpecificTruckSelected = selectedTruckNumber !== 'all';
          const activeTruckQuery = isSpecificTruckSelected ? selectedTruckNumber : (truckSearchQuery.trim() ? truckSearchQuery.trim().toUpperCase() : '');

          const filteredTruckDispatches = trackerDispatchesList.filter((d: any) => {
            if (!activeTruckQuery) return true;
            const vNo = (d.vehicle_no || '').toUpperCase();
            return isSpecificTruckSelected ? vNo === activeTruckQuery : vNo.includes(activeTruckQuery);
          });

          const selectTruck = (truckNo: string) => {
            setSelectedTruckNumber(truckNo);
            setTruckSearchQuery(truckNo);
            setIsTruckDropdownOpen(false);
            setHighlightedTruckIndex(-1);
          };

          const clearTruckSelection = () => {
            setSelectedTruckNumber('all');
            setTruckSearchQuery('');
            setIsTruckDropdownOpen(false);
            setHighlightedTruckIndex(-1);
          };

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Searchable Combobox Container */}
                <div ref={truckComboboxRef} className="relative flex-1">
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search by truck number or select from 1,000+ fleet vehicles (e.g. MH-12, 1234)..."
                      value={truckSearchQuery}
                      onFocus={() => {
                        setIsTruckDropdownOpen(true);
                        setHighlightedTruckIndex(-1);
                      }}
                      onChange={(e) => {
                        setTruckSearchQuery(e.target.value);
                        setIsTruckDropdownOpen(true);
                        setHighlightedTruckIndex(-1);
                        if (selectedTruckNumber !== 'all' && e.target.value !== selectedTruckNumber) {
                          setSelectedTruckNumber('all');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (!isTruckDropdownOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
                          setIsTruckDropdownOpen(true);
                          return;
                        }
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                          setHighlightedTruckIndex((prev) => (prev < matchingTrucks.length - 1 ? prev + 1 : 0));
                        } else if (e.key === 'ArrowUp') {
                          e.preventDefault();
                          setHighlightedTruckIndex((prev) => (prev > 0 ? prev - 1 : matchingTrucks.length - 1));
                        } else if (e.key === 'Enter') {
                          e.preventDefault();
                          if (highlightedTruckIndex >= 0 && highlightedTruckIndex < matchingTrucks.length) {
                            selectTruck(matchingTrucks[highlightedTruckIndex].vehicleNo);
                          } else if (matchingTrucks.length > 0) {
                            selectTruck(matchingTrucks[0].vehicleNo);
                          }
                        } else if (e.key === 'Escape') {
                          setIsTruckDropdownOpen(false);
                        }
                      }}
                      className="w-full pl-10 pr-24 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-[#4BB8FA] focus:bg-white font-mono font-bold uppercase text-slate-800 placeholder-slate-400 transition-all shadow-2xs"
                    />

                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      {truckSearchQuery && (
                        <button
                          type="button"
                          onClick={clearTruckSelection}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title="Clear search"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsTruckDropdownOpen((prev) => !prev)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="Toggle vehicle dropdown"
                      >
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isTruckDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Floating Suggestions Dropdown */}
                  {isTruckDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>{matchingTrucks.length} Vehicle{matchingTrucks.length === 1 ? '' : 's'} Available</span>
                        <button
                          type="button"
                          onClick={clearTruckSelection}
                          className="text-[10px] text-blue-600 hover:underline cursor-pointer lowercase font-sans font-semibold"
                        >
                          Reset to all vehicles
                        </button>
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                        {/* Option to show all vehicles */}
                        <button
                          type="button"
                          onClick={clearTruckSelection}
                          className={`w-full px-3.5 py-2.5 text-left text-xs font-bold flex items-center justify-between hover:bg-blue-50/60 transition-colors cursor-pointer ${selectedTruckNumber === 'all' ? 'bg-blue-50 text-blue-800' : 'text-slate-700'}`}
                        >
                          <div className="flex items-center gap-2">
                            <Truck size={14} className="text-slate-400" />
                            <span>All Vehicles (Fleet Overview)</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold">{allTrucksList.length} total</span>
                        </button>

                        {matchingTrucks.slice(0, 40).map((truck, idx) => {
                          const isSelected = selectedTruckNumber === truck.vehicleNo;
                          const isHighlighted = highlightedTruckIndex === idx;
                          const maxP = getVehicleMaxPallets(truck.vehicleSize);

                          return (
                            <button
                              key={truck.vehicleNo}
                              type="button"
                              onClick={() => selectTruck(truck.vehicleNo)}
                              onMouseEnter={() => setHighlightedTruckIndex(idx)}
                              className={`w-full px-3.5 py-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'bg-blue-50 text-blue-900 font-bold'
                                  : isHighlighted
                                  ? 'bg-slate-100/80 text-slate-900'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="font-mono font-black text-slate-800 text-xs tracking-wider uppercase">
                                  {truck.vehicleNo}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                  {truck.vehicleSize || '32 ft'} ({maxP} Pallets)
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 ml-3">
                                {truck.activeDispatches > 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    {truck.activeDispatches} Active
                                  </span>
                                )}
                                <span className="text-[10px] font-mono font-semibold text-slate-400">
                                  {truck.totalDispatches} DC{truck.totalDispatches === 1 ? '' : 's'}
                                </span>
                                {isSelected && <Check size={13} className="text-blue-600" />}
                              </div>
                            </button>
                          );
                        })}

                        {matchingTrucks.length === 0 && (
                          <div className="p-4 text-center text-xs text-slate-400 font-semibold">
                            No matching vehicles found for "{truckSearchQuery}"
                          </div>
                        )}
                      </div>

                      {matchingTrucks.length > 40 && (
                        <div className="p-2 bg-slate-50 border-t border-slate-100 text-center text-[10px] font-semibold text-slate-400 font-sans">
                          Showing top 40 of {matchingTrucks.length} matching vehicles. Type to refine search.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reset / All Vehicles Button */}
                <button
                  type="button"
                  onClick={clearTruckSelection}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer border ${
                    selectedTruckNumber === 'all'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Truck size={14} className={selectedTruckNumber === 'all' ? 'text-[#4BB8FA]' : 'text-slate-400'} />
                  <span>All Vehicles ({allTrucksList.length})</span>
                </button>
              </div>

              {/* Active Selected Truck Banner */}
              {selectedTruckNumber !== 'all' && (
                <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 rounded-xl px-3.5 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Currently viewing vehicle:</span>
                    <span className="font-mono font-extrabold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 text-xs">
                      {selectedTruckNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearTruckSelection}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                  >
                    <X size={13} />
                    <span>Clear selection</span>
                  </button>
                </div>
              )}

              {/* Specific Truck Details Panel (If Search or Filter Active) */}
              {activeTruckQuery ? (
                (() => {
                  const allTruckDispatches = filteredTruckDispatches;
                  const recent5TruckDispatches = allTruckDispatches.slice(0, 5);
                  const targetTruckNo = (selectedTruckNumber !== 'all' ? selectedTruckNumber : allTruckDispatches[0]?.vehicle_no) || activeTruckQuery;
                  const matchedTruckInfo = allTruckMap.get(targetTruckNo);
                  const vSize = matchedTruckInfo?.vehicleSize || allTruckDispatches[0]?.vehicle_size || '32 ft';
                  const singleTruckCap = getVehicleMaxPallets(vSize);
                  const dcCount = allTruckDispatches.length;
                  const activeDispatches = allTruckDispatches.filter((d: any) => d.status !== 'completed');

                  // Total loaded pallets across all DCs on this truck
                  const totalTruckPallets = allTruckDispatches.reduce(
                    (acc, d: any) => acc + (Number(d.total_pallets) || 1),
                    0
                  );
                  const emptyDispatches = allTruckDispatches.filter((d: any) => Boolean(d.is_empty_pallets));
                  const emptyPallets = emptyDispatches.reduce(
                    (acc, d: any) => acc + (Number(d.total_pallets) || 1),
                    0
                  );
                  const cargoPallets = totalTruckPallets - emptyPallets;

                  // Total available capacity across all dispatches for this vehicle
                  const totalAvailableCapacity = allTruckDispatches.length > 0
                    ? allTruckDispatches.reduce(
                        (acc, d: any) => acc + getVehicleMaxPallets(d.vehicle_size || vSize),
                        0
                      )
                    : singleTruckCap;

                  const rawTruckUtilPct = totalAvailableCapacity > 0
                    ? (totalTruckPallets / totalAvailableCapacity) * 100
                    : 0;
                  const formattedTruckUtilPct = rawTruckUtilPct % 1 === 0
                    ? rawTruckUtilPct.toFixed(0)
                    : rawTruckUtilPct.toFixed(2);
                  const isOver = totalTruckPallets > totalAvailableCapacity;
                  const isHigh = rawTruckUtilPct >= 80;

                  return (
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 shadow-2xs">
                      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-2">
                            <Truck size={14} className="text-[#4BB8FA]" />
                            <span>Truck: {targetTruckNo}</span>
                          </span>
                          <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold">
                            Vehicle Size: {vSize} ({singleTruckCap} Pallets Capacity)
                          </span>
                        </div>

                        <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold border ${
                          isOver
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : isHigh
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {formattedTruckUtilPct}% Capacity Utilized ({totalTruckPallets.toLocaleString()} / {totalAvailableCapacity.toLocaleString()} Pallets)
                        </span>
                      </div>

                      {/* Stat Tiles */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Dispatches</span>
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-lg font-extrabold font-mono text-slate-800">{dcCount} DCs</span>
                            {activeDispatches.length > 0 && (
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                {activeDispatches.length} Active
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Loaded Pallets</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-extrabold font-mono text-slate-800">{totalTruckPallets.toLocaleString()} Pallets</span>
                            {emptyPallets > 0 && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                ({cargoPallets.toLocaleString()} Cargo + {emptyPallets.toLocaleString()} Return)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Available Capacity</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-extrabold font-mono text-slate-800">{totalAvailableCapacity.toLocaleString()} Pallets</span>
                            {dcCount > 1 && (
                              <span className="text-[10px] font-semibold text-slate-400">
                                ({singleTruckCap} P/DC × {dcCount})
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Capacity Load %</span>
                          <span className={`text-lg font-extrabold font-mono ${isOver ? 'text-rose-600' : isHigh ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {formattedTruckUtilPct}%
                          </span>
                        </div>
                      </div>

                      {/* Dispatches Table under this Truck (Showing recent 5 DCs) */}
                      {recent5TruckDispatches.length > 0 ? (
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase px-1">
                            <span>Recent Dispatches {allTruckDispatches.length > 5 ? `(Showing 5 of ${allTruckDispatches.length})` : `(${allTruckDispatches.length})`}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
                            <thead className="bg-slate-100/80">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase font-mono">DC Number</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Date & Time</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-500 uppercase">Supervisor</th>
                                <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">Loaded Pallets</th>
                                <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">DC Load Ratio</th>
                                <th className="px-4 py-2.5 text-center text-xs font-bold text-slate-500 uppercase">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {recent5TruckDispatches.map((d: any) => {
                                const pCount = Number(d.total_pallets) || 1;
                                const dcCap = getVehicleMaxPallets(d.vehicle_size || vSize);
                                const dcRawPct = (pCount / dcCap) * 100;
                                const dcUtilPct = dcRawPct % 1 === 0 ? dcRawPct.toFixed(0) : dcRawPct.toFixed(2);
                                return (
                                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-mono font-bold text-slate-800 text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <span>{d.dc_no}</span>
                                        {Boolean(d.is_empty_pallets) && (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                                            Empty
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-600 font-medium">{formatDateTimeDisplay(d.date)}</td>
                                    <td className="px-4 py-3 text-xs">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                        d.status === 'completed'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : d.status === 'ready'
                                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                          : 'bg-amber-50 text-amber-700 border-amber-200'
                                      }`}>
                                        {d.status ? d.status.toUpperCase() : 'LOADING'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-700 font-bold uppercase">{d.supplier_name}</td>
                                    <td className="px-4 py-3 text-xs font-mono font-bold text-center text-slate-800">{pCount} Pallet{pCount > 1 ? 's' : ''}</td>
                                    <td className="px-4 py-3 text-center">
                                      {d.is_empty_pallets ? (
                                        <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                          Empty Return ({pCount} Pallet{pCount > 1 ? 's' : ''})
                                        </span>
                                      ) : (
                                        <span className={`px-2.5 py-1 text-xs font-extrabold rounded-md border ${
                                          dcRawPct > 100 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        }`}>
                                          {dcUtilPct}% of Truck
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <button
                                        onClick={() => d.id && onEditDispatch(d.id)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                                      >
                                        <Eye size={13} />
                                        <span>Open</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : null}
                    </div>
                  );
                })()
              ) : (
                /* Vehicle Size Breakdown Cards (Default view when no truck filter selected) */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const sizeGroups: Record<string, { count: number; loaded: number; max: number; trucks: Set<string> }> = {};
                    trackerDispatchesList.forEach((d: any) => {
                      const sz = d.vehicle_size || '32 ft';
                      const maxP = getVehicleMaxPallets(sz);
                      const curP = Number(d.total_pallets) || 1;
                      const truck = (d.vehicle_no || '').trim().toUpperCase();
                      if (!sizeGroups[sz]) {
                        sizeGroups[sz] = { count: 0, loaded: 0, max: 0, trucks: new Set() };
                      }
                      sizeGroups[sz].count += 1;
                      sizeGroups[sz].loaded += curP;
                      sizeGroups[sz].max += maxP;
                      if (truck) {
                        sizeGroups[sz].trucks.add(truck);
                      }
                    });

                    const standardOrder = ['32 ft', '20 ft', '10 ft'];
                    const keys = Object.keys(sizeGroups).sort((a, b) => {
                      const ia = standardOrder.indexOf(a);
                      const ib = standardOrder.indexOf(b);
                      if (ia !== -1 && ib !== -1) return ia - ib;
                      if (ia !== -1) return -1;
                      if (ib !== -1) return 1;
                      return a.localeCompare(b);
                    });

                    if (keys.length === 0) {
                      return (
                        <div className="col-span-3 py-8 text-center text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded-xl">
                          No active vehicle dispatch data available. Create a new dispatch to begin tracking.
                        </div>
                      );
                    }

                    return keys.map((sz, i) => {
                      const item = sizeGroups[sz];
                      const rawPct = item.max > 0 ? (item.loaded / item.max) * 100 : 0;
                      const pct = rawPct % 1 === 0 ? rawPct.toFixed(0) : rawPct.toFixed(2);
                      const isOver = item.loaded > item.max;
                      const singleCap = getVehicleMaxPallets(sz);

                      return (
                        <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-2xs hover:border-slate-300 transition-all">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Truck size={16} className="text-slate-600" />
                              <span className="font-extrabold text-slate-800 text-sm">{sz} Vehicles</span>
                            </div>
                            <span className="text-xs px-2.5 py-0.5 bg-white border border-slate-200 font-bold text-slate-600 rounded-full" title={`${item.trucks.size} unique trucks`}>
                              {item.count} {item.count === 1 ? 'Dispatch' : 'Dispatches'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-600">
                              <span>Loaded Pallets</span>
                              <span className="font-mono font-bold text-slate-800">{item.loaded.toLocaleString()} / {item.max.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isOver ? 'bg-rose-500' : rawPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, rawPct))}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-200/60 font-medium">
                            <span>Capacity: {singleCap} Pallets/dispatch</span>
                            <span className={`font-bold px-2 py-0.5 rounded border ${
                              isOver
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : rawPct >= 80
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              {pct}% Utilized
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Recent Dispatches */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Dispatches</h4>
          <button
            onClick={() => setActiveTab('completed')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors duration-150 cursor-pointer"
          >
            <span>See All Dispatches</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400 font-medium">
              Loading recent dispatches...
            </div>
          ) : stats.recentDispatches.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 font-medium">
              No dispatches created yet. Click "New Dispatch" to start!
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">DC Number</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle No</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Parts</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {stats.recentDispatches.map((d) => {
                  const isCompleted = d.status === 'completed';
                  const isRecentCompleted = Boolean(d.id && recentCompletedIds.includes(d.id));
                  const canEdit = !isCompleted || isRecentCompleted;

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => d.id && handleViewDetails(d.id)}
                            className="hover:text-emerald-600 hover:underline cursor-pointer font-bold transition-colors text-left"
                            title="Click to view details"
                          >
                            {d.dc_no}
                          </button>
                          {Boolean(d.is_empty_pallets) && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                              Empty
                            </span>
                          )}
                          {isRecentCompleted && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Editable (Recent 5 completed DC)">
                              Editable
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {formatDateTimeDisplay(d.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          d.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : d.status === 'ready'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {d.status === 'completed' ? 'Completed' : d.status === 'ready' ? 'Ready' : 'Loading'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        <div className="font-bold text-slate-800 uppercase">{d.vehicle_no}</div>
                        {(() => {
                          const vSize = (d as any).vehicle_size || '32 ft';
                          const maxP = getVehicleMaxPallets(vSize);
                          const curP = d.total_pallets || 1;
                          const rawPct = (curP / maxP) * 100;
                          const utilPct = rawPct % 1 === 0 ? rawPct.toFixed(0) : rawPct.toFixed(2);
                          if (d.is_empty_pallets) {
                            return (
                              <div className="text-[10px] font-semibold text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{vSize}</span>
                              </div>
                            );
                          }
                          return (
                            <div className="text-[10px] font-semibold text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{vSize}</span>
                              <span>{curP}/{maxP} ({utilPct}%)</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {d.supplier_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-800 text-right font-bold">
                        {d.total_parts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        {canEdit ? (
                          <button
                            onClick={() => d.id && onEditDispatch(d.id)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors duration-100 cursor-pointer font-bold text-xs"
                            title={d.status === 'completed' ? "Edit recent completed DC (Allowed for last 5 completed DCs)" : "Edit dispatch"}
                          >
                            Edit
                          </button>
                        ) : (
                          <button
                            onClick={() => d.id && handleViewDetails(d.id)}
                            className="text-slate-500 hover:text-slate-800 transition-colors duration-100 cursor-pointer font-semibold text-xs flex items-center justify-center gap-1 mx-auto"
                            title="Archived dispatch (View only)"
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* View Details Modal */}
      {selectedDispatch && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Dispatch Details: ${selectedDispatch.dc_no}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6 select-none">
            {/* Metadata grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Date & Time</span>
                <span className="font-semibold text-slate-700">{formatDateTimeDisplay(selectedDispatch.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                  selectedDispatch.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : selectedDispatch.status === 'ready'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {selectedDispatch.status === 'completed' ? 'Completed' : selectedDispatch.status === 'ready' ? 'Ready' : 'Loading'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Vehicle Number</span>
                <span className="font-semibold text-slate-700 uppercase">{selectedDispatch.vehicle_no}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Supervisor Name</span>
                <span className="font-semibold text-slate-700">{selectedDispatch.supplier_name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Pallets Count</span>
                <span className="font-semibold text-slate-700 font-mono text-xs">{selectedDispatch.total_pallets || 1}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Total Pull Lists</span>
                <span className="font-semibold text-slate-700 font-mono text-xs">
                  {selectedDispatch.items?.length ?? (selectedDispatch as any).total_pull_lists ?? 0}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Destination Address</span>
                <span className="font-semibold text-slate-700">{selectedDispatch.address || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Total Parts</span>
                <span className="font-semibold text-slate-700 font-mono text-xs">{selectedDispatch.total_parts || 0}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Created By</span>
                <span className="font-semibold text-slate-700">{selectedDispatch.created_by || 'Operator'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Particular</span>
                <span className="font-semibold text-slate-700">{selectedDispatch.particular || 'AS PER LIST'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block mb-0.5">Transaction</span>
                <span className="font-semibold text-slate-700">{selectedDispatch.transaction_type || '-'}</span>
              </div>
            </div>

            {/* List Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Pull Lists Loaded ({selectedDispatch.items?.length || 0})
              </span>
              <DispatchTable items={selectedDispatch.items || []} readOnly={true} />
            </div>

            {/* Modal Controls */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              {selectedDispatch.id && (selectedDispatch.status !== 'completed' || recentCompletedIds.includes(selectedDispatch.id)) && (
                <button
                  onClick={() => {
                    const id = selectedDispatch.id;
                    setDetailModalOpen(false);
                    if (id) onEditDispatch(id);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  title="Edit this dispatch in editor"
                >
                  <Pencil size={14} />
                  <span>Edit Dispatch</span>
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    await printService.printChallan(selectedDispatch, selectedDispatch.items || []);
                  } catch (e) {
                    console.error('Failed to print challan:', e);
                  }
                }}
                className="flex items-center gap-1 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                <Printer size={14} />
                <span>Reprint Challan PDF</span>
              </button>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Vehicle Utilization PDF Export Modal */}
      <VehicleUtilizationExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allDispatches={allDispatches}
        registeredVehicles={settings?.vehiclesList || []}
        initialVehicle={selectedTruckNumber !== 'all' ? selectedTruckNumber : ''}
        initialDateRange={trackerDateRange}
        initialCustomFrom={trackerCustomFrom}
        initialCustomTo={trackerCustomTo}
      />
    </div>
  );
};
