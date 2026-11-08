import React from 'react';
import { Modal } from '../Modal';
import { AlertCircle } from 'lucide-react';

interface ManualItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  manualItem: {
    pull_list_no: string;
    id_number: string;
    kit_type: string;
    workcell: string;
    parts: number | string;
  };
  onChange: React.Dispatch<React.SetStateAction<{
    pull_list_no: string;
    id_number: string;
    kit_type: string;
    workcell: string;
    parts: number | string;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
  manualError: string | null;
}

export const ManualItemModal: React.FC<ManualItemModalProps> = ({
  isOpen,
  onClose,
  manualItem,
  onChange,
  onSubmit,
  manualError,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={manualItem.pull_list_no ? "Pull list not found in masters" : "Add pull list manually"}
    >
      <form onSubmit={onSubmit} className="space-y-4 select-none">
        {manualError && (
          <div className="alert alert-danger p-3 text-xs font-bold">
            {manualError}
          </div>
        )}

        {manualItem.pull_list_no ? (
          <div className="alert alert-warning p-3 text-xs leading-relaxed">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p>
              Pull List <strong>{manualItem.pull_list_no}</strong> was not found in SAP Master records. Please input details manually. It will also be indexed to database automatically.
            </p>
          </div>
        ) : (
          <div className="alert alert-info p-3 text-xs leading-relaxed">
            <AlertCircle size={16} className="text-brand-700 shrink-0 mt-0.5" />
            <p>
              Please enter the details of the Pull List manually below. This will also cache the item in the database for future scans.
            </p>
          </div>
        )}

        <div>
          <label className="field-label">
            Pull list number or description <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. O1RI materials or PL-10294"
            value={manualItem.pull_list_no || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, pull_list_no: e.target.value }))}
            className="input font-mono"
          />
        </div>

        <div>
          <label className="field-label">
            ID number <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Optional"
            value={manualItem.id_number || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, id_number: e.target.value }))}
            className="input"
          />
        </div>

        <div>
          <label className="field-label">
            Kit type <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Optional"
            value={manualItem.kit_type || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, kit_type: e.target.value }))}
            className="input"
          />
        </div>

        <div>
          <label className="field-label">
            Workcell <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="Optional"
            value={manualItem.workcell || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, workcell: e.target.value }))}
            className="input"
          />
        </div>

        <div>
          <label className="field-label">
            Parts quantity <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            placeholder="0"
            value={manualItem.parts === 0 ? '' : manualItem.parts || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, parts: e.target.value }))}
            className="input font-mono"
          />
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            Add Item
          </button>
        </div>
      </form>
    </Modal>
  );
};
