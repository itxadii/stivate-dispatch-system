import React, { useEffect, useState } from 'react';
import { settingsService, backupService, updaterService, emailService } from '../../services/ipc';
import type { AppSettings, EmailSettings, ReportRecipient } from '../../types';
import { SettingsHeader } from './SettingsHeader';
import { CompanyAndPrinterSettings } from './CompanyAndPrinterSettings';
import { VehicleReportEmailSettings } from './VehicleReportEmailSettings';
import { LogisticsDropdownOptions } from './LogisticsDropdownOptions';
import { BackupOperations } from './BackupOperations';
import { ApplicationUpdates } from './ApplicationUpdates';
import { DocumentationAndFeedbackCards } from './DocumentationAndFeedbackCards';
import { UnlockModal } from './UnlockModal';
import { PolicyAndDocModals } from './PolicyAndDocModals';

interface SettingsPageProps {
  onSettingsSaved: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onSettingsSaved }) => {
  const [settings, setSettings] = useState<AppSettings>({
    companyName: '',
    address: '',
    printer: '',
    barcodePrinter: '',
    backupFolder: '',
    databaseLocation: '',
    printsFolder: '',
    addressesList: [],
    suppliersList: [],
    scannersList: [],
    verifiersList: [],
    vehiclesList: [],
    defaultAddress: '',
    defaultSupplier: '',
    defaultScanner: '',
    defaultVerifier: '',
    defaultVehicleNo: '',
    emailSettings: {
      enabled: true,
      smtpHost: 'smtp.purelymail.com',
      smtpPort: 465,
      smtpSecure: true,
      smtpUser: 'noreply@stivate.com',
      smtpPassword: 'noreply@123@stivate.com',
      fromEmail: 'noreply@stivate.com',
      toEmail: 'aditya@stivate.com',
      autoSendDaily: true,
      autoSendTime: '20:00',
      autoSendWeekly: true,
      weeklySendDay: 1,
      weeklySendTime: '20:00',
      recipients: [
        {
          id: 'rec-1',
          name: 'Aditya',
          email: 'aditya@stivate.com',
          frequency: 'both',
          enabled: true,
        },
      ],
    },
  });

  const [addressesRaw, setAddressesRaw] = useState('');
  const [suppliersRaw, setSuppliersRaw] = useState('');
  const [scannersRaw, setScannersRaw] = useState('');
  const [verifiersRaw, setVerifiersRaw] = useState('');
  const [vehiclesRaw, setVehiclesRaw] = useState('');
  const [vehicleSizesRaw, setVehicleSizesRaw] = useState('');

  const [sendingTestReport, setSendingTestReport] = useState(false);
  const [sendingDailyReport, setSendingDailyReport] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string; filePath?: string } | null>(null);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newRecipientFrequency, setNewRecipientFrequency] = useState<'weekly' | 'daily' | 'both'>('both');
  const [recipientActionLoading, setRecipientActionLoading] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [backupMsg, setBackupMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [backingUp, setBackingUp] = useState(false);
  const [uploadingCloud, setUploadingCloud] = useState(false);
  const [uploadingLive, setUploadingLive] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoringCloud, setRestoringCloud] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('1.0.0');
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [checkingForUpdates, setCheckingForUpdates] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<'privacy' | 'security' | 'documentation' | 'feature-request' | null>(null);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.load();
      if (!data.emailSettings || !data.emailSettings.smtpPassword) {
        data.emailSettings = {
          enabled: true,
          smtpHost: 'smtp.purelymail.com',
          smtpPort: 465,
          smtpSecure: true,
          smtpUser: 'noreply@stivate.com',
          smtpPassword: 'noreply@123@stivate.com',
          fromEmail: 'noreply@stivate.com',
          toEmail: 'aditya@stivate.com',
          autoSendDaily: true,
          autoSendTime: '20:00',
          autoSendWeekly: true,
          weeklySendDay: 1,
          weeklySendTime: '20:00',
          recipients: [],
        };
      }
      if (!data.emailSettings.recipients) {
        data.emailSettings.recipients = [];
      } else {
        // Strip '(Primary)' from any recipient names
        data.emailSettings.recipients = data.emailSettings.recipients.map((r: any) => ({
          ...r,
          name: (r.name || '').replace(/\s*\(Primary\)/i, '').trim() || r.name,
        }));
      }
      setSettings(data);
      setAddressesRaw((data.addressesList || []).join('\n\n'));
      setSuppliersRaw((data.suppliersList || []).join('\n'));
      setScannersRaw((data.scannersList || []).join('\n'));
      setVerifiersRaw((data.verifiersList || []).join('\n'));
      setVehiclesRaw((data.vehiclesList || []).join('\n'));
      setVehicleSizesRaw((data.vehicleSizesList || ['32 ft', '20 ft', '10 ft']).join('\n'));
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setMessage({ text: `Failed to load settings: ${err.message || err}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    updaterService.getVersion().then((v: any) => {
      if (v) {
        const verStr = typeof v.currentVersion === 'string' ? v.currentVersion : (v.currentVersion?.version || '1.0.0');
        setCurrentVersion(verStr);
      }
    }).catch(() => {});
  }, []);

  const handleEmailSettingChange = (field: keyof EmailSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      emailSettings: {
        ...(prev.emailSettings || {
          enabled: true,
          smtpHost: 'smtp.purelymail.com',
          smtpPort: 465,
          smtpSecure: true,
          smtpUser: 'noreply@stivate.com',
          smtpPassword: 'noreply@123@stivate.com',
          fromEmail: 'noreply@stivate.com',
          toEmail: 'aditya@stivate.com',
          autoSendDaily: true,
          autoSendTime: '20:00',
          autoSendWeekly: true,
          weeklySendDay: 1,
          weeklySendTime: '20:00',
          recipients: [],
        }),
        [field]: value,
      },
    }));
  };

  const handleChangeRecipientFrequency = (id: string, frequency: 'weekly' | 'daily' | 'both') => {
    setSettings((prev) => {
      const emailCfg = prev.emailSettings || {
        enabled: true,
        smtpHost: 'smtp.purelymail.com',
        smtpPort: 465,
        smtpSecure: true,
        smtpUser: 'noreply@stivate.com',
        fromEmail: 'noreply@stivate.com',
        toEmail: 'aditya@stivate.com',
        autoSendDaily: true,
        autoSendTime: '20:00',
        recipients: [],
      };
      const updated = (emailCfg.recipients || []).map((r) =>
        r.id === id ? { ...r, frequency } : r
      );
      return {
        ...prev,
        emailSettings: {
          ...emailCfg,
          recipients: updated,
        },
      };
    });
  };

  const handleToggleRecipient = (id: string) => {
    setSettings((prev) => {
      const emailCfg = prev.emailSettings || {
        enabled: true,
        smtpHost: 'smtp.purelymail.com',
        smtpPort: 465,
        smtpSecure: true,
        smtpUser: 'noreply@stivate.com',
        fromEmail: 'noreply@stivate.com',
        toEmail: 'aditya@stivate.com',
        autoSendDaily: true,
        autoSendTime: '20:00',
        recipients: [],
      };
      const updated = (emailCfg.recipients || []).map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      );
      return {
        ...prev,
        emailSettings: {
          ...emailCfg,
          recipients: updated,
        },
      };
    });
  };

  const handleDeleteRecipient = (id: string) => {
    setSettings((prev) => {
      const emailCfg = prev.emailSettings || {
        enabled: true,
        smtpHost: 'smtp.purelymail.com',
        smtpPort: 465,
        smtpSecure: true,
        smtpUser: 'noreply@stivate.com',
        fromEmail: 'noreply@stivate.com',
        toEmail: '',
        autoSendDaily: true,
        autoSendTime: '20:00',
        recipients: [],
      };
      const updated = (emailCfg.recipients || []).filter((r) => r.id !== id);
      const remainingEmails = updated.map((r) => r.email).filter(Boolean);
      const newToEmail = remainingEmails.includes(emailCfg.toEmail || '')
        ? emailCfg.toEmail
        : (remainingEmails[0] || '');

      return {
        ...prev,
        emailSettings: {
          ...emailCfg,
          toEmail: newToEmail,
          recipients: updated,
        },
      };
    });
  };

  const handleAddRecipient = () => {
    const trimmedEmail = newRecipientEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    const newRec: ReportRecipient = {
      id: `rec-${Date.now()}`,
      name: newRecipientName.trim() || trimmedEmail.split('@')[0],
      email: trimmedEmail,
      frequency: newRecipientFrequency,
      enabled: true,
    };
    setSettings((prev) => {
      const emailCfg = prev.emailSettings || {
        enabled: true,
        smtpHost: 'smtp.purelymail.com',
        smtpPort: 465,
        smtpSecure: true,
        smtpUser: 'noreply@stivate.com',
        fromEmail: 'noreply@stivate.com',
        toEmail: 'aditya@stivate.com',
        autoSendDaily: true,
        autoSendTime: '20:00',
        recipients: [],
      };
      return {
        ...prev,
        emailSettings: {
          ...emailCfg,
          recipients: [...(emailCfg.recipients || []), newRec],
        },
      };
    });
    setNewRecipientName('');
    setNewRecipientEmail('');
    setNewRecipientFrequency('both');
  };

  const handleSendReportToRecipient = async (recipient: ReportRecipient, reportType: 'weekly' | 'daily') => {
    setRecipientActionLoading(`${recipient.id}-${reportType}`);
    setEmailTestResult(null);
    try {
      await settingsService.save(settings);
      const res = await emailService.sendVehicleUtilizationReport({
        customTo: recipient.email,
        reportFrequency: reportType,
        dateRange: reportType,
      });
      setEmailTestResult({
        success: res.success,
        message: res.message,
        filePath: res.filePath,
      });
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        message: `Failed to send ${reportType} report to ${recipient.email}: ${err.message || String(err)}`,
      });
    } finally {
      setRecipientActionLoading(null);
    }
  };

  const handleSendTestReport = async () => {
    setSendingTestReport(true);
    setEmailTestResult(null);
    try {
      await settingsService.save(settings);
      const res = await emailService.sendVehicleUtilizationReport({
        reportFrequency: 'weekly',
        dateRange: 'weekly',
      });
      setEmailTestResult({
        success: res.success,
        message: res.message,
        filePath: res.filePath,
      });
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        message: `Failed to send weekly report: ${err.message || String(err)}`,
      });
    } finally {
      setSendingTestReport(false);
    }
  };

  const handleSendDailyReportAll = async () => {
    setSendingDailyReport(true);
    setEmailTestResult(null);
    try {
      await settingsService.save(settings);
      const res = await emailService.sendVehicleUtilizationReport({
        reportFrequency: 'daily',
        dateRange: 'daily',
      });
      setEmailTestResult({
        success: res.success,
        message: res.message,
        filePath: res.filePath,
      });
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        message: `Failed to send daily report: ${err.message || String(err)}`,
      });
    } finally {
      setSendingDailyReport(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const addressesList = addressesRaw.split(/\n\s*\n/).map(l => l.trim()).filter(Boolean);
    const suppliersList = suppliersRaw.split('\n').map(l => l.trim()).filter(Boolean);
    const scannersList = scannersRaw.split('\n').map(l => l.trim()).filter(Boolean);
    const verifiersList = verifiersRaw.split('\n').map(l => l.trim()).filter(Boolean);
    const vehiclesList = vehiclesRaw.split('\n').map(l => l.trim()).filter(Boolean);
    const vehicleSizesList = vehicleSizesRaw.split('\n').map(l => l.trim()).filter(Boolean);

    const updatedSettings = {
      ...settings,
      addressesList,
      suppliersList,
      scannersList,
      verifiersList,
      vehiclesList,
      vehicleSizesList,
    };

    try {
      const success = await settingsService.save(updatedSettings);
      if (success) {
        setSettings(updatedSettings);
        setMessage({ text: 'Settings saved successfully!', type: 'success' });
        onSettingsSaved();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ text: 'Failed to save settings. Check write permissions.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Error: ${err.message || err}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerBackup = async () => {
    setBackingUp(true);
    setBackupMsg(null);
    try {
      const res = await backupService.triggerBackup();
      if (res.success) {
        setBackupMsg({ text: res.message, type: 'success' });
        try {
          const reloaded = await settingsService.load();
          setSettings(reloaded);
        } catch {}
      } else {
        setBackupMsg({ text: `Backup Failed: ${res.message}`, type: 'error' });
      }
    } catch (err: any) {
      setBackupMsg({ text: `Error: ${err.message || err}`, type: 'error' });
    } finally {
      setBackingUp(false);
    }
  };

  const handleUploadLiveState = async () => {
    setUploadingLive(true);
    setBackupMsg(null);
    try {
      const res = await backupService.uploadLiveStateCloud();
      if (res.success) {
        setBackupMsg({ text: res.message, type: 'success' });
        try {
          const reloaded = await settingsService.load();
          setSettings(reloaded);
        } catch {}
      } else {
        setBackupMsg({ text: `Live State Upload Failed: ${res.message}`, type: 'error' });
      }
    } catch (err: any) {
      setBackupMsg({ text: `Error: ${err.message || err}`, type: 'error' });
    } finally {
      setUploadingLive(false);
    }
  };

  const handleUploadToCloud = async () => {
    setUploadingCloud(true);
    setBackupMsg(null);
    try {
      const res = await backupService.uploadCloud();
      if (res.success) {
        setBackupMsg({ text: res.message, type: 'success' });
        try {
          const reloaded = await settingsService.load();
          setSettings(reloaded);
        } catch {}
      } else {
        setBackupMsg({ text: `Cloud Backup Failed: ${res.message}`, type: 'error' });
      }
    } catch (err: any) {
      setBackupMsg({ text: `Error: ${err.message || err}`, type: 'error' });
    } finally {
      setUploadingCloud(false);
    }
  };

  const handleRestoreCloudLatest = async () => {
    const confirm = window.confirm(
      'Are you sure you want to download and restore the LIVE database from AWS S3 (latest.db)?\n\nYour current database will be safely backed up locally first, and your records will be restored up to the latest hourly cloud sync.'
    );
    if (!confirm) return;

    setRestoringCloud(true);
    setBackupMsg(null);
    try {
      const res = await backupService.restoreCloudLatest();
      if (res.success) {
        setBackupMsg({ text: res.message, type: 'success' });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setBackupMsg({ text: `Cloud Restore Failed: ${res.message}`, type: 'error' });
      }
    } catch (err: any) {
      setBackupMsg({ text: `Error: ${err.message || err}`, type: 'error' });
    } finally {
      setRestoringCloud(false);
    }
  };

  const handleRestoreBackup = async () => {
    const confirm = window.confirm(
      'Are you sure you want to restore the latest database backup?\n\nYour current database will be safely preserved as a backup, and the latest backup will restore your active records.'
    );
    if (!confirm) return;

    setRestoring(true);
    setBackupMsg(null);
    try {
      const res = await backupService.restoreBackup();
      if (res.success) {
        setBackupMsg({ text: res.message, type: 'success' });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setBackupMsg({ text: `Restore Failed: ${res.message}`, type: 'error' });
      }
    } catch (err: any) {
      setBackupMsg({ text: `Error: ${err.message || err}`, type: 'error' });
    } finally {
      setRestoring(false);
    }
  };

  const handleCheckForUpdates = async () => {
    setCheckingForUpdates(true);
    setUpdateStatus('Checking for updates...');
    try {
      await updaterService.check();
      setUpdateStatus('Update check initiated. Check system alerts for new updates.');
    } catch (err: any) {
      setUpdateStatus(`Error checking for updates: ${err.message || err}`);
    } finally {
      setCheckingForUpdates(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-slate-400 font-medium bg-white border border-slate-200 rounded-xl shadow-sm">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Lock Status */}
      <SettingsHeader
        isUnlocked={isUnlocked}
        onLock={() => setIsUnlocked(false)}
        onUnlockClick={() => setShowUnlockModal(true)}
      />

      <div className={`grid grid-cols-1 ${isUnlocked ? 'lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {/* Left Form Column */}
        <form onSubmit={handleSave} className={`${isUnlocked ? 'lg:col-span-2' : 'col-span-1'} bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6`}>
          {message && (
            <div className={`p-4 rounded-lg border text-sm font-semibold ${message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
              {message.text}
            </div>
          )}

          {/* General Settings: Visible ONLY when unlocked with password i3pl@123 */}
          {isUnlocked && (
            <>
              <CompanyAndPrinterSettings
                settings={settings}
                onChange={handleChange}
              />

              <VehicleReportEmailSettings
                settings={settings}
                onEmailSettingChange={handleEmailSettingChange}
                onChangeRecipientFrequency={handleChangeRecipientFrequency}
                onToggleRecipient={handleToggleRecipient}
                onDeleteRecipient={handleDeleteRecipient}
                onSendReportToRecipient={handleSendReportToRecipient}
                recipientActionLoading={recipientActionLoading}
                newRecipientName={newRecipientName}
                setNewRecipientName={setNewRecipientName}
                newRecipientEmail={newRecipientEmail}
                setNewRecipientEmail={setNewRecipientEmail}
                newRecipientFrequency={newRecipientFrequency}
                setNewRecipientFrequency={setNewRecipientFrequency}
                onAddRecipient={handleAddRecipient}
                emailTestResult={emailTestResult}
                sendingDailyReport={sendingDailyReport}
                sendingTestReport={sendingTestReport}
                onSendDailyReportAll={handleSendDailyReportAll}
                onSendTestReport={handleSendTestReport}
              />
            </>
          )}

          {/* Logistics Dropdown Options (Always visible) */}
          <LogisticsDropdownOptions
            settings={settings}
            setSettings={setSettings}
            addressesRaw={addressesRaw}
            setAddressesRaw={setAddressesRaw}
            suppliersRaw={suppliersRaw}
            setSuppliersRaw={setSuppliersRaw}
            scannersRaw={scannersRaw}
            setScannersRaw={setScannersRaw}
            verifiersRaw={verifiersRaw}
            setVerifiersRaw={setVerifiersRaw}
            vehiclesRaw={vehiclesRaw}
            setVehiclesRaw={setVehiclesRaw}
            vehicleSizesRaw={vehicleSizesRaw}
            setVehicleSizesRaw={setVehicleSizesRaw}
            saving={saving}
            isUnlocked={isUnlocked}
          />
        </form>

        {/* Right Actions Column (Locked unless administrator unlocks with i3pl@123) */}
        {isUnlocked && (
          <div className="space-y-6 flex flex-col h-full min-h-[300px]">
            <BackupOperations
              settings={settings}
              backupMsg={backupMsg}
              uploadingLive={uploadingLive}
              uploadingCloud={uploadingCloud}
              backingUp={backingUp}
              restoring={restoring}
              restoringCloud={restoringCloud}
              onUploadLiveState={handleUploadLiveState}
              onRestoreCloudLatest={handleRestoreCloudLatest}
              onTriggerBackup={handleTriggerBackup}
              onUploadToCloud={handleUploadToCloud}
              onRestoreBackup={handleRestoreBackup}
            />

            <ApplicationUpdates
              currentVersion={currentVersion}
              updateStatus={updateStatus}
              checkingForUpdates={checkingForUpdates}
              onCheckForUpdates={handleCheckForUpdates}
              setUpdateStatus={setUpdateStatus}
            />

            <DocumentationAndFeedbackCards
              onOpenPolicyModal={setActivePolicyModal}
            />
          </div>
        )}
      </div>

      {/* Unlock Password Modal */}
      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlockSuccess={() => setIsUnlocked(true)}
      />

      {/* Privacy Policy, Security Policy, User Documentation & Feature Request Modal */}
      <PolicyAndDocModals
        activePolicyModal={activePolicyModal}
        onClose={() => setActivePolicyModal(null)}
        currentVersion={currentVersion}
      />
    </div>
  );
};
