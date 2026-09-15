"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Share2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Users2,
  Package,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Edit2,
  ShieldAlert,
} from "lucide-react";
import { DistributionItemData } from "./distribution-table";
import {
  updateDistributionStatus,
  updateDistributionPostUrl,
} from "@/app/actions/distributions";
import { useRouter } from "next/navigation";

interface DistributionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distribution: DistributionItemData | null;
  onEdit?: (dist: DistributionItemData) => void;
}

export function DistributionDetailModal({
  open,
  onOpenChange,
  distribution,
  onEdit,
}: DistributionDetailModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [copiedProdId, setCopiedProdId] = useState<string | null>(null);
  const [copiedPostUrl, setCopiedPostUrl] = useState(false);

  // Quick edit Post URL state
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editUrlValue, setEditUrlValue] = useState("");

  if (!distribution) return null;

  const handleCopyLink = (pId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedProdId(pId);
    setTimeout(() => setCopiedProdId(null), 1800);
  };

  const handleCopyPostUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedPostUrl(true);
    setTimeout(() => setCopiedPostUrl(false), 1800);
  };

  const handleQuickStatusChange = (
    newStatus: "posted" | "pending_approval" | "approved" | "deleted" | "rejected"
  ) => {
    startTransition(async () => {
      await updateDistributionStatus(distribution.id, newStatus);
      router.refresh();
      onOpenChange(false);
    });
  };

  const handleSavePostUrl = () => {
    startTransition(async () => {
      await updateDistributionPostUrl(distribution.id, editUrlValue);
      setIsEditingUrl(false);
      router.refresh();
    });
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disetujui (Approved)
          </span>
        );
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            Menunggu Approval
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3.5 h-3.5" />
            Ditolak Moderator
          </span>
        );
      case "deleted":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
            Dihapus
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            Langsung Terbit (Posted)
          </span>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {statusBadge(distribution.status)}
            <Badge
              variant="outline"
              className="text-xs uppercase font-semibold text-muted-foreground"
            >
              {distribution.distributionType === "comment"
                ? "💬 Komentar"
                : "📝 Postingan"}
            </Badge>
            {distribution.campaign && (
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                {distribution.campaign}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Detail Distribusi Sebar Link
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Platform & Persona Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Platform Box */}
            <div className="p-3.5 rounded-xl border border-border bg-card/50 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium">
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  Target Grup / Channel
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-muted rounded text-foreground">
                  {distribution.platform.platformType}
                </span>
              </div>
              <p className="font-bold text-sm text-foreground">
                {distribution.platform.name}
              </p>
              {distribution.platform.url && (
                <a
                  href={distribution.platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline pt-0.5"
                >
                  Buka Halaman Grup <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Persona Box */}
            <div className="p-3.5 rounded-xl border border-border bg-card/50 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Users2 className="w-3.5 h-3.5 text-secondary" />
                Akun Persona AI
              </div>
              <p className="font-bold text-sm text-foreground">
                {distribution.persona.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Penyebar postingan / komentar
              </p>
            </div>
          </div>

          {/* Quick Status Action (when pending approval) */}
          {distribution.status === "pending_approval" && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Moderasi Grup: Menunggu Approval
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Apakah moderator grup sudah menyetujui postingan ini?
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickStatusChange("rejected")}
                  disabled={isPending}
                  className="text-xs h-7 text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  Ditolak
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleQuickStatusChange("approved")}
                  disabled={isPending}
                  className="text-xs h-7 bg-secondary hover:bg-secondary/90 text-white gap-1"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Tandai Disetujui
                </Button>
              </div>
            </div>
          )}

          {/* Post URL Section */}
          <div className="p-3.5 rounded-xl border border-border bg-card/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-primary" />
                Link Postingan / Komentar di Grup
              </span>
              {!isEditingUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setEditUrlValue(distribution.postUrl || "");
                    setIsEditingUrl(true);
                  }}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Link
                </button>
              )}
            </div>

            {isEditingUrl ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editUrlValue}
                  onChange={(e) => setEditUrlValue(e.target.value)}
                  placeholder="https://facebook.com/groups/.../posts/..."
                  className="text-xs h-8"
                />
                <Button
                  size="sm"
                  onClick={handleSavePostUrl}
                  disabled={isPending}
                  className="text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Simpan
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingUrl(false)}
                  className="text-xs h-8"
                >
                  Batal
                </Button>
              </div>
            ) : distribution.postUrl ? (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={distribution.postUrl}
                  className="flex-1 text-xs px-3 py-1.5 rounded-md border border-border bg-background text-foreground select-all"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyPostUrl(distribution.postUrl!)}
                  className="gap-1 text-xs h-8"
                >
                  {copiedPostUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-secondary" />
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
                  href={distribution.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 text-xs h-8 px-3 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Buka Post
                </a>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Belum ada URL postingan. Anda dapat menyimpannya nanti setelah posting di grup.
              </p>
            )}
          </div>

          {/* Products Included with 1-Click Shortlink Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                Daftar Produk yang Disebar ({distribution.items.length} Produk)
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Klik tombol &quot;Salin Link&quot; untuk langsung paste ke grup
              </span>
            </div>

            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden bg-card">
              {distribution.items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-foreground">
                      {item.product.productName}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>Brand: {item.product.brand}</span>
                      <span>&bull;</span>
                      <span>
                        Harga: Rp {item.product.price.toLocaleString("id-ID")}
                      </span>
                      <span>&bull;</span>
                      <span className="text-secondary font-semibold">
                        Komisi: {item.product.commissionRate}%
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Copy Affiliate Link */}
                  <Button
                    size="sm"
                    variant={
                      copiedProdId === item.product.id ? "default" : "outline"
                    }
                    onClick={() =>
                      handleCopyLink(
                        item.product.id,
                        item.product.affiliateLink
                      )
                    }
                    className={`gap-1.5 text-xs h-8 shrink-0 transition-all ${
                      copiedProdId === item.product.id
                        ? "bg-secondary hover:bg-secondary/90 text-white"
                        : "text-primary border-primary/30 hover:bg-primary/10"
                    }`}
                  >
                    {copiedProdId === item.product.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Salin Link Affiliate
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {distribution.notes && (
            <div className="p-3 rounded-xl border border-border bg-card/50 text-xs space-y-1">
              <span className="font-semibold text-foreground">
                Catatan:
              </span>
              <p className="text-muted-foreground">
                {distribution.notes}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Disebar pada:{" "}
              {new Date(distribution.postedAt).toLocaleString("id-ID")}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Dicatat:{" "}
              {new Date(distribution.createdAt).toLocaleDateString("id-ID")}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
                onEdit(distribution);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Edit Distribusi
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
