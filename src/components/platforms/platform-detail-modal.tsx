"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updatePlatformStatus } from "@/app/actions/platforms";
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Calendar,
  FileText,
  Clock,
  Ban,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import { PlatformItem } from "./platform-table";

interface PlatformDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PlatformItem | null;
  onEdit?: (platform: PlatformItem) => void;
}

function formatDateTime(dateStr?: Date | string | null) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}`;
}

export function PlatformDetailModal({
  open,
  onOpenChange,
  platform,
  onEdit,
}: PlatformDetailModalProps) {
  const router = useRouter();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isUpdatingStatus, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(platform?.status || "active");

  useEffect(() => {
    if (platform) {
      setCurrentStatus(platform.status);
    }
  }, [platform]);

  if (!platform) return null;

  const handleStatusToggle = (newStatus: string) => {
    if (!platform.id) return;
    startTransition(async () => {
      const res = await updatePlatformStatus(platform.id, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        if (newStatus === "active") {
          toast.success("Platform berhasil diaktifkan");
        } else if (newStatus === "inactive") {
          toast.error("Platform dinonaktifkan");
        } else {
          toast.warning(`Status platform diubah ke ${newStatus}`);
        }
        router.refresh();
      } else {
        toast.error(res.message || "Gagal memperbarui status");
      }
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getPlatformTypeBadge = (type: string) => {
    switch (type) {
      case "facebook":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Facebook
          </span>
        );
      case "instagram":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
            Instagram
          </span>
        );
      case "threads":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
            Threads
          </span>
        );
      case "tiktok":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
            TikTok
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
            Lainnya
          </span>
        );
    }
  };

  const getPlatformStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Approval
          </span>
        );
      case "restricted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Restricted
          </span>
        );
      case "on_hiatus":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            On Hiatus
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Suspended
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            Non Active
          </span>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {getPlatformTypeBadge(platform.platformType)}
            {getPlatformStatusBadge(currentStatus)}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {platform.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {platform.requiresApproval ? (
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                )}
                Moderasi Postingan
              </div>
              <p className="text-sm font-bold text-foreground">
                {platform.requiresApproval
                  ? "Butuh Approval Admin"
                  : "Bebas Langsung Terbit"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {platform.requiresApproval
                  ? "Posting antri review moderator"
                  : "Tanpa antrean moderasi"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Share2 className="w-4 h-4 text-teal-500" />
                Total Sebaran & Posting
              </div>
              <p className="text-sm font-bold text-foreground">
                {platform.distributionsCount} Distribusi
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {platform.sharesCount ?? 0} Sebar Link · {platform.postsCount ?? 0} Posting
              </p>
            </div>
          </div>

          {/* URL Platform Card */}
          {platform.url ? (
            <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
              <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                URL Grup / Channel
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={platform.url}
                  className="flex-1 text-xs px-3 py-1.5 rounded-md border border-input bg-background text-foreground select-all outline-none"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(platform.url!)}
                  className="gap-1 text-xs h-8"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-teal-500" />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin
                    </>
                  )}
                </Button>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-xs h-8 px-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed border-border text-xs text-muted-foreground text-center">
              Belum ada URL link grup/channel yang dicantumkan.
            </div>
          )}

          {/* Rules & Notes */}
          {platform.notes && (
            <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Aturan & Catatan Grup
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {platform.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Didaftarkan: {formatDateTime(platform.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Diupdate: {formatDateTime(platform.updatedAt)}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between">
          {/* Tombol status di sebelah kiri */}
          {currentStatus === "inactive" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusToggle("active")}
              className="text-xs text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aktifkan Platform
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusToggle("inactive")}
              className="text-xs text-red-600 dark:text-red-400 border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/50 gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              Nonaktifkan Platform
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
            {onEdit && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onEdit({ ...platform, status: currentStatus });
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Platform
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
