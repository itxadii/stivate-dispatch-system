import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal-backdrop" onClick={onClose} />

      <div className={`relative w-full ${maxWidth} z-50`}>
        <div className="modal-panel">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-icon -mr-1.5" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div className="relative p-5 max-h-[75vh] overflow-y-auto text-sm text-slate-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
