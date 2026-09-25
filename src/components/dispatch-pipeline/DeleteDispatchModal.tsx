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
      title="Delete Dispatch Confirmation"
    >
      <div className="space-y-4 select-none">
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-900">Are you sure you want to delete this DC?</h4>
            <p className="text-xs text-rose-700">
              This will permanently delete dispatch <strong className="font-mono">{deleteTarget?.dc_no}</strong> and remove any pull lists associated with it from the active pipeline.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Hourglass size={13} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>Delete Dispatch</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
