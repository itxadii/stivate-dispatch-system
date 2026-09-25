import React from 'react';
import type { Dispatch } from '../../types';
import { Printer, Eye, Trash2, Calendar, Copy, Check, MapPin, Pencil } from 'lucide-react';

export const formatDateTimeDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const norm = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const dObj = new Date(norm);
    if (!isNaN(dObj.getTime())) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let hours = dObj.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mins = String(dObj.getMinutes()).padStart(2, '0');
      return `${dObj.getDate()}-${months[dObj.getMonth()]}-${dObj.getFullYear().toString().slice(-2)} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    }
  } catch (e) {}
  return dateStr;
};

interface HistoryTableProps {
  loading: boolean;
  filteredDispatches: Dispatch[];
  recentCompletedIds: number[];
  copiedRowId: number | null;
  onViewDetails: (id: number) => void;
  onQuickCopyRow: (dispatch: Dispatch) => void;
  onPrintChallan: (dispatch: Dispatch) => void;
  onEditDispatch?: (id: number) => void;
  onDeleteConfirm: (id: number) => void;
  hasMore: boolean;
  dispatchesCount: number;
  loadingMore: boolean;
  lastElementRef: (node: HTMLDivElement | null) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  loading,
  filteredDispatches,
  recentCompletedIds,
  copiedRowId,
  onViewDetails,
  onQuickCopyRow,
  onPrintChallan,
  onEditDispatch,
  onDeleteConfirm,
  hasMore,
  dispatchesCount,
  loadingMore,
  lastElementRef,
}) => {
  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading && filteredDispatches.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 font-medium">
              Loading dispatches...
            </div>
          ) : filteredDispatches.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400 font-medium">
              No matching completed dispatches found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">DC Number</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Destination Address</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle No</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-36">Total Pull Lists</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-28">Total Parts</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredDispatches.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors duration-100">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{d.dc_no}</span>
                        {d.id && recentCompletedIds.includes(d.id) && (
                          <span className="px-1.5 py-0.5 text-[10px] font-sans font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded tracking-tight" title="Editable (One of the last 5 completed DCs)">
                            Editable
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span>{formatDateTimeDisplay(d.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-bold uppercase">
                      {d.vehicle_no}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                      {d.supplier_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-800 text-right font-medium">
                      {d.total_pull_lists ?? 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-800 text-right font-bold">
                      {d.total_parts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Action */}
                        <button
                          onClick={() => d.id && onViewDetails(d.id)}
                          title="View items"
                          className="p-1 rounded text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 transition-colors duration-150 cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>
                        {/* Quick Copy for Mail Action */}
                        <button
                          onClick={() => d.id && onQuickCopyRow(d)}
                          title="Copy pull lists for email (with DC Number)"
                          className={`p-1 rounded transition-colors duration-150 cursor-pointer ${
                            copiedRowId === d.id
                              ? 'text-emerald-600 bg-emerald-50'
                              : 'text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                          }`}
                        >
                          {copiedRowId === d.id ? <Check size={15} className="stroke-[3]" /> : <Copy size={15} />}
                        </button>
                        {/* Print Challan Action */}
                        <button
                          onClick={() => onPrintChallan(d)}
                          title="Print Challan PDF"
                          className="p-1 rounded text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors duration-150 cursor-pointer"
                        >
                          <Printer size={15} />
                        </button>
                        {/* Edit Action - Allowed for last 5 completed DCs or non-completed */}
                        {((d.status !== 'completed') || (d.id && recentCompletedIds.includes(d.id))) && (
                          <button
                            onClick={() => d.id && onEditDispatch?.(d.id)}
                            title={d.status === 'completed' ? "Edit completed DC (Allowed for last 5 completed DCs)" : "Edit dispatch"}
                            className="p-1 rounded text-amber-600 hover:bg-amber-50 hover:text-amber-800 transition-colors duration-150 cursor-pointer"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {/* Delete Action - Allowed for last 5 completed DCs or non-completed */}
                        {((d.status !== 'completed') || (d.id && recentCompletedIds.includes(d.id))) && (
                          <button
                            onClick={() => d.id && onDeleteConfirm(d.id)}
                            title={d.status === 'completed' ? "Delete completed DC (Allowed for last 5 completed DCs)" : "Delete dispatch"}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 hover:text-rose-800 transition-colors duration-150 cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {hasMore && dispatchesCount > 0 && (
        <div ref={lastElementRef} className="flex justify-center py-6 text-xs text-slate-400 font-bold uppercase tracking-wider">
          {loadingMore ? 'Loading more dispatches...' : 'Scroll down to load more'}
        </div>
      )}
    </>
  );
};
