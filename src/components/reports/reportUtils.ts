export const exportLoadingSummaryExcel = (
  reportData: any[],
  startDate: string,
  endDate: string,
  selectedDestination: string
) => {
  if (reportData.length === 0) return;

  const firstDate = startDate 
    ? startDate.split('-').reverse().join('-') 
    : (reportData[0]?.date || new Date().toISOString().substring(0, 10).split('-').reverse().join('-'));
  const lastDate = endDate 
    ? endDate.split('-').reverse().join('-') 
    : (reportData[reportData.length - 1]?.date || new Date().toISOString().substring(0, 10).split('-').reverse().join('-'));
  
  const monthName = reportData[0]?.month || 'JULY';
  const yearStr = (startDate || new Date().toISOString()).substring(0, 4);

  const destTitle = selectedDestination && selectedDestination !== 'ALL' 
    ? selectedDestination.toUpperCase() 
    : 'ALL DESTINATIONS';

  const titleBannerText = `I3PL TO ${destTitle} MONTH OF ${monthName} ${yearStr} [ ${firstDate} TO ${lastDate} ] LOADING SUMMARY`;

  let excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
 <x:ExcelWorkbook>
  <x:ExcelWorksheets>
   <x:ExcelWorksheet>
    <x:Name>Loading Summary</x:Name>
    <x:WorksheetOptions>
     <x:DisplayGridlines/>
    </x:WorksheetOptions>
   </x:ExcelWorksheet>
  </x:ExcelWorksheets>
 </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  table { border-collapse: collapse; font-family: 'Bookman Old Style', Calibri, sans-serif; }
  .banner { background-color: #ffd966; color: #000000; font-weight: bold; font-size: 12pt; text-align: center; border: 1.5pt solid #000000; padding: 6px; }
  th { background-color: #a9d08e; color: #000000; font-weight: bold; font-size: 10pt; border: 1pt solid #000000; text-align: center; padding: 4px; }
  td { border: 0.5pt solid #000000; font-size: 9.5pt; text-align: center; padding: 4px; font-family: Calibri, sans-serif; }
</style>
</head>
<body>
<table>
  <tr>
    <td colspan="11" class="banner">${titleBannerText}</td>
  </tr>
  <tr>
    <th>Sr. No</th>
    <th>Date</th>
    <th>Vehicle No</th>
    <th>Vehicle Type</th>
    <th>Department</th>
    <th>Work sell</th>
    <th>Pallets</th>
    <th>Out time</th>
    <th>ROUND</th>
    <th>Month</th>
    <th>REMARK</th>
  </tr>`;

  reportData.forEach((row, idx) => {
    excelHtml += `
  <tr>
    <td>${idx + 1}</td>
    <td>${row.date || ''}</td>
    <td>${row.vehicle_no || ''}</td>
    <td>${row.vehicle_type || ''}</td>
    <td>${row.department || ''}</td>
    <td>${row.workcell || ''}</td>
    <td>${row.pallets || 1}</td>
    <td>${row.out_time || ''}</td>
    <td>${row.round !== undefined ? row.round : 1}</td>
    <td>${row.month || ''}</td>
    <td></td>
  </tr>`;
  });

  excelHtml += `
</table>
</body>
</html>`;

  const blob = new Blob([excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `LOADING_SUMMARY_${destTitle.replace(/\s+/g, '_')}_${firstDate}_TO_${lastDate}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportReportCsv = (
  reportData: any[],
  reportType: 'daily' | 'monthly' | 'vehicle' | 'supplier'
) => {
  if (reportData.length === 0) return;

  let csvContent = "data:text/csv;charset=utf-8,";
  const headers =
    reportType === 'daily'
      ? ['Date', 'Dispatch Count', 'Total Pallets', 'Total Parts']
      : reportType === 'monthly'
      ? ['Month', 'Dispatch Count', 'Total Pallets', 'Total Parts']
      : reportType === 'vehicle'
      ? ['Vehicle Number', 'Dispatch Count', 'Total Pallets', 'Total Parts']
      : ['Supervisor Name', 'Dispatch Count', 'Total Pallets', 'Total Parts'];

  csvContent += headers.join(',') + '\r\n';

  for (const row of reportData) {
    const colValues =
      reportType === 'daily'
        ? [row.date, row.dispatch_count, row.total_pallets, row.total_parts]
        : reportType === 'monthly'
        ? [row.month, row.dispatch_count, row.total_pallets, row.total_parts]
        : reportType === 'vehicle'
        ? [row.vehicle_no, row.dispatch_count, row.total_pallets, row.total_parts]
        : [row.supplier_name, row.dispatch_count, row.total_pallets, row.total_parts];

    csvContent += colValues.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\r\n';
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `dispatch_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
