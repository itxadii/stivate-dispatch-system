import React from 'react';
import { Truck, FileText, LayoutGrid } from 'lucide-react';
import type { DashboardStats, Dispatch } from '../../types';
import { getVehicleMaxPallets } from '../../types';

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
      title: "Today's Dispatches",
      value: stats.todayDispatches,
      desc: "Created since 12:00 AM",
      icon: Truck,
      textColor: "text-blue-600 bg-blue-50",
    },
    {
      title: "Total Dispatches",
      value: stats.totalDispatches,
      desc: "All recorded dispatches",
      icon: FileText,
      textColor: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Fleet Truck Utilization",
      value: `${fleetUtilizationDisplay}%`,
      desc: `${fleetLoadedPallets.toLocaleString()}/${fleetTotalCapacity.toLocaleString()} Pallets Loaded`,
      icon: Truck,
      textColor: "text-amber-600 bg-amber-50",
    },
    {
      title: "Master Pull Lists",
      value: stats.totalPullLists,
      desc: "Imported SAP records",
      icon: LayoutGrid,
      textColor: "text-teal-600 bg-teal-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{c.title}</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">{c.value}</h3>
              <p className="text-xs text-slate-500 font-medium">{c.desc}</p>
            </div>
            <div className={`p-3 sm:p-4 rounded-xl ${c.textColor} font-bold shrink-0`}>
              <Icon size={22} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
