"use client";

import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updateScheduleStatus, deleteSchedule } from "@/app/actions/schedules";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share2,
  Trash2,
  Edit,
  Repeat,
  Package,
  Globe2,
  Users2,
  Loader2,
  Tag,
} from "lucide-react";
import Link from "next/link";

export interface ScheduleDetailData {
  id: string;
  personaId?: string | null;
  title: string;
  scheduleType: string;
  recurrenceRule?: string | null;
  scheduledAt: Date;
  status: string;
  notes?: string | null;
  persona?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
}

interface ScheduleDetailModalProps {
  schedule: ScheduleDetailData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (schedule: ScheduleDetailData) => void;
}

export function ScheduleDetailModal({
  schedule,
  open,
  onOpenChange,
  onEdit,
}: ScheduleDetailModalProps) {
  const [isPending, startTransition] = useTransition();

  if (!schedule) return null;

  // Parse structured metadata from notes
  let platformName = "";
  let productName = "";
  let campaign = "";
  let customNotes = schedule.notes || "";

  if (schedule.notes) {
    try {
      const parsed = JSON.parse(schedule.notes);
      if (parsed && typeof parsed === "object") {
        platformName = parsed.platformName || "";
        productName = parsed.productName || "";
        campaign = parsed.campaign || "";
        customNotes = parsed.customNotes || "";
      }
    } catch {
      customNotes = schedule.notes;
    }
  }

  const handleStatusChange = (status: "scheduled" | "reminded" | "posted" | "missed") => {
    startTransition(async () => {
      const res = await updateScheduleStatus(schedule.id, status);
      if (res.success) {
        toast.success(res.message);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Gagal mengubah status");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return;
    startTransition(async () => {
      const res = await deleteSchedule(schedule.id);
      if (res.success) {
        toast.success(res.message);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Gagal menghapus jadwal");
      }
    });
  };

  const scheduledDate = new Date(schedule.scheduledAt);
  const formattedDate = scheduledDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = scheduledDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Detail Jadwal Posting
            </DialogTitle>
            <Badge
              className={`text-[11px] font-semibold ${
                schedule.status === "posted"
                  ? "bg-emerald-500 text-white"
                  : schedule.status === "reminded"
                  ? "bg-amber-500 text-white"
                  : schedule.status === "missed"
                  ? "bg-rose-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {schedule.status === "posted"
                ? "Sudah Diposting"
                : schedule.status === "reminded"
                ? "Telah Diingatkan"
                : schedule.status === "missed"
                ? "Terlewat (Missed)"
                : "Terjadwal (Scheduled)"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Title Header */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1">
            <h3 className="text-sm font-extrabold text-foreground">{schedule.title}</h3>
            {campaign && (
              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                <Tag className="w-3 h-3" /> Campaign: {campaign}
              </span>
            )}
          </div>

          {/* Time & Recurrence Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Waktu Pelaksanaan
              </span>
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                {formattedTime} WIB
              </p>
              <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Tipe Jadwal
              </span>
              <p className="font-bold text-foreground flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-secondary" />
                {schedule.scheduleType === "recurring" ? "Berulang" : "Sekali Jalan"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {schedule.recurrenceRule || "Hanya pada tanggal ini"}
              </p>
            </div>
          </div>

          {/* Persona, Platform, Product Info */}
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-primary" /> Persona:
              </span>
              <strong className="text-foreground font-semibold">
                {schedule.persona?.name || "Semua Persona"}
              </strong>
            </div>

            {platformName && (
              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-primary" /> Target Grup / Platform:
                </span>
                <strong className="text-foreground font-semibold">{platformName}</strong>
              </div>
            )}

            {productName && (
              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-secondary" /> Produk Terkait:
                </span>
                <strong className="text-foreground font-semibold truncate max-w-[200px]">
                  {productName}
                </strong>
              </div>
            )}
          </div>

          {/* Notes */}
          {customNotes && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                Catatan
              </span>
              <p className="text-foreground whitespace-pre-line leading-relaxed">
                {customNotes}
              </p>
            </div>
          )}

          {/* Quick Actions to Change Status */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-muted-foreground">
              Ubah Status Jadwal:
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={schedule.status === "posted" ? "default" : "outline"}
                onClick={() => handleStatusChange("posted")}
                disabled={isPending}
                className="gap-1 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Tandai Sudah Diposting
              </Button>

              <Button
                type="button"
                size="sm"
                variant={schedule.status === "missed" ? "default" : "outline"}
                onClick={() => handleStatusChange("missed")}
                disabled={isPending}
                className="gap-1 text-xs"
              >
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                Tandai Terlewat
              </Button>

              <Button
                type="button"
                size="sm"
                variant={schedule.status === "scheduled" ? "default" : "outline"}
                onClick={() => handleStatusChange("scheduled")}
                disabled={isPending}
                className="gap-1 text-xs"
              >
                Kembalikan Terjadwal
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(schedule);
              }}
              className="gap-1.5 text-xs"
            >
              <Edit className="w-3.5 h-3.5" /> Edit
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="w-3.5 h-3.5" /> Hapus
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/distributions">
              <Button size="sm" variant="secondary" className="gap-1 text-xs">
                <Share2 className="w-3.5 h-3.5" /> Sebar Link Sekarang
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
