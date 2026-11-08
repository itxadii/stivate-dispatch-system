import React from 'react';
import { Modal } from '../Modal';
import { AlertTriangle, Hourglass, Trash2 } from 'lucide-react';

interface DeleteDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  deleteTarget: { id: number; dc_no: string } | null;
  isDeleting: boolean;
  onConfirm: () => void;
}

export const DeleteDispatchModal: React.FC<DeleteDispatchModalProps> = ({
  isOpen,
  onClose,
  deleteTarget,
  isDeleting,
  onConfirm
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) {
          onClose();
        }
      }}
      title="Delete dispatch"
    >
      <div className="space-y-4 select-none">
        <div className="alert alert-danger">
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="font-bold text-rose-900">Delete this DC?</h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              This will permanently delete dispatch <strong className="font-mono">{deleteTarget?.dc_no}</strong> and remove any pull lists associated with it from the active pipeline.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="btn btn-danger"
          >
            {isDeleting ? (
              <>
                <Hourglass size={13} className="animate-spin" />
                <span>Deleting…</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>Delete dispatch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
