import React, { useEffect, useState, useMemo } from 'react';
import { databaseService, settingsService } from '../../services/ipc';
import type { DashboardStats, Dispatch } from '../../types';
import { VehicleUtilizationExportModal, type DateRangeType } from '../VehicleUtilizationExportModal';
import { DashboardStatCards } from './DashboardStatCards';
import { DispatchTrendChart, type TrendRange } from './DispatchTrendChart';
import { SupervisorShareChart } from './SupervisorShareChart';
import { VehicleUtilizationTracker } from './VehicleUtilizationTracker';
import { RecentDispatchesTable } from './RecentDispatchesTable';
import { DispatchDetailModal } from './DispatchDetailModal';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  onEditDispatch: (id: number) => void;
}

const formatDateTimeDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const norm = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const dObj = new Date(norm);
    if (!isNaN(dObj.getTime())) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      let hours = dObj.getHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mins = String(dObj.getMinutes()).padStart(2, '0');
      return `${dObj.getDate()}-${months[dObj.getMonth()]}-${dObj.getFullYear().toString().slice(-2)} ${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
    }
  } catch (e) {}
  return dateStr;
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab, onEditDispatch }) => {
  const [stats, setStats] = useState<DashboardStats>({
    todayDispatches: 0,
    totalDispatches: 0,
    totalPullLists: 0,
    recentDispatches: [],
    allDispatches: [],
    trendData: [],
    supervisorShare: []
  });
  const [allDispatches, setAllDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<{ date: string; count: number }[]>([]);
  const [trendRange, setTrendRange] = useState<TrendRange>('7days');
  const [trendLoading, setTrendLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  // Vehicle Utilization Tracker Date Range & PDF Export State
  const [trackerDateRange, setTrackerDateRange] = useState<DateRangeType>('all');
  const [trackerCustomFrom, setTrackerCustomFrom] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [trackerCustomTo, setTrackerCustomTo] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Detail Modal State for viewing dispatches from dashboard
  const [selectedDispatch, setSelectedDispatch] = useState<(Dispatch & { items: any[] }) | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleViewDetails = async (id: number) => {
    try {
      const data = await databaseService.getDispatch(id);
      if (data) {
        setSelectedDispatch(data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to view dispatch details:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const [data, disps, sett] = await Promise.all([
        databaseService.getDashboardStats(),
        databaseService.getAllDispatches(),
        settingsService.load().catch(() => null)
      ]);
      setStats(data);
      setAllDispatches(disps && disps.length > 0 ? disps : (data.allDispatches || data.recentDispatches || []));
      if (sett) setSettings(sett);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async (range: string) => {
    setTrendLoading(true);
    try {
      const data = await databaseService.getTrendData(range);
      setTrendData(data);
    } catch (err) {
      console.error('Failed to fetch trend data:', err);
    } finally {
      setTrendLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (!loading && stats.trendData) {
      setTrendData(stats.trendData);
    }
  }, [loading, stats.trendData]);

  useEffect(() => {
    if (!loading) {
      fetchTrendData(trendRange);
    }
  }, [trendRange]);

  const dispatchesList = allDispatches.length > 0 ? allDispatches : (stats.allDispatches || stats.recentDispatches);

  const recentCompletedIds = useMemo(() => {
    const list = allDispatches.length > 0 ? allDispatches : (stats.allDispatches || stats.recentDispatches || []);
    return list
      .filter((d: Dispatch) => d.status === 'completed')
      .slice(0, 5)
      .map((d: Dispatch) => d.id)
      .filter(Boolean) as number[];
  }, [allDispatches, stats]);

  // Date boundaries for Vehicle Utilization Tracker
  const trackerDateBoundaries = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const endStr = formatYMD(now);

    switch (trackerDateRange) {
      case 'all':
        return { startStr: '', endStr: '', label: 'All Time' };
      case '7days': {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past 7 Days (${startStr} to ${endStr})` };
      }
      case '30days': {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past 30 Days (${startStr} to ${endStr})` };
      }
      case '3months': {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 3);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past 3 Months (${startStr} to ${endStr})` };
      }
      case '6months': {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 6);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past 6 Months (${startStr} to ${endStr})` };
      }
      case '1year': {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - 1);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `Past Year (${startStr} to ${endStr})` };
      }
      case 'thisMonth': {
        const d = new Date(now.getFullYear(), now.getMonth(), 1);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `This Month (${startStr} to ${endStr})` };
      }
      case 'thisYear': {
        const d = new Date(now.getFullYear(), 0, 1);
        const startStr = formatYMD(d);
        return { startStr, endStr, label: `This Year (${startStr} to ${endStr})` };
      }
      case 'custom': {
        const from = trackerCustomFrom || endStr;
        const to = trackerCustomTo || endStr;
        return { startStr: from, endStr: to, label: `${from} to ${to}` };
      }
      default:
        return { startStr: '', endStr: '', label: 'All Time' };
    }
  }, [trackerDateRange, trackerCustomFrom, trackerCustomTo]);

  // Filtered dispatches for Vehicle Utilization Tracker
  const trackerDispatchesList = useMemo(() => {
    const { startStr, endStr } = trackerDateBoundaries;
    if (!startStr && !endStr) return dispatchesList;
    return dispatchesList.filter((d: any) => {
      const dYmd = (d.date || '').substring(0, 10);
      if (startStr && dYmd < startStr) return false;
      if (endStr && dYmd > endStr) return false;
      return true;
    });
  }, [dispatchesList, trackerDateBoundaries]);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <DashboardStatCards stats={stats} dispatchesList={dispatchesList} />

      {/* Charts Stack */}
      <div className="space-y-6">
        <DispatchTrendChart
          trendData={trendData}
          trendRange={trendRange}
          setTrendRange={setTrendRange}
          trendLoading={trendLoading}
        />

        <SupervisorShareChart
          dispatchesList={dispatchesList}
          supervisorShareFallback={stats.supervisorShare}
        />
      </div>

      {/* Truck Utilization & Fleet Capacity Breakdown */}
      <VehicleUtilizationTracker
        trackerDateRange={trackerDateRange}
        setTrackerDateRange={setTrackerDateRange}
        trackerCustomFrom={trackerCustomFrom}
        setTrackerCustomFrom={setTrackerCustomFrom}
        trackerCustomTo={trackerCustomTo}
        setTrackerCustomTo={setTrackerCustomTo}
        trackerDateBoundaries={trackerDateBoundaries}
        trackerDispatchesList={trackerDispatchesList}
        settings={settings}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onEditDispatch={onEditDispatch}
        formatDateTimeDisplay={formatDateTimeDisplay}
      />

      {/* Recent Dispatches */}
      <RecentDispatchesTable
        loading={loading}
        recentDispatches={stats.recentDispatches}
        recentCompletedIds={recentCompletedIds}
        setActiveTab={setActiveTab}
        onEditDispatch={onEditDispatch}
        onViewDetails={handleViewDetails}
        formatDateTimeDisplay={formatDateTimeDisplay}
      />

      {/* View Details Modal */}
      <DispatchDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        dispatch={selectedDispatch}
        recentCompletedIds={recentCompletedIds}
        onEditDispatch={onEditDispatch}
        formatDateTimeDisplay={formatDateTimeDisplay}
      />

      {/* Vehicle Utilization PDF Export Modal */}
      <VehicleUtilizationExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allDispatches={allDispatches}
        registeredVehicles={settings?.vehiclesList || []}
        initialVehicle=""
        initialDateRange={trackerDateRange}
        initialCustomFrom={trackerCustomFrom}
        initialCustomTo={trackerCustomTo}
      />
    </div>
  );
};
