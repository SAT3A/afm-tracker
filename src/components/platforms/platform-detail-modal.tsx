"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { PlatformItem } from "./platform-table";

interface PlatformDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PlatformItem | null;
  onEdit?: (platform: PlatformItem) => void;
}

export function PlatformDetailModal({
  open,
  onOpenChange,
  platform,
  onEdit,
}: PlatformDetailModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!platform) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const getPlatformTypeBadge = (type: string) => {
    switch (type) {
      case "facebook":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Lainnya
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
            <Badge
              variant="outline"
              className="text-[11px] font-normal text-slate-500"
            >
              {platform.category}
            </Badge>
            {platform.status === "active" ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Aktif
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Nonaktif
              </span>
            )}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {platform.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Quick Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                {platform.requiresApproval ? (
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                )}
                Moderasi Postingan
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {platform.requiresApproval
                  ? "Butuh Approval Admin"
                  : "Bebas Langsung Terbit"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {platform.requiresApproval
                  ? "Posting antri review moderator"
                  : "Tanpa antrean moderasi"}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Share2 className="w-4 h-4 text-purple-500" />
                Total Sebaran Link
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {platform.distributionsCount} Distribusi
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Riwayat post & comment
              </p>
            </div>
          </div>

          {/* URL Platform Card */}
          {platform.url ? (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                URL Grup / Channel
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={platform.url}
                  className="flex-1 text-xs px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-background text-slate-700 dark:text-slate-300 select-all"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(platform.url!)}
                  className="gap-1 text-xs h-8"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
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
                  className="inline-flex items-center justify-center gap-1 text-xs h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
              Belum ada URL link grup/channel yang dicantumkan.
            </div>
          )}

          {/* Rules & Notes */}
          {platform.notes && (
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Aturan & Catatan Grup
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                {platform.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Didaftarkan: {new Date(platform.createdAt).toLocaleDateString("id-ID")}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Diupdate: {new Date(platform.updatedAt).toLocaleDateString("id-ID")}
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
                onEdit(platform);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit Platform
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
