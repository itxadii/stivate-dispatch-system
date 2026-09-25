import React from 'react';
import { ArrowRight, Eye } from 'lucide-react';
import type { Dispatch } from '../../types';
import { getVehicleMaxPallets } from '../../types';

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Recent Dispatches</h4>
        <button
          onClick={() => setActiveTab('completed')}
          className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors duration-150 cursor-pointer"
        >
          <span>See All Dispatches</span>
          <ArrowRight size={13} />
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400 font-medium">
            Loading recent dispatches...
          </div>
        ) : recentDispatches.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400 font-medium">
            No dispatches created yet. Click "New Dispatch" to start!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">DC Number</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle No</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Supervisor</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Total Parts</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {recentDispatches.map((d) => {
                const isCompleted = d.status === 'completed';
                const isRecentCompleted = Boolean(d.id && recentCompletedIds.includes(d.id));
                const canEdit = !isCompleted || isRecentCompleted;

                return (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => d.id && onViewDetails(d.id)}
                          className="hover:text-emerald-600 hover:underline cursor-pointer font-bold transition-colors text-left"
                          title="Click to view details"
                        >
                          {d.dc_no}
                        </button>
                        {Boolean(d.is_empty_pallets) && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                            Empty
                          </span>
                        )}
                        {isRecentCompleted && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-sans font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Editable (Recent 5 completed DC)">
                            Editable
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {formatDateTimeDisplay(d.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        d.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : d.status === 'ready'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {d.status === 'completed' ? 'Completed' : d.status === 'ready' ? 'Ready' : 'Loading'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <div className="font-bold text-slate-800 uppercase">{d.vehicle_no}</div>
                      {(() => {
                        const vSize = (d as any).vehicle_size || '32 ft';
                        const maxP = getVehicleMaxPallets(vSize);
                        const curP = d.total_pallets || 1;
                        const rawPct = (curP / maxP) * 100;
                        const utilPct = rawPct % 1 === 0 ? rawPct.toFixed(0) : rawPct.toFixed(2);
                        if (d.is_empty_pallets) {
                          return (
                            <div className="text-[10px] font-semibold text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{vSize}</span>
                            </div>
                          );
                        }
                        return (
                          <div className="text-[10px] font-semibold text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{vSize}</span>
                            <span>{curP}/{maxP} ({utilPct}%)</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {d.supplier_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-800 text-right font-bold">
                      {d.total_parts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      {canEdit ? (
                        <button
                          onClick={() => d.id && onEditDispatch(d.id)}
                          className="text-emerald-600 hover:text-emerald-900 transition-colors duration-100 cursor-pointer font-bold text-xs"
                          title={d.status === 'completed' ? "Edit recent completed DC (Allowed for last 5 completed DCs)" : "Edit dispatch"}
                        >
                          Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => d.id && onViewDetails(d.id)}
                          className="text-slate-500 hover:text-slate-800 transition-colors duration-100 cursor-pointer font-semibold text-xs flex items-center justify-center gap-1 mx-auto"
                          title="Archived dispatch (View only)"
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
