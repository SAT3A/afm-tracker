"use client";

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
} from "lucide-react";
import { PersonaItem } from "@/app/actions/personas";

interface PersonaDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: PersonaItem | null;
  onEdit?: (persona: PersonaItem) => void;
}

export function PersonaDetailModal({
  open,
  onOpenChange,
  persona,
  onEdit,
}: PersonaDetailModalProps) {
  if (!persona) return null;

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
                className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/20 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {persona.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {persona.name}
                </DialogTitle>
                {persona.status === "active" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Nonaktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Persona Kreator Konten AI & Akun Sebar Link
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Activity Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Share2 className="w-4 h-4 text-purple-500" />
                Sebaran Link
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {persona.distributionsCount} Distribusi
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Posting & komentar di grup
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Video className="w-4 h-4 text-blue-500" />
                Konten Video AI
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {persona.contentsCount} Video
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Shopee Video & Reels
              </p>
            </div>
          </div>

          {/* Niches / Target Topik */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Niches & Topik Target
            </div>
            <div className="flex flex-wrap gap-1.5">
              {persona.niches.map((niche) => (
                <Badge
                  key={niche}
                  variant="secondary"
                  className="text-xs px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  #{niche}
                </Badge>
              ))}
            </div>
          </div>

          {/* Karakteristik & Tone of Voice */}
          {persona.description && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Karakteristik & Tone of Voice
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {persona.description}
              </p>
            </div>
          )}

          {/* Social Media Accounts */}
          {persona.platforms && Object.keys(persona.platforms).length > 0 && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Akun Media Sosial
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {persona.platforms.facebook && (
                  <div className="p-2 rounded-lg bg-background border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Facebook</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {persona.platforms.facebook}
                    </span>
                  </div>
                )}
                {persona.platforms.instagram && (
                  <div className="p-2 rounded-lg bg-background border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Instagram</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {persona.platforms.instagram}
                    </span>
                  </div>
                )}
                {persona.platforms.tiktok && (
                  <div className="p-2 rounded-lg bg-background border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">TikTok</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {persona.platforms.tiktok}
                    </span>
                  </div>
                )}
                {persona.platforms.threads && (
                  <div className="p-2 rounded-lg bg-background border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Threads</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {persona.platforms.threads}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Didaftarkan: {new Date(persona.createdAt).toLocaleDateString("id-ID")}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Diupdate: {new Date(persona.updatedAt).toLocaleDateString("id-ID")}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
                onEdit(persona);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit Persona
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
