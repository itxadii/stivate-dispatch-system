import React from 'react';
import { Modal } from '../Modal';
import { AlertCircle } from 'lucide-react';

interface ConfirmDepartureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isEmptyPallets: boolean;
  totalPallets: number;
}

export const ConfirmDepartureModal: React.FC<ConfirmDepartureModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isEmptyPallets,
  totalPallets,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Dispatch"
    >
      <div className="space-y-4 select-none">
        <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-indigo-900 text-xs font-medium leading-relaxed">
          <AlertCircle size={18} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Confirm Departure</p>
            <p>
              {isEmptyPallets
                ? `Has the truck with ${totalPallets || 1} return pallets physically departed? Confirming will finalize the invoice, transition status to Completed, and archive the dispatch record.`
                : `Has the truck physically left the warehouse? Confirming will finalize the invoice, transition status to Completed, and archive the dispatch record.`}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Complete Dispatch
          </button>
        </div>
      </div>
    </Modal>
  );
};
