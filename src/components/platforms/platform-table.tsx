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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  ExternalLink,
  Eye,
  Edit2,
  Trash2,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Share2,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { PlatformFormModal, PlatformData } from "./platform-form-modal";
import { PlatformDetailModal } from "./platform-detail-modal";
import { deletePlatform } from "@/app/actions/platforms";
import { useRouter } from "next/navigation";

export interface PlatformItem extends PlatformData {
  id: string;
  distributionsCount: number;
  sharesCount?: number;
  postsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PlatformTableProps {
  platforms: PlatformItem[];
  categories: string[];
}

export function PlatformTable({ platforms, categories }: PlatformTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filters state
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApproval, setSelectedApproval] = useState("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [platformToEdit, setPlatformToEdit] = useState<PlatformData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformItem | null>(null);

  // Delete dialog state
  const [platformToDelete, setPlatformToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleRequestDelete = (id: string, name: string) => {
    setPlatformToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!platformToDelete) return;
    startTransition(async () => {
      try {
        const res = await deletePlatform(platformToDelete.id);
        if (res.success) {
          toast.error("Data platform berhasil dihapus");
          setDeleteDialogOpen(false);
          setPlatformToDelete(null);
          router.refresh();
        } else {
          toast.error(res.message || "Gagal menghapus platform");
        }
      } catch (error) {
        toast.error("Tidak dapat menghapus platform saat ini.");
        console.error(error);
      }
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedType("all");
    setSelectedCategory("all");
    setSelectedApproval("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  // Filter platforms locally for instant interactive feedback
  const filteredPlatforms = platforms.filter((item) => {
    const matchesSearch =
      search.trim() === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase())) ||
      (item.url && item.url.toLowerCase().includes(search.toLowerCase()));

    const matchesType =
      selectedType === "all" || item.platformType === selectedType;

    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    const matchesApproval =
      selectedApproval === "all" ||
      (selectedApproval === "required" && item.requiresApproval) ||
      (selectedApproval === "free" && !item.requiresApproval);

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesStatus &&
      matchesApproval
    );
  });

  // Pagination state & calculations (10 platforms per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Auto-reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType, selectedCategory, selectedStatus, selectedApproval]);

  const totalItems = filteredPlatforms.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPlatforms = filteredPlatforms.slice(startIndex, endIndex);

  const getPlatformStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Approval
          </span>
        );
      case "restricted":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Restricted
          </span>
        );
      case "on_hiatus":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            On Hiatus
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Suspended
          </span>
        );
      case "inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            Non Active
          </span>
        );
    }
  };

  const getPlatformTypeBadge = (type: string) => {
    switch (type) {
      case "facebook":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Facebook
          </span>
        );
      case "instagram":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800">
            Instagram
          </span>
        );
      case "threads":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border">
            Threads
          </span>
        );
      case "tiktok":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900">
            TikTok
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
            Lainnya
          </span>
        );
    }
  };

  // Statistics calculation for KPI cards
  const totalPlatforms = platforms.length;
  const activePlatformsCount = platforms.filter(
    (p) => p.status === "active"
  ).length;
  const pendingApprovalCount = platforms.filter(
    (p) => p.status === "pending_approval"
  ).length;
  const totalDistributions = platforms.reduce(
    (acc, p) => acc + p.distributionsCount,
    0
  );

  return (
    <div
      className={`space-y-6 ${
        isPending ? "opacity-60 pointer-events-none transition-opacity" : ""
      }`}
    >
      {/* Quick KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Platform */}
        <div
          onClick={handleResetFilters}
          className={`p-4 rounded-xl border bg-card shadow-xs cursor-pointer transition-all hover:border-primary/50 ${
            selectedStatus === "all"
              ? "border-primary/40 ring-1 ring-primary/20"
              : "border-border"
          }`}
          title="Klik untuk tampilkan semua platform"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Total Platform
            </span>
            <Globe className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-foreground">
            {totalPlatforms}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Grup & Social Media Terdaftar
          </p>
        </div>

        {/* 2. Platform Active */}
        <div
          onClick={() => {
            setSelectedStatus((prev) =>
              prev === "active" ? "all" : "active"
            );
          }}
          className={`p-4 rounded-xl border bg-card shadow-xs cursor-pointer transition-all hover:border-teal-500/50 ${
            selectedStatus === "active"
              ? "border-teal-500 ring-2 ring-teal-500/30 bg-teal-500/[0.03]"
              : "border-border"
          }`}
          title="Klik untuk filter platform dengan status Active"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Platform Aktif
            </span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-teal-600 dark:text-teal-400">
            {activePlatformsCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Status Active
          </p>
        </div>

        {/* 3. Butuh Approval */}
        <div
          onClick={() => {
            setSelectedStatus((prev) =>
              prev === "pending_approval" ? "all" : "pending_approval"
            );
          }}
          className={`p-4 rounded-xl border bg-card shadow-xs cursor-pointer transition-all hover:border-amber-500/50 ${
            selectedStatus === "pending_approval"
              ? "border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/[0.03]"
              : "border-border"
          }`}
          title="Klik untuk filter platform dengan status Pending Approval"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Butuh Approval
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold mt-2 text-amber-600 dark:text-amber-400">
            {pendingApprovalCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Status Pending Approval
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
            {totalDistributions}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Total keseluruhan post dan distribusi link.
          </p>
        </div>
      </div>

      {/* Top action toolbar: Search + Type Filter + Category Filter + Approval Filter + Add Button */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-2.5 items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama grup .. "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Platform Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-36 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="all">Semua Platform</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="threads">Threads</option>
            <option value="tiktok">TikTok</option>
            <option value="other">Lainnya</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-44 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Approval Filter */}
          <select
            value={selectedApproval}
            onChange={(e) => setSelectedApproval(e.target.value)}
            className="w-full sm:w-36 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="all">Semua Moderasi</option>
            <option value="free">Bebas Post</option>
            <option value="required">Butuh Approval</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-48 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="active">Active</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="restricted">Restricted / Shadowbanned</option>
            <option value="on_hiatus">On Hiatus</option>
            <option value="inactive">Non Active</option>
            <option value="suspended">Suspended / Banned</option>
          </select>

          {/* Reset Filter Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleResetFilters}
            className="h-9 w-9 border-input hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Reset filter & datatable"
            aria-label="Reset filter & datatable"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Add Platform button */}
        <Button
          onClick={() => {
            setPlatformToEdit(null);
            setIsFormOpen(true);
          }}
          className="gap-1.5 h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tambah Platform / Grup
        </Button>
      </div>

      {/* Main Platforms Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px] text-xs font-semibold text-muted-foreground">
                  Nama Platform & Grup
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground">
                  Tipe
                </TableHead>
                <TableHead className="w-[140px] text-xs font-semibold text-muted-foreground">
                  Moderasi Post
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground text-center">
                  Sebaran &nbsp; / &nbsp; Posting
                </TableHead>
                <TableHead className="w-[90px] text-xs font-semibold text-muted-foreground text-center">
                  Status
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground text-center">
                  Link
                </TableHead>
                <TableHead className="w-[60px] text-xs font-semibold text-muted-foreground text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlatforms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Globe className="w-8 h-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">
                        Tidak ada platform atau grup yang ditemukan.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {platforms.length === 0
                          ? "Mulai dengan menambahkan grup Facebook atau akun media sosial pertama Anda."
                          : "Coba ubah kata kunci pencarian atau filter di atas."}
                      </p>
                      {platforms.length === 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setPlatformToEdit(null);
                            setIsFormOpen(true);
                          }}
                          className="mt-2 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Tambah Platform Pertama
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPlatforms.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/40 group"
                  >
                    {/* Platform Name & Category */}
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlatform(item);
                            setIsDetailOpen(true);
                          }}
                          className="font-bold text-xs text-foreground hover:text-primary text-left transition-colors block"
                        >
                          {item.name}
                        </button>
                        {item.category && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {item.category}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Platform Type Badge */}
                    <TableCell className="py-3">
                      {getPlatformTypeBadge(item.platformType)}
                    </TableCell>

                    {/* Moderation / Approval Status */}
                    <TableCell className="py-3">
                      {item.requiresApproval ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <ShieldAlert className="w-3 h-3" />
                          Butuh Approval
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
                          <ShieldCheck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          Bebas Post
                        </span>
                      )}
                    </TableCell>

                    {/* Sebaran & Posting count with 2 icons */}
                    <TableCell className="py-3 text-center">
                      <div className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-foreground">
                        <div
                          className="inline-flex items-center gap-1"
                          title="Sebaran link affiliate"
                        >
                          <Share2 className="w-3.5 h-3.5 text-teal-500" />
                          <span>{item.sharesCount ?? 0}</span>
                        </div>
                        <span className="text-muted-foreground/30">/</span>
                        <div
                          className="inline-flex items-center gap-1"
                          title="Posting konten"
                        >
                          <Send className="w-3.5 h-3.5 text-blue-500" />
                          <span>{item.postsCount ?? 0}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Status badge */}
                    <TableCell className="py-3 text-center">
                      {getPlatformStatusBadge(item.status)}
                    </TableCell>

                    {/* Direct external link */}
                    <TableCell className="py-3 text-center">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors shadow-2xs"
                          title="Buka URL Platform/Grup di tab baru"
                        >
                          <span>visit link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Actions: 3-dots Dropdown Menu */}
                    <TableCell
                      className="py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-muted cursor-pointer outline-none">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPlatform(item);
                              setIsDetailOpen(true);
                            }}
                            className="cursor-pointer gap-2 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setPlatformToEdit(item);
                              setIsFormOpen(true);
                            }}
                            className="cursor-pointer gap-2 text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRequestDelete(item.id, item.name)}
                            className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="px-4 py-3 border-t border-border bg-muted/30 text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Menampilkan <span className="font-semibold text-foreground">{totalItems === 0 ? 0 : startIndex + 1}</span> -{" "}
            <span className="font-semibold text-foreground">{endIndex}</span> dari{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> platform
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
      </div>

      {/* Form Modal (Create / Edit) */}
      <PlatformFormModal
        key={platformToEdit?.id || "new-platform"}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        platformToEdit={platformToEdit}
        onSuccess={() => router.refresh()}
      />

      {/* Detail Modal */}
      <PlatformDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        platform={selectedPlatform}
        onEdit={(plat) => {
          setPlatformToEdit(plat);
          setIsFormOpen(true);
        }}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-3 text-center sm:text-left">
            <AlertDialogTitle className="text-lg font-bold text-destructive">
              Hapus Data Platform?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-1 text-xs text-muted-foreground block">
              <span className="block">Apakah Anda yakin ingin menghapus platform</span>
              <span className="block p-3 rounded-lg bg-muted/60 border border-border text-center font-bold text-sm text-foreground">
                {platformToDelete?.name}
              </span>
              <span className="block text-muted-foreground leading-relaxed">
                Tindakan ini akan menghapus platform secara permanen dan tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-2 sm:justify-end gap-2">
            <AlertDialogCancel
              disabled={isPending}
              onClick={() => setDeleteDialogOpen(false)}
              className="text-xs"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs"
            >
              Ya, Hapus Platform
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
