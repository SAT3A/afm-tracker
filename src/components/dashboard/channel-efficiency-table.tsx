"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layers, Search, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { formatCurrencyIDR, formatPercentage } from "@/lib/analytics/metrics";

export interface ChannelEfficiencyItem {
  id: string;
  name: string;
  platformType: string;
  distributionCount: number;
  totalClicks: number;
  clicksPerDistribution: number;
  totalOrders: number;
  cvr: number;
  totalCommission: number;
  commissionPerDistribution: number;
  epc: number;
}

interface ChannelEfficiencyTableProps {
  channels: ChannelEfficiencyItem[];
}

export function ChannelEfficiencyTable({ channels }: ChannelEfficiencyTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredChannels = channels.filter((ch) => {
    const q = search.toLowerCase();
    return ch.name.toLowerCase().includes(q) || ch.platformType.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredChannels.length / pageSize));
  const displayedChannels = filteredChannels.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Layers className="w-4 h-4 text-teal-500" />
              Efisiensi Channel & Grup Sebaran
            </CardTitle>
            <CardDescription className="text-xs">
              Membedakan grup sasaran yang sangat efisien (tinggi klik/komisi per sebar) dibanding grup bervolume tinggi tapi minim hasil.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama grup / platform..."
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
                  <TableHead className="font-bold text-foreground min-w-[200px]">Grup / Channel Target</TableHead>
                  <TableHead className="font-bold text-foreground text-center min-w-[70px]">Sebaran</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[110px]" title="Total Klik dan Rata-rata Klik per Sebaran Link">
                    Klik &bull; Klik/Sebar
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[80px]">Order</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[70px]" title="Conversion Rate = Order / Klik × 100%">
                    CVR %
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[110px]">Total Komisi</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[120px]" title="Rata-rata Komisi per Sebaran Link di grup ini">
                    Komisi / Sebaran
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[80px]" title="Earnings Per Click = Komisi / Klik">
                    EPC
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="text-xs divide-y divide-border">
                {displayedChannels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                      Tidak ada data grup yang sesuai filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedChannels.map((ch) => (
                    <TableRow key={ch.id} className="hover:bg-muted/30 transition-colors">
                      {/* Channel Name & Platform Type */}
                      <TableCell className="py-3">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground line-clamp-1" title={ch.name}>
                            {ch.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <span className="uppercase font-mono text-[10px] px-1 py-0 rounded bg-muted">
                              {ch.platformType}
                            </span>
                          </p>
                        </div>
                      </TableCell>

                      {/* Distribution Count */}
                      <TableCell className="text-center font-medium text-foreground">
                        {ch.distributionCount}x
                      </TableCell>

                      {/* Clicks & Clicks/Distribution */}
                      <TableCell className="text-right">
                        <p className="font-bold text-foreground">{ch.totalClicks.toLocaleString("id-ID")}</p>
                        <p className="text-[10px] text-primary font-bold">{ch.clicksPerDistribution} / sebar</p>
                      </TableCell>

                      {/* Orders */}
                      <TableCell className="text-right font-medium text-teal-600 dark:text-teal-400">
                        {ch.totalOrders.toLocaleString("id-ID")}
                      </TableCell>

                      {/* CVR % */}
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatPercentage(ch.cvr)}
                      </TableCell>

                      {/* Total Commission */}
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrencyIDR(ch.totalCommission, true)}
                      </TableCell>

                      {/* Commission per Distribution */}
                      <TableCell className="text-right font-bold text-foreground">
                        <div className="flex items-center justify-end gap-1">
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>Rp {Math.round(ch.commissionPerDistribution).toLocaleString("id-ID")}</span>
                        </div>
                      </TableCell>

                      {/* EPC */}
                      <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                        Rp {ch.epc.toLocaleString("id-ID")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Menampilkan {displayedChannels.length} dari {filteredChannels.length} grup/channel
          </span>
          <div className="flex items-center gap-1">
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
