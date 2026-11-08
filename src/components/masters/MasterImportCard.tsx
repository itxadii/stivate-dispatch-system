import React, { useState } from 'react';
import { Upload, HelpCircle, CheckCircle } from 'lucide-react';
import { databaseService } from '../../services/ipc';
import type { PullListMaster } from '../../types';

interface MasterImportCardProps {
  onImportSuccess: () => void;
}

export const MasterImportCard: React.FC<MasterImportCardProps> = ({ onImportSuccess }) => {
  const [importStatus, setImportStatus] = useState<{ text: string; type: 'success' | 'error' | 'loading' } | null>(null);

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(',')
      .map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase());

    const getIndex = (aliases: string[]) => {
      return headers.findIndex((h) => aliases.includes(h));
    };

    const pullListIdx = getIndex(['pull_list_no', 'pull list', 'pull list number', 'pull_list', 'pl_no', 'pull list no']);
    const idIdx = getIndex(['id_number', 'id', 'id number', 'id_no', 'id_number', 'id no']);
    const kitIdx = getIndex(['kit_type', 'kit', 'kit type', 'kit_type', 'kit type']);
    const workcellIdx = getIndex(['workcell', 'work cell', 'workcell', 'cell']);
    const partsIdx = getIndex(['parts', 'parts count', 'parts_count', 'qty', 'quantity', 'count', 'no of parts', 'parts count']);

    if (pullListIdx === -1) {
      throw new Error("Could not find 'Pull List Number' column in CSV header.");
    }

    const rows: Partial<PullListMaster>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.trim().replace(/^"|"$/g, ''));

      const pull_list_no = cols[pullListIdx] || '';
      if (!pull_list_no) continue;

      rows.push({
        pull_list_no,
        id_number: idIdx !== -1 ? cols[idIdx] || '' : '',
        kit_type: kitIdx !== -1 ? cols[kitIdx] || '' : '',
        workcell: workcellIdx !== -1 ? cols[workcellIdx] || '' : '',
        parts: partsIdx !== -1 ? parseInt(cols[partsIdx]) || 0 : 0,
        barcode: pull_list_no
      });
    }

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ text: 'Reading file...', type: 'loading' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        const rows = parseCSV(text);
        if (rows.length === 0) {
          setImportStatus({
            text: 'Failed to import: No valid rows found. Check column headers.',
            type: 'error'
          });
          return;
        }

        setImportStatus({ text: `Inserting ${rows.length} rows into database...`, type: 'loading' });
        const count = await databaseService.importMasterData(rows);
        setImportStatus({
          text: `Success! Imported ${count} Pull Lists to offline Master table.`,
          type: 'success'
        });
        onImportSuccess();
      } catch (err: any) {
        setImportStatus({ text: `Import failed: ${err.message || err}`, type: 'error' });
      }
    };

    reader.onerror = () => {
      setImportStatus({ text: 'Failed to read file.', type: 'error' });
    };

    reader.readAsText(file);
  };

  return (
    <div className="card p-5 md:col-span-2 space-y-4">
      <div>
        <h4 className="card-title">Import SAP master</h4>
        <p className="card-subtitle">Upload the SAP export as a CSV file</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="btn btn-primary">
          <Upload size={16} />
          <span>Choose CSV file</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <div className="text-xs text-slate-500 leading-normal flex items-start gap-1.5 max-w-sm">
          <HelpCircle size={15} className="text-slate-400 mt-0.5 shrink-0" />
          <p>
            Expected columns: <strong>Pull List Number</strong>, <strong>ID Number</strong>, <strong>Kit Type</strong>, <strong>Workcell</strong>, <strong>Parts</strong>.
          </p>
        </div>
      </div>

      {importStatus && (
        <div role="status" className={`alert items-center font-bold ${
          importStatus.type === 'success' ? 'alert-success' : importStatus.type === 'error' ? 'alert-danger' : 'alert-info animate-pulse'
        }`}>
          {importStatus.type === 'success' && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
          <span>{importStatus.text}</span>
        </div>
      )}
    </div>
  );
};
