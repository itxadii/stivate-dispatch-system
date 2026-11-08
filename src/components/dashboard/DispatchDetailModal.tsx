import React from 'react';
import { Pencil, Printer } from 'lucide-react';
import { Modal } from '../Modal';
import { DispatchTable } from '../DispatchTable';
import { printService } from '../../services/ipc';
import type { Dispatch } from '../../types';
import { StatusBadge, MetaField } from '../ui';

interface DispatchDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatch: (Dispatch & { items: any[] }) | null;
  recentCompletedIds: number[];
  onEditDispatch: (id: number) => void;
  formatDateTimeDisplay: (dateStr: string) => string;
}

export const DispatchDetailModal: React.FC<DispatchDetailModalProps> = ({
  isOpen,
  onClose,
  dispatch,
  recentCompletedIds,
  onEditDispatch,
  formatDateTimeDisplay,
}) => {
  if (!dispatch) return null;

  const isEditable = dispatch.id && (dispatch.status !== 'completed' || recentCompletedIds.includes(dispatch.id));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Dispatch ${dispatch.dc_no}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5 select-none">
        <div className="panel grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
          <MetaField label="Date & time">{formatDateTimeDisplay(dispatch.date)}</MetaField>
          <MetaField label="Status"><StatusBadge status={dispatch.status} /></MetaField>
          <MetaField label="Vehicle number"><span className="uppercase">{dispatch.vehicle_no}</span></MetaField>
          <MetaField label="Supervisor">{dispatch.supplier_name}</MetaField>
          <MetaField label="Pallets"><span className="font-mono tabular-nums">{dispatch.total_pallets || 1}</span></MetaField>
          <MetaField label="Pull lists">
            <span className="font-mono tabular-nums">{dispatch.items?.length ?? (dispatch as any).total_pull_lists ?? 0}</span>
          </MetaField>
          <MetaField label="Destination address" className="col-span-2">{dispatch.address || '—'}</MetaField>
          <MetaField label="Total parts"><span className="font-mono tabular-nums">{dispatch.total_parts || 0}</span></MetaField>
          <MetaField label="Created by">{dispatch.created_by || 'Operator'}</MetaField>
          <MetaField label="Particular">{dispatch.particular || 'AS PER LIST'}</MetaField>
          <MetaField label="Transaction">{dispatch.transaction_type || '—'}</MetaField>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-800">
            Pull lists loaded <span className="text-slate-400 font-normal">({dispatch.items?.length || 0})</span>
          </h4>
          <DispatchTable items={dispatch.items || []} readOnly={true} />
        </div>

        <div className="modal-footer">
          {isEditable && (
            <button
              onClick={() => {
                const id = dispatch.id;
                onClose();
                if (id) onEditDispatch(id);
              }}
              className="btn btn-secondary"
            >
              <Pencil size={14} />
              <span>Edit dispatch</span>
            </button>
          )}
          <button
            onClick={async () => {
              try {
                await printService.printChallan(dispatch, dispatch.items || []);
              } catch (e) {
                console.error('Failed to print challan:', e);
              }
            }}
            className="btn btn-secondary"
          >
            <Printer size={14} />
            <span>Reprint challan</span>
          </button>
          <button onClick={onClose} className="btn btn-primary">Close</button>
        </div>
      </div>
    </Modal>
  );
};
