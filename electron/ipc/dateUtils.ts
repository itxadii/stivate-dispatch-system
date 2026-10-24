/**
 * Dispatch dates are stored as local wall-clock strings (YYYY-MM-DDTHH:mm).
 * Date#toISOString() converts to UTC, which shifts the calendar day for
 * non-UTC timezones (e.g. IST between 00:00 and 05:30), so always derive
 * day/month keys from local date parts instead.
 */
export const toLocalYmd = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Parse a YYYY-MM-DD key as local midnight (new Date('YYYY-MM-DD') is UTC midnight). */
export const parseLocalYmd = (ymd: string): Date => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
