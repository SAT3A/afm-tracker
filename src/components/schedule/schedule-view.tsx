"use client";

import { useState } from "react";
import { NotificationManager } from "@/components/schedule/notification-manager";
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar";
import { ScheduleList } from "@/components/schedule/schedule-list";
import { ScheduleFormModal } from "@/components/schedule/schedule-form-modal";
import { ScheduleDetailModal, ScheduleDetailData } from "@/components/schedule/schedule-detail-modal";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List, Clock } from "lucide-react";
import Link from "next/link";

interface ScheduleViewProps {
  schedules: ScheduleDetailData[];
  personas: { id: string; name: string; niches: string[] }[];
  platforms: { id: string; name: string; platformType: string }[];
  products: { id: string; productName: string; brand: string }[];
}

export function ScheduleView({
  schedules,
  personas,
  platforms,
  products,
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleDetailData | null>(null);
  const [scheduleToEdit, setScheduleToEdit] = useState<ScheduleDetailData | null>(null);
  const [initialDate, setInitialDate] = useState<Date | null>(null);

  const handleOpenNew = (date?: Date) => {
    setScheduleToEdit(null);
    setInitialDate(date || new Date());
    setFormModalOpen(true);
  };

  const handleSelectSchedule = (schedule: ScheduleDetailData) => {
    setSelectedSchedule(schedule);
    setDetailModalOpen(true);
  };

  const handleEditSchedule = (schedule: ScheduleDetailData) => {
    setScheduleToEdit(schedule);
    setFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Browser Notification Reminder Bar */}
      <NotificationManager />

      {/* 2. Action & View Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Toggle Calendar vs List */}
        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "calendar"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Tampilan Kalender
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "list"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Tampilan Agenda ({schedules.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href="/best-time">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Cek Riset Waktu
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => handleOpenNew()}
            className="gap-1.5 text-xs font-bold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Buat Jadwal Baru
          </Button>
        </div>
      </div>

      {/* 3. Main View (Calendar or List) */}
      {viewMode === "calendar" ? (
        <ScheduleCalendar
          schedules={schedules}
          onSelectSchedule={handleSelectSchedule}
          onAddScheduleOnDate={(d) => handleOpenNew(d)}
        />
      ) : (
        <ScheduleList
          schedules={schedules}
          onSelectSchedule={handleSelectSchedule}
          personas={personas}
        />
      )}

      {/* 4. Form Modal (Create / Edit) */}
      <ScheduleFormModal
        open={formModalOpen}
        onOpenChange={setFormModalOpen}
        personas={personas}
        platforms={platforms}
        products={products}
        initialDate={initialDate}
        scheduleToEdit={scheduleToEdit}
      />

      {/* 5. Detail Modal */}
      <ScheduleDetailModal
        schedule={selectedSchedule}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEdit={handleEditSchedule}
      />
    </div>
  );
}
