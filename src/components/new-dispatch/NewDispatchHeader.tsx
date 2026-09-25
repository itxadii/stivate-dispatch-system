import React from 'react';
import { ArrowLeft, Check, Printer, Barcode, FileText, Play, CheckCircle } from 'lucide-react';
import { AnimatedStatusButton } from '../animations';
import type { ButtonStatus } from '../animations';
import type { Dispatch, DispatchItem } from '../../types';

interface NewDispatchHeaderProps {
  editId?: number | null;
  dispatch: Partial<Dispatch>;
  items: DispatchItem[];
  loading: boolean;
  markReadyStatus: ButtonStatus;
  onCancel: () => void;
  onSave: () => void;
  onPrintCombined: () => void;
  onPrintBarcodes: () => void;
  onPrintChallan: () => void;
  onMarkReady: () => void;
  onOpenConfirmComplete: () => void;
}

export const NewDispatchHeader: React.FC<NewDispatchHeaderProps> = ({
  editId,
  dispatch,
  items,
  loading,
  markReadyStatus,
  onCancel,
  onSave,
  onPrintCombined,
  onPrintBarcodes,
  onPrintChallan,
  onMarkReady,
  onOpenConfirmComplete,
}) => {
  return (
    <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3">
        {editId && (
          <button
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-md font-bold text-slate-800 uppercase tracking-wide">
              {editId
                ? (dispatch.status === 'completed'
                    ? `Edit Completed Dispatch: ${dispatch.dc_no}`
                    : `Loading Dispatch: ${dispatch.dc_no}`)
                : 'New Dispatch Invoice'}
            </h3>
            {editId && dispatch.status === 'completed' && (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                Completed (Editable)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">Enter or paste Pull List Numbers or Email Subject lines</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Save Changes Button */}
        <button
          onClick={onSave}
          disabled={loading || !dispatch.vehicle_no || !dispatch.supplier_name}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save changes to this dispatch (Ctrl+S)"
        >
          <Check size={14} className="stroke-[3]" />
          <span>Save Changes</span>
        </button>

        {/* Unified Print Set Button */}
        <button
          onClick={onPrintCombined}
          disabled={loading || items.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
          title={
            items.length > 15
              ? `Prints 3 Challans and ${Math.ceil(items.length / 15) * 3} Barcodes (${3 + Math.ceil(items.length / 15) * 3} pages in total) in 1 click`
              : "Prints 3 copies of Challan and 3 copies of Barcodes (Total 6 pages) in 1 click"
          }
        >
          <Printer size={14} />
          <span>
            {items.length > 15
              ? `Print Set (3x Challan + ${Math.ceil(items.length / 15) * 3}x Barcodes)`
              : 'Print Set (3x Challan + 3x Barcodes)'}
          </span>
        </button>

        {/* Print Barcodes Button */}
        <button
          onClick={onPrintBarcodes}
          disabled={loading || items.length === 0}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
        >
          <Barcode size={14} />
          <span>Print Barcodes</span>
        </button>

        {/* Print Challan Button */}
        <button
          onClick={onPrintChallan}
          disabled={loading || !dispatch.dc_no}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
        >
          <FileText size={14} />
          <span>Print Challan</span>
        </button>

        {/* Mark Ready Action (if status is loading) */}
        {dispatch.id && dispatch.status === 'loading' && (
          <AnimatedStatusButton
            status={markReadyStatus}
            idleText="Mark Ready"
            loadingText="Marking Ready..."
            successText="✓ Ready"
            idleIcon={Play}
            variant="amber"
            onClick={onMarkReady}
            disabled={loading}
          />
        )}

        {/* Complete Dispatch Action (if status is ready) */}
        {dispatch.id && dispatch.status === 'ready' && (
          <button
            onClick={onOpenConfirmComplete}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors disabled:opacity-50"
          >
            <CheckCircle size={14} />
            <span>Complete Dispatch</span>
          </button>
        )}
      </div>
    </div>
  );
};
