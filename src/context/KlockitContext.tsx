import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Site,
  Worker,
  WorkPattern,
  WorkSession,
  AttendanceRecord,
  AttendanceException,
  OrganisationInfo,
  ArrivalMethod,
  ShiftSwapRequest,
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
  INITIAL_SHIFT_SWAPS,
} from '../data/mockData';

export type ManagerTab = 'today' | 'workers' | 'sites' | 'planning' | 'exceptions' | 'history' | 'settings';

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
  shiftSwapRequests: ShiftSwapRequest[];
  
  // Navigation & View Context
  currentRole: 'manager' | 'worker';
  setCurrentRole: (role: 'manager' | 'worker') => void;
  selectedWorkerId: string;
  setSelectedWorkerId: (id: string) => void;
  activeManagerTab: ManagerTab;
  setActiveManagerTab: (tab: ManagerTab) => void;
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

  recordManualArrivalByManager: (
    workerId: string,
    siteId: string,
    arrivalTime: string,
    note?: string,
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
  addWorkSession: (session: Omit<WorkSession, 'id'>) => void;
  cancelWorkSession: (sessionId: string) => void;
  updateWorkPattern: (patternId: string, schedule: WorkPattern['schedule']) => void;

  addWorker: (worker: Omit<Worker, 'id' | 'workerRef'>) => void;
  updateWorker: (workerId: string, updates: Partial<Worker>) => void;

  addSite: (site: Omit<Site, 'id' | 'qrPayload'>) => void;
  updateSite: (siteId: string, updates: Partial<Site>) => void;

  updateOrganisation: (updates: Partial<OrganisationInfo>) => void;
  resetToSampleData: () => void;

  // Shift Swaps & Bulk Operations
  proposeShiftSwap: (swap: Omit<ShiftSwapRequest, 'id' | 'createdAt' | 'status'>) => void;
  reviewShiftSwap: (swapId: string, action: 'approve' | 'deny', note?: string) => void;
  bulkAssignWorkersToSite: (workerIds: string[], siteId: string) => void;
  bulkSetWorkersStatus: (workerIds: string[], status: 'active' | 'suspended') => void;
  bulkCreateSessions: (sessions: Omit<WorkSession, 'id'>[]) => void;
}

const KlockitContext = createContext<KlockitContextType | undefined>(undefined);

