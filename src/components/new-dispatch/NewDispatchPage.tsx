import React, { useState, useEffect, useRef } from 'react';
import { databaseService, printService, settingsService } from '../../services/ipc';
import type { Dispatch, DispatchItem, AppSettings } from '../../types';
import { copyDispatchPullListsToClipboard } from '../../utils/clipboard';
import { DispatchCompleteAnimation } from '../animations';
import type { ButtonStatus } from '../animations';
import { Sliders } from 'lucide-react';
import { NewDispatchHeader } from './NewDispatchHeader';
import { DispatchLogisticsPanel } from './DispatchLogisticsPanel';
import { DispatchItemsSection } from './DispatchItemsSection';
import { ManualItemModal } from './ManualItemModal';
import { ConfirmDepartureModal } from './ConfirmDepartureModal';

export interface NewDispatchProps {
  editId?: number | null;
  onClearEditId?: () => void;
  setActiveTab: (tab: string) => void;
  previousTab?: string;
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

export const NewDispatchPage: React.FC<NewDispatchProps> = ({
  editId = null,
  onClearEditId,
  setActiveTab,
  previousTab = 'dashboard'
}) => {
  const [dispatch, setDispatch] = useState<Partial<Dispatch>>({
    dc_no: '',
    date: getNowDateTimeString(),
    vehicle_no: '',
    supplier_name: '',
    address: '',
    total_pallets: 1,
    total_parts: 0,
    particular: 'AS PER LIST',
    scanning_by: '',
    verify_by: '',
    transaction_type: '',
    created_by: 'Operator',
    status: 'loading',
    is_empty_pallets: false,
  });

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [items, setItems] = useState<DispatchItem[]>([]);
  const [pullListInput, setPullListInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [showCompletionAnim, setShowCompletionAnim] = useState(false);
  const [markReadyStatus, setMarkReadyStatus] = useState<ButtonStatus>('idle');

  // Manual Entry Modal for unknown pull lists
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [showLogistics, setShowLogistics] = useState(false);
  const [isManualPending, setIsManualPending] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);
  const [manualItem, setManualItem] = useState<{
    pull_list_no: string;
    id_number: string;
    kit_type: string;
    workcell: string;
    parts: number | string;
  }>({
    pull_list_no: '',
    id_number: '',
    kit_type: '',
    workcell: '',
    parts: ''
  });

  const scanInputRef = useRef<HTMLInputElement>(null);

  // Ref to hold the latest dispatch and items state for unmount autosave
  const latestStateRef = useRef({ dispatch, items });
  useEffect(() => {
    latestStateRef.current = { dispatch, items };
  }, [dispatch, items]);

  useEffect(() => {
    return () => {
      const { dispatch: d, items: its } = latestStateRef.current;
      // Do not overwrite completed dispatches during unmount
      if (d.status === 'completed') {
        return;
      }
      if (d.vehicle_no && d.supplier_name) {
        const dispatchToSave = { ...d, total_pallets: d.total_pallets || 1, is_empty_pallets: d.is_empty_pallets ? 1 : 0 };
        void databaseService.saveDispatch(dispatchToSave, its);
      }
    };
  }, []);

  // Load existing dispatch for edit and settings for defaults
  useEffect(() => {
    const loadSettingsAndDispatchData = async () => {
      setLoading(true);
      try {
        const loadedSettings = await settingsService.load();
        setSettings(loadedSettings);

        if (editId) {
          const data = await databaseService.getDispatch(editId);
          if (data) {
            setDispatch({
              id: data.id,
              dc_no: data.dc_no,
              date: data.date,
              vehicle_no: data.vehicle_no,
              supplier_name: data.supplier_name,
              address: data.address,
              total_pallets: data.total_pallets,
              total_parts: data.total_parts,
              created_by: data.created_by,
              particular: data.particular || 'AS PER LIST',
              scanning_by: data.scanning_by || '',
              verify_by: data.verify_by || '',
              transaction_type: data.transaction_type || '',
              status: (data.status as any) === 'draft' || !data.status ? 'loading' : data.status,
              is_empty_pallets: Boolean(data.is_empty_pallets),
            });
            setItems(data.items || []);
          }
        } else {
          // Pre-fill with default values from app settings
          const defaultAddr = (loadedSettings.defaultAddress && loadedSettings.defaultAddress.toUpperCase() !== 'AS PER LIST')
            ? loadedSettings.defaultAddress
            : (loadedSettings.addressesList?.find((a: string) => a && a.toUpperCase() !== 'AS PER LIST') || '');
          setDispatch((prev) => ({
            ...prev,
            address: defaultAddr,
            supplier_name: loadedSettings.defaultSupplier || '',
            scanning_by: loadedSettings.defaultScanner || '',
            verify_by: loadedSettings.defaultVerifier || '',
            vehicle_no: loadedSettings.defaultVehicleNo || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load settings or edit data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettingsAndDispatchData();
  }, [editId]);

  // Keep scanner focused
  useEffect(() => {
    if (!manualModalOpen && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [manualModalOpen]);

  // Calculate total parts dynamically
  useEffect(() => {
    const sum = items.reduce((acc, curr) => acc + (curr.parts || 0), 0);
    setDispatch((prev) => ({ ...prev, total_parts: sum }));
  }, [items]);

  // Scan input handling
  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = pullListInput.trim();
    if (!query) return;

    // Collapse multiple spaces and strip FW:/RE: prefixes
    let cleanText = query.replace(/\s+/g, ' ').trim();
    cleanText = cleanText.replace(/^(FW:|FWD:|RE:)\s*/i, '').trim();

    const parts = cleanText.split(' ');

    // 1. Check if it matches the multi-part email subject format
    if (parts.length >= 4) {
      const idNumber = parts[0];
      const pullListNo = parts[1];
      const kitType = parts[2];
      const workcell = parts[3];
      const numParts = parts[4] ? (parseInt(parts[4], 10) || 1) : 1;

      // Verify basic patterns: ID should be digits, Pull List is alphanumeric (allowing hyphens/underscores)
      if (/^\d+$/.test(idNumber) && /^[A-Z0-9_-]+$/i.test(pullListNo)) {
        // Check if duplicate in current list (loaded or pending)
        const cleanNo = pullListNo.toUpperCase();
        if (items.some(item => item.pull_list_no.replace(/_pending$/, '').toUpperCase() === cleanNo)) {
          setSaveStatus({ text: `Pull List ${pullListNo} already added.`, type: 'error' });
          setPullListInput('');
          setTimeout(() => setSaveStatus(null), 3000);
          return;
        }

        const newItem: DispatchItem = {
          pull_list_no: `${cleanNo}_pending`, // starts as pending since it was pasted/typed in bulk!
          id_number: idNumber,
          kit_type: kitType,
          workcell: workcell,
          parts: numParts
        };

        setItems((prev) => [newItem, ...prev]);
        setPullListInput('');
        setSaveStatus(null);

        // Auto-cache to master database in background so it can be searched
        try {
          databaseService.importMasterData([{
            ...newItem,
            pull_list_no: cleanNo
          }]);
        } catch (err) {
          console.error('Failed to auto-cache master:', err);
        }
        return;
      }
    }

    // 2. Check if it's a single Pull List Number
    if (parts.length === 1 && /^[A-Z0-9_-]+$/i.test(cleanText)) {
      setPullListInput('');
      await handleMarkIndividualLoaded(cleanText);
      return;
    }

    // 3. Fallback: If it does not match standard 5-part pattern, treat as manual description/item
    setPullListInput('');
    await handleMarkIndividualLoaded(cleanText);
  };

  const handleMarkIndividualLoaded = async (pullListNo: string) => {
    const cleanText = pullListNo.replace(/\s+/g, ' ').trim().toUpperCase();
    if (!cleanText) return;

    // Check if it already exists as loaded in items list (no _pending suffix)
    const alreadyLoaded = items.some(item => item.pull_list_no === cleanText);
    if (alreadyLoaded) {
      setSaveStatus({ text: `Pull List ${cleanText} already loaded.`, type: 'error' });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    // Check if it already exists as pending in items list (ends with _pending)
    const pendingIdx = items.findIndex(item => item.pull_list_no === `${cleanText}_pending`);
    if (pendingIdx !== -1) {
      // Promote it to loaded (strip _pending suffix)
      handleConfirmLoad(pendingIdx);
      setSaveStatus({ text: `Pull List ${cleanText} loaded successfully.`, type: 'success' });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }

    try {
      const masterItem = await databaseService.searchPullList(cleanText);
      if (masterItem) {
        const newItem: DispatchItem = {
          pull_list_no: masterItem.pull_list_no,
          id_number: masterItem.id_number || '',
          kit_type: masterItem.kit_type || '',
          workcell: masterItem.workcell || '',
          parts: masterItem.parts || 1
        };
        setItems((prev) => [newItem, ...prev]);
        setSaveStatus({ text: `Pull List ${cleanText} marked loaded successfully.`, type: 'success' });
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        // Prefill manual item and open modal
        setIsManualPending(false);
        setManualItem({
          pull_list_no: cleanText,
          id_number: '',
          kit_type: '',
          workcell: '',
          parts: ''
        });
        setManualModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to query database:', err);
    }
  };

  const handleManualItemSave = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryName = (manualItem.pull_list_no || manualItem.kit_type || manualItem.id_number || '').trim();
    if (!primaryName) {
      setManualError("Please enter at least a Pull List Number or Description.");
      return;
    }

    const cleanNo = (manualItem.pull_list_no ? manualItem.pull_list_no.trim() : primaryName).toUpperCase();
    const resolvedPullListNo = isManualPending ? `${cleanNo}_pending` : cleanNo;

    const newItem: DispatchItem = {
      pull_list_no: resolvedPullListNo,
      id_number: (manualItem.id_number || '').trim(),
      kit_type: (manualItem.kit_type || '').trim(),
      workcell: (manualItem.workcell || '').trim(),
      parts: Number(manualItem.parts) > 0 ? Number(manualItem.parts) : 0
    };

    setItems((prev) => [newItem, ...prev]);

    // If dispatch particular is still the default 'AS PER LIST', update it with the description
    setDispatch((prev) => {
      if (!prev.particular || prev.particular === 'AS PER LIST') {
        return { ...prev, particular: cleanNo };
      }
      return prev;
    });

    setManualModalOpen(false);
    setManualError(null);
    setPullListInput('');

    // Ask to add to master database (strip _pending suffix so master has clean pull list)
    try {
      databaseService.importMasterData([{
        ...newItem,
        pull_list_no: cleanNo
      }]);
    } catch (err) {
      console.error('Failed to auto-cache to master data:', err);
    }
  };

  const handleOpenManualModal = () => {
    setManualItem({
      pull_list_no: '',
      id_number: '',
      kit_type: '',
      workcell: '',
      parts: ''
    });
    setIsManualPending(true);
    setManualError(null);
    setManualModalOpen(true);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirmLoad = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      const targetItem = next[idx];
      if (targetItem && targetItem.pull_list_no.endsWith('_pending')) {
        next[idx] = {
          ...targetItem,
          pull_list_no: targetItem.pull_list_no.replace(/_pending$/, '')
        };
      }
      return next;
    });
  };

  const handleToggleVerify = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      const targetItem = next[idx];
      if (!targetItem) return next;
      const isCurrentlyPending = targetItem.pull_list_no.endsWith('_pending');
      next[idx] = {
        ...targetItem,
        pull_list_no: isCurrentlyPending
          ? targetItem.pull_list_no.replace(/_pending$/, '')
          : `${targetItem.pull_list_no}_pending`
      };
      return next;
    });
  };

  const handleVerifyAll = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        pull_list_no: item.pull_list_no.replace(/_pending$/, '')
      }))
    );
    setSaveStatus({ text: 'All pull lists marked as verified.', type: 'success' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const [copiedMail, setCopiedMail] = useState(false);

  const handleCopyPullLists = async () => {
    if (items.length === 0) {
      setSaveStatus({ text: 'No pull lists to copy.', type: 'error' });
      setTimeout(() => setSaveStatus(null), 3000);
      return;
    }
    const success = await copyDispatchPullListsToClipboard(dispatch, items);
    if (success) {
      setCopiedMail(true);
      setTimeout(() => setCopiedMail(false), 2500);
      setSaveStatus({
        text: `Copied ${items.length} pull lists for DC ${dispatch.dc_no || 'Draft'} to clipboard in email format!`,
        type: 'success'
      });
      setTimeout(() => setSaveStatus(null), 3500);
    } else {
      setSaveStatus({ text: 'Failed to copy to clipboard.', type: 'error' });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDispatchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setDispatch((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setDispatch((prev) => ({
        ...prev,
        [name]: name === 'total_pallets' ? Number(value) : value
      }));
    }
  };

  const handleSave = async () => {
    if (!dispatch.vehicle_no || !dispatch.supplier_name) {
      setSaveStatus({ text: 'Please fill in VEHICLE NO and SUP NAME.', type: 'error' });
      return null;
    }

    setLoading(true);
    setSaveStatus(null);
    try {
      const dispatchToSave = { ...dispatch, total_pallets: dispatch.total_pallets || 1, is_empty_pallets: dispatch.is_empty_pallets ? 1 : 0 };
      const res = await databaseService.saveDispatch(dispatchToSave, items);
      if (res && res.id) {
        setDispatch((prev) => ({ ...prev, id: res.id, dc_no: res.dc_no }));
        setSaveStatus({ text: `Dispatch ${res.dc_no} saved successfully!`, type: 'success' });
        
        // Update local settings vehicles list if new truck number added
        if (dispatch.vehicle_no && settings) {
          const cleanNo = dispatch.vehicle_no.trim().toUpperCase();
          const currentList = settings.vehiclesList || [];
          if (!currentList.some((v) => v.trim().toUpperCase() === cleanNo)) {
            setSettings((prevSettings) =>
              prevSettings ? { ...prevSettings, vehiclesList: [...(prevSettings.vehiclesList || []), cleanNo] } : prevSettings
            );
          }
        }

        // Redirect to active pipeline if this is a newly created dispatch
        if (!editId) {
          setTimeout(() => {
            setActiveTab('pipeline');
          }, 1000);
        }
        return res;
      }
      return null;
    } catch (err: any) {
      setSaveStatus({ text: `Save failed: ${err.message || err}`, type: 'error' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePrintCombinedDispatch = async () => {
    const savedDispatch = dispatch.dc_no ? dispatch : await handleSave();
    const dispatchToPrint = {
      ...dispatch,
      dc_no: savedDispatch?.dc_no || dispatch.dc_no,
    };

    if (!dispatchToPrint.dc_no) return;

    if (dispatch.is_empty_pallets) {
      try {
        setLoading(true);
        await printService.printChallan(dispatchToPrint as Dispatch, items);
        setSaveStatus({ text: 'Empty Pallet Challan print command sent successfully.', type: 'success' });
      } catch (err) {
        console.error(err);
        setSaveStatus({ text: 'Printing Challan failed.', type: 'error' });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (items.length === 0) {
      setSaveStatus({ text: 'Add items first before printing the combined challan and barcode set.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      await printService.printCombinedDispatch(dispatchToPrint as Dispatch, items);
      const barcodePages = Math.max(1, Math.ceil(items.length / 15));
      const totalBarcodes = barcodePages * 3;
      const totalPages = 3 + totalBarcodes;
      setSaveStatus({
        text: `Combined print set sent: 3 Challans + ${totalBarcodes} Barcodes (${totalPages} pages in total).`,
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      setSaveStatus({ text: 'Printing combined challan and barcodes failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBarcodes = async () => {
    if (dispatch.is_empty_pallets || items.length === 0) {
      setSaveStatus({ text: 'No barcode items to print for Empty Pallets Return.', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      const savedDispatch = dispatch.dc_no ? dispatch : await handleSave();
      const dispatchToPrint = {
        ...dispatch,
        dc_no: savedDispatch?.dc_no || dispatch.dc_no,
      };
      await printService.printBarcodes(items, dispatchToPrint as Dispatch);
      setSaveStatus({ text: 'Barcode print command sent successfully.', type: 'success' });
    } catch (err) {
      setSaveStatus({ text: 'Failed to print barcodes.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintChallan = async () => {
    try {
      setLoading(true);
      const savedDispatch = dispatch.dc_no ? dispatch : await handleSave();
      const dispatchToPrint = {
        ...dispatch,
        dc_no: savedDispatch?.dc_no || dispatch.dc_no,
      };
      if (!dispatchToPrint.dc_no) {
        setSaveStatus({ text: 'Failed to generate DC number for challan.', type: 'error' });
        return;
      }
      await printService.printChallan(dispatchToPrint as Dispatch, items);
      setSaveStatus({ text: 'Challan PDF print command sent successfully.', type: 'success' });
    } catch (err) {
      setSaveStatus({ text: 'Failed to print Challan PDF.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReady = async () => {
    if (!dispatch.vehicle_no || !dispatch.supplier_name) {
      setSaveStatus({ text: 'Please fill in VEHICLE NO and SUP NAME.', type: 'error' });
      setMarkReadyStatus('error');
      setTimeout(() => setMarkReadyStatus('idle'), 1500);
      return;
    }
    setMarkReadyStatus('loading');
    setLoading(true);
    setSaveStatus(null);
    try {
      const updatedDispatch = { ...dispatch, status: 'ready' as const, is_empty_pallets: dispatch.is_empty_pallets ? 1 : 0 };
      const res = await databaseService.saveDispatch(updatedDispatch, items);
      if (res && res.id) {
        setDispatch((prev) => ({ ...prev, status: 'ready' }));
        setMarkReadyStatus('success');
        setSaveStatus({ text: 'Dispatch marked as READY. Waiting for complete confirmation.', type: 'success' });
        setTimeout(() => {
          setMarkReadyStatus('idle');
        }, 1200);
      } else {
        setMarkReadyStatus('error');
        setTimeout(() => setMarkReadyStatus('idle'), 1500);
      }
    } catch (err: any) {
      setMarkReadyStatus('error');
      setSaveStatus({ text: `Failed to mark ready: ${err.message || err}`, type: 'error' });
      setTimeout(() => setMarkReadyStatus('idle'), 1500);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDispatch = async () => {
    if (!dispatch.id) return;

    const totalPullLists = items.length;
    const loadedCount = items.filter(item => !item.pull_list_no.endsWith('_pending')).length;
    const hasPending = items.some(item => item.pull_list_no.endsWith('_pending'));

    if (!dispatch.is_empty_pallets) {
      if (totalPullLists === 0) {
        setSaveStatus({
          text: 'Cannot complete dispatch: No pull lists have been added to this dispatch.',
          type: 'error'
        });
        setConfirmCompleteOpen(false);
        return;
      }

      if (hasPending || loadedCount < totalPullLists) {
        setSaveStatus({
          text: `Cannot complete dispatch: Not all pull lists are verified (${loadedCount} of ${totalPullLists} verified). Please scan or verify all pending pull lists first.`,
          type: 'error'
        });
        setConfirmCompleteOpen(false);
        return;
      }
    }

    setLoading(true);
    setSaveStatus(null);
    setConfirmCompleteOpen(false);
    try {
      const completionTimestamp = getNowDateTimeString();
      const updatedDispatch = { 
        ...dispatch, 
        status: 'completed' as const,
        date: completionTimestamp,
        is_empty_pallets: dispatch.is_empty_pallets ? 1 : 0
      };
      const res = await databaseService.saveDispatch(updatedDispatch, items);
      if (res && res.id) {
        setDispatch(updatedDispatch);
        setSaveStatus({ text: `Dispatch ${dispatch.dc_no} completed successfully and archived at ${formatDateTimeDisplay(completionTimestamp)}!`, type: 'success' });
        setShowCompletionAnim(true);
      }
    } catch (err: any) {
      setSaveStatus({ text: `Failed to complete dispatch: ${err.message || err}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onClearEditId) onClearEditId();
    setActiveTab(previousTab);
  };

  // Keyboard Shortcuts within screen
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key.toLowerCase() === 's') {
          e.preventDefault();
          e.stopPropagation();
          void handleSave();
          return;
        }
        if (e.key.toLowerCase() === 'p') {
          e.preventDefault();
          e.stopPropagation();
          void handlePrintCombinedDispatch();
          return;
        }
        if (e.key.toLowerCase() === 'b') {
          e.preventDefault();
          e.stopPropagation();
          void handlePrintCombinedDispatch();
          return;
        }
      }
    };
    document.addEventListener('keydown', handleShortcuts, true);
    return () => document.removeEventListener('keydown', handleShortcuts, true);
  }, [dispatch, items, settings]);

  return (
    <div className="space-y-6">
      {/* Top Header Row with Back Button if editing */}
      <NewDispatchHeader
        editId={editId}
        dispatch={dispatch}
        items={items}
        loading={loading}
        markReadyStatus={markReadyStatus}
        onCancel={handleCancel}
        onSave={handleSave}
        onPrintCombined={handlePrintCombinedDispatch}
        onPrintBarcodes={handlePrintBarcodes}
        onPrintChallan={handlePrintChallan}
        onMarkReady={handleMarkReady}
        onOpenConfirmComplete={() => setConfirmCompleteOpen(true)}
      />

      {saveStatus && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${
          saveStatus.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {saveStatus.text}
        </div>
      )}

      {/* Main Form Fields Grid */}
      <div className="flex gap-6 items-start">
        {/* Left Toggle Sidebar Trigger */}
        <div className="flex flex-col gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <button
            type="button"
            onClick={() => setShowLogistics(!showLogistics)}
            className={`p-2 rounded-lg transition-all cursor-pointer border ${
              showLogistics
                ? 'bg-[#4BB8FA]/10 text-[#4BB8FA] border-[#4BB8FA]/20'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
            title="Toggle Dispatch Logistics Panel"
          >
            <Sliders size={18} />
          </button>
        </div>

        {/* Dynamic Horizontal Columns Layout */}
        <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Side: Dispatch Metadata */}
          {showLogistics && (
            <DispatchLogisticsPanel
              dispatch={dispatch}
              onChange={handleDispatchChange}
              settings={settings}
            />
          )}

          {/* Dispatch Items (Merged with Loading Checklist) */}
          <DispatchItemsSection
            dispatch={dispatch}
            items={items}
            pullListInput={pullListInput}
            onPullListInputChange={setPullListInput}
            onScanSubmit={handleScanSubmit}
            scanInputRef={scanInputRef}
            onOpenManualModal={handleOpenManualModal}
            onRemoveItem={handleRemoveItem}
            onToggleVerify={handleToggleVerify}
            onVerifyAll={handleVerifyAll}
            copiedMail={copiedMail}
            onCopyPullLists={handleCopyPullLists}
          />
        </div>
      </div>

      {/* Manual Entry Modal */}
      <ManualItemModal
        isOpen={manualModalOpen}
        onClose={() => {
          setManualModalOpen(false);
          setManualError(null);
        }}
        manualItem={manualItem}
        onChange={setManualItem}
        onSubmit={handleManualItemSave}
        manualError={manualError}
      />

      {/* Confirm Departure Modal */}
      <ConfirmDepartureModal
        isOpen={confirmCompleteOpen}
        onClose={() => setConfirmCompleteOpen(false)}
        onConfirm={handleCompleteDispatch}
        isEmptyPallets={Boolean(dispatch.is_empty_pallets)}
        totalPallets={dispatch.total_pallets || 1}
      />

      {/* Dispatch Completion Animation Overlay */}
      {showCompletionAnim && (
        <DispatchCompleteAnimation
          dispatchNumber={dispatch.dc_no || 'DC-COMPLETED'}
          onComplete={() => {
            setShowCompletionAnim(false);
            if (onClearEditId) onClearEditId();
            setActiveTab('pipeline');
          }}
        />
      )}
    </div>
  );
};

export default NewDispatchPage;
