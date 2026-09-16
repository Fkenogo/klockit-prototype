import {
  Site,
  Worker,
  WorkPattern,
  WorkSession,
  AttendanceRecord,
  AttendanceException,
  OrganisationInfo,
} from '../types';

export const TODAY_DATE = '2026-09-14'; // Monday

export const INITIAL_ORGANISATION: OrganisationInfo = {
  name: 'Apex Manufacturing & Logistics Ltd',
  industry: 'Light Industrial & Precision Assembly',
  timezone: 'Europe/London (BST / UTC+1)',
  defaultGracePeriodMinutes: 15,
  allowManualCodeFallback: true,
  requireManagerReviewForManualCode: true,
};

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    name: 'Main Workshop',
    code: '482-901',
    address: 'Unit 4, North Industrial Park, Riverway',
    city: 'Manchester',
    status: 'active',
    qrPayload: 'klockit-site://site-1?token=mw_sec_9941a&name=Main+Workshop',
    normalWorkerCount: 5,
    contactNumber: '+44 161 948 2011',
    notes: 'Primary fabrication, CNC and mechanical assembly floor.',
  },
  {
    id: 'site-2',
    name: 'Downtown Branch',
    code: '193-452',
    address: '14 Commercial Way, City Centre',
    city: 'Manchester',
    status: 'active',
    qrPayload: 'klockit-site://site-2?token=dt_sec_4418b&name=Downtown+Branch',
    normalWorkerCount: 3,
    contactNumber: '+44 161 492 8830',
    notes: 'Client consultations, rapid repairs, and front-counter distribution.',
  },
  {
    id: 'site-3',
    name: 'Harbor Warehouse',
    code: '720-318',
    address: 'Dock 4 Logistics Hub, Salford Quays',
    city: 'Salford',
    status: 'active',
    qrPayload: 'klockit-site://site-3?token=hw_sec_7723c&name=Harbor+Warehouse',
    normalWorkerCount: 2,
    contactNumber: '+44 161 820 9104',
    notes: 'Raw materials staging, palletising, and heavy outbound dispatch.',
  },
  {
    id: 'site-4',
    name: 'Old Yard Depot',
    code: '355-207',
    address: 'Rear Yard, North Industrial Park, Riverway',
    city: 'Manchester',
    status: 'retired',
    qrPayload: 'klockit-site://site-4?token=oy_sec_1102d&name=Old+Yard+Depot',
    normalWorkerCount: 0,
    contactNumber: '+44 161 948 2077',
    notes: 'Closed in August. Retained so historical attendance records still resolve to a known site.',
  },
];

export const INITIAL_PATTERNS: WorkPattern[] = [
  {
    id: 'pat-1',
    workerId: 'worker-1',
    name: 'Full-Time Day Shift (Mon-Fri 08:00 - 17:00)',
    effectiveFrom: '2026-01-01',
    schedule: {
      monday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      thursday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      friday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
      saturday: { isWorking: false, startTime: '08:00', endTime: '17:00' },
      sunday: { isWorking: false, startTime: '08:00', endTime: '17:00' },
    },
  },
  {
    id: 'pat-early',
    workerId: 'worker-2',
    name: 'Early Logistics Shift (Mon-Fri 06:00 - 14:30)',
    effectiveFrom: '2026-01-01',
    schedule: {
      monday: { isWorking: true, startTime: '06:00', endTime: '14:30' },
      tuesday: { isWorking: true, startTime: '06:00', endTime: '14:30' },
      wednesday: { isWorking: true, startTime: '06:00', endTime: '14:30' },
      thursday: { isWorking: true, startTime: '06:00', endTime: '14:30' },
      friday: { isWorking: true, startTime: '06:00', endTime: '14:30' },
      saturday: { isWorking: false, startTime: '08:00', endTime: '17:00' },
      sunday: { isWorking: false, startTime: '08:00', endTime: '17:00' },
    },
  },
  {
    id: 'pat-part',
    workerId: 'worker-4',
    name: 'Technician 3-Day Shift (Mon, Wed, Fri 08:30 - 16:30)',
    effectiveFrom: '2026-02-01',
    schedule: {
      monday: { isWorking: true, startTime: '08:30', endTime: '16:30' },
      tuesday: { isWorking: false, startTime: '08:30', endTime: '16:30' },
      wednesday: { isWorking: true, startTime: '08:30', endTime: '16:30' },
      thursday: { isWorking: false, startTime: '08:30', endTime: '16:30' },
      friday: { isWorking: true, startTime: '08:30', endTime: '16:30' },
      saturday: { isWorking: false, startTime: '08:30', endTime: '16:30' },
      sunday: { isWorking: false, startTime: '08:30', endTime: '16:30' },
    },
  },
  {
    id: 'pat-late',
    workerId: 'worker-10',
    name: 'Afternoon Dispatch Shift (Mon-Fri 13:00 - 21:00)',
    effectiveFrom: '2026-03-01',
    schedule: {
      monday: { isWorking: true, startTime: '13:00', endTime: '21:00' },
      tuesday: { isWorking: true, startTime: '13:00', endTime: '21:00' },
      wednesday: { isWorking: true, startTime: '13:00', endTime: '21:00' },
      thursday: { isWorking: true, startTime: '13:00', endTime: '21:00' },
      friday: { isWorking: true, startTime: '13:00', endTime: '21:00' },
      saturday: { isWorking: false, startTime: '13:00', endTime: '21:00' },
      sunday: { isWorking: false, startTime: '13:00', endTime: '21:00' },
    },
  },
];

