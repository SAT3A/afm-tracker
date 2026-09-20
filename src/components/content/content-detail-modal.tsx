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
import { Label } from "@/components/ui/label";
import {
  Video,
  ExternalLink,
  Copy,
  Check,
  Users2,
  Package,
  Calendar,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MousePointerClick,
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { addContentMetric, deleteContentMetric } from "@/app/actions/content";
import { useRouter } from "next/navigation";

export interface ContentItemData {
  id: string;
  personaId: string;
  title: string;
  contentType: string;
  platformUrl: string;
  campaign: string | null;
  publishedAt: Date | string;
  notes: string | null;
  status: string;
  createdAt: Date | string;
  persona: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  products: {
    id: string;
    product: {
      id: string;
      productName: string;
      brand: string;
      category: string;
      price: number;
      commissionRate: number;
      affiliateLink: string;
    };
  }[];
  latestMetric: {
    id: string;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    savesCount: number | null;
    clicksCount: number | null;
    capturedAt: Date | string;
  } | null;
  metricsHistory?: {
    id: string;
    viewsCount: number;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    savesCount: number | null;
    clicksCount: number | null;
    capturedAt: Date | string;
  }[];
}

interface ContentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: ContentItemData | null;
  onEdit?: (c: ContentItemData) => void;
}

