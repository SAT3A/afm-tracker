"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CampaignSummary } from "@/app/actions/campaigns";
import {
  Tag,
  Package,
  Share2,
  Video,
  ExternalLink,
  Eye,
  MousePointerClick,
  ShoppingBag,
  Coins,
} from "lucide-react";

interface CampaignDetailModalProps {
  campaign: CampaignSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignDetailModal({
  campaign,
  open,
  onOpenChange,
}: CampaignDetailModalProps) {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Detail Campaign: {campaign.name}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rincian seluruh produk, sebaran link, dan video terkait campaign ini
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
              {campaign.productCount} Produk &bull; {campaign.distributionCount} Sebaran
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2 text-xs">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-500" /> Total Views
              </span>
              <p className="text-base font-extrabold text-foreground">
                {campaign.totalViews.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MousePointerClick className="w-3 h-3 text-teal-500" /> Total Klik
              </span>
              <p className="text-base font-extrabold text-foreground">
                {campaign.totalClicks.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShoppingBag className="w-3 h-3 text-amber-500" /> Total Order
              </span>
              <p className="text-base font-extrabold text-foreground">
                {campaign.totalOrders.toLocaleString("id-ID")}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Coins className="w-3 h-3 text-emerald-500" /> Est. Komisi
              </span>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                Rp {Math.round(campaign.estimatedEarnings).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* 1. Products in Campaign */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary" />
              Produk Terkait ({campaign.products.length})
            </h4>

            {campaign.products.length === 0 ? (
              <p className="text-muted-foreground italic text-[11px]">
                Belum ada produk yang dilabeli dengan campaign ini.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {campaign.products.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-xl border border-border bg-muted/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{p.productName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.brand} &bull; Rp {p.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {p.commissionRate}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Distributions in Campaign */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-secondary" />
              Sebaran Link ({campaign.distributions.length})
            </h4>

            {campaign.distributions.length === 0 ? (
              <p className="text-muted-foreground italic text-[11px]">
                Belum ada rekaman sebar link untuk campaign ini.
              </p>
            ) : (
              <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                {campaign.distributions.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 flex items-center justify-between gap-3 text-[11px]"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-foreground">{d.platformName}</strong>
                        <span className="text-[9px] uppercase font-mono px-1 py-0 bg-muted text-muted-foreground rounded">
                          {d.platformType}
                        </span>
                        <span className="text-muted-foreground">oleh {d.personaName}</span>
                      </div>
                      <p className="text-muted-foreground text-[10px]">
                        {new Date(d.postedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        &bull; {d.clicks} klik &bull; {d.orders} order
                      </p>
                    </div>

                    {d.postUrl && (
                      <a
                        href={d.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline p-1 shrink-0"
                        title="Buka Postingan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Content in Campaign */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-accent" />
              Konten Video AI ({campaign.contents.length})
            </h4>

            {campaign.contents.length === 0 ? (
              <p className="text-muted-foreground italic text-[11px]">
                Belum ada konten video untuk campaign ini.
              </p>
            ) : (
              <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                {campaign.contents.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 flex items-center justify-between gap-3 text-[11px]"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-foreground truncate">{c.title}</strong>
                        <span className="text-[9px] uppercase font-mono px-1 py-0 bg-muted text-muted-foreground rounded">
                          {c.contentType}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[10px]">
                        Kreator: {c.personaName} &bull; {c.views} views &bull; {c.clicks} klik
                      </p>
                    </div>

                    {c.platformUrl && (
                      <a
                        href={c.platformUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline p-1 shrink-0"
                        title="Buka Video"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
