import React, { useState, useMemo } from 'react';
import { useKlockit } from '../../context/KlockitContext';
import { generate30DayHistoricalAttendance } from '../../data/mockData';
import {
  Calendar,
  Building2,
  TrendingUp,
  Activity,
  Info,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface DayOccupancy {
  date: string;
  dayName: string;
  dayOfMonth: number;
  monthName: string;
  presentCount: number;
  capacityRate: number; // 0 to 100
  isWeekend: boolean;
  bySite: Record<string, number>;
}

export const AttendanceHeatmapWidget: React.FC = () => {
  const { sites, attendance, workers } = useKlockit();

  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [hoveredDay, setHoveredDay] = useState<DayOccupancy | null>(null);

  // Generate and memoize 30-day occupancy data
  const heatmapData: DayOccupancy[] = useMemo(() => {
    // Generate 30 days base history
    const baseHistory = generate30DayHistoricalAttendance();
    // Merge with any newer context attendance records
    const allRecords = [...baseHistory, ...attendance];

    // Build array of past 30 days up to 2026-09-14
    const days: DayOccupancy[] = [];
    const baseDate = new Date('2026-09-14T12:00:00Z');

    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Filter records for this date and optionally by site
      const recordsForDay = allRecords.filter((r) => {
        if (r.date !== dateStr) return false;
        if (selectedSite !== 'all' && r.siteId !== selectedSite) return false;
        return r.status === 'present' || r.status === 'completed';
      });

      // Count unique workers present
      const uniqueWorkers = new Set(recordsForDay.map((r) => r.workerId));
      const presentCount = uniqueWorkers.size;

      // Calculate max capacity for baseline
      const totalCapacity =
        selectedSite === 'all'
          ? sites.reduce((sum, s) => sum + (s.normalWorkerCount || 3), 0)
          : sites.find((s) => s.id === selectedSite)?.normalWorkerCount || 3;

      const rate = totalCapacity > 0 ? Math.min(100, Math.round((presentCount / totalCapacity) * 100)) : 0;

      // Break down by site
      const bySite: Record<string, number> = {};
      sites.forEach((s) => {
        const count = recordsForDay.filter((r) => r.siteId === s.id).length;
        bySite[s.name] = count;
      });

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      days.push({
        date: dateStr,
        dayName: dayNames[dayOfWeek],
        dayOfMonth: d.getDate(),
        monthName: monthNames[d.getMonth()],
        presentCount,
        capacityRate: rate,
        isWeekend,
        bySite,
      });
    }

    return days;
  }, [attendance, sites, selectedSite]);

  // Summary Metrics
  const avgOccupancy = useMemo(() => {
    const weekdayItems = heatmapData.filter((d) => !d.isWeekend);
    if (weekdayItems.length === 0) return 0;
    const sum = weekdayItems.reduce((acc, d) => acc + d.capacityRate, 0);
    return Math.round(sum / weekdayItems.length);
  }, [heatmapData]);

  const peakDay = useMemo(() => {
    return [...heatmapData].sort((a, b) => b.presentCount - a.presentCount)[0];
  }, [heatmapData]);

  // Color mapper based on capacity rate
  const getCellColor = (rate: number, isWeekend: boolean) => {
    if (isWeekend && rate === 0) return 'bg-slate-100 border-slate-200/60 text-slate-400';
    if (rate === 0) return 'bg-slate-100 border-slate-200 text-slate-400';
    if (rate < 35) return 'bg-emerald-100 border-emerald-200 text-emerald-800';
    if (rate < 70) return 'bg-emerald-300 border-emerald-400 text-emerald-950 font-bold';
    if (rate < 90) return 'bg-emerald-500 border-emerald-600 text-white font-bold';
    return 'bg-emerald-700 border-emerald-800 text-white font-black';
  };

  return (
    <div id="attendance-heatmap-widget" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-900 tracking-tight">
                30-Day Site Occupancy Density
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Heatmap
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Visualizing daily on-site presence density across working facilities over the trailing 30 days.
            </p>
          </div>
        </div>

        {/* Site Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <select
            id="heatmap-site-select"
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Facilities Combined</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Average Occupancy
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-slate-900">{avgOccupancy}%</span>
            <span className="text-[10px] text-emerald-600 font-bold">Weekdays</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Peak Presence Day
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-slate-900">
              {peakDay ? `${peakDay.dayName} ${peakDay.dayOfMonth} ${peakDay.monthName}` : 'Wednesdays'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Total Shifts Verified
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-slate-900">
              {heatmapData.reduce((acc, d) => acc + d.presentCount, 0)}
            </span>
            <span className="text-[10px] text-slate-400">records</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Coverage Health
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-emerald-600">96.4%</span>
            <span className="text-[10px] text-slate-400">consistent</span>
          </div>
        </div>
      </div>

      {/* 30-Day Heatmap Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">Trailing 30-Day Activity Calendar:</span>
          <span>Aug 16 – Sep 14, 2026 (Today)</span>
        </div>

        {/* Heatmap Cell Matrix */}
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
          {heatmapData.map((day) => {
            const isToday = day.date === '2026-09-14';
            const cellColor = getCellColor(day.capacityRate, day.isWeekend);

            return (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay((curr) => (curr?.date === day.date ? null : curr))}
                className={`relative group rounded-xl p-2 border flex flex-col items-center justify-between h-18 transition-all cursor-pointer hover:scale-105 hover:z-10 shadow-2xs ${cellColor} ${
                  isToday ? 'ring-2 ring-indigo-600 ring-offset-1 font-black' : ''
                }`}
              >
                <div className="flex items-center justify-between w-full text-[9px] opacity-80">
                  <span>{day.dayName}</span>
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                </div>

                <span className="text-sm font-black">{day.dayOfMonth}</span>

                <span className="text-[10px] font-mono">
                  {day.presentCount}w
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap Legend & Hover Detail Bar */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Hovered Day Inspection Details */}
        <div className="min-h-[22px] flex items-center gap-2">
          {hoveredDay ? (
            <div className="flex items-center gap-2 text-slate-800 animate-in fade-in duration-100">
              <span className="font-bold text-slate-900">
                {hoveredDay.dayName}, {hoveredDay.dayOfMonth} {hoveredDay.monthName} {hoveredDay.date.split('-')[0]}:
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                {hoveredDay.presentCount} Workers ({hoveredDay.capacityRate}% Density)
              </span>
              <span className="text-slate-500 text-[11px] hidden md:inline">
                ({Object.entries(hoveredDay.bySite)
                  .map(([sName, cnt]) => `${sName}: ${cnt}`)
                  .join(' · ')})
              </span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px] italic">
              Hover over any cell to inspect facility presence counts and staffing density.
            </span>
          )}
        </div>

        {/* Legend Scale */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 self-end sm:self-auto font-medium">
          <span>Low</span>
          <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200"></span>
          <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-200"></span>
          <span className="w-3.5 h-3.5 rounded bg-emerald-300 border border-emerald-400"></span>
          <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600"></span>
          <span className="w-3.5 h-3.5 rounded bg-emerald-700 border border-emerald-800"></span>
          <span>High Density (85%+)</span>
        </div>
      </div>
    </div>
  );
};
