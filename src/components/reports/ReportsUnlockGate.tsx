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
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-lg rounded-2xl p-8 space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 border border-slate-200 text-slate-800 rounded-2xl flex items-center justify-center shadow-inner">
          <Lock size={32} className="text-amber-500" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Protected Reports Access</h3>
          <p className="text-xs font-medium text-slate-500">
            Enter security password to unlock performance reports & Excel export tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
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

          <button
            type="submit"
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <ShieldCheck size={16} />
            <span>Unlock Reports</span>
          </button>
        </form>
      </div>
    </div>
  );
};
