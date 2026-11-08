import { CardHeader } from '../ui';
import React from 'react';
import { Package, ClipboardList, CheckCircle, Check, Copy, Plus } from 'lucide-react';
import { DispatchTable } from '../DispatchTable';
import type { Dispatch, DispatchItem } from '../../types';

interface DispatchItemsSectionProps {
  dispatch: Partial<Dispatch>;
  items: DispatchItem[];
  pullListInput: string;
  onPullListInputChange: (val: string) => void;
  onScanSubmit: (e: React.FormEvent) => void;
  scanInputRef: React.RefObject<HTMLInputElement | null>;
  onOpenManualModal: () => void;
  onRemoveItem: (idx: number) => void;
  onToggleVerify: (idx: number) => void;
  onVerifyAll: () => void;
  copiedMail: boolean;
  onCopyPullLists: () => void;
}

export const DispatchItemsSection: React.FC<DispatchItemsSectionProps> = ({
  dispatch,
  items,
  pullListInput,
  onPullListInputChange,
  onScanSubmit,
  scanInputRef,
  onOpenManualModal,
  onRemoveItem,
  onToggleVerify,
  onVerifyAll,
  copiedMail,
  onCopyPullLists,
}) => {
  const loadedCount = items.filter(item => !item.pull_list_no.endsWith('_pending')).length;
  const totalPullLists = items.length;
  const progressPct = totalPullLists > 0 ? Math.min(100, Math.round((loadedCount / totalPullLists) * 100)) : 0;

  return (
    <div className="flex-1 min-w-0 card p-5 flex flex-col gap-4">
      <CardHeader
        className="-mx-5 -mt-5 mb-1"
        icon={Package}
        title="Pull lists"
        subtitle="Pull lists scanned onto this truck"
        actions={
          <>
            <div className="flex items-center gap-3 h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-500">
              <span>Pull lists <strong className="text-slate-900 tabular-nums">{items.length}</strong></span>
              <span className="w-px h-3.5 bg-slate-200" />
              <span>Parts <strong className="text-slate-900 tabular-nums">{dispatch.total_parts}</strong></span>
            </div>
            <button
              type="button"
              onClick={onOpenManualModal}
              disabled={Boolean(dispatch.is_empty_pallets)}
              className="btn btn-secondary btn-sm"
            >
              <Plus size={14} />
              Add manually
            </button>
          </>
        }
      />

      {/* Merged Verification Progress Banner */}
      {items.length > 0 && !dispatch.is_empty_pallets && (
        <div className="panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className={`grid place-items-center w-9 h-9 rounded-lg shrink-0 ${progressPct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700'}`}>
              {progressPct === 100 ? <CheckCircle size={18} /> : <ClipboardList size={18} />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Verified</span>
                <span className="text-slate-600 tabular-nums">
                  <strong className="text-slate-900">{loadedCount}</strong> of {totalPullLists} ({progressPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPct === 100 ? 'bg-emerald-500' : 'bg-brand'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onCopyPullLists}
                className={`btn btn-secondary btn-sm ${copiedMail ? 'text-emerald-700! border-emerald-200!' : ''}`}
                title="Copy pull lists for email"
              >
                {copiedMail ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                <span>{copiedMail ? 'Copied' : 'Copy for email'}</span>
              </button>
            )}
            {loadedCount < totalPullLists && (
              <button
                type="button"
                onClick={onVerifyAll}
                className="btn btn-success btn-sm"
                title="Mark all pull lists as verified"
              >
                <Check size={14} strokeWidth={3} />
                <span>Verify all ({totalPullLists - loadedCount})</span>
              </button>
            )}
            {progressPct === 100 && (
              <span className="badge badge-success h-8 px-3 text-xs rounded-lg">
                <Check size={14} strokeWidth={3} />
                <span>All verified</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty Pallets Banner */}
      {dispatch.is_empty_pallets && (
        <div className="alert alert-warning">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
            <Package size={18} />
          </div>
          <div className="space-y-1">
            <h5 className="text-sm font-bold text-amber-950">Empty pallet return</h5>
            <p className="text-xs text-amber-800 leading-relaxed font-normal">
              This DC carries <strong>{dispatch.total_pallets || 1} empty pallets</strong>, so no pull lists need scanning. Print the challan, then mark it ready or complete it.
            </p>
          </div>
        </div>
      )}

      {/* Pull List Paste Box */}
      <form onSubmit={onScanSubmit} className="flex gap-2.5 w-full">
        <input
          ref={scanInputRef}
          type="text"
          placeholder={dispatch.is_empty_pallets ? "No pull lists needed for an empty pallet return" : "Scan or paste a pull list number, then press Enter"}
          value={pullListInput}
          onChange={(e) => onPullListInputChange(e.target.value)}
          disabled={Boolean(dispatch.is_empty_pallets)}
          className="input h-11 text-base flex-1 font-mono placeholder:font-sans"
        />
        <button
          type="submit"
          disabled={Boolean(dispatch.is_empty_pallets)}
          className="btn btn-primary btn-lg"
        >
          Mark loaded
        </button>
      </form>

      <div className="flex-1 overflow-y-auto min-h-[380px] max-h-[620px] rounded-xl border border-slate-200">
        <DispatchTable
          items={items}
          onRemoveItem={onRemoveItem}
          onToggleVerify={onToggleVerify}
        />
      </div>
    </div>
  );
};
