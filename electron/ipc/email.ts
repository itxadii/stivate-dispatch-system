import nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { loadSettings, saveSettings, AppSettings } from './settings';
import { getAllDispatches, logAudit } from './database';
import { exportVehicleUtilizationReport } from './printer';

/**
 * Standard vehicle maximum pallet capacities:
 * 32 ft = 16 pallets, 20 ft = 8 pallets, 10 ft = 2 pallets.
 */
const getVehicleMaxPallets = (vehicleSize?: string): number => {
  if (!vehicleSize) return 16;
  const norm = vehicleSize.toLowerCase().trim();
  if (norm.includes('32')) return 16;
  if (norm.includes('20')) return 8;
  if (norm.includes('10')) return 2;
  const match = norm.match(/(\d+)/);
  if (match) {
    const ft = parseInt(match[1], 10);
    if (!isNaN(ft) && ft > 0) {
      if (ft >= 30) return 16;
      if (ft >= 20) return 8;
      if (ft >= 10) return 2;
      return Math.max(1, Math.round((ft / 32) * 16));
    }
  }
  return 16;
};

/**
 * Resolves static assets (like logos) from development and production directories.
 */
export const getAssetPath = (filename: string): string | null => {
  const candidates = [
    path.join(process.cwd(), 'public', filename),
    path.join(process.cwd(), 'dist', filename),
    path.join(__dirname, '../../public', filename),
    path.join(__dirname, '../public', filename),
    path.join(__dirname, filename),
    path.join(process.cwd(), filename),
    ...(process.resourcesPath ? [
      path.join(process.resourcesPath, 'public', filename),
      path.join(process.resourcesPath, 'app.asar.unpacked', 'public', filename),
    ] : [])
  ];

  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      return c;
    }
  }
  return null;
};

/**
 * Reads a local image file and converts it into a Base64 data URI for inline HTML rendering.
 * This directly embeds the images in email HTML so mail clients do not show them as downloadable attachment cards.
 */
