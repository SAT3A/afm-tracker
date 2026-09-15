"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Users2,
  Share2,
  Video,
  Sparkles,
} from "lucide-react";
import { PersonaFormModal } from "./persona-form-modal";
import { PersonaDetailModal } from "./persona-detail-modal";
import { deletePersona, PersonaItem } from "@/app/actions/personas";
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

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus persona "${name}"?`)) {
      startTransition(async () => {
        await deletePersona(id);
        router.refresh();
      });
    }
  };

  const filteredPersonas = personas.filter((p) => {
    const matchesSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description &&
        p.description.toLowerCase().includes(search.toLowerCase())) ||
      p.niches.some((n) => n.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      selectedStatus === "all" || p.status === selectedStatus;

    const matchesNiche =
      selectedNiche === "all" || p.niches.includes(selectedNiche);

    return matchesSearch && matchesStatus && matchesNiche;
  });

  return (
    <div
      className={`space-y-6 ${
        isPending ? "opacity-60 pointer-events-none transition-opacity" : ""
      }`}
    >
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
            className="w-full sm:w-32 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
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
          {filteredPersonas.map((persona) => (
            <div
              key={persona.id}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {/* Card Header: Avatar, Name, Status & Action Menu */}
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
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                            Nonaktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPersona(persona);
                        setIsDetailOpen(true);
                      }}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                      title="Lihat Profil Lengkap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPersonaToEdit(persona);
                        setIsFormOpen(true);
                      }}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-600"
                      title="Edit Profil"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(persona.id, persona.name)}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      title="Hapus Persona"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
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

      {/* Form Modal (Create / Edit) */}
      <PersonaFormModal
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
