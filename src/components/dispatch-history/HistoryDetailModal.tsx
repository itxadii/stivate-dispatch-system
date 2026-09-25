import React from 'react';
import { Modal } from '../Modal';
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
      title={`Dispatch details: ${selectedDispatch.dc_no}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 select-none">
        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Date</span>
            <span className="font-semibold text-slate-700">{selectedDispatch.date}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Status</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
              selectedDispatch.status === 'completed'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : selectedDispatch.status === 'ready'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {selectedDispatch.status === 'completed' ? 'Completed' : selectedDispatch.status === 'ready' ? 'Ready' : 'Loading'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Vehicle Number</span>
            <span className="font-semibold text-slate-700 uppercase">{selectedDispatch.vehicle_no}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Supervisor Name</span>
            <span className="font-semibold text-slate-700">{selectedDispatch.supplier_name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Pallets Count</span>
            <span className="font-semibold text-slate-700 font-mono text-xs">{selectedDispatch.total_pallets}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Total Pull Lists</span>
            <span className="font-semibold text-slate-700 font-mono text-xs">
              {selectedDispatch.items?.length ?? selectedDispatch.total_pull_lists ?? 0}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Destination Address</span>
            <span className="font-semibold text-slate-700">{selectedDispatch.address}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Created By</span>
            <span className="font-semibold text-slate-700">{selectedDispatch.created_by}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Total Parts</span>
            <span className="font-semibold text-slate-700 font-mono text-xs">{selectedDispatch.total_parts}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Particular</span>
            <span className="font-semibold text-slate-700">{selectedDispatch.particular || 'AS PER LIST'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Scanning By</span>
            <span className="font-semibold text-slate-700">{selectedDispatch.scanning_by || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Verify By</span>
            <span className="font-semibold text-slate-700">{selectedDispatch.verify_by || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Transaction</span>
            <span className="font-semibold text-slate-700">{selectedDispatch.transaction_type || '-'}</span>
          </div>
        </div>

        {/* List Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Pull Lists Loaded ({selectedDispatch.items?.length || 0})
            </span>
            <button
              type="button"
              onClick={onCopyModalPullLists}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer shadow-2xs flex items-center justify-center ${
                copiedModal
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
              }`}
              title={copiedModal ? "Copied for Mail!" : "Copy for Mail"}
              aria-label="Copy for Mail"
            >
              {copiedModal ? <Check size={15} className="text-emerald-600 stroke-[3]" /> : <Copy size={15} />}
            </button>
          </div>
          <DispatchTable items={selectedDispatch.items} readOnly={true} />
        </div>

        {/* Modal Controls */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          {selectedDispatch.id && (selectedDispatch.status !== 'completed' || recentCompletedIds.includes(selectedDispatch.id)) && (
            <button
              onClick={() => {
                const id = selectedDispatch.id;
                onClose();
                if (id) onEditDispatch?.(id);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              title="Edit this dispatch in editor"
            >
              <Pencil size={14} />
              <span>Edit Dispatch</span>
            </button>
          )}
          <button
            onClick={() => onReprintBarcodes(selectedDispatch.items)}
            className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            <Printer size={14} />
            <span>Reprint Barcodes</span>
          </button>
          <button
            onClick={() => onReprintChallan(selectedDispatch, selectedDispatch.items)}
            className="flex items-center gap-1 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            <Printer size={14} />
            <span>Reprint Challan PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
