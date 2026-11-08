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
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="card-title flex items-center gap-2">
          <RefreshCcw size={16} className="text-brand-700" />
          Updates
        </h4>
        <span className="tag">v{currentVersion}</span>
      </div>

      {updateStatus && (
        <div className="panel p-3 text-xs text-slate-600 leading-relaxed" role="status">
          {updateStatus}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={onCheckForUpdates}
          disabled={checkingForUpdates}
          className="btn btn-secondary w-full"
        >
          <RefreshCcw size={15} className={checkingForUpdates ? 'animate-spin' : ''} />
          <span>{checkingForUpdates ? 'Checking…' : 'Check for updates'}</span>
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
            className="btn btn-secondary"
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
            className="btn btn-primary"
          >
            Install and restart
          </button>
        </div>
      </div>
    </div>
  );
};
