"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, ChevronLeft, ChevronRight, TrendingUp, HelpCircle } from "lucide-react";
import { formatCurrencyIDR, formatPercentage } from "@/lib/analytics/metrics";

export interface ProductAnalyticsItem {
  id: string;
  productName: string;
  brand: string;
  category: string;
  price: number;
  commissionRate: number;
  distributionCount: number;
  totalClicks: number;
  clicksPerDistribution: number;
  totalOrders: number;
  ordersPerDistribution: number;
  cvr: number;
  totalCommission: number | null;
  commissionPerDistribution: number;
  epc: number;
  isUnallocatedBucket?: boolean;
  isEstimatedCommission?: boolean;
}

interface ProductAnalyticsTableProps {
  products: ProductAnalyticsItem[];
}

export function ProductAnalyticsTable({ products }: ProductAnalyticsTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.productName.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const displayedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Package className="w-4 h-4 text-emerald-500" />
              Efisiensi Kinerja Produk Affiliate
            </CardTitle>
            <CardDescription className="text-xs">
              Mengevaluasi produk berdasarkan efisiensi per sebaran link tunggal (mencegah phantom multiplication pada sebaran multi-produk).
            </CardDescription>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama produk / brand / kategori..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 pl-8 text-xs bg-muted/50 border-border"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 text-[11px]">
                <TableRow>
                  <TableHead className="font-bold text-foreground min-w-[200px]">Produk & Brand</TableHead>
                  <TableHead className="font-bold text-foreground text-center min-w-[70px]">Sebaran</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[110px]" title="Total Klik dan Rata-rata Klik per Sebaran Link">
                    Klik &bull; Klik/Sebar
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[110px]" title="Total Pesanan dan Rata-rata Pesanan per Sebaran Link">
                    Order &bull; Order/Sebar
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[70px]" title="Conversion Rate = Order / Klik × 100%">
                    CVR %
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[120px]">Total Komisi</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[120px]" title="Rata-rata Komisi per Sebaran Link">
                    Komisi / Sebaran
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[80px]" title="Earnings Per Click = Komisi / Klik">
                    EPC
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="text-xs divide-y divide-border">
                {displayedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                      Tidak ada data produk yang sesuai filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedProducts.map((p) => (
                    <TableRow
                      key={p.id}
                      className={`hover:bg-muted/30 transition-colors ${
                        p.isUnallocatedBucket ? "bg-amber-500/[0.03] border-l-2 border-l-amber-500" : ""
                      }`}
                    >
                      {/* Product Name, Category & Price */}
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-semibold text-foreground line-clamp-1" title={p.productName}>
                              {p.productName}
                            </p>
                            {p.isUnallocatedBucket && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Multi-produk
                              </span>
                            )}
                          </div>
                          {p.isUnallocatedBucket ? (
                            <p className="text-[11px] text-muted-foreground italic">
                              Hasil dari sebaran yang memuat lebih dari 1 produk tanpa atribusi per item.
                            </p>
                          ) : (
                            <p className="text-[11px] text-muted-foreground">
                              {p.brand} &bull; <span className="text-foreground font-medium">Rp {p.price.toLocaleString("id-ID")}</span> &bull; {p.category}{" "}
                              <span className="text-secondary font-bold">({p.commissionRate}%)</span>
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Distribution Count */}
                      <TableCell className="text-center font-medium text-foreground">
                        {p.distributionCount}x
                      </TableCell>

                      {/* Clicks & Clicks/Distribution */}
                      <TableCell className="text-right">
                        <p className="font-bold text-foreground">{p.totalClicks.toLocaleString("id-ID")}</p>
                        <p className="text-[10px] text-primary font-medium">{p.clicksPerDistribution} / sebar</p>
                      </TableCell>

                      {/* Orders & Orders/Distribution */}
                      <TableCell className="text-right">
                        <p className="font-bold text-teal-600 dark:text-teal-400">{p.totalOrders.toLocaleString("id-ID")}</p>
                        <p className="text-[10px] text-muted-foreground">{p.ordersPerDistribution} / sebar</p>
                      </TableCell>

                      {/* CVR % */}
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatPercentage(p.cvr)}
                      </TableCell>

                      {/* Total Commission */}
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {p.totalCommission == null ? (
                          "N/A"
                        ) : (
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <span>{formatCurrencyIDR(p.totalCommission, true)}</span>
                            {p.isEstimatedCommission && (
                              <span
                                title="Estimasi komisi berbasis (orders × harga × %komisi). Bukan komisi riil tercatat."
                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                              >
                                Estimasi
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Commission per Distribution */}
                      <TableCell className="text-right font-bold text-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3 text-emerald-500" />
                          <span>Rp {Math.round(p.commissionPerDistribution).toLocaleString("id-ID")}</span>
                        </div>
                      </TableCell>

                      {/* EPC */}
                      <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                        Rp {p.epc.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination & Explanatory Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>Atribusi langsung hanya diberikan pada sebaran 1 produk. Sebaran multi-produk dikelompokkan ke baris Unallocated untuk mencegah phantom multiplication.</span>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="w-7 h-7"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
