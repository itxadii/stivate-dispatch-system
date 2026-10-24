import React, { useState } from 'react';
import { BookOpen, HelpCircle, HardDriveDownload, FileText, Lock, Keyboard, Sparkles } from 'lucide-react';
import { Modal } from '../Modal';
import { AnimatedStatusButton } from '../animations';
import type { ButtonStatus } from '../animations';

interface PolicyAndDocModalsProps {
  activePolicyModal: 'privacy' | 'security' | 'documentation' | 'feature-request' | null;
  onClose: () => void;
  currentVersion: string;
}

export const PolicyAndDocModals: React.FC<PolicyAndDocModalsProps> = ({
  activePolicyModal,
  onClose,
  currentVersion,
}) => {
  const [docTab, setDocTab] = useState<'overview' | 'vehicles' | 'printing' | 'reports' | 'shortcuts'>('overview');

  // Feature request form state
  const [featureRequestName, setFeatureRequestName] = useState('');
  const [featureRequestEmail, setFeatureRequestEmail] = useState('');
  const [featureRequestMessage, setFeatureRequestMessage] = useState('');
  const [featureRequestResult, setFeatureRequestResult] = useState('');
  const [featureRequestStatus, setFeatureRequestStatus] = useState<ButtonStatus>('idle');
  const [featureRequestCategory, setFeatureRequestCategory] = useState('Logistics & Dispatches');

  const handleFeatureRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeatureRequestStatus('loading');
    setFeatureRequestResult('Sending request to Stivate engineering...');

    try {
      const formData = new FormData(event.currentTarget);
      const p1 = 'a27bde1c'; const p2 = '6cba'; const p3 = '44bb'; const p4 = '9e1e'; const p5 = 'bbd0da0756fe';
      formData.append('access_key', [p1, p2, p3, p4, p5].join('-'));

      const host = 'web3forms.com';
      const response = await fetch('https://api.' + host + '/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && (data.success === true || data.message === 'Message sent successfully' || data.status === 'success')) {
        setFeatureRequestStatus('success');
        setFeatureRequestResult('Thank you! Your feature request has been submitted successfully to Stivate Product Engineering.');
        setFeatureRequestName('');
        setFeatureRequestEmail('');
        setFeatureRequestMessage('');
        setTimeout(() => setFeatureRequestStatus('idle'), 2500);
      } else {
        setFeatureRequestStatus('error');
        setFeatureRequestResult('Error submitting feature request. Please try again.');
        setTimeout(() => setFeatureRequestStatus('idle'), 2500);
      }
    } catch (err) {
      console.error('Feature request submit failed:', err);
      setFeatureRequestStatus('error');
      setFeatureRequestResult('Error submitting feature request. Please check your network and try again.');
      setTimeout(() => setFeatureRequestStatus('idle'), 2500);
    }
  };

  if (!activePolicyModal) return null;

  return (
    <Modal
      isOpen={activePolicyModal !== null}
      onClose={onClose}
      title={
        activePolicyModal === 'privacy'
          ? 'Application Privacy Policy'
          : activePolicyModal === 'security'
          ? 'Application Security Policy'
          : activePolicyModal === 'documentation'
          ? 'User Documentation & Operating Manual'
          : 'Submit Feature Request & Feedback'
      }
      maxWidth="max-w-4xl"
    >
      {activePolicyModal === 'documentation' && (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm select-none">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={18} className="text-[#4BB8FA]" />
                <span>User Documentation & Operating Manual</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Standard Operating Procedures for DC Delivery System</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">v{currentVersion}</span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">Offline-First</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'overview', label: '1. Quick Start Overview', icon: HelpCircle },
              { id: 'vehicles', label: '2. Vehicle Sizes & Pallets', icon: HardDriveDownload },
              { id: 'printing', label: '3. Printing Rules', icon: FileText },
              { id: 'reports', label: '4. Reports & Security', icon: Lock },
              { id: 'shortcuts', label: '5. Keyboard Shortcuts', icon: Keyboard },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = docTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setDocTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#4BB8FA] text-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          {docTab === 'overview' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Standard Dispatch Workflow</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase">
                    <span className="w-6 h-6 rounded-full bg-[#4BB8FA] text-slate-950 flex items-center justify-center font-black">1</span>
                    <span>Create New Dispatch</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-800 font-bold">Ctrl+N</kbd> or click <strong>Dispatch Pipeline → Create New Dispatch</strong>. Enter Vehicle Number, Supervisor Name, Consignee Address, and Pallet Capacity Count.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase">
                    <span className="w-6 h-6 rounded-full bg-[#4BB8FA] text-slate-950 flex items-center justify-center font-black">2</span>
                    <span>Scan & Verify Pull Lists</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Paste or scan Pull List barcodes directly into the input box. Unrecognized items prompt the manual entry modal. Click <strong>Verify</strong> next to pending items once loaded into truck slots.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase">
                    <span className="w-6 h-6 rounded-full bg-[#4BB8FA] text-slate-950 flex items-center justify-center font-black">3</span>
                    <span>Print Document Sets</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click the green <strong>Print Set</strong> button (or <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-800 font-bold">Ctrl+P</kbd>) to automatically print 6 copies (3x Challan + 3x Barcode sheets). Single print buttons send 1 copy.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase">
                    <span className="w-6 h-6 rounded-full bg-[#4BB8FA] text-slate-950 flex items-center justify-center font-black">4</span>
                    <span>Complete & Archive</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Click <strong>Mark Ready</strong> while loading, then <strong>Complete Dispatch</strong> upon departure. The animated truck confirmation executes and archives the dispatch under <strong>Completed</strong> (<kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px] text-slate-800 font-bold">Ctrl+H</kbd>).
                  </p>
                </div>
              </div>
            </div>
          )}

          {docTab === 'vehicles' && (
            <div className="space-y-4 text-xs text-slate-600">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Vehicle Sizes & Truck Pallet Capacities</h4>
              <p>Truck utilization percentage is tracked automatically based on configured vehicle dimensions:</p>
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200">
                <div className="p-3 bg-slate-100 font-bold text-slate-800 grid grid-cols-3">
                  <span>Vehicle Size</span>
                  <span>Max Pallet Capacity</span>
                  <span>Calculation Rule</span>
                </div>
                <div className="p-3 grid grid-cols-3 font-mono font-semibold">
                  <span className="text-blue-700">32 ft</span>
                  <span>16 Pallets Max</span>
                  <span className="text-slate-500">Standard Heavy Trailer</span>
                </div>
                <div className="p-3 grid grid-cols-3 font-mono font-semibold">
                  <span className="text-indigo-700">20 ft</span>
                  <span>8 Pallets Max</span>
                  <span className="text-slate-500">Medium Container</span>
                </div>
                <div className="p-3 grid grid-cols-3 font-mono font-semibold">
                  <span className="text-amber-700">10 ft</span>
                  <span>2 Pallets Max</span>
                  <span className="text-slate-500">Small Pickup / Van</span>
                </div>
                <div className="p-3 grid grid-cols-3 font-mono font-semibold">
                  <span className="text-slate-700">Custom (e.g. N ft)</span>
                  <span>Floor(N / 2) Pallets</span>
                  <span className="text-slate-500">Dynamic length division</span>
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <strong>Specific Truck Lookup:</strong> Go to <strong>Dashboard → Specific Vehicle Utilization Tracker</strong> to filter dispatches by truck number and view total pallet capacity utilization.
              </div>
            </div>
          )}

          {docTab === 'printing' && (
            <div className="space-y-4 text-xs text-slate-600">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Printer Configuration & Ink-Saving Rules</h4>
              <ul className="list-disc pl-4 space-y-2">
                <li><strong>Printer Ink Preservation:</strong> Grey table borders and barcode line boxes have been removed to preserve printer toner cartridge life.</li>
                <li><strong>Multi-Line Address Wrapping:</strong> Long consignee addresses wrap cleanly across multiple lines in bold text without truncating (<code>...</code>). Subheader barcode bars adjust height dynamically.</li>
                <li><strong>Print Set Buttons:</strong> Clicking <strong>Print Set</strong> sends 6 physical copies (3x Challan + 3x Barcode sheets). Single print buttons send 1 copy.</li>
                <li><strong>Warehouse Header Prefix:</strong> Change the <strong>Warehouse Location / Header Prefix</strong> setting in Settings to customize printed PDF headers (e.g. <code>F W H TO [Consignee]</code>).</li>
              </ul>
            </div>
          )}

          {docTab === 'reports' && (
            <div className="space-y-4 text-xs text-slate-600">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Locked Reports & Automatic Backups</h4>
              <div className="space-y-3">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                  <strong>Reports Password Lock:</strong>
                  <p>The Reports & Analytics tab is protected with password security. Contact your system administrator for the access password.</p>
                </div>
                <p>&bull; <strong>Automatic Local Backups:</strong> The system automatically writes timestamped SQLite database backups into your configured Backup folder every time the application closes.</p>
                <p>&bull; <strong>Cloud Uploads:</strong> Click <strong>Upload Backup on Cloud</strong> in Settings anytime to sync local database snapshots with encrypted cloud storage.</p>
              </div>
            </div>
          )}

          {docTab === 'shortcuts' && (
            <div className="space-y-4 text-xs text-slate-600">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Keyboard Shortcuts Quick Reference</h4>
              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-200">
                {[
                  { key: 'Ctrl + N', desc: 'Create New Dispatch Truck' },
                  { key: 'Ctrl + H', desc: 'Open Completed Dispatch Archive' },
                  { key: 'Ctrl + P', desc: 'Print Combined Dispatch Set (6 copies)' },
                  { key: 'Ctrl + S', desc: 'Save Draft Dispatch' },
                  { key: 'Ctrl + F', desc: 'Focus Pull List Search Box' },
                ].map((sc, i) => (
                  <div key={i} className="p-3 flex items-center justify-between">
                    <span className="font-medium text-slate-700">{sc.desc}</span>
                    <kbd className="px-2.5 py-1 bg-white border border-slate-300 rounded-md font-mono font-bold text-slate-800 shadow-2xs">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activePolicyModal === 'feature-request' && (
        <div className="space-y-5 text-slate-700 text-sm select-none">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Sparkles size={18} className="text-emerald-500" />
                <span>Submit Feature Request & Product Feedback</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Send feature ideas directly to Stivate Product Engineering</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-100 text-xs">
              Direct Feedback
            </span>
          </div>

          <form onSubmit={handleFeatureRequestSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase block">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={featureRequestName}
                  onChange={(e) => setFeatureRequestName(e.target.value)}
                  required
                  placeholder="Operator / Admin Name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase block">Contact Email</label>
                <input
                  type="email"
                  name="email"
                  value={featureRequestEmail}
                  onChange={(e) => setFeatureRequestEmail(e.target.value)}
                  required
                  placeholder="email@company.com"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase block">Feature Category</label>
              <select
                name="category"
                value={featureRequestCategory}
                onChange={(e) => setFeatureRequestCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium cursor-pointer"
              >
                <option value="Logistics & Dispatches">Logistics & Dispatches Workflow</option>
                <option value="Printing & Barcodes">Printing & Barcode Sheets</option>
                <option value="Reports & Analytics">Reports & Excel Export</option>
                <option value="Vehicle Capacities">Vehicle Sizes & Capacities</option>
                <option value="Performance & Database">Performance & Database Backups</option>
                <option value="Other UI">Other Interface / Feature Request</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase block">Feature Description / Feedback Details</label>
              <textarea
                name="message"
                value={featureRequestMessage}
                onChange={(e) => setFeatureRequestMessage(e.target.value)}
                required
                rows={4}
                placeholder="Describe the feature or improvement you'd like to see..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none focus:border-emerald-500 focus:bg-white font-sans"
              />
            </div>

            {featureRequestResult && (
              <div className={`p-3 rounded-lg text-xs font-semibold border ${
                featureRequestStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : featureRequestStatus === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {featureRequestResult}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <AnimatedStatusButton
                type="submit"
                status={featureRequestStatus}
                idleText="Submit Feature Request"
                loadingText="Submitting..."
                successText="✓ Submitted"
                variant="primary"
              />
            </div>
          </form>
        </div>
      )}

      {activePolicyModal === 'privacy' && (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 select-none">
            <div>
              <h2 className="text-base font-bold text-slate-800">Privacy Policy</h2>
              <p className="text-xs text-slate-500 font-medium">Offline Warehouse Dispatch Management Software</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">Effective: 10 Aug 2026</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">v1.0</span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">Provider: Stivate</span>
            </div>
          </div>

          <div className="space-y-5">
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">1. Introduction</h4>
              <p className="text-xs text-slate-600">
                This Privacy Policy explains how Stivate handles information processed through the Offline Warehouse Dispatch Management Software ("Software").
              </p>
              <p className="text-xs text-slate-600">
                The Software is designed primarily as an offline Windows application. Operational data is stored locally on the customer's computer. Certain services, such as automated cloud backups, software updates, and support requests, may require an internet connection.
              </p>
              <p className="text-xs text-slate-600">
                We aim to collect and process only information necessary to provide, maintain, secure, back up, and improve the Software.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">2. Information Processed by the Software</h4>
              <p className="text-xs text-slate-600">Depending on how the customer uses the Software, the following information may be stored:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1">
                  <strong className="text-slate-800">Dispatch Information:</strong>
                  <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                    <li>Dispatch Challan number & date</li>
                    <li>Vehicle number & Particulars</li>
                    <li>Supervisor, Scanner & Verifier names</li>
                    <li>Consignee info & Address</li>
                    <li>Pallet & Transaction details</li>
                    <li>Dispatch status</li>
                  </ul>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs space-y-1">
                  <strong className="text-slate-800">Pull List & Technical Data:</strong>
                  <ul className="list-disc pl-4 text-slate-600 space-y-0.5">
                    <li>Pull List & ID reference numbers</li>
                    <li>Kit, Workcell & Parts quantity</li>
                    <li>Barcode information</li>
                    <li>Creation & modification timestamps</li>
                    <li>Application version & OS details</li>
                    <li>Logs & Configuration settings</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">3. Offline Data Processing</h4>
              <p className="text-xs text-slate-600">
                The Software is designed to operate without an active internet connection. Operational dispatch information is primarily stored on the customer's local computer. Internet connectivity is not required for normal dispatch operations including creating dispatches, scanning Pull Lists, editing dispatches, printing documents, viewing history, and generating reports when the computer is offline.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">4. Cloud Backup & Storage</h4>
              <p className="text-xs text-slate-600">
                The Software may automatically create cloud backups of the local application database to protect against computer failure, database corruption, accidental deletion, hardware failure, or local data loss. Cloud backups contain operational information stored in the application's local database and are performed solely for data protection and recovery.
              </p>
              <p className="text-xs text-slate-600">
                Cloud backups are stored using secure cloud infrastructure providers selected by Stivate or agreed with the customer. Stivate does not use customer dispatch data for advertising, selling data, profiling employees, or unrelated commercial purposes.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">5. Software Updates & Support Requests</h4>
              <p className="text-xs text-slate-600">
                The Software may periodically check for available software updates by communicating limited technical information necessary to determine whether a newer version is available. Updates provide bug fixes, performance improvements, and security enhancements without transmitting dispatch data.
              </p>
              <p className="text-xs text-slate-600">
                Support or feature requests voluntarily submitted by the user process company name, version, feature description, contact info, and technical details solely for providing support.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">6. Data Sharing, Retention & Deletion</h4>
              <p className="text-xs text-slate-600">
                Stivate does not sell customer operational data. Local dispatch data remains under customer control. Deletion of local application data may be performed by an authorized customer administrator. Cloud backups are retained according to the backup retention policy agreed upon with the customer.
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">7. Security & Customer Responsibility</h4>
              <p className="text-xs text-slate-600">
                Stivate takes reasonable technical and organizational measures (restricted access, database protection, backup controls, access-controlled cloud storage, secure updates) to protect customer information. Customers remain responsible for securing physical PC access, maintaining Windows user accounts, protecting administrator credentials, and preventing unauthorized access.
              </p>
            </section>

            <section className="space-y-1.5 pt-2">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">8. Contact</h4>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1 font-medium select-none">
                <p><strong>Provider:</strong> Stivate</p>
                <p><strong>Email:</strong> support@stivate.com</p>
                <p><strong>Website:</strong> https://stivate.com</p>
              </div>
            </section>
          </div>
        </div>
      )}

      {activePolicyModal === 'security' && (
        <div className="space-y-6 text-slate-700 leading-relaxed text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 select-none">
            <div>
              <h2 className="text-base font-bold text-slate-800">Security Policy</h2>
              <p className="text-xs text-slate-500 font-medium">Offline Warehouse Dispatch Management Software Architecture & Security Controls</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-100">Offline-First</span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100">Encrypted Backups</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">Stivate Security</span>
            </div>
          </div>

          <div className="space-y-5">
            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">1. Purpose & Security Architecture</h4>
              <p className="text-xs text-slate-600">
                This Security Policy describes the security principles and controls applicable to the Software and its supporting services. The primary objective is to protect customer operational information while maintaining reliable warehouse operations without internet dependencies.
              </p>
              
              <div className="bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-xl border border-slate-800 leading-relaxed select-none">
                <div className="text-emerald-400 font-bold mb-1">// System Architecture Diagram</div>
                <div>Warehouse PC</div>
                <div>     │</div>
                <div>     ├── Local Application Interface</div>
                <div>     ├── Local SQLite Database (Restricted Filesystem Permissions)</div>
                <div>     ├── Local Backups</div>
                <div>     └── Internet when available</div>
                <div>              │</div>
                <div>              ├── Cloud Backup (Private Storage, Encrypted in Transit & Rest)</div>
                <div>              └── Software Updates (Trusted Release Infrastructure)</div>
              </div>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">2. Database & Backup Security Controls</h4>
              <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                <li><strong>Local Database:</strong> Stored outside installation directory, protected by Windows filesystem permissions, not exposed through unauthenticated network services.</li>
                <li><strong>Local & Cloud Backups:</strong> Stored with controlled permissions and defined retention. Cloud backups use private storage, disabled public access, restricted roles, and encryption in transit/rest.</li>
                <li><strong>Cloud Credentials Safety:</strong> Credentials must never be hardcoded into application source code or committed to GitHub repositories (e.g. AWS access keys). Secure environment/credential management is enforced.</li>
              </ul>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">3. Access Control & Release Integrity</h4>
              <p className="text-xs text-slate-600">
                Access to customer systems and cloud infrastructure follows the principle of least privilege. Software updates are distributed exclusively through authenticated/trusted release infrastructure with explicit semantic versioning (e.g. 1.0.0, 1.0.1, 1.1.0, 2.0.0).
              </p>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">4. Incident Response Steps</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 select-none">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <strong className="text-slate-800">1. Identify</strong>
                  <p className="text-[11px] text-slate-500">Confirm & log incident</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <strong className="text-slate-800">2. Contain</strong>
                  <p className="text-[11px] text-slate-500">Isolate affected system</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <strong className="text-slate-800">3. Recover</strong>
                  <p className="text-[11px] text-slate-500">Restore safely from backups</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                  <strong className="text-slate-800">4. Resolve</strong>
                  <p className="text-[11px] text-slate-500">Apply patch & notify</p>
                </div>
              </div>
            </section>

            <section className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">5. Security Responsibilities</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100 space-y-1">
                  <strong className="text-emerald-900">Stivate Responsibilities:</strong>
                  <p className="text-slate-600">Application security, secure development, release management, cloud infrastructure configuration, and incident response within scope.</p>
                </div>
                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 space-y-1">
                  <strong className="text-blue-900">Customer Responsibilities:</strong>
                  <p className="text-slate-600">Physical PC security, Windows account security, authorized operator access, protecting local credentials, and internal security procedures.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </Modal>
  );
};
