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
  Share2,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  Package,
} from "lucide-react";
import {
  DistributionFormModal,
  SimpleProductOption,
  SimplePlatformOption,
  SimplePersonaOption,
} from "./distribution-form-modal";
import { DistributionDetailModal } from "./distribution-detail-modal";
import { deleteDistribution } from "@/app/actions/distributions";
import { useRouter } from "next/navigation";

export interface DistributionItemData {
  id: string;
  distributionType: string;
  postUrl: string;
  postedAt: Date;
  status: string;
  campaign: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  platform: {
    id: string;
    name: string;
    platformType: string;
    category: string;
    requiresApproval: boolean;
    url: string | null;
  };
  persona: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  items: Array<{
    id: string;
    product: {
      id: string;
      productName: string;
      brand: string;
      category: string;
      price: number;
      commissionRate: number;
      affiliateLink: string;
    };
  }>;
  latestEngagement?: {
    id: string;
    likesCount: number;
    viewsCount: number;
    sharesCount: number;
    clicksCount: number;
    ordersCount: number | null;
    capturedAt: Date | string;
  } | null;
  engagements?: Array<{
    id: string;
    likesCount: number;
    viewsCount: number;
    sharesCount: number;
    clicksCount: number;
    ordersCount: number | null;
    capturedAt: Date | string;
  }>;
}

interface DistributionTableProps {
  distributions: DistributionItemData[];
  products: SimpleProductOption[];
  platforms: SimplePlatformOption[];
  personas: SimplePersonaOption[];
  campaigns?: string[];
}

