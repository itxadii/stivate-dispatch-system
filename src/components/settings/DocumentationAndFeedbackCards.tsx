import React from 'react';
import { BookOpen, Sparkles, ShieldCheck, FileText, Lock } from 'lucide-react';

interface DocumentationAndFeedbackCardsProps {
  onOpenPolicyModal: (modal: 'privacy' | 'security' | 'documentation' | 'feature-request') => void;
}

export const DocumentationAndFeedbackCards: React.FC<DocumentationAndFeedbackCardsProps> = ({
  onOpenPolicyModal,
}) => {
  return (
    <>
      {/* Help, Docs & Feature Requests */}
      <div className="card p-5 space-y-4">
        <div>
          <h4 className="card-title flex items-center gap-2">
            <BookOpen size={16} className="text-brand-700" />
            Help
          </h4>
          <p className="card-subtitle">Read the user guide or ask for a new feature</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenPolicyModal('documentation')}
            className="btn btn-secondary"
          >
            <BookOpen size={14} className="shrink-0" />
            <span>User guide</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicyModal('feature-request')}
            className="btn btn-secondary"
          >
            <Sparkles size={14} className="shrink-0" />
            <span>Request a feature</span>
          </button>
        </div>
      </div>

      {/* Legal & Security Policies */}
      <div className="card p-5 space-y-4">
        <div>
          <h4 className="card-title flex items-center gap-2">
            <ShieldCheck size={16} className="text-brand-700" />
            Privacy and security
          </h4>
          <p className="card-subtitle">How this app stores and protects your data</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenPolicyModal('privacy')}
            className="btn btn-secondary"
          >
            <FileText size={14} />
            <span>Privacy policy</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicyModal('security')}
            className="btn btn-secondary"
          >
            <Lock size={14} />
            <span>Security policy</span>
          </button>
        </div>
      </div>

      {/* Powered By Logo */}
      <div className="flex flex-col items-center pt-6 gap-1.5 select-none">
        <span className="text-2xs font-bold text-slate-400">Powered by</span>
        <img src="stivate.png" alt="Stivate" className="h-16 w-auto object-contain opacity-90" />
      </div>
    </>
  );
};
