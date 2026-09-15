"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  Share2,
  Video,
  Tag,
  Calendar,
} from "lucide-react";
import { ProductData } from "./product-form-modal";

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product:
    | (ProductData & {
        distributionsCount?: number;
        contentsCount?: number;
        createdAt?: Date | string;
      })
    | null;
  onEdit: (product: ProductData) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailModal({
  open,
  onOpenChange,
  product,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleCopyLink = () => {
    if (!product.affiliateLink) return;
    navigator.clipboard.writeText(product.affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBadge = {
    active: { label: "Aktif", class: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800" },
    paused: { label: "Ditunda", class: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
    expired: { label: "Expired", class: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900" },
  }[product.status] || { label: product.status, class: "bg-muted text-muted-foreground" };

  const estimatedCommission = (product.price * product.commissionRate) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              {product.brand} &bull; {product.category}
            </span>
            <Badge variant="outline" className={`text-xs ${statusBadge.class}`}>
              {statusBadge.label}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold text-foreground mt-2 leading-snug">
            {product.productName}
          </DialogTitle>
          {product.variant && (
            <DialogDescription className="text-xs text-muted-foreground font-medium">
              Varian: {product.variant}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Link Affiliate Box */}
          <div className="p-3.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 space-y-2">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              Link Affiliate Shopee
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={product.affiliateLink}
                className="flex-1 text-xs font-mono bg-background border border-input rounded-lg px-3 py-2 text-primary select-all outline-none"
              />
              <Button
                size="sm"
                variant={copied ? "default" : "outline"}
                onClick={handleCopyLink}
                className="h-8 gap-1.5 text-xs shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal-500" />
                    Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Salin
                  </>
                )}
              </Button>
              <a
                href={product.affiliateLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Link di Tab Baru"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "h-8 px-2.5 shrink-0 inline-flex items-center justify-center"
                )}
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            </div>
            {product.originalLink && (
              <p className="text-[11px] text-muted-foreground truncate pt-1">
                Link Asli:{" "}
                <a
                  href={product.originalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-muted-foreground"
                >
                  {product.originalLink}
                </a>
              </p>
            )}
          </div>

          {/* Pricing & Commission Grid */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border text-center">
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Harga</p>
              <p className="text-base font-bold text-foreground mt-0.5">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="border-x border-border px-2">
              <p className="text-[11px] text-muted-foreground font-medium">Komisi (%)</p>
              <p className="text-base font-bold text-primary mt-0.5">
                {product.commissionRate}%
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">Est. Per Order</p>
              <p className="text-base font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                Rp {Math.round(estimatedCommission).toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          {/* Distribution & AI Content Statistics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Sebar di Grup</p>
                <p className="text-sm font-bold">
                  {product.distributionsCount ?? 0} kali disebar
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Konten Video AI</p>
                <p className="text-sm font-bold">
                  {product.contentsCount ?? 0} video terhubung
                </p>
              </div>
            </div>
          </div>

          {/* Campaign & Tags */}
          {(product.campaign || (product.tags && product.tags.length > 0)) && (
            <div className="space-y-2 pt-1">
              {product.campaign && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Campaign:</span>
                  <span className="font-semibold text-foreground">
                    {product.campaign}
                  </span>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="flex items-start gap-2 text-xs pt-1">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground mt-1 shrink-0" />
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {product.notes && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Catatan:
              </p>
              <p className="text-xs text-foreground whitespace-pre-line">
                {product.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (product.id && confirm("Yakin ingin menghapus produk ini?")) {
                onDelete(product.id);
                onOpenChange(false);
              }
            }}
            className="text-xs text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Hapus Produk
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Tutup
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(product);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Data
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
