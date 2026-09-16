export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Site {
  id: string;
  name: string;
  code: string; // 6-digit short human-readable fallback code (e.g., '482-901')
  address: string;
  city: string;
  // Site lifecycle. 'retired' replaces the previous 'archived' wording so that
  // lifecycle language stays consistent with how Workers are described.
  status: 'active' | 'suspended' | 'retired';
  qrPayload: string; // Secure token contained within the QR
  normalWorkerCount?: number;
  contactNumber?: string;
  notes?: string;
}

export interface DayPattern {
  isWorking: boolean;
  startTime: string; // '08:00'
  endTime: string;   // '17:00'
  siteId?: string;   // Override site if different from normal site
}

export interface WorkPattern {
  id: string;
  workerId: string;
  name: string; // e.g. 'Standard 40h Full-Time'
  effectiveFrom: string; // YYYY-MM-DD
  schedule: Record<DayOfWeek, DayPattern>;
}

export interface Worker {
  id: string;
  workerRef: string; // e.g. 'WK-104'
  name: string;
  role: string; // Role on site — used to identify who is present (not an HR job title)
  normalSiteId: string; // Usual site — workers always have an open site for their normal base
  status: 'active' | 'suspended' | 'inactive';
  avatarBg: string;
  initials: string;
  workPatternId: string;
}

export interface SessionHistoryEntry {
  at: string;
  actor: string;
  summary: string;
}

export interface WorkSession {
  id: string;
  /** Planned session label, e.g. "Morning café session". Optional for legacy seeds. */
  label?: string;
  /** Workers assigned to this planned session. May be empty while being configured. */
  workerIds?: string[];
  /** Legacy single-worker field. Read for migration only — use workerIds. */
  workerId?: string;
  siteId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  status: 'scheduled' | 'cancelled' | 'suspended' | 'completed';
  /** Planning rule this session was generated from, if any. */
  patternId?: string;
  /** Groups sessions created together by one recurrence definition. */
  recurrenceId?: string;
  isExceptional?: boolean; // Modified from default recurring pattern
  notes?: string;
  /** Append-only management history. Attendance evidence is never rewritten. */
  history?: SessionHistoryEntry[];
}

/** Workers on a session, tolerating legacy single-worker records. */
export const sessionWorkerIds = (s: { workerIds?: string[]; workerId?: string }): string[] => {
  if (Array.isArray(s.workerIds) && s.workerIds.length > 0) return s.workerIds;
  if (s.workerId) return [s.workerId];
  return [];
};

export type ArrivalMethod = 'qr' | 'manual_code' | 'manager_entry';
export type DepartureMethod = 'worker' | 'manager_entry';

export type AttendanceStatus =
  | 'present'               // Currently checked in & working
  | 'completed'             // Arrived and departed normally
  | 'pending_review'        // Arrived via manual code or exceptional circumstance awaiting manager confirmation
  | 'missing_departure'     // Arrived but never logged departure
  | 'not_arrived'           // Expected today but hasn't arrived
  | 'unmatched'             // Arrival recorded with no matching expected work session
  | 'rejected';             // Manager rejected arrival

export type CorrectionType =
  | 'arrival'        // Manager recorded / corrected the arrival time
  | 'departure'      // Manager recorded / corrected the departure time
  | 'verification'   // Manager verified physical presence (no time change)
  | 'session_link';  // Manager linked the record to an expected Work Session

/**
 * An append-only entry describing one Manager intervention on an attendance record.
 *
 * The Klockit rule is that attendance evidence is never silently replaced:
 * `recordedArrivalTime` / `recordedDepartureTime` snapshot what was on the record
 * *before* the Manager acted, while `effectiveArrivalTime` / `effectiveDepartureTime`
 * hold the times that now count for reporting.
 */
export interface AttendanceCorrection {
  id: string;
  type: CorrectionType;
  action: string;              // Plain-language description of what the Manager did
  correctedBy: string;
  correctedAt: string;         // ISO timestamp of the Manager action
  reason: string;              // Manager's stated reason (required)
  recordedArrivalTime?: string;   // Evidence as originally recorded
  recordedDepartureTime?: string; // Evidence as originally recorded
  recordedStatus: AttendanceStatus;
  effectiveArrivalTime?: string;   // Time that now counts towards reporting
  effectiveDepartureTime?: string; // Time that now counts towards reporting
  resultingStatus: AttendanceStatus;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workSessionId?: string;
  siteId: string;
  date: string; // YYYY-MM-DD
  // --- Original evidence, captured at the moment of arrival / departure ---
  arrivalTime?: string; // HH:mm — never overwritten by a Manager correction
  arrivalMethod?: ArrivalMethod;
  departureTime?: string; // HH:mm — never overwritten by a Manager correction
  departureMethod?: DepartureMethod;
  // --- Effective values, only present once a Manager has confirmed or corrected ---
  effectiveArrivalTime?: string;
  effectiveDepartureTime?: string;
  status: AttendanceStatus;
  needsAttention: boolean;
  exceptionId?: string;
  corrections?: AttendanceCorrection[]; // Append-only audit trail
  notes?: string;
}

export type ExceptionType =
  | 'manual_site_code'           // Worker entered short 6-digit code instead of scanning QR
  | 'missing_departure'          // Worker arrived yesterday/earlier and shift ended without departure
  | 'unmatched_arrival'          // Worker arrived at a site or day with no scheduled session
  | 'multiple_possible_sessions' // Worker arrived between two split sessions
  | 'outside_expected_time'      // Worker arrived hours early or late
  | 'open_session_conflict';     // Worker trying to start attendance while previous day remains open

export interface AttendanceException {
  id: string;
  attendanceId?: string;
  workerId: string;
  siteId: string;
  date: string;
  type: ExceptionType;
  status: 'unresolved' | 'resolved' | 'rejected';
  title: string;
  description: string;
  evidence: {
    recordedArrival?: string;
    recordedDeparture?: string;
    expectedStart?: string;
    expectedEnd?: string;
    siteCodeEntered?: string;
    method?: ArrivalMethod;
    scheduledSiteId?: string;
    possibleSessionIds?: string[];
  };
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionDecision?: string;
  effectiveTimestamp?: string;
}

export interface OrganisationInfo {
  name: string;
  industry: string;
  timezone: string;
  defaultGracePeriodMinutes: number;
  allowManualCodeFallback: boolean;
  requireManagerReviewForManualCode: boolean;
}
