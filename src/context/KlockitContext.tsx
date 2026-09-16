import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Site,
  Worker,
  WorkPattern,
  WorkSession,
  sessionWorkerIds,
  AttendanceRecord,
  AttendanceException,
  AttendanceCorrection,
  OrganisationInfo,
  ArrivalMethod,
} from '../types';
import {
  TODAY_DATE,
  INITIAL_ORGANISATION,
  INITIAL_SITES,
  INITIAL_WORKERS,
  INITIAL_PATTERNS,
  INITIAL_WORK_SESSIONS,
  INITIAL_ATTENDANCE,
  INITIAL_EXCEPTIONS,
} from '../data/mockData';

export type ManagerTab = 'today' | 'workers' | 'sites' | 'planning' | 'exceptions' | 'history' | 'settings';

/**
 * Sections of the Klockit Operator control plane. This is the internal
 * experience for running the platform itself, not a customer-facing view.
 */
export type OperatorTab =
  | 'overview'        // Platform Overview
  | 'usage'           // Usage & Health Intelligence
  | 'organisations'   // Organisations
  | 'users'           // Users & Access
  | 'subscriptions'   // Subscriptions & Billing
  | 'onboarding'      // Onboarding & Provisioning
  | 'content'         // Content & Experience
  | 'operations'      // Platform Operations
  | 'audit'           // Audit & Change History
  | 'settings';       // Platform Settings

/**
 * The three experiences the prototype covers. `operator` is the Klockit
 * control-plane view of the platform itself, not a customer-facing role.
 */
export type KlockitRole = 'manager' | 'worker' | 'operator';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface KlockitContextType {
  organisation: OrganisationInfo;
  sites: Site[];
  workers: Worker[];
  patterns: WorkPattern[];
  workSessions: WorkSession[];
  attendance: AttendanceRecord[];
  exceptions: AttendanceException[];

  // Navigation & View Context
  currentRole: KlockitRole;
  setCurrentRole: (role: KlockitRole) => void;
  selectedWorkerId: string;
  setSelectedWorkerId: (id: string) => void;
  activeManagerTab: ManagerTab;
  setActiveManagerTab: (tab: ManagerTab) => void;
  activeOperatorTab: OperatorTab;
  setActiveOperatorTab: (tab: OperatorTab) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedSiteFilter: string;
  setSelectedSiteFilter: (siteId: string) => void;
  
  // Inspection & Quick Navigation
  inspectedWorkerId: string | null;
  setInspectedWorkerId: (id: string | null) => void;
  inspectedSiteId: string | null;
  setInspectedSiteId: (id: string | null) => void;
  inspectedExceptionId: string | null;
  setInspectedExceptionId: (id: string | null) => void;
  inspectedSessionId: string | null;
  setInspectedSessionId: (id: string | null) => void;
  siteQrModalSiteId: string | null;
  setSiteQrModalSiteId: (id: string | null) => void;

  // Toast notifications
  toasts: Toast[];
  toast: Toast | null;
  showToast: (title: string, message: string, type?: Toast['type']) => void;
  clearToast: () => void;
  dismissToast: (id: string) => void;

  // Operational Actions
  recordWorkerArrival: (
    workerId: string,
    siteId: string,
    method: ArrivalMethod,
    siteCodeEntered?: string
  ) => { success: boolean; message: string; requiresReview?: boolean };

  // Manager correction actions — these never overwrite Worker-recorded evidence.
  // Each call appends an auditable correction entry and updates effective times.
  recordManagerArrivalCorrection: (
    workerId: string,
    siteId: string,
    effectiveArrivalTime: string,
    reason: string,
    date?: string
  ) => { success: boolean; message: string };

  recordManagerDepartureCorrection: (
    workerId: string,
    effectiveDepartureTime: string,
    reason: string,
    date?: string
  ) => { success: boolean; message: string };

  recordWorkerDeparture: (
    workerId: string,
    customDepartureTime?: string
  ) => { success: boolean; message: string };

  resolveException: (
    exceptionId: string,
    action: 'confirm_arrival' | 'confirm_departure' | 'match_session' | 'reject',
    payload: {
      effectiveTime?: string;
      effectiveDate?: string;
      sessionId?: string;
      note?: string;
      correctedBy?: string;
    }
  ) => void;

  adjustWorkSession: (sessionId: string, updates: Partial<WorkSession>) => void;
  addWorkSession: (session: Omit<WorkSession, 'id'> & { workerId?: string }) => string;
  cancelWorkSession: (sessionId: string) => void;
  updateWorkPattern: (patternId: string, schedule: WorkPattern['schedule']) => void;
  updateWorkPatternFull: (patternId: string, patch: { name?: string; schedule?: WorkPattern['schedule'] }) => void;
  /** Create dated planned sessions from one definition (recurrence = batch creation). */
  createPlannedSessions: (input: {
    label: string;
    siteId: string;
    dates: string[];
    startTime: string;
    endTime: string;
    notes?: string;
    workerIds?: string[];
    patternId?: string;
  }) => string[];
  assignWorkersToSession: (sessionId: string, workerIds: string[]) => void;
  removeWorkerFromSession: (sessionId: string, workerId: string) => void;
  reassignWorkerBetweenSessions: (fromSessionId: string, toSessionId: string, workerId: string) => void;

  addWorker: (worker: Omit<Worker, 'id' | 'workerRef'>) => void;
  updateWorker: (workerId: string, updates: Partial<Worker>) => void;

  addSite: (site: Omit<Site, 'id' | 'qrPayload'>) => void;
  updateSite: (siteId: string, updates: Partial<Site>) => void;

  updateOrganisation: (updates: Partial<OrganisationInfo>) => void;

  /**
   * Prototype-only control. Not part of the product experience — it is exposed
   * through the Prototype Controls panel so that demo data can be restored.
   */
  resetToSampleData: () => void;
}

