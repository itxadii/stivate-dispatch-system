import React, { useEffect, useState, useCallback } from 'react';
import { databaseService, settingsService } from '../../services/ipc';
import type { Dispatch, PipelineStats } from '../../types';
import type { ButtonStatus } from '../animations';
import { PipelineStatCards } from './PipelineStatCards';
import { PipelineFilterBar } from './PipelineFilterBar';
import { PipelineTable } from './PipelineTable';
import { CreateDispatchModal } from './CreateDispatchModal';
import { DeleteDispatchModal } from './DeleteDispatchModal';

export interface DispatchPipelineProps {
  onEditDispatch: (id: number) => void;
  triggerNewDispatch?: boolean;
  onNewDispatchTriggered?: () => void;
}

const getNowDateTimeString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const DispatchPipelinePage: React.FC<DispatchPipelineProps> = ({
  onEditDispatch,
  triggerNewDispatch = false,
  onNewDispatchTriggered
}) => {
  const [stats, setStats] = useState<PipelineStats>({
    loadingCount: 0,
    readyCount: 0,
    completedTodayCount: 0,
    pendingPullLists: 0,
    totalPullListsToday: 0
  });
  const [activeDispatches, setActiveDispatches] = useState<(Dispatch & { loadedCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'loading' | 'ready'>('all');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('all');

  // New Dispatch Popup Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete Dispatch Modal & Feedback State
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; dc_no: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [newDispatch, setNewDispatch] = useState({
    dc_no: '',
    date: getNowDateTimeString(),
    vehicle_no: '',
    vehicle_size: '32 ft',
    supplier_name: '',
    address: '',
    total_pallets: 1,
    total_parts: 0,
    particular: 'AS PER LIST',
    scanning_by: '',
    verify_by: '',
    transaction_type: '',
    created_by: 'Operator',
    status: 'loading' as const,
    is_empty_pallets: false,
  });

  const fetchPipelineData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch stats
      const pipelineStats = await databaseService.getPipelineStats();
      setStats(pipelineStats);

      // 2. Fetch active dispatches (loading + ready)
      const data = await databaseService.getAllDispatches(['loading', 'ready']);

      // Calculate loaded items count and total pull lists count for progress column
      const dispatchesWithCount = await Promise.all(
        data.map(async (d) => {
          if (!d.id) return { ...d, loadedCount: 0, totalPullLists: 0 };
          const fullDispatch = await databaseService.getDispatch(d.id);
          const items = fullDispatch?.items || [];
          return {
            ...d,
            loadedCount: items.filter((item: any) => !item.pull_list_no.endsWith('_pending')).length,
            totalPullLists: items.length
          };
        })
      );

      setActiveDispatches(dispatchesWithCount);
    } catch (err) {
      console.error('Failed to load pipeline data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipelineData();
  }, [fetchPipelineData]);

  // Load Settings
  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        const loaded = await settingsService.load();
        setSettings(loaded);
      } catch (e) {
        console.error('Failed to load settings in pipeline:', e);
      }
    };
    loadSettingsData();
  }, []);

  // Handle Ctrl+N trigger from App.tsx
  useEffect(() => {
    if (triggerNewDispatch) {
      handleOpenNewModal();
      if (onNewDispatchTriggered) onNewDispatchTriggered();
    }
  }, [triggerNewDispatch, settings]);

  const handleOpenNewModal = () => {
    const dateStr = getNowDateTimeString();
    setNewDispatch({
      dc_no: '',
      date: dateStr,
      vehicle_no: settings?.defaultVehicleNo || '',
      vehicle_size: '32 ft',
      supplier_name: settings?.defaultSupplier || '',
      address: (settings?.defaultAddress && settings.defaultAddress.toUpperCase() !== 'AS PER LIST')
        ? settings.defaultAddress
        : (settings?.addressesList?.find((a: string) => a && a.toUpperCase() !== 'AS PER LIST') || settings?.defaultAddress || ''),
      total_pallets: 1,
      total_parts: 0,
      particular: 'AS PER LIST',
      scanning_by: settings?.defaultScanner || '',
      verify_by: settings?.defaultVerifier || '',
      transaction_type: '',
      created_by: 'Operator',
      status: 'loading' as const,
      is_empty_pallets: false,
    });
    setFormError(null);
    setIsNewModalOpen(true);
  };

  const handleNewDispatchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewDispatch((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setNewDispatch((prev) => ({
        ...prev,
        [name]: name === 'total_pallets' ? Number(value) : value
      }));
    }
  };

  const [createStatus, setCreateStatus] = useState<ButtonStatus>('idle');

  const handleNewDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDispatch.vehicle_no.trim() || !newDispatch.supplier_name.trim()) {
      setFormError('Vehicle Number and Customer/Supervisor Name are required.');
      setCreateStatus('error');
      setTimeout(() => setCreateStatus('idle'), 1500);
      return;
    }

    setCreateStatus('loading');
    try {
      const dispatchData = { ...newDispatch, dc_no: '' };
      const res = await databaseService.saveDispatch(dispatchData, []);
      if (res && res.id) {
        setCreateStatus('success');

        // Update local settings vehicles list if new truck number added
        if (newDispatch.vehicle_no && settings) {
          const cleanNo = newDispatch.vehicle_no.trim().toUpperCase();
          const currentList = settings.vehiclesList || [];
          if (!currentList.some((v: string) => v.trim().toUpperCase() === cleanNo)) {
            setSettings((prevSettings: any) =>
              prevSettings ? { ...prevSettings, vehiclesList: [...(prevSettings.vehiclesList || []), cleanNo] } : prevSettings
            );
          }
        }

        setTimeout(async () => {
          setIsNewModalOpen(false);
          setCreateStatus('idle');
          await fetchPipelineData();
          onEditDispatch(res.id);
        }, 600);
      } else {
        setCreateStatus('error');
        setFormError('Failed to create dispatch. Ensure database connection is stable.');
        setTimeout(() => setCreateStatus('idle'), 1500);
      }
    } catch (err: any) {
      console.error(err);
      setCreateStatus('error');
      setFormError(`Creation failed: ${err.message || err}`);
      setTimeout(() => setCreateStatus('idle'), 1500);
    }
  };

  const handleDeleteDispatch = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const success = await databaseService.deleteDispatch(deleteTarget.id);
      if (success) {
        setFeedbackMessage({ text: `Dispatch ${deleteTarget.dc_no} deleted successfully.`, type: 'success' });
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        await fetchPipelineData();
        setTimeout(() => setFeedbackMessage(null), 3500);
      } else {
        setFeedbackMessage({ text: 'Cannot delete: Dispatched delivery challans are permanently locked.', type: 'error' });
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        setTimeout(() => setFeedbackMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Delete dispatch failed:', err);
      setFeedbackMessage({ text: `Failed to delete dispatch: ${err.message || err}`, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const supervisorList = Array.from(
    new Set([
      ...(settings?.suppliersList || []),
      ...activeDispatches.map((d) => d.supplier_name).filter(Boolean),
    ])
  );

  const filteredDispatches = activeDispatches.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) {
      return false;
    }

    if (selectedSupervisor !== 'all' && (d.supplier_name || '').toLowerCase() !== selectedSupervisor.toLowerCase()) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchDc = (d.dc_no || '').toLowerCase().includes(q);
      const matchVehicle = (d.vehicle_no || '').toLowerCase().includes(q);
      const matchSupervisor = (d.supplier_name || '').toLowerCase().includes(q);
      const matchAddress = (d.address || '').toLowerCase().includes(q);
      const matchParticular = (d.particular || '').toLowerCase().includes(q);

      return matchDc || matchVehicle || matchSupervisor || matchAddress || matchParticular;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Statistic Cards */}
      <PipelineStatCards stats={stats} />

      {/* Feedback Alert Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold border ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      {/* Main Pipeline Table with Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <PipelineFilterBar
          filteredCount={filteredDispatches.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          selectedSupervisor={selectedSupervisor}
          setSelectedSupervisor={setSelectedSupervisor}
          supervisorList={supervisorList}
          onOpenNewModal={handleOpenNewModal}
        />

        <PipelineTable
          loading={loading}
          activeDispatchesCount={activeDispatches.length}
          filteredDispatches={filteredDispatches}
          searchQuery={searchQuery}
          onClearSearch={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setSelectedSupervisor('all');
          }}
          onEditDispatch={onEditDispatch}
          onDeleteClick={(target) => {
            setDeleteTarget(target);
            setIsDeleteModalOpen(true);
          }}
        />
      </div>

      {/* Create New Dispatch Modal */}
      <CreateDispatchModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        newDispatch={newDispatch}
        onChange={handleNewDispatchChange}
        onSubmit={handleNewDispatchSubmit}
        formError={formError}
        createStatus={createStatus}
        settings={settings}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDispatchModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteDispatch}
      />
    </div>
  );
};

export default DispatchPipelinePage;
