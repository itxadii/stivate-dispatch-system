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
    <div className="w-full lg:w-72 xl:w-80 shrink-0 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Dispatch Logistics</h4>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">DC NO (Auto)</label>
          <input
            type="text"
            value={dispatch.dc_no || 'Draft (Auto generated)'}
            disabled
            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm font-mono text-slate-500 font-semibold"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">DATE & TIME</label>
          <input
            type="datetime-local"
            name="date"
            value={formatForDateTimeInput(dispatch.date)}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors font-medium text-slate-700"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Supervisor Name</label>
          <select
            name="supplier_name"
            value={dispatch.supplier_name}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors font-medium text-slate-700 cursor-pointer"
          >
            <option value="">-- Select Supervisor --</option>
            {(settings?.suppliersList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">VEHICLE NO</label>
          <input
            type="text"
            name="vehicle_no"
            placeholder="e.g. MH-12-QW-1234"
            list="vehicles-datalist"
            value={dispatch.vehicle_no}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors uppercase font-semibold text-slate-700"
          />
          <datalist id="vehicles-datalist">
            {(settings?.vehiclesList || []).map((opt, i) => (
              <option key={i} value={opt} />
            ))}
          </datalist>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">VEHICLE SIZE</label>
          <select
            name="vehicle_size"
            value={dispatch.vehicle_size || settings?.defaultVehicleSize || '32 ft'}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors text-slate-700 font-bold cursor-pointer"
          >
            {(settings?.vehicleSizesList || ['32 ft', '20 ft', '10 ft']).map((vs, i) => (
              <option key={i} value={vs}>{vs}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Address / Consignee</label>
          <select
            name="address"
            value={dispatch.address}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors text-slate-700 font-medium cursor-pointer"
          >
            <option value="">-- Select Consignee Address --</option>
            {(settings?.addressesList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt.split('\n')[0]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">PERTICULAR</label>
          <input
            type="text"
            name="particular"
            placeholder="e.g. AS PER LIST"
            value={dispatch.particular}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors text-slate-700 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">SCANNING BY</label>
          <select
            name="scanning_by"
            value={dispatch.scanning_by}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors text-slate-700 cursor-pointer"
          >
            <option value="">-- Select Operator --</option>
            {(settings?.scannersList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">VERIFY BY</label>
          <select
            name="verify_by"
            value={dispatch.verify_by}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors text-slate-700 font-medium cursor-pointer"
          >
            <option value="">-- Select Verifier --</option>
            {(settings?.verifiersList || []).map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">TRANSACTION</label>
          <input
            type="text"
            name="transaction_type"
            placeholder="Transaction details"
            value={dispatch.transaction_type}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors text-slate-700"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase">Total Pallets Count</label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="is_empty_pallets"
                checked={Boolean(dispatch.is_empty_pallets)}
                onChange={onChange}
                className="w-3.5 h-3.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wide">Empty Pallets</span>
            </label>
          </div>
          <input
            type="number"
            name="total_pallets"
            value={dispatch.total_pallets}
            onChange={onChange}
            min={1}
            required
            className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors font-mono font-bold ${
              dispatch.is_empty_pallets
                ? 'bg-amber-50/70 border-amber-300 text-amber-900 focus:bg-white focus:border-amber-500'
                : 'border-slate-200 bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-700'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
