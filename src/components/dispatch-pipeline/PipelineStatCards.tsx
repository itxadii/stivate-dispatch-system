import React from 'react';
import { Hourglass, Play, CheckCircle, ClipboardList, Clock } from 'lucide-react';
import type { PipelineStats } from '../../types';
import { StatCard, type StatTone } from '../ui';

interface PipelineStatCardsProps {
  stats: PipelineStats;
}

export const PipelineStatCards: React.FC<PipelineStatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Loading trucks',
      value: stats.loadingCount,
      desc: 'Active loading dispatches',
      icon: Hourglass,
      tone: 'warning' as StatTone
    },
    {
      title: 'Ready trucks',
      value: stats.readyCount,
      desc: 'Waiting for departure confirmation',
      icon: Play,
      tone: 'info' as StatTone
    },
    {
      title: 'Completed today',
      value: stats.completedTodayCount,
      desc: 'Dispatched trucks today',
      icon: CheckCircle,
      tone: 'success' as StatTone
    },
    {
      title: 'Pending pull lists',
      value: stats.pendingPullLists,
      desc: 'Remaining to be loaded',
      icon: ClipboardList,
      tone: 'danger' as StatTone
    },
    {
      title: 'Pull lists today',
      value: stats.totalPullListsToday,
      desc: 'Expected load volume today',
      icon: Clock,
      tone: 'brand' as StatTone
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((c) => (
        <StatCard key={c.title} title={c.title} value={c.value} desc={c.desc} icon={c.icon} tone={c.tone} />
      ))}
    </div>
  );
};
