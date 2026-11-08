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
    <section className="pt-6 border-t border-slate-100 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="card-title flex items-center gap-2">
            <Mail size={17} className="text-brand-700" />
            Utilization report emails
          </h3>
          <p className="card-subtitle leading-relaxed max-w-prose">
            Send the daily and weekly fleet utilization report, with the A4 PDF attached, to the people below.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="badge badge-success">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {activeRecipientsCount} active recipient{activeRecipientsCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Scheduling Automation Cards (Daily & Weekly) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Daily Report Card: Today's Utilization */}
        <div className="panel space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.emailSettings?.autoSendDaily ?? true}
                onChange={(e) => onEmailSettingChange('autoSendDaily', e.target.checked)}
                className="w-4 h-4 accent-brand-hover cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                Daily Report (Today's Utilization)
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-bold text-slate-400">Time</span>
              <input
                type="time"
                value={settings.emailSettings?.autoSendTime || '20:00'}
                onChange={(e) => onEmailSettingChange('autoSendTime', e.target.value)}
                className="input input-sm font-mono"
              />
            </div>
          </div>
          <p className="text-2xs text-slate-600 leading-normal">
            Automatically emails <strong>today's vehicle utilization report</strong> (live dispatches, loaded pallets vs maximum capacity per vehicle, and DC utilization breakdown) to all recipients subscribed to <strong>Daily</strong> or <strong>Both</strong>.
          </p>
          <div className="flex items-center justify-between text-2xs text-slate-400 pt-1 border-t border-slate-200">
            <span>Frequency: <strong>Every Day</strong></span>
            <span>Last sent: <strong className="text-slate-600">{settings.emailSettings?.lastReportSentDate || 'Not yet sent today'}</strong></span>
          </div>
        </div>

        {/* Weekly Report Card: 7-Day Fleet Audit */}
        <div className="panel space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.emailSettings?.autoSendWeekly ?? true}
                onChange={(e) => onEmailSettingChange('autoSendWeekly', e.target.checked)}
                className="w-4 h-4 accent-brand-hover cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar size={14} className="text-slate-400" />
                Weekly Report (7-Day Fleet Audit)
              </span>
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={settings.emailSettings?.weeklySendDay ?? 1}
                onChange={(e) => onEmailSettingChange('weeklySendDay', Number(e.target.value))}
                className="input input-sm"
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
                className="input input-sm font-mono"
              />
            </div>
          </div>
          <p className="text-2xs text-slate-600 leading-normal">
            Automatically emails the <strong>7-day verified fleet audit report</strong> (comprehensive retrospective progression and weekly capacity audit) to all recipients subscribed to <strong>Weekly</strong> or <strong>Both</strong>.
          </p>
          <div className="flex items-center justify-between text-2xs text-slate-400 pt-1 border-t border-slate-200">
            <span>Window: <strong>7 Completed Days</strong></span>
            <span>Last sent: <strong className="text-slate-600">{settings.emailSettings?.lastWeeklyReportSentDate || 'Not yet sent this week'}</strong></span>
          </div>
        </div>
      </div>

      {/* Report Recipients Section */}
      <div className="panel space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Users size={14} className="text-slate-400" />
              Recipients
            </span>
            <p className="text-2xs text-slate-500 mt-0.5">
              Choose whether each person gets the daily report, the weekly report, or both.
            </p>
          </div>
          <span className="badge badge-neutral bg-white">
            {recipients.length} recipient{recipients.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Recipients Table */}
        <div className="card overflow-hidden">
          <table className="table table-compact text-xs">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Reports</th>
                <th className="text-center">Status</th>
                <th className="text-right">Send now</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((rec) => {
                const isActionLoading = recipientActionLoading?.startsWith(rec.id);
                return (
                  <tr key={rec.id} className={!rec.enabled ? 'opacity-50' : ''}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-2xs font-bold uppercase">
                          {(rec.name || rec.email).slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">
                            {rec.name || 'Recipient'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-slate-700">
                      {rec.email}
                    </td>
                    <td>
                      <select
                        value={rec.frequency}
                        onChange={(e) => onChangeRecipientFrequency(rec.id, e.target.value as any)}
                        className="input input-sm"
                      >
                        <option value="both">Both (Daily & Weekly)</option>
                        <option value="daily">Today's Daily Report Only</option>
                        <option value="weekly">Weekly Report Only</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => onToggleRecipient(rec.id)}
                        className={`badge cursor-pointer ${rec.enabled ? 'badge-success hover:bg-emerald-100' : 'badge-neutral hover:bg-slate-200'}`}
                        title={rec.enabled ? 'Click to pause' : 'Click to resume'}
                      >
                        {rec.enabled ? 'Active' : 'Paused'}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={isActionLoading || !rec.enabled}
                          onClick={() => onSendReportToRecipient(rec, 'daily')}
                          title={`Send Today's Report now to ${rec.email}`}
                          className="btn btn-secondary btn-sm"
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
                          className="btn btn-secondary btn-sm"
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
                          className="btn btn-ghost btn-sm btn-icon hover:text-rose-600! hover:bg-rose-50!"
                          aria-label="Delete recipient"
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
        <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
          <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Plus size={13} className="text-slate-400" />
            Add New Report Recipient
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-4">
              <input
                type="text"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                placeholder="Name / Label (e.g. Operations Manager)"
                className="input input-sm"
              />
            </div>
            <div className="sm:col-span-4">
              <input
                type="email"
                value={newRecipientEmail}
                onChange={(e) => setNewRecipientEmail(e.target.value)}
                placeholder="Email address (e.g. manager@stivate.com)"
                className="input input-sm font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <select
                value={newRecipientFrequency}
                onChange={(e) => setNewRecipientFrequency(e.target.value as any)}
                className="input input-sm"
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
                className="btn btn-primary btn-sm w-full"
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
          role="status"
          className={`alert flex-col gap-1 text-xs ${emailTestResult.success ? 'alert-success' : 'alert-danger'}`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {emailTestResult.success ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{emailTestResult.success ? 'Report sent' : 'Report not sent'}</span>
          </div>
          <p className="pl-6">{emailTestResult.message}</p>
          {emailTestResult.filePath && (
            <p className="pl-6 text-2xs font-mono opacity-80 break-all">
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
          className="btn btn-secondary"
        >
          {sendingDailyReport ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Sending daily report…</span>
            </>
          ) : (
            <>
              <Clock size={14} />
              <span>
                Send daily report now (
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
          className="btn btn-secondary"
        >
          {sendingTestReport ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Sending weekly report…</span>
            </>
          ) : (
            <>
              <Send size={14} />
              <span>
                Send weekly report now (
                {recipients.filter(
                  (r) => r.enabled && (r.frequency === 'weekly' || r.frequency === 'both')
                ).length || 1}
                )
              </span>
            </>
          )}
        </button>
      </div>

    </section>
  );
};
