import React from 'react';
import { Modal } from '../Modal';
import { AnimatedStatusButton } from '../animations';
import type { ButtonStatus } from '../animations';

interface CreateDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  newDispatch: {
    dc_no: string;
    date: string;
    vehicle_no: string;
    vehicle_size: string;
    supplier_name: string;
    address: string;
    total_pallets: number;
    total_parts: number;
    particular: string;
    scanning_by: string;
    verify_by: string;
    transaction_type: string;
    created_by: string;
    status: 'loading';
    is_empty_pallets: boolean;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  formError: string | null;
  createStatus: ButtonStatus;
  settings: any;
}

export const CreateDispatchModal: React.FC<CreateDispatchModalProps> = ({
  isOpen,
  onClose,
  newDispatch,
  onChange,
  onSubmit,
  formError,
  createStatus,
  settings
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Dispatch Truck"
    >
      <form onSubmit={onSubmit} className="space-y-4 select-none">
        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">DC Number</label>
            <input
              type="text"
              name="dc_no"
              value="(Auto-Generated)"
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 font-mono font-bold text-slate-400 select-none cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Number</label>
            <input
              type="text"
              name="vehicle_no"
              placeholder="e.g. MH-12-QW-1234"
              list="pipeline-vehicles-datalist"
              value={newDispatch.vehicle_no}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white uppercase font-bold text-slate-700"
            />
            <datalist id="pipeline-vehicles-datalist">
              {(settings?.vehiclesList || []).map((opt: string, i: number) => (
                <option key={i} value={opt} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Vehicle Size</label>
            <select
              name="vehicle_size"
              value={newDispatch.vehicle_size || settings?.defaultVehicleSize || '32 ft'}
              onChange={onChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white text-slate-700 cursor-pointer font-bold"
            >
              {(settings?.vehicleSizesList || ['32 ft', '20 ft', '10 ft']).map((vs: string, i: number) => (
                <option key={i} value={vs}>{vs}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Supervisor / Customer</label>
            <select
              name="supplier_name"
              value={newDispatch.supplier_name}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="">-- Select Customer --</option>
              {(settings?.suppliersList || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Total Pallets Count</label>
            <input
              type="number"
              name="total_pallets"
              value={newDispatch.total_pallets}
              onChange={onChange}
              min={1}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white font-mono font-bold text-slate-700"
            />
          </div>

          <div className="space-y-1 flex flex-col justify-end">
            <label className="text-xs font-bold text-slate-500 uppercase">Return Pallets</label>
            <label className={`flex items-center gap-2.5 px-3 py-2 border rounded-lg text-sm font-bold cursor-pointer transition-colors h-[38px] select-none ${newDispatch.is_empty_pallets
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/80'
              }`}>
              <input
                type="checkbox"
                name="is_empty_pallets"
                checked={Boolean(newDispatch.is_empty_pallets)}
                onChange={onChange}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-xs uppercase font-extrabold tracking-wide">
                Empty Pallets
              </span>
            </label>
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Consignee Address</label>
            <select
              name="address"
              value={newDispatch.address}
              onChange={onChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="">-- Select Consignee Address --</option>
              {(settings?.addressesList || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt.split('\n')[0]}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Scanning By</label>
            <select
              name="scanning_by"
              value={newDispatch.scanning_by}
              onChange={onChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="">-- Select Scanner --</option>
              {(settings?.scannersList || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Verify By</label>
            <select
              name="verify_by"
              value={newDispatch.verify_by}
              onChange={onChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white text-slate-700 cursor-pointer font-medium"
            >
              <option value="">-- Select Verifier --</option>
              {(settings?.verifiersList || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Transaction Type</label>
            <input
              type="text"
              name="transaction_type"
              value={newDispatch.transaction_type}
              onChange={onChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white text-slate-700 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Particular</label>
            <input
              type="text"
              name="particular"
              value={newDispatch.particular}
              onChange={onChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:bg-white text-slate-700 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <AnimatedStatusButton
            type="submit"
            status={createStatus}
            idleText="Create Dispatch"
            loadingText="Creating..."
            successText="✓ Created"
            variant="primary"
          />
        </div>
      </form>
    </Modal>
  );
};
