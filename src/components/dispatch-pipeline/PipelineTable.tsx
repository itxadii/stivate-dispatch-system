import React from 'react';
import { MapPin, Package, Eye, Trash2 } from 'lucide-react';
import type { Dispatch } from '../../types';
import { getVehicleMaxPallets } from '../../types';
import { StatusBadge } from '../ui';

interface PipelineTableProps {
  loading: boolean;
  activeDispatchesCount: number;
  filteredDispatches: (Dispatch & { loadedCount: number; totalPullLists?: number })[];
  searchQuery: string;
  onClearSearch: () => void;
  onEditDispatch: (id: number) => void;
  onDeleteClick: (target: { id: number; dc_no: string }) => void;
}

export const PipelineTable: React.FC<PipelineTableProps> = ({
  loading,
  activeDispatchesCount,
  filteredDispatches,
  searchQuery,
  onClearSearch,
  onEditDispatch,
  onDeleteClick,
}) => {
  return (
    <div className="overflow-x-auto">
      {loading && activeDispatchesCount === 0 ? (
        <div className="empty-state">
          Loading active dispatches…
        </div>
      ) : activeDispatchesCount === 0 ? (
        <div className="empty-state">
          No trucks are loading right now. Create a new dispatch to start loading.
        </div>
      ) : filteredDispatches.length === 0 ? (
        <div className="empty-state space-y-3">
          <p>No active dispatches match {searchQuery ? <>"{searchQuery}"</> : 'these filters'}.</p>
          <button onClick={onClearSearch} className="btn btn-secondary btn-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>DC number</th>
              <th>Destination</th>
              <th>Vehicle</th>
              <th>Supervisor</th>
              <th>Pull lists loaded</th>
              <th>Status</th>
              <th className="text-right w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDispatches.map((d) => {
              const loaded = d.loadedCount;
              const total = d.totalPullLists || 0;
              const progressPct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

              return (
                <tr key={d.id}>
                  <td className="whitespace-nowrap font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{d.dc_no}</span>
                      {Boolean(d.is_empty_pallets) && (
                        <span className="badge badge-warning font-sans">Empty return</span>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[240px]">
                    <div
                      className="font-bold text-slate-800 flex items-center gap-1.5 min-w-0"
                      title={d.address || 'No destination address specified'}
                    >
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{d.address ? d.address.split('\n')[0] : '-'}</span>
                    </div>
                    {d.address && d.address.includes('\n') && (
                      <div className="text-2xs text-slate-400 truncate mt-0.5" title={d.address}>
                        {d.address.split('\n').slice(1).join(' ')}
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="font-bold uppercase text-slate-800">{d.vehicle_no}</div>
                    {(() => {
                      const vSize = d.vehicle_size || '32 ft';
                      const maxP = getVehicleMaxPallets(vSize);
                      const curP = d.total_pallets || 1;
                      const rawPct = (curP / maxP) * 100;
                      const utilPct = rawPct % 1 === 0 ? rawPct.toFixed(0) : rawPct.toFixed(2);
                      if (d.is_empty_pallets) {
                        return (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="tag">{vSize}</span>
                          </div>
                        );
                      }
                      return (
                        <div className="flex items-center gap-1.5 mt-1 text-2xs tabular-nums">
                          <span className="tag">{vSize}</span>
                          <span className={rawPct > 100 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                            {curP}/{maxP} pallets ({utilPct}%)
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="whitespace-nowrap text-slate-600">
                    {d.supplier_name}
                  </td>
                  <td className="whitespace-nowrap w-56">
                    {Boolean(d.is_empty_pallets) ? (
                      <span className="badge badge-warning">
                        <Package size={12} />
                        Empty return, {d.total_pallets || 1} pallets
                      </span>
                    ) : (
                      <div className="space-y-1.5 max-w-[200px]">
                        <div className="flex justify-between text-xs tabular-nums">
                          <span className="font-bold text-slate-700">{loaded} of {total}</span>
                          <span className="font-bold text-slate-500">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-brand h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap"><StatusBadge status={d.status} /></td>
                  <td className="whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => d.id && onEditDispatch(d.id)}
                        className="btn btn-secondary btn-sm"
                        title="Open dispatch"
                      >
                        <Eye size={14} />
                        <span>Open</span>
                      </button>
                      <button
                        onClick={() => {
                          if (d.id) {
                            onDeleteClick({ id: d.id, dc_no: d.dc_no });
                          }
                        }}
                        className="btn btn-danger-soft btn-sm btn-icon"
                        title="Delete dispatch"
                        aria-label={`Delete dispatch ${d.dc_no}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};
