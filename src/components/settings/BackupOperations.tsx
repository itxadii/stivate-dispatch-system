import React from 'react';
import { HardDriveDownload, Clock, Cloud, CloudUpload, CloudDownload, RefreshCcw } from 'lucide-react';
import type { AppSettings } from '../../types';

interface BackupOperationsProps {
  settings: AppSettings;
  backupMsg: { text: string; type: 'success' | 'error' } | null;
  uploadingLive: boolean;
  uploadingCloud: boolean;
  backingUp: boolean;
  restoring: boolean;
  restoringCloud: boolean;
  onUploadLiveState: () => void;
  onRestoreCloudLatest: () => void;
  onTriggerBackup: () => void;
  onUploadToCloud: () => void;
  onRestoreBackup: () => void;
}

export const BackupOperations: React.FC<BackupOperationsProps> = ({
  settings,
  backupMsg,
  uploadingLive,
  uploadingCloud,
  backingUp,
  restoring,
  restoringCloud,
  onUploadLiveState,
  onRestoreCloudLatest,
  onTriggerBackup,
  onUploadToCloud,
  onRestoreBackup,
}) => {
  const isAnyActionBusy = uploadingLive || uploadingCloud || backingUp || restoring || restoringCloud;

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="card-title flex items-center gap-2">
          <HardDriveDownload size={16} className="text-brand-700" />
          Backups
        </h4>
        <span className="badge badge-success">On</span>
      </div>

      {/* Status Information Box */}
      <div className="panel p-3 text-xs space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" />
              Hourly live copy
            </div>
            <div className="text-2xs text-slate-500">Replaces one cloud file each hour</div>
          </div>
          <span className="text-2xs font-bold text-slate-600 whitespace-nowrap tabular-nums">
            {settings.lastHourlyCloudBackupTime
              ? new Date(settings.lastHourlyCloudBackupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Pending'}
          </span>
        </div>

        <div className="border-t border-slate-200 pt-2 flex items-start justify-between gap-2">
          <div>
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cloud size={12} className="text-slate-400" />
              Cloud archive every 3 days
            </div>
            <div className="text-2xs text-slate-500">Keeps the last 30 snapshots</div>
          </div>
          <span className="text-2xs font-bold text-slate-600 whitespace-nowrap tabular-nums">
            {settings.lastCloudBackupTime
              ? new Date(settings.lastCloudBackupTime).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : 'Pending'}
          </span>
        </div>
      </div>

      {backupMsg && (
        <div role="status" className={`alert ${backupMsg.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {backupMsg.text}
        </div>
      )}

      {/* Cloud Live State Actions */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-bold text-slate-600">Live copy</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onUploadLiveState}
            disabled={isAnyActionBusy}
            className="btn btn-secondary"
          >
            <CloudUpload size={14} className={uploadingLive ? 'animate-bounce' : ''} />
            <span>{uploadingLive ? 'Uploading…' : 'Upload now'}</span>
          </button>

          <button
            type="button"
            onClick={onRestoreCloudLatest}
            disabled={isAnyActionBusy}
            className="btn btn-secondary"
          >
            <CloudDownload size={14} className={restoringCloud ? 'animate-spin' : ''} />
            <span>{restoringCloud ? 'Restoring…' : 'Restore'}</span>
          </button>
        </div>
      </div>

      {/* Full Archive & Local Actions */}
      <div className="space-y-2 pt-3 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-600">Snapshots</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onTriggerBackup}
            disabled={isAnyActionBusy}
            className="btn btn-secondary"
          >
            <RefreshCcw size={13} className={backingUp ? 'animate-spin' : ''} />
            <span>{backingUp ? 'Saving…' : 'Save locally'}</span>
          </button>

          <button
            type="button"
            onClick={onUploadToCloud}
            disabled={isAnyActionBusy}
            className="btn btn-secondary"
          >
            <Cloud size={13} className={uploadingCloud ? 'animate-bounce' : ''} />
            <span>{uploadingCloud ? 'Uploading…' : 'Save to cloud'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onRestoreBackup}
          disabled={isAnyActionBusy}
          className="btn btn-secondary w-full"
        >
          <HardDriveDownload size={13} className={restoring ? 'animate-spin' : ''} />
          <span>{restoring ? 'Restoring…' : 'Restore from file…'}</span>
        </button>
      </div>
    </div>
  );
};
