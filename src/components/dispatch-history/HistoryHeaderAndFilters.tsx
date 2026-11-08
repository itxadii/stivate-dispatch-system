import React from 'react';
import { SearchBox } from '../SearchBox';
import { Download } from 'lucide-react';
import { CardHeader } from '../ui';
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
    <div className="card">
      <CardHeader
        title="Completed dispatches"
        subtitle="Search, reprint and export dispatched challans"
        actions={
          <>
            <SearchBox value={searchQuery} onChange={onSearch} placeholder="Search DC or pull list" />
            <button
              onClick={onExportCSV}
              disabled={filteredDispatches.length === 0}
              className="btn btn-secondary shrink-0"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </>
        }
      />

      {/* Filters Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 card-body">
        {/* Date Filter */}
        <div>
          <label className="field-label">Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="input"
          />
        </div>

        {/* Vehicle Filter */}
        <div>
          <label className="field-label">Vehicle number</label>
          <input
            type="text"
            placeholder="e.g. MH12"
            list="vehicles-archive-datalist"
            value={vehicleFilter}
            onChange={(e) => onVehicleFilterChange(e.target.value)}
            className="input uppercase"
          />
          <datalist id="vehicles-archive-datalist">
            {(settings?.vehiclesList || []).map((opt, i) => (
              <option key={i} value={opt} />
            ))}
          </datalist>
        </div>

        {/* Supervisor Filter */}
        <div>
          <label className="field-label">Supervisor</label>
          <select
            value={supervisorFilter}
            onChange={(e) => onSupervisorFilterChange(e.target.value)}
            className="input"
          >
            <option value="">All supervisors</option>
            {(settings?.suppliersList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
