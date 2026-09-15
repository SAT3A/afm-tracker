"use client";

import { useState, useTransition } from "react";
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
} from "lucide-react";
import { PlatformFormModal, PlatformData } from "./platform-form-modal";
import { PlatformDetailModal } from "./platform-detail-modal";
import { deletePlatform } from "@/app/actions/platforms";
import { useRouter } from "next/navigation";

export interface PlatformItem extends PlatformData {
  id: string;
  distributionsCount: number;
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

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus platform "${name}"?`)) {
      startTransition(async () => {
        await deletePlatform(id);
        router.refresh();
      });
    }
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

  return (
    <div
      className={`space-y-4 ${
        isPending ? "opacity-60 pointer-events-none transition-opacity" : ""
      }`}
    >
      {/* Top action toolbar: Search + Type Filter + Category Filter + Approval Filter + Add Button */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-2.5 items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama grup, catatan, link..."
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
            className="w-full sm:w-28 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
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
                <TableHead className="w-[100px] text-xs font-semibold text-muted-foreground text-center">
                  Sebaran
                </TableHead>
                <TableHead className="w-[90px] text-xs font-semibold text-muted-foreground text-center">
                  Status
                </TableHead>
                <TableHead className="w-[70px] text-xs font-semibold text-muted-foreground text-center">
                  Link
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlatforms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-44 text-center text-muted-foreground"
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
                filteredPlatforms.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/40 group"
                  >
                    {/* Platform Name & Category */}
                    <TableCell className="py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPlatform(item);
                              setIsDetailOpen(true);
                            }}
                            className="font-bold text-xs text-foreground hover:text-primary text-left transition-colors"
                          >
                            {item.name}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal text-muted-foreground"
                          >
                            {item.category}
                          </Badge>
                          {item.notes && (
                            <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                              {item.notes}
                            </span>
                          )}
                        </div>
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

                    {/* Distributions count */}
                    <TableCell className="py-3 text-center">
                      <div className="inline-flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Share2 className="w-3.5 h-3.5 text-teal-500" />
                        {item.distributionsCount}
                      </div>
                    </TableCell>

                    {/* Status badge */}
                    <TableCell className="py-3 text-center">
                      {item.status === "active" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
                          Nonaktif
                        </span>
                      )}
                    </TableCell>

                    {/* Direct external link */}
                    <TableCell className="py-3 text-center">
                      {item.url ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                          title="Buka URL Platform/Grup"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Actions: View, Edit, Delete */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPlatform(item);
                            setIsDetailOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPlatformToEdit(item);
                            setIsFormOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-600"
                          title="Edit Platform"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          title="Hapus Platform"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer / Summary */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>
            Menampilkan {filteredPlatforms.length} dari {platforms.length} platform
          </span>
          <span className="text-muted-foreground">
            Klik nama atau ikon mata untuk melihat detail lengkap & aturan grup
          </span>
        </div>
      </div>

      {/* Form Modal (Create / Edit) */}
      <PlatformFormModal
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
    </div>
  );
}
