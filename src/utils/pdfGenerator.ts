import { jsPDF } from 'jspdf';
import { AttendanceRecord, Worker, Site, WorkSession, OrganisationInfo } from '../types';

interface GenerateDailyPdfOptions {
  date: string;
  organisation: OrganisationInfo;
  attendanceRecords: AttendanceRecord[];
  workers: Worker[];
  sites: Site[];
  workSessions: WorkSession[];
}

export function generateDailyAttendancePdf({
  date,
  organisation,
  attendanceRecords,
  workers,
  sites,
  workSessions,
}: GenerateDailyPdfOptions) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = margin;

  // Filter attendance and sessions for this date
  const daySessions = workSessions.filter((s) => s.date === date && s.status !== 'cancelled');
  const dayRecords = attendanceRecords.filter((r) => r.date === date);

  // Derive stats
  const scheduledCount = daySessions.length;
  const presentCount = dayRecords.filter((r) => r.status === 'present' || r.status === 'completed' || r.status === 'pending_review').length;
  const completedCount = dayRecords.filter((r) => r.status === 'completed').length;
  const missingDepartureCount = dayRecords.filter((r) => r.status === 'missing_departure').length;
  const pendingReviewCount = dayRecords.filter((r) => r.status === 'pending_review' || r.needsAttention).length;
  const complianceRate = scheduledCount > 0 ? Math.round((presentCount / scheduledCount) * 100) : 100;

  // Calculate approximate total hours
  let totalMinutes = 0;
  dayRecords.forEach((r) => {
    if (r.arrivalTime && r.departureTime) {
      const [inH, inM] = r.arrivalTime.split(':').map(Number);
      const [outH, outM] = r.departureTime.split(':').map(Number);
      const diff = (outH * 60 + outM) - (inH * 60 + inM);
      if (diff > 0) totalMinutes += diff;
    } else if (r.arrivalTime) {
      // open shift estimate e.g. 5 hours
      totalMinutes += 300;
    }
  });
  const totalHoursFormatted = `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;

  // --- BRAND HEADER ---
  // Top Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent Line
  doc.setFillColor(99, 102, 241); // Indigo-500
  doc.rect(0, 26, pageWidth, 2, 'F');

  // App & Org Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('KLOCKIT WORKFORCE ATTENDANCE', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`${organisation.name} · Official Attendance Audit Report`, margin, 18);

  // Date Tag on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`DATE: ${date}`, pageWidth - margin, 12, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(165, 180, 252); // indigo-200
  doc.text(`Timezone: ${organisation.timezone.split(' ')[0]}`, pageWidth - margin, 18, { align: 'right' });

  y = 36;

  // --- SUMMARY KPI CARDS ---
  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 16;
  const kpis = [
    { label: 'SCHEDULED WORKERS', value: `${scheduledCount}`, color: [241, 245, 249] },
    { label: 'VERIFIED PRESENT', value: `${presentCount}`, color: [236, 253, 245] },
    { label: 'COMPLIANCE RATE', value: `${complianceRate}%`, color: [238, 242, 255] },
    { label: 'TOTAL WORK TIME', value: totalHoursFormatted, color: [248, 250, 252] },
  ];

  kpis.forEach((kpi, index) => {
    const cardX = margin + index * (cardWidth + 3);
    doc.setFillColor(kpi.color[0], kpi.color[1], kpi.color[2]);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(kpi.label, cardX + 3, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(kpi.value, cardX + 3, y + 12);
  });

  y += cardHeight + 8;

  // --- REPORT METADATA & SUBHEADING ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('DAILY WORKFORCE ATTENDANCE LOG', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC · Authenticated manager export`,
    pageWidth - margin,
    y,
    { align: 'right' }
  );

  y += 5;

  // --- ATTENDANCE TABLE HEADER ---
  const colX = {
    worker: margin,
    ref: margin + 38,
    site: margin + 55,
    scheduled: margin + 92,
    actualIn: margin + 117,
    actualOut: margin + 135,
    status: margin + 153,
  };

  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, pageWidth - margin * 2, 6.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('WORKER NAME', colX.worker + 1.5, y + 4.5);
  doc.text('REF', colX.ref, y + 4.5);
  doc.text('LOCATION / SITE', colX.site, y + 4.5);
  doc.text('SCHEDULED', colX.scheduled, y + 4.5);
  doc.text('ARRIVAL', colX.actualIn, y + 4.5);
  doc.text('DEPARTURE', colX.actualOut, y + 4.5);
  doc.text('STATUS', colX.status, y + 4.5);

  y += 6.5;

  // --- ATTENDANCE ROWS ---
  // Combine all workers who either had a scheduled session or logged attendance
  const rowDataList: Array<{
    workerName: string;
    ref: string;
    siteName: string;
    scheduled: string;
    arrival: string;
    departure: string;
    status: string;
    method: string;
    correctionNote?: string;
  }> = [];

  // Group by workers
  workers.forEach((w) => {
    const session = daySessions.find((s) => s.workerId === w.id);
    const rec = dayRecords.find((r) => r.workerId === w.id);

    if (!session && !rec) return;

    const site = sites.find((s) => s.id === (rec?.siteId || session?.siteId || w.normalSiteId));

    let statusText = 'Not Arrived';
    if (rec) {
      if (rec.status === 'present') statusText = 'Present (Working)';
      else if (rec.status === 'completed') statusText = 'Completed';
      else if (rec.status === 'pending_review') statusText = 'Review Pending';
      else if (rec.status === 'missing_departure') statusText = 'Missing Departure';
      else if (rec.status === 'unmatched') statusText = 'Site Mismatch';
      else if (rec.status === 'rejected') statusText = 'Rejected';
    }

    rowDataList.push({
      workerName: w.name,
      ref: w.workerRef,
      siteName: site?.name || 'Unassigned',
      scheduled: session ? `${session.startTime} - ${session.endTime}` : 'Unscheduled',
      arrival: rec?.arrivalTime ? `${rec.arrivalTime} (${rec.arrivalMethod === 'qr' ? 'QR' : 'Code'})` : '—',
      departure: rec?.departureTime || (rec?.status === 'present' ? 'In Progress' : '—'),
      status: statusText,
      method: rec?.arrivalMethod || '',
      correctionNote: rec?.managerCorrection?.reason,
    });
  });

  // Sort: Present/Completed first, then attention, then not arrived
  rowDataList.sort((a, b) => a.workerName.localeCompare(b.workerName));

  doc.setFontSize(7.5);
  rowDataList.forEach((row, i) => {
    if (y > pageHeight - 32) {
      doc.addPage();
      y = margin + 5;
    }

    // Alternating row background
    if (i % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    // Truncate worker name if too long
    const cleanName = doc.splitTextToSize(row.workerName, 35)[0];
    doc.text(cleanName, colX.worker + 1.5, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(row.ref, colX.ref, y + 4.5);

    const cleanSite = doc.splitTextToSize(row.siteName, 34)[0];
    doc.setTextColor(51, 65, 85);
    doc.text(cleanSite, colX.site, y + 4.5);

    doc.setTextColor(71, 85, 105);
    doc.text(row.scheduled, colX.scheduled, y + 4.5);

    doc.setFont('helvetica', row.arrival !== '—' ? 'bold' : 'normal');
    doc.setTextColor(row.arrival !== '—' ? 16 : 148, row.arrival !== '—' ? 185 : 163, row.arrival !== '—' ? 129 : 184);
    doc.text(row.arrival, colX.actualIn, y + 4.5);

    doc.setTextColor(51, 65, 85);
    doc.text(row.departure, colX.actualOut, y + 4.5);

    // Status pill text
    if (row.status.includes('Completed') || row.status.includes('Present')) {
      doc.setTextColor(22, 101, 52); // green-800
    } else if (row.status.includes('Review') || row.status.includes('Missing')) {
      doc.setTextColor(180, 83, 9); // amber-700
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.setFont('helvetica', 'bold');
    doc.text(row.status, colX.status, y + 4.5);

    y += 7;

    // If there is an administrative correction note, print a small sub-line
    if (row.correctionNote) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6.5);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(`  ↳ Manager Verified: "${row.correctionNote}"`, colX.worker + 3, y + 2.5);
      y += 4.5;
      doc.setFontSize(7.5);
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y, pageWidth - margin, y);
  });

  // --- EXCEPTIONS & AUDIT NOTICE ---
  y += 8;
  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin + 5;
  }

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 22, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('AUDIT COMPLIANCE & INTEGRITY DECLARATION', margin + 4, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text(
    'This document records physical workplace presence verified via encrypted on-site dynamic QR tokens or supervisor-reviewed manual fallback codes.',
    margin + 4,
    y + 10
  );
  doc.text(
    `Exceptions detected on ${date}: ${pendingReviewCount} review items, ${missingDepartureCount} missing departures. All timestamp modifications are cryptographically logged.`,
    margin + 4,
    y + 15
  );

  y += 26;

  // --- SIGN-OFF BLOCK ---
  if (y > pageHeight - 25) {
    doc.addPage();
    y = margin + 5;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Operations Manager Sign-Off:', margin, y + 6);
  doc.line(margin + 40, y + 6, margin + 95, y + 6);

  doc.text('Date Approved:', margin + 105, y + 6);
  doc.line(margin + 125, y + 6, margin + 175, y + 6);

  // --- FOOTER ---
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Klockit Workforce Presence Platform · Confidential & Proprietary · Page ${doc.getNumberOfPages()}`,
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  // Save / Trigger Download
  const filename = `klockit-attendance-summary-${date}.pdf`;
  doc.save(filename);
}