const KlockitContext = createContext<KlockitContextType | undefined>(undefined);

// Bumped to v3 for the session-first planning model: WorkSession carries
// workerIds (0..n Workers), an optional label, pattern/recurrence source and an
// append-only management history. v2 payloads migrate automatically.
const STORAGE_KEY = 'klockit_workforce_data_v3';

const sessionStamp = () => new Date().toISOString();

const normalizeSession = (raw: WorkSession & { workerId?: string }): WorkSession => {
  const workerIds = Array.isArray(raw.workerIds) && raw.workerIds.length > 0
    ? [...raw.workerIds]
    : raw.workerId
      ? [raw.workerId]
      : [];
  return {
    ...raw,
    workerIds,
    label: raw.label ?? '',
    history: Array.isArray(raw.history) ? raw.history : [],
  };
};

const withSessionHistory = (
  session: WorkSession,
  summary: string,
): WorkSession => ({
  ...session,
  history: [...(session.history ?? []), { at: sessionStamp(), actor: 'Operations Manager', summary }],
});

export const KlockitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage or fall back to mock data
  const [organisation, setOrganisation] = useState<OrganisationInfo>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_org`);
      return saved ? JSON.parse(saved) : INITIAL_ORGANISATION;
    } catch {
      return INITIAL_ORGANISATION;
    }
  });

  const [sites, setSites] = useState<Site[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sites`);
      return saved ? JSON.parse(saved) : INITIAL_SITES;
    } catch {
      return INITIAL_SITES;
    }
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_workers`);
      return saved ? JSON.parse(saved) : INITIAL_WORKERS;
    } catch {
      return INITIAL_WORKERS;
    }
  });

  const [patterns, setPatterns] = useState<WorkPattern[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_patterns`);
      return saved ? JSON.parse(saved) : INITIAL_PATTERNS;
    } catch {
      return INITIAL_PATTERNS;
    }
  });

  const [workSessions, setWorkSessions] = useState<WorkSession[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_sessions`);
      if (saved) return (JSON.parse(saved) as WorkSession[]).map(normalizeSession);
      const legacy = localStorage.getItem('klockit_workforce_data_v2_sessions');
      if (legacy) return (JSON.parse(legacy) as WorkSession[]).map(normalizeSession);
      return INITIAL_WORK_SESSIONS.map(normalizeSession);
    } catch {
      return INITIAL_WORK_SESSIONS.map(normalizeSession);
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
      return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    } catch {
      return INITIAL_ATTENDANCE;
    }
  });

  const [exceptions, setExceptions] = useState<AttendanceException[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_exceptions`);
      return saved ? JSON.parse(saved) : INITIAL_EXCEPTIONS;
    } catch {
      return INITIAL_EXCEPTIONS;
    }
  });

  // UI state
  const [currentRole, setCurrentRole] = useState<KlockitRole>('manager');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('worker-3'); // Defaults to Priya Patel or Elena
  const [activeManagerTab, setActiveManagerTab] = useState<ManagerTab>('today');
  const [activeOperatorTab, setActiveOperatorTab] = useState<OperatorTab>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');

  // Modal / Inspection state
  const [inspectedWorkerId, setInspectedWorkerId] = useState<string | null>(null);
  const [inspectedSiteId, setInspectedSiteId] = useState<string | null>(null);
  const [inspectedExceptionId, setInspectedExceptionId] = useState<string | null>(null);
  const [inspectedSessionId, setInspectedSessionId] = useState<string | null>(null);
  const [siteQrModalSiteId, setSiteQrModalSiteId] = useState<string | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: Toast = { id, title, message, type };
    setToast(newToast);
    setToasts((prev) => [...prev.slice(-4), newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    setToast((prev) => (prev?.id === id ? null : prev));
  };

  const clearToast = () => {
    setToasts([]);
    setToast(null);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_org`, JSON.stringify(organisation));
      localStorage.setItem(`${STORAGE_KEY}_sites`, JSON.stringify(sites));
      localStorage.setItem(`${STORAGE_KEY}_workers`, JSON.stringify(workers));
      localStorage.setItem(`${STORAGE_KEY}_patterns`, JSON.stringify(patterns));
      localStorage.setItem(`${STORAGE_KEY}_sessions`, JSON.stringify(workSessions));
      localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
      localStorage.setItem(`${STORAGE_KEY}_exceptions`, JSON.stringify(exceptions));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [organisation, sites, workers, patterns, workSessions, attendance, exceptions]);

  // Record arrival
  const recordWorkerArrival = (
    workerId: string,
    siteId: string,
    method: ArrivalMethod,
    siteCodeEntered?: string
  ) => {
    const worker = workers.find((w) => w.id === workerId);
    const site = sites.find((s) => s.id === siteId);
    const workerName = worker ? worker.name : 'Worker';
    const siteName = site ? site.name : 'Site';

    // Check if worker already has an active open attendance
    const existingOpen = attendance.find(
      (a) => a.workerId === workerId && (a.status === 'present' || a.status === 'pending_review')
    );
    if (existingOpen) {
      return {
        success: false,
        message: `${workerName} already has an active presence record at ${sites.find((s) => s.id === existingOpen.siteId)?.name || 'a site'}. Record departure first.`,
      };
    }

    // Check if worker has an unclosed session from yesterday with missing departure
    const missingYesterday = attendance.find(
      (a) => a.workerId === workerId && a.status === 'missing_departure'
    );
    if (missingYesterday) {
      // Create open session conflict exception
      const newExcId = `exc-conflict-${Date.now()}`;
      const newExc: AttendanceException = {
        id: newExcId,
        workerId,
        siteId,
        date: TODAY_DATE,
        type: 'open_session_conflict',
        status: 'unresolved',
        title: 'New Arrival With Unclosed Previous Session',
        description: `${workerName} attempted to record arrival today while yesterday's departure remains unrecorded. Manager review required to verify both sessions.`,
        evidence: {
          recordedArrival: '08:05',
          expectedStart: '08:00',
          method,
          scheduledSiteId: siteId,
        },
        createdAt: new Date().toISOString(),
      };
      setExceptions((prev) => [newExc, ...prev]);
      showToast(
        'Departure Missing from Previous Day',
        'Your arrival was logged, but your unclosed session from yesterday needs Manager review.',
        'warning'
      );
    }

    // Find planned work session for today (session-first model: Worker is a member)
    const matchingSession = workSessions.find(
      (ws) => sessionWorkerIds(ws).includes(workerId) && ws.date === TODAY_DATE && ws.status === 'scheduled'
    );

    // Get current time format HH:mm
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hh}:${mm}`;

    if (method === 'qr') {
      // Strong physical presence evidence
      if (matchingSession && matchingSession.siteId !== siteId) {
        // Site mismatch
        const newAttId = `att-${Date.now()}`;
        const newExcId = `exc-mismatch-${Date.now()}`;
        const newExc: AttendanceException = {
          id: newExcId,
          attendanceId: newAttId,
          workerId,
          siteId,
          date: TODAY_DATE,
          type: 'unmatched_arrival',
          status: 'unresolved',
          title: 'Arrival at Unexpected Site',
          description: `${workerName} scanned the QR at ${siteName}, but was scheduled at ${sites.find((s) => s.id === matchingSession.siteId)?.name || 'another site'}.`,
          evidence: {
            recordedArrival: currentTimeStr,
            expectedStart: matchingSession.startTime,
            expectedEnd: matchingSession.endTime,
            method: 'qr',
            scheduledSiteId: matchingSession.siteId,
          },
          createdAt: new Date().toISOString(),
        };

        const newRecord: AttendanceRecord = {
          id: newAttId,
          workerId,
          workSessionId: matchingSession.id,
          siteId,
          date: TODAY_DATE,
          arrivalTime: currentTimeStr,
          arrivalMethod: 'qr',
          status: 'unmatched',
          needsAttention: true,
          exceptionId: newExcId,
          notes: `Site mismatch: scanned at ${siteName}, scheduled at ${sites.find((s) => s.id === matchingSession.siteId)?.name}.`,
        };

        setExceptions((prev) => [newExc, ...prev]);
        setAttendance((prev) => [newRecord, ...prev.filter((a) => !(a.workerId === workerId && a.date === TODAY_DATE))]);
        showToast('Site Mismatch Flagged', `You're checked in at ${siteName}. Your scheduled session was at ${sites.find((s) => s.id === matchingSession.siteId)?.name}, so a Manager will review.`, 'warning');
        return { success: true, message: `Checked in at ${siteName} (Pending Site Alignment Review)`, requiresReview: true };
      }

      // Normal matched QR arrival
      const newAttId = `att-${Date.now()}`;
      const newRecord: AttendanceRecord = {
        id: newAttId,
        workerId,
        workSessionId: matchingSession?.id,
        siteId,
        date: TODAY_DATE,
        arrivalTime: currentTimeStr,
        arrivalMethod: 'qr',
        status: 'present',
        needsAttention: false,
        notes: `Verified QR presence at ${siteName}.`,
      };

      setAttendance((prev) => [newRecord, ...prev.filter((a) => !(a.workerId === workerId && a.date === TODAY_DATE))]);
      showToast('Checked in successfully', `You are checked in at ${siteName} (${currentTimeStr}).`, 'success');
      return { success: true, message: `Checked in at ${siteName} at ${currentTimeStr}.` };
    } else {
      // Manual 6-digit code fallback: Weaker evidence, creates pending_review record and exception
      const newAttId = `att-${Date.now()}`;
      const newExcId = `exc-manual-${Date.now()}`;
      const newExc: AttendanceException = {
        id: newExcId,
        attendanceId: newAttId,
        workerId,
        siteId,
        date: TODAY_DATE,
        type: 'manual_site_code',
        status: 'unresolved',
        title: 'Manual Site Code Arrival Awaiting Review',
        description: `${workerName} used manual code entry (${siteCodeEntered || site?.code}) at ${siteName}. Physical presence requires confirmation.`,
        evidence: {
          recordedArrival: currentTimeStr,
          expectedStart: matchingSession?.startTime || '08:00',
          expectedEnd: matchingSession?.endTime || '17:00',
          siteCodeEntered: siteCodeEntered || site?.code,
          method: 'manual_code',
          scheduledSiteId: siteId,
        },
        createdAt: new Date().toISOString(),
      };

      const newRecord: AttendanceRecord = {
        id: newAttId,
        workerId,
        workSessionId: matchingSession?.id,
        siteId,
        date: TODAY_DATE,
        arrivalTime: currentTimeStr,
        arrivalMethod: 'manual_code',
        status: 'pending_review',
        needsAttention: true,
        exceptionId: newExcId,
        notes: `Entered 6-digit code ${siteCodeEntered || site?.code}. Physical presence awaiting Manager confirmation.`,
      };

      setExceptions((prev) => [newExc, ...prev]);
      setAttendance((prev) => [newRecord, ...prev.filter((a) => !(a.workerId === workerId && a.date === TODAY_DATE))]);
      showToast(
        'Arrival Recorded · Review Pending',
        `Site code accepted. Because this was entered manually, your Manager will confirm your arrival.`,
        'info'
      );
      return {
        success: true,
        message: `Arrival recorded with code ${siteCodeEntered || site?.code}. Your Manager will review shortly.`,
        requiresReview: true,
      };
    }
  };

  /**
   * Manager departure review. Same rule as arrival: evidence is preserved,
   * a correction entry is appended, and the effective time drives reporting.
   */
  const recordManagerDepartureCorrection = (
    workerId: string,
    effectiveDepartureTime: string,
    reason: string,
    date?: string
  ) => {
    const targetDate = date || selectedDate || TODAY_DATE;
    const worker = workers.find((w) => w.id === workerId);

    if (!reason || reason.trim().length === 0) {
      showToast('Reason Required', 'A reason is required for every Manager correction.', 'error');
      return { success: false, message: 'A reason is required for every Manager correction.' };
    }

    const existing = attendance.find((a) => a.workerId === workerId && a.date === targetDate);

    if (!existing || (existing.arrivalTime === undefined && existing.effectiveArrivalTime === undefined)) {
      showToast(
        'No Arrival To Amend',
        'A departure can only be reviewed once an arrival exists for that day.',
        'error'
      );
      return { success: false, message: 'No arrival recorded for that day.' };
    }

    const recordedDepartureTime = existing.departureTime;
    const changed =
      recordedDepartureTime !== undefined && recordedDepartureTime !== effectiveDepartureTime;

    const correction: AttendanceCorrection = {
      id: `corr-${Date.now()}`,
      type: 'departure',
      action: recordedDepartureTime
        ? `Corrected departure from ${recordedDepartureTime} to ${effectiveDepartureTime}`
        : `Recorded departure at ${effectiveDepartureTime}`,
      correctedBy: 'Operations Manager',
      correctedAt: new Date().toISOString(),
      reason: reason.trim(),
      recordedArrivalTime: existing.arrivalTime,
      recordedDepartureTime,
      recordedStatus: existing.status,
      effectiveArrivalTime: existing.effectiveArrivalTime ?? existing.arrivalTime,
      effectiveDepartureTime,
      resultingStatus: 'completed',
    };

    const updated: AttendanceRecord = {
      ...existing,
      // `departureTime` evidence is preserved.
      departureMethod: existing.departureMethod ?? 'manager_entry',
      effectiveDepartureTime,
      status: 'completed',
      needsAttention: false,
      exceptionId: undefined,
      corrections: [...(existing.corrections ?? []), correction],
    };

    setAttendance((prev) => prev.map((a) => (a.id === existing.id ? updated : a)));

    showToast(
      changed ? 'Departure Corrected' : 'Departure Recorded',
      `${worker?.name || 'Worker'} — effective departure ${effectiveDepartureTime}.`,
      'success'
    );

    return {
      success: true,
      message: `Effective departure for ${worker?.name || 'Worker'} set to ${effectiveDepartureTime}.`,
    };
  };


  /**
   * Manager arrival review. The Manager never edits what the Worker recorded;
   * instead this appends a correction entry, keeps the recorded evidence
   * intact, and sets the effective arrival time that reporting will use.
   */
  const recordManagerArrivalCorrection = (
    workerId: string,
    siteId: string,
    effectiveArrivalTime: string,
    reason: string,
    date?: string
  ) => {
    const targetDate = date || selectedDate || TODAY_DATE;
    const worker = workers.find((w) => w.id === workerId);
    const site = sites.find((s) => s.id === siteId);

    if (!reason || reason.trim().length === 0) {
      showToast('Reason Required', 'A reason is required for every Manager correction.', 'error');
      return { success: false, message: 'A reason is required for every Manager correction.' };
    }

    const existing = attendance.find((a) => a.workerId === workerId && a.date === targetDate);
    const matchingSession = workSessions.find(
      (s) => sessionWorkerIds(s).includes(workerId) && s.date === targetDate && s.status !== 'cancelled'
    );

    const recordedArrivalTime = existing?.arrivalTime;
    const isNewRecord = !existing;
    const changed = recordedArrivalTime !== undefined && recordedArrivalTime !== effectiveArrivalTime;
    const newStatus: AttendanceRecord['status'] = 'present';

    const correction: AttendanceCorrection = {
      id: `corr-${Date.now()}`,
      type: changed ? 'arrival' : 'verification',
      action: isNewRecord
        ? 'Recorded arrival after on-site verification'
        : changed
        ? `Corrected arrival from ${recordedArrivalTime} to ${effectiveArrivalTime}`
        : `Confirmed arrival at ${effectiveArrivalTime}`,
      correctedBy: 'Operations Manager',
      correctedAt: new Date().toISOString(),
      reason: reason.trim(),
      recordedArrivalTime,
      recordedDepartureTime: existing?.departureTime,
      recordedStatus: existing?.status ?? 'not_arrived',
      effectiveArrivalTime,
      effectiveDepartureTime: existing?.effectiveDepartureTime ?? existing?.departureTime,
      resultingStatus: newStatus,
    };

    const updatedRecord: AttendanceRecord = existing
      ? {
          ...existing,
          workSessionId: existing.workSessionId ?? matchingSession?.id,
          siteId: existing.siteId ?? siteId,
          // `arrivalTime` is deliberately left untouched — it is the evidence.
          arrivalMethod: existing.arrivalMethod ?? 'manager_entry',
          effectiveArrivalTime,
          status: newStatus,
          needsAttention: false,
          exceptionId: undefined,
          corrections: [...(existing.corrections ?? []), correction],
        }
      : {
          id: `att-mgr-${Date.now()}`,
          workerId,
          workSessionId: matchingSession?.id,
          siteId,
          date: targetDate,
          arrivalMethod: 'manager_entry',
          effectiveArrivalTime,
          status: newStatus,
          needsAttention: false,
          corrections: [correction],
        };

    // Auto-resolve any unresolved manual_site_code exception if one was pending for this worker on this date
    setExceptions((prev) =>
      prev.map((exc) => {
        if (exc.workerId === workerId && exc.date === targetDate && exc.status === 'unresolved') {
          return {
            ...exc,
            status: 'resolved',
            resolvedAt: new Date().toISOString(),
            resolvedBy: 'Operations Manager',
            resolutionDecision: `Resolved by Manager review of arrival (${effectiveArrivalTime}). Reason: ${reason.trim()}`,
          };
        }
        return exc;
      })
    );

    setAttendance((prev) => [
      updatedRecord,
      ...prev.filter((a) => !(a.workerId === workerId && a.date === targetDate)),
    ]);

    showToast(
      isNewRecord ? 'Arrival Recorded' : changed ? 'Arrival Corrected' : 'Arrival Confirmed',
      `${worker?.name || 'Worker'} at ${site?.name || 'site'} — effective arrival ${effectiveArrivalTime}.`,
      'success'
    );

    return {
      success: true,
      message: `Effective arrival for ${worker?.name || 'Worker'} set to ${effectiveArrivalTime}.`,
    };
  };

  // Record departure
  const recordWorkerDeparture = (workerId: string, customDepartureTime?: string) => {
    const active = attendance.find(
      (a) => a.workerId === workerId && (a.status === 'present' || a.status === 'pending_review')
    );

    if (!active) {
      return { success: false, message: 'No active check-in found to depart from.' };
    }

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const departureTime = customDepartureTime || `${hh}:${mm}`;

    setAttendance((prev) =>
      prev.map((rec) => {
        if (rec.id === active.id) {
          return {
            ...rec,
            departureTime,
            departureMethod: 'worker',
            status: rec.status === 'pending_review' ? 'pending_review' : 'completed',
          };
        }
        return rec;
      })
    );

    showToast('Departure Recorded', `Work session completed at ${departureTime}. Have a great day!`, 'success');
    return { success: true, message: `Departure recorded at ${departureTime}.` };
  };

  // Guided Exception Resolution with Effective Attendance Time distinction
  const resolveException = (
    exceptionId: string,
    action: 'confirm_arrival' | 'confirm_departure' | 'match_session' | 'reject',
    payload: {
      effectiveTime?: string;
      effectiveDate?: string;
      sessionId?: string;
      note?: string;
      correctedBy?: string;
    }
  ) => {
    const exc = exceptions.find((e) => e.id === exceptionId);
    if (!exc) return;

    const resolutionTimestamp = new Date().toISOString();
    const managerName = payload.correctedBy || 'Operations Manager';

    if (action === 'reject') {
      setExceptions((prev) =>
        prev.map((e) =>
          e.id === exceptionId
            ? {
                ...e,
                status: 'rejected',
                resolvedAt: resolutionTimestamp,
                resolvedBy: managerName,
                resolutionDecision: `Rejected: ${payload.note || 'Invalid attendance evidence'}`,
              }
            : e
        )
      );

      if (exc.attendanceId) {
        setAttendance((prev) =>
          prev.map((a) =>
            a.id === exc.attendanceId
              ? {
                  ...a,
                  status: 'rejected',
                  needsAttention: false,
                  exceptionId: undefined,
                  corrections: [
                    ...(a.corrections ?? []),
                    {
                      id: `corr-${Date.now()}`,
                      type: 'arrival',
                      action: 'Rejected recorded attendance evidence',
                      correctedBy: managerName,
                      correctedAt: resolutionTimestamp,
                      reason: payload.note || 'Invalid attendance evidence',
                      recordedArrivalTime: a.arrivalTime,
                      recordedDepartureTime: a.departureTime,
                      recordedStatus: a.status,
                      resultingStatus: 'rejected',
                    },
                  ],
                }
              : a
          )
        );
      }
      showToast('Exception Rejected', `Attendance record marked as rejected.`, 'info');
      return;
    }

    if (action === 'confirm_departure') {
      // Worker had missing departure. Manager inputs actual departure time!
      const actualDeparture = payload.effectiveTime || '17:00';

      setAttendance((prev) =>
        prev.map((a) => {
          if (a.id === exc.attendanceId || (a.workerId === exc.workerId && a.date === exc.date)) {
            return {
              ...a,
              // Worker evidence is preserved; the Manager action is appended instead.
              departureMethod: a.departureMethod ?? 'manager_entry',
              effectiveDepartureTime: actualDeparture,
              status: 'completed',
              needsAttention: false,
              exceptionId: undefined,
              corrections: [
                ...(a.corrections ?? []),
                {
                  id: `corr-${Date.now()}`,
                  type: 'departure',
                  action: a.departureTime
                    ? `Corrected departure from ${a.departureTime} to ${actualDeparture}`
                    : `Recorded departure at ${actualDeparture}`,
                  correctedBy: managerName,
                  correctedAt: resolutionTimestamp,
                  reason: payload.note || 'Confirmed actual departure with worker',
                  recordedArrivalTime: a.arrivalTime,
                  recordedDepartureTime: a.departureTime,
                  recordedStatus: a.status,
                  effectiveArrivalTime: a.effectiveArrivalTime ?? a.arrivalTime,
                  effectiveDepartureTime: actualDeparture,
                  resultingStatus: 'completed',
                },
              ],
            };
          }
          return a;
        })
      );

      setExceptions((prev) =>
        prev.map((e) =>
          e.id === exceptionId
            ? {
                ...e,
                status: 'resolved',
                resolvedAt: resolutionTimestamp,
                resolvedBy: managerName,
                resolutionDecision: `Confirmed actual departure at ${actualDeparture}`,
                effectiveTimestamp: actualDeparture,
              }
            : e
        )
      );

      showToast(
        'Departure Confirmed',
        `Effective departure set to ${actualDeparture}. Attendance marked complete.`,
        'success'
      );
    } else if (action === 'confirm_arrival') {
      // Manual site code arrival confirmed by manager
      const effectiveArrival = payload.effectiveTime || exc.evidence.recordedArrival || '08:00';

      setAttendance((prev) =>
        prev.map((a) => {
          if (a.id === exc.attendanceId) {
            return {
              ...a,
              // `arrivalTime` stays as the Worker's recorded evidence.
              effectiveArrivalTime: effectiveArrival,
              status: a.departureTime ? 'completed' : 'present',
              needsAttention: false,
              exceptionId: undefined,
              corrections: [
                ...(a.corrections ?? []),
                {
                  id: `corr-${Date.now()}`,
                  type: 'verification',
                  action: `Verified physical presence — effective arrival ${effectiveArrival}`,
                  correctedBy: managerName,
                  correctedAt: resolutionTimestamp,
                  reason: payload.note || 'Manager verified physical presence at site',
                  recordedArrivalTime: a.arrivalTime,
                  recordedDepartureTime: a.departureTime,
                  recordedStatus: a.status,
                  effectiveArrivalTime: effectiveArrival,
                  effectiveDepartureTime: a.effectiveDepartureTime ?? a.departureTime,
                  resultingStatus: a.departureTime ? 'completed' : 'present',
                },
              ],
            };
          }
          return a;
        })
      );

      setExceptions((prev) =>
        prev.map((e) =>
          e.id === exceptionId
            ? {
                ...e,
                status: 'resolved',
                resolvedAt: resolutionTimestamp,
                resolvedBy: managerName,
                resolutionDecision: `Presence verified. Effective arrival: ${effectiveArrival}`,
                effectiveTimestamp: effectiveArrival,
              }
            : e
        )
      );

      showToast('Arrival Verified', `Physical presence confirmed at ${effectiveArrival}.`, 'success');
    } else if (action === 'match_session') {
      // Matched to specific session (e.g. split shift or unscheduled session)
      const targetSessionId = payload.sessionId || exc.evidence.possibleSessionIds?.[0];
      const targetSession = workSessions.find((ws) => ws.id === targetSessionId);

      setAttendance((prev) =>
        prev.map((a) => {
          if (a.id === exc.attendanceId) {
            return {
              ...a,
              workSessionId: targetSessionId,
              siteId: targetSession?.siteId || a.siteId,
              status: a.departureTime ? 'completed' : 'present',
              needsAttention: false,
              exceptionId: undefined,
              corrections: [
                ...(a.corrections ?? []),
                {
                  id: `corr-${Date.now()}`,
                  type: 'session_link',
                  action: targetSession
                    ? `Linked to expected session ${targetSession.id}`
                    : 'Linked to an expected Work Session',
                  correctedBy: managerName,
                  correctedAt: resolutionTimestamp,
                  reason: payload.note || 'Linked to scheduled work session',
                  recordedArrivalTime: a.arrivalTime,
                  recordedDepartureTime: a.departureTime,
                  recordedStatus: a.status,
                  effectiveArrivalTime: a.effectiveArrivalTime ?? a.arrivalTime,
                  effectiveDepartureTime: a.effectiveDepartureTime ?? a.departureTime,
                  resultingStatus: a.departureTime ? 'completed' : 'present',
                },
              ],
            };
          }
          return a;
        })
      );

      setExceptions((prev) =>
        prev.map((e) =>
          e.id === exceptionId
            ? {
                ...e,
                status: 'resolved',
                resolvedAt: resolutionTimestamp,
                resolvedBy: managerName,
                resolutionDecision: `Matched to session (${targetSession?.startTime || '08:00'} - ${targetSession?.endTime || '17:00'})`,
              }
            : e
        )
      );

      showToast('Session Matched', `Attendance reconciled with planned work session.`, 'success');
    }
  };

  // Adjust an individual planned session. The session keeps its identity and
  // history; only the stated fields change. Attendance evidence is untouched.
  const adjustWorkSession = (sessionId: string, updates: Partial<WorkSession>) => {
    const changedKeys = Object.keys(updates).filter((k) => k !== 'history').join(', ');
    setWorkSessions((prev) =>
      prev.map((ws) =>
        ws.id === sessionId
          ? withSessionHistory({ ...normalizeSession(ws), ...updates }, `Session adjusted (${changedKeys || 'details'})`)
          : ws
      )
    );
    showToast('Work Session Updated', 'Changes saved for this specific session.', 'success');
  };

  const addWorkSession = (sessionData: Omit<WorkSession, 'id'> & { workerId?: string }) => {
    const newId = `sess-${Date.now()}`;
    const { workerId: legacyWorkerId, ...rest } = sessionData as Omit<WorkSession, 'id'> & { workerId?: string };
    const workerIds = Array.isArray(rest.workerIds) && rest.workerIds.length > 0
      ? [...rest.workerIds]
      : legacyWorkerId
        ? [legacyWorkerId]
        : [];
    const newSession: WorkSession = withSessionHistory(
      {
        id: newId,
        label: '',
        ...rest,
        workerIds,
        history: [],
        isExceptional: true,
      },
      workerIds.length > 0
        ? `Session created with ${workerIds.length} Worker${workerIds.length === 1 ? '' : 's'} assigned`
        : 'Session created (no Workers assigned yet)'
    );
    setWorkSessions((prev) => [...prev, newSession]);
    showToast('New Session Scheduled', `Session added for ${sessionData.date}.`, 'success');
    return newId;
  };

  /** Create dated planned sessions from one definition. Recurrence creates sessions; it never overwrites attendance. */
  const createPlannedSessions: KlockitContextType['createPlannedSessions'] = (input) => {
    const recurrenceId = `rec-${Date.now()}`;
    const ids: string[] = [];
    const created: WorkSession[] = input.dates.map((date, idx) => {
      const id = `sess-${Date.now()}-${idx}`;
      ids.push(id);
      return withSessionHistory(
        {
          id,
          label: input.label,
          workerIds: [...(input.workerIds ?? [])],
          siteId: input.siteId,
          date,
          startTime: input.startTime,
          endTime: input.endTime,
          status: 'scheduled',
          patternId: input.patternId,
          recurrenceId,
          isExceptional: false,
          notes: input.notes,
          history: [],
        },
        `Session created from “${input.label}” (${input.dates.length} date${input.dates.length === 1 ? '' : 's'} in series)`
      );
    });
    setWorkSessions((prev) => [...prev, ...created]);
    showToast(
      'Planned Sessions Created',
      `${created.length} session${created.length === 1 ? '' : 's'} created for “${input.label}”. Assign Workers any time.`,
      'success'
    );
    return ids;
  };

  const assignWorkersToSession = (sessionId: string, workerIds: string[]) => {
    const names = workerIds.map((id) => workers.find((w) => w.id === id)?.name ?? id);
    setWorkSessions((prev) =>
      prev.map((ws) => {
        if (ws.id !== sessionId) return ws;
        const current = sessionWorkerIds(ws);
        const added = workerIds.filter((id) => !current.includes(id));
        if (added.length === 0) return ws;
        return withSessionHistory(
          { ...ws, workerIds: [...current, ...added] },
          `Assigned: ${added.map((id) => workers.find((w) => w.id === id)?.name ?? id).join(', ')}`
        );
      })
    );
    showToast('Workers Assigned', `${names.join(', ')} assigned to the session.`, 'success');
  };

  const removeWorkerFromSession = (sessionId: string, workerId: string) => {
    const name = workers.find((w) => w.id === workerId)?.name ?? 'Worker';
    setWorkSessions((prev) =>
      prev.map((ws) => {
        if (ws.id !== sessionId) return ws;
        if (!sessionWorkerIds(ws).includes(workerId)) return ws;
        return withSessionHistory(
          { ...ws, workerIds: sessionWorkerIds(ws).filter((id) => id !== workerId) },
          `Unassigned: ${name} (assignment ended — session and history retained)`
        );
      })
    );
    showToast('Worker Unassigned', `${name} removed from the session. History retained.`, 'info');
  };

  const reassignWorkerBetweenSessions = (fromSessionId: string, toSessionId: string, workerId: string) => {
    const name = workers.find((w) => w.id === workerId)?.name ?? 'Worker';
    setWorkSessions((prev) =>
      prev.map((ws) => {
        if (ws.id === fromSessionId && sessionWorkerIds(ws).includes(workerId)) {
          return withSessionHistory(
            { ...ws, workerIds: sessionWorkerIds(ws).filter((id) => id !== workerId) },
            `Reassigned: ${name} moved to session ${toSessionId}`
          );
        }
        if (ws.id === toSessionId && !sessionWorkerIds(ws).includes(workerId)) {
          return withSessionHistory(
            { ...ws, workerIds: [...sessionWorkerIds(ws), workerId] },
            `Reassigned: ${name} moved from session ${fromSessionId}`
          );
        }
        return ws;
      })
    );
    showToast('Worker Reassigned', `${name} moved without recreating records.`, 'success');
  };

  const cancelWorkSession = (sessionId: string) => {
    setWorkSessions((prev) =>
      prev.map((ws) =>
        ws.id === sessionId
          ? withSessionHistory({ ...ws, status: 'cancelled', isExceptional: true }, 'Session cancelled (history retained — not deleted)')
          : ws
      )
    );
    showToast('Session Cancelled', 'The work session has been cancelled.', 'info');
  };

  const updateWorkPattern = (patternId: string, schedule: WorkPattern['schedule']) => {
    setPatterns((prev) =>
      prev.map((p) => (p.id === patternId ? { ...p, schedule } : p))
    );
    showToast('Work Pattern Updated', 'The recurring schedule pattern has been updated.', 'success');
  };

  const updateWorkPatternFull = (patternId: string, patch: { name?: string; schedule?: WorkPattern['schedule'] }) => {
    setPatterns((prev) =>
      prev.map((p) => (p.id === patternId ? { ...p, ...(patch.name ? { name: patch.name } : {}), ...(patch.schedule ? { schedule: patch.schedule } : {}) } : p))
    );
    showToast('Planning Rule Updated', 'The recurring planning rule was saved. Existing sessions keep their own times.', 'success');
  };

  const addWorker = (workerData: Omit<Worker, 'id' | 'workerRef'>) => {
    const count = workers.length + 1;
    const newRef = `WK-${100 + count}`;
    const newId = `worker-${Date.now()}`;
    const initials = workerData.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const newWorker: Worker = {
      id: newId,
      workerRef: newRef,
      initials: initials || 'WK',
      avatarBg: 'bg-indigo-600',
      ...workerData,
    };

    setWorkers((prev) => [...prev, newWorker]);
    showToast('Worker Added', `${workerData.name} (${newRef}) added to organisation.`, 'success');
  };

  const updateWorker = (workerId: string, updates: Partial<Worker>) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, ...updates } : w))
    );
    showToast('Worker Updated', 'Worker profile changes saved.', 'success');
  };

  const addSite = (siteData: Omit<Site, 'id' | 'qrPayload'>) => {
    const newId = `site-${Date.now()}`;
    const newSite: Site = {
      id: newId,
      qrPayload: `klockit-site://${newId}?token=sec_${Math.random().toString(36).substring(2, 9)}&name=${encodeURIComponent(siteData.name)}`,
      ...siteData,
    };
    setSites((prev) => [...prev, newSite]);
    showToast('Site Created', `${siteData.name} (${siteData.code}) added.`, 'success');
  };

  const updateSite = (siteId: string, updates: Partial<Site>) => {
    setSites((prev) =>
      prev.map((s) => (s.id === siteId ? { ...s, ...updates } : s))
    );
    showToast('Site Updated', 'Site details saved.', 'success');
  };

  const updateOrganisation = (updates: Partial<OrganisationInfo>) => {
    setOrganisation((prev) => ({ ...prev, ...updates }));
    showToast('Settings Updated', 'Organisation preferences updated.', 'success');
  };

  const resetToSampleData = () => {
    setOrganisation(INITIAL_ORGANISATION);
    setSites(INITIAL_SITES);
    setWorkers(INITIAL_WORKERS);
    setPatterns(INITIAL_PATTERNS);
    setWorkSessions(INITIAL_WORK_SESSIONS.map(normalizeSession));
    setAttendance(INITIAL_ATTENDANCE);
    setExceptions(INITIAL_EXCEPTIONS);
    setSelectedDate(TODAY_DATE);
    setSelectedSiteFilter('all');
    showToast('Data Reset', 'Restored complete realistic sample organisation.', 'info');
  };

  return (
    <KlockitContext.Provider
      value={{
        organisation,
        sites,
        workers,
        patterns,
        workSessions,
        attendance,
        exceptions,
        currentRole,
        setCurrentRole,
        selectedWorkerId,
        setSelectedWorkerId,
        activeManagerTab,
        setActiveManagerTab,
        activeOperatorTab,
        setActiveOperatorTab,
        selectedDate,
        setSelectedDate,
        selectedSiteFilter,
        setSelectedSiteFilter,
        inspectedWorkerId,
        setInspectedWorkerId,
        inspectedSiteId,
        setInspectedSiteId,
        inspectedExceptionId,
        setInspectedExceptionId,
        inspectedSessionId,
        setInspectedSessionId,
        siteQrModalSiteId,
        setSiteQrModalSiteId,
        toasts,
        toast,
        showToast,
        clearToast,
        dismissToast,
        recordWorkerArrival,
        recordManagerArrivalCorrection,
        recordManagerDepartureCorrection,
        recordWorkerDeparture,
        resolveException,
        adjustWorkSession,
        addWorkSession,
        cancelWorkSession,
        updateWorkPattern,
        updateWorkPatternFull,
        createPlannedSessions,
        assignWorkersToSession,
        removeWorkerFromSession,
        reassignWorkerBetweenSessions,
        addWorker,
        updateWorker,
        addSite,
        updateSite,
        updateOrganisation,
        resetToSampleData,
      }}
    >
      {children}
    </KlockitContext.Provider>
  );
};

export const useKlockit = () => {
  const context = useContext(KlockitContext);
  if (!context) {
    throw new Error('useKlockit must be used within a KlockitProvider');
  }
  return context;
};
