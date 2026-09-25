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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center space-y-4">
          <div className="mx-auto w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Lock size={28} />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Unlock Advanced Settings</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter administrator password to access company profile, printers, database backups, and system updates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
                <Key size={13} className="text-slate-400" />
                Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (passError) setPassError('');
                  }}
                  placeholder="Enter password..."
                  autoFocus
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:bg-white focus:border-[#4BB8FA] font-mono transition-all text-slate-800 font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passError && (
                <p className="text-xs font-bold text-rose-600 pt-1 flex items-center gap-1">
                  <span>⚠</span> {passError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Unlock Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
