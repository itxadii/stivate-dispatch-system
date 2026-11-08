import React from 'react';
import { ArrowRight, Eye, Pencil } from 'lucide-react';
import type { Dispatch } from '../../types';
import { getVehicleMaxPallets } from '../../types';
import { StatusBadge, CardHeader } from '../ui';

interface RecentDispatchesTableProps {
  loading: boolean;
  recentDispatches: Dispatch[];
  recentCompletedIds: number[];
  setActiveTab: (tab: string) => void;
  onEditDispatch: (id: number) => void;
  onViewDetails: (id: number) => void;
  formatDateTimeDisplay: (dateStr: string) => string;
}

export const RecentDispatchesTable: React.FC<RecentDispatchesTableProps> = ({
  loading,
  recentDispatches,
  recentCompletedIds,
  setActiveTab,
  onEditDispatch,
  onViewDetails,
  formatDateTimeDisplay,
}) => {
  return (
    <div className="card overflow-hidden">
      <CardHeader
        title="Recent dispatches"
        subtitle="The latest challans created in this warehouse"
        actions={
          <button onClick={() => setActiveTab('completed')} className="btn btn-secondary btn-sm">
            <span>View all</span>
            <ArrowRight size={14} />
          </button>
        }
      />

      <div className="overflow-x-auto">
        {loading ? (
          <div className="empty-state">Loading recent dispatches…</div>
        ) : recentDispatches.length === 0 ? (
          <div className="empty-state">No dispatches yet. Create one from the dispatch pipeline to get started.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>DC number</th>
                <th>Date &amp; time</th>
                <th>Status</th>
                <th>Vehicle</th>
                <th>Supervisor</th>
                <th className="text-right!">Parts</th>
                <th className="text-right! w-24">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentDispatches.map((d) => {
                const isCompleted = d.status === 'completed';
                const isRecentCompleted = Boolean(d.id && recentCompletedIds.includes(d.id));
                const canEdit = !isCompleted || isRecentCompleted;
                const vSize = (d as any).vehicle_size || '32 ft';
                const maxP = getVehicleMaxPallets(vSize);
                const curP = d.total_pallets || 1;
                const rawPct = (curP / maxP) * 100;
                const utilPct = rawPct % 1 === 0 ? rawPct.toFixed(0) : rawPct.toFixed(2);

                return (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => d.id && onViewDetails(d.id)}
                          className="font-mono font-bold text-slate-900 hover:text-brand-700 hover:underline underline-offset-2 cursor-pointer text-left"
                          title="View details"
                        >
                          {d.dc_no}
                        </button>
                        {Boolean(d.is_empty_pallets) && <span className="badge badge-warning">Empty return</span>}
                        {isRecentCompleted && (
                          <span className="badge badge-neutral" title="One of the 5 most recent completed DCs, still editable">
                            Editable
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-slate-600">{formatDateTimeDisplay(d.date)}</td>
                    <td className="whitespace-nowrap"><StatusBadge status={d.status} /></td>
                    <td className="whitespace-nowrap">
                      <div className="font-bold text-slate-800 uppercase">{d.vehicle_no}</div>
                      <div className="flex items-center gap-1.5 mt-1 text-2xs text-slate-500 tabular-nums">
                        <span className="tag">{vSize}</span>
                        {!d.is_empty_pallets && <span>{curP}/{maxP} pallets ({utilPct}%)</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap text-slate-600">{d.supplier_name}</td>
                    <td className="whitespace-nowrap text-right font-mono font-bold text-slate-800 tabular-nums">{d.total_parts}</td>
                    <td className="whitespace-nowrap text-right">
                      {canEdit ? (
                        <button
                          onClick={() => d.id && onEditDispatch(d.id)}
                          className="btn btn-secondary btn-sm"
                          title={isCompleted ? 'Edit recent completed DC (allowed for the last 5)' : 'Edit dispatch'}
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => d.id && onViewDetails(d.id)}
                          className="btn btn-ghost btn-sm"
                          title="Archived dispatch (view only)"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
