"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ScheduleSchema = z.object({
  personaId: z.string().optional().nullable(),
  title: z.string().min(2, "Judul jadwal minimal 2 karakter").trim(),
  scheduleType: z.enum(["one_time", "recurring"]).default("one_time"),
  recurrenceRule: z.string().optional().nullable(),
  scheduledAt: z.coerce.date(),
  status: z
    .enum(["scheduled", "reminded", "posted", "missed"])
    .default("scheduled"),
  notes: z.string().optional().nullable(),
  // Structured metadata
  platformId: z.string().optional().nullable(),
  platformName: z.string().optional().nullable(),
  productId: z.string().optional().nullable(),
  productName: z.string().optional().nullable(),
  campaign: z.string().optional().nullable(),
});

export type ScheduleActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function getSchedules(filter?: {
  personaId?: string;
  status?: string;
  scheduleType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filter?.status && filter.status !== "all") {
      where.status = filter.status;
    }

    if (filter?.personaId && filter.personaId !== "all") {
      where.personaId = filter.personaId;
    }

    if (filter?.scheduleType && filter.scheduleType !== "all") {
      where.scheduleType = filter.scheduleType;
    }

    if (filter?.startDate || filter?.endDate) {
      where.scheduledAt = {};
      if (filter.startDate) {
        (where.scheduledAt as Record<string, unknown>).gte = new Date(filter.startDate);
      }
      if (filter.endDate) {
        (where.scheduledAt as Record<string, unknown>).lte = new Date(filter.endDate);
      }
    }

    if (filter?.search && filter.search.trim() !== "") {
      const search = filter.search.trim();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { persona: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Otomatis ubah status jadwal yang sudah lewat dari waktu sekarang menjadi 'missed'
    const now = new Date();
    await prisma.schedule.updateMany({
      where: {
        scheduledAt: { lt: now },
        status: "scheduled",
      },
      data: {
        status: "missed",
      },
    });

    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            niches: true,
          },
        },
      },
    });

    return { success: true, data: schedules };
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return { success: false, error: "Gagal mengambil data jadwal posting" };
  }
}

export async function createSchedule(
  prevState: ScheduleActionState | null,
  formData: FormData
): Promise<ScheduleActionState> {
  try {
    const rawData = {
      personaId: (formData.get("personaId") as string) || null,
      title: formData.get("title") as string,
      scheduleType: (formData.get("scheduleType") as string) || "one_time",
      recurrenceRule: (formData.get("recurrenceRule") as string) || null,
      scheduledAt: formData.get("scheduledAt") as string,
      status: (formData.get("status") as string) || "scheduled",
      notes: (formData.get("notes") as string) || null,
      platformId: (formData.get("platformId") as string) || null,
      platformName: (formData.get("platformName") as string) || null,
      productId: (formData.get("productId") as string) || null,
      productName: (formData.get("productName") as string) || null,
      campaign: (formData.get("campaign") as string) || null,
    };

    const validated = ScheduleSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        message: "Validasi data jadwal gagal",
      };
    }

    // Build structured notes payload
    const metadata = {
      platformId: validated.data.platformId,
      platformName: validated.data.platformName,
      productId: validated.data.productId,
      productName: validated.data.productName,
      campaign: validated.data.campaign,
      customNotes: validated.data.notes,
    };

    await prisma.schedule.create({
      data: {
        personaId: validated.data.personaId || null,
        title: validated.data.title,
        scheduleType: validated.data.scheduleType,
        recurrenceRule: validated.data.recurrenceRule,
        scheduledAt: validated.data.scheduledAt,
        status: validated.data.status,
        notes: JSON.stringify(metadata),
      },
    });

    revalidatePath("/schedule");
    revalidatePath("/best-time");
    revalidatePath("/");

    return {
      success: true,
      message: "Jadwal posting berhasil dibuat!",
    };
  } catch (error) {
    console.error("Error creating schedule:", error);
    return {
      success: false,
      message: "Terjadi kesalahan server saat membuat jadwal posting",
    };
  }
}

export async function updateSchedule(
  id: string,
  prevState: ScheduleActionState | null,
  formData: FormData
): Promise<ScheduleActionState> {
  try {
    const rawData = {
      personaId: (formData.get("personaId") as string) || null,
      title: formData.get("title") as string,
      scheduleType: (formData.get("scheduleType") as string) || "one_time",
      recurrenceRule: (formData.get("recurrenceRule") as string) || null,
      scheduledAt: formData.get("scheduledAt") as string,
      status: (formData.get("status") as string) || "scheduled",
      notes: (formData.get("notes") as string) || null,
      platformId: (formData.get("platformId") as string) || null,
      platformName: (formData.get("platformName") as string) || null,
      productId: (formData.get("productId") as string) || null,
      productName: (formData.get("productName") as string) || null,
      campaign: (formData.get("campaign") as string) || null,
    };

    const validated = ScheduleSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.flatten().fieldErrors,
        message: "Validasi data gagal",
      };
    }

    const metadata = {
      platformId: validated.data.platformId,
      platformName: validated.data.platformName,
      productId: validated.data.productId,
      productName: validated.data.productName,
      campaign: validated.data.campaign,
      customNotes: validated.data.notes,
    };

    await prisma.schedule.update({
      where: { id },
      data: {
        personaId: validated.data.personaId || null,
        title: validated.data.title,
        scheduleType: validated.data.scheduleType,
        recurrenceRule: validated.data.recurrenceRule,
        scheduledAt: validated.data.scheduledAt,
        status: validated.data.status,
        notes: JSON.stringify(metadata),
      },
    });

    revalidatePath("/schedule");
    revalidatePath("/best-time");
    revalidatePath("/");

    return {
      success: true,
      message: "Jadwal posting berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Error updating schedule:", error);
    return {
      success: false,
      message: "Gagal memperbarui jadwal posting",
    };
  }
}

export async function updateScheduleStatus(
  id: string,
  status: "scheduled" | "reminded" | "posted" | "missed"
) {
  try {
    await prisma.schedule.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/schedule");
    revalidatePath("/");

    return { success: true, message: `Status jadwal diubah ke ${status}` };
  } catch (error) {
    console.error("Error updating schedule status:", error);
    return { success: false, error: "Gagal mengubah status jadwal" };
  }
}

export async function deleteSchedule(id: string) {
  try {
    await prisma.schedule.delete({
      where: { id },
    });

    revalidatePath("/schedule");
    revalidatePath("/");

    return { success: true, message: "Jadwal posting berhasil dihapus" };
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return { success: false, error: "Gagal menghapus jadwal posting" };
  }
}

export async function getUpcomingSchedules() {
  try {
    const now = new Date();
    // Fetch schedules in the range from 15 minutes ago to 24 hours ahead
    const pastThreshold = new Date(now.getTime() - 15 * 60 * 1000);
    const futureThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = await prisma.schedule.findMany({
      where: {
        scheduledAt: {
          gte: pastThreshold,
          lte: futureThreshold,
        },
        status: { in: ["scheduled", "reminded"] },
      },
      include: {
        persona: { select: { id: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    return { success: true, data: upcoming };
  } catch (error) {
    console.error("Error fetching upcoming schedules:", error);
    return { success: false, data: [] };
  }
}
