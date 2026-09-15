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
import { createPlatform, updatePlatform } from "@/app/actions/platforms";
import { Loader2, Globe, ShieldAlert, Sparkles } from "lucide-react";

export type PlatformData = {
  id?: string;
  name: string;
  platformType: string;
  url?: string | null;
  category: string;
  requiresApproval: boolean;
  notes?: string | null;
  status: string;
};

interface PlatformFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platformToEdit?: PlatformData | null;
  onSuccess?: () => void;
}

const CATEGORY_SUGGESTIONS = [
  "Sebar link shopee affiliate",
  "Komunitas Belanja & Diskon",
  "Fashion & OOTD",
  "Skincare & Kecantikan",
  "Racun Belanja Shopee",
  "Elektronik & Setup Desk",
  "Lifestyle & Gym",
  "Home & Living / Dekorasi",
];

const PLATFORM_TYPES = [
  { value: "facebook", label: "Facebook (Grup / Halaman)" },
  { value: "instagram", label: "Instagram (Akun / Komentar)" },
  { value: "threads", label: "Threads" },
  { value: "tiktok", label: "TikTok" },
  { value: "other", label: "Lainnya / Channel Telegram" },
];

export function PlatformFormModal({
  open,
  onOpenChange,
  platformToEdit,
  onSuccess,
}: PlatformFormModalProps) {
  const isEditing = Boolean(platformToEdit?.id);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(platformToEdit?.name || "");
  const [platformType, setPlatformType] = useState<PlatformData["platformType"]>(
    platformToEdit?.platformType || "facebook"
  );
  const [url, setUrl] = useState(platformToEdit?.url || "");
  const [category, setCategory] = useState(
    platformToEdit?.category || "Sebar link shopee affiliate"
  );
  const [requiresApproval, setRequiresApproval] = useState(
    platformToEdit?.requiresApproval ?? false
  );
  const [status, setStatus] = useState<PlatformData["status"]>(
    platformToEdit?.status || "active"
  );
  const [notes, setNotes] = useState(platformToEdit?.notes || "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("platformType", platformType);
    formData.append("url", url);
    formData.append("category", category);
    formData.append("requiresApproval", requiresApproval ? "true" : "false");
    formData.append("status", status);
    formData.append("notes", notes);

    startTransition(async () => {
      try {
        let res;
        if (isEditing && platformToEdit?.id) {
          res = await updatePlatform(platformToEdit.id, {}, formData);
        } else {
          res = await createPlatform({}, formData);
        }

        if (res.success) {
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          setErrorMsg(res.message || "Terjadi kesalahan.");
        }
      } catch (err) {
        setErrorMsg("Gagal menyimpan data platform. Coba lagi.");
        console.error(err);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            {isEditing ? "Edit Platform / Grup" : "Tambah Platform / Grup Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Perbarui informasi grup, status approval, dan aturan sebar link."
              : "Daftarkan grup Facebook, akun media sosial, atau channel untuk target distribusi sebar link affiliate."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
              {errorMsg}
            </div>
          )}

          {/* Nama Platform / Grup */}
          <div className="space-y-1.5">
            <Label htmlFor="platformName" className="text-xs font-semibold">
              Nama Platform / Grup <span className="text-destructive">*</span>
            </Label>
            <Input
              id="platformName"
              placeholder="Contoh: Racun Shopee OOTD Cowok / Komunitas Skincare"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="text-xs"
            />
          </div>

          {/* Grid: Platform Type & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="platformType" className="text-xs font-semibold">
                Tipe Platform
              </Label>
              <select
                id="platformType"
                value={platformType}
                onChange={(e) =>
                  setPlatformType(e.target.value as PlatformData["platformType"])
                }
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                {PLATFORM_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="platformStatus" className="text-xs font-semibold">
                Status Platform
              </Label>
              <select
                id="platformStatus"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as PlatformData["status"])
                }
                className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring"
              >
                <option value="active">Aktif (Bisa Disebar)</option>
                <option value="inactive">Nonaktif (Jangan Disebar)</option>
              </select>
            </div>
          </div>

          {/* URL Platform / Grup */}
          <div className="space-y-1.5">
            <Label htmlFor="platformUrl" className="text-xs font-semibold">
              URL Link Grup / Channel (Opsional)
            </Label>
            <Input
              id="platformUrl"
              type="url"
              placeholder="https://facebook.com/groups/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Link ini akan memudahkan Anda membuka grup dengan 1 kali klik saat sebar link.
            </p>
          </div>

          {/* Kategori Grup & Suggestion Pills */}
          <div className="space-y-1.5">
            <Label htmlFor="platformCategory" className="text-xs font-semibold">
              Kategori Platform / Grup <span className="text-destructive">*</span>
            </Label>
            <Input
              id="platformCategory"
              placeholder="Kategori grup target..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="text-xs"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                    category === cat
                      ? "bg-primary/10 text-primary border-primary/30 font-medium"
                      : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Requires Approval Setting */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <Label
                  htmlFor="requiresApprovalToggle"
                  className="text-xs font-semibold cursor-pointer"
                >
                  Butuh Persetujuan (Approval) Admin Grup?
                </Label>
              </div>
              <input
                type="checkbox"
                id="requiresApprovalToggle"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="w-4 h-4 rounded accent-primary border-input cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-muted-foreground pl-6">
              Centang jika setiap postingan atau komentar baru di grup ini harus disetujui moderator terlebih dahulu sebelum muncul ke publik.
            </p>
          </div>

          {/* Catatan / Aturan Grup */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Catatan & Peraturan Grup (Opsional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Contoh: Dilarang sebar link di caption utama (hanya boleh di komentar). Maksimal 2x post/hari."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-xs resize-none"
            />
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
                  {isEditing ? "Simpan Perubahan" : "Simpan Platform"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
