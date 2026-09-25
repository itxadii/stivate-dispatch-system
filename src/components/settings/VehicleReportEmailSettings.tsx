import React from 'react';
import { Mail, Clock, Calendar, Users, Trash2, Plus, CheckCircle2, AlertTriangle, Loader2, Send } from 'lucide-react';
import type { AppSettings, EmailSettings, ReportRecipient } from '../../types';

interface VehicleReportEmailSettingsProps {
  settings: AppSettings;
  onEmailSettingChange: (field: keyof EmailSettings, value: any) => void;
  onChangeRecipientFrequency: (id: string, frequency: 'weekly' | 'daily' | 'both') => void;
  onToggleRecipient: (id: string) => void;
  onDeleteRecipient: (id: string) => void;
  onSendReportToRecipient: (rec: ReportRecipient, reportType: 'weekly' | 'daily') => Promise<void>;
  recipientActionLoading: string | null;
  newRecipientName: string;
  setNewRecipientName: (val: string) => void;
  newRecipientEmail: string;
  setNewRecipientEmail: (val: string) => void;
  newRecipientFrequency: 'weekly' | 'daily' | 'both';
  setNewRecipientFrequency: (val: 'weekly' | 'daily' | 'both') => void;
  onAddRecipient: () => void;
  emailTestResult: { success: boolean; message: string; filePath?: string } | null;
  sendingDailyReport: boolean;
  sendingTestReport: boolean;
  onSendDailyReportAll: () => void;
  onSendTestReport: () => void;
}

