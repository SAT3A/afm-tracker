"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createSchedule, updateSchedule } from "@/app/actions/schedules";
import { NICHE_BEST_TIMES, PLATFORM_BEST_TIMES } from "@/lib/constants/best-posting-times";
import { Calendar, Clock, Sparkles, Repeat, Loader2, Info } from "lucide-react";

interface PersonaItem {
  id: string;
  name: string;
  niches: string[];
}

interface PlatformItem {
  id: string;
  name: string;
  platformType: string;
}

interface ProductItem {
  id: string;
  productName: string;
  brand: string;
}

interface ScheduleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personas: PersonaItem[];
  platforms: PlatformItem[];
  products: ProductItem[];
  initialDate?: Date | null;
  scheduleToEdit?: {
    id: string;
    personaId?: string | null;
    title: string;
    scheduleType: string;
    recurrenceRule?: string | null;
    scheduledAt: Date;
    status: string;
    notes?: string | null;
  } | null;
}

export function ScheduleFormModal({
  open,
  onOpenChange,
  personas,
  platforms,
  products,
  initialDate,
  scheduleToEdit,
}: ScheduleFormModalProps) {
  const [isPending, startTransition] = useTransition();

  // Form states
  const [personaId, setPersonaId] = useState<string>("");
  const [platformId, setPlatformId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [scheduleType, setScheduleType] = useState<"one_time" | "recurring">("one_time");
  const [recurrenceRule, setRecurrenceRule] = useState<string>("weekly:tue,thu");
  const [dateStr, setDateStr] = useState<string>("");
  const [timeStr, setTimeStr] = useState<string>("19:00");
  const [campaign, setCampaign] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Populate form on edit or open
  useEffect(() => {
    if (scheduleToEdit) {
      setPersonaId(scheduleToEdit.personaId || "");
      setTitle(scheduleToEdit.title);
      setScheduleType((scheduleToEdit.scheduleType as "one_time" | "recurring") || "one_time");
      setRecurrenceRule(scheduleToEdit.recurrenceRule || "weekly:tue,thu");

      const schedDate = new Date(scheduleToEdit.scheduledAt);
      const yyyy = schedDate.getFullYear();
      const mm = String(schedDate.getMonth() + 1).padStart(2, "0");
      const dd = String(schedDate.getDate()).padStart(2, "0");
      setDateStr(`${yyyy}-${mm}-${dd}`);

      const hh = String(schedDate.getHours()).padStart(2, "0");
      const min = String(schedDate.getMinutes()).padStart(2, "0");
      setTimeStr(`${hh}:${min}`);

      // Try parsing metadata from notes if JSON
      if (scheduleToEdit.notes) {
        try {
          const parsed = JSON.parse(scheduleToEdit.notes);
          if (parsed && typeof parsed === "object") {
            setPlatformId(parsed.platformId || "");
            setProductId(parsed.productId || "");
            setCampaign(parsed.campaign || "");
            setNotes(parsed.customNotes || "");
          } else {
            setNotes(scheduleToEdit.notes);
          }
        } catch {
          setNotes(scheduleToEdit.notes);
        }
      } else {
        setNotes("");
      }
    } else {
      // New schedule default
      setTitle("");
      setPersonaId(personas[0]?.id || "");
      setPlatformId("");
      setProductId("");
      setScheduleType("one_time");
      setRecurrenceRule("weekly:tue,thu");
      setCampaign("");
      setNotes("");

      const baseDate = initialDate ? new Date(initialDate) : new Date();
      // default to tomorrow or today
      const yyyy = baseDate.getFullYear();
      const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
      const dd = String(baseDate.getDate()).padStart(2, "0");
      setDateStr(`${yyyy}-${mm}-${dd}`);
      setTimeStr("19:30");
    }
  }, [scheduleToEdit, initialDate, personas, open]);

  // Find selected persona & platform
  const selectedPersona = personas.find((p) => p.id === personaId);
  const selectedPlatform = platforms.find((pl) => pl.id === platformId);
  const selectedProduct = products.find((pr) => pr.id === productId);

  // Auto-generate title if empty
  const handleAutoTitle = () => {
    const pName = selectedPersona?.name || "Persona";
    const prodName = selectedProduct ? selectedProduct.productName : "Sebar Link";
    const platName = selectedPlatform ? `ke ${selectedPlatform.name}` : "";
    setTitle(`${pName} &bull; ${prodName} ${platName}`.trim());
  };

  // Get Suggested Times based on selected Persona's niches & platform
  const suggestedTimes: { label: string; time: string; dayIndex?: number }[] = [];
  if (selectedPersona) {
    for (const niche of NICHE_BEST_TIMES) {
      const match = selectedPersona.niches.some((n) =>
        niche.aliases.some((a) => n.toLowerCase().includes(a) || a.includes(n.toLowerCase()))
      );
      if (match) {
        for (const slot of niche.recommendedSlots) {
          suggestedTimes.push({
            label: `${niche.niche} (${slot.day})`,
            time: slot.time.split(" ")[0] || "19:00",
            dayIndex: slot.dayIndex,
          });
        }
      }
    }
  }

  if (selectedPlatform && PLATFORM_BEST_TIMES[selectedPlatform.platformType]) {
    const platTimes = PLATFORM_BEST_TIMES[selectedPlatform.platformType];
    for (const s of platTimes.slots.slice(0, 3)) {
      suggestedTimes.push({
        label: `${platTimes.name} (${s.day})`,
        time: `${String(s.startHour).padStart(2, "0")}:00`,
        dayIndex: s.dayIndex,
      });
    }
  }

  // Apply suggested time chip
  const applySuggestedSlot = (time: string, targetDayIndex?: number) => {
    setTimeStr(time);
    if (targetDayIndex !== undefined) {
      // calculate next date matching this dayIndex
      const current = dateStr ? new Date(dateStr) : new Date();
      const currentDay = current.getDay();
      let diff = targetDayIndex - currentDay;
      if (diff < 0) diff += 7;
      current.setDate(current.getDate() + diff);

      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, "0");
      const dd = String(current.getDate()).padStart(2, "0");
      setDateStr(`${yyyy}-${mm}-${dd}`);
    }
    toast.success(`Waktu disetel ke ${time}!`);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul jadwal posting wajib diisi!");
      return;
    }

    if (!dateStr || !timeStr) {
      toast.error("Tanggal dan jam posting wajib diisi!");
      return;
    }

    const scheduledAt = new Date(`${dateStr}T${timeStr}:00`);

    const formData = new FormData();
    formData.append("personaId", personaId);
    formData.append("title", title);
    formData.append("scheduleType", scheduleType);
    formData.append("recurrenceRule", scheduleType === "recurring" ? recurrenceRule : "");
    formData.append("scheduledAt", scheduledAt.toISOString());
    formData.append("notes", notes);
    formData.append("platformId", platformId);
    formData.append("platformName", selectedPlatform?.name || "");
    formData.append("productId", productId);
    formData.append("productName", selectedProduct?.productName || "");
    formData.append("campaign", campaign);

    startTransition(async () => {
      let res;
      if (scheduleToEdit) {
        res = await updateSchedule(scheduleToEdit.id, null, formData);
      } else {
        res = await createSchedule(null, formData);
      }

      if (res.success) {
        toast.success(res.message);
        onOpenChange(false);
      } else {
        toast.error(res.message || "Terjadi kesalahan saat menyimpan jadwal");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Calendar className="w-5 h-5 text-primary" />
            {scheduleToEdit ? "Edit Jadwal Posting" : "Buat Jadwal Posting Baru"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Persona & Platform Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Persona Pelaksana *</Label>
              <Select value={personaId} onValueChange={(val) => setPersonaId(val || "")}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Pilih Persona" />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.name} {p.niches.length > 0 ? `(${p.niches.slice(0, 2).join(", ")})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Grup / Platform Target</Label>
              <Select value={platformId} onValueChange={(val) => setPlatformId(val || "")}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Pilih Platform / Grup (Opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    -- Tanpa Platform Tertentu --
                  </SelectItem>
                  {platforms.map((pl) => (
                    <SelectItem key={pl.id} value={pl.id} className="text-xs">
                      [{pl.platformType.toUpperCase()}] {pl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Product & Campaign Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Produk Shopee Terkait</Label>
              <Select value={productId} onValueChange={(val) => setProductId(val || "")}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Pilih Produk (Opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    -- Tanpa Produk Khusus --
                  </SelectItem>
                  {products.map((pr) => (
                    <SelectItem key={pr.id} value={pr.id} className="text-xs">
                      {pr.productName} ({pr.brand})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Label Campaign</Label>
              <Input
                placeholder="Contoh: Promo 9.9 / Gajian Sale"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Schedule Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Judul Jadwal / Rencana Konten *</Label>
              <button
                type="button"
                onClick={handleAutoTitle}
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-500" /> Auto-generate Judul
              </button>
            </div>
            <Input
              placeholder="Contoh: Bagas &bull; Sebar Link Parfum ke Grup FB"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs font-medium"
              required
            />
          </div>

          {/* Schedule Type & Recurrence */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Repeat className="w-3.5 h-3.5 text-primary" />
                Tipe Pengulangan
              </Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleType("one_time")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    scheduleType === "one_time"
                      ? "bg-card text-foreground font-bold shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sekali Jalan
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleType("recurring")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    scheduleType === "recurring"
                      ? "bg-card text-foreground font-bold shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Berulang (Recurring)
                </button>
              </div>
            </div>

            {scheduleType === "recurring" && (
              <div className="pt-2 border-t border-border/80 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Pola Berulang:</Label>
                <Select value={recurrenceRule} onValueChange={(val) => setRecurrenceRule(val || "weekly:tue,thu")}>
                  <SelectTrigger className="text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily" className="text-xs">
                      Setiap Hari (Daily)
                    </SelectItem>
                    <SelectItem value="weekly:tue,thu" className="text-xs">
                      Setiap Selasa & Kamis (Prime FB & Niche Day)
                    </SelectItem>
                    <SelectItem value="weekly:mon,wed,fri" className="text-xs">
                      Setiap Senin, Rabu, & Jumat
                    </SelectItem>
                    <SelectItem value="weekly:sat,sun" className="text-xs">
                      Setiap Akhir Pekan (Sabtu & Minggu)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Date & Time Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Tanggal Pelaksanaan *
              </Label>
              <Input
                type="date"
                min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`}
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Jam Pelaksanaan (WIB) *
              </Label>
              <Input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="text-xs"
                required
              />
            </div>
          </div>

          {/* Suggested Times Chips from Best Posting Times Research */}
          {suggestedTimes.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Rekomendasi Riset Waktu Terbaik:
                </span>
                <span className="text-[10px] text-muted-foreground">Klik untuk terapkan</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestedTimes.slice(0, 5).map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applySuggestedSlot(s.time, s.dayIndex)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card hover:bg-card/80 border border-amber-500/30 text-[11px] font-medium text-foreground hover:scale-105 transition-all shadow-xs"
                  >
                    <span>{s.label}:</span>
                    <strong className="text-primary">{s.time}</strong>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Catatan / Rencana Detail</Label>
            <Textarea
              placeholder="Contoh: Fokus spill diskon 50%, taruh link di comment pertama..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs min-h-[70px]"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5 font-bold">
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {scheduleToEdit ? "Perbarui Jadwal" : "Simpan Jadwal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
