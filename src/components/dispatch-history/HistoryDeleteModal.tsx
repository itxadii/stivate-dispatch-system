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
      title="Delete dispatch"
    >
      <div className="space-y-4 select-none">
        <div className="alert alert-danger text-xs leading-relaxed">
          <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-900 mb-1">This can't be undone</p>
            <p>
              The delivery challan and all of its pull list items will be permanently removed.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
          >
            Delete dispatch
          </button>
        </div>
      </div>
    </Modal>
  );
};
