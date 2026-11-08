import React from 'react';
import { Save, ListChecks } from 'lucide-react';
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
    <section className="space-y-4">
      {/* Section: Logistics Dropdown Options (Always visible) */}
      <div className={isUnlocked ? 'pt-6 border-t border-slate-100' : ''}>
        <h3 className="card-title flex items-center gap-2">
          <ListChecks size={16} className="text-brand-700" />
          Dropdown lists
        </h3>
        <p className="card-subtitle">The choices offered when creating a dispatch</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Addresses list */}
        <div className="panel flex flex-col justify-between gap-3">
          <div>
            <label className="field-label">Consignee addresses</label>
            <span className="field-hint block -mt-1 mb-2">Enter one address per block. Leave a blank line to separate addresses.</span>
            <textarea
              value={addressesRaw}
              onChange={(e) => setAddressesRaw(e.target.value)}
              rows={5}
              placeholder="Consignee Address Option 1&#10;&#10;Consignee Address Option 2"
              className="input bg-white"
            />
          </div>
          <div>
            <label className="field-label">Default address selection</label>
            <select
              value={settings.defaultAddress}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultAddress: e.target.value }))}
              className="input"
            >
              <option value="">Select default</option>
              {addressesOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt.split('\n')[0]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Supervisor Names list */}
        <div className="panel flex flex-col justify-between gap-3">
          <div>
            <label className="field-label">Supervisor names</label>
            <span className="field-hint block -mt-1 mb-2">Enter one supervisor per line.</span>
            <textarea
              value={suppliersRaw}
              onChange={(e) => setSuppliersRaw(e.target.value)}
              rows={5}
              placeholder="MAHADEV&#10;I3PL"
              className="input bg-white"
            />
          </div>
          <div>
            <label className="field-label">Default supervisor</label>
            <select
              value={settings.defaultSupplier}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultSupplier: e.target.value }))}
              className="input"
            >
              <option value="">Select default</option>
              {suppliersOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Scanning Operators list */}
        <div className="panel flex flex-col justify-between gap-3">
          <div>
            <label className="field-label">Scanning operators</label>
            <span className="field-hint block -mt-1 mb-2">Enter one operator per line.</span>
            <textarea
              value={scannersRaw}
              onChange={(e) => setScannersRaw(e.target.value)}
              rows={5}
              placeholder="PRASAD&#10;AMOL"
              className="input bg-white"
            />
          </div>
          <div>
            <label className="field-label">Default scanned by</label>
            <select
              value={settings.defaultScanner}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultScanner: e.target.value }))}
              className="input"
            >
              <option value="">Select default</option>
              {scannersOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Verifying Operators list */}
        <div className="panel flex flex-col justify-between gap-3">
          <div>
            <label className="field-label">Verifying operators</label>
            <span className="field-hint block -mt-1 mb-2">Enter one operator per line.</span>
            <textarea
              value={verifiersRaw}
              onChange={(e) => setVerifiersRaw(e.target.value)}
              rows={5}
              placeholder="AMOL&#10;PRASAD"
              className="input bg-white"
            />
          </div>
          <div>
            <label className="field-label">Default verified by</label>
            <select
              value={settings.defaultVerifier}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultVerifier: e.target.value }))}
              className="input"
            >
              <option value="">Select default</option>
              {verifiersOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Numbers list */}
        <div className="panel flex flex-col justify-between gap-3">
          <div>
            <label className="field-label">Vehicle numbers</label>
            <span className="field-hint block -mt-1 mb-2">Enter one vehicle per line.</span>
            <textarea
              value={vehiclesRaw}
              onChange={(e) => setVehiclesRaw(e.target.value)}
              rows={5}
              placeholder="MH-12-QW-1234&#10;MH-14-ER-5678"
              className="input bg-white"
            />
          </div>
          <div>
            <label className="field-label">Default vehicle number</label>
            <select
              value={settings.defaultVehicleNo || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultVehicleNo: e.target.value }))}
              className="input"
            >
              <option value="">Select default</option>
              {vehiclesOptions.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle Sizes list */}
        <div className="panel flex flex-col justify-between gap-3">
          <div>
            <label className="field-label">Vehicle sizes & capacity</label>
            <span className="field-hint block -mt-1 mb-2">Enter one size per line (e.g. 32 ft, 20 ft, 10 ft).</span>
            <textarea
              value={vehicleSizesRaw}
              onChange={(e) => setVehicleSizesRaw(e.target.value)}
              rows={5}
              placeholder="32 ft&#10;20 ft&#10;10 ft"
              className="input bg-white"
            />
          </div>
          <div>
            <label className="field-label">Default vehicle size</label>
            <select
              value={settings.defaultVehicleSize || '32 ft'}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultVehicleSize: e.target.value }))}
              className="input"
            >
              <option value="">Select default</option>
              {(vehicleSizesRaw.split('\n').map(l => l.trim()).filter(Boolean)).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
        >
          <Save size={16} />
          <span>{saving ? 'Saving…' : 'Save settings'}</span>
        </button>
      </div>
    </section>
  );
};
