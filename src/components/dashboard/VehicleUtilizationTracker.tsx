import React, { useState, useRef, useEffect } from 'react';
import { Truck, FileDown, Calendar, Search, X, ChevronDown, Check, Eye } from 'lucide-react';
import type { Dispatch } from '../../types';
import { getVehicleMaxPallets } from '../../types';
import type { DateRangeType } from '../VehicleUtilizationExportModal';

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
            onClick={onOpenExportModal}
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
    </div>
  );
};
