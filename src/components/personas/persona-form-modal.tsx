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
import { Badge } from "@/components/ui/badge";
import { createPersona, updatePersona, PersonaItem } from "@/app/actions/personas";
import { Loader2, Users2, Sparkles, X, Plus } from "lucide-react";

interface PersonaFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaToEdit?: PersonaItem | null;
  onSuccess?: () => void;
}

const POPULAR_NICHES = [
  "gym",
  "outfit",
  "parfum",
  "lifestyle cowok",
  "skincare",
  "beauty",
  "homeliving",
  "fashion cewek",
  "elektronik",
  "setup desk",
  "parenting",
  "makanan & snack",
];

export function PersonaFormModal({
  open,
  onOpenChange,
  personaToEdit,
  onSuccess,
}: PersonaFormModalProps) {
  const isEditing = Boolean(personaToEdit?.id);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(personaToEdit?.name || "");
  const [description, setDescription] = useState(personaToEdit?.description || "");
  const [avatarUrl, setAvatarUrl] = useState(personaToEdit?.avatarUrl || "");
  const [status, setStatus] = useState(personaToEdit?.status || "active");
  const [niches, setNiches] = useState<string[]>(personaToEdit?.niches || []);
  const [nicheInput, setNicheInput] = useState("");

  // Social account handles
  const [fbAccount, setFbAccount] = useState(
    personaToEdit?.platforms?.facebook || ""
  );
  const [igAccount, setIgAccount] = useState(
    personaToEdit?.platforms?.instagram || ""
  );
  const [tiktokAccount, setTiktokAccount] = useState(
    personaToEdit?.platforms?.tiktok || ""
  );
  const [threadsAccount, setThreadsAccount] = useState(
    personaToEdit?.platforms?.threads || ""
  );

  const addNiche = (nicheToAdd: string) => {
    const trimmed = nicheToAdd.trim().toLowerCase();
    if (trimmed && !niches.includes(trimmed)) {
      setNiches([...niches, trimmed]);
      setNicheInput("");
    }
  };

  const removeNiche = (nicheToRemove: string) => {
    setNiches(niches.filter((n) => n !== nicheToRemove));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (niches.length === 0) {
      setErrorMsg("Mohon masukkan minimal 1 niche / topik untuk persona ini.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("avatarUrl", avatarUrl);
    formData.append("status", status);
    formData.append("niches", niches.join(","));
    formData.append("fbAccount", fbAccount);
    formData.append("igAccount", igAccount);
    formData.append("tiktokAccount", tiktokAccount);
    formData.append("threadsAccount", threadsAccount);

    startTransition(async () => {
      try {
        let res;
        if (isEditing && personaToEdit?.id) {
          res = await updatePersona(personaToEdit.id, {}, formData);
        } else {
          res = await createPersona({}, formData);
        }

        if (res.success) {
          onOpenChange(false);
          if (onSuccess) onSuccess();
        } else {
          setErrorMsg(res.message || "Gagal menyimpan persona.");
        }
      } catch (err) {
        setErrorMsg("Terjadi kendala saat menyimpan persona.");
        console.error(err);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users2 className="w-5 h-5 text-blue-600" />
            {isEditing ? "Edit Akun Persona AI" : "Tambah Persona AI Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {isEditing
              ? "Perbarui profil, target niche, dan akun media sosial persona AI."
              : "Daftarkan persona AI baru untuk pembuatan konten video dan sebar link affiliate yang terarah."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Grid: Nama & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="personaName" className="text-xs font-semibold">
                Nama Persona <span className="text-red-500">*</span>
              </Label>
              <Input
                id="personaName"
                placeholder="Contoh: Bagas / Naya / Rian"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="personaStatus" className="text-xs font-semibold">
                Status Persona
              </Label>
              <select
                id="personaStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-background outline-none focus:border-blue-500"
              >
                <option value="active">Aktif (Bisa Buat Konten & Sebar)</option>
                <option value="inactive">Nonaktif (Istirahat)</option>
              </select>
            </div>
          </div>

          {/* Niches Multi-Tag Input */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">
              Niches & Topik Target <span className="text-red-500">*</span>
            </Label>

            {/* Selected Niches */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {niches.length === 0 ? (
                <span className="text-xs text-slate-400 italic">
                  Belum ada niche yang dipilih. Pilih dari opsi di bawah atau ketik manual.
                </span>
              ) : (
                niches.map((niche) => (
                  <Badge
                    key={niche}
                    variant="secondary"
                    className="gap-1 text-xs py-0.5 px-2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    #{niche}
                    <button
                      type="button"
                      onClick={() => removeNiche(niche)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>

            {/* Input Manual Niche */}
            <div className="flex gap-2">
              <Input
                placeholder="Ketik niche lain lalu klik Tambah / tekan Enter..."
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNiche(nicheInput);
                  }
                }}
                className="text-xs h-8"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addNiche(nicheInput)}
                className="text-xs h-8 gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah
              </Button>
            </div>

            {/* Quick Suggestions Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              <span className="text-[11px] text-slate-400 self-center mr-1">
                Saran:
              </span>
              {POPULAR_NICHES.filter((pn) => !niches.includes(pn)).map((pn) => (
                <button
                  type="button"
                  key={pn}
                  onClick={() => addNiche(pn)}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  +{pn}
                </button>
              ))}
            </div>
          </div>

          {/* Tone & Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Karakteristik & Tone of Voice (Opsional)
            </Label>
            <Textarea
              id="description"
              placeholder="Contoh: Cowok maskulin, nada bicara santai & to the point. Target audiens pria usia 18-30 tahun."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-xs resize-none"
            />
          </div>

          {/* Avatar URL */}
          <div className="space-y-1.5">
            <Label htmlFor="avatarUrl" className="text-xs font-semibold">
              URL Foto Profil Persona (Opsional)
            </Label>
            <Input
              id="avatarUrl"
              placeholder="https://images.unsplash.com/..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Social Accounts Section */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Akun Media Sosial Persona (Opsional)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">Facebook</span>
                <Input
                  placeholder="Nama Akun FB / Halaman"
                  value={fbAccount}
                  onChange={(e) => setFbAccount(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">Instagram</span>
                <Input
                  placeholder="@username.ig"
                  value={igAccount}
                  onChange={(e) => setIgAccount(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">TikTok</span>
                <Input
                  placeholder="@username.tiktok"
                  value={tiktokAccount}
                  onChange={(e) => setTiktokAccount(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-500">Threads</span>
                <Input
                  placeholder="@username.threads"
                  value={threadsAccount}
                  onChange={(e) => setThreadsAccount(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
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
                  {isEditing ? "Simpan Perubahan" : "Simpan Persona"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
