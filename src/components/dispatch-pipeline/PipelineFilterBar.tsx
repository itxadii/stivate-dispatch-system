import React from 'react';
import { Plus, Search, X, User } from 'lucide-react';
import { CardHeader } from '../ui';

interface PipelineFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: 'all' | 'loading' | 'ready';
  setStatusFilter: (st: 'all' | 'loading' | 'ready') => void;
  selectedSupervisor: string;
  setSelectedSupervisor: (sup: string) => void;
  supervisorList: string[];
  filteredCount: number;
  onOpenNewModal: () => void;
}

export const PipelineFilterBar: React.FC<PipelineFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedSupervisor,
  setSelectedSupervisor,
  supervisorList,
  filteredCount,
  onOpenNewModal,
}) => {
  return (
    <div className="border-b border-slate-100">
      <CardHeader
        className="border-b-0 pb-0"
        title={
          <span className="flex items-center gap-2">
            Active dispatches
            <span className="badge badge-brand">{filteredCount}</span>
          </span>
        }
        subtitle="Trucks that are loading or ready to leave"
        actions={
          <button onClick={onOpenNewModal} className="btn btn-primary">
            <Plus size={16} />
            <span>New dispatch</span>
          </button>
        }
      />

      {/* Search, Supervisor & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search DC, vehicle, supervisor or address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 btn btn-ghost h-6 w-6 px-0 rounded-md"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Supervisor Filter Dropdown */}
          <div className="relative">
            <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="input w-auto pl-8"
              aria-label="Supervisor"
            >
              <option value="all">All supervisors</option>
              {supervisorList.map((sup, idx) => (
                <option key={idx} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Pills */}
          <div className="segmented" role="group" aria-label="Status">
            {(['all', 'loading', 'ready'] as const).map((st) => (
              <button key={st} onClick={() => setStatusFilter(st)} aria-pressed={statusFilter === st}>
                {st === 'all' ? 'All' : st === 'loading' ? 'Loading' : 'Ready'}
              </button>
            ))}
          </div>

          {(searchQuery || statusFilter !== 'all' || selectedSupervisor !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSelectedSupervisor('all');
              }}
              className="btn btn-ghost btn-sm"
            >
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