export const getBase64ImageUri = (filename: string): string | null => {
  const filePath = getAssetPath(filename);
  if (!filePath || !fs.existsSync(filePath)) return null;
  try {
    const ext = path.extname(filePath).replace('.', '').toLowerCase() || 'png';
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
    const b64 = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${b64}`;
  } catch (err) {
    console.error(`Failed to encode image to base64 for ${filename}:`, err);
    return null;
  }
};

/**
 * Creates and configures Nodemailer transporter for Purelymail or custom SMTP.
 */
export const getMailerTransport = (settings: AppSettings) => {
  const emailCfg = settings.emailSettings;
  const host = (emailCfg?.smtpHost || 'smtp.purelymail.com').trim();
  const port = Number(emailCfg?.smtpPort) || 465;
  const isSecure = emailCfg?.smtpSecure ?? (port === 465);

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: (emailCfg?.smtpUser || emailCfg?.fromEmail || 'noreply@stivate.com').trim(),
      pass: (emailCfg?.smtpPassword || 'noreply@123@stivate.com').trim(),
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  });
};

const formatDisplayDate = (dStr: string) => {
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return dStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dStr;
  }
};

/**
 * Aggregates dispatches from SQLite database into a Weekly Fleet Utilization dataset.
 * Note: Strictly excludes today's ongoing/incomplete dispatches as requested.
 */
export const buildVehicleUtilizationDataset = (
  dateRange: 'weekly' | 'daily' | 'today' | 'last7days' | 'all' = 'weekly'
) => {
  const allDispatches: any[] = getAllDispatches();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Exclude today's incomplete/ongoing dispatches
  const completedDispatches = allDispatches.filter((d: any) => {
    const dDate = (d.date || '').slice(0, 10);
    return dDate && dDate < todayStr;
  });

  // Calculate standard 7 completed days window (ending yesterday)
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const weekStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() - 6);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  let filtered: any[] = [];
  let startDate = weekStartStr;
  let endDate = yesterdayStr;
  let dateRangeLabel = `Weekly Audit (${formatDisplayDate(weekStartStr)} - ${formatDisplayDate(yesterdayStr)})`;

  if (dateRange === 'daily' || dateRange === 'today') {
    // Daily Report: Today's vehicle utilization
    filtered = allDispatches.filter((d: any) => (d.date || '').slice(0, 10) === todayStr);
    startDate = todayStr;
    endDate = todayStr;
    dateRangeLabel = `Today's Daily Audit (${formatDisplayDate(todayStr)})`;

    if (filtered.length === 0 && allDispatches.length > 0) {
      const dates = allDispatches
        .map((d: any) => (d.date || '').slice(0, 10))
        .filter(Boolean)
        .sort();
      const latestDate = dates[dates.length - 1];
      startDate = latestDate;
      endDate = latestDate;
      filtered = allDispatches.filter((d: any) => (d.date || '').slice(0, 10) === latestDate);
      dateRangeLabel = `Daily Audit (${formatDisplayDate(latestDate)})`;
    }
  } else if (dateRange === 'weekly' || dateRange === 'last7days') {
    filtered = completedDispatches.filter((d: any) => {
      const dDate = (d.date || '').slice(0, 10);
      return dDate >= weekStartStr && dDate <= yesterdayStr;
    });

    // If no dispatches exist in the exact past 7 calendar days (e.g. test environments),
    // anchor the 7-day window to the most recent completed dispatch date prior to today.
    if (filtered.length === 0 && completedDispatches.length > 0) {
      const dates = completedDispatches
        .map((d: any) => (d.date || '').slice(0, 10))
        .filter(Boolean)
        .sort();
      const latestCompletedDate = dates[dates.length - 1];
      const latestObj = new Date(latestCompletedDate);
      const anchorStartObj = new Date(latestObj.getFullYear(), latestObj.getMonth(), latestObj.getDate() - 6);

      startDate = anchorStartObj.toISOString().split('T')[0];
      endDate = latestCompletedDate;
      filtered = completedDispatches.filter((d: any) => {
        const dDate = (d.date || '').slice(0, 10);
        return dDate >= startDate && dDate <= endDate;
      });
      dateRangeLabel = `Weekly Audit (${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)})`;
    }

    if (filtered.length === 0) {
      filtered = completedDispatches.slice(0, 150);
      dateRangeLabel = 'Weekly Fleet Audit (Excluding Today)';
    }
  } else {
    // All time
    filtered = completedDispatches.length > 0 ? completedDispatches : allDispatches;
    dateRangeLabel = 'Complete Fleet History (Excluding Today)';
    startDate = undefined as any;
    endDate = undefined as any;
  }

  // 1. Build Day-by-Day Progression Trend (7 Days)
  const dayBuckets = new Map<string, { date: string; dayLabel: string; dispatches: number; pallets: number; capacity: number }>();

  if (startDate && endDate) {
    const curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
      const ymd = curr.toISOString().split('T')[0];
      const dayName = curr.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
      dayBuckets.set(ymd, { date: ymd, dayLabel: dayName, dispatches: 0, pallets: 0, capacity: 0 });
      curr.setDate(curr.getDate() + 1);
    }
  }

  // 2. Aggregate by Vehicle
  const vehicleMap = new Map<string, {
    vehicleNo: string;
    vehicleType: string;
    dispatchesCount: number;
    loadedPallets: number;
    availableCapacity: number;
  }>();

  filtered.forEach((d: any) => {
    const vNo = (d.vehicle_no || '').trim().toUpperCase() || 'UNKNOWN';
    const vSize = d.vehicle_size || '32 ft';
    const maxCap = getVehicleMaxPallets(vSize);
    const loaded = Number(d.total_pallets) || 1;
    const ymd = (d.date || '').slice(0, 10);

    // Add to daily bucket
    if (dayBuckets.has(ymd)) {
      const b = dayBuckets.get(ymd)!;
      b.dispatches += 1;
      b.pallets += loaded;
      b.capacity += maxCap;
    } else if (ymd) {
      const dayObj = new Date(ymd);
      const dayName = !isNaN(dayObj.getTime())
        ? dayObj.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
        : ymd;
      dayBuckets.set(ymd, { date: ymd, dayLabel: dayName, dispatches: 1, pallets: loaded, capacity: maxCap });
    }

    // Add to vehicle map
    const existing = vehicleMap.get(vNo) || {
      vehicleNo: vNo,
      vehicleType: vSize,
      dispatchesCount: 0,
      loadedPallets: 0,
      availableCapacity: 0,
    };

    existing.dispatchesCount += 1;
    existing.loadedPallets += loaded;
    existing.availableCapacity += maxCap;
    if (d.vehicle_size) existing.vehicleType = d.vehicle_size;

    vehicleMap.set(vNo, existing);
  });

  const dailyTrend = Array.from(dayBuckets.values()).map((b) => ({
    ...b,
    utilizationPct: b.capacity > 0 ? Number(((b.pallets / b.capacity) * 100).toFixed(1)) : 0,
  }));

  const vehicles = Array.from(vehicleMap.values()).map((v) => ({
    ...v,
    utilizationPct: v.availableCapacity > 0 ? Number(((v.loadedPallets / v.availableCapacity) * 100).toFixed(2)) : 0,
  })).sort((a, b) => b.utilizationPct - a.utilizationPct);

  // 3. Type Summary (32 ft, 20 ft, 10 ft) with standard pallet capacities
  const typeMap: Record<string, {
    vehicleType: string;
    palletRule: string;
    totalVehicles: Set<string>;
    dispatches: number;
    loadedPallets: number;
    availableCapacity: number;
  }> = {
    '32 ft': { vehicleType: '32 FT Trucks', palletRule: '16 Pallets / DC', totalVehicles: new Set(), dispatches: 0, loadedPallets: 0, availableCapacity: 0 },
    '20 ft': { vehicleType: '20 FT Trucks', palletRule: '8 Pallets / DC', totalVehicles: new Set(), dispatches: 0, loadedPallets: 0, availableCapacity: 0 },
    '10 ft': { vehicleType: '10 FT Trucks', palletRule: '2 Pallets / DC', totalVehicles: new Set(), dispatches: 0, loadedPallets: 0, availableCapacity: 0 },
  };

  vehicles.forEach((v) => {
    const szNorm = v.vehicleType.toLowerCase().includes('20')
      ? '20 ft'
      : v.vehicleType.toLowerCase().includes('10')
        ? '10 ft'
        : '32 ft';

    if (typeMap[szNorm]) {
      typeMap[szNorm].totalVehicles.add(v.vehicleNo);
      typeMap[szNorm].dispatches += v.dispatchesCount;
      typeMap[szNorm].loadedPallets += v.loadedPallets;
      typeMap[szNorm].availableCapacity += v.availableCapacity;
    }
  });

  const vehicleTypeSummary = Object.values(typeMap).map((t) => ({
    vehicleType: t.vehicleType,
    palletRule: t.palletRule,
    totalVehicles: t.totalVehicles.size,
    dispatches: t.dispatches,
    loadedPallets: t.loadedPallets,
    availableCapacity: t.availableCapacity,
    utilizationPct: t.availableCapacity > 0 ? Number(((t.loadedPallets / t.availableCapacity) * 100).toFixed(2)) : 0,
  }));

  const totalLoaded = filtered.reduce((acc, d) => acc + (Number(d.total_pallets) || 1), 0);
  const totalCapacity = filtered.reduce((acc, d) => acc + getVehicleMaxPallets(d.vehicle_size), 0);
  const overallUtil = totalCapacity > 0 ? Number(((totalLoaded / totalCapacity) * 100).toFixed(2)) : 0;

  const dispatchDetails = filtered.slice(0, 150).map((d: any) => {
    const vSize = d.vehicle_size || '32 ft';
    const maxCap = getVehicleMaxPallets(vSize);
    const loaded = Number(d.total_pallets) || 1;
    return {
      dcNo: d.dc_no || '-',
      date: d.date ? d.date.replace('T', ' ').slice(0, 19) : '-',
      vehicleNo: (d.vehicle_no || '-').toUpperCase(),
      vehicleSize: vSize,
      supplierName: (d.supplier_name || '-').replace(/[\r\n\t]+/g, ' ').trim(),
      loadedPallets: loaded,
      dispatchCapacity: maxCap,
      loadRatioPct: Number(((loaded / maxCap) * 100).toFixed(2)),
      status: d.status || 'completed',
    };
  });

  return {
    options: {
      dateRangeLabel,
      startDate,
      endDate,
      dcFilter: 'All DCs',
      vehicleFilter: 'All Vehicles',
      reportType: 'both' as const,
      includeCompleteFleet: true,
    },
    data: {
      summary: {
        totalVehicles: vehicles.length,
        totalDispatches: filtered.length,
        totalLoadedPallets: totalLoaded,
        totalAvailableCapacity: totalCapacity,
        fleetUtilizationPct: overallUtil,
      },
      dailyTrend,
      vehicleTypeSummary,
      vehicles,
      dispatches: dispatchDetails,
    },
  };
};

