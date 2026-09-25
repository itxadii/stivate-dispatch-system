import React from 'react';
import { Pencil, Printer } from 'lucide-react';
import { Modal } from '../Modal';
import { DispatchTable } from '../DispatchTable';
import { printService } from '../../services/ipc';
import type { Dispatch } from '../../types';

interface DispatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: (Dispatch & { items: any[] }) | null;
  recentCompletedIds: number[];
  onEditDispatch: (id: number) => void;
  formatDateTimeDisplay: (dateStr: string) => string;
}

export const DispatchDetailModal: React.FC<DispatchDetailModalProps> = ({
  isOpen,
  onClose,
  dispatch,
  recentCompletedIds,
  onEditDispatch,
  formatDateTimeDisplay,
}) => {
  if (!dispatch) return null;

  const isEditable = dispatch.id && (dispatch.status !== 'completed' || recentCompletedIds.includes(dispatch.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dispatch Details: ${dispatch.dc_no}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 select-none">
        {/* Metadata grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Date & Time</span>
            <span className="font-semibold text-slate-700">{formatDateTimeDisplay(dispatch.date)}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Status</span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
              dispatch.status === 'completed'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : dispatch.status === 'ready'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {dispatch.status === 'completed' ? 'Completed' : dispatch.status === 'ready' ? 'Ready' : 'Loading'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Vehicle Number</span>
            <span className="font-semibold text-slate-700 uppercase">{dispatch.vehicle_no}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Supervisor Name</span>
            <span className="font-semibold text-slate-700">{dispatch.supplier_name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Pallets Count</span>
            <span className="font-semibold text-slate-700 font-mono text-xs">{dispatch.total_pallets || 1}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Total Pull Lists</span>
            <span className="font-semibold text-slate-700 font-mono text-xs">
              {dispatch.items?.length ?? (dispatch as any).total_pull_lists ?? 0}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Destination Address</span>
            <span className="font-semibold text-slate-700">{dispatch.address || '-'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Total Parts</span>
            <span className="font-semibold text-slate-700 font-mono text-xs">{dispatch.total_parts || 0}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Created By</span>
            <span className="font-semibold text-slate-700">{dispatch.created_by || 'Operator'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Particular</span>
            <span className="font-semibold text-slate-700">{dispatch.particular || 'AS PER LIST'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-bold uppercase block mb-0.5">Transaction</span>
            <span className="font-semibold text-slate-700">{dispatch.transaction_type || '-'}</span>
          </div>
        </div>

        {/* List Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Pull Lists Loaded ({dispatch.items?.length || 0})
          </span>
          <DispatchTable items={dispatch.items || []} readOnly={true} />
        </div>

        {/* Modal Controls */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          {isEditable && (
            <button
              onClick={() => {
                const id = dispatch.id;
                onClose();
                if (id) onEditDispatch(id);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              title="Edit this dispatch in editor"
            >
              <Pencil size={14} />
              <span>Edit Dispatch</span>
            </button>
          )}
          <button
            onClick={async () => {
              try {
                await printService.printChallan(dispatch, dispatch.items || []);
              } catch (e) {
                console.error('Failed to print challan:', e);
              }
            }}
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
