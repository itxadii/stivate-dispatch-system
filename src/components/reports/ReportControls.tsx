import React from 'react';
import { MapPin, Calendar, Download } from 'lucide-react';

export type ReportType = 'loading-summary' | 'daily' | 'monthly' | 'vehicle' | 'supplier';

interface ReportControlsProps {
  reportType: ReportType;
  setReportType: (t: ReportType) => void;
  selectedDestination: string;
  setSelectedDestination: (dest: string) => void;
  destinations: string[];
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  onExportExcel: () => void;
  hasData: boolean;
}

export const ReportControls: React.FC<ReportControlsProps> = ({
  reportType,
  setReportType,
  selectedDestination,
  setSelectedDestination,
  destinations,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onExportExcel,
  hasData,
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['loading-summary', 'daily', 'monthly', 'vehicle', 'supplier'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setReportType(t)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 uppercase tracking-wide cursor-pointer ${
              reportType === t
                ? 'bg-[#4BB8FA] text-slate-900 shadow-none'
                : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t === 'loading-summary' ? 'Loading Summary' : t === 'supplier' ? 'Supervisor Wise' : `${t} Wise`}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {reportType === 'loading-summary' && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <MapPin size={14} className="text-slate-400" />
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">All Destinations</option>
              {destinations.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none text-slate-700 font-semibold"
          />
        </div>
        <span className="text-xs font-bold text-slate-400">to</span>
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5">
          <Calendar size={14} className="text-slate-400" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none text-slate-700 font-semibold"
          />
        </div>

        <button
          onClick={onExportExcel}
          disabled={!hasData}
          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm"
        >
          <Download size={14} />
          <span>Export to Excel</span>
        </button>
      </div>
    </div>
  );
};
