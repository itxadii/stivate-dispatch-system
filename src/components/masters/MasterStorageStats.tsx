import React from 'react';
import { Database } from 'lucide-react';
import { StatCard } from '../ui';

interface MasterStorageStatsProps {
  totalCount: number;
}

export const MasterStorageStats: React.FC<MasterStorageStatsProps> = ({ totalCount }) => {
  return (
    <div className="md:col-span-1">
      <StatCard title="Master pull lists" value={totalCount.toLocaleString()} desc="Records imported from SAP" icon={Database} tone="neutral" />
    </div>
  );
};
