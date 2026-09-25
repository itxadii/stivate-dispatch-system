import React, { useState, useEffect, useRef, useCallback } from 'react';
import { databaseService, printService, settingsService } from '../../services/ipc';
import type { Dispatch, DispatchItem, AppSettings } from '../../types';
import { copyDispatchPullListsToClipboard } from '../../utils/clipboard';
import { HistoryHeaderAndFilters } from './HistoryHeaderAndFilters';
import { HistoryTable } from './HistoryTable';
import { HistoryDetailModal } from './HistoryDetailModal';
import { HistoryDeleteModal } from './HistoryDeleteModal';

export interface DispatchHistoryProps {
  onEditDispatch?: (id: number) => void;
}

export const DispatchHistoryPage: React.FC<DispatchHistoryProps> = ({ onEditDispatch }) => {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [recentCompletedIds, setRecentCompletedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters State
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detail Modal State
  const [selectedDispatch, setSelectedDispatch] = useState<(Dispatch & { items: DispatchItem[] }) | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Copy Feedback State
  const [copiedModal, setCopiedModal] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState<number | null>(null);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDispatches = useCallback(async (query = '', append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const limit = 200;
      const offset = append ? (page + 1) * limit : 0;

      let data;
      if (query.trim()) {
        data = await databaseService.searchDispatches(query, 'completed', limit, offset);
      } else {
        data = await databaseService.getAllDispatches('completed', limit, offset);
      }

      // Always retrieve the latest top 5 completed DC IDs so edit/delete permissions are always up-to-date
      try {
        const top5Completed = await databaseService.getAllDispatches('completed', 5, 0);
        setRecentCompletedIds(top5Completed.map((d) => d.id).filter(Boolean) as number[]);
      } catch (err) {
        console.error('Failed to load recent completed dispatch IDs:', err);
      }

      if (append) {
        setDispatches((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      } else {
        setDispatches(data);
        setPage(0);
      }
      setHasMore(data.length === limit);
    } catch (err) {
      console.error('Failed to load completed dispatches:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    fetchDispatches();

    const loadSettings = async () => {
      try {
        const data = await settingsService.load();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings in completed dispatches archive:', err);
      }
    };
    loadSettings();
  }, []);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    fetchDispatches(val, false);
  };

  const filteredDispatches = dispatches.filter(d => {
    if (dateFilter && !d.date.startsWith(dateFilter)) return false;
    if (vehicleFilter && !d.vehicle_no.toLowerCase().includes(vehicleFilter.toLowerCase())) return false;
    if (supervisorFilter && supervisorFilter !== '' && d.supplier_name !== supervisorFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (filteredDispatches.length === 0) return;

    const headers = [
      'DC Number',
      'Date',
      'Vehicle No',
      'Supervisor',
      'Total Pull Lists',
      'Total Parts',
      'Consignee Address',
      'Particulars',
      'Scanning By',
      'Verify By',
      'Transaction Type'
    ];

    const rows = filteredDispatches.map(d => [
      d.dc_no,
      d.date,
      d.vehicle_no,
      d.supplier_name,
      d.total_pull_lists ?? 0,
      d.total_parts,
      `"${(d.address || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(d.particular || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      d.scanning_by || '',
      d.verify_by || '',
      d.transaction_type || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `completed_dispatches_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        fetchDispatches(searchQuery, true);
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore, searchQuery, fetchDispatches]);

  const handleViewDetails = async (id: number) => {
    try {
      const data = await databaseService.getDispatch(id);
      if (data) {
        setSelectedDispatch(data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = (id: number) => {
    const targetDisp = dispatches.find((d) => d.id === id);
    const isRecent = recentCompletedIds.includes(id);
    if (targetDisp?.status === 'completed' && !isRecent) {
      setMessage({ text: 'Older completed Delivery Challans are archived and cannot be deleted.', type: 'error' });
      setTimeout(() => setMessage(null), 3500);
      return;
    }
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleCopyModalPullLists = async () => {
    if (!selectedDispatch || !selectedDispatch.items || selectedDispatch.items.length === 0) {
      setMessage({ text: 'No pull lists available to copy.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    const success = await copyDispatchPullListsToClipboard(selectedDispatch, selectedDispatch.items);
    if (success) {
      setCopiedModal(true);
      setTimeout(() => setCopiedModal(false), 2500);
      setMessage({
        text: `Copied ${selectedDispatch.items.length} pull lists for DC ${selectedDispatch.dc_no} to clipboard in email format!`,
        type: 'success'
      });
      setTimeout(() => setMessage(null), 3500);
    } else {
      setMessage({ text: 'Failed to copy to clipboard.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleQuickCopyRow = async (dispatch: Dispatch) => {
    try {
      if (!dispatch.id) return;
      const fullDisp = await databaseService.getDispatch(dispatch.id);
      const items = fullDisp?.items || [];
      if (items.length === 0) {
        setMessage({ text: `No pull lists found for ${dispatch.dc_no}.`, type: 'error' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      const success = await copyDispatchPullListsToClipboard(fullDisp || dispatch, items);
      if (success) {
        setCopiedRowId(dispatch.id);
        setTimeout(() => setCopiedRowId(null), 2500);
        setMessage({
          text: `Copied ${items.length} pull lists for DC ${dispatch.dc_no} to clipboard in email format!`,
          type: 'success'
        });
        setTimeout(() => setMessage(null), 3500);
      }
    } catch (err) {
      console.error('Quick copy row failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const success = await databaseService.deleteDispatch(deleteId);
      if (success) {
        setMessage({ text: 'Dispatch deleted successfully.', type: 'success' });
        fetchDispatches(searchQuery);
        setDeleteModalOpen(false);
        setDeleteId(null);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Cannot delete: Dispatched delivery challans are permanently locked for compliance.', type: 'error' });
        setDeleteModalOpen(false);
        setDeleteId(null);
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message || err}`, type: 'error' });
    }
  };

  const handleReprintChallan = async (disp: Dispatch, items: DispatchItem[]) => {
    try {
      await printService.printChallan(disp, items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReprintBarcodes = async (items: DispatchItem[]) => {
    try {
      await printService.printBarcodes(items, selectedDispatch || undefined);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header, Search, and Filters */}
      <HistoryHeaderAndFilters
        searchQuery={searchQuery}
        onSearch={handleSearch}
        filteredDispatches={filteredDispatches}
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        vehicleFilter={vehicleFilter}
        onVehicleFilterChange={setVehicleFilter}
        supervisorFilter={supervisorFilter}
        onSupervisorFilterChange={setSupervisorFilter}
        settings={settings}
        onExportCSV={handleExportCSV}
      />

      {message && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Dispatches List */}
      <HistoryTable
        loading={loading}
        filteredDispatches={filteredDispatches}
        recentCompletedIds={recentCompletedIds}
        copiedRowId={copiedRowId}
        onViewDetails={handleViewDetails}
        onQuickCopyRow={handleQuickCopyRow}
        onPrintChallan={async (d) => {
          if (!d.id) return;
          try {
            const fullDisp = await databaseService.getDispatch(d.id);
            if (fullDisp) {
              await handleReprintChallan(fullDisp, fullDisp.items || []);
            }
          } catch (e) {
            console.error(e);
          }
        }}
        onEditDispatch={onEditDispatch}
        onDeleteConfirm={handleDeleteConfirm}
        hasMore={hasMore}
        dispatchesCount={dispatches.length}
        loadingMore={loadingMore}
        lastElementRef={lastElementRef}
      />

      {/* Details View Modal */}
      <HistoryDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        selectedDispatch={selectedDispatch}
        recentCompletedIds={recentCompletedIds}
        copiedModal={copiedModal}
        onCopyModalPullLists={handleCopyModalPullLists}
        onEditDispatch={onEditDispatch}
        onReprintBarcodes={handleReprintBarcodes}
        onReprintChallan={handleReprintChallan}
      />

      {/* Delete Confirmation Modal */}
      <HistoryDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default DispatchHistoryPage;
