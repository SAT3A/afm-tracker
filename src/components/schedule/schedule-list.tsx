"use client";

import { useState } from "react";
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
import {
  Calendar,
  Clock,
  Search,
  Repeat,
  Share2,
  Users2,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { ScheduleDetailData } from "./schedule-detail-modal";

interface ScheduleListProps {
  schedules: ScheduleDetailData[];
  onSelectSchedule: (schedule: ScheduleDetailData) => void;
  personas: { id: string; name: string }[];
}

export function ScheduleList({
  schedules,
  onSelectSchedule,
  personas,
}: ScheduleListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [personaFilter, setPersonaFilter] = useState("all");

  const filtered = schedules.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (personaFilter !== "all" && s.personaId !== personaFilter) return false;
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchNotes = s.notes ? s.notes.toLowerCase().includes(q) : false;
      const matchPersona = s.persona?.name ? s.persona.name.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchNotes && !matchPersona) return false;
    }
    return true;
  });

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Daftar Agenda Jadwal
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Menampilkan {filtered.length} dari {schedules.length} total agenda posting
            </CardDescription>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari jadwal..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
              <SelectTrigger className="text-xs h-8 w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
                <SelectItem value="scheduled" className="text-xs">Terjadwal</SelectItem>
                <SelectItem value="reminded" className="text-xs">Diingatkan</SelectItem>
                <SelectItem value="posted" className="text-xs">Diposting</SelectItem>
                <SelectItem value="missed" className="text-xs">Terlewat</SelectItem>
              </SelectContent>
            </Select>

            <Select value={personaFilter} onValueChange={(val) => setPersonaFilter(val || "all")}>
              <SelectTrigger className="text-xs h-8 w-32">
                <SelectValue placeholder="Persona" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">Semua Persona</SelectItem>
                {personas.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <p>Tidak ada agenda jadwal yang cocok dengan filter yang dipilih.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((s) => {
              const sDate = new Date(s.scheduledAt);
              const formattedDate = sDate.toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
              });
              const formattedTime = sDate.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSchedule(s)}
                  className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-muted/40 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 text-center shrink-0">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        {formattedDate.split(" ")[0]}
                      </p>
                      <p className="text-sm font-extrabold text-foreground">
                        {formattedDate.split(" ")[1]}
                      </p>
                    </div>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-foreground truncate">
                          {s.title}
                        </span>
                        {s.scheduleType === "recurring" && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20">
                            <Repeat className="w-2.5 h-2.5" /> Berulang
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <Clock className="w-3 h-3" /> {formattedTime} WIB
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Users2 className="w-3 h-3" /> {s.persona?.name || "Semua"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      className={`text-[10px] py-0.5 px-2 ${
                        s.status === "posted"
                          ? "bg-emerald-500 text-white"
                          : s.status === "reminded"
                          ? "bg-amber-500 text-white"
                          : s.status === "missed"
                          ? "bg-rose-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {s.status === "posted"
                        ? "Diposting"
                        : s.status === "reminded"
                        ? "Diingatkan"
                        : s.status === "missed"
                        ? "Terlewat"
                        : "Terjadwal"}
                    </Badge>

                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
