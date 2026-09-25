import React from 'react';
import { MapPin, Package, Eye, Trash2 } from 'lucide-react';
import type { Dispatch } from '../../types';
import { getVehicleMaxPallets } from '../../types';

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
        <div className="py-12 text-center text-sm text-slate-400 font-medium">
          Loading active pipeline...
        </div>
      ) : activeDispatchesCount === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400 font-medium">
          No active shipments in pipeline. Create a new dispatch to begin loading.
        </div>
      ) : filteredDispatches.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <p className="text-sm text-slate-500 font-medium">
            No active dispatches match your search query "{searchQuery}".
          </p>
          <button
            onClick={onClearSearch}
            className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
          >
            Clear all search filters
          </button>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">DC Number</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Destination Address</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle No</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Supervisor</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pull List Progress</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-36">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="w-[74px] text-center">Actions</span>
                  <span className="w-[29px] shrink-0"></span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredDispatches.map((d) => {
              const loaded = d.loadedCount;
              const total = d.totalPullLists || 0;
              const progressPct = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

              return (
                <tr key={d.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-800">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{d.dc_no}</span>
                      {Boolean(d.is_empty_pallets) && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
                          Empty Return
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 max-w-[220px]">
                    <div
                      className="font-bold text-slate-800 line-clamp-1 truncate flex items-center gap-1.5"
                      title={d.address || 'No destination address specified'}
                    >
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{d.address ? d.address.split('\n')[0] : '-'}</span>
                    </div>
                    {d.address && d.address.includes('\n') && (
                      <div className="text-[10px] text-slate-400 truncate mt-0.5" title={d.address}>
                        {d.address.split('\n').slice(1).join(' ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <div className="font-extrabold uppercase text-slate-800">{d.vehicle_no}</div>
                    {(() => {
                      const vSize = d.vehicle_size || '32 ft';
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
                          <span className={rawPct > 100 ? 'text-rose-600 font-extrabold' : 'text-slate-500 font-bold'}>
                            {curP}/{maxP} Pallets ({utilPct}%)
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                    {d.supplier_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-semibold w-64">
                    {Boolean(d.is_empty_pallets) ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold font-mono">
                        <Package size={13} className="text-amber-700" />
                        <span>Empty Return ({d.total_pallets || 1} Pallets)</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-w-[200px]">
                        <div className="flex justify-between text-xs font-mono">
                          <span>{loaded} / {total}</span>
                          <span className="font-bold text-slate-500">{progressPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className="bg-[#4BB8FA] h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      d.status === 'ready'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {d.status === 'ready' ? 'Ready' : 'Loading'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => d.id && onEditDispatch(d.id)}
                        className="inline-flex items-center justify-center gap-1.5 w-[74px] py-1.5 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="Open / Edit Dispatch"
                      >
                        <Eye size={13} />
                        <span>Open</span>
                      </button>
                      <button
                        onClick={() => {
                          if (d.id) {
                            onDeleteClick({ id: d.id, dc_no: d.dc_no });
                          }
                        }}
                        className="inline-flex items-center justify-center w-[29px] h-[29px] p-1.5 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="Delete Dispatch"
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
