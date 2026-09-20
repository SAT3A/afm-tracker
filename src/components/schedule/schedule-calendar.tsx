"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Repeat,
  Lock,
} from "lucide-react";
import { ScheduleDetailData } from "./schedule-detail-modal";

interface ScheduleCalendarProps {
  schedules: ScheduleDetailData[];
  onSelectSchedule: (schedule: ScheduleDetailData) => void;
  onAddScheduleOnDate: (date: Date) => void;
}

export function ScheduleCalendar({
  schedules,
  onSelectSchedule,
  onAddScheduleOnDate,
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month & total days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const dayHeaders = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar cells array (42 cells: 6 rows x 7 cols)
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNumber = prevMonthDays - i;
    const cellDate = new Date(year, month - 1, dayNumber);
    calendarCells.push({
      date: cellDate,
      dayNumber,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 2. Current month days
  const today = new Date();
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const isToday =
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
    calendarCells.push({
      date: cellDate,
      dayNumber: d,
      isCurrentMonth: true,
      isToday,
    });
  }

  // 3. Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length;
  for (let n = 1; n <= remainingCells; n++) {
    const cellDate = new Date(year, month + 1, n);
    calendarCells.push({
      date: cellDate,
      dayNumber: n,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Helper to get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    return schedules.filter((s) => {
      const sDate = new Date(s.scheduledAt);
      return (
        sDate.getFullYear() === date.getFullYear() &&
        sDate.getMonth() === date.getMonth() &&
        sDate.getDate() === date.getDate()
      );
    });
  };

  return (
    <Card className="border-border shadow-xs overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <CalendarIcon className="w-5 h-5" />
              </span>
              <CardTitle className="text-lg font-bold text-foreground">
                Kalender Jadwal Posting
              </CardTitle>
            </div>
            <CardDescription className="text-xs mt-1">
              Visualisasi jadwal sebar link affiliate dan konten video AI per tanggal
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="text-xs font-semibold h-8"
            >
              Hari Ini
            </Button>
            <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-7 w-7"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 text-xs font-bold text-foreground min-w-[120px] text-center">
                {monthNames[month]} {year}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-7 w-7"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground pb-2 border-b border-border">
          {dayHeaders.map((dh, idx) => (
            <div
              key={dh}
              className={idx === 0 || idx === 6 ? "text-rose-500/80" : ""}
            >
              {dh}
            </div>
          ))}
        </div>

        {/* 6x7 Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((cell, idx) => {
            const daySchedules = getSchedulesForDate(cell.date);

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            const cellDateStart = new Date(cell.date.getFullYear(), cell.date.getMonth(), cell.date.getDate()).getTime();
            const isPastDate = cellDateStart < todayStart;

            return (
              <div
                key={idx}
                onClick={() => {
                  if (!isPastDate) {
                    onAddScheduleOnDate(cell.date);
                  }
                }}
                className={`min-h-[105px] p-1.5 rounded-xl border transition-all flex flex-col justify-between group relative ${
                  isPastDate
                    ? "cursor-not-allowed opacity-50 bg-muted/40 border-border/60 select-none"
                    : cell.isCurrentMonth
                    ? cell.isToday
                      ? "bg-primary/5 border-primary/40 shadow-xs cursor-pointer"
                      : "bg-card hover:bg-muted/40 border-border cursor-pointer"
                    : "bg-muted/20 border-transparent text-muted-foreground/40 opacity-60 cursor-pointer"
                }`}
              >
                {/* Date header in cell */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      cell.isToday
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : cell.isCurrentMonth
                        ? isPastDate
                          ? "text-muted-foreground"
                          : "text-foreground"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Add icon on hover (only for today & future dates) */}
                  {isPastDate ? (
                    <span
                      className="p-0.5 text-muted-foreground/50 text-[10px] flex items-center gap-0.5"
                      title="Tanggal telah terlewat (terkunci)"
                    >
                      <Lock className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-md hover:bg-primary/10 text-primary">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Schedules list in cell */}
                <div className="space-y-1 my-1 flex-1 overflow-hidden">
                  {daySchedules.slice(0, 2).map((s) => {
                    const sTime = new Date(s.scheduledAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <div
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSchedule(s);
                        }}
                        className={`px-1.5 py-0.5 rounded-md text-[10px] truncate font-medium border flex items-center gap-1 transition-transform hover:scale-[1.02] cursor-pointer shadow-xs ${
                          s.status === "posted"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                            : s.status === "reminded"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
                            : s.status === "missed"
                            ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20"
                        }`}
                        title={`${s.title} (${sTime})`}
                      >
                        {s.scheduleType === "recurring" && (
                          <Repeat className="w-2.5 h-2.5 shrink-0" />
                        )}
                        <span className="font-bold shrink-0">{sTime}</span>
                        <span className="truncate">{s.title}</span>
                      </div>
                    );
                  })}

                  {daySchedules.length > 2 && (
                    <div className="text-[10px] text-muted-foreground font-semibold pl-1">
                      +{daySchedules.length - 2} lainnya
                    </div>
                  )}
                </div>

                {/* Subtle indicator if empty */}
                {daySchedules.length === 0 && (
                  <div className="h-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-muted-foreground font-medium">Status Jadwal:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[11px] text-muted-foreground">Terjadwal (Scheduled)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[11px] text-muted-foreground">Telah Diingatkan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-muted-foreground">Sudah Diposting</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[11px] text-muted-foreground">Terlewat (Missed)</span>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground">
            *Klik tanggal untuk membuat jadwal baru pada hari tersebut
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
