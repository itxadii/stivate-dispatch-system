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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={16} className="text-[#4BB8FA]" />
          User Documentation & Feature Request
        </h4>

        <div className="text-xs text-slate-500 space-y-1">
          <p>Access full operating manual, workflow cheat sheets, or submit new feature requests to product engineering.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenPolicyModal('documentation')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            <BookOpen size={14} className="text-blue-600 shrink-0" />
            <span>User Guide</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicyModal('feature-request')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            <Sparkles size={14} className="text-emerald-600 shrink-0" />
            <span>Request Feature</span>
          </button>
        </div>
      </div>

      {/* Legal & Security Policies */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-500" />
          Legal & Security Policies
        </h4>

        <div className="text-xs text-slate-500 space-y-1">
          <p>Review the application's offline privacy policy and data security architecture guidelines.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => onOpenPolicyModal('privacy')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            <FileText size={14} className="text-blue-500" />
            <span>Privacy Policy</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicyModal('security')}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            <Lock size={14} className="text-emerald-500" />
            <span>Security Policy</span>
          </button>
        </div>
      </div>

      {/* Powered By Logo */}
      <div className="flex flex-col items-center justify-end pt-12 mt-auto space-y-2 select-none">
        <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center">Powered By</span>
        <img src="stivate.png" alt="Stivate Logo" className="h-24 sm:h-28 w-auto object-contain brightness-95 opacity-90 hover:opacity-100 transition-all duration-150" />
      </div>
    </>
  );
};
