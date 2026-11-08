import React from 'react';
import { Trash2, Check } from 'lucide-react';
import type { DispatchItem } from '../types';

interface DispatchTableProps {
  items: DispatchItem[];
  onRemoveItem?: (index: number) => void;
  onToggleVerify?: (index: number) => void;
  readOnly?: boolean;
}

export const DispatchTable: React.FC<DispatchTableProps> = ({
  items,
  onRemoveItem,
  onToggleVerify,
  readOnly = false
}) => {
  const showActions = !readOnly && (Boolean(onRemoveItem) || Boolean(onToggleVerify));

  return (
    <div className="overflow-x-auto w-full">
      <table className="table">
        <thead>
          <tr>
            <th className="w-16">
              #
            </th>
            <th>
              ID number
            </th>
            <th>
              Pull list number
            </th>
            <th>
              Kit type
            </th>
            <th>
              Workcell
            </th>
            <th className="text-right w-32">
              Parts
            </th>
            {showActions && (
              <th className="text-center w-44">
                <div className="inline-flex items-center justify-center gap-2">
                  <span className="w-24 text-center">Action</span>
                  {onRemoveItem && <span className="w-7"></span>}
                </div>
              </th>
            )}
            {readOnly && (
              <th className="text-center w-28">
                Status
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={showActions || readOnly ? 7 : 6}
                className="empty-state"
              >
                No pull lists yet. Scan or type a pull list number above.
              </td>
            </tr>
          ) : (
            items.map((item, idx) => {
              const isVerified = !item.pull_list_no.endsWith('_pending');
              const displayPullList = item.pull_list_no.replace(/_pending$/, '');

              return (
                <tr
                  key={idx}
                  className={isVerified ? '' : 'bg-amber-50/40'}
                >
                  <td className="font-mono text-slate-400 tabular-nums">
                    {idx + 1}
                  </td>
                  <td className="font-mono text-slate-700">
                    {item.id_number || <span className="text-slate-400 font-normal">-</span>}
                  </td>
                  <td className="font-mono font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{displayPullList}</span>
                      {isVerified ? (
                        <span className="grid place-items-center w-4 h-4 rounded-full bg-emerald-100 text-emerald-700" title="Verified">
                          <Check size={10} strokeWidth={3.5} />
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-amber-400" title="Waiting for verification" />
                      )}
                    </div>
                  </td>
                  <td className="text-slate-600">
                    {item.kit_type ? (
                      <span className="tag font-sans">
                        {item.kit_type}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">-</span>
                    )}
                  </td>
                  <td className="text-slate-600">
                    {item.workcell || <span className="text-slate-400 font-normal">-</span>}
                  </td>
                  <td className="font-mono font-bold text-slate-900 text-right tabular-nums">
                    {item.parts && Number(item.parts) > 0 ? item.parts : <span className="text-slate-400 font-normal">-</span>}
                  </td>
                  {showActions && (
                    <td className="text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        {/* Tick action button which means verified */}
                        {onToggleVerify && (
                          <button
                            type="button"
                            onClick={() => onToggleVerify(idx)}
                            className={`btn btn-sm w-24 ${isVerified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'btn-primary'
                              }`}
                            title={isVerified ? 'Verified. Click to undo.' : 'Mark as verified'}
                          >
                            <Check size={14} strokeWidth={3} />
                            <span>{isVerified ? 'Verified' : 'Verify'}</span>
                          </button>
                        )}

                        {/* Delete button */}
                        {onRemoveItem && (
                          <button
                            type="button"
                            onClick={() => onRemoveItem(idx)}
                            className="btn btn-ghost btn-sm btn-icon hover:text-rose-600! hover:bg-rose-50!"
                            title="Remove pull list"
                            aria-label="Remove pull list"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                  {readOnly && (
                    <td className="text-center">
                      <span
                        className={`badge ${isVerified ? 'badge-success' : 'badge-warning'}`}
                      >
                        <Check size={11} strokeWidth={3} />
                        {isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