export const INITIAL_WORKERS: Worker[] = [
  {
    id: 'worker-1',
    workerRef: 'WK-101',
    name: 'Marcus Vance',
    role: 'Lead Fabricator',
    normalSiteId: 'site-1',
    status: 'active',
    avatarBg: 'bg-blue-600',
    initials: 'MV',
    workPatternId: 'pat-1',
  },
  {
    id: 'worker-2',
    workerRef: 'WK-102',
    name: 'Liam O\'Connor',
    role: 'Warehouse Coordinator',
    normalSiteId: 'site-3',
    status: 'active',
    avatarBg: 'bg-emerald-600',
    initials: 'LO',
    workPatternId: 'pat-early',
  },
  {
    id: 'worker-3',
    workerRef: 'WK-103',
    name: 'Priya Patel',
    role: 'Assembly Technician',
    normalSiteId: 'site-1',
    status: 'active',
    avatarBg: 'bg-indigo-600',
    initials: 'PP',
    workPatternId: 'pat-1',
  },
  {
    id: 'worker-4',
    workerRef: 'WK-104',
    name: 'Elena Rostova',
    role: 'CNC Machinist',
    normalSiteId: 'site-1',
    status: 'active',
    avatarBg: 'bg-amber-600',
    initials: 'ER',
    workPatternId: 'pat-1',
  },
  {
    id: 'worker-5',
    workerRef: 'WK-105',
    name: 'Carlos Mendez',
    role: 'Maintenance Specialist',
    normalSiteId: 'site-1',
    status: 'active',
    avatarBg: 'bg-cyan-600',
    initials: 'CM',
    workPatternId: 'pat-part',
  },
  {
    id: 'worker-6',
    workerRef: 'WK-106',
    name: 'Samira Khan',
    role: 'Customer Service & Desk',
    normalSiteId: 'site-2',
    status: 'active',
    avatarBg: 'bg-purple-600',
    initials: 'SK',
    workPatternId: 'pat-1',
  },
  {
    id: 'worker-7',
    workerRef: 'WK-107',
    name: 'David Chen',
    role: 'Quality Inspector',
    normalSiteId: 'site-1', // Normally site 1, but checked in at site 2!
    status: 'active',
    avatarBg: 'bg-teal-600',
    initials: 'DC',
    workPatternId: 'pat-1',
  },
  {
    id: 'worker-8',
    workerRef: 'WK-108',
    name: 'Sofia Alves',
    role: 'Branch Supervisor',
    normalSiteId: 'site-2',
    status: 'active',
    avatarBg: 'bg-rose-600',
    initials: 'SA',
    workPatternId: 'pat-1',
  },
  {
    id: 'worker-9',
    workerRef: 'WK-109',
    name: 'Tariq Al-Mansoor',
    role: 'Forklift Operator',
    normalSiteId: 'site-3',
    status: 'active',
    avatarBg: 'bg-violet-600',
    initials: 'TM',
    workPatternId: 'pat-early',
  },
  {
    id: 'worker-10',
    workerRef: 'WK-110',
    name: 'Chloe Bennett',
    role: 'Late Shift Dispatcher',
    normalSiteId: 'site-3',
    status: 'active',
    avatarBg: 'bg-sky-600',
    initials: 'CB',
    workPatternId: 'pat-late',
  },
];

