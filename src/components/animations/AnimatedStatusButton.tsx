import React from 'react';
import { LoaderCircle, Check, AlertCircle } from 'lucide-react';

export type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

interface AnimatedStatusButtonProps {
  status: ButtonStatus;
  idleText: string;
  loadingText: string;
  successText: string;
  errorText?: string;
  idleIcon?: React.ElementType;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'amber' | 'outline' | 'slate';
  className?: string;
  type?: 'button' | 'submit';
}

export const AnimatedStatusButton: React.FC<AnimatedStatusButtonProps> = ({
  status,
  idleText,
  loadingText,
  successText,
  errorText = 'Failed',
  idleIcon: IdleIcon,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
}) => {
  const variantClass = {
    primary: 'btn-primary',
    success: 'btn-success',
    amber: 'btn-primary',
    outline: 'btn-secondary',
    slate: 'btn-primary',
  }[variant];

  const isSuccess = status === 'success';
  const isError = status === 'error';
  const isLoading = status === 'loading';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-live="polite"
      className={`btn min-w-[110px] ${
        isSuccess
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse-scale'
          : isError
          ? 'bg-rose-50 text-rose-800 border-rose-300 animate-shake'
          : variantClass
      } ${isLoading ? 'disabled:opacity-80' : ''} ${className}`}
    >
      {isLoading && (
        <>
          <LoaderCircle size={15} className="animate-spin text-current shrink-0" />
          <span>{loadingText}</span>
        </>
      )}

      {isSuccess && (
        <>
          <span className="w-4 h-4 rounded-full bg-emerald-200/80 text-emerald-900 flex items-center justify-center shrink-0">
            <Check size={12} strokeWidth={3} />
          </span>
          <span>{successText}</span>
        </>
      )}

      {isError && (
        <>
          <AlertCircle size={15} className="text-rose-600 shrink-0" />
          <span>{errorText}</span>
        </>
      )}

      {status === 'idle' && (
        <>
          {IdleIcon && <IdleIcon size={15} className="shrink-0" />}
          <span>{idleText}</span>
        </>
      )}
    </button>
  );
};
