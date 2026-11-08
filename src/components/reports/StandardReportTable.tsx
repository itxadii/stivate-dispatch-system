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
    <table className="table">
      <thead>
        <tr>
          <th>
            {reportType === 'daily'
              ? 'Date'
              : reportType === 'monthly'
              ? 'Month'
              : reportType === 'vehicle'
              ? 'Vehicle number'
              : 'Supervisor'}
          </th>
          <th className="text-right w-36">
            Dispatches
          </th>
          <th className="text-right w-36">
            Pallets
          </th>
          <th className="text-right w-40">
            Parts loaded
          </th>
        </tr>
      </thead>
      <tbody>
        {reportData.map((row, idx) => (
          <tr key={idx}>
            <td className="whitespace-nowrap font-bold text-slate-800">
              {reportType === 'daily'
                ? row.date
                : reportType === 'monthly'
                ? row.month
                : reportType === 'vehicle'
                ? row.vehicle_no
                : row.supplier_name}
            </td>
            <td className="whitespace-nowrap text-right tabular-nums">
              {row.dispatch_count}
            </td>
            <td className="whitespace-nowrap text-right tabular-nums">
              {row.total_pallets}
            </td>
            <td className="whitespace-nowrap text-right font-bold text-slate-900 tabular-nums">
              {row.total_parts}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
