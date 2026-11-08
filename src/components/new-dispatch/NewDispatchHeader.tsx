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
    <div className="card px-5 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {editId && (
          <button
            onClick={onCancel}
            className="btn btn-ghost btn-icon"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="card-title">
              {editId
                ? (dispatch.status === 'completed'
                    ? `Edit completed dispatch ${dispatch.dc_no}`
                    : `Dispatch ${dispatch.dc_no}`)
                : 'New dispatch'}
            </h3>
            {editId && dispatch.status === 'completed' && (
              <span className="badge badge-success">
                Completed, editable
              </span>
            )}
          </div>
          <p className="card-subtitle">Scan or paste pull list numbers, or an email subject line</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Save Changes Button */}
        <button
          onClick={onSave}
          disabled={loading || !dispatch.vehicle_no || !dispatch.supplier_name}
          className={`btn ${dispatch.id && (dispatch.status === 'loading' || dispatch.status === 'ready') ? 'btn-secondary' : 'btn-primary'}`}
          title="Save changes (Ctrl+S)"
        >
          <Check size={14} strokeWidth={3} />
          <span>Save</span>
        </button>

        {/* Unified Print Set Button */}
        <button
          onClick={onPrintCombined}
          disabled={loading || items.length === 0}
          className="btn btn-secondary"
          title={
            items.length > 15
              ? `Prints 3 Challans and ${Math.ceil(items.length / 15) * 3} Barcodes (${3 + Math.ceil(items.length / 15) * 3} pages in total) in 1 click`
              : "Prints 3 copies of Challan and 3 copies of Barcodes (Total 6 pages) in 1 click"
          }
        >
          <Printer size={14} />
          <span>Print set</span>
        </button>

        {/* Print Barcodes Button */}
        <button
          onClick={onPrintBarcodes}
          disabled={loading || items.length === 0}
          className="btn btn-secondary"
        >
          <Barcode size={14} />
          <span>Barcodes</span>
        </button>

        {/* Print Challan Button */}
        <button
          onClick={onPrintChallan}
          disabled={loading || !dispatch.dc_no}
          className="btn btn-secondary"
        >
          <FileText size={14} />
          <span>Challan</span>
        </button>

        {/* Mark Ready Action (if status is loading) */}
        {dispatch.id && dispatch.status === 'loading' && (
          <AnimatedStatusButton
            status={markReadyStatus}
            idleText="Mark ready"
            loadingText="Marking ready…"
            successText="Ready"
            idleIcon={Play}
            variant="primary"
            onClick={onMarkReady}
            disabled={loading}
          />
        )}

        {/* Complete Dispatch Action (if status is ready) */}
        {dispatch.id && dispatch.status === 'ready' && (
          <button
            onClick={onOpenConfirmComplete}
            disabled={loading}
            className="btn btn-primary"
          >
            <CheckCircle size={14} />
            <span>Complete dispatch</span>
          </button>
        )}
      </div>
    </div>
  );
};
