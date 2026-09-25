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
    <>
      <h3 className="text-md font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={16} className="text-emerald-500" />
        Company Profile & Printer Setup
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={settings.companyName}
            onChange={onChange}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Company Address</label>
          <textarea
            name="address"
            value={settings.address}
            onChange={onChange}
            rows={2}
            required
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Warehouse Location / Header Prefix</label>
          <input
            type="text"
            name="warehouseLocation"
            value={settings.warehouseLocation || ''}
            onChange={onChange}
            placeholder="e.g. F W H or FORWARD WAREHOUSE or MAIN WAREHOUSE"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-[#4BB8FA] focus:bg-white transition-colors font-medium"
          />
          <p className="text-[11px] text-slate-400">
            Sets the location prefix printed on Challan PDF headers (e.g. <strong>{settings.warehouseLocation || 'F W H'}</strong> TO [Consignee Name]).
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Default Document Printer</label>
          <input
            type="text"
            name="printer"
            value={settings.printer}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Default Barcode Printer</label>
          <input
            type="text"
            name="barcodePrinter"
            value={settings.barcodePrinter}
            onChange={onChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <Database size={13} className="text-slate-400" />
            Database Storage Location
          </label>
          <input
            type="text"
            name="databaseLocation"
            value={settings.databaseLocation}
            readOnly
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 font-mono text-[11px] cursor-not-allowed"
            title="Managed automatically for security"
          />
          <p className="text-[10px] text-slate-400">Automatically managed in application data folder for security</p>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <FolderOpen size={13} className="text-slate-400" />
            Automatic Backup Folder
          </label>
          <input
            type="text"
            name="backupFolder"
            value={settings.backupFolder}
            readOnly
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 font-mono text-[11px] cursor-not-allowed"
            title="Managed automatically for security"
          />
          <p className="text-[10px] text-slate-400">Automatically managed in application data folder for security</p>
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <FolderOpen size={13} className="text-slate-400" />
            Prints/PDF Saving Folder
          </label>
          <input
            type="text"
            name="printsFolder"
            value={settings.printsFolder}
            readOnly
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-500 font-mono text-[11px] cursor-not-allowed"
            title="Managed automatically for security"
          />
          <p className="text-[10px] text-slate-400">Automatically managed in application data folder for security</p>
        </div>
      </div>
    </>
  );
};
