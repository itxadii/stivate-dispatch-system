import React from 'react';
import { Database } from 'lucide-react';

interface MasterStorageStatsProps {
  totalCount: number;
}

export const MasterStorageStats: React.FC<MasterStorageStatsProps> = ({ totalCount }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-1 flex flex-col justify-between">
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-400 uppercase">Master Storage size</span>
        <h3 className="text-4xl font-extrabold text-slate-800 flex items-center gap-2">
          <Database size={24} className="text-emerald-600" />
          {totalCount}
        </h3>
        <p className="text-xs text-slate-500">Recorded Pull Lists in SQLite</p>
      </div>
    </div>
  );
};