export function ContentDetailModal({
  open,
  onOpenChange,
  content,
  onEdit,
}: ContentDetailModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [copiedProdId, setCopiedProdId] = useState<string | null>(null);
  const [showAddMetric, setShowAddMetric] = useState(false);

  // Metric form state
  const [viewsCount, setViewsCount] = useState("");
  const [likesCount, setLikesCount] = useState("");
  const [commentsCount, setCommentsCount] = useState("");
  const [sharesCount, setSharesCount] = useState("");
  const [savesCount, setSavesCount] = useState("");
  const [clicksCount, setClicksCount] = useState("");
  const [metricError, setMetricError] = useState<string | null>(null);

  if (!content) return null;

  const handleCopyLink = (pId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedProdId(pId);
    setTimeout(() => setCopiedProdId(null), 1800);
  };

  const handleAddMetricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMetricError(null);

    const formData = new FormData();
    formData.append("viewsCount", viewsCount || "0");
    formData.append("likesCount", likesCount || "0");
    formData.append("commentsCount", commentsCount || "0");
    formData.append("sharesCount", sharesCount || "0");
    if (savesCount) formData.append("savesCount", savesCount);
    if (clicksCount) formData.append("clicksCount", clicksCount);
    formData.append("capturedAt", new Date().toISOString());

    startTransition(async () => {
      const res = await addContentMetric(content.id, {}, formData);
      if (res.success) {
        setShowAddMetric(false);
        setViewsCount("");
        setLikesCount("");
        setCommentsCount("");
        setSharesCount("");
        setSavesCount("");
        setClicksCount("");
        router.refresh();
      } else {
        setMetricError(res.message || "Gagal menyimpan metrik.");
      }
    });
  };

  const handleDeleteMetric = (metricId: string) => {
    if (!confirm("Hapus catatan metrik ini?")) return;
    startTransition(async () => {
      await deleteContentMetric(metricId);
      router.refresh();
    });
  };

  const getContentTypeBadge = (type: string) => {
    switch (type) {
      case "shopee_video":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            Shopee Video
          </span>
        );
      case "fb_reels":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            FB Reels
          </span>
        );
      case "ig_reels":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
            IG Reels
          </span>
        );
      case "tiktok":
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            TikTok
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
            {type}
          </span>
        );
    }
  };

  const latest = content.latestMetric;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {getContentTypeBadge(content.contentType)}
            <Badge
              variant="outline"
              className="text-xs uppercase font-mono text-muted-foreground"
            >
              {content.status}
            </Badge>
            {content.campaign && (
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                {content.campaign}
              </Badge>
            )}
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Video className="w-5 h-5 text-primary shrink-0" />
            {content.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Creator & Link Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-card/50 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Users2 className="w-3.5 h-3.5 text-secondary" />
                Kreator Persona AI
              </div>
              <p className="font-bold text-sm text-foreground">
                {content.persona.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Pemeran / narator video
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card/50 space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Video className="w-3.5 h-3.5 text-primary" />
                Tautan Video di Platform
              </div>
              {content.platformUrl ? (
                <a
                  href={content.platformUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline pt-1 truncate max-w-full"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  Buka Konten Video
                </a>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Belum ada URL video
                </p>
              )}
            </div>
          </div>

          {/* KPI Metrics Highlight */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary" />
                Metrik Performa Video
              </h4>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAddMetric(!showAddMetric)}
                className="h-7 text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {showAddMetric ? "Tutup Form" : "Input Metrik Baru"}
              </Button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-center text-muted-foreground mb-1">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  {(latest?.viewsCount ?? 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-muted-foreground">Views</div>
              </div>

              <div className="p-2 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-center text-rose-500 mb-1">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  {(latest?.likesCount ?? 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-muted-foreground">Likes</div>
              </div>

              <div className="p-2 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-center text-blue-500 mb-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  {(latest?.commentsCount ?? 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-muted-foreground">Komentar</div>
              </div>

              <div className="p-2 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-center text-teal-500 mb-1">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  {(latest?.sharesCount ?? 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-muted-foreground">Shares</div>
              </div>

              <div className="p-2 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-center text-amber-500 mb-1">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  {(latest?.savesCount ?? 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-muted-foreground">Saves</div>
              </div>

              <div className="p-2 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-center text-primary mb-1">
                  <MousePointerClick className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  {(latest?.clicksCount ?? 0).toLocaleString("id-ID")}
                </div>
                <div className="text-[10px] text-muted-foreground">Clicks</div>
              </div>
            </div>

            {/* Input Metric Form */}
            {showAddMetric && (
              <form
                onSubmit={handleAddMetricSubmit}
                className="p-3 rounded-lg border border-border bg-card space-y-3 mt-2"
              >
                <div className="text-xs font-bold text-foreground">
                  Catat Metrik Baru (Misal Hari ke-1, Hari ke-3, Hari ke-7)
                </div>

                {metricError && (
                  <div className="p-2 text-xs bg-destructive/10 text-destructive rounded-md">
                    {metricError}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Jumlah Views</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={viewsCount}
                      onChange={(e) => setViewsCount(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Likes</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={likesCount}
                      onChange={(e) => setLikesCount(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Komentar</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={commentsCount}
                      onChange={(e) => setCommentsCount(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Shares</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={sharesCount}
                      onChange={(e) => setSharesCount(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Saves (Opsional)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={savesCount}
                      onChange={(e) => setSavesCount(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Link Clicks (Opsional)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={clicksCount}
                      onChange={(e) => setClicksCount(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddMetric(false)}
                    className="h-7 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                  >
                    {isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Check className="w-3 h-3" />
                    )}
                    Simpan Metrik
                  </Button>
                </div>
              </form>
            )}

            {/* Metrics History Table */}
            {content.metricsHistory && content.metricsHistory.length > 1 && (
              <div className="space-y-1 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Riwayat Metrik Terupdate:
                </span>
                <div className="max-h-28 overflow-y-auto rounded-md border border-border divide-y divide-border text-xs bg-card">
                  {content.metricsHistory.map((m) => (
                    <div
                      key={m.id}
                      className="p-2 flex items-center justify-between hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(m.capturedAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="font-medium">
                          {m.viewsCount.toLocaleString("id-ID")} views
                        </span>
                        <span>&bull;</span>
                        <span>{m.likesCount.toLocaleString("id-ID")} likes</span>
                        {m.clicksCount !== null && (
                          <>
                            <span>&bull;</span>
                            <span className="text-primary font-semibold">
                              {m.clicksCount} clicks
                            </span>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteMetric(m.id)}
                        className="text-muted-foreground hover:text-destructive p-1"
                        title="Hapus riwayat ini"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Promoted Products List with 1-Click Shortlink Copy */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                Produk yang Dipromosikan ({content.products.length} Produk)
              </h4>
              <span className="text-[11px] text-muted-foreground">
                Salin link affiliate untuk deskripsi/bio video
              </span>
            </div>

            <div className="rounded-xl border border-border divide-y divide-border overflow-hidden bg-card">
              {content.products.map((item) => (
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
                        Salin Link
                      </>
                    )}
                  </Button>
                </div>
              ))}

              {content.products.length === 0 && (
                <p className="p-3 text-xs text-muted-foreground italic text-center">
                  Belum ada produk yang dikaitkan ke video ini.
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          {content.notes && (
            <div className="p-3 rounded-xl border border-border bg-card/50 text-xs space-y-1">
              <span className="font-semibold text-foreground">Catatan:</span>
              <p className="text-muted-foreground">{content.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Dipublikasi:{" "}
              {new Date(content.publishedAt).toLocaleString("id-ID")}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Dibuat: {new Date(content.createdAt).toLocaleDateString("id-ID")}
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
                onEdit(content);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Edit Video
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
