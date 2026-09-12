/**
 * RenewableIQ Technical Formatters
 * Enforces tabular lining figures, engineering units, and uniform timestamps.
 */

/**
 * Formats power in Megawatts (MW) with fixed 1 decimal place
 */
export function formatMw(val: number | null | undefined): string {
  if (val === null || val === undefined) return '— MW';
  return `${val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} MW`;
}

/**
 * Formats energy in Megawatt-Hours (MWh)
 */
export function formatMwh(val: number | null | undefined): string {
  if (val === null || val === undefined) return '— MWh';
  return `${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} MWh`;
}

/**
 * Formats currency in Indian Rupees (INR / ₹) with standard en-IN locale
 * Supports compact formatting (₹12.5K, ₹1.25L, ₹2.40Cr)
 */
export function formatINR(val: number | null | undefined, compact = false): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Math.round(val);
  const abs = Math.abs(num);

  if (compact) {
    if (abs >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    if (abs >= 1000) {
      return `₹${(num / 1000).toFixed(1)} K`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formats currency in INR (replaces legacy USD)
 */
export function formatCurrency(val: number): string {
  return formatINR(val);
}

/**
 * Formats percentage with sign and 1 decimal place
 */
export function formatPercent(val: number, includeSign = false): string {
  const formatted = `${Math.abs(val).toFixed(1)}%`;
  if (!includeSign) return formatted;
  return val > 0 ? `+${formatted}` : val < 0 ? `-${formatted}` : formatted;
}

/**
 * Formats ISO UTC timestamp into clean 24h operational time (e.g. "18:45 UTC")
 */
export function formatUtcTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes} UTC`;
  } catch {
    return '—:— UTC';
  }
}

/**
 * Formats ISO UTC timestamp into date and hour (e.g. "Sep 14 · 18:00")
 */
export function formatShortDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const day = date.getUTCDate();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    return `${month} ${day} · ${hours}:00`;
  } catch {
    return '—';
  }
}