export function DistributionTable({
  distributions,
  products,
  platforms,
  personas,
  campaigns = [],
}: DistributionTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filters state
  const [search, setSearch] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedPersona, setSelectedPersona] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [distToEdit, setDistToEdit] = useState<DistributionItemData | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDist, setSelectedDist] =
    useState<DistributionItemData | null>(null);

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data sebar link ini?")) {
      startTransition(async () => {
        await deleteDistribution(id);
        router.refresh();
      });
    }
  };

  const filteredDistributions = distributions.filter((item) => {
    const matchesSearch =
      search.trim() === "" ||
      item.platform.name.toLowerCase().includes(search.toLowerCase()) ||
      item.persona.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.campaign &&
        item.campaign.toLowerCase().includes(search.toLowerCase())) ||
      (item.notes &&
        item.notes.toLowerCase().includes(search.toLowerCase())) ||
      item.items.some((i) =>
        i.product.productName.toLowerCase().includes(search.toLowerCase())
      );

    const matchesPlatform =
      selectedPlatform === "all" || item.platform.id === selectedPlatform;

    const matchesPersona =
      selectedPersona === "all" || item.persona.id === selectedPersona;

    const matchesType =
      selectedType === "all" || item.distributionType === selectedType;

    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    const matchesCampaign =
      selectedCampaign === "all" || item.campaign === selectedCampaign;

    return (
      matchesSearch &&
      matchesPlatform &&
      matchesPersona &&
      matchesType &&
      matchesStatus &&
      matchesCampaign
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Disetujui
          </span>
        );
      case "pending_approval":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3 h-3" />
            Pending Approval
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        );
      case "deleted":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-muted-foreground">
            Dihapus
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
            Posted
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
      {/* Action Toolbar: Search + Platform Filter + Persona Filter + Status Filter + Add Button */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
        <div className="flex flex-1 flex-wrap gap-2.5 items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari grup, persona, produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Platform Filter */}
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full sm:w-44 h-9 px-3 text-xs rounded-lg border border-border bg-background outline-none focus:border-primary font-medium"
          >
            <option value="all">Semua Grup / Platform</option>
            {platforms.map((plat) => (
              <option key={plat.id} value={plat.id}>
                {plat.name}
              </option>
            ))}
          </select>

          {/* Persona Filter */}
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="w-full sm:w-36 h-9 px-3 text-xs rounded-lg border border-border bg-background outline-none focus:border-primary font-medium"
          >
            <option value="all">Semua Persona</option>
            {personas.map((pers) => (
              <option key={pers.id} value={pers.id}>
                {pers.name}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full sm:w-32 h-9 px-3 text-xs rounded-lg border border-border bg-background outline-none focus:border-primary font-medium"
          >
            <option value="all">Semua Tipe</option>
            <option value="comment">💬 Komentar</option>
            <option value="post">📝 Postingan</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-36 h-9 px-3 text-xs rounded-lg border border-border bg-background outline-none focus:border-primary font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="posted">Posted</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>

          {/* Campaign Filter */}
          {campaigns.length > 0 && (
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full sm:w-36 h-9 px-3 text-xs rounded-lg border border-border bg-background outline-none focus:border-primary font-medium"
            >
              <option value="all">Semua Campaign</option>
              {campaigns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Add Distribution button */}
        <Button
          onClick={() => {
            setDistToEdit(null);
            setIsFormOpen(true);
          }}
          className="gap-1.5 h-9 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Catat Sebar Link
        </Button>
      </div>

      {/* Main Distributions Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[260px] text-xs font-semibold text-muted-foreground">
                  Target Grup / Channel
                </TableHead>
                <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground">
                  Persona
                </TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground">
                  Tipe Sebar
                </TableHead>
                <TableHead className="w-[200px] text-xs font-semibold text-muted-foreground">
                  Produk Terkait
                </TableHead>
                <TableHead className="w-[130px] text-xs font-semibold text-muted-foreground text-center">
                  Status
                </TableHead>
                <TableHead className="w-[140px] text-xs font-semibold text-muted-foreground">
                  Metrik & Konversi
                </TableHead>
                <TableHead className="w-[130px] text-xs font-semibold text-muted-foreground">
                  Waktu Sebar
                </TableHead>
                <TableHead className="w-[60px] text-xs font-semibold text-muted-foreground text-center">
                  Link
                </TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-muted-foreground text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDistributions.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="h-44 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Share2 className="w-8 h-8 text-muted-foreground/40" />
                      <p className="text-sm font-medium">
                        Belum ada sebaran link yang dicatat.
                      </p>
                      <p className="text-xs text-muted-foreground/80">
                        {distributions.length === 0
                          ? "Mulai dengan menyebarkan link produk affiliate ke grup target (bisa satuan atau batch multi-grup)."
                          : "Coba ubah filter pencarian Anda."}
                      </p>
                      {distributions.length === 0 && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setDistToEdit(null);
                            setIsFormOpen(true);
                          }}
                          className="mt-2 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Catat Sebar Link Pertama
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDistributions.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-muted/50 group"
                  >
                    {/* Platform */}
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDist(item);
                            setIsDetailOpen(true);
                          }}
                          className="font-bold text-xs text-foreground hover:text-primary text-left transition-colors"
                        >
                          {item.platform.name}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase font-mono px-1 py-0"
                          >
                            {item.platform.platformType}
                          </Badge>
                          {item.campaign && (
                            <span className="text-[10px] text-primary font-medium">
                              #{item.campaign}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Persona */}
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold text-[10px] flex items-center justify-center shrink-0">
                          {item.persona.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-medium text-foreground">
                          {item.persona.name}
                        </span>
                      </div>
                    </TableCell>

                    {/* Distribution Type */}
                    <TableCell className="py-3">
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.distributionType === "comment"
                          ? "💬 Komentar"
                          : "📝 Post"}
                      </span>
                    </TableCell>

                    {/* Products */}
                    <TableCell className="py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                          <Package className="w-3.5 h-3.5 text-primary" />
                          <span>{item.items.length} Produk</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[190px]">
                          {item.items.map((i) => i.product.productName).join(", ")}
                        </p>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-3 text-center">
                      {getStatusBadge(item.status)}
                    </TableCell>

                    {/* Engagement & Conversion */}
                    <TableCell className="py-3">
                      {item.latestEngagement ? (
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span>
                              {item.latestEngagement.viewsCount.toLocaleString("id-ID")}{" "}
                              views
                            </span>
                            <span>&bull;</span>
                            <span className="text-primary font-semibold">
                              {item.latestEngagement.clicksCount} clicks
                            </span>
                          </div>
                          {item.latestEngagement.ordersCount !== null &&
                            item.latestEngagement.ordersCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                {item.latestEngagement.ordersCount} orders
                              </span>
                            )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/60 italic">
                          Belum ada
                        </span>
                      )}
                    </TableCell>

                    {/* Posted At */}
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {new Date(item.postedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>

                    {/* Post Link */}
                    <TableCell className="py-3 text-center">
                      {item.postUrl ? (
                        <a
                          href={item.postUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                          title="Buka Postingan"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50">
                          -
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDist(item);
                            setIsDetailOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                          title="Lihat Detail & Salin Link"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDistToEdit(item);
                            setIsFormOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-accent"
                          title="Edit Sebaran"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          title="Hapus Sebaran"
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

        {/* Table Summary Footer */}
        <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>
            Menampilkan {filteredDistributions.length} dari{" "}
            {distributions.length} sebaran link
          </span>
          <span className="text-muted-foreground/80">
            Gunakan fitur batch sebar link untuk mendistribusikan ke banyak grup sekaligus
          </span>
        </div>
      </div>

      {/* Form Modal */}
      <DistributionFormModal
        key={distToEdit?.id || (isFormOpen ? "new" : "closed")}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        distributionToEdit={distToEdit}
        products={products}
        platforms={platforms}
        personas={personas}
        campaignOptions={campaigns}
        onSuccess={() => router.refresh()}
      />

      {/* Detail Modal */}
      <DistributionDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        distribution={selectedDist}
        onEdit={(dist) => {
          setDistToEdit(dist);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
}
