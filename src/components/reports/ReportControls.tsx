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
    <div className="card p-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
      <div className="segmented flex-wrap self-start" role="group" aria-label="Report type">
        {(['loading-summary', 'daily', 'monthly', 'vehicle', 'supplier'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setReportType(t)}
            aria-pressed={reportType === t}
            className="h-8! px-3.5!"
          >
            {{ 'loading-summary': 'Loading summary', daily: 'By day', monthly: 'By month', vehicle: 'By vehicle', supplier: 'By supervisor' }[t]}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {reportType === 'loading-summary' && (
          <div className="relative">
            <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="input w-auto pl-8"
              aria-label="Destination"
            >
              <option value="ALL">All destinations</option>
              {destinations.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-slate-400 shrink-0" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input w-auto"
            aria-label="From date"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input w-auto"
            aria-label="To date"
          />
        </div>

        <button
          onClick={onExportExcel}
          disabled={!hasData}
          className="btn btn-secondary"
        >
          <Download size={14} />
          <span>Export Excel</span>
        </button>
      </div>
    </div>
  );
};
