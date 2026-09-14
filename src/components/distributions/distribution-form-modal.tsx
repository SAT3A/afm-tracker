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
import { Badge } from "@/components/ui/badge";
import {
  createSingleDistribution,
  createBatchDistribution,
  updateDistribution,
} from "@/app/actions/distributions";
import {
  Loader2,
  Share2,
  Layers,
  Sparkles,
  Package,
  Globe,
  Users2,
  Search,
  Check,
} from "lucide-react";
import { DistributionItemData } from "./distribution-table";

export interface SimpleProductOption {
  id: string;
  productName: string;
  brand: string;
  price: number;
  commissionRate: number;
}

export interface SimplePlatformOption {
  id: string;
  name: string;
  platformType: string;
  category: string;
  requiresApproval: boolean;
}

export interface SimplePersonaOption {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface DistributionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  distributionToEdit?: DistributionItemData | null;
  products: SimpleProductOption[];
  platforms: SimplePlatformOption[];
  personas: SimplePersonaOption[];
  onSuccess?: () => void;
}

export function DistributionFormModal({
  open,
  onOpenChange,
  distributionToEdit,
  products,
  platforms,
  personas,
  onSuccess,
}: DistributionFormModalProps) {
  const isEditing = Boolean(distributionToEdit?.id);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab mode: 'single' vs 'batch' (when creating)
  const [mode, setMode] = useState<"single" | "batch">("single");

  // Common Form States
  const [personaId, setPersonaId] = useState(
    distributionToEdit?.persona.id || personas[0]?.id || ""
  );
  const [distributionType, setDistributionType] = useState<"post" | "comment">(
    (distributionToEdit?.distributionType as "post" | "comment") || "comment"
  );
  const [campaign, setCampaign] = useState(
    distributionToEdit?.campaign || ""
  );
  const [notes, setNotes] = useState(distributionToEdit?.notes || "");

  // Single Mode specific
  const [platformId, setPlatformId] = useState(
    distributionToEdit?.platform.id || platforms[0]?.id || ""
  );
  const [postUrl, setPostUrl] = useState(distributionToEdit?.postUrl || "");
  const [status, setStatus] = useState(
    distributionToEdit?.status || "posted"
  );

  // Batch Mode specific: Selected Platforms
  const [batchPlatformIds, setBatchPlatformIds] = useState<string[]>([]);

  // Selected Products (multi-select for both single and batch)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    distributionToEdit?.items.map((i) => i.product.id) || []
  );

  // Product search filter in modal
  const [productSearch, setProductSearch] = useState("");
  const [platformSearch, setPlatformSearch] = useState("");

  const toggleProduct = (pId: string) => {
    if (selectedProductIds.includes(pId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== pId));
    } else {
      setSelectedProductIds([...selectedProductIds, pId]);
    }
  };

  const toggleBatchPlatform = (platId: string) => {
    if (batchPlatformIds.includes(platId)) {
      setBatchPlatformIds(batchPlatformIds.filter((id) => id !== platId));
    } else {
      setBatchPlatformIds([...batchPlatformIds, platId]);
    }
  };

  const selectAllPlatforms = () => {
    if (batchPlatformIds.length === platforms.length) {
      setBatchPlatformIds([]);
    } else {
      setBatchPlatformIds(platforms.map((p) => p.id));
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      productSearch.trim() === "" ||
      p.productName.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredPlatforms = platforms.filter(
    (p) =>
      platformSearch.trim() === "" ||
      p.name.toLowerCase().includes(platformSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(platformSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (selectedProductIds.length === 0) {
      setErrorMsg("Pilih minimal 1 produk yang disebar!");
      return;
    }

    if (mode === "single" || isEditing) {
      if (!platformId) {
        setErrorMsg("Pilih target grup/platform!");
        return;
      }
      if (!personaId) {
        setErrorMsg("Pilih persona!");
        return;
      }

      const formData = new FormData();
      formData.append("platformId", platformId);
      formData.append("personaId", personaId);
      formData.append("distributionType", distributionType);
      formData.append("postUrl", postUrl);
      formData.append("status", status);
      formData.append("campaign", campaign);
      formData.append("notes", notes);
      formData.append("productIds", selectedProductIds.join(","));

      startTransition(async () => {
        try {
          let res;
          if (isEditing && distributionToEdit?.id) {
            res = await updateDistribution(distributionToEdit.id, {}, formData);
          } else {
            res = await createSingleDistribution({}, formData);
          }

          if (res.success) {
            onOpenChange(false);
            if (onSuccess) onSuccess();
          } else {
            setErrorMsg(res.message || "Gagal menyimpan distribusi.");
          }
        } catch (err) {
          setErrorMsg("Terjadi kendala saat menyimpan data sebar link.");
          console.error(err);
        }
      });
    } else {
      // BATCH MODE
      if (batchPlatformIds.length === 0) {
        setErrorMsg("Pilih minimal 1 grup/platform target untuk batch sebar!");
        return;
      }
      if (!personaId) {
        setErrorMsg("Pilih persona!");
        return;
      }

      const formData = new FormData();
      formData.append("platformIds", batchPlatformIds.join(","));
      formData.append("productIds", selectedProductIds.join(","));
      formData.append("personaId", personaId);
      formData.append("distributionType", distributionType);
      formData.append("campaign", campaign);
      formData.append("notes", notes);

      startTransition(async () => {
        try {
          const res = await createBatchDistribution({}, formData);
          if (res.success) {
            onOpenChange(false);
            if (onSuccess) onSuccess();
          } else {
            setErrorMsg(res.message || "Gagal menyimpan batch distribusi.");
          }
        } catch (err) {
          setErrorMsg("Terjadi kesalahan sistem.");
          console.error(err);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="w-5 h-5 text-blue-600" />
            {isEditing
              ? "Edit Data Sebar Link"
              : mode === "single"
              ? "Catat Sebar Link (Single)"
              : "Batch Sebar Link (Multi-Grup)"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Perbarui detail tautan sebaran, produk terkait, atau status approval."
              : "Catat aktivitas distribusi affiliate ke grup Facebook atau media sosial."}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switch mode (Single vs Batch) when creating */}
        {!isEditing && (
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "single"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              Single Grup
            </button>
            <button
              type="button"
              onClick={() => setMode("batch")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                mode === "batch"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Batch Multi-Grup Sekaligus
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* 1. Pilih Persona & Tipe Sebar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Users2 className="w-3.5 h-3.5 text-blue-600" />
                Akun Persona AI <span className="text-red-500">*</span>
              </Label>
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                required
                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-background outline-none focus:border-blue-500 font-medium"
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
                Tipe Distribusi
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDistributionType("comment")}
                  className={`h-9 text-xs font-medium rounded-md border transition-colors ${
                    distributionType === "comment"
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  💬 Komentar Post
                </button>
                <button
                  type="button"
                  onClick={() => setDistributionType("post")}
                  className={`h-9 text-xs font-medium rounded-md border transition-colors ${
                    distributionType === "post"
                      ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  📝 Postingan Baru
                </button>
              </div>
            </div>
          </div>

          {/* 2. Target Platform (Single vs Batch) */}
          {mode === "single" || isEditing ? (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                Target Platform / Grup <span className="text-red-500">*</span>
              </Label>
              <select
                value={platformId}
                onChange={(e) => setPlatformId(e.target.value)}
                required
                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-background outline-none focus:border-blue-500 font-medium"
              >
                {platforms.map((plat) => (
                  <option key={plat.id} value={plat.id}>
                    [{plat.platformType.toUpperCase()}] {plat.name}{" "}
                    {plat.requiresApproval ? "⚠️ Butuh Approval" : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Batch Multi-Platform Selector */
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Pilih Grup Target ({batchPlatformIds.length} grup dipilih){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <button
                  type="button"
                  onClick={selectAllPlatforms}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {batchPlatformIds.length === platforms.length
                    ? "Batal Pilih Semua"
                    : "Pilih Semua Grup"}
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Cari grup..."
                  value={platformSearch}
                  onChange={(e) => setPlatformSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
                {filteredPlatforms.map((plat) => {
                  const isChecked = batchPlatformIds.includes(plat.id);
                  return (
                    <div
                      key={plat.id}
                      onClick={() => toggleBatchPlatform(plat.id)}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? "bg-blue-50/80 dark:bg-blue-950/40 font-medium"
                          : "hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isChecked
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="text-slate-800 dark:text-slate-200">
                          {plat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-mono px-1.5 py-0"
                        >
                          {plat.platformType}
                        </Badge>
                        {plat.requiresApproval && (
                          <span className="text-[10px] text-amber-500 font-medium">
                            Approval
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Multi-Select Produk yang Disebar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                Produk yang Disebar ({selectedProductIds.length} dipilih){" "}
                <span className="text-red-500">*</span>
              </Label>
              <span className="text-[11px] text-slate-400">
                1 sebaran bisa berisi multiple link produk
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Cari produk berdasarkan nama / brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
              {filteredProducts.map((prod) => {
                const isChecked = selectedProductIds.includes(prod.id);
                return (
                  <div
                    key={prod.id}
                    onClick={() => toggleProduct(prod.id)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                      isChecked
                        ? "bg-blue-50/80 dark:bg-blue-950/40 font-medium"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isChecked
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 dark:border-slate-700"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="text-slate-900 dark:text-slate-100">
                          {prod.productName}
                        </span>
                        <span className="text-slate-400 text-[11px] ml-1.5">
                          ({prod.brand})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {prod.commissionRate}%
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Rp {prod.price.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Single Mode: Post URL & Status */}
          {(mode === "single" || isEditing) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="postUrl" className="text-xs font-semibold">
                  URL Link Postingan / Komentar (Opsional)
                </Label>
                <Input
                  id="postUrl"
                  placeholder="https://facebook.com/groups/.../posts/..."
                  value={postUrl}
                  onChange={(e) => setPostUrl(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="statusSelect" className="text-xs font-semibold">
                  Status Publikasi
                </Label>
                <select
                  id="statusSelect"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-background outline-none focus:border-blue-500"
                >
                  <option value="posted">Langsung Terbit (Posted)</option>
                  <option value="pending_approval">
                    Menunggu Approval Admin
                  </option>
                  <option value="approved">Disetujui (Approved)</option>
                  <option value="rejected">Ditolak (Rejected)</option>
                  <option value="deleted">Dihapus (Deleted)</option>
                </select>
              </div>
            </div>
          )}

          {/* 5. Campaign & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="campaignInput" className="text-xs font-semibold">
                Nama Campaign / Label (Opsional)
              </Label>
              <Input
                id="campaignInput"
                placeholder="Contoh: Gajian Sale / 9.9 Super Deal"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notesInput" className="text-xs font-semibold">
                Catatan (Opsional)
              </Label>
              <Input
                id="notesInput"
                placeholder="Catatan tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
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
              className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {isEditing
                    ? "Simpan Perubahan"
                    : mode === "batch"
                    ? `Sebar ke ${batchPlatformIds.length} Grup Sekaligus`
                    : "Simpan Sebar Link"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
