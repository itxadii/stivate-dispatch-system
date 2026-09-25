import React from 'react';
import { Save } from 'lucide-react';
import type { AppSettings } from '../../types';

interface LogisticsDropdownOptionsProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  addressesRaw: string;
  setAddressesRaw: (val: string) => void;
  suppliersRaw: string;
  setSuppliersRaw: (val: string) => void;
  scannersRaw: string;
  setScannersRaw: (val: string) => void;
  verifiersRaw: string;
  setVerifiersRaw: (val: string) => void;
  vehiclesRaw: string;
  setVehiclesRaw: (val: string) => void;
  vehicleSizesRaw: string;
  setVehicleSizesRaw: (val: string) => void;
  saving: boolean;
  isUnlocked: boolean;
}

export const LogisticsDropdownOptions: React.FC<LogisticsDropdownOptionsProps> = ({
  settings,
  setSettings,
  addressesRaw,
  setAddressesRaw,
  suppliersRaw,
  setSuppliersRaw,
  scannersRaw,
  setScannersRaw,
  verifiersRaw,
  setVerifiersRaw,
  vehiclesRaw,
  setVehiclesRaw,
  vehicleSizesRaw,
  setVehicleSizesRaw,
  saving,
  isUnlocked,
}) => {
  const addressesOptions = addressesRaw.split(/\n\s*\n/).map(l => l.trim()).filter(Boolean);
  const suppliersOptions = suppliersRaw.split('\n').map(l => l.trim()).filter(Boolean);
  const scannersOptions = scannersRaw.split('\n').map(l => l.trim()).filter(Boolean);
  const verifiersOptions = verifiersRaw.split('\n').map(l => l.trim()).filter(Boolean);
  const vehiclesOptions = vehiclesRaw.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <>
      {/* Section: Logistics Dropdown Options (Always visible) */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <span>Logistics Dropdown Options</span>
        </h4>
        <span className="text-[11px] text-slate-400 font-medium">Auto-populates dropdown fields across New Dispatch</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Addresses list */}
        <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block">Consignee Addresses</label>
            <span className="text-[10px] text-slate-400 block mb-1">Enter one address per block. Leave a blank line to separate addresses.</span>
            <textarea
              value={addressesRaw}
              onChange={(e) => setAddressesRaw(e.target.value)}
              rows={5}
              placeholder="Consignee Address Option 1&#10;&#10;Consignee Address Option 2"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
          <div className="space-y-1 mt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Default Address Selection</label>
            <select
              value={settings.defaultAddress}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Select Default --</option>
              {addressesOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt.split('\n')[0]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Supervisor Names list */}
        <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block">Supervisor Names</label>
            <span className="text-[10px] text-slate-400 block mb-1">Enter one supervisor per line.</span>
            <textarea
              value={suppliersRaw}
              onChange={(e) => setSuppliersRaw(e.target.value)}
              rows={5}
              placeholder="MAHADEV&#10;I3PL"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
          <div className="space-y-1 mt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Default Supervisor</label>
            <select
              value={settings.defaultSupplier}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultSupplier: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Select Default --</option>
              {suppliersOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scanning Operators list */}
        <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block">Scanning Operators (Scanned By)</label>
            <span className="text-[10px] text-slate-400 block mb-1">Enter one operator per line.</span>
            <textarea
              value={scannersRaw}
              onChange={(e) => setScannersRaw(e.target.value)}
              rows={5}
              placeholder="PRASAD&#10;AMOL"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
          <div className="space-y-1 mt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Default Scanned By</label>
            <select
              value={settings.defaultScanner}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultScanner: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Select Default --</option>
              {scannersOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Verifying Operators list */}
        <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block">Verifying Operators (Verified By)</label>
            <span className="text-[10px] text-slate-400 block mb-1">Enter one operator per line.</span>
            <textarea
              value={verifiersRaw}
              onChange={(e) => setVerifiersRaw(e.target.value)}
              rows={5}
              placeholder="AMOL&#10;PRASAD"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
          <div className="space-y-1 mt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Default Verified By</label>
            <select
              value={settings.defaultVerifier}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultVerifier: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Select Default --</option>
              {verifiersOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Numbers list */}
        <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block">Vehicle Numbers</label>
            <span className="text-[10px] text-slate-400 block mb-1">Enter one vehicle per line.</span>
            <textarea
              value={vehiclesRaw}
              onChange={(e) => setVehiclesRaw(e.target.value)}
              rows={5}
              placeholder="MH-12-QW-1234&#10;MH-14-ER-5678"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
          <div className="space-y-1 mt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Default Vehicle No</label>
            <select
              value={settings.defaultVehicleNo || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultVehicleNo: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Select Default --</option>
              {vehiclesOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Sizes list */}
        <div className="space-y-2 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase block">Vehicle Sizes & Capacity</label>
            <span className="text-[10px] text-slate-400 block mb-1">Enter one size per line (e.g. 32 ft, 20 ft, 10 ft).</span>
            <textarea
              value={vehicleSizesRaw}
              onChange={(e) => setVehicleSizesRaw(e.target.value)}
              rows={5}
              placeholder="32 ft&#10;20 ft&#10;10 ft"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
          <div className="space-y-1 mt-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase block">Default Vehicle Size</label>
            <select
              value={settings.defaultVehicleSize || '32 ft'}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultVehicleSize: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
            >
              <option value="">-- Select Default --</option>
              {(vehicleSizesRaw.split('\n').map(l => l.trim()).filter(Boolean)).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#4BB8FA] hover:bg-[#35a0dc] text-slate-900 rounded-lg text-sm font-bold cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
        >
          <Save size={16} />
          <span>{saving ? 'Saving...' : (isUnlocked ? 'Save All Settings' : 'Save Logistics Options')}</span>
        </button>
      </div>
    </>
  );
};
