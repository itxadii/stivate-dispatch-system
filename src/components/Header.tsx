import React, { useEffect, useState } from 'react';
import { Database, Clock, WifiOff, Menu } from 'lucide-react';
import { databaseService } from '../services/ipc';

interface HeaderProps {
  title: string;
  companyName: string;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  companyName,
  onToggleMobileSidebar,
}) => {
  const [time, setTime] = useState<string>('');
  const [dbActive, setDbActive] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkDb = async () => {
      try {
        await databaseService.getDashboardStats();
        setDbActive(true);
      } catch (err) {
        console.error('Database diagnostic check failed:', err);
        setDbActive(false);
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 h-16 px-3 sm:px-6 flex items-center justify-between select-none shrink-0 gap-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden btn btn-ghost btn-icon"
            aria-label="Open Navigation"
          >
            <Menu size={22} />
          </button>
        )}
        <h2 className="text-lg font-bold text-slate-900 leading-tight whitespace-nowrap truncate">{title}</h2>
        <div className="h-4 w-px bg-slate-200 hidden sm:block flex-shrink-0" />
        <span className="text-sm text-slate-500 hidden md:inline whitespace-nowrap truncate">{companyName}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Offline indicator */}
        <div className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 whitespace-nowrap">
          <WifiOff size={14} className="text-slate-400 flex-shrink-0" />
          <span className="hidden sm:inline">Local mode</span>
        </div>

        {/* DB Connected status symbol */}
        <div 
          className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-xs font-bold whitespace-nowrap transition-colors ${
            dbActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
          }`}
          title={dbActive ? 'Database: Active' : 'Database: Disconnected'}
        >
          <Database size={14} className={dbActive ? 'text-emerald-500' : 'text-rose-500'} />
          <span className="hidden lg:inline">{dbActive ? 'Database online' : 'Database offline'}</span>
        </div>

        {/* Time */}
        <div className="hidden sm:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 tabular-nums whitespace-nowrap">
          <Clock size={14} className="text-slate-400 flex-shrink-0" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
};
