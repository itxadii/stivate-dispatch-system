import React from 'react';

interface StandardReportTableProps {
  reportType: 'daily' | 'monthly' | 'vehicle' | 'supplier';
  reportData: any[];
}

export const StandardReportTable: React.FC<StandardReportTableProps> = ({
  reportType,
  reportData,
}) => {
  return (
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
            {reportType === 'daily'
              ? 'Date'
              : reportType === 'monthly'
              ? 'Month'
              : reportType === 'vehicle'
              ? 'Vehicle Number'
              : 'Supervisor Name'}
          </th>
          <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-36">
            Total Dispatches
          </th>
          <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-36">
            Total Pallets
          </th>
          <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-40">
            Total Parts Loaded
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {reportData.map((row, idx) => (
          <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-100">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-bold uppercase font-mono">
              {reportType === 'daily'
                ? row.date
                : reportType === 'monthly'
                ? row.month
                : reportType === 'vehicle'
                ? row.vehicle_no
                : row.supplier_name}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700 text-right font-medium">
              {row.dispatch_count}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700 text-right font-medium">
              {row.total_pallets}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-800 text-right font-bold">
              {row.total_parts}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
