import React from 'react';
import { Package, ClipboardList, CheckCircle, Check, Copy } from 'lucide-react';
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
    <div className="flex-1 min-w-0 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-2xs">
            <Package size={18} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">Dispatch Items</h4>
            <p className="text-xs text-slate-400">Scanned pull lists and items associated with this dispatch</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenManualModal}
            disabled={Boolean(dispatch.is_empty_pallets)}
            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold border border-amber-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            + Add Manually
          </button>

          {/* Totals Summary */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              Pull Lists: <span className="text-emerald-600 font-mono font-black text-sm">{items.length}</span>
            </div>
            <div className="w-px h-3.5 bg-slate-300" />
            <div>
              Total Parts: <span className="text-emerald-600 font-mono font-black text-sm">{dispatch.total_parts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Merged Verification Progress Banner */}
      {items.length > 0 && !dispatch.is_empty_pallets && (
        <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <div className={`p-2 rounded-lg ${progressPct === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
              {progressPct === 100 ? <CheckCircle size={18} /> : <ClipboardList size={18} />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-slate-600 uppercase tracking-wider text-[10px] font-sans flex items-center gap-1.5">
                  Verification Progress
                </span>
                <span className="text-slate-800">
                  {loadedCount} of {totalPullLists} Verified ({progressPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progressPct === 100 ? 'bg-emerald-500' : 'bg-[#4BB8FA]'
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
                className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center border ${
                  copiedMail
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                }`}
                title={copiedMail ? "Copied for Mail!" : "Copy for Mail"}
                aria-label="Copy for Mail"
              >
                {copiedMail ? <Check size={16} className="text-emerald-600 stroke-[3]" /> : <Copy size={16} />}
              </button>
            )}
            {loadedCount < totalPullLists && (
              <button
                type="button"
                onClick={onVerifyAll}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                title="Mark all pull lists as verified"
              >
                <Check size={14} className="stroke-[3]" />
                <span>Verify All ({totalPullLists - loadedCount})</span>
              </button>
            )}
            {progressPct === 100 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-black shadow-2xs">
                <Check size={14} className="text-emerald-700 stroke-[3]" />
                <span>All Items Verified</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty Pallets Banner */}
      {dispatch.is_empty_pallets && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 shadow-2xs">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
            <Package size={18} />
          </div>
          <div className="space-y-1">
            <h5 className="text-xs font-black uppercase tracking-wider text-amber-950">Empty Pallets Return Mode Active</h5>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              This DC is configured for <strong>{dispatch.total_pallets || 1} Empty Pallets</strong>. Pull list scanning is not required. You can print Challans and click <strong>Mark Ready</strong> / <strong>Complete Dispatch</strong> directly.
            </p>
          </div>
        </div>
      )}

      {/* Pull List Paste Box */}
      <form onSubmit={onScanSubmit} className="flex gap-2.5 w-full">
        <input
          ref={scanInputRef}
          type="text"
          placeholder={dispatch.is_empty_pallets ? "Empty Pallets Return (No pull lists needed)..." : "Paste Pull List Number or Email Subject line and press Enter..."}
          value={pullListInput}
          onChange={(e) => onPullListInputChange(e.target.value)}
          disabled={Boolean(dispatch.is_empty_pallets)}
          className="flex-1 px-4 py-3 bg-slate-50/80 text-slate-800 placeholder-slate-400 font-mono border-2 border-slate-200 rounded-xl focus:outline-none focus:border-[#4BB8FA] focus:bg-white transition-all text-sm select-all font-bold tracking-wider focus:ring-2 focus:ring-[#4BB8FA]/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        />
        <button
          type="submit"
          disabled={Boolean(dispatch.is_empty_pallets)}
          className="px-6 py-3 bg-[#4BB8FA] text-slate-900 rounded-xl text-sm font-black hover:bg-[#35a0dc] transition-all cursor-pointer whitespace-nowrap flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
        >
          Mark Loaded
        </button>
      </form>

      <div className="flex-1 overflow-y-auto min-h-[380px] max-h-[620px] rounded-xl border border-slate-200 shadow-2xs">
        <DispatchTable
          items={items}
          onRemoveItem={onRemoveItem}
          onToggleVerify={onToggleVerify}
        />
      </div>
    </div>
  );
};
