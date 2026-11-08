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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading && filteredDispatches.length === 0 ? (
            <div className="empty-state">
              Loading dispatches…
            </div>
          ) : filteredDispatches.length === 0 ? (
            <div className="empty-state">
              No completed dispatches match these filters.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>DC number</th>
                  <th>Destination</th>
                  <th>Date &amp; time</th>
                  <th>Vehicle</th>
                  <th>Supervisor</th>
                  <th className="text-right">Pull lists</th>
                  <th className="text-right">Parts</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDispatches.map((d) => (
                  <tr key={d.id}>
                    <td className="whitespace-nowrap font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{d.dc_no}</span>
                        {d.id && recentCompletedIds.includes(d.id) && (
                          <span className="badge badge-neutral font-sans" title="One of the last 5 completed DCs, still editable">
                            Editable
                          </span>
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
                    <td className="whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span>{formatDateTimeDisplay(d.date)}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap font-bold text-slate-800 uppercase">
                      {d.vehicle_no}
                    </td>
                    <td className="whitespace-nowrap text-slate-600">
                      {d.supplier_name}
                    </td>
                    <td className="whitespace-nowrap text-right tabular-nums">
                      {d.total_pull_lists ?? 0}
                    </td>
                    <td className="whitespace-nowrap text-right font-bold text-slate-800 tabular-nums">
                      {d.total_parts}
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-0.5">
                        {/* View Action */}
                        <button
                          onClick={() => d.id && onViewDetails(d.id)}
                          title="View items"
                          className="btn btn-ghost btn-sm btn-icon"
                          aria-label="View details"
                        >
                          <Eye size={15} />
                        </button>
                        {/* Quick Copy for Mail Action */}
                        <button
                          onClick={() => d.id && onQuickCopyRow(d)}
                          title="Copy pull lists for email (with DC Number)"
                          className={`btn btn-ghost btn-sm btn-icon ${copiedRowId === d.id ? 'text-emerald-600!' : ''}`}
                          aria-label="Copy pull lists for email"
                        >
                          {copiedRowId === d.id ? <Check size={15} strokeWidth={3} /> : <Copy size={15} />}
                        </button>
                        {/* Print Challan Action */}
                        <button
                          onClick={() => onPrintChallan(d)}
                          title="Print Challan PDF"
                          className="btn btn-ghost btn-sm btn-icon"
                          aria-label="Print challan"
                        >
                          <Printer size={15} />
                        </button>
                        {/* Edit Action - Allowed for last 5 completed DCs or non-completed */}
                        {((d.status !== 'completed') || (d.id && recentCompletedIds.includes(d.id))) && (
                          <button
                            onClick={() => d.id && onEditDispatch?.(d.id)}
                            title={d.status === 'completed' ? "Edit completed DC (Allowed for last 5 completed DCs)" : "Edit dispatch"}
                            className="btn btn-ghost btn-sm btn-icon"
                            aria-label="Edit dispatch"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {/* Delete Action - Allowed for last 5 completed DCs or non-completed */}
                        {((d.status !== 'completed') || (d.id && recentCompletedIds.includes(d.id))) && (
                          <button
                            onClick={() => d.id && onDeleteConfirm(d.id)}
                            title={d.status === 'completed' ? "Delete completed DC (Allowed for last 5 completed DCs)" : "Delete dispatch"}
                            className="btn btn-ghost btn-sm btn-icon hover:text-rose-600! hover:bg-rose-50!"
                            aria-label="Delete dispatch"
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
        <div ref={lastElementRef} className="flex justify-center py-6 text-xs text-slate-500">
          {loadingMore ? 'Loading more…' : 'Scroll down to load more'}
        </div>
      )}
    </>
  );
};
