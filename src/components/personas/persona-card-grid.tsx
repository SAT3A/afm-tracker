"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Users2,
  Share2,
  Video,
  Sparkles,
  CheckCircle2,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PersonaFormModal } from "./persona-form-modal";
import { PersonaDetailModal } from "./persona-detail-modal";
import { PersonaItem } from "@/app/actions/personas";
import { useRouter } from "next/navigation";

interface PersonaCardGridProps {
  personas: PersonaItem[];
}

export function PersonaCardGrid({ personas }: PersonaCardGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedNiche, setSelectedNiche] = useState("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [personaToEdit, setPersonaToEdit] = useState<PersonaItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<PersonaItem | null>(null);

  // Extract all distinct niches from existing personas
  const allNiches = Array.from(
    new Set(personas.flatMap((p) => p.niches))
  ).sort();

  // KPI Calculations
  const totalPersonas = personas.length;
  const activePersonas = personas.filter((p) => p.status === "active").length;
  const nonActivePersonas = personas.filter(
    (p) =>
      p.status === "on_hiatus" ||
      p.status === "deactive" ||
      p.status === "inactive"
  ).length;
  const totalContents = personas.reduce((acc, p) => acc + p.contentsCount, 0);
  const totalDistributions = personas.reduce(
    (acc, p) => acc + p.distributionsCount,
    0
  );
  const totalPublications = totalContents + totalDistributions;

  const handleResetFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedNiche("all");
  };

  const filteredPersonas = personas.filter((p) => {
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(search.toLowerCase())) ||
      p.niches.some((n) => n.toLowerCase().includes(search.toLowerCase()));

    let matchesStatus = true;
    if (selectedStatus === "all") {
      matchesStatus = true;
    } else if (selectedStatus === "non_active") {
      matchesStatus =
        p.status === "on_hiatus" ||
        p.status === "deactive" ||
        p.status === "inactive";
    } else {
      matchesStatus = p.status === selectedStatus;
    }

    const matchesNiche =
      selectedNiche === "all" || p.niches.includes(selectedNiche);

    return matchesSearch && matchesStatus && matchesNiche;
  });

  // Pagination state (max 6 personas per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Auto-reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus, selectedNiche]);

  const totalItems = filteredPersonas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPersonas = filteredPersonas.slice(startIndex, endIndex);

  return (
    <div
      className={`space-y-6 ${
        isPending ? "opacity-60 pointer-events-none transition-opacity" : ""
      }`}
    >
      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Persona */}
        <div
          onClick={handleResetFilters}
          className={`p-4 rounded-xl border bg-card shadow-xs cursor-pointer transition-all hover:border-primary/50 ${
            selectedStatus === "all"
              ? "border-primary/40 ring-1 ring-primary/20"
              : "border-border"
          }`}
          title="Klik untuk tampilkan semua persona"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Persona
            </span>
            <Users2 className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-foreground">
            {totalPersonas}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Persona terdaftar
          </p>
        </div>

        {/* 2. Persona Aktif */}
        <div
          onClick={() => {
            setSelectedStatus((prev) => (prev === "active" ? "all" : "active"));
          }}
          className={`p-4 rounded-xl border bg-card shadow-xs cursor-pointer transition-all hover:border-teal-500/50 ${
            selectedStatus === "active"
              ? "border-teal-500 ring-2 ring-teal-500/30 bg-teal-500/[0.03]"
              : "border-border"
          }`}
          title="Klik untuk filter persona aktif"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Persona Aktif
            </span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
            {activePersonas}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Siap memproduksi konten
          </p>
        </div>

        {/* 3. Persona On hiatus / Non active */}
        <div
          onClick={() => {
            setSelectedStatus((prev) =>
              prev === "non_active" ? "all" : "non_active"
            );
          }}
          className={`p-4 rounded-xl border bg-card shadow-xs cursor-pointer transition-all hover:border-purple-500/50 ${
            selectedStatus === "non_active"
              ? "border-purple-500 ring-2 ring-purple-500/30 bg-purple-500/[0.03]"
              : "border-border"
          }`}
          title="Klik untuk filter persona non aktif"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Persona On hiatus / Non active
            </span>
            <PauseCircle className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-purple-600 dark:text-purple-400">
            {nonActivePersonas}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Persona yang non aktif
          </p>
        </div>

        {/* 4. Publikasi Konten */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Publikasi Konten
            </span>
            <Share2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
            {totalPublications}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Total keseluruhan post dan distribusi link.
          </p>
        </div>
      </div>

      {/* Action Toolbar: Search + Filters + Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-2.5 items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama persona, niche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Niche Filter */}
          <select
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            className="w-full sm:w-40 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="all">Semua Niche</option>
            {allNiches.map((niche) => (
              <option key={niche} value={niche}>
                #{niche}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-48 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="on_hiatus">Nonaktif (On Hiatus)</option>
            <option value="deactive">Deactive (Delete Account)</option>
            <option value="non_active">Nonaktif (Semua)</option>
          </select>
        </div>

        {/* Add Persona button */}
        <Button
          onClick={() => {
            setPersonaToEdit(null);
            setIsFormOpen(true);
          }}
          className="gap-1.5 h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Persona AI
        </Button>
      </div>

      {/* Grid of Personas */}
      {filteredPersonas.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <Users2 className="w-10 h-10 text-muted-foreground/40" />
            <h3 className="font-bold text-sm text-foreground">
              Belum ada persona AI yang cocok
            </h3>
            <p className="text-xs text-muted-foreground">
              {personas.length === 0
                ? "Daftarkan persona AI pertama Anda (seperti Bagas atau Naya) untuk mulai mengelola konten dan sebaran link."
                : "Coba ganti filter atau kata kunci pencarian Anda."}
            </p>
            {personas.length === 0 && (
              <Button
                size="sm"
                onClick={() => {
                  setPersonaToEdit(null);
                  setIsFormOpen(true);
                }}
                className="mt-3 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Persona Pertama
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedPersonas.map((persona) => (
            <div
              key={persona.id}
              onClick={() => {
                setSelectedPersona(persona);
                setIsDetailOpen(true);
              }}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between group cursor-pointer"
              title="Klik untuk melihat detail persona"
            >
              {/* Card Header: Avatar, Name, Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {persona.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={persona.avatarUrl}
                        alt={persona.name}
                        className="w-12 h-12 rounded-xl object-cover border border-primary/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shadow-md shadow-primary/15">
                        {persona.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {persona.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {persona.status === "active" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                            Aktif
                          </span>
                        ) : persona.status === "on_hiatus" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            On Hiatus
                          </span>
                        ) : persona.status === "deactive" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                            Deactive
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Niches Pill Badges */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Niches
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {persona.niches.map((niche) => (
                      <Badge
                        key={niche}
                        variant="secondary"
                        className="text-[11px] font-normal px-2 py-0.5 bg-primary/10 text-primary border border-primary/20"
                      >
                        #{niche}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Description snippet */}
                {persona.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {persona.description}
                  </p>
                )}
              </div>

              {/* Card Footer: Activity metrics */}
              <div className="pt-3 border-t border-border grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded-xl bg-muted/40">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <Share2 className="w-3 h-3 text-teal-500" />
                    Sebaran
                  </div>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {persona.distributionsCount} link
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-muted/40">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
                    <Video className="w-3 h-3 text-primary" />
                    Konten AI
                  </div>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {persona.contentsCount} video
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredPersonas.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            Menampilkan <span className="font-semibold text-foreground">{totalItems === 0 ? 0 : startIndex + 1}</span> -{" "}
            <span className="font-semibold text-foreground">{endIndex}</span> dari{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> persona
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage <= 1}
                className="h-8 w-8 p-0"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= safeCurrentPage - 1 && pageNum <= safeCurrentPage + 1)
                ) {
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 min-w-8 px-2 text-xs font-semibold ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                }

                if (
                  (pageNum === safeCurrentPage - 2 && pageNum > 1) ||
                  (pageNum === safeCurrentPage + 2 && pageNum < totalPages)
                ) {
                  return (
                    <span key={pageNum} className="px-1 text-muted-foreground text-xs">
                      ...
                    </span>
                  );
                }

                return null;
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 w-8 p-0"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <PersonaFormModal
        key={personaToEdit?.id || (isFormOpen ? "new" : "closed")}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        personaToEdit={personaToEdit}
        onSuccess={() => router.refresh()}
      />

      {/* Detail Modal */}
      <PersonaDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        persona={selectedPersona}
        onEdit={(p) => {
          setPersonaToEdit(p);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
}
