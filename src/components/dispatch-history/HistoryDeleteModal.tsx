import React from 'react';
import { Modal } from '../Modal';
import { AlertTriangle } from 'lucide-react';

interface HistoryDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const HistoryDeleteModal: React.FC<HistoryDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Shipment Deletion"
    >
      <div className="space-y-4 select-none">
        <div className="flex items-start gap-3 bg-rose-50 p-4 rounded-xl border border-rose-100 text-rose-900 text-xs font-medium leading-relaxed">
          <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Warning: Deletion is permanent</p>
            <p>
              Are you sure you want to delete this dispatch? This will completely erase the Delivery Challan record and cascade delete all associated dispatch items from the database.
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
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};
