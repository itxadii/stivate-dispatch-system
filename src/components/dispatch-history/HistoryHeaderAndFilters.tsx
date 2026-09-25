import React from 'react';
import { SearchBox } from '../SearchBox';
import { Download } from 'lucide-react';
import type { AppSettings, Dispatch } from '../../types';

interface HistoryHeaderAndFiltersProps {
  searchQuery: string;
  onSearch: (val: string) => void;
  filteredDispatches: Dispatch[];
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  vehicleFilter: string;
  onVehicleFilterChange: (val: string) => void;
  supervisorFilter: string;
  onSupervisorFilterChange: (val: string) => void;
  settings: AppSettings | null;
  onExportCSV: () => void;
}

export const HistoryHeaderAndFilters: React.FC<HistoryHeaderAndFiltersProps> = ({
  searchQuery,
  onSearch,
  filteredDispatches,
  dateFilter,
  onDateFilterChange,
  vehicleFilter,
  onVehicleFilterChange,
  supervisorFilter,
  onSupervisorFilterChange,
  settings,
  onExportCSV,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-md font-bold text-slate-800 uppercase tracking-wide">Completed Dispatches</h3>
          <p className="text-xs text-slate-400">Search, view, and export finalized delivery invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchBox
            value={searchQuery}
            onChange={onSearch}
            placeholder="Search by DC, Pull List..."
          />
          <button
            onClick={onExportCSV}
            disabled={filteredDispatches.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 shrink-0"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        {/* Date Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Filter by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white text-slate-700 font-medium"
          />
        </div>

        {/* Vehicle Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Filter by Vehicle No</label>
          <input
            type="text"
            placeholder="e.g. MH-12..."
            list="vehicles-archive-datalist"
            value={vehicleFilter}
            onChange={(e) => onVehicleFilterChange(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white uppercase font-bold text-slate-700"
          />
          <datalist id="vehicles-archive-datalist">
            {(settings?.vehiclesList || []).map((opt, i) => (
              <option key={i} value={opt} />
            ))}
          </datalist>
        </div>

        {/* Supervisor Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Filter by Supervisor</label>
          <select
            value={supervisorFilter}
            onChange={(e) => onSupervisorFilterChange(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:bg-white cursor-pointer text-slate-700 font-medium"
          >
            <option value="">-- All Supervisors --</option>
            {(settings?.suppliersList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
