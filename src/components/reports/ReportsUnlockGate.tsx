import React, { useState } from 'react';
import { Lock, Key, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface ReportsUnlockGateProps {
  onUnlockSuccess: () => void;
}

export const ReportsUnlockGate: React.FC<ReportsUnlockGateProps> = ({ onUnlockSuccess }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passError, setPassError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'i3pl@123') {
      onUnlockSuccess();
      setPassError('');
    } else {
      setPassError('Invalid Password. Access Denied.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[500px] p-4">
      <div className="w-full max-w-sm card p-8 space-y-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl grid place-items-center bg-brand-50 text-brand-700">
          <Lock size={26} />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Reports are locked</h3>
          <p className="text-sm text-slate-500">
            Enter the reports password to view and export reports.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
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

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
          >
            <ShieldCheck size={16} />
            <span>Unlock reports</span>
          </button>
        </form>
      </div>
    </div>
  );
};
