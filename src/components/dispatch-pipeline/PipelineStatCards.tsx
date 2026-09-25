import React from 'react';
import { Hourglass, Play, CheckCircle, ClipboardList, Clock } from 'lucide-react';
import type { PipelineStats } from '../../types';

interface PipelineStatCardsProps {
  stats: PipelineStats;
}

export const PipelineStatCards: React.FC<PipelineStatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Loading Trucks',
      value: stats.loadingCount,
      desc: 'Active loading dispatches',
      icon: Hourglass,
      textColor: 'text-amber-600 bg-amber-50 border-amber-100'
    },
    {
      title: 'Ready Trucks',
      value: stats.readyCount,
      desc: 'Waiting for departure confirmation',
      icon: Play,
      textColor: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      title: 'Completed Today',
      value: stats.completedTodayCount,
      desc: 'Dispatched trucks today',
      icon: CheckCircle,
      textColor: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      title: 'Pending Pull Lists',
      value: stats.pendingPullLists,
      desc: 'Remaining to be loaded',
      icon: ClipboardList,
      textColor: 'text-rose-600 bg-rose-50 border-rose-100'
    },
    {
      title: 'Total Pull Lists Today',
      value: stats.totalPullListsToday,
      desc: 'Expected load volume today',
      icon: Clock,
      textColor: 'text-blue-600 bg-blue-50 border-blue-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{c.title}</span>
              <h3 className="text-2xl font-extrabold text-slate-800">{c.value}</h3>
            </div>
            <div className="flex items-center justify-between pt-1">
              <p className="text-[10px] text-slate-500 max-w-[70%] leading-tight">{c.desc}</p>
              <div className={`p-2 rounded-lg border ${c.textColor}`}>
                <Icon size={16} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
