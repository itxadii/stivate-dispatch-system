import React from 'react';
import { Modal } from '../Modal';
import { StatusBadge, MetaField } from '../ui';
import { DispatchTable } from '../DispatchTable';
import { Printer, Copy, Check, Pencil } from 'lucide-react';
import type { Dispatch, DispatchItem } from '../../types';

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDispatch: (Dispatch & { items: DispatchItem[] }) | null;
  recentCompletedIds: number[];
  copiedModal: boolean;
  onCopyModalPullLists: () => void;
  onEditDispatch?: (id: number) => void;
  onReprintBarcodes: (items: DispatchItem[]) => void;
  onReprintChallan: (disp: Dispatch, items: DispatchItem[]) => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  isOpen,
  onClose,
  selectedDispatch,
  recentCompletedIds,
  copiedModal,
  onCopyModalPullLists,
  onEditDispatch,
  onReprintBarcodes,
  onReprintChallan,
}) => {
  if (!selectedDispatch) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dispatch ${selectedDispatch.dc_no}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5 select-none">
        <div className="panel grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
          <MetaField label="Date">{selectedDispatch.date}</MetaField>
          <MetaField label="Status"><StatusBadge status={selectedDispatch.status} /></MetaField>
          <MetaField label="Vehicle number"><span className="uppercase">{selectedDispatch.vehicle_no}</span></MetaField>
          <MetaField label="Supervisor">{selectedDispatch.supplier_name}</MetaField>
          <MetaField label="Pallets"><span className="font-mono tabular-nums">{selectedDispatch.total_pallets}</span></MetaField>
          <MetaField label="Pull lists">
            <span className="font-mono tabular-nums">{selectedDispatch.items?.length ?? selectedDispatch.total_pull_lists ?? 0}</span>
          </MetaField>
          <MetaField label="Destination address" className="col-span-2">{selectedDispatch.address}</MetaField>
          <MetaField label="Created by">{selectedDispatch.created_by}</MetaField>
          <MetaField label="Total parts"><span className="font-mono tabular-nums">{selectedDispatch.total_parts}</span></MetaField>
          <MetaField label="Particular">{selectedDispatch.particular || 'AS PER LIST'}</MetaField>
          <MetaField label="Scanned by">{selectedDispatch.scanning_by || '—'}</MetaField>
          <MetaField label="Verified by">{selectedDispatch.verify_by || '—'}</MetaField>
          <MetaField label="Transaction">{selectedDispatch.transaction_type || '—'}</MetaField>
        </div>

        {/* List Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              Pull lists loaded <span className="text-slate-400 font-normal">({selectedDispatch.items?.length || 0})</span>
            </h4>
            <button
              type="button"
              onClick={onCopyModalPullLists}
              className={`btn btn-secondary btn-sm ${copiedModal ? 'text-emerald-700! border-emerald-200!' : ''}`}
              title="Copy pull lists for email"
            >
              {copiedModal ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
              <span>{copiedModal ? 'Copied' : 'Copy for email'}</span>
            </button>
          </div>
          <DispatchTable items={selectedDispatch.items} readOnly={true} />
        </div>

        {/* Modal Controls */}
        <div className="modal-footer">
          {selectedDispatch.id && (selectedDispatch.status !== 'completed' || recentCompletedIds.includes(selectedDispatch.id)) && (
            <button
              onClick={() => {
                const id = selectedDispatch.id;
                onClose();
                if (id) onEditDispatch?.(id);
              }}
              className="btn btn-secondary"
              title="Edit this dispatch in editor"
            >
              <Pencil size={14} />
              <span>Edit dispatch</span>
            </button>
          )}
          <button
            onClick={() => onReprintBarcodes(selectedDispatch.items)}
            className="btn btn-secondary"
          >
            <Printer size={14} />
            <span>Reprint barcodes</span>
          </button>
          <button
            onClick={() => onReprintChallan(selectedDispatch, selectedDispatch.items)}
            className="btn btn-secondary"
          >
            <Printer size={14} />
            <span>Reprint challan</span>
          </button>
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
