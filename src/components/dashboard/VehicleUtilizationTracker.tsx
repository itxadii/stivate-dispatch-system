import React, { useState, useRef, useEffect } from 'react';
import { Truck, FileDown, Calendar, Search, X, ChevronDown, Check, Eye } from 'lucide-react';
import type { Dispatch } from '../../types';
import { getVehicleMaxPallets } from '../../types';
import type { DateRangeType } from '../VehicleUtilizationExportModal';
import { StatusBadge, CardHeader } from '../ui';

interface VehicleUtilizationTrackerProps {
  trackerDateRange: DateRangeType;
  setTrackerDateRange: (range: DateRangeType) => void;
  trackerCustomFrom: string;
  setTrackerCustomFrom: (val: string) => void;
  trackerCustomTo: string;
  setTrackerCustomTo: (val: string) => void;
  trackerDateBoundaries: { startStr: string; endStr: string; label: string };
  trackerDispatchesList: Dispatch[];
  settings: any;
  onOpenExportModal: () => void;
  onEditDispatch: (id: number) => void;
  formatDateTimeDisplay: (dateStr: string) => string;
}

export const VehicleUtilizationTracker: React.FC<VehicleUtilizationTrackerProps> = ({
  trackerDateRange,
  setTrackerDateRange,
  trackerCustomFrom,
  setTrackerCustomFrom,
  trackerCustomTo,
  setTrackerCustomTo,
  trackerDateBoundaries,
  trackerDispatchesList,
  settings,
  onOpenExportModal,
  onEditDispatch,
  formatDateTimeDisplay,
}) => {
  const [selectedTruckNumber, setSelectedTruckNumber] = useState<string>('all');
  const [truckSearchQuery, setTruckSearchQuery] = useState<string>('');
  const [isTruckDropdownOpen, setIsTruckDropdownOpen] = useState<boolean>(false);
  const [highlightedTruckIndex, setHighlightedTruckIndex] = useState<number>(-1);
  const truckComboboxRef = useRef<HTMLDivElement>(null);

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

  // Build a comprehensive map of all known trucks (from settings and dispatches)
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
    <div className="card">
      <CardHeader
        icon={Truck}
        title="Fleet utilization"
        subtitle="Pallet load against truck capacity. Filter by period or vehicle, and export as PDF."
        actions={
          <>
            <select
              value={trackerDateRange}
              onChange={(e) => setTrackerDateRange(e.target.value as DateRangeType)}
              className="input input-sm w-auto"
              aria-label="Date range"
            >
              <option value="all">All time</option>
              <option value="7days">Past 7 days</option>
              <option value="30days">Past 30 days</option>
              <option value="3months">Past 3 months</option>
              <option value="6months">Past 6 months</option>
              <option value="1year">Past year</option>
              <option value="thisMonth">This month</option>
              <option value="thisYear">This year</option>
              <option value="custom">Custom range…</option>
            </select>

          {trackerDateRange === 'custom' && (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={trackerCustomFrom}
                onChange={(e) => setTrackerCustomFrom(e.target.value)}
                className="input input-sm w-auto"
                aria-label="From date"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={trackerCustomTo}
                onChange={(e) => setTrackerCustomTo(e.target.value)}
                className="input input-sm w-auto"
                aria-label="To date"
              />
            </div>
          )}

          <button
            type="button"
            onClick={onOpenExportModal}
            className="btn btn-secondary btn-sm"
            title="Export complete fleet or filtered vehicle utilization report to PDF"
          >
            <FileDown size={14} />
            <span>Export PDF</span>
          </button>
          </>
        }
      />

      <div className="card-body space-y-4">

      {/* Date Filter Active Pill */}
      {trackerDateRange !== 'all' && (
        <div className="alert alert-info py-2.5 items-center justify-between text-xs">
          <span className="flex items-center gap-2">
            <Calendar size={14} className="text-brand-700 shrink-0" />
            <span>Showing <strong>{trackerDateBoundaries.label}</strong>, {trackerDispatchesList.length} dispatches in range</span>
          </span>
          <button type="button" onClick={() => setTrackerDateRange('all')} className="btn btn-link text-xs">
            Show all time
          </button>
        </div>
      )}

      {/* Search, Filter & Quick Category Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Searchable Combobox Container */}
          <div ref={truckComboboxRef} className="relative flex-1">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search or pick a vehicle number, e.g. MH12 or 1234"
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
                className="input pl-9 pr-20 font-mono uppercase placeholder:normal-case placeholder:font-sans"
              />

              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {truckSearchQuery && (
                  <button
                    type="button"
                    onClick={clearTruckSelection}
                    className="btn btn-ghost h-6 w-6 px-0 rounded-md"
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsTruckDropdownOpen((prev) => !prev)}
                  className="btn btn-ghost h-6 w-6 px-0 rounded-md"
                  title="Toggle vehicle dropdown"
                >
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isTruckDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Floating Suggestions Dropdown */}
            {isTruckDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-2xs font-bold text-slate-500">
                  <span>{matchingTrucks.length} vehicle{matchingTrucks.length === 1 ? '' : 's'}</span>
                  <button
                    type="button"
                    onClick={clearTruckSelection}
                    className="btn btn-link text-2xs"
                  >
                    Show all vehicles
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  <button
                    type="button"
                    onClick={clearTruckSelection}
                    className={`w-full px-3.5 py-2.5 text-left text-xs font-bold flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${selectedTruckNumber === 'all' ? 'bg-brand-50 text-slate-900' : 'text-slate-700'}`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck size={14} className="text-slate-400" />
                      <span>All vehicles</span>
                    </div>
                    <span className="text-2xs font-mono text-slate-400 font-bold">{allTrucksList.length} total</span>
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
                            ? 'bg-brand-50 text-slate-900 font-bold'
                            : isHighlighted
                            ? 'bg-slate-100 text-slate-900'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono font-bold text-slate-800 text-xs uppercase">
                            {truck.vehicleNo}
                          </span>
                          <span className="tag shrink-0">
                            {truck.vehicleSize || '32 ft'} · {maxP} pallets
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {truck.activeDispatches > 0 && (
                            <span className="badge badge-warning">
                              {truck.activeDispatches} active
                            </span>
                          )}
                          <span className="text-2xs font-bold text-slate-400 tabular-nums">
                            {truck.totalDispatches} DC{truck.totalDispatches === 1 ? '' : 's'}
                          </span>
                          {isSelected && <Check size={14} className="text-brand-700" />}
                        </div>
                      </button>
                    );
                  })}

                  {matchingTrucks.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No vehicle matches "{truckSearchQuery}"
                    </div>
                  )}
                </div>

                {matchingTrucks.length > 40 && (
                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-center text-2xs text-slate-500">
                    Showing 40 of {matchingTrucks.length}. Keep typing to narrow down.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reset / All Vehicles Button */}
          <button
            type="button"
            onClick={clearTruckSelection}
            aria-pressed={selectedTruckNumber === 'all'}
            className={`btn shrink-0 ${selectedTruckNumber === 'all' ? 'bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100' : 'btn-secondary'}`}
          >
            <Truck size={14} />
            <span>All vehicles ({allTrucksList.length})</span>
          </button>
        </div>

        {/* Active Selected Truck Banner */}
        {selectedTruckNumber !== 'all' && (
          <div className="alert alert-info py-2 items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Viewing vehicle</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-brand-100 text-xs uppercase">
                {selectedTruckNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={clearTruckSelection}
              className="btn btn-link text-xs"
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
              <div className="panel space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 h-8 px-3 bg-white border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900 uppercase">
                      <Truck size={15} className="text-brand-700" />
                      <span>{targetTruckNo}</span>
                    </span>
                    <span className="text-xs text-slate-500">
                      {vSize} truck, {singleTruckCap} pallet capacity
                    </span>
                  </div>

                  <span className={`badge h-6 px-2.5 text-xs ${isOver ? 'badge-danger' : isHigh ? 'badge-warning' : 'badge-success'}`}>
                    {formattedTruckUtilPct}% utilized · {totalTruckPallets.toLocaleString()}/{totalAvailableCapacity.toLocaleString()} pallets
                  </span>
                </div>

                {/* Stat Tiles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="meta-label">Dispatches</span>
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-lg font-black text-slate-800 tabular-nums">{dcCount} DCs</span>
                      {activeDispatches.length > 0 && (
                        <span className="badge badge-warning">
                          {activeDispatches.length} active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="meta-label">Pallets loaded</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-slate-800 tabular-nums">{totalTruckPallets.toLocaleString()}</span>
                      {emptyPallets > 0 && (
                        <span className="text-2xs font-bold text-slate-400">
                          {cargoPallets.toLocaleString()} cargo + {emptyPallets.toLocaleString()} return
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="meta-label">Available capacity</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-slate-800 tabular-nums">{totalAvailableCapacity.toLocaleString()}</span>
                      {dcCount > 1 && (
                        <span className="text-2xs font-bold text-slate-400">
                          ({singleTruckCap} P/DC × {dcCount})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200">
                    <span className="meta-label">Load</span>
                    <span className={`text-lg font-black tabular-nums ${isOver ? 'text-rose-600' : isHigh ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {formattedTruckUtilPct}%
                    </span>
                  </div>
                </div>

                {/* Dispatches Table under this Truck (Showing recent 5 DCs) */}
                {recent5TruckDispatches.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                      <span>Recent dispatches <span className="text-slate-400 font-normal">{allTruckDispatches.length > 5 ? `(5 of ${allTruckDispatches.length})` : `(${allTruckDispatches.length})`}</span></span>
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                      <table className="table table-compact">
                        <thead>
                          <tr>
                            <th>DC number</th>
                            <th>Date &amp; time</th>
                            <th>Status</th>
                            <th>Supervisor</th>
                            <th className="text-right!">Pallets</th>
                            <th>Truck load</th>
                            <th className="text-right!">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recent5TruckDispatches.map((d: any) => {
                            const pCount = Number(d.total_pallets) || 1;
                            const dcCap = getVehicleMaxPallets(d.vehicle_size || vSize);
                            const dcRawPct = (pCount / dcCap) * 100;
                            const dcUtilPct = dcRawPct % 1 === 0 ? dcRawPct.toFixed(0) : dcRawPct.toFixed(2);
                            return (
                              <tr key={d.id}>
                                <td className="font-mono font-bold text-slate-900 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5">
                                    <span>{d.dc_no}</span>
                                    {Boolean(d.is_empty_pallets) && (
                                      <span className="badge badge-warning font-sans">Empty</span>
                                    )}
                                  </div>
                                </td>
                                <td className="text-slate-600 whitespace-nowrap">{formatDateTimeDisplay(d.date)}</td>
                                <td><StatusBadge status={d.status} /></td>
                                <td className="text-slate-600">{d.supplier_name}</td>
                                <td className="text-right font-mono font-bold text-slate-800 tabular-nums">{pCount}</td>
                                <td>
                                  {d.is_empty_pallets ? (
                                    <span className="badge badge-warning">Empty return</span>
                                  ) : (
                                    <span className={`badge ${dcRawPct > 100 ? 'badge-danger' : 'badge-success'}`}>
                                      {dcUtilPct}% of truck
                                    </span>
                                  )}
                                </td>
                                <td className="text-right">
                                  <button
                                    onClick={() => d.id && onEditDispatch(d.id)}
                                    className="btn btn-secondary btn-sm"
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
                  <div className="col-span-3 panel empty-state py-10">
                    No dispatches in this period. Utilization appears here once trucks are loaded.
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
                  <div key={i} className="panel space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Truck size={16} className="text-slate-500" />
                        <span className="font-bold text-slate-800 text-sm">{sz} trucks</span>
                      </div>
                      <span className="badge badge-neutral bg-white" title={`${item.trucks.size} unique trucks`}>
                        {item.count} {item.count === 1 ? 'dispatch' : 'dispatches'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Pallets loaded</span>
                        <span className="font-bold text-slate-800 tabular-nums">{item.loaded.toLocaleString()} / {item.max.toLocaleString()}</span>
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

                    <div className="flex items-center justify-between text-2xs pt-2.5 text-slate-500 border-t border-slate-200">
                      <span>{singleCap} pallets per dispatch</span>
                      <span className={`badge ${isOver ? 'badge-danger' : rawPct >= 80 ? 'badge-warning' : 'badge-success'}`}>
                        {pct}% utilized
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
