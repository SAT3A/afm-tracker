"use client";

import { useState, useEffect, useTransition } from "react";
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
import {
  createContent,
  updateContent,
} from "@/app/actions/content";
import {
  Loader2,
  Video,
  Sparkles,
  Package,
  Users2,
  Search,
  Check,
} from "lucide-react";
import { ContentItemData } from "./content-detail-modal";
import { SimplePersonaOption, SimpleProductOption } from "../distributions/distribution-form-modal";

interface ContentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentToEdit?: ContentItemData | null;
  personas: SimplePersonaOption[];
  products: SimpleProductOption[];
  campaignOptions?: string[];
  onSuccess?: () => void;
}

export function ContentFormModal({
  open,
  onOpenChange,
  contentToEdit,
  personas,
  products,
  campaignOptions = [],
  onSuccess,
}: ContentFormModalProps) {
  const isEditing = Boolean(contentToEdit?.id);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [personaId, setPersonaId] = useState(
    contentToEdit?.personaId || personas[0]?.id || ""
  );
  const [title, setTitle] = useState(contentToEdit?.title || "");
  const [contentType, setContentType] = useState(
    contentToEdit?.contentType || "shopee_video"
  );
  const [platformUrl, setPlatformUrl] = useState(
    contentToEdit?.platformUrl || ""
  );
  const [campaign, setCampaign] = useState(contentToEdit?.campaign || "");
  const [notes, setNotes] = useState(contentToEdit?.notes || "");
  const [status, setStatus] = useState(contentToEdit?.status || "published");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    contentToEdit?.products.map((p) => p.product.id) || []
  );

  // Initial metrics (only for create)
  const [initialViews, setInitialViews] = useState("");
  const [initialLikes, setInitialLikes] = useState("");
  const [initialComments, setInitialComments] = useState("");
  const [initialClicks, setInitialClicks] = useState("");

  // Product search filter
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (open) {
      setPersonaId(contentToEdit?.personaId || personas[0]?.id || "");
      setTitle(contentToEdit?.title || "");
      setContentType(contentToEdit?.contentType || "shopee_video");
      setPlatformUrl(contentToEdit?.platformUrl || "");
      setCampaign(contentToEdit?.campaign || "");
      setNotes(contentToEdit?.notes || "");
      setStatus(contentToEdit?.status || "published");
      setSelectedProductIds(
        contentToEdit?.products.map((p) => p.product.id) || []
      );
      setInitialViews("");
      setInitialLikes("");
      setInitialComments("");
      setInitialClicks("");
      setProductSearch("");
      setErrorMsg(null);
    }
  }, [contentToEdit, open, personas]);

  const toggleProduct = (pId: string) => {
    if (selectedProductIds.includes(pId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== pId));
    } else {
      setSelectedProductIds([...selectedProductIds, pId]);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      productSearch.trim() === "" ||
      p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg("Judul video wajib diisi!");
      return;
    }
    if (!personaId) {
      setErrorMsg("Pilih persona kreator!");
      return;
    }

    const formData = new FormData();
    formData.append("personaId", personaId);
    formData.append("title", title);
    formData.append("contentType", contentType);
    formData.append("platformUrl", platformUrl);
    formData.append("campaign", campaign);
    formData.append("notes", notes);
    formData.append("status", status);
    formData.append("productIds", selectedProductIds.join(","));

    if (!isEditing) {
      formData.append("initialViews", initialViews || "0");
      formData.append("initialLikes", initialLikes || "0");
      formData.append("initialComments", initialComments || "0");
      formData.append("initialClicks", initialClicks || "0");
    }

    startTransition(async () => {
      try {
        let res;
        if (isEditing && contentToEdit?.id) {
          res = await updateContent(contentToEdit.id, {}, formData);
        } else {
          res = await createContent({}, formData);
        }

        if (res.success) {
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          setErrorMsg(res.message || "Gagal menyimpan konten video.");
        }
      } catch (err) {
        setErrorMsg("Terjadi kendala saat menyimpan konten video.");
        console.error(err);
      }
    });
  };

  const contentTypes = [
    { value: "shopee_video", label: "Shopee Video" },
    { value: "fb_reels", label: "FB Reels" },
    { value: "ig_reels", label: "IG Reels" },
    { value: "tiktok", label: "TikTok" },
    { value: "other", label: "Lainnya" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Video className="w-5 h-5 text-primary" />
            {isEditing ? "Edit Konten Video AI" : "Tambah Konten Video AI"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Perbarui informasi video, tautan platform, atau produk yang dipromosikan."
              : "Catat video yang dipublikasi di Shopee Video, FB Reels, IG Reels, atau TikTok."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {errorMsg && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {errorMsg}
            </div>
          )}

          {/* 1. Persona & Tipe Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-primary" />
                Akun Persona AI <span className="text-destructive">*</span>
              </Label>
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                required
                className="w-full h-9 px-3 text-xs rounded-md border border-border bg-background outline-none focus:border-primary font-medium"
              >
                {personas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                Format / Platform Video
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {contentTypes.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setContentType(t.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                      contentType === t.value
                        ? "bg-primary/10 border-primary text-primary font-semibold"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Judul & URL Platform */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="contentTitle" className="text-xs font-semibold">
                Judul Konten Video <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contentTitle"
                placeholder="Contoh: 3 Rekomendasi Serum Mencerahkan Wajah Pria"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="platformUrl" className="text-xs font-semibold">
                  Tautan Video (URL Platform)
                </Label>
                <Input
                  id="platformUrl"
                  placeholder="https://shopee.co.id/universal-link/sv/..."
                  value={platformUrl}
                  onChange={(e) => setPlatformUrl(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusSelect" className="text-xs font-semibold">
                  Status
                </Label>
                <select
                  id="statusSelect"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md border border-border bg-background outline-none focus:border-primary font-medium"
                >
                  <option value="published">Tayang (Published)</option>
                  <option value="draft">Draft / Rencana</option>
                  <option value="deleted">Dihapus (Deleted)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Multi-Select Produk yang Dipromosikan */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-primary" />
                Produk yang Dipromosikan ({selectedProductIds.length} dipilih)
              </Label>
              <span className="text-[11px] text-muted-foreground">
                Tautkan produk affiliate yang direview di video ini
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk berdasarkan nama / brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="max-h-40 overflow-y-auto rounded-lg border border-border divide-y divide-border/60 p-1">
              {filteredProducts.map((prod) => {
                const isChecked = selectedProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleProduct(prod.id)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                      isChecked
                        ? "bg-primary/10 font-medium"
                        : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="text-foreground">
                          {prod.productName}
                        </span>
                        <span className="text-muted-foreground text-[11px] ml-1.5">
                          ({prod.brand})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-secondary font-semibold">
                        {prod.commissionRate}%
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        Rp {prod.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Initial Metrics (only when adding new video) */}
          {!isEditing && (
            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Metrik Awal (Opsional - Bisa diisi sekarang atau nanti)
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Views, likes, atau link clicks saat ini
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Views</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialViews}
                    onChange={(e) => setInitialViews(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Likes</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialLikes}
                    onChange={(e) => setInitialLikes(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Comments</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialComments}
                    onChange={(e) => setInitialComments(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Clicks</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialClicks}
                    onChange={(e) => setInitialClicks(e.target.value)}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Campaign & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="campaignInput" className="text-xs font-semibold">
                Nama Campaign / Label
              </Label>
              <Input
                id="campaignInput"
                list="content-campaign-suggestions"
                placeholder="Contoh: Gajian Sale / 9.9 Super Deal"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="text-xs"
              />
              <datalist id="content-campaign-suggestions">
                {campaignOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notesInput" className="text-xs font-semibold">
                Catatan (Opsional)
              </Label>
              <Input
                id="notesInput"
                placeholder="Catatan script / angle video..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {isEditing ? "Simpan Perubahan" : "Simpan Konten Video"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
