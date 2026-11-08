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
      title="Complete dispatch"
    >
      <div className="space-y-4 select-none">
        <div className="alert alert-info text-xs leading-relaxed">
          <AlertCircle size={18} className="text-brand-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-slate-900 mb-1">Has the truck left the warehouse?</p>
            <p>
              {isEmptyPallets
                ? `Confirm the truck carrying ${totalPallets || 1} return pallets has departed. The challan will be finalised and moved to completed dispatches.`
                : `The challan will be finalised and moved to completed dispatches.`}
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
            className="btn btn-primary"
          >
            Complete dispatch
          </button>
        </div>
      </div>
    </Modal>
  );
};