export const VehicleReportEmailSettings: React.FC<VehicleReportEmailSettingsProps> = ({
  settings,
  onEmailSettingChange,
  onChangeRecipientFrequency,
  onToggleRecipient,
  onDeleteRecipient,
  onSendReportToRecipient,
  recipientActionLoading,
  newRecipientName,
  setNewRecipientName,
  newRecipientEmail,
  setNewRecipientEmail,
  newRecipientFrequency,
  setNewRecipientFrequency,
  onAddRecipient,
  emailTestResult,
  sendingDailyReport,
  sendingTestReport,
  onSendDailyReportAll,
  onSendTestReport,
}) => {
  const recipients = settings.emailSettings?.recipients || [];
  const activeRecipientsCount = recipients.filter((r) => r.enabled).length;

  return (
    <div className="pt-4 border-t border-slate-200 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-md font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Mail size={17} className="text-sky-600" />
            Vehicle Utilization Reports (Daily & Weekly)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Configure automated delivery of daily and weekly fleet utilization reports to selected recipients. Reports are delivered as compact visual summaries with attached official A4 Landscape PDFs.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {activeRecipientsCount} Active Recipient{activeRecipientsCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Scheduling Automation Cards (Daily & Weekly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Daily Report Card: Today's Utilization */}
        <div className="p-4 bg-gradient-to-br from-amber-50/50 via-white to-white border border-amber-200/80 rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.emailSettings?.autoSendDaily ?? true}
                onChange={(e) => onEmailSettingChange('autoSendDaily', e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock size={14} className="text-amber-500" />
                Daily Report (Today's Utilization)
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Time:</span>
              <input
                type="time"
                value={settings.emailSettings?.autoSendTime || '20:00'}
                onChange={(e) => onEmailSettingChange('autoSendTime', e.target.value)}
                className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            Automatically emails <strong>today's vehicle utilization report</strong> (live dispatches, loaded pallets vs maximum capacity per vehicle, and DC utilization breakdown) to all recipients subscribed to <strong>Daily</strong> or <strong>Both</strong>.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-amber-100">
            <span>Frequency: <strong>Every Day</strong></span>
            <span>Last Sent: <strong className="text-slate-600">{settings.emailSettings?.lastReportSentDate || 'Not yet sent today'}</strong></span>
          </div>
        </div>

        {/* Weekly Report Card: 7-Day Fleet Audit */}
        <div className="p-4 bg-gradient-to-br from-sky-50/50 via-white to-white border border-sky-200/80 rounded-xl space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.emailSettings?.autoSendWeekly ?? true}
                onChange={(e) => onEmailSettingChange('autoSendWeekly', e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar size={14} className="text-sky-500" />
                Weekly Report (7-Day Fleet Audit)
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={settings.emailSettings?.weeklySendDay ?? 1}
                onChange={(e) => onEmailSettingChange('weeklySendDay', Number(e.target.value))}
                className="px-2 py-0.5 text-xs font-bold bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
              >
                <option value={1}>Every Monday</option>
                <option value={2}>Every Tuesday</option>
                <option value={3}>Every Wednesday</option>
                <option value={4}>Every Thursday</option>
                <option value={5}>Every Friday</option>
                <option value={6}>Every Saturday</option>
                <option value={0}>Every Sunday</option>
              </select>
              <input
                type="time"
                value={settings.emailSettings?.weeklySendTime || settings.emailSettings?.autoSendTime || '20:00'}
                onChange={(e) => onEmailSettingChange('weeklySendTime', e.target.value)}
                className="px-2 py-0.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-600 leading-normal">
            Automatically emails the <strong>7-day verified fleet audit report</strong> (comprehensive retrospective progression and weekly capacity audit) to all recipients subscribed to <strong>Weekly</strong> or <strong>Both</strong>.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-sky-100">
            <span>Window: <strong>7 Completed Days</strong></span>
            <span>Last Sent: <strong className="text-slate-600">{settings.emailSettings?.lastWeeklyReportSentDate || 'Not yet sent this week'}</strong></span>
          </div>
        </div>
      </div>

      {/* Report Recipients Section */}
      <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
              <Users size={14} className="text-sky-600" />
              Selected Report Recipients & Subscriptions
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select which reports each person receives: Today's Daily Report, Weekly Audit, or Both.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
            {recipients.length} Recipient{recipients.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Recipients Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 text-slate-600 font-bold text-[10px] uppercase border-b border-slate-200">
                <th className="py-2.5 px-3">Recipient / Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Report Subscription</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Instant Send / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recipients.map((rec) => {
                const isActionLoading = recipientActionLoading?.startsWith(rec.id);
                return (
                  <tr key={rec.id} className={`hover:bg-slate-50/80 transition-colors ${!rec.enabled ? 'opacity-50 bg-slate-50/40' : ''}`}>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-[10px] font-extrabold uppercase">
                          {(rec.name || rec.email).slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">
                            {rec.name || 'Recipient'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700 text-xs">
                      {rec.email}
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={rec.frequency}
                        onChange={(e) => onChangeRecipientFrequency(rec.id, e.target.value as any)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500 cursor-pointer shadow-2xs"
                      >
                        <option value="both">Both (Daily & Weekly)</option>
                        <option value="daily">Today's Daily Report Only</option>
                        <option value="weekly">Weekly Report Only</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleRecipient(rec.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors border ${
                          rec.enabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {rec.enabled ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={isActionLoading || !rec.enabled}
                          onClick={() => onSendReportToRecipient(rec, 'daily')}
                          title={`Send Today's Report now to ${rec.email}`}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md text-[10px] font-bold cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          {recipientActionLoading === `${rec.id}-daily` ? (
                            <Loader2 size={11} className="animate-spin inline" />
                          ) : (
                            "Send Today's Report"
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={isActionLoading || !rec.enabled}
                          onClick={() => onSendReportToRecipient(rec, 'weekly')}
                          title={`Send Weekly Report now to ${rec.email}`}
                          className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-md text-[10px] font-bold cursor-pointer disabled:opacity-40 transition-colors"
                        >
                          {recipientActionLoading === `${rec.id}-weekly` ? (
                            <Loader2 size={11} className="animate-spin inline" />
                          ) : (
                            'Send Weekly Report'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecipient(rec.id)}
                          title="Delete recipient"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add New Recipient Form */}
        <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <Plus size={13} className="text-emerald-600" />
            Add New Report Recipient
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-4">
              <input
                type="text"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                placeholder="Name / Label (e.g. Operations Manager)"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="email"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
                placeholder="Email address (e.g. manager@stivate.com)"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-slate-50/50 focus:bg-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="sm:col-span-2">
              <select
                value={newRecipientFrequency}
                onChange={(e) => setNewRecipientFrequency(e.target.value as any)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold bg-slate-50/50 focus:bg-white focus:outline-none focus:border-sky-500"
              >
                <option value="both">Both Reports</option>
                <option value="daily">Today's Daily Only</option>
                <option value="weekly">Weekly Only</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={onAddRecipient}
                className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <Plus size={13} />
                <span>Add Recipient</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Diagnostic Notification */}
      {emailTestResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-medium space-y-1 ${
            emailTestResult.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {emailTestResult.success ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{emailTestResult.success ? 'Report Dispatched Successfully!' : 'Delivery Notice'}</span>
          </div>
          <p className="pl-6">{emailTestResult.message}</p>
          {emailTestResult.filePath && (
            <p className="pl-6 text-[11px] font-mono opacity-80 break-all">
              Generated PDF: {emailTestResult.filePath}
            </p>
          )}
        </div>
      )}

      {/* Instant Send Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={onSendDailyReportAll}
          disabled={sendingDailyReport || sendingTestReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {sendingDailyReport ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Sending Today's Report...</span>
            </>
          ) : (
            <>
              <Clock size={14} />
              <span>
                Send Today's Report to Selected Recipients (
                {recipients.filter(
                  (r) => r.enabled && (r.frequency === 'daily' || r.frequency === 'both')
                ).length || 1}
                )
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSendTestReport}
          disabled={sendingTestReport || sendingDailyReport}
          className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {sendingTestReport ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Sending Weekly Report...</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>
                Send Weekly Report to Selected Recipients (
                {recipients.filter(
                  (r) => r.enabled && (r.frequency === 'weekly' || r.frequency === 'both')
                ).length || 1}
                )
              </span>
            </>
          )}
        </button>
      </div>

      <hr className="border-slate-200" />
    </div>
  );
};