const STORAGE_KEY = 'klockit_workforce_data_v1';

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
      return saved ? JSON.parse(saved) : INITIAL_WORK_SESSIONS;
    } catch {
      return INITIAL_WORK_SESSIONS;
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

  const [shiftSwapRequests, setShiftSwapRequests] = useState<ShiftSwapRequest[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_shift_swaps`);
      return saved ? JSON.parse(saved) : INITIAL_SHIFT_SWAPS;
    } catch {
      return INITIAL_SHIFT_SWAPS;
    }
  });

  // UI state
  const [currentRole, setCurrentRole] = useState<'manager' | 'worker'>('manager');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('worker-3'); // Defaults to Priya Patel or Elena
  const [activeManagerTab, setActiveManagerTab] = useState<ManagerTab>('today');
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_DATE);
  const [selectedSiteFilter, setSelectedSiteFilter] = useState<string>('all');

  // Modal / Inspection state
  const [inspectedWorkerId, setInspectedWorkerId] = useState<string | null>(null);
  const [inspectedSiteId, setInspectedSiteId] = useState<string | null>(null);
  const [inspectedExceptionId, setInspectedExceptionId] = useState<string | null>(null);
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
      localStorage.setItem(`${STORAGE_KEY}_shift_swaps`, JSON.stringify(shiftSwapRequests));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  }, [organisation, sites, workers, patterns, workSessions, attendance, exceptions, shiftSwapRequests]);

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

    // Find planned work session for today
    const matchingSession = workSessions.find(
      (ws) => ws.workerId === workerId && ws.date === TODAY_DATE && ws.status === 'scheduled'
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

  // Manager manually recording arrival for worker who forgot device
  const recordManualArrivalByManager = (
    workerId: string,
    siteId: string,
    arrivalTime: string,
    note?: string,
    date?: string
  ) => {
    const targetDate = date || selectedDate || TODAY_DATE;
    const worker = workers.find((w) => w.id === workerId);
    const site = sites.find((s) => s.id === siteId);
    const matchingSession = workSessions.find(
      (s) => s.workerId === workerId && s.date === targetDate && s.status !== 'cancelled'
    );

    const newAttId = `att-mgr-${Date.now()}`;
    const newRecord: AttendanceRecord = {
      id: newAttId,
      workerId,
      workSessionId: matchingSession?.id,
      siteId,
      date: targetDate,
      arrivalTime,
      arrivalMethod: 'manager_entry',
      status: 'present',
      needsAttention: false,
      notes: note || 'Manually logged by Manager — worker forgot mobile device.',
      managerCorrection: {
        correctedBy: 'Operations Manager',
        correctedAt: new Date().toISOString(),
        reason: note || 'Worker forgot mobile device — manual verification on site',
        effectiveArrivalTime: arrivalTime,
        originalValue: 'None (Device unavailable)',
      },
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
            resolutionDecision: `Resolved via manual arrival entry at ${arrivalTime}. Note: ${note || 'Worker forgot mobile device'}`,
          };
        }
        return exc;
      })
    );

    setAttendance((prev) => [newRecord, ...prev.filter((a) => !(a.workerId === workerId && a.date === targetDate))]);

    showToast(
      'Manual Arrival Logged',
      `Marked ${worker?.name || 'Worker'} as present at ${site?.name || 'site'} (${arrivalTime}).`,
      'success'
    );

    return {
      success: true,
      message: `Recorded arrival for ${worker?.name || 'Worker'} at ${arrivalTime}.`,
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
                  notes: `Rejected by ${managerName}: ${payload.note || 'Not approved'}`,
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
              departureTime: actualDeparture,
              departureMethod: 'manager_entry',
              status: 'completed',
              needsAttention: false,
              managerCorrection: {
                correctedBy: managerName,
                correctedAt: resolutionTimestamp,
                reason: payload.note || 'Confirmed actual departure with worker',
                effectiveDepartureTime: actualDeparture,
              },
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
              arrivalTime: effectiveArrival,
              status: a.departureTime ? 'completed' : 'present',
              needsAttention: false,
              managerCorrection: {
                correctedBy: managerName,
                correctedAt: resolutionTimestamp,
                reason: payload.note || 'Manager verified physical presence at site',
                effectiveArrivalTime: effectiveArrival,
              },
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
              managerCorrection: {
                correctedBy: managerName,
                correctedAt: resolutionTimestamp,
                reason: payload.note || 'Linked to scheduled work session',
              },
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

  // Adjust individual work session
  const adjustWorkSession = (sessionId: string, updates: Partial<WorkSession>) => {
    setWorkSessions((prev) =>
      prev.map((ws) => (ws.id === sessionId ? { ...ws, ...updates, isExceptional: true } : ws))
    );
    showToast('Work Session Updated', 'Changes saved for this specific session.', 'success');
  };

  const addWorkSession = (sessionData: Omit<WorkSession, 'id'>) => {
    const newId = `sess-${Date.now()}`;
    const newSession: WorkSession = {
      id: newId,
      ...sessionData,
      isExceptional: true,
    };
    setWorkSessions((prev) => [...prev, newSession]);
    showToast('New Session Scheduled', `Session added for ${sessionData.date}.`, 'success');
  };

  const cancelWorkSession = (sessionId: string) => {
    setWorkSessions((prev) =>
      prev.map((ws) => (ws.id === sessionId ? { ...ws, status: 'cancelled', isExceptional: true } : ws))
    );
    showToast('Session Cancelled', 'The work session has been cancelled.', 'info');
  };

  const updateWorkPattern = (patternId: string, schedule: WorkPattern['schedule']) => {
    setPatterns((prev) =>
      prev.map((p) => (p.id === patternId ? { ...p, schedule } : p))
    );
    showToast('Work Pattern Updated', 'The recurring schedule pattern has been updated.', 'success');
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
    setWorkSessions(INITIAL_WORK_SESSIONS);
    setAttendance(INITIAL_ATTENDANCE);
    setExceptions(INITIAL_EXCEPTIONS);
    setShiftSwapRequests(INITIAL_SHIFT_SWAPS);
    setSelectedDate(TODAY_DATE);
    setSelectedSiteFilter('all');
    showToast('Data Reset', 'Restored complete realistic sample organisation.', 'info');
  };

  // Shift Swap Workflow
  const proposeShiftSwap = (swapData: Omit<ShiftSwapRequest, 'id' | 'createdAt' | 'status'>) => {
    const newSwap: ShiftSwapRequest = {
      id: `swap-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...swapData,
    };
    setShiftSwapRequests((prev) => [newSwap, ...prev]);
    showToast('Swap Proposed', 'Shift swap proposal submitted for manager review.', 'success');
  };

  const reviewShiftSwap = (swapId: string, action: 'approve' | 'deny', note?: string) => {
    const swap = shiftSwapRequests.find((s) => s.id === swapId);
    if (!swap) return;

    const reviewedAt = new Date().toISOString();
    const reviewedBy = 'Operations Manager';

    if (action === 'approve') {
      // Reassign session(s)
      if (swap.targetWorkerId) {
        setWorkSessions((prev) =>
          prev.map((sess) => {
            // If this is the requester's original session, assign to target worker
            if (sess.id === swap.originalSessionId || (sess.workerId === swap.requesterWorkerId && sess.date === swap.originalDate)) {
              return { ...sess, workerId: swap.targetWorkerId!, notes: `${sess.notes ? sess.notes + '; ' : ''}Swapped from ${workers.find((w) => w.id === swap.requesterWorkerId)?.name || 'Worker'}` };
            }
            // If there was a matching target session, assign to requester
            if (swap.proposedTargetSessionId && sess.id === swap.proposedTargetSessionId) {
              return { ...sess, workerId: swap.requesterWorkerId, notes: `${sess.notes ? sess.notes + '; ' : ''}Swapped with ${workers.find((w) => w.id === swap.targetWorkerId)?.name || 'Worker'}` };
            }
            return sess;
          })
        );
      }

      setShiftSwapRequests((prev) =>
        prev.map((s) =>
          s.id === swapId
            ? { ...s, status: 'approved', reviewedAt, reviewedBy, reviewNotes: note || 'Approved by manager.' }
            : s
        )
      );
      showToast('Swap Approved', `Shift on ${swap.originalDate} reallocated successfully.`, 'success');
    } else {
      setShiftSwapRequests((prev) =>
        prev.map((s) =>
          s.id === swapId
            ? { ...s, status: 'denied', reviewedAt, reviewedBy, reviewNotes: note || 'Declined by manager.' }
            : s
        )
      );
      showToast('Swap Declined', 'Shift swap request marked as denied.', 'info');
    }
  };

  // Bulk Operations for Workers
  const bulkAssignWorkersToSite = (workerIds: string[], siteId: string) => {
    const targetSite = sites.find((s) => s.id === siteId);
    setWorkers((prev) =>
      prev.map((w) => (workerIds.includes(w.id) ? { ...w, normalSiteId: siteId } : w))
    );
    showToast('Bulk Site Assigned', `${workerIds.length} workers reassigned to ${targetSite?.name || 'new site'}.`, 'success');
  };

  const bulkSetWorkersStatus = (workerIds: string[], status: 'active' | 'suspended') => {
    setWorkers((prev) =>
      prev.map((w) => (workerIds.includes(w.id) ? { ...w, status } : w))
    );
    showToast('Bulk Status Updated', `${workerIds.length} workers set to ${status}.`, 'success');
  };

  const bulkCreateSessions = (newSessions: Omit<WorkSession, 'id'>[]) => {
    const created: WorkSession[] = newSessions.map((s, idx) => ({
      ...s,
      id: `sess-smart-${Date.now()}-${idx}`,
    }));
    setWorkSessions((prev) => [...prev, ...created]);
    showToast('Smart Shifts Applied', `${created.length} optimized shift sessions added to schedule.`, 'success');
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
        shiftSwapRequests,
        currentRole,
        setCurrentRole,
        selectedWorkerId,
        setSelectedWorkerId,
        activeManagerTab,
        setActiveManagerTab,
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
        siteQrModalSiteId,
        setSiteQrModalSiteId,
        toasts,
        toast,
        showToast,
        clearToast,
        dismissToast,
        recordWorkerArrival,
        recordManualArrivalByManager,
        recordWorkerDeparture,
        resolveException,
        adjustWorkSession,
        addWorkSession,
        cancelWorkSession,
        updateWorkPattern,
        addWorker,
        updateWorker,
        addSite,
        updateSite,
        updateOrganisation,
        resetToSampleData,
        proposeShiftSwap,
        reviewShiftSwap,
        bulkAssignWorkersToSite,
        bulkSetWorkersStatus,
        bulkCreateSessions,
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
