"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  Search,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Heart,
  MousePointerClick,
  Users2,
  Package,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ContentItemData, ContentDetailModal } from "./content-detail-modal";
import { ContentFormModal } from "./content-form-modal";
import { deleteContent } from "@/app/actions/content";
import { SimplePersonaOption, SimpleProductOption } from "../distributions/distribution-form-modal";
import { useRouter } from "next/navigation";

interface ContentTableProps {
  contents: ContentItemData[];
  personas: SimplePersonaOption[];
  products: SimpleProductOption[];
  campaigns: string[];
}

export function ContentTable({
  contents,
  personas,
  products,
  campaigns,
}: ContentTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItemData | null>(
    null
  );
  const [contentToEdit, setContentToEdit] = useState<ContentItemData | null>(
    null
  );

  // Filters state
  const [search, setSearch] = useState("");
  const [personaFilter, setPersonaFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, personaFilter, typeFilter, campaignFilter, statusFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setPersonaFilter("all");
    setTypeFilter("all");
    setCampaignFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const filteredContents = contents.filter((c) => {
    const matchesSearch =
      search.trim() === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase())) ||
      (c.campaign && c.campaign.toLowerCase().includes(search.toLowerCase())) ||
      c.persona.name.toLowerCase().includes(search.toLowerCase());

    const matchesPersona =
      personaFilter === "all" || c.personaId === personaFilter;
    const matchesType =
      typeFilter === "all" || c.contentType === typeFilter;
    const matchesCampaign =
      campaignFilter === "all" || c.campaign === campaignFilter;
    const matchesStatus =
      statusFilter === "all" || c.status === statusFilter;

    return (
      matchesSearch &&
      matchesPersona &&
      matchesType &&
      matchesCampaign &&
      matchesStatus
    );
  });

  const totalItems = filteredContents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedContents = filteredContents.slice(startIndex, endIndex);

  const handleDelete = (id: string, title: string) => {
    if (!confirm(`Hapus konten video "${title}"?`)) return;

    startTransition(async () => {
      await deleteContent(id);
      router.refresh();
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "shopee_video":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            Shopee Video
          </span>
        );
      case "fb_reels":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            FB Reels
          </span>
        );
      case "ig_reels":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
            IG Reels
          </span>
        );
      case "tiktok":
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            TikTok
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
            {type}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Action & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-card p-4 rounded-2xl border border-border">
        {/* Left Side: Search + Filters + Reset Button */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari video, persona..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Persona Filter */}
          <select
            value={personaFilter}
            onChange={(e) => setPersonaFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-lg border border-border bg-background outline-none font-medium"
          >
            <option value="all">Semua Persona</option>
            {personas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-lg border border-border bg-background outline-none font-medium"
          >
            <option value="all">Semua Format</option>
            <option value="shopee_video">Shopee Video</option>
            <option value="fb_reels">FB Reels</option>
            <option value="ig_reels">IG Reels</option>
            <option value="tiktok">TikTok</option>
            <option value="other">Lainnya</option>
          </select>

          {/* Campaign Filter */}
          {campaigns.length > 0 && (
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="h-9 px-2.5 text-xs rounded-lg border border-border bg-background outline-none font-medium"
            >
              <option value="all">Semua Campaign</option>
              {campaigns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 text-xs rounded-lg border border-border bg-background outline-none font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="published">Tayang</option>
            <option value="draft">Draft</option>
          </select>

          {/* Reset Filter Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleResetFilters}
            className="h-9 w-9 border-border hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Reset filter & datatable"
            aria-label="Reset filter & datatable"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Right Side: Add Content Button */}
        <Button
          size="sm"
          onClick={() => {
            setContentToEdit(null);
            setIsFormOpen(true);
          }}
          className="h-9 px-3.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Video
        </Button>
      </div>

      {/* Content Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
              <TableHead className="font-bold">Judul & Format Video</TableHead>
              <TableHead className="font-bold">Persona Kreator</TableHead>
              <TableHead className="font-bold">Produk Terkait</TableHead>
              <TableHead className="font-bold">Metrik Terkini</TableHead>
              <TableHead className="font-bold">Waktu Rilis</TableHead>
              <TableHead className="font-bold text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedContents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  <Video className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  Belum ada konten video yang sesuai dengan filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedContents.map((c) => {
                const latest = c.latestMetric;
                return (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer text-xs"
                    onClick={() => {
                      setSelectedContent(c);
                      setIsDetailOpen(true);
                    }}
                  >
                    {/* Judul & Format */}
                    <TableCell className="max-w-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getTypeBadge(c.contentType)}
                          {c.campaign && (
                            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 px-1.5 py-0">
                              {c.campaign}
                            </Badge>
                          )}
                        </div>
                        <p className="font-bold text-foreground line-clamp-2">
                          {c.title}
                        </p>
                        {c.platformUrl && (
                          <span
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                          >
                            <a
                              href={c.platformUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5"
                            >
                              Buka Video <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Persona */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xs">
                          {c.persona.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-foreground">
                          {c.persona.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Produk Terkait */}
                    <TableCell>
                      {c.products.length > 0 ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                            <Package className="w-3.5 h-3.5 text-primary" />
                            {c.products.length} Produk
                          </span>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                            {c.products.map((p) => p.product.productName).join(", ")}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">
                          Tidak ada produk
                        </span>
                      )}
                    </TableCell>

                    {/* Metrik Terkini */}
                    <TableCell>
                      {latest ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                              <Eye className="w-3 h-3 text-muted-foreground" />
                              {latest.viewsCount.toLocaleString("id-ID")}
                            </span>
                            <span className="inline-flex items-center gap-1 text-rose-500">
                              <Heart className="w-3 h-3" />
                              {latest.likesCount.toLocaleString("id-ID")}
                            </span>
                          </div>
                          {latest.clicksCount !== null && (
                            <div className="text-[10px] text-primary font-semibold flex items-center gap-1">
                              <MousePointerClick className="w-3 h-3" />
                              {latest.clicksCount} clicks
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">
                          Belum ada metrik
                        </span>
                      )}
                    </TableCell>

                    {/* Waktu Rilis */}
                    <TableCell>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(c.publishedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => {
                            setSelectedContent(c);
                            setIsDetailOpen(true);
                          }}
                          title="Lihat Detail & Metrik"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => {
                            setContentToEdit(c);
                            setIsFormOpen(true);
                          }}
                          title="Edit Video"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(c.id, c.title)}
                          disabled={isPending}
                          title="Hapus Video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-muted-foreground">
          <div>
            Menampilkan <span className="font-semibold text-foreground">{startIndex + 1}</span> -{" "}
            <span className="font-semibold text-foreground">{endIndex}</span> dari{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> konten video
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
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
                    <span key={pageNum} className="px-1 text-muted-foreground">
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

      {/* Modals */}
      <ContentDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        content={selectedContent}
        onEdit={(c) => {
          setContentToEdit(c);
          setIsFormOpen(true);
        }}
      />

      <ContentFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        contentToEdit={contentToEdit}
        personas={personas}
        products={products}
        campaignOptions={campaigns}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