export const INITIAL_WORK_SESSIONS: WorkSession[] = [
  // Today's Work Sessions (2026-09-14)
  {
    id: 'sess-today-1',
    workerId: 'worker-1',
    siteId: 'site-1',
    date: '2026-09-14',
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
  },
  {
    id: 'sess-today-2',
    workerId: 'worker-2',
    siteId: 'site-3',
    date: '2026-09-14',
    startTime: '06:00',
    endTime: '14:30',
    status: 'completed',
  },
  {
    id: 'sess-today-3',
    workerId: 'worker-3',
    siteId: 'site-1',
    date: '2026-09-14',
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
  },
  {
    id: 'sess-today-4',
    workerId: 'worker-4',
    siteId: 'site-1',
    date: '2026-09-14',
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
  },
  {
    id: 'sess-today-5',
    workerId: 'worker-5',
    siteId: 'site-1',
    date: '2026-09-14',
    startTime: '08:30',
    endTime: '16:30',
    status: 'scheduled',
  },
  // Samira Khan split shifts today: Morning vs Afternoon
  {
    id: 'sess-today-6a',
    workerId: 'worker-6',
    siteId: 'site-2',
    date: '2026-09-14',
    startTime: '08:00',
    endTime: '12:00',
    status: 'scheduled',
    notes: 'Morning desk rotation',
  },
  {
    id: 'sess-today-6b',
    workerId: 'worker-6',
    siteId: 'site-2',
    date: '2026-09-14',
    startTime: '12:30',
    endTime: '17:00',
    status: 'scheduled',
    notes: 'Afternoon client distribution',
  },
  {
    id: 'sess-today-7',
    workerId: 'worker-7',
    siteId: 'site-1',
    date: '2026-09-14',
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
  },
  {
    id: 'sess-today-8',
    workerId: 'worker-8',
    siteId: 'site-2',
    date: '2026-09-14',
    startTime: '08:30',
    endTime: '17:30',
    status: 'scheduled',
  },
  {
    id: 'sess-today-9',
    workerId: 'worker-9',
    siteId: 'site-3',
    date: '2026-09-14',
    startTime: '07:00',
    endTime: '15:30',
    status: 'scheduled',
  },
  {
    id: 'sess-today-10',
    workerId: 'worker-10',
    siteId: 'site-3',
    date: '2026-09-14',
    startTime: '13:00',
    endTime: '21:00',
    status: 'scheduled',
  },

  // Yesterday (2026-09-13 Sunday or previous Friday for Elena missing departure)
  {
    id: 'sess-prev-4',
    workerId: 'worker-4',
    siteId: 'site-1',
    date: '2026-09-13',
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
    notes: 'Weekend emergency maintenance prep',
    isExceptional: true,
  },

  // Tomorrow (2026-09-15)
  {
    id: 'sess-tom-1',
    workerId: 'worker-1',
    siteId: 'site-1',
    date: '2026-09-15',
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
  },
  {
    id: 'sess-tom-2',
    workerId: 'worker-2',
    siteId: 'site-3',
    date: '2026-09-15',
    startTime: '06:00',
    endTime: '14:30',
    status: 'scheduled',
  },
  {
    id: 'sess-tom-3',
    workerId: 'worker-3',
    siteId: 'site-1',
    date: '2026-09-15',
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
  },
  {
    id: 'sess-tom-6',
    workerId: 'worker-6',
    siteId: 'site-2',
    date: '2026-09-15',
    startTime: '08:00',
    endTime: '17:00',
    status: 'scheduled',
  },
  {
    id: 'sess-tom-8',
    workerId: 'worker-8',
    siteId: 'site-2',
    date: '2026-09-15',
    startTime: '08:30',
    endTime: '17:30',
    status: 'scheduled',
  },
];

