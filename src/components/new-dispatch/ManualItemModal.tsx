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
      title={manualItem.pull_list_no ? "Unknown Pull List Detected" : "Add Pull List Manually"}
    >
      <form onSubmit={onSubmit} className="space-y-4 select-none">
        {manualError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold">
            {manualError}
          </div>
        )}

        {manualItem.pull_list_no ? (
          <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900 text-xs font-medium leading-relaxed">
            <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p>
              Pull List <strong>{manualItem.pull_list_no}</strong> was not found in SAP Master records. Please input details manually. It will also be indexed to database automatically.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg border border-blue-200 text-blue-900 text-xs font-medium leading-relaxed">
            <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <p>
              Please enter the details of the Pull List manually below. This will also cache the item in the database for future scans.
            </p>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Pull List Number / Description <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. O1RI materials or PL-10294"
            value={manualItem.pull_list_no || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, pull_list_no: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg text-sm font-mono text-slate-700 font-bold focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            ID Number <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Optional"
            value={manualItem.id_number || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, id_number: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Kit Type <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Optional"
            value={manualItem.kit_type || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, kit_type: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Workcell <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Optional"
            value={manualItem.workcell || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, workcell: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">
            Parts Quantity <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            placeholder="0"
            value={manualItem.parts === 0 ? '' : manualItem.parts || ''}
            onChange={(e) => onChange((prev) => ({ ...prev, parts: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono font-bold"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#4BB8FA] hover:bg-[#35a0dc] text-slate-900 rounded-lg text-xs font-bold cursor-pointer"
          >
            Add Item
          </button>
        </div>
      </form>
    </Modal>
  );
};
