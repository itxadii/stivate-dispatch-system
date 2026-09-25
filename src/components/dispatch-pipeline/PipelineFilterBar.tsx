import React from 'react';
import { Plus, Search, X, User } from 'lucide-react';

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
    <div className="p-5 border-b border-slate-100 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-md font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <span>Active Dispatch Pipeline</span>
            <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-full border border-blue-100">
              {filteredCount} {filteredCount === 1 ? 'Dispatch' : 'Dispatches'}
            </span>
          </h3>
          <p className="text-xs text-slate-400">Manage, edit, scan, and print loading or ready shipments</p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#4BB8FA] hover:bg-[#35a0dc] text-slate-900 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={15} />
          <span>Create New Dispatch</span>
        </button>
      </div>

      {/* Search, Supervisor & Status Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Vehicle No, DC No, Supervisor Name, Address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4BB8FA] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Supervisor Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <User size={14} className="text-slate-400" />
            <select
              value={selectedSupervisor}
              onChange={(e) => setSelectedSupervisor(e.target.value)}
              className="bg-transparent border-none text-xs focus:outline-none text-slate-700 font-bold cursor-pointer"
            >
              <option value="all">All Supervisors</option>
              {supervisorList.map((sup, idx) => (
                <option key={idx} value={sup}>{sup}</option>
              ))}
            </select>
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
            {(['all', 'loading', 'ready'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all capitalize cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
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
              className="text-xs text-rose-600 font-bold hover:underline px-2 py-1 cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
