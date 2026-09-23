"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, Search, ChevronLeft, ChevronRight, ExternalLink, Clock, HelpCircle } from "lucide-react";
import { formatCompactNumber, formatCurrencyIDR, formatPercentage, formatContentAge } from "@/lib/analytics/metrics";
import { DiagnosisStatus } from "@/lib/analytics/diagnostics";

export interface ContentPerformanceItem {
  id: string;
  title: string;
  contentType: string;
  platformUrl?: string | null;
  publishedAt: string | Date;
  personaName: string;
  productNames: string[];
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  orders: number;
  commission: number;
  isActualCommission: boolean;
  er: number;
  ctr: number;
  cvr: number;
  epc: number;
  diagnosisStatus: DiagnosisStatus;
  diagnosisBadge: string;
  possibleBottleneck: string | null;
  suggestedTest: string | null;
}

interface ContentPerformanceTableProps {
  contents: ContentPerformanceItem[];
}

export function ContentPerformanceTable({ contents }: ContentPerformanceTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredContents = contents.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.personaName.toLowerCase().includes(q) ||
      c.contentType.toLowerCase().includes(q) ||
      c.productNames.some((p) => p.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredContents.length / pageSize));
  const displayedContents = filteredContents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getBadgeStyle = (status: DiagnosisStatus) => {
    switch (status) {
      case "WINNER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "HIGH_ATTENTION_WEAK_CTA":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "HIGH_COMMERCIAL_INTENT":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "LOW_TRACTION":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      case "INSUFFICIENT_DATA":
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <Card className="border-border bg-card shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Video className="w-4 h-4 text-pink-500" />
              Performa Konten Video AI
            </CardTitle>
            <CardDescription className="text-xs">
              Analisa kinerja kreatif video, rasio klik affiliate (CTR basis Views), dan estimasi pendapatan.
            </CardDescription>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari judul konten / persona..."
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
                  <TableHead className="font-bold text-foreground min-w-[240px]">Konten Video & Umur</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[100px]" title="Denominator CTR/ER dihitung berbasis Views (Video Plays)">
                    Views (Plays)
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[80px]" title="Engagement Rate = (Likes+Comments+Shares+Saves) / Views × 100%">
                    ER %
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[80px]" title="Affiliate CTR = Klik Affiliate / Views × 100%">
                    CTR %
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[80px]">Klik</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[80px]">Order</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[80px]" title="Conversion Rate = Order / Klik × 100%">
                    CVR %
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[110px]">Estimasi Komisi</TableHead>
                  <TableHead className="font-bold text-foreground text-right min-w-[90px]" title="Earnings Per Click = Komisi / Klik">
                    EPC
                  </TableHead>
                  <TableHead className="font-bold text-foreground text-center min-w-[140px]">Diagnosa Kinerja</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="text-xs divide-y divide-border">
                {displayedContents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-8 text-center text-muted-foreground text-xs">
                      Tidak ada konten yang sesuai dengan filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedContents.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
                      {/* Title, Platform & Content Age */}
                      <TableCell className="py-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground line-clamp-1" title={c.title}>
                            {c.title}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                            <span className="font-medium text-primary">{c.personaName}</span>
                            <span>&bull;</span>
                            <span className="uppercase font-mono text-[10px] px-1 py-0 rounded bg-muted">
                              {c.contentType.replace("_", " ")}
                            </span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatContentAge(c.publishedAt)}
                            </span>
                            {c.platformUrl && (
                              <a
                                href={c.platformUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary inline-flex items-center gap-0.5 ml-1"
                                title="Buka video di platform"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Views (Basis Plays) */}
                      <TableCell className="text-right font-medium text-foreground">
                        {formatCompactNumber(c.views)}
                      </TableCell>

                      {/* ER % */}
                      <TableCell className="text-right font-medium text-pink-500">
                        {formatPercentage(c.er)}
                      </TableCell>

                      {/* CTR % */}
                      <TableCell className="text-right font-bold text-primary">
                        {formatPercentage(c.ctr)}
                      </TableCell>

                      {/* Clicks */}
                      <TableCell className="text-right font-medium text-foreground">
                        {c.clicks.toLocaleString("id-ID")}
                      </TableCell>

                      {/* Orders */}
                      <TableCell className="text-right font-medium text-teal-600 dark:text-teal-400">
                        {c.orders.toLocaleString("id-ID")}
                      </TableCell>

                      {/* CVR % */}
                      <TableCell className="text-right font-semibold text-foreground">
                        {c.clicks < 20 ? (
                          <span className="text-muted-foreground" title="Sample klik < 20, konversi masih tahap akumulasi">
                            {formatPercentage(c.cvr)}*
                          </span>
                        ) : (
                          formatPercentage(c.cvr)
                        )}
                      </TableCell>

                      {/* Commission */}
                      <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                        <div className="flex items-center justify-end gap-1">
                          <span>{formatCurrencyIDR(c.commission, true)}</span>
                          {!c.isActualCommission && (
                            <span title="Estimasi berbasis produk terkait" className="text-[10px] text-muted-foreground">
                              (est)
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* EPC */}
                      <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                        Rp {c.epc.toLocaleString("id-ID")}
                      </TableCell>

                      {/* Diagnosis Badge & Hypothesis */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold px-2 py-0.5 border ${getBadgeStyle(c.diagnosisStatus)}`}
                            title={c.possibleBottleneck || c.suggestedTest || ""}
                          >
                            {c.diagnosisBadge}
                          </Badge>
                          {c.possibleBottleneck && (
                            <span className="text-[9px] text-muted-foreground/80 line-clamp-1 max-w-[140px]" title={c.possibleBottleneck}>
                              {c.possibleBottleneck}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination & Footer Note */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/70" />
            <span>* Tanda bintang (*) menandakan sample klik &lt; 20 sehingga rasio CVR masih fluktuatif.</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span>
              Halaman {currentPage} dari {totalPages} ({filteredContents.length} konten)
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
        </div>
      </CardContent>
    </Card>
  );
}
