import React from 'react';

interface LoadingSummaryTableProps {
  reportData: any[];
  selectedDestination: string;
  startDate: string;
  endDate: string;
}

export const LoadingSummaryTable: React.FC<LoadingSummaryTableProps> = ({
  reportData,
  selectedDestination,
  startDate,
  endDate,
}) => {
  const destTitle = selectedDestination && selectedDestination !== 'ALL'
    ? selectedDestination.toUpperCase()
    : 'ALL DESTINATIONS';

  const monthName = reportData[0]?.month || 'JULY';
  const yearStr = startDate ? startDate.substring(0, 4) : new Date().getFullYear();

  return (
    <div>
      {/* Title Banner preview */}
      <div className="bg-[#ffd966] text-slate-900 font-bold text-center py-2 px-4 text-xs border-b border-amber-300 uppercase tracking-wide select-none">
        I3PL TO {destTitle} MONTH OF {monthName} {yearStr} [{startDate || 'START'} TO {endDate || 'END'}] LOADING SUMMARY
      </div>
      <table className="min-w-full divide-y divide-slate-200 text-xs">
        <thead className="bg-[#a9d08e] text-slate-900 font-bold uppercase tracking-wider select-none">
          <tr>
            <th className="px-3 py-2 text-center border-r border-green-300">Sr. No</th>
            <th className="px-3 py-2 text-center border-r border-green-300">Date</th>
            <th className="px-3 py-2 text-center border-r border-green-300">Vehicle No</th>
            <th className="px-3 py-2 text-center border-r border-green-300">Vehicle Type</th>
            <th className="px-3 py-2 text-center border-r border-green-300">Department</th>
            <th className="px-3 py-2 text-center border-r border-green-300">Work sell</th>
            <th className="px-3 py-2 text-center border-r border-green-300">Pallets</th>
            <th className="px-3 py-2 text-center border-r border-green-300">Out time</th>
            <th className="px-3 py-2 text-center border-r border-green-300">ROUND</th>
            <th className="px-3 py-2 text-center border-r border-green-300">Month</th>
            <th className="px-3 py-2 text-center">REMARK</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white font-mono">
          {reportData.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-50 transition-colors">
              <td className="px-3 py-2 text-center text-slate-500 font-bold">{row.sr_no || idx + 1}</td>
              <td className="px-3 py-2 text-center font-bold text-slate-800">{row.date}</td>
              <td className="px-3 py-2 text-center font-bold text-slate-900">{row.vehicle_no}</td>
              <td className="px-3 py-2 text-center text-slate-700">{row.vehicle_type}</td>
              <td className="px-3 py-2 text-center text-slate-700 font-bold">{row.department}</td>
              <td className="px-3 py-2 text-center font-bold text-slate-900 bg-amber-50/20">{row.workcell}</td>
              <td className="px-3 py-2 text-center font-bold text-blue-700">{row.pallets}</td>
              <td className="px-3 py-2 text-center font-bold text-slate-800">{row.out_time}</td>
              <td className={`px-3 py-2 text-center font-bold ${row.round === 1 ? 'text-emerald-700 bg-emerald-50/50' : 'text-slate-400'}`}>{row.round}</td>
              <td className="px-3 py-2 text-center font-bold text-slate-700">{row.month}</td>
              <td className="px-3 py-2 text-center text-slate-400"></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
