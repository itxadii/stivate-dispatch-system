import React, { useState, useEffect } from 'react';
import { databaseService, settingsService } from '../../services/ipc';
import { CardHeader } from '../ui';
import { BarChart3 } from 'lucide-react';
import { ReportsUnlockGate } from './ReportsUnlockGate';
import { ReportControls } from './ReportControls';
import type { ReportType } from './ReportControls';
import { LoadingSummaryTable } from './LoadingSummaryTable';
import { StandardReportTable } from './StandardReportTable';
import { exportLoadingSummaryExcel, exportReportCsv } from './reportUtils';

export const ReportsPage: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('loading-summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>('ALL');
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const s = await settingsService.load();
        if (s && s.addressesList && s.addressesList.length > 0) {
          const list = s.addressesList.map((a: string) => a.split('\n')[0].trim()).filter(Boolean);
          setDestinations(list);
        }
      } catch (e) {
        console.error('Failed to load destination list:', e);
      }
    };
    loadDestinations();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await databaseService.getReports(reportType, startDate || undefined, endDate || undefined, selectedDestination);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchReport();
    }
  }, [reportType, startDate, endDate, selectedDestination, isUnlocked]);

  const handleExportExcel = () => {
    if (reportData.length === 0) return;

    if (reportType === 'loading-summary') {
      exportLoadingSummaryExcel(reportData, startDate, endDate, selectedDestination);
    } else {
      exportReportCsv(reportData, reportType);
    }
  };

  if (!isUnlocked) {
    return <ReportsUnlockGate onUnlockSuccess={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="space-y-6">
      {/* Control panel */}
      <ReportControls
        reportType={reportType}
        setReportType={setReportType}
        selectedDestination={selectedDestination}
        setSelectedDestination={setSelectedDestination}
        destinations={destinations}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onExportExcel={handleExportExcel}
        hasData={reportData.length > 0}
      />

      {/* Report Table Card */}
      <div className="card overflow-hidden">
        <CardHeader
          icon={BarChart3}
          title={reportType === 'loading-summary' ? 'Loading summary' : 'Report'}
          actions={<span className="badge badge-neutral">{reportData.length} {reportData.length === 1 ? 'row' : 'rows'}</span>}
        />

        <div className="overflow-x-auto">
          {loading ? (
            <div className="empty-state">
              Building report…
            </div>
          ) : reportData.length === 0 ? (
            <div className="empty-state">
              No dispatches in this date range. Try widening the dates.
            </div>
          ) : reportType === 'loading-summary' ? (
            <LoadingSummaryTable
              reportData={reportData}
              selectedDestination={selectedDestination}
              startDate={startDate}
              endDate={endDate}
            />
          ) : (
            <StandardReportTable
              reportType={reportType}
              reportData={reportData}
            />
          )}
        </div>
      </div>
    </div>
  );
};
