import React from 'react';
import { Lock, Unlock, Key } from 'lucide-react';
import { CardHeader } from '../ui';

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
    <div className="card">
      <CardHeader
        className="border-b-0"
        title={
          <span className="flex items-center gap-2">
            {isUnlocked ? 'Admin access' : 'Limited access'}
            {isUnlocked ? (
              <span className="badge badge-success"><Unlock size={11} /> Admin</span>
            ) : (
              <span className="badge badge-neutral"><Lock size={11} /> Locked</span>
            )}
          </span>
        }
        subtitle={
          isUnlocked
            ? 'Company details, printers, report emails, backups and updates are unlocked.'
            : 'Edit the dropdown lists used on dispatches. Unlock to change company, printer and backup settings.'
        }
        actions={
          isUnlocked ? (
            <button type="button" onClick={onLock} className="btn btn-secondary">
              <Lock size={14} />
              <span>Lock</span>
            </button>
          ) : (
            <button type="button" onClick={onUnlockClick} className="btn btn-primary">
              <Key size={14} />
              <span>Unlock all settings</span>
            </button>
          )
        }
      />
    </div>
  );
};
