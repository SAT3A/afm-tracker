"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, RotateCcw, Calendar, Globe2, Package, Users2, Layers, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OptionItem {
  id: string;
  name: string;
}

interface GlobalAnalyticsFilterProps {
  platformTypes: string[];
  channels: OptionItem[];
  products: OptionItem[];
  personas: OptionItem[];
}

export function GlobalAnalyticsFilter({
  platformTypes,
  channels,
  products,
  personas,
}: GlobalAnalyticsFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedRange = searchParams.get("range") || "14d";
  const selectedPlatform = searchParams.get("platform") || "all";
  const selectedChannel = searchParams.get("channel") || "all";
  const selectedProduct = searchParams.get("product") || "all";
  const selectedPersona = searchParams.get("persona") || "all";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || (key === "range" && value === "14d")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // If platform changes, reset channel if it doesn't match
    if (key === "platform") {
      params.delete("channel");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const resetAllFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters =
    selectedRange !== "14d" ||
    selectedPlatform !== "all" ||
    selectedChannel !== "all" ||
    selectedProduct !== "all" ||
    selectedPersona !== "all";

  return (
    <div className="p-4 rounded-2xl border border-border bg-card shadow-xs space-y-3">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
              Filter Analitik Terpadu
              <span className="text-[10px] font-normal text-muted-foreground hidden sm:inline-block">
                (Seluruh card & tabel sinkron)
              </span>
            </h3>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3 text-muted-foreground/70" />
              Filter waktu berbasis tanggal publikasi / sebaran konten (cohort rilis).
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetAllFilters}
            className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1 px-2 shrink-0 self-start sm:self-auto"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filter
          </Button>
        )}
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* 1. Date Range Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3 text-primary" />
            Rentang Waktu
          </label>
          <select
            value={selectedRange}
            onChange={(e) => updateParam("range", e.target.value)}
            className="w-full h-8 text-xs rounded-xl bg-background border border-border px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="14d">14 Hari Terakhir (Default)</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="all">Semua Waktu (All Time)</option>
          </select>
        </div>

        {/* 2. Platform Type Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-blue-500" />
            Platform Induk
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => updateParam("platform", e.target.value)}
            className="w-full h-8 text-xs rounded-xl bg-background border border-border px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Semua Platform</option>
            {platformTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Channel / Group Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Layers className="w-3 h-3 text-teal-500" />
            Grup / Channel
          </label>
          <select
            value={selectedChannel}
            onChange={(e) => updateParam("channel", e.target.value)}
            className="w-full h-8 text-xs rounded-xl bg-background border border-border px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary truncate"
          >
            <option value="all">Semua Grup / Channel</option>
            {channels.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Product Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Package className="w-3 h-3 text-emerald-500" />
            Produk Terkait
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => updateParam("product", e.target.value)}
            className="w-full h-8 text-xs rounded-xl bg-background border border-border px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary truncate"
          >
            <option value="all">Semua Produk</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Persona Filter */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Users2 className="w-3 h-3 text-pink-500" />
            Persona AI
          </label>
          <select
            value={selectedPersona}
            onChange={(e) => updateParam("persona", e.target.value)}
            className="w-full h-8 text-xs rounded-xl bg-background border border-border px-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Semua Persona</option>
            {personas.map((per) => (
              <option key={per.id} value={per.id}>
                {per.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
