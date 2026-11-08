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
      title="New dispatch"
    >
      <form onSubmit={onSubmit} className="space-y-4 select-none">
        {formError && (
          <div className="alert alert-danger text-xs font-bold">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">DC number</label>
            <input
              type="text"
              name="dc_no"
              value="Generated on save"
              disabled
              className="input font-mono select-none cursor-not-allowed bg-slate-50 text-slate-500"
            />
          </div>

          <div>
            <label className="field-label">Vehicle number</label>
            <input
              type="text"
              name="vehicle_no"
              placeholder="e.g. MH-12-QW-1234"
              list="pipeline-vehicles-datalist"
              value={newDispatch.vehicle_no}
              onChange={onChange}
              required
              className="input uppercase"
            />
            <datalist id="pipeline-vehicles-datalist">
              {(settings?.vehiclesList || []).map((opt: string, i: number) => (
                <option key={i} value={opt} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="field-label">Vehicle size</label>
            <select
              name="vehicle_size"
              value={newDispatch.vehicle_size || settings?.defaultVehicleSize || '32 ft'}
              onChange={onChange}
              className="input"
            >
              {(settings?.vehicleSizesList || ['32 ft', '20 ft', '10 ft']).map((vs: string, i: number) => (
                <option key={i} value={vs}>{vs}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Supervisor</label>
            <select
              name="supplier_name"
              value={newDispatch.supplier_name}
              onChange={onChange}
              required
              className="input"
            >
              <option value="">Select supervisor</option>
              {(settings?.suppliersList || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Pallets</label>
            <input
              type="number"
              name="total_pallets"
              value={newDispatch.total_pallets}
              onChange={onChange}
              min={1}
              required
              className="input font-mono"
            />
          </div>

          <div>
            <span className="field-label">Return trip</span>
            <label className={`flex items-center gap-2.5 h-9 px-3 border rounded-lg text-sm font-bold cursor-pointer transition-colors select-none ${newDispatch.is_empty_pallets
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}>
              <input
                type="checkbox"
                name="is_empty_pallets"
                checked={Boolean(newDispatch.is_empty_pallets)}
                onChange={onChange}
                className="w-4 h-4 accent-amber-600 cursor-pointer"
              />
              <span>Empty pallets only</span>
            </label>
          </div>

          <div className="col-span-2">
            <label className="field-label">Consignee address</label>
            <select
              name="address"
              value={newDispatch.address}
              onChange={onChange}
              required
              className="input"
            >
              <option value="">Select consignee address</option>
              {(settings?.addressesList || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt.split('\n')[0]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Scanned by</label>
            <select
              name="scanning_by"
              value={newDispatch.scanning_by}
              onChange={onChange}
              className="input"
            >
              <option value="">Select scanner</option>
              {(settings?.scannersList || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Verified by</label>
            <select
              name="verify_by"
              value={newDispatch.verify_by}
              onChange={onChange}
              className="input"
            >
              <option value="">Select verifier</option>
              {(settings?.verifiersList || []).map((opt: string, i: number) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Transaction</label>
            <input
              type="text"
              name="transaction_type"
              value={newDispatch.transaction_type}
              onChange={onChange}
              className="input"
            />
          </div>

          <div>
            <label className="field-label">Particular</label>
            <input
              type="text"
              name="particular"
              value={newDispatch.particular}
              onChange={onChange}
              className="input"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <AnimatedStatusButton
            type="submit"
            status={createStatus}
            idleText="Create dispatch"
            loadingText="Creating…"
            successText="Created"
            variant="primary"
          />
        </div>
      </form>
    </Modal>
  );
};
