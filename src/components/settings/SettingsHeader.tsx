import React from 'react';
import { Lock, Unlock, Key } from 'lucide-react';

interface SettingsHeaderProps {
  isUnlocked: boolean;
  onLock: () => void;
  onUnlockClick: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  isUnlocked,
  onLock,
  onUnlockClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {isUnlocked ? 'System Settings & Logistics Master' : 'Logistics Dropdown Options'}
          </h2>
          {isUnlocked ? (
            <span className="text-[11px] px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold flex items-center gap-1">
              <Unlock size={12} /> Admin Unlocked
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold flex items-center gap-1">
              <Lock size={12} /> Protected Mode
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {isUnlocked
            ? 'Full administrator mode active. Company details, printers, database backups, and updates are unlocked.'
            : 'Customize dropdown lists for consignee addresses, supervisors, scanning operators, verifiers, and vehicle masters.'}
        </p>
      </div>

      <div>
        {isUnlocked ? (
          <button
            type="button"
            onClick={onLock}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300 shadow-sm"
          >
            <Lock size={13} />
            <span>Lock Advanced Settings</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onUnlockClick}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Key size={13} className="text-amber-400" />
            <span>Unlock All Settings</span>
          </button>
        )}
      </div>
    </div>
  );
};
