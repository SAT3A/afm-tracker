"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, BellOff, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getUpcomingSchedules, updateScheduleStatus } from "@/app/actions/schedules";

// Simple pleasant chime using browser Web Audio API
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);

    // Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.log("SW registration error:", err));
    }
  }, []);

  // Request browser permission
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser Anda tidak mendukung Web Notification");
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === "granted") {
        toast.success("Notifikasi browser berhasil diaktifkan!");
        playChime();
        new Notification("AFM Tracker Pengingat Aktif", {
          body: "Anda akan menerima pengingat otomatis saat jadwal posting tiba.",
          icon: "/favicon.ico",
        });
      } else if (res === "denied") {
        toast.error("Izin notifikasi ditolak di pengaturan browser Anda.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal meminta izin notifikasi");
    }
  };

  // Test Notification
  const triggerTestNotification = () => {
    if (permission !== "granted") {
      toast.warning("Silakan aktifkan izin notifikasi terlebih dahulu!");
      return;
    }

    playChime();

    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification("AFM Tracker &bull; Uji Coba Pengingat", {
          body: "Halo! Pengingat jadwal posting Shopee Affiliate berjalan dengan sempurna 🚀",
          icon: "/favicon.ico",
          data: { url: "/schedule" },
        });
      });
    } else {
      new Notification("AFM Tracker &bull; Uji Coba Pengingat", {
        body: "Halo! Pengingat jadwal posting Shopee Affiliate berjalan dengan sempurna 🚀",
        icon: "/favicon.ico",
      });
    }

    toast.success("Notifikasi uji coba berhasil dikirim!");
  };

  // Schedule Reminder Poller
  const checkDueSchedules = useCallback(async () => {
    if (permission !== "granted") return;
    setIsChecking(true);

    try {
      const res = await getUpcomingSchedules();
      if (res.success && res.data) {
        const now = new Date().getTime();

        for (const schedule of res.data) {
          const scheduleTime = new Date(schedule.scheduledAt).getTime();
          const diffMinutes = (scheduleTime - now) / (1000 * 60);

          // If due within next 10 minutes or past up to 10 minutes and still marked "scheduled"
          if (diffMinutes <= 10 && diffMinutes >= -10 && schedule.status === "scheduled") {
            playChime();

            const bodyText = `Persona: ${schedule.persona?.name || "Semua"} | Waktunya mengeksekusi konten/link!`;

            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.ready.then((reg) => {
                reg.showNotification(`⏰ Jadwal Posting: ${schedule.title}`, {
                  body: bodyText,
                  icon: "/favicon.ico",
                  data: { url: "/schedule" },
                });
              });
            } else {
              new Notification(`⏰ Jadwal Posting: ${schedule.title}`, {
                body: bodyText,
                icon: "/favicon.ico",
              });
            }

            toast.info(`⏰ Waktunya Posting: ${schedule.title}`, {
              description: bodyText,
              duration: 8000,
            });

            // Mark as reminded so it doesn't repeat
            await updateScheduleStatus(schedule.id, "reminded");
          }
        }
      }
    } catch (err) {
      console.error("Reminder check failed:", err);
    } finally {
      setIsChecking(false);
    }
  }, [permission]);

  // Periodic check every 45 seconds while tab is open
  useEffect(() => {
    if (permission === "granted") {
      checkDueSchedules();
      const interval = setInterval(checkDueSchedules, 45000);
      return () => clearInterval(interval);
    }
  }, [permission, checkDueSchedules]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-xs">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            permission === "granted"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
          }`}
        >
          {permission === "granted" ? (
            <BellRing className="w-5 h-5 animate-pulse" />
          ) : permission === "denied" ? (
            <BellOff className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">
              Pengingat Jadwal Browser (Push Notification)
            </h3>
            {permission === "granted" ? (
              <Badge className="bg-emerald-500 text-white text-[10px] py-0 px-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Aktif
              </Badge>
            ) : permission === "denied" ? (
              <Badge variant="destructive" className="text-[10px] py-0 px-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Ditolak
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] py-0 px-2 text-amber-600 border-amber-500/30">
                Belum Aktif
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {permission === "granted"
              ? "Sistem memantau jadwal posting otomatis dan akan menampilkan notifikasi saat waktu tiba."
              : "Aktifkan notifikasi browser agar Anda mendapat alarm tepat waktu saat jadwal sebar link/konten tiba."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
        {permission !== "granted" ? (
          <Button
            type="button"
            size="sm"
            onClick={requestPermission}
            className="gap-1.5 text-xs font-semibold"
          >
            <Bell className="w-3.5 h-3.5" />
            Aktifkan Pengingat
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={triggerTestNotification}
            className="gap-1.5 text-xs font-semibold border-border hover:bg-muted"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Uji Notifikasi
          </Button>
        )}
      </div>
    </div>
  );
}
