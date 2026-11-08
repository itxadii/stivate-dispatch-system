import React from 'react';
import type { Dispatch, AppSettings } from '../../types';

interface DispatchLogisticsPanelProps {
  dispatch: Partial<Dispatch>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  settings: AppSettings | null;
}

const getNowDateTimeString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatForDateTimeInput = (val?: string) => {
  if (!val) return getNowDateTimeString();
  if (val.includes('T')) return val.substring(0, 16);
  if (val.includes(' ')) return val.replace(' ', 'T').substring(0, 16);
  return `${val}T00:00`;
};

export const DispatchLogisticsPanel: React.FC<DispatchLogisticsPanelProps> = ({
  dispatch,
  onChange,
  settings,
}) => {
  return (
    <div className="w-full lg:w-72 xl:w-80 shrink-0 card p-5 space-y-4">
      <div>
        <h4 className="card-title">Dispatch details</h4>
        <p className="card-subtitle">Truck, people and paperwork for this DC</p>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="field-label">DC number</label>
          <input
            type="text"
            value={dispatch.dc_no || 'Generated on save'}
            disabled
            className="input font-mono"
          />
        </div>

        <div>
          <label className="field-label">Date &amp; time</label>
          <input
            type="datetime-local"
            name="date"
            value={formatForDateTimeInput(dispatch.date)}
            onChange={onChange}
            required
            className="input"
          />
        </div>

        <div>
          <label className="field-label">Supervisor</label>
          <select
            name="supplier_name"
            value={dispatch.supplier_name}
            onChange={onChange}
            required
            className="input"
          >
            <option value="">Select supervisor</option>
            {(settings?.suppliersList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Vehicle number</label>
          <input
            type="text"
            name="vehicle_no"
            placeholder="e.g. MH-12-QW-1234"
            list="vehicles-datalist"
            value={dispatch.vehicle_no}
            onChange={onChange}
            required
            className="input uppercase"
          />
          <datalist id="vehicles-datalist">
            {(settings?.vehiclesList || []).map((opt, i) => (
              <option key={i} value={opt} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="field-label">Vehicle size</label>
          <select
            name="vehicle_size"
            value={dispatch.vehicle_size || settings?.defaultVehicleSize || '32 ft'}
            onChange={onChange}
            className="input"
          >
            {(settings?.vehicleSizesList || ['32 ft', '20 ft', '10 ft']).map((vs, i) => (
              <option key={i} value={vs}>{vs}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Consignee address</label>
          <select
            name="address"
            value={dispatch.address}
            onChange={onChange}
            required
            className="input"
          >
            <option value="">Select consignee address</option>
            {(settings?.addressesList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt.split('\n')[0]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Particular</label>
          <input
            type="text"
            name="particular"
            placeholder="e.g. AS PER LIST"
            value={dispatch.particular}
            onChange={onChange}
            className="input"
          />
        </div>

        <div>
          <label className="field-label">Scanned by</label>
          <select
            name="scanning_by"
            value={dispatch.scanning_by}
            onChange={onChange}
            className="input"
          >
            <option value="">Select operator</option>
            {(settings?.scannersList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Verified by</label>
          <select
            name="verify_by"
            value={dispatch.verify_by}
            onChange={onChange}
            className="input"
          >
            <option value="">Select verifier</option>
            {(settings?.verifiersList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Transaction</label>
          <input
            type="text"
            name="transaction_type"
            placeholder="Transaction details"
            value={dispatch.transaction_type}
            onChange={onChange}
            className="input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="field-label mb-0">Pallets</label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_empty_pallets"
                checked={Boolean(dispatch.is_empty_pallets)}
                onChange={onChange}
                className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-amber-700">Empty return</span>
            </label>
          </div>
          <input
            type="number"
            name="total_pallets"
            value={dispatch.total_pallets}
            onChange={onChange}
            min={1}
            required
            className={`input font-mono ${dispatch.is_empty_pallets ? 'bg-amber-50 border-amber-300 text-amber-900' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};
