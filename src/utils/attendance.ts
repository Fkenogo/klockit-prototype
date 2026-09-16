import { AttendanceRecord, AttendanceCorrection } from '../types';

/**
 * Klockit's attendance rule, expressed in one place:
 *
 *   1. What the Worker recorded at the moment of arrival/departure is evidence.
 *      It is never overwritten, by anyone.
 *   2. When a Manager confirms, corrects, or links a record, that becomes an
 *      appended correction entry carrying the Manager's reason.
 *   3. Reporting always uses the *effective* time, which falls back to the
 *      originally recorded time when no Manager action exists.
 *
 * These helpers are the only supported way to read attendance times, so that
 * Manager corrections and Worker evidence can never be confused with each other.
 */

export const getCorrections = (rec?: AttendanceRecord): AttendanceCorrection[] =>
  rec?.corrections ?? [];

export const getLatestCorrection = (rec?: AttendanceRecord): AttendanceCorrection | undefined => {
  const list = getCorrections(rec);
  return list.length > 0 ? list[list.length - 1] : undefined;
};

export const isCorrected = (rec?: AttendanceRecord): boolean => getCorrections(rec).length > 0;

/** The arrival time that counts towards reporting. */
export const effectiveArrival = (rec?: AttendanceRecord): string | undefined =>
  rec?.effectiveArrivalTime ?? rec?.arrivalTime;

/** The departure time that counts towards reporting. */
export const effectiveDeparture = (rec?: AttendanceRecord): string | undefined =>
  rec?.effectiveDepartureTime ?? rec?.departureTime;

/** True when a Manager changed the time that counts towards reporting. */
export const hasTimeCorrection = (rec?: AttendanceRecord): boolean => {
  const c = getLatestCorrection(rec);
  if (!c) return false;
  return (
    (c.effectiveArrivalTime !== undefined && c.effectiveArrivalTime !== c.recordedArrivalTime) ||
    (c.effectiveDepartureTime !== undefined && c.effectiveDepartureTime !== c.recordedDepartureTime)
  );
};

/** Minutes between a recorded time and the effective time, if they differ. */
export const minutesBetween = (from?: string, to?: string): number | null => {
  if (!from || !to) return null;
  const [fh, fm] = from.split(':').map(Number);
  const [th, tm] = to.split(':').map(Number);
  if ([fh, fm, th, tm].some((n) => Number.isNaN(n))) return null;
  return th * 60 + tm - (fh * 60 + fm);
};

/** Short human summary of the latest Manager action, for badges and detail panels. */
export const describeCorrection = (rec?: AttendanceRecord): string | undefined => {
  const c = getLatestCorrection(rec);
  if (!c) return undefined;
  return `${c.action} · ${c.correctedBy}`;
};

/** Formats an ISO timestamp as a compact local date-time string. */
export const formatTimestamp = (iso?: string): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};
