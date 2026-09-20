"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignSummary } from "@/app/actions/campaigns";
import { CampaignDetailModal } from "./campaign-detail-modal";
import {
  Tag,
  Search,
  Package,
  Share2,
  Video,
  ShoppingBag,
  Coins,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CampaignListViewProps {
  campaigns: CampaignSummary[];
}

export function CampaignListView({ campaigns }: CampaignListViewProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("earnings");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignSummary | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Pagination state (6 for grid, 10 for table)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = viewMode === "grid" ? 6 : 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortBy, viewMode]);

  const handleResetFilters = () => {
    setSearch("");
    setSortBy("earnings");
    setCurrentPage(1);
  };

  const filtered = campaigns
    .filter((c) => {
      if (search.trim() !== "") {
        const q = search.toLowerCase();
        return c.name.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "earnings") return b.estimatedEarnings - a.estimatedEarnings;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      if (sortBy === "clicks") return b.totalClicks - a.totalClicks;
      if (sortBy === "distributions") return b.distributionCount - a.distributionCount;
      return a.name.localeCompare(b.name);
    });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedCampaigns = filtered.slice(startIndex, endIndex);

  const handleOpenDetail = (campaign: CampaignSummary) => {
    setSelectedCampaign(campaign);
    setDetailModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama campaign (misal: Promo 9.9, Gajian Sale)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <Select value={sortBy} onValueChange={(val) => setSortBy(val || "earnings")}>
            <SelectTrigger className="text-xs h-9 w-40">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="earnings" className="text-xs">Est. Komisi Tertinggi</SelectItem>
              <SelectItem value="orders" className="text-xs">Order Terbanyak</SelectItem>
              <SelectItem value="clicks" className="text-xs">Klik Terbanyak</SelectItem>
              <SelectItem value="distributions" className="text-xs">Sebaran Terbanyak</SelectItem>
              <SelectItem value="name" className="text-xs">Nama (A-Z)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleResetFilters}
            className="h-9 w-9 border-border hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
            title="Reset filter"
            aria-label="Reset filter"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "grid"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Tampilan Kartu"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "table"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Tampilan Tabel"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-border shadow-xs">
          <CardContent className="py-16 text-center text-xs text-muted-foreground space-y-2">
            <Tag className="w-8 h-8 text-muted-foreground/50 mx-auto" />
            <p className="font-semibold text-foreground text-sm">
              Belum Ada Data Campaign yang Sesuai
            </p>
            <p className="max-w-md mx-auto">
              Labeli produk, sebaran link, atau konten video Anda dengan nama campaign (misal: "Promo 9.9", "Gajian Sale") untuk melihat pelaporan di sini.
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedCampaigns.map((c) => (
            <Card
              key={c.name}
              className="border-border bg-card shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/20 mb-1.5">
                      Campaign
                    </Badge>
                    <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {c.name}
                    </CardTitle>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-semibold">
                      Est. Earning
                    </span>
                    <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      Rp {Math.round(c.estimatedEarnings).toLocaleString("id-ID")}
                    </strong>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 flex-1 flex flex-col justify-between">
                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-muted/40 border border-border text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Produk</span>
                    <strong className="font-extrabold text-foreground">{c.productCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Sebaran</span>
                    <strong className="font-extrabold text-foreground">{c.distributionCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Video</span>
                    <strong className="font-extrabold text-foreground">{c.contentCount}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-500" />
                    <strong>{c.totalOrders}</strong> order
                  </span>
                  <span className="text-muted-foreground">
                    <strong>{c.totalClicks.toLocaleString("id-ID")}</strong> klik
                  </span>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Lihat rincian lengkap
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDetail(c)}
                    className="gap-1 text-xs font-bold text-primary hover:bg-primary/10 p-0 h-auto"
                  >
                    Buka Detail <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Nama Campaign</th>
                  <th className="py-3 px-4 text-center">Produk</th>
                  <th className="py-3 px-4 text-center">Sebaran</th>
                  <th className="py-3 px-4 text-center">Video</th>
                  <th className="py-3 px-4 text-right">Total Klik</th>
                  <th className="py-3 px-4 text-right">Total Order</th>
                  <th className="py-3 px-4 text-right">Est. Komisi</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedCampaigns.map((c) => (
                  <tr key={c.name} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{c.name}</td>
                    <td className="py-3 px-4 text-center">{c.productCount}</td>
                    <td className="py-3 px-4 text-center">{c.distributionCount}</td>
                    <td className="py-3 px-4 text-center">{c.contentCount}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {c.totalClicks.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                      {c.totalOrders}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                      Rp {Math.round(c.estimatedEarnings).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetail(c)}
                        className="text-xs h-7 px-2"
                      >
                        Detail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Footer */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-muted-foreground pt-2">
          <div>
            Menampilkan <span className="font-semibold text-foreground">{startIndex + 1}</span> -{" "}
            <span className="font-semibold text-foreground">{endIndex}</span> dari{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> campaign
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

      {/* Detail Modal */}
      <CampaignDetailModal
        campaign={selectedCampaign}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
