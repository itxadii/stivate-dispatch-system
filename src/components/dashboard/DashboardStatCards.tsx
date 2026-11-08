import React from 'react';
import { Truck, FileText, LayoutGrid } from 'lucide-react';
import type { DashboardStats, Dispatch } from '../../types';
import { getVehicleMaxPallets } from '../../types';
import { StatCard, type StatTone } from '../ui';

interface DashboardStatCardsProps {
  stats: DashboardStats;
  dispatchesList: Dispatch[];
}

export const DashboardStatCards: React.FC<DashboardStatCardsProps> = ({ stats, dispatchesList }) => {
  let fleetLoadedPallets = 0;
  let fleetTotalCapacity = 0;

  dispatchesList.forEach((d: any) => {
    const curP = Number(d.total_pallets) || 1;
    const vSize = d.vehicle_size || '32 ft';
    const dispatchCap = getVehicleMaxPallets(vSize);
    fleetLoadedPallets += curP;
    fleetTotalCapacity += dispatchCap;
  });

  const rawFleetUtil = fleetTotalCapacity > 0 ? (fleetLoadedPallets / fleetTotalCapacity) * 100 : 0;
  const fleetUtilizationDisplay = rawFleetUtil % 1 === 0 ? rawFleetUtil.toFixed(0) : rawFleetUtil.toFixed(2);

  const cards = [
    {
      title: "Today's dispatches",
      value: stats.todayDispatches,
      desc: "Created since 12:00 AM",
      icon: Truck,
      tone: "brand" as StatTone,
    },
    {
      title: "Total dispatches",
      value: stats.totalDispatches,
      desc: "All recorded dispatches",
      icon: FileText,
      tone: "success" as StatTone,
    },
    {
      title: "Fleet utilization",
      value: `${fleetUtilizationDisplay}%`,
      desc: `${fleetLoadedPallets.toLocaleString()}/${fleetTotalCapacity.toLocaleString()} pallets loaded`,
      icon: Truck,
      tone: "warning" as StatTone,
    },
    {
      title: "Master pull lists",
      value: stats.totalPullLists,
      desc: "Imported SAP records",
      icon: LayoutGrid,
      tone: "neutral" as StatTone,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <StatCard key={c.title} title={c.title} value={c.value} desc={c.desc} icon={c.icon} tone={c.tone} />
      ))}
    </div>
  );
};
