/**
 * Ensures a numeric value is a safe, positive number.
 */
export function ensureSafeValue(value: any, defaultValue = 0): number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return defaultValue;
  return Math.max(0, value);
}
