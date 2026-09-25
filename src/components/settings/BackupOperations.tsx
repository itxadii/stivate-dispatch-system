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
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <HardDriveDownload size={16} className="text-blue-500" />
          Database Backups
        </h4>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Dual-Tier Active
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Automated dual-tier backup protection:
      </p>

      {/* Status Information Box */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock size={12} className="text-sky-500" />
              Hourly Live State (latest.db)
            </div>
            <div className="text-[11px] text-slate-500">Overwrites S3 single file • Zero extra storage cost</div>
          </div>
          <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
            {settings.lastHourlyCloudBackupTime
              ? new Date(settings.lastHourlyCloudBackupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Pending'}
          </span>
        </div>

        <div className="border-t border-slate-200/80 pt-2 flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Cloud size={12} className="text-indigo-500" />
              3-Day Cloud Archive
            </div>
            <div className="text-[11px] text-slate-500">Timestamped snapshot history (keeps 30)</div>
          </div>
          <span className="text-[11px] font-medium text-slate-700 whitespace-nowrap">
            {settings.lastCloudBackupTime
              ? new Date(settings.lastCloudBackupTime).toLocaleDateString([], { month: 'short', day: 'numeric' })
              : 'Pending'}
          </span>
        </div>
      </div>

      {backupMsg && (
        <div className={`p-3 rounded-lg text-xs font-semibold border ${backupMsg.type === 'success'
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
          : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
          {backupMsg.text}
        </div>
      )}

      {/* Cloud Live State Actions */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Cloud Live State (Zero Storage Cost)
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onUploadLiveState}
            disabled={isAnyActionBusy}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-bold cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
          >
            <CloudUpload size={14} className={uploadingLive ? 'animate-bounce' : ''} />
            <span>{uploadingLive ? 'Syncing...' : 'Sync Live S3'}</span>
          </button>

          <button
            type="button"
            onClick={onRestoreCloudLatest}
            disabled={isAnyActionBusy}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-bold cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
          >
            <CloudDownload size={14} className={restoringCloud ? 'animate-spin' : ''} />
            <span>{restoringCloud ? 'Restoring...' : 'Restore Live S3'}</span>
          </button>
        </div>
      </div>

      {/* Full Archive & Local Actions */}
      <div className="space-y-2 pt-1 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Historical Archive & Local
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onTriggerBackup}
            disabled={isAnyActionBusy}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
          >
            <RefreshCcw size={13} className={backingUp ? 'animate-spin' : ''} />
            <span>{backingUp ? 'Creating...' : 'Local Snapshot'}</span>
          </button>

          <button
            type="button"
            onClick={onUploadToCloud}
            disabled={isAnyActionBusy}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#4BB8FA] hover:bg-[#35a0dc] text-slate-900 rounded-lg text-xs font-bold cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
          >
            <Cloud size={13} className={uploadingCloud ? 'animate-bounce' : ''} />
            <span>{uploadingCloud ? 'Uploading...' : 'Cloud Archive'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onRestoreBackup}
          disabled={isAnyActionBusy}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold cursor-pointer disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 transition-colors"
        >
          <HardDriveDownload size={13} className={restoring ? 'animate-spin' : ''} />
          <span>{restoring ? 'Restoring...' : 'Restore Local Backup File'}</span>
        </button>
      </div>
    </div>
  );
};
