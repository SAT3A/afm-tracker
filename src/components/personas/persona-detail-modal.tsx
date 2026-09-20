"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Video,
  Calendar,
  Clock,
  MessageSquare,
  Sparkles,
  PauseCircle,
  Loader2,
  Edit2,
} from "lucide-react";
import { PersonaItem, updatePersonaStatus } from "@/app/actions/personas";
import { toast } from "sonner";

interface PersonaDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: PersonaItem | null;
  onEdit?: (persona: PersonaItem) => void;
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

export function PersonaDetailModal({
  open,
  onOpenChange,
  persona,
  onEdit,
}: PersonaDetailModalProps) {
  const router = useRouter();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(persona?.status || "active");

  useEffect(() => {
    if (persona) {
      setCurrentStatus(persona.status);
    }
  }, [persona]);

  if (!persona) return null;

  const handleSetOnHiatus = async () => {
    if (!persona) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updatePersonaStatus(persona.id, "on_hiatus");
      if (res.success) {
        toast.success("Status persona berhasil diubah menjadi On Hiatus");
        setCurrentStatus("on_hiatus");
        router.refresh();
      } else {
        toast.error(res.message || "Gagal mengubah status persona");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kendala saat mengubah status persona");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 pt-1">
            {/* Persona Avatar */}
            {persona.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={persona.avatarUrl}
                alt={persona.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center shadow-md shadow-primary/20">
                {persona.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  {persona.name}
                </DialogTitle>
                {currentStatus === "active" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                    Aktif
                  </span>
                ) : currentStatus === "on_hiatus" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    On Hiatus
                  </span>
                ) : currentStatus === "deactive" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                    Deactive
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                    Nonaktif
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Persona Kreator Konten AI & Akun Sebar Link
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Activity Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-card/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Share2 className="w-4 h-4 text-secondary" />
                Sebaran Link
              </div>
              <p className="text-xl font-bold text-foreground">
                {persona.distributionsCount} Distribusi
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Posting & komentar di grup
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Video className="w-4 h-4 text-primary" />
                Konten Video AI
              </div>
              <p className="text-xl font-bold text-foreground">
                {persona.contentsCount} Video
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Shopee Video & Reels
              </p>
            </div>
          </div>

          {/* Niches / Target Topik */}
          <div className="p-3.5 rounded-xl border border-border bg-card/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Niches & Topik Target
            </div>
            <div className="flex flex-wrap gap-1.5">
              {persona.niches.map((niche) => (
                <Badge
                  key={niche}
                  variant="secondary"
                  className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20"
                >
                  #{niche}
                </Badge>
              ))}
            </div>
          </div>

          {/* Karakteristik & Tone of Voice */}
          {persona.description && (
            <div className="p-3.5 rounded-xl border border-border bg-card/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <MessageSquare className="w-3.5 h-3.5 text-accent" />
                Karakteristik & Tone of Voice
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {persona.description}
              </p>
            </div>
          )}

          {/* Social Media Accounts */}
          {persona.platforms && Object.keys(persona.platforms).length > 0 && (
            <div className="p-3.5 rounded-xl border border-border bg-card/50 space-y-2">
              <div className="text-xs font-semibold text-foreground">
                Akun Media Sosial
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {persona.platforms.facebook && (
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground block">Facebook</span>
                    <span className="font-semibold text-foreground">
                      {persona.platforms.facebook}
                    </span>
                  </div>
                )}
                {persona.platforms.instagram && (
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground block">Instagram</span>
                    <span className="font-semibold text-foreground">
                      {persona.platforms.instagram}
                    </span>
                  </div>
                )}
                {persona.platforms.tiktok && (
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground block">TikTok</span>
                    <span className="font-semibold text-foreground">
                      {persona.platforms.tiktok}
                    </span>
                  </div>
                )}
                {persona.platforms.threads && (
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <span className="text-[10px] text-muted-foreground block">Threads</span>
                    <span className="font-semibold text-foreground">
                      {persona.platforms.threads}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Didaftarkan: {formatDateTime(persona.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Diupdate: {formatDateTime(persona.updatedAt)}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          {/* Button di pojok kiri bawah: update status jadi On Hiatus */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUpdatingStatus || currentStatus === "on_hiatus"}
            onClick={handleSetOnHiatus}
            className="text-xs text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/50 gap-1.5"
          >
            {isUpdatingStatus ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <PauseCircle className="w-3.5 h-3.5" />
            )}
            {currentStatus === "on_hiatus" ? "Sedang On Hiatus" : "Jadikan On Hiatus"}
          </Button>

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
                  onEdit({ ...persona, status: currentStatus });
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Persona
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