export const INITIAL_EXCEPTIONS: AttendanceException[] = [
  {
    id: 'exc-1',
    attendanceId: 'att-prev-4',
    workerId: 'worker-4',
    siteId: 'site-1',
    date: '2026-09-13',
    type: 'missing_departure',
    status: 'unresolved',
    title: 'Departure Not Recorded',
    description: 'Elena recorded arrival yesterday at 08:00 at Main Workshop via Site QR, but no departure was recorded when the shift ended at 17:00.',
    evidence: {
      recordedArrival: '08:00',
      expectedStart: '08:00',
      expectedEnd: '17:00',
      method: 'qr',
      scheduledSiteId: 'site-1',
    },
    createdAt: '2026-09-13T17:30:00Z',
  },
  {
    id: 'exc-2',
    attendanceId: 'att-today-3',
    workerId: 'worker-3',
    siteId: 'site-1',
    date: '2026-09-14',
    type: 'manual_site_code',
    status: 'unresolved',
    title: 'Manual Site Code Arrival Awaiting Review',
    description: 'Priya recorded arrival using the 6-digit backup code (482-901) instead of scanning the Site QR. Physical presence requires Manager confirmation.',
    evidence: {
      recordedArrival: '08:04',
      expectedStart: '08:00',
      expectedEnd: '17:00',
      siteCodeEntered: '482-901',
      method: 'manual_code',
      scheduledSiteId: 'site-1',
    },
    createdAt: '2026-09-14T08:04:12Z',
  },
  {
    id: 'exc-3',
    attendanceId: 'att-today-6',
    workerId: 'worker-6',
    siteId: 'site-2',
    date: '2026-09-14',
    type: 'multiple_possible_sessions',
    status: 'unresolved',
    title: 'Multiple Matching Sessions',
    description: 'Samira arrived at 11:45 at Downtown Branch. She is scheduled for both Morning (08:00-12:00) and Afternoon (12:30-17:00). Confirm which session this relates to.',
    evidence: {
      recordedArrival: '11:45',
      expectedStart: '08:00 / 12:30',
      expectedEnd: '12:00 / 17:00',
      method: 'qr',
      scheduledSiteId: 'site-2',
      possibleSessionIds: ['sess-today-6a', 'sess-today-6b'],
    },
    createdAt: '2026-09-14T11:45:30Z',
  },
  {
    id: 'exc-4',
    attendanceId: 'att-today-7',
    workerId: 'worker-7',
    siteId: 'site-2',
    date: '2026-09-14',
    type: 'unmatched_arrival',
    status: 'unresolved',
    title: 'Arrival at Unexpected Site',
    description: 'David scanned the QR code at Downtown Branch at 08:15, but his planned work session was scheduled at Main Workshop.',
    evidence: {
      recordedArrival: '08:15',
      expectedStart: '08:00',
      expectedEnd: '17:00',
      method: 'qr',
      scheduledSiteId: 'site-1',
    },
    createdAt: '2026-09-14T08:15:05Z',
  },
];

