import React, { useState } from 'react';
import { Lock, Key, Eye, EyeOff } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({
  isOpen,
  onClose,
  onUnlockSuccess,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passError, setPassError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'i3pl@123') {
      onUnlockSuccess();
      setPasswordInput('');
      setPassError('');
      onClose();
    } else {
      setPassError('Invalid Password. Access Denied.');
    }
  };

  const handleClose = () => {
    setPasswordInput('');
    setPassError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Unlock settings">
      <div className="modal-backdrop" onClick={handleClose} />
      <div className="modal-panel max-w-sm overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-xl grid place-items-center bg-brand-50 text-brand-700">
            <Lock size={26} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">Unlock all settings</h3>
            <p className="text-sm text-slate-500 mt-1">
              Enter the admin password to change company details, printers, backups and updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="field-label flex items-center gap-1.5">
                <Key size={13} className="text-slate-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passError) setPassError('');
                  }}
                  placeholder="Password"
                  autoFocus
                  className="input h-11 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-icon"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passError && (
                <p className="text-xs font-bold text-rose-600 pt-1.5" role="alert">
                  {passError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                Unlock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
