import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { updaterService } from '../../services/ipc';

interface ApplicationUpdatesProps {
  currentVersion: string;
  updateStatus: string | null;
  checkingForUpdates: boolean;
  onCheckForUpdates: () => void;
  setUpdateStatus: (status: string) => void;
}

export const ApplicationUpdates: React.FC<ApplicationUpdatesProps> = ({
  currentVersion,
  updateStatus,
  checkingForUpdates,
  onCheckForUpdates,
  setUpdateStatus,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <RefreshCcw size={16} className="text-emerald-500" />
        Application Updates
      </h4>

      <div className="text-xs text-slate-500 space-y-2">
        <p><strong>Current Version:</strong> v{currentVersion}</p>
        <p>Manage application updates and trigger update check processes.</p>
      </div>

      {updateStatus && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold leading-relaxed">
          {updateStatus}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={onCheckForUpdates}
          disabled={checkingForUpdates}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
        >
          <RefreshCcw size={15} className={checkingForUpdates ? 'animate-spin' : ''} />
          <span>{checkingForUpdates ? 'Checking for Updates...' : 'Check for Updates'}</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                setUpdateStatus('Starting download...');
                await updaterService.download();
              } catch (e: any) {
                setUpdateStatus(`Download failed: ${e.message || e}`);
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            Download
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                setUpdateStatus('Installing update...');
                await updaterService.install();
              } catch (e: any) {
                setUpdateStatus(`Installation failed: ${e.message || e}`);
              }
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            Install & Restart
          </button>
        </div>
      </div>
    </div>
  );
};