// Helper to generate realistic 30-day historical attendance
export const generate30DayHistoricalAttendance = (): AttendanceRecord[] => {
  const generated: AttendanceRecord[] = [];
  const workerScheduleMap = [
    { workerId: 'worker-1', siteId: 'site-1', normalStart: '08:00', normalEnd: '17:00' },
    { workerId: 'worker-2', siteId: 'site-3', normalStart: '06:00', normalEnd: '14:30' },
    { workerId: 'worker-3', siteId: 'site-1', normalStart: '08:00', normalEnd: '17:00' },
    { workerId: 'worker-4', siteId: 'site-1', normalStart: '08:00', normalEnd: '17:00' },
    { workerId: 'worker-5', siteId: 'site-1', normalStart: '08:30', normalEnd: '16:30' },
    { workerId: 'worker-6', siteId: 'site-2', normalStart: '08:00', normalEnd: '17:00' },
    { workerId: 'worker-7', siteId: 'site-1', normalStart: '08:00', normalEnd: '17:00' },
    { workerId: 'worker-8', siteId: 'site-2', normalStart: '08:30', normalEnd: '17:30' },
    { workerId: 'worker-9', siteId: 'site-3', normalStart: '06:00', normalEnd: '14:30' },
    { workerId: 'worker-10', siteId: 'site-3', normalStart: '13:00', normalEnd: '21:30' },
  ];

  // From 2026-08-16 to 2026-09-09
  const baseDate = new Date('2026-09-13T12:00:00Z');
  for (let i = 1; i <= 28; i++) {
    const curDate = new Date(baseDate);
    curDate.setDate(curDate.getDate() - i);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayOfWeek = curDate.getDay(); // 0 is Sun, 6 is Sat

    if (dayOfWeek === 0) continue; // Sunday closed

    workerScheduleMap.forEach((ws, idx) => {
      if (dayOfWeek === 6) {
        if (ws.siteId !== 'site-3' || idx % 2 === 0) return;
      } else {
        const seed = (i * 17 + idx * 23) % 100;
        if (seed > 88) return; // simulated leave or off-day
      }

      const arrivalOffset = ((i * 7 + idx * 11) % 15) - 6;
      const [h, m] = ws.normalStart.split(':').map(Number);
      const totalArrivalMin = h * 60 + m + arrivalOffset;
      const arrH = String(Math.floor(totalArrivalMin / 60)).padStart(2, '0');
      const arrM = String(totalArrivalMin % 60).padStart(2, '0');

      const [outH, outM] = ws.normalEnd.split(':').map(Number);
      const depOffset = ((i * 5 + idx * 13) % 16) - 3;
      const totalDepMin = outH * 60 + outM + depOffset;
      const dH = String(Math.floor(totalDepMin / 60)).padStart(2, '0');
      const dM = String(totalDepMin % 60).padStart(2, '0');

      generated.push({
        id: `att-30d-${dateStr}-${ws.workerId}`,
        workerId: ws.workerId,
        siteId: ws.siteId,
        date: dateStr,
        arrivalTime: `${arrH}:${arrM}`,
        arrivalMethod: idx === 2 && i % 6 === 0 ? 'manual_code' : 'qr',
        departureTime: `${dH}:${dM}`,
        departureMethod: 'worker',
        status: 'completed',
        needsAttention: false,
      });
    });
  }

  return generated;
};

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Today's Attendance (2026-09-14)
  {
    id: 'att-today-1',
    workerId: 'worker-1', // Marcus Vance
    workSessionId: 'sess-today-1',
    siteId: 'site-1',
    date: '2026-09-14',
    arrivalTime: '07:52',
    arrivalMethod: 'qr',
    status: 'present',
    needsAttention: false,
    notes: 'Verified on-site scan.',
  },
  {
    id: 'att-today-2',
    workerId: 'worker-2', // Liam O'Connor
    workSessionId: 'sess-today-2',
    siteId: 'site-3',
    date: '2026-09-14',
    arrivalTime: '05:58',
    arrivalMethod: 'qr',
    departureTime: '14:32',
    departureMethod: 'worker',
    status: 'completed',
    needsAttention: false,
    notes: 'Early shift completed cleanly (8h 34m).',
  },
  {
    id: 'att-today-3',
    workerId: 'worker-3', // Priya Patel
    workSessionId: 'sess-today-3',
    siteId: 'site-1',
    date: '2026-09-14',
    arrivalTime: '08:04',
    arrivalMethod: 'manual_code',
    status: 'pending_review',
    needsAttention: true,
    exceptionId: 'exc-2',
    notes: 'Entered site code 482-901. Camera lens blurred.',
  },
  {
    id: 'att-today-4',
    workerId: 'worker-4', // Elena Rostova
    workSessionId: 'sess-today-4',
    siteId: 'site-1',
    date: '2026-09-14',
    // Not arrived yet today because previous session is open!
    status: 'not_arrived',
    needsAttention: true,
    exceptionId: 'exc-1',
    notes: 'Shift planned 08:00 - 17:00; previous day departure missing.',
  },
  {
    id: 'att-today-5',
    workerId: 'worker-5', // Carlos Mendez
    workSessionId: 'sess-today-5',
    siteId: 'site-1',
    date: '2026-09-14',
    status: 'not_arrived',
    needsAttention: false,
    notes: 'Scheduled for 08:30 - 16:30.',
  },
  {
    id: 'att-today-6',
    workerId: 'worker-6', // Samira Khan
    workSessionId: 'sess-today-6a',
    siteId: 'site-2',
    date: '2026-09-14',
    arrivalTime: '11:45',
    arrivalMethod: 'qr',
    status: 'pending_review',
    needsAttention: true,
    exceptionId: 'exc-3',
  },
  {
    id: 'att-today-7',
    workerId: 'worker-7', // David Chen
    workSessionId: 'sess-today-7',
    siteId: 'site-2', // Actual arrival site
    date: '2026-09-14',
    arrivalTime: '08:15',
    arrivalMethod: 'qr',
    status: 'unmatched',
    needsAttention: true,
    exceptionId: 'exc-4',
    notes: 'Checked in at Downtown Branch, scheduled at Main Workshop.',
  },
  {
    id: 'att-today-8',
    workerId: 'worker-8', // Sofia Alves
    workSessionId: 'sess-today-8',
    siteId: 'site-2',
    date: '2026-09-14',
    arrivalTime: '08:24',
    arrivalMethod: 'qr',
    status: 'present',
    needsAttention: false,
    notes: 'Supervisor present.',
  },
  {
    id: 'att-today-9',
    workerId: 'worker-9', // Tariq Al-Mansoor
    workSessionId: 'sess-today-9',
    siteId: 'site-3',
    date: '2026-09-14',
    arrivalTime: '06:55',
    arrivalMethod: 'qr',
    status: 'present',
    needsAttention: false,
  },
  {
    id: 'att-today-10',
    workerId: 'worker-10', // Chloe Bennett
    workSessionId: 'sess-today-10',
    siteId: 'site-3',
    date: '2026-09-14',
    status: 'not_arrived',
    needsAttention: false,
    notes: 'Afternoon shift begins at 13:00.',
  },

  // Previous Day (2026-09-13)
  {
    id: 'att-prev-4',
    workerId: 'worker-4', // Elena Rostova
    workSessionId: 'sess-prev-4',
    siteId: 'site-1',
    date: '2026-09-13',
    arrivalTime: '08:00',
    arrivalMethod: 'qr',
    status: 'missing_departure',
    needsAttention: true,
    exceptionId: 'exc-1',
    notes: 'Arrived on time; forgot to scan departure when leaving.',
  },

  // Historic Records (Past week for rich History view: 2026-09-11 & 2026-09-12)
  {
    id: 'att-hist-1',
    workerId: 'worker-1',
    siteId: 'site-1',
    date: '2026-09-11',
    arrivalTime: '07:55',
    arrivalMethod: 'qr',
    departureTime: '17:04',
    departureMethod: 'worker',
    status: 'completed',
    needsAttention: false,
  },
  {
    id: 'att-hist-2',
    workerId: 'worker-2',
    siteId: 'site-3',
    date: '2026-09-11',
    arrivalTime: '05:59',
    arrivalMethod: 'qr',
    departureTime: '14:31',
    departureMethod: 'worker',
    status: 'completed',
    needsAttention: false,
  },
  {
    id: 'att-hist-3',
    workerId: 'worker-3',
    siteId: 'site-1',
    date: '2026-09-11',
    arrivalTime: '08:12',
    arrivalMethod: 'manual_code',
    departureTime: '17:00',
    departureMethod: 'worker',
    status: 'completed',
    needsAttention: false,
    effectiveArrivalTime: '08:12',
    corrections: [
      {
        id: 'corr-hist-1',
        type: 'verification',
        action: 'Verified manual site code arrival',
        correctedBy: 'Operations Manager',
        correctedAt: '2026-09-11T09:30:00Z',
        reason: 'Confirmed phone camera broken; manual code entry approved.',
        recordedArrivalTime: '08:12',
        recordedStatus: 'pending_review',
        effectiveArrivalTime: '08:12',
        resultingStatus: 'completed',
      },
    ],
  },
  {
    id: 'att-hist-4',
    workerId: 'worker-4',
    siteId: 'site-1',
    date: '2026-09-11',
    arrivalTime: '07:58',
    arrivalMethod: 'qr',
    departureTime: '16:55',
    departureMethod: 'worker',
    status: 'completed',
    needsAttention: false,
  },
  {
    id: 'att-hist-5',
    workerId: 'worker-8',
    siteId: 'site-2',
    date: '2026-09-11',
    arrivalTime: '08:29',
    arrivalMethod: 'qr',
    departureTime: '17:35',
    departureMethod: 'worker',
    status: 'completed',
    needsAttention: false,
  },
  {
    id: 'att-hist-6',
    workerId: 'worker-5',
    siteId: 'site-1',
    date: '2026-09-10',
    arrivalTime: '08:30',
    arrivalMethod: 'qr',
    departureTime: '16:30',
    departureMethod: 'worker',
    status: 'completed',
    needsAttention: false,
  },
  {
    id: 'att-hist-7',
    workerId: 'worker-6',
    siteId: 'site-2',
    date: '2026-09-10',
    arrivalTime: '08:02',
    arrivalMethod: 'qr',
    departureTime: '17:00',
    departureMethod: 'manager_entry',
    status: 'completed',
    needsAttention: false,
    effectiveDepartureTime: '17:00',
    corrections: [
      {
        id: 'corr-hist-2',
        type: 'departure',
        action: 'Recorded departure on the Worker\'s behalf',
        correctedBy: 'Operations Manager',
        correctedAt: '2026-09-11T08:15:00Z',
        reason: 'Worker did not record departure before the team offsite.',
        recordedArrivalTime: '08:02',
        recordedStatus: 'missing_departure',
        effectiveDepartureTime: '17:00',
        resultingStatus: 'completed',
      },
    ],
  },
  ...generate30DayHistoricalAttendance(),
];
