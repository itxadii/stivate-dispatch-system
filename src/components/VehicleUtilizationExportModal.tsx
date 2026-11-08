import React, { useState, useMemo } from 'react';
import {
  X,
  FileDown,
  Calendar,
  Truck,
  Filter,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail
} from 'lucide-react';
import { getVehicleMaxPallets } from '../types';
import { printService, emailService } from '../services/ipc';

export type DateRangeType =
  | 'all'
  | '7days'
  | '30days'
  | '3months'
  | '6months'
  | '1year'
  | 'thisMonth'
  | 'thisYear'
  | 'custom';

export interface VehicleUtilizationExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  allDispatches: any[];
  registeredVehicles?: string[];
  initialVehicle?: string;
  initialDateRange?: DateRangeType;
  initialCustomFrom?: string;
  initialCustomTo?: string;
}

export const VehicleUtilizationExportModal: React.FC<VehicleUtilizationExportModalProps> = ({
  isOpen,
  onClose,
  allDispatches,
  registeredVehicles = [],
  initialVehicle = 'all',
  initialDateRange = 'all',
  initialCustomFrom = '',
  initialCustomTo = ''
}) => {
  const todayYmd = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [dateRange, setDateRange] = useState<DateRangeType>(initialDateRange);
  const [customFrom, setCustomFrom] = useState<string>(initialCustomFrom || todayYmd);
  const [customTo, setCustomTo] = useState<string>(initialCustomTo || todayYmd);
  const [dcFilter, setDcFilter] = useState<string>('all');
  const [vehicleFilterType, setVehicleFilterType] = useState<string>(
    initialVehicle !== 'all' ? 'specific' : 'all'
  );
  const [specificVehicle, setSpecificVehicle] = useState<string>(
    initialVehicle !== 'all' ? initialVehicle : ''
  );
  const [reportType, setReportType] = useState<'both' | 'summary' | 'detailed'>('both');
  const [includeCompleteFleet, setIncludeCompleteFleet] = useState<boolean>(true);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isEmailing, setIsEmailing] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string>('');
  const [exportSuccessPath, setExportSuccessPath] = useState<string>('');
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string>('');

  // Extract distinct DCs
  const distinctDcs = useMemo(() => {
    const set = new Set<string>();
    allDispatches.forEach((d) => {
      const dc = (d.dc_no || '').trim();
      if (dc && dc !== 'DRAFT') set.add(dc);
    });
    return Array.from(set).sort();
  }, [allDispatches]);

  // Extract distinct vehicles from dispatches + settings
  const distinctVehicles = useMemo(() => {
    const map = new Map<string, string>(); // vehicleNo -> vehicleSize
    registeredVehicles.forEach((v) => {
      const clean = (v || '').trim().toUpperCase();
      if (clean) map.set(clean, '32 ft');
    });
    allDispatches.forEach((d) => {
      const clean = (d.vehicle_no || '').trim().toUpperCase();
      if (clean) {
        if (!map.has(clean) || d.vehicle_size) {
          map.set(clean, d.vehicle_size || map.get(clean) || '32 ft');
        }
      }
    });
    return Array.from(map.entries()).map(([no, size]) => ({ vehicleNo: no, vehicleSize: size }));
  }, [registeredVehicles, allDispatches]);

  // Compute date range boundaries (YYYY-MM-DD)
  const dateBoundaries = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const endStr = formatYMD(now);

    switch (dateRange) {
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
        const from = customFrom || endStr;
        const to = customTo || endStr;
        return { startStr: from, endStr: to, label: `${from} to ${to}` };
      }
      default:
        return { startStr: '', endStr: '', label: 'All Time' };
    }
  }, [dateRange, customFrom, customTo]);

  // Filter matching dispatches
  const filteredData = useMemo(() => {
    const { startStr, endStr } = dateBoundaries;

    // 1. Filter Dispatches by Date Range
    const matchingDispatches = allDispatches.filter((d) => {
      // Date filter
      if (startStr || endStr) {
        const dYmd = (d.date || '').substring(0, 10);
        if (startStr && dYmd < startStr) return false;
        if (endStr && dYmd > endStr) return false;
      }

      // DC Filter
      if (dcFilter !== 'all') {
        if ((d.dc_no || '').trim() !== dcFilter) return false;
      }

      // Vehicle Filter
      if (vehicleFilterType === '32ft') {
        const sz = (d.vehicle_size || '').toLowerCase();
        if (!sz.includes('32')) return false;
      } else if (vehicleFilterType === '20ft') {
        const sz = (d.vehicle_size || '').toLowerCase();
        if (!sz.includes('20')) return false;
      } else if (vehicleFilterType === '10ft') {
        const sz = (d.vehicle_size || '').toLowerCase();
        if (!sz.includes('10')) return false;
      } else if (vehicleFilterType === 'specific') {
        if (specificVehicle) {
          const vNo = (d.vehicle_no || '').trim().toUpperCase();
          if (vNo !== specificVehicle.trim().toUpperCase()) return false;
        }
      }

      return true;
    });

    // 2. Vehicle Map & Aggregations
    const vehicleMap = new Map<
      string,
      {
        vehicleNo: string;
        vehicleType: string;
        dispatchesCount: number;
        loadedPallets: number;
        availableCapacity: number;
      }
    >();

    // If complete fleet requested, seed with known vehicles that match the vehicle filter
    if (includeCompleteFleet && dcFilter === 'all') {
      distinctVehicles.forEach(({ vehicleNo, vehicleSize }) => {
        let match = true;
        if (vehicleFilterType === '32ft' && !vehicleSize.includes('32')) match = false;
        if (vehicleFilterType === '20ft' && !vehicleSize.includes('20')) match = false;
        if (vehicleFilterType === '10ft' && !vehicleSize.includes('10')) match = false;
        if (vehicleFilterType === 'specific' && specificVehicle && vehicleNo !== specificVehicle.trim().toUpperCase()) {
          match = false;
        }

        if (match) {
          vehicleMap.set(vehicleNo, {
            vehicleNo,
            vehicleType: vehicleSize,
            dispatchesCount: 0,
            loadedPallets: 0,
            availableCapacity: 0
          });
        }
      });
    }

    // Accumulate dispatches
    matchingDispatches.forEach((d) => {
      const vNo = (d.vehicle_no || '').trim().toUpperCase() || 'UNKNOWN';
      const vSize = d.vehicle_size || '32 ft';
      const maxCap = getVehicleMaxPallets(vSize);
      const loaded = Number(d.total_pallets) || 1;

      const existing = vehicleMap.get(vNo) || {
        vehicleNo: vNo,
        vehicleType: vSize,
        dispatchesCount: 0,
        loadedPallets: 0,
        availableCapacity: 0
      };

      existing.dispatchesCount += 1;
      existing.loadedPallets += loaded;
      existing.availableCapacity += maxCap;
      if (d.vehicle_size) existing.vehicleType = d.vehicle_size;

      vehicleMap.set(vNo, existing);
    });

    // Format vehicle rows
    const vehicleRows = Array.from(vehicleMap.values())
      .map((v) => {
        const rawUtil = v.availableCapacity > 0 ? (v.loadedPallets / v.availableCapacity) * 100 : 0;
        return {
          ...v,
          utilizationPct: Number(rawUtil.toFixed(2))
        };
      })
      .sort((a, b) => a.vehicleNo.localeCompare(b.vehicleNo));

    // Vehicle Type Summary (32 ft, 20 ft, 10 ft)
    const typeSummaryMap: Record<
      string,
      { vehicleType: string; totalVehicles: Set<string>; dispatches: number; loadedPallets: number; availableCapacity: number }
    > = {};

    ['32 ft', '20 ft', '10 ft'].forEach((sz) => {
      typeSummaryMap[sz] = {
        vehicleType: sz,
        totalVehicles: new Set<string>(),
        dispatches: 0,
        loadedPallets: 0,
        availableCapacity: 0
      };
    });

    vehicleRows.forEach((v) => {
      const szNorm = v.vehicleType.toLowerCase().includes('20')
        ? '20 ft'
        : v.vehicleType.toLowerCase().includes('10')
        ? '10 ft'
        : '32 ft';

      if (!typeSummaryMap[szNorm]) {
        typeSummaryMap[szNorm] = {
          vehicleType: szNorm,
          totalVehicles: new Set<string>(),
          dispatches: 0,
          loadedPallets: 0,
          availableCapacity: 0
        };
      }

      typeSummaryMap[szNorm].totalVehicles.add(v.vehicleNo);
      typeSummaryMap[szNorm].dispatches += v.dispatchesCount;
      typeSummaryMap[szNorm].loadedPallets += v.loadedPallets;
      typeSummaryMap[szNorm].availableCapacity += v.availableCapacity;
    });

    const vehicleTypeSummary = Object.values(typeSummaryMap).map((t) => {
      const rawUtil = t.availableCapacity > 0 ? (t.loadedPallets / t.availableCapacity) * 100 : 0;
      return {
        vehicleType: t.vehicleType,
        totalVehicles: t.totalVehicles.size,
        dispatches: t.dispatches,
        loadedPallets: t.loadedPallets,
        availableCapacity: t.availableCapacity,
        utilizationPct: Number(rawUtil.toFixed(2))
      };
    });

    // Dispatch Details List
    const dispatchDetails = matchingDispatches.map((d) => {
      const vSize = d.vehicle_size || '32 ft';
      const maxCap = getVehicleMaxPallets(vSize);
      const loaded = Number(d.total_pallets) || 1;
      const rawRatio = (loaded / maxCap) * 100;
      return {
        dcNo: d.dc_no || '-',
        date: d.date ? d.date.replace('T', ' ').slice(0, 19) : '-',
        vehicleNo: (d.vehicle_no || '-').toUpperCase(),
        vehicleSize: vSize,
        supplierName: (d.supplier_name || '-').replace(/[\r\n\t]+/g, ' ').trim(),
        loadedPallets: loaded,
        dispatchCapacity: maxCap,
        loadRatioPct: Number(rawRatio.toFixed(2)),
        status: d.status || 'completed'
      };
    });

    // Overall Totals
    const totalLoaded = matchingDispatches.reduce((acc, d) => acc + (Number(d.total_pallets) || 1), 0);
    const totalCapacity = matchingDispatches.reduce(
      (acc, d) => acc + getVehicleMaxPallets(d.vehicle_size),
      0
    );
    const overallUtil = totalCapacity > 0 ? (totalLoaded / totalCapacity) * 100 : 0;

    return {
      matchingDispatches,
      vehicleRows,
      vehicleTypeSummary,
      dcSummary: [],
      dispatchDetails,
      summary: {
        totalVehicles: vehicleRows.length,
        totalDispatches: matchingDispatches.length,
        totalLoadedPallets: totalLoaded,
        totalAvailableCapacity: totalCapacity,
        fleetUtilizationPct: Number(overallUtil.toFixed(2))
      }
    };
  }, [
    allDispatches,
    distinctVehicles,
    dateBoundaries,
    dcFilter,
    vehicleFilterType,
    specificVehicle,
    includeCompleteFleet
  ]);

  if (!isOpen) return null;

  const handleExport = async () => {
    setExportError('');
    setExportSuccessPath('');

    // Validate Custom Dates
    if (dateRange === 'custom') {
      if (!customFrom || !customTo) {
        setExportError('Please specify both From Date and To Date for custom range.');
        return;
      }
      if (customFrom > customTo) {
        setExportError('From Date cannot be later than To Date.');
        return;
      }
    }

    setIsExporting(true);

    try {
      const options = {
        dateRangeLabel: dateBoundaries.label,
        startDate: dateBoundaries.startStr,
        endDate: dateBoundaries.endStr,
        dcFilter: dcFilter === 'all' ? 'All DCs' : dcFilter,
        vehicleFilter:
          vehicleFilterType === 'all'
            ? 'All Vehicles'
            : vehicleFilterType === '32ft'
            ? '32 ft Vehicles'
            : vehicleFilterType === '20ft'
            ? '20 ft Vehicles'
            : vehicleFilterType === '10ft'
            ? '10 ft Vehicles'
            : `Truck: ${specificVehicle || 'All'}`,
        reportType,
        includeCompleteFleet
      };

      const payload = {
        summary: filteredData.summary,
        vehicleTypeSummary: filteredData.vehicleTypeSummary,
        dcSummary: filteredData.dcSummary,
        vehicles: filteredData.vehicleRows,
        dispatches: filteredData.dispatchDetails
      };

      const res = await printService.exportVehicleUtilizationReport(options, payload);

      if (res && res.success) {
        setExportSuccessPath(res.filePath);
      }
    } catch (err: any) {
      console.error('Vehicle utilization export failed:', err);
      setExportError(err.message || 'Failed to generate PDF report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleEmailReport = async () => {
    setIsEmailing(true);
    setExportError('');
    setEmailSuccessMsg('');
    try {
      const res = await emailService.sendVehicleUtilizationReport({
        dateRange: dateRange === '7days' ? 'last7days' : dateRange === 'all' ? 'all' : 'today',
      });
      if (res.success) {
        setEmailSuccessMsg(res.message);
      } else {
        setExportError(res.message);
      }
    } catch (err: any) {
      setExportError(err.message || 'Failed to email report.');
    } finally {
      setIsEmailing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Export utilization PDF">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-panel max-w-3xl overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-50 grid place-items-center text-brand-700 shrink-0">
              <FileDown size={20} />
            </div>
            <div>
              <h3 className="modal-title flex items-center gap-2">
                <span>Export utilization report</span>
                <span className="badge badge-neutral">
                  A4 landscape PDF
                </span>
              </h3>
              <p className="card-subtitle">
                Pallet capacity, vehicle tables and the dispatch log
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Success Banner */}
          {exportSuccessPath && (
            <div className="alert alert-success flex-col gap-1.5" role="status">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>PDF saved and opened</span>
              </div>
              <p className="text-xs text-slate-600 font-mono break-all pl-6">
                Saved to: {exportSuccessPath}
              </p>
            </div>
          )}

          {/* Email Success Banner */}
          {emailSuccessMsg && (
            <div className="alert alert-success flex-col gap-1" role="status">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Report emailed</span>
              </div>
              <p className="text-xs text-emerald-800 pl-6">
                {emailSuccessMsg}
              </p>
            </div>
          )}

          {/* Error Banner */}
          {exportError && (
            <div className="alert alert-danger items-center text-xs font-bold" role="alert">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          {/* Form Filter Grid */}
          <div className="space-y-4">
            {/* 1. Date Range Filter */}
            <div>
              <label className="field-label flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>Date range</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All time' },
                    { id: '7days', label: 'Past 7 days' },
                    { id: '30days', label: 'Past 30 days' },
                    { id: '3months', label: 'Past 3 months' },
                    { id: '6months', label: 'Past 6 months' },
                    { id: '1year', label: 'Past year' },
                    { id: 'thisMonth', label: 'This month' },
                    { id: 'thisYear', label: 'This year' },
                    { id: 'custom', label: 'Custom' }
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDateRange(opt.id)}
                    aria-pressed={dateRange === opt.id}
                    className={`btn btn-sm ${dateRange === opt.id ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Pickers */}
              {dateRange === 'custom' && (
                <div className="panel p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="field-label">
                      From date
                    </label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="input input-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="field-label">
                      To date
                    </label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="input input-sm font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. DC Filter & Vehicle Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DC Filter */}
              <div>
                <label className="field-label flex items-center gap-1.5">
                  <Filter size={13} className="text-slate-400" />
                  <span>Destination</span>
                </label>
                <select
                  value={dcFilter}
                  onChange={(e) => setDcFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All destinations</option>
                  {distinctDcs.map((dc) => (
                    <option key={dc} value={dc}>
                      {dc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle Filter */}
              <div>
                <label className="field-label flex items-center gap-1.5">
                  <Truck size={13} className="text-slate-400" />
                  <span>Vehicles</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={vehicleFilterType}
                    onChange={(e) => setVehicleFilterType(e.target.value)}
                    className="input"
                  >
                    <option value="all">All vehicles</option>
                    <option value="32ft">32 ft only (16 pallets)</option>
                    <option value="20ft">20 ft only (8 pallets)</option>
                    <option value="10ft">10 ft only (2 pallets)</option>
                    <option value="specific">One vehicle…</option>
                  </select>
                </div>
                {vehicleFilterType === 'specific' && (
                  <div className="pt-1">
                    <select
                      value={specificVehicle}
                      onChange={(e) => setSpecificVehicle(e.target.value)}
                      className="input font-mono"
                    >
                      <option value="">Choose vehicle</option>
                      {distinctVehicles.map((v) => (
                        <option key={v.vehicleNo} value={v.vehicleNo}>
                          {v.vehicleNo} ({v.vehicleSize})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Report Type Selector */}
            <div>
              <label className="field-label flex items-center gap-1.5">
                <Layers size={13} className="text-slate-400" />
                <span>Report contents</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setReportType('both')}
                  aria-pressed={reportType === 'both'}
                  className={`p-3 text-left rounded-lg border transition-colors cursor-pointer space-y-1 ${
                    reportType === 'both' ? 'bg-brand-50 border-brand ring-3 ring-brand/20' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">Summary and dispatches</span>
                    <span className="badge badge-brand">
                      Recommended
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 font-normal">
                    Fleet totals, breakdowns by truck size and destination, and every dispatch.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('summary')}
                  aria-pressed={reportType === 'summary'}
                  className={`p-3 text-left rounded-lg border transition-colors cursor-pointer space-y-1 ${
                    reportType === 'summary' ? 'bg-brand-50 border-brand ring-3 ring-brand/20' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-800 block">Summary only</span>
                  <p className="text-2xs text-slate-500 font-normal">
                    Fleet totals and breakdowns by truck size, destination and vehicle.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('detailed')}
                  aria-pressed={reportType === 'detailed'}
                  className={`p-3 text-left rounded-lg border transition-colors cursor-pointer space-y-1 ${
                    reportType === 'detailed' ? 'bg-brand-50 border-brand ring-3 ring-brand/20' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-bold text-slate-800 block">Dispatches only</span>
                  <p className="text-2xs text-slate-500 font-normal">
                    Headline totals followed by every dispatch with its load ratio.
                  </p>
                </button>
              </div>
            </div>

            {/* 4. Complete Fleet Toggle */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="includeCompleteFleet"
                type="checkbox"
                checked={includeCompleteFleet}
                onChange={(e) => setIncludeCompleteFleet(e.target.checked)}
                className="w-4 h-4 accent-brand-hover cursor-pointer shrink-0"
              />
              <label
                htmlFor="includeCompleteFleet"
                className="text-sm text-slate-700 cursor-pointer"
              >
                Include vehicles with no dispatches in this period
              </label>
            </div>
          </div>

          {/* Live Preview Stats Box */}
          <div className="panel space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-700">
              <span>Preview</span>
              <span className="text-slate-500 font-normal">{dateBoundaries.label}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="meta-label">Vehicles</span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {filteredData.summary.totalVehicles}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="meta-label">Dispatches</span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {filteredData.summary.totalDispatches}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="meta-label">Pallets loaded</span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {filteredData.summary.totalLoadedPallets.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="meta-label">Capacity</span>
                <span className="text-base font-black text-slate-900 tabular-nums">
                  {filteredData.summary.totalAvailableCapacity.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
                <span className="meta-label">Utilization</span>
                <span
                  className={`text-base font-black tabular-nums ${
                    filteredData.summary.fleetUtilizationPct > 100
                      ? 'text-rose-600'
                      : filteredData.summary.fleetUtilizationPct >= 80
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {filteredData.summary.fleetUtilizationPct.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEmailReport}
              disabled={isEmailing || isExporting}
              className="btn btn-secondary"
              title="Email utilization report to configured recipients from noreply@stivate.com"
            >
              {isEmailing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Sending…</span>
                </>
              ) : (
                <>
                  <Mail size={14} />
                  <span>Email to recipients</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting || isEmailing}
              className="btn btn-primary"
            >
              {isExporting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <FileDown size={15} />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
