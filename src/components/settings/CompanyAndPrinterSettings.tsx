import React from 'react';
import { Sparkles, Database, FolderOpen } from 'lucide-react';
import type { AppSettings } from '../../types';

interface CompanyAndPrinterSettingsProps {
  settings: AppSettings;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CompanyAndPrinterSettings: React.FC<CompanyAndPrinterSettingsProps> = ({
  settings,
  onChange,
}) => {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="card-title flex items-center gap-2">
          <Sparkles size={16} className="text-brand-700" />
          Company and printers
        </h3>
        <p className="card-subtitle">Printed on every challan and barcode sheet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="field-label">Company name</label>
          <input
            type="text"
            name="companyName"
            value={settings.companyName}
            onChange={onChange}
            required
            className="input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="field-label">Company address</label>
          <textarea
            name="address"
            value={settings.address}
            onChange={onChange}
            rows={2}
            required
            className="input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="field-label">Warehouse location / header prefix</label>
          <input
            type="text"
            name="warehouseLocation"
            value={settings.warehouseLocation || ''}
            onChange={onChange}
            placeholder="e.g. F W H, FORWARD WAREHOUSE"
            className="input"
          />
          <p className="field-hint">
            Printed at the top of challans, e.g. <strong>{settings.warehouseLocation || 'F W H'}</strong> TO [consignee name]
          </p>
        </div>

        <div>
          <label className="field-label">Default document printer</label>
          <input
            type="text"
            name="printer"
            value={settings.printer}
            onChange={onChange}
            className="input"
          />
        </div>

        <div>
          <label className="field-label">Default barcode printer</label>
          <input
            type="text"
            name="barcodePrinter"
            value={settings.barcodePrinter}
            onChange={onChange}
            className="input"
          />
        </div>

        <div className="md:col-span-2">
          <label className="field-label flex items-center gap-1.5">
            <Database size={13} className="text-slate-400" />
            Database location
          </label>
          <input
            type="text"
            name="databaseLocation"
            value={settings.databaseLocation}
            readOnly
            className="input font-mono text-xs cursor-not-allowed bg-slate-50 text-slate-500"
            title="Managed automatically for security"
          />
          <p className="field-hint">Managed by the app</p>
        </div>

        <div className="md:col-span-2">
          <label className="field-label flex items-center gap-1.5">
            <FolderOpen size={13} className="text-slate-400" />
            Backup folder
          </label>
          <input
            type="text"
            name="backupFolder"
            value={settings.backupFolder}
            readOnly
            className="input font-mono text-xs cursor-not-allowed bg-slate-50 text-slate-500"
            title="Managed automatically for security"
          />
          <p className="field-hint">Managed by the app</p>
        </div>

        <div className="md:col-span-2">
          <label className="field-label flex items-center gap-1.5">
            <FolderOpen size={13} className="text-slate-400" />
            PDF output folder
          </label>
          <input
            type="text"
            name="printsFolder"
            value={settings.printsFolder}
            readOnly
            className="input font-mono text-xs cursor-not-allowed bg-slate-50 text-slate-500"
            title="Managed automatically for security"
          />
          <p className="field-hint">Managed by the app</p>
        </div>
      </div>
    </section>
  );
};
