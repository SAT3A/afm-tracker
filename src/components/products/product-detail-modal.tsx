"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import { updateProductStatus } from "@/app/actions/products";
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
  Clock,
  Ban,
  CheckCircle2,
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
        updatedAt?: Date | string;
      })
    | null;
  onEdit: (product: ProductData) => void;
  onDelete: (id: string) => void;
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

export function ProductDetailModal({
  open,
  onOpenChange,
  product,
  onEdit,
  onDelete,
}: ProductDetailModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isUpdatingStatus, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(product?.status || "active");

  useEffect(() => {
    if (product) {
      setCurrentStatus(product.status);
    }
  }, [product]);

  if (!product) return null;

  const handleCopyLink = () => {
    if (!product.affiliateLink) return;
    navigator.clipboard.writeText(product.affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusToggle = (newStatus: "active" | "hold" | "non_active") => {
    if (!product.id) return;
    startTransition(async () => {
      const res = await updateProductStatus(product.id!, newStatus);
      if (res.success) {
        setCurrentStatus(newStatus);
        if (newStatus === "non_active") {
          toast.error("Produk dinonaktifkan");
        } else if (newStatus === "hold") {
          toast.warning(`Produk ${product.productName} berhasil di HOLD`);
        } else {
          toast.success("Produk diaktifkan");
        }
        router.refresh();
      } else {
        toast.error(res.message || "Gagal memperbarui status");
      }
    });
  };

  const statusBadge = {
    active: { label: "Active", dot: "bg-teal-500", class: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800" },
    hold: { label: "Hold", dot: "bg-amber-500", class: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
    paused: { label: "Hold", dot: "bg-amber-500", class: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
    non_active: { label: "Non Active", dot: "bg-red-500", class: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900" },
    expired: { label: "Non Active", dot: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900" },
  }[currentStatus] || { label: currentStatus, dot: "bg-muted-foreground", class: "bg-muted text-muted-foreground" };

  const estimatedCommission = (product.price * product.commissionRate) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border">
          <div className="flex items-center">
            <Badge variant="outline" className={`text-xs font-semibold gap-1.5 ${statusBadge.class}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} inline-block`} />
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

          {/* Timestamps */}
          {(product.createdAt || product.updatedAt) && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
              {product.createdAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Didaftarkan: {formatDateTime(product.createdAt)}
                </div>
              )}
              {product.updatedAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Diupdate: {formatDateTime(product.updatedAt)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          {/* Tombol status di sebelah kiri menggantikan tombol Hapus Produk */}
          {currentStatus === "non_active" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusToggle("active")}
              className="text-xs text-teal-600 dark:text-teal-400 border-teal-300 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950/50 gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Aktifkan Produk
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => handleStatusToggle("non_active")}
              className="text-xs text-red-600 dark:text-red-400 border-red-300 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/50 gap-1.5"
            >
              <Ban className="w-3.5 h-3.5" />
              Nonaktifkan Produk
            </Button>
          )}

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
                onEdit({ ...product, status: currentStatus });
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