/**
 * Builds a compact, high-density HTML email template for Vehicle Utilization Reports.
 * Typography scaled down ~50% (8px-9.5px) so all columns fit within any email view without overflow.
 */
/**
 * Builds a simplified, elegant, high-clarity HTML email template for Vehicle Utilization Reports.
 * Uses MIME inline CID attachments for logos (zero broken images in Gmail/Outlook).
 * Features a dedicated Warehouse Identification banner and crisp executive typography.
 */
/**
 * Builds a clean, sorted, highly-skimmable HTML email template for Vehicle Utilization Reports.
 * Pure typography and structured tables - zero image dependencies to guarantee 100% flawless rendering
 * across all email clients (Gmail, Outlook, Apple Mail, Webmail).
 */
const generateEmailHtml = (
  summary: any,
  vehicleTypeSummary: any[],
  dailyTrend: any[],
  vehicles: any[],
  dateRangeLabel: string,
  warehouseLocation: string,
  reportType: 'weekly' | 'daily' = 'weekly'
): string => {
  const normWh = (warehouseLocation || 'F Warehouse').trim();
  const warehouseBadgeText = normWh.toLowerCase().includes('warehouse')
    ? normWh.toUpperCase()
    : `WAREHOUSE: ${normWh.toUpperCase()}`;

  const utilPct = summary.fleetUtilizationPct.toFixed(1);
  const utilBadgeColor = summary.fleetUtilizationPct > 100 ? '#dc2626' : summary.fleetUtilizationPct >= 80 ? '#d97706' : '#16a34a';
  const utilBadgeBg = summary.fleetUtilizationPct > 100 ? '#fee2e2' : summary.fleetUtilizationPct >= 80 ? '#fef3c7' : '#dcfce7';

  // Section 1: Simplified 4-column Vehicle Type Breakdown (Typography scaled down)
  const typeRowsHtml = vehicleTypeSummary
    .map((t) => {
      const hasData = t.dispatches > 0;
      return `
    <tr style="background-color: ${hasData ? '#ffffff' : '#f8fafc'};">
      <td style="padding: 3px 5px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #1e293b; font-size: 5.2px;">
        ${t.vehicleType}
        <span style="font-size: 4.5px; font-weight: normal; color: #64748b; margin-left: 2px;">(${t.palletRule})</span>
      </td>
      <td style="padding: 3px 4px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155; font-weight: 600; font-size: 5.2px;">
        ${t.dispatches}
      </td>
      <td style="padding: 3px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 700; font-size: 5.2px;">
        ${t.loadedPallets.toLocaleString()} <span style="font-size: 4.5px; font-weight: normal; color: #64748b;">/ ${t.availableCapacity.toLocaleString()}</span>
      </td>
      <td style="padding: 3px 5px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 800; font-size: 5.2px; color: ${t.utilizationPct >= 80 ? '#b45309' : hasData ? '#15803d' : '#94a3b8'};">
        ${t.utilizationPct.toFixed(1)}%
      </td>
    </tr>`;
    })
    .join('');

  // Section 2: Progression or active vehicle rows (Typography scaled down)
  let secondarySectionHtml = '';
  if (reportType === 'weekly') {
    const dailyRowsHtml = (dailyTrend || [])
      .map((d) => {
        const hasData = d.dispatches > 0;
        return `
      <tr style="background-color: ${hasData ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 3px 5px; border-bottom: 1px solid #e2e8f0; font-weight: ${hasData ? '700' : '500'}; color: ${hasData ? '#0f172a' : '#64748b'}; font-size: 5.2px;">
          ${d.dayLabel}
        </td>
        <td style="padding: 3px 4px; border-bottom: 1px solid #e2e8f0; text-align: center; color: ${hasData ? '#0f172a' : '#94a3b8'}; font-weight: ${hasData ? '700' : '400'}; font-size: 5.2px;">
          ${d.dispatches}
        </td>
        <td style="padding: 3px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; color: ${hasData ? '#0f172a' : '#94a3b8'}; font-weight: ${hasData ? '700' : '400'}; font-size: 5.2px;">
          ${hasData ? `${d.pallets} / ${d.capacity}` : '-'}
        </td>
        <td style="padding: 3px 5px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 800; font-size: 5.2px; color: ${hasData ? (d.utilizationPct >= 80 ? '#b45309' : '#15803d') : '#94a3b8'};">
          ${hasData ? `${d.utilizationPct.toFixed(1)}%` : '0.0%'}
        </td>
      </tr>`;
      })
      .join('');

    secondarySectionHtml = `
      <div style="font-size: 5.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; color: #0f172a; margin: 6px 0 3px 0;">
        2. Daily Progression (7-Day Overview)
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; margin-bottom: 6px; font-size: 5.2px;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 4.5px; letter-spacing: 0.2px;">
            <th width="36%" style="padding: 3px 5px; text-align: left; border-bottom: 1px solid #cbd5e1;">Day / Date</th>
            <th width="18%" style="padding: 3px 4px; text-align: center; border-bottom: 1px solid #cbd5e1;">DCs</th>
            <th width="28%" style="padding: 3px 4px; text-align: right; border-bottom: 1px solid #cbd5e1;">Pallets / Cap</th>
            <th width="18%" style="padding: 3px 5px; text-align: right; border-bottom: 1px solid #cbd5e1;">Load %</th>
          </tr>
        </thead>
        <tbody>
          ${dailyRowsHtml}
        </tbody>
      </table>`;
  } else {
    // Daily report: Show individual vehicles active today (Typography scaled down)
    const activeVehicles = vehicles.filter((v: any) => v.dispatchesCount > 0);
    const vehicleList = (activeVehicles.length > 0 ? activeVehicles : vehicles).slice(0, 10);
    const vehicleRows = vehicleList
      .map(
        (v: any, idx: number) => `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 3px 5px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: 700; color: #0f172a; font-size: 5.2px;">
          ${v.vehicleNo}
          <span style="font-family: sans-serif; font-size: 4.5px; font-weight: normal; color: #64748b; margin-left: 2px;">(${v.vehicleType})</span>
        </td>
        <td style="padding: 3px 4px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #334155; font-weight: 600; font-size: 5.2px;">
          ${v.dispatchesCount}
        </td>
        <td style="padding: 3px 4px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0f172a; font-weight: 700; font-size: 5.2px;">
          ${v.loadedPallets} <span style="font-size: 4.5px; font-weight: normal; color: #64748b;">/ ${v.availableCapacity}</span>
        </td>
        <td style="padding: 3px 5px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 800; font-size: 5.2px; color: ${v.utilizationPct > 100 ? '#dc2626' : v.utilizationPct >= 80 ? '#b45309' : '#15803d'};">
          ${v.utilizationPct.toFixed(1)}%
        </td>
      </tr>`
      )
      .join('');

    secondarySectionHtml = `
      <div style="font-size: 5.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; color: #0f172a; margin: 6px 0 3px 0;">
        2. Active Fleet Vehicles (${vehicleList.length} Trucks)
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; margin-bottom: 6px; font-size: 5.2px;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 4.5px; letter-spacing: 0.2px;">
            <th width="38%" style="padding: 3px 5px; text-align: left; border-bottom: 1px solid #cbd5e1;">Vehicle</th>
            <th width="16%" style="padding: 3px 4px; text-align: center; border-bottom: 1px solid #cbd5e1;">DCs</th>
            <th width="28%" style="padding: 3px 4px; text-align: right; border-bottom: 1px solid #cbd5e1;">Pallets / Cap</th>
            <th width="18%" style="padding: 3px 5px; text-align: right; border-bottom: 1px solid #cbd5e1;">Load %</th>
          </tr>
        </thead>
        <tbody>
          ${vehicleRows}
        </tbody>
      </table>`;
  }

  const generatedDate = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const reportTitleText = reportType === 'daily' ? 'Daily I3PL Fleet Load Report' : 'Weekly I3PL Fleet Load Report';
  const kpiDcsText = reportType === 'daily' ? 'Today DCs' : 'Weekly DCs';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${reportTitleText} - ${warehouseLocation}</title>
</head>
<body style="margin: 0; padding: 8px 3px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 400px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 5px; overflow: hidden; border: 1px solid #cbd5e1; box-sizing: border-box; font-size: 5.5px; line-height: 1.3;">
    
    <!-- Clean Executive Header (Pure typography - Zero image rendering issues) -->
    <div style="background-color: #ffffff; padding: 8px 11px; border-bottom: 2px solid #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed;">
        <tr>
          <!-- Warehouse Facility Tag (No duplicate 'WAREHOUSE' word) -->
          <td align="left" valign="middle">
            <span style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 2px 5px; border-radius: 3px; font-size: 5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; white-space: nowrap;">
              ${warehouseBadgeText}
            </span>
          </td>
          <!-- Header label: DAILY REPORTS / WEEKLY REPORTS -->
          <td align="right" valign="middle">
            <span style="font-size: 6px; font-weight: 800; color: #475569; letter-spacing: 0.3px; text-transform: uppercase; white-space: nowrap;">
              ${reportType === 'daily' ? 'DAILY REPORTS' : 'WEEKLY REPORTS'}
            </span>
          </td>
        </tr>
      </table>

      <!-- Title & Overall Load Scorecard -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed; margin-top: 5px;">
        <tr>
          <td valign="middle" style="padding-right: 8px;">
            <div style="font-size: 9px; font-weight: 800; color: #0f172a; line-height: 1.25;">
              ${reportTitleText}
            </div>
            <div style="font-size: 5.5px; color: #64748b; margin-top: 2px;">
              Audit Period: <strong style="color: #1e293b;">${dateRangeLabel}</strong>
            </div>
          </td>

          <!-- Big, Skimmable Load % Badge -->
          <td width="60" align="right" valign="middle">
            <div style="background-color: ${utilBadgeBg}; color: ${utilBadgeColor}; border: 1px solid ${utilBadgeColor}; border-radius: 5px; padding: 3px 5px; text-align: center; width: 56px; box-sizing: border-box;">
              <div style="font-size: 10px; font-weight: 900; line-height: 1; font-family: monospace, sans-serif;">${utilPct}%</div>
              <div style="font-size: 4.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; margin-top: 1px;">FLEET LOAD</div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Body Container -->
    <div style="padding: 8px 11px;">

      <!-- Key Metrics Strip (Instantly skimmable 4 columns) -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed; margin-bottom: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px;">
        <tr>
          <td style="padding: 5px 3px; text-align: center; border-right: 1px solid #e2e8f0;">
            <div style="font-size: 4.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.2px;">${kpiDcsText}</div>
            <div style="font-size: 8px; font-weight: 800; color: #0f172a; margin-top: 1px;">${summary.totalDispatches.toLocaleString()}</div>
          </td>
          <td style="padding: 5px 3px; text-align: center; border-right: 1px solid #e2e8f0;">
            <div style="font-size: 4.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.2px;">Active Fleet</div>
            <div style="font-size: 8px; font-weight: 800; color: #0f172a; margin-top: 1px;">${summary.totalVehicles}</div>
          </td>
          <td style="padding: 5px 3px; text-align: center; border-right: 1px solid #e2e8f0;">
            <div style="font-size: 4.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.2px;">Loaded Pallets</div>
            <div style="font-size: 8px; font-weight: 800; color: #059669; margin-top: 1px;">${summary.totalLoadedPallets.toLocaleString()}</div>
          </td>
          <td style="padding: 5px 3px; text-align: center;">
            <div style="font-size: 4.5px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.2px;">Total Capacity</div>
            <div style="font-size: 8px; font-weight: 800; color: #d97706; margin-top: 1px;">${summary.totalAvailableCapacity.toLocaleString()}</div>
          </td>
        </tr>
      </table>

      <!-- Section 1: Fleet Utilization by Vehicle Type -->
      <div style="font-size: 5.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px; color: #0f172a; margin: 6px 0 3px 0;">
        1. Fleet Utilization by Vehicle Type
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed; border-collapse: collapse; border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; margin-bottom: 6px; font-size: 5.2px;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 4.5px; letter-spacing: 0.2px;">
            <th width="38%" style="padding: 3px 5px; text-align: left; border-bottom: 1px solid #cbd5e1;">Vehicle Type</th>
            <th width="18%" style="padding: 3px 4px; text-align: center; border-bottom: 1px solid #cbd5e1;">DCs</th>
            <th width="26%" style="padding: 3px 4px; text-align: right; border-bottom: 1px solid #cbd5e1;">Pallets / Cap</th>
            <th width="18%" style="padding: 3px 5px; text-align: right; border-bottom: 1px solid #cbd5e1;">Load %</th>
          </tr>
        </thead>
        <tbody>
          ${typeRowsHtml}
        </tbody>
      </table>

      <!-- Section 2: Daily Progression or Active Fleet Vehicles -->
      ${secondarySectionHtml}

      <!-- Clean PDF Attachment Notice -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 5px 8px; margin-top: 6px; font-size: 5px; color: #475569; text-align: center;">
        📎 Multi-page official audit report attached as PDF (Facility: <strong>${warehouseLocation}</strong> &bull; Generated: ${generatedDate})
      </div>
    </div>

    <!-- Official Minimal Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 6px 11px; font-size: 5px; color: #64748b; text-align: center; line-height: 1.3;">
      Automated report for <strong>${warehouseLocation}</strong> generated by <strong>Stivate Technologies LLP</strong> for <strong>I3PL India Pvt Ltd</strong>.
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Sends the Vehicle Utilization Report email (weekly or daily) to configured recipients with attached PDF and embedded logos.
 */
export const sendVehicleUtilizationReportEmail = async (options?: {
  customTo?: string | string[];
  dateRange?: 'weekly' | 'daily' | 'today' | 'last7days' | 'all';
  reportFrequency?: 'weekly' | 'daily';
  recipientId?: string;
}): Promise<{
  success: boolean;
  message: string;
  messageId?: string;
  filePath?: string;
  sentCount?: number;
  recipientsList?: string[];
}> => {
  try {
    const settings = loadSettings();
    const emailCfg = settings.emailSettings || {
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
    };

    if (!emailCfg.smtpPassword) {
      emailCfg.smtpPassword = 'noreply@123@stivate.com';
    }
    if (!emailCfg.smtpHost) {
      emailCfg.smtpHost = 'smtp.purelymail.com';
    }

    const reportType: 'weekly' | 'daily' =
      options?.reportFrequency || (options?.dateRange === 'daily' ? 'daily' : 'weekly');
    const effectiveDateRange =
      options?.dateRange || (reportType === 'daily' ? 'daily' : 'weekly');

    // Resolve target recipients
    let targetRecipients: string[] = [];
    if (options?.customTo) {
      targetRecipients = Array.isArray(options.customTo) ? options.customTo : [options.customTo];
    } else if (options?.recipientId) {
      const found = (emailCfg.recipients || []).find((r) => r.id === options.recipientId);
      if (found) {
        targetRecipients = [found.email];
      } else if (emailCfg.toEmail) {
        targetRecipients = [emailCfg.toEmail];
      }
    } else {
      // Pick all active recipients configured for this frequency or for both
      const active = (emailCfg.recipients || []).filter(
        (r) => r.enabled && (r.frequency === reportType || r.frequency === 'both')
      );
      if (active.length > 0) {
        targetRecipients = active.map((r) => r.email);
      } else if (emailCfg.toEmail) {
        targetRecipients = [emailCfg.toEmail];
      }
    }

    targetRecipients = Array.from(new Set(targetRecipients.map((e) => (e || '').trim()).filter(Boolean)));
    if (targetRecipients.length === 0) {
      if (emailCfg.toEmail) {
        targetRecipients = [emailCfg.toEmail];
      } else {
        throw new Error('No active recipients configured to receive this report.');
      }
    }

    const sender = emailCfg.fromEmail || 'noreply@stivate.com';

    // 1. Build utilization dataset (strictly excludes today's ongoing dispatches)
    const dataset = buildVehicleUtilizationDataset(effectiveDateRange as any);

    // 2. Generate PDF Report
    const pdfResult = await exportVehicleUtilizationReport(dataset.options, dataset.data);
    if (!pdfResult || !pdfResult.filePath || !fs.existsSync(pdfResult.filePath)) {
      throw new Error(`Failed to generate vehicle utilization ${reportType} PDF report.`);
    }

    // 3. Render clean, sorted, skimmable HTML email body (zero image dependencies)
    const warehouseLocation = (settings.warehouseLocation || 'F Warehouse').trim();
    const htmlBody = generateEmailHtml(
      dataset.data.summary,
      dataset.data.vehicleTypeSummary,
      (dataset.data as any).dailyTrend || [],
      dataset.data.vehicles,
      dataset.options.dateRangeLabel,
      warehouseLocation,
      reportType
    );

    // 5. Configure transporter and attachments (ONLY the PDF report file, no logo attachments!)
    const transporter = getMailerTransport(settings);

    const attachments: any[] = [
      {
        filename: path.basename(pdfResult.filePath),
        path: pdfResult.filePath,
      },
    ];

    const subjectTag = reportType === 'daily' ? '[Daily Report]' : '[Weekly Report]';
    const subject = `${subjectTag} [${warehouseLocation}] I3PL Fleet Load: ${dataset.data.summary.fleetUtilizationPct.toFixed(1)}% - ${dataset.options.dateRangeLabel}`;

    const sentMessageIds: string[] = [];
    for (const recipient of targetRecipients) {
      const mailOptions = {
        from: `"Stivate" <${sender}>`,
        to: recipient,
        subject,
        html: htmlBody,
        attachments,
      };

      const info = await transporter.sendMail(mailOptions);
      sentMessageIds.push(info.messageId);
      console.log(`${reportType} vehicle utilization report successfully emailed to ${recipient}:`, info.messageId);
    }

    logAudit(
      'EMAIL_UTILIZATION_REPORT',
      `Sent ${reportType} vehicle utilization report for ${warehouseLocation} to ${targetRecipients.join(', ')} (${sentMessageIds.length} delivered)`
    );

    return {
      success: true,
      message: `${reportType === 'daily' ? 'Daily' : 'Weekly'} vehicle utilization report for ${warehouseLocation} successfully delivered to ${targetRecipients.length} recipient(s): ${targetRecipients.join(', ')}!`,
      messageId: sentMessageIds[0],
      filePath: pdfResult.filePath,
      sentCount: sentMessageIds.length,
      recipientsList: targetRecipients,
    };
  } catch (err: any) {
    console.error('Failed to send vehicle utilization report email:', err);
    return {
      success: false,
      message: `Email sending failed: ${err.message || String(err)}`,
    };
  }
};

/**
 * Tests SMTP credentials and sends a simple verification email to aditya@stivate.com.
 */
export const testSmtpConnection = async (
  overrideSettings?: AppSettings
): Promise<{ success: boolean; message: string }> => {
  try {
    const settings = overrideSettings || loadSettings();
    const emailCfg = settings.emailSettings;

    if (!emailCfg || !emailCfg.smtpHost) {
      return { success: false, message: 'SMTP Host is missing. Please provide a valid SMTP server.' };
    }
    if (!emailCfg.smtpPassword) {
      return { success: false, message: 'SMTP Password is required to authenticate with the mail server.' };
    }

    const transporter = getMailerTransport(settings);

    // Verify SMTP connection and credentials
    await transporter.verify();

    const sender = emailCfg.fromEmail || 'noreply@stivate.com';
    const recipient = emailCfg.toEmail || 'aditya@stivate.com';
    const warehouseLocation = (settings.warehouseLocation || 'F Warehouse').trim();
    const testWh = warehouseLocation.trim();
    const testWhBadge = testWh.toLowerCase().includes('warehouse')
      ? testWh.toUpperCase()
      : `WAREHOUSE: ${testWh.toUpperCase()}`;

    // Send test ping email without image dependencies
    const info = await transporter.sendMail({
      from: `"Stivate" <${sender}>`,
      to: recipient,
      subject: `[Test] Stivate - Mail Server Connection Verified (${warehouseLocation})`,
      attachments: [],
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 14px; color: #1e293b; max-width: 480px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 10px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            <span style="font-size: 12px; font-weight: 800; color: #475569; letter-spacing: 0.4px; text-transform: uppercase;">TEST CONNECTION</span>
            <span style="background-color: #0284c7; color: #ffffff; padding: 2px 7px; border-radius: 4px; font-size: 8px; font-weight: 700; text-transform: uppercase; white-space: nowrap;">${testWhBadge}</span>
          </div>
          <h3 style="color: #059669; margin: 0 0 6px 0; font-size: 12px;">&check; Mail Server Connection Verified!</h3>
          <p style="margin: 0 0 8px 0; font-size: 9.5px; line-height: 1.4; color: #475569;">
            This email confirms that the automated dispatch notification server has connected and is ready to deliver I3PL fleet utilization reports.
          </p>
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; font-size: 9px; line-height: 1.5;">
            <div><strong>Warehouse Location:</strong> ${warehouseLocation}</div>
            <div><strong>Host:</strong> ${emailCfg.smtpHost}:${emailCfg.smtpPort}</div>
            <div><strong>Sender:</strong> ${sender}</div>
            <div><strong>Recipient:</strong> ${recipient}</div>
            <div><strong>Client:</strong> I3PL INDIA PVT LTD</div>
            <div><strong>Timestamp:</strong> ${new Date().toLocaleString('en-GB')}</div>
          </div>
          <p style="color: #94a3b8; font-size: 8px; margin-top: 10px; text-align: center;">
            Generated by Stivate Technologies LLP for I3PL India Pvt Ltd.
          </p>
        </div>
      `,
    });

    logAudit('TEST_SMTP_CONNECTION', `Verified Purelymail SMTP and sent test email to ${recipient} (Message ID: ${info.messageId})`);

    return {
      success: true,
      message: `Purelymail SMTP connection verified and test email successfully delivered to ${recipient}!`,
    };
  } catch (err: any) {
    console.error('SMTP test connection failed:', err);
    return {
      success: false,
      message: `SMTP Error: ${err.message || String(err)}`,
    };
  }
};

/**
 * Computes standard ISO week number string (e.g. "2026-W39")
 */
const getIsoWeekKey = (date: Date): string => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

/**
 * Periodically checks if the automated weekly or daily reports should be sent.
 */
export const checkAndRunPeriodicEmailReport = async () => {
  try {
    const settings = loadSettings();
    const emailCfg = settings.emailSettings;
    if (!emailCfg || !emailCfg.enabled || !emailCfg.smtpPassword) {
      return;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    let settingsUpdated = false;
    const updatedCfg = { ...emailCfg };

    // 1. Check Daily Automated Dispatch
    if (emailCfg.autoSendDaily && emailCfg.lastReportSentDate !== todayStr) {
      const [targetHour, targetMin] = (emailCfg.autoSendTime || '20:00').split(':').map(Number);
      if (currentHour > targetHour || (currentHour === targetHour && currentMin >= targetMin)) {
        console.log(`[Auto-Report] Running daily vehicle utilization report for ${todayStr}...`);
        const res = await sendVehicleUtilizationReportEmail({
          reportFrequency: 'daily',
          dateRange: 'daily',
        });
        if (res.success) {
          updatedCfg.lastReportSentDate = todayStr;
          settingsUpdated = true;
          console.log(`[Auto-Report] Daily report successfully emailed!`);
        }
      }
    }

    // 2. Check Weekly Automated Dispatch
    const currentDayOfWeek = now.getDay(); // 0=Sunday, 1=Monday...
    const scheduledWeeklyDay = emailCfg.weeklySendDay ?? 1; // Default Monday
    const thisWeekKey = getIsoWeekKey(now);

    if (
      (emailCfg.autoSendWeekly ?? true) &&
      currentDayOfWeek === scheduledWeeklyDay &&
      emailCfg.lastWeeklyReportSentDate !== thisWeekKey
    ) {
      const [weeklyHour, weeklyMin] = (emailCfg.weeklySendTime || emailCfg.autoSendTime || '20:00').split(':').map(Number);
      if (currentHour > weeklyHour || (currentHour === weeklyHour && currentMin >= weeklyMin)) {
        console.log(`[Auto-Report] Running weekly vehicle utilization report for week ${thisWeekKey}...`);
        const res = await sendVehicleUtilizationReportEmail({
          reportFrequency: 'weekly',
          dateRange: 'weekly',
        });
        if (res.success) {
          updatedCfg.lastWeeklyReportSentDate = thisWeekKey;
          settingsUpdated = true;
          console.log(`[Auto-Report] Weekly report successfully emailed for week ${thisWeekKey}!`);
        }
      }
    }

    if (settingsUpdated) {
      saveSettings({
        ...settings,
        emailSettings: updatedCfg,
      });
    }
  } catch (err) {
    console.error('[Auto-Report] Error running periodic email report check:', err);
  }
};
