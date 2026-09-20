"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Loader2, Calculator, Sparkles } from "lucide-react";
import { toast } from "sonner";

export type ProductData = {
  id?: string;
  brand: string;
  category: string;
  productName: string;
  variant?: string | null;
  affiliateLink: string;
  originalLink?: string | null;
  price: number;
  commissionRate: number;
  tags?: string[];
  campaign?: string | null;
  notes?: string | null;
  status: "active" | "hold" | "non_active" | string;
};

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: ProductData | null;
  onSuccess?: () => void;
}

const CATEGORY_SUGGESTIONS = [
  "Skincare & Beauty",
  "Fashion Pria",
  "Fashion Wanita",
  "Gym & Fitness",
  "Parfum & Wewangian",
  "Home & Living",
  "Elektronik & Gadget",
  "Aksesoris",
];

export function ProductFormModal({
  open,
  onOpenChange,
  productToEdit,
  onSuccess,
}: ProductFormModalProps) {
  const isEditing = Boolean(productToEdit?.id);
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Form states for dynamic commission calculation
  const [price, setPrice] = useState<number>(productToEdit?.price || 0);
  const [commissionRate, setCommissionRate] = useState<number>(
    productToEdit?.commissionRate || 10
  );

  const estimatedCommission = (price * commissionRate) / 100;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setGlobalError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = isEditing && productToEdit?.id
        ? await updateProduct(productToEdit.id, undefined, formData)
        : await createProduct(undefined, formData);

      if (res.success) {
        onOpenChange(false);
        const prodName = (formData.get("productName") as string) || productToEdit?.productName || "Produk";
        const newStatus = formData.get("status");
        if (isEditing) {
          if (newStatus === "non_active") {
            toast.error("Data berhasil diperbarui");
          } else if (newStatus === "hold") {
            toast.warning(`Produk ${prodName} berhasil di HOLD`);
          } else {
            toast.success("Data berhasil diperbarui");
          }
        } else {
          if (newStatus === "non_active") {
            toast.error("Produk berhasil ditambahkan");
          } else if (newStatus === "hold") {
            toast.warning(`Produk ${prodName} berhasil di HOLD`);
          } else {
            toast.success("Produk berhasil ditambahkan");
          }
        }
        if (onSuccess) onSuccess();
      } else {
        if (res.errors) setErrors(res.errors);
        if (res.message) {
          setGlobalError(res.message);
          toast.error("Gagal menyimpan produk", {
            description: res.message,
          });
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-5 h-5 text-primary" />
            {isEditing ? "Edit Produk Affiliate" : "Tambah Produk Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Perbarui informasi produk dan link affiliate Shopee Anda."
              : "Masukkan data produk Shopee yang ingin Anda promosikan."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {globalError && (
            <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 font-medium border border-red-200 dark:border-red-900">
              {globalError}
            </div>
          )}

          {/* Row 1: Brand & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="brand" className="text-xs">
                Brand Produk <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand"
                name="brand"
                placeholder="misal: Somethinc, Skintific"
                defaultValue={productToEdit?.brand || ""}
                required
                className="h-9 text-sm"
              />
              {errors.brand && (
                <p className="text-[11px] text-red-500">{errors.brand[0]}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category" className="text-xs">
                Kategori <span className="text-red-500">*</span>
              </Label>
              <input
                id="category"
                name="category"
                list="category-options"
                placeholder="Pilih / ketik kategori"
                autoComplete="off"
                defaultValue={productToEdit?.category || ""}
                required
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              />
              <datalist id="category-options">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && (
                <p className="text-[11px] text-red-500">{errors.category[0]}</p>
              )}
            </div>
          </div>

          {/* Row 2: Nama Produk & Varian */}
          <div className="space-y-1.5">
            <Label htmlFor="productName" className="text-xs">
              Nama Produk Lengkap <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productName"
              name="productName"
              placeholder="misal: Somethinc 5% Niacinamide + Moisture Sabi Beet Serum"
              defaultValue={productToEdit?.productName || ""}
              required
              className="h-9 text-sm"
            />
            {errors.productName && (
              <p className="text-[11px] text-red-500">{errors.productName[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="variant" className="text-xs">
              Varian (Opsional)
            </Label>
            <Input
              id="variant"
              name="variant"
              placeholder="misal: 20ml, 50ml, Warna Hitam, Size L"
              defaultValue={productToEdit?.variant || ""}
              className="h-9 text-sm"
            />
          </div>

          {/* Row 3: Link Affiliate & Link Asli */}
          <div className="space-y-1.5">
            <Label htmlFor="affiliateLink" className="text-xs">
              Link Affiliate Shopee <span className="text-red-500">*</span>
            </Label>
            <Input
              id="affiliateLink"
              name="affiliateLink"
              placeholder="https://s.shopee.co.id/..."
              defaultValue={productToEdit?.affiliateLink || ""}
              required
              className="h-9 text-sm font-mono text-primary"
            />
            {errors.affiliateLink && (
              <p className="text-[11px] text-red-500">
                {errors.affiliateLink[0]}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="originalLink" className="text-xs">
              Link Asli Produk Shopee (Opsional)
            </Label>
            <Input
              id="originalLink"
              name="originalLink"
              placeholder="https://shopee.co.id/product/..."
              defaultValue={productToEdit?.originalLink || ""}
              className="h-9 text-sm font-mono text-muted-foreground"
            />
          </div>

          {/* Row 4: Harga & Komisi & Live Calculator */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-primary" />
                Harga & Perhitungan Komisi
              </span>
              <span className="text-primary font-bold">
                Est. Komisi: Rp {Math.round(estimatedCommission).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="price" className="text-[11px] text-muted-foreground">
                  Harga Produk (Rp)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="500"
                  placeholder="100000"
                  defaultValue={productToEdit?.price || ""}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  required
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="commissionRate"
                  className="text-[11px] text-muted-foreground"
                >
                  Komisi (%)
                </Label>
                <Input
                  id="commissionRate"
                  name="commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="10"
                  defaultValue={productToEdit?.commissionRate ?? 10}
                  onChange={(e) =>
                    setCommissionRate(Number(e.target.value) || 0)
                  }
                  required
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Campaign & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="campaign" className="text-xs">
                Campaign / Momen (Opsional)
              </Label>
              <Input
                id="campaign"
                name="campaign"
                placeholder="misal: Promo 9.9, Ramadan"
                defaultValue={productToEdit?.campaign || ""}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs">
                Status Produk
              </Label>
              <select
                id="status"
                name="status"
                defaultValue={productToEdit?.status || "active"}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
              >
                <option value="active">🟢 Active</option>
                <option value="hold">🟡 Hold</option>
                <option value="non_active">🔴 Non Active</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tags" className="text-xs">
              Tags / Label (Pisahkan dengan koma)
            </Label>
            <Input
              id="tags"
              name="tags"
              placeholder="misal: best seller, high commission, cowok, viral"
              defaultValue={productToEdit?.tags?.join(", ") || ""}
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">
              Catatan Khusus (Opsional)
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Catatan strategi promosi atau selling point produk..."
              defaultValue={productToEdit?.notes || ""}
              rows={2}
              className="text-sm"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Menyimpan...
                </>
              ) : isEditing ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Produk"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
