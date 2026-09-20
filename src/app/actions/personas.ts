"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PersonaSchema = z.object({
  name: z.string().min(1, "Nama persona wajib diisi").trim(),
  niches: z.array(z.string()).min(1, "Minimal pilih atau isi 1 niche/topik"),
  description: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  platforms: z.record(z.string(), z.string()).optional().nullable(),
  status: z.enum(["active", "on_hiatus", "deactive", "inactive"]).default("active"),
});

export type PersonaActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export interface PersonaItem {
  id: string;
  name: string;
  niches: string[];
  description: string | null;
  avatarUrl: string | null;
  platforms: Record<string, string> | null;
  status: string;
  distributionsCount: number;
  contentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getPersonas(filter?: {
  search?: string;
  niche?: string;
  status?: string;
}): Promise<PersonaItem[]> {
  try {
    const where: Record<string, unknown> = {};

    if (filter?.status && filter.status !== "all") {
      where.status = filter.status;
    }

    if (filter?.search && filter.search.trim() !== "") {
      const search = filter.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const personas = await prisma.persona.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            distributions: true,
            contents: true,
          },
        },
      },
    });

    return personas.map((p) => {
      // Ensure niches is an array of strings
      let parsedNiches: string[] = [];
      if (Array.isArray(p.niches)) {
        parsedNiches = p.niches as string[];
      } else if (typeof p.niches === "string") {
        try {
          const parsed = JSON.parse(p.niches);
          parsedNiches = Array.isArray(parsed) ? parsed : [p.niches];
        } catch {
          parsedNiches = [p.niches];
        }
      }

      // Ensure platforms is an object
      let parsedPlatforms: Record<string, string> | null = null;
      if (p.platforms && typeof p.platforms === "object" && !Array.isArray(p.platforms)) {
        parsedPlatforms = p.platforms as Record<string, string>;
      } else if (typeof p.platforms === "string") {
        try {
          parsedPlatforms = JSON.parse(p.platforms);
        } catch {
          parsedPlatforms = null;
        }
      }

      return {
        id: p.id,
        name: p.name,
        niches: parsedNiches,
        description: p.description,
        avatarUrl: p.avatarUrl,
        platforms: parsedPlatforms,
        status: p.status,
        distributionsCount: p._count.distributions,
        contentsCount: p._count.contents,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error fetching personas:", error);
    return [];
  }
}

export async function createPersona(
  prevState: PersonaActionState,
  formData: FormData
): Promise<PersonaActionState> {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const avatarUrl = (formData.get("avatarUrl") as string) || null;
  const status = (formData.get("status") as string) || "active";

  // Parse niches from comma-separated string or array
  const rawNiches = formData.get("niches") as string;
  const niches = rawNiches
    ? rawNiches
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];

  // Parse social accounts
  const fbAccount = (formData.get("fbAccount") as string)?.trim() || "";
  const igAccount = (formData.get("igAccount") as string)?.trim() || "";
  const tiktokAccount = (formData.get("tiktokAccount") as string)?.trim() || "";
  const threadsAccount = (formData.get("threadsAccount") as string)?.trim() || "";

  const platforms: Record<string, string> = {};
  if (fbAccount) platforms.facebook = fbAccount;
  if (igAccount) platforms.instagram = igAccount;
  if (tiktokAccount) platforms.tiktok = tiktokAccount;
  if (threadsAccount) platforms.threads = threadsAccount;

  const validated = PersonaSchema.safeParse({
    name,
    niches,
    description,
    avatarUrl,
    platforms: Object.keys(platforms).length > 0 ? platforms : null,
    status,
  });

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Mohon periksa data yang Anda masukkan.",
    };
  }

  try {
    const data = validated.data;
    await prisma.persona.create({
      data: {
        name: data.name,
        niches: data.niches,
        description: data.description,
        avatarUrl: data.avatarUrl,
        platforms: data.platforms || undefined,
        status: data.status,
      },
    });

    revalidatePath("/personas");
    revalidatePath("/distributions");
    revalidatePath("/content");
    revalidatePath("/");

    return {
      success: true,
      message: `Persona "${data.name}" berhasil dibuat!`,
    };
  } catch (error) {
    console.error("Create persona error:", error);
    return {
      success: false,
      message: "Gagal menyimpan persona ke database.",
    };
  }
}

export async function updatePersona(
  id: string,
  prevState: PersonaActionState,
  formData: FormData
): Promise<PersonaActionState> {
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const avatarUrl = (formData.get("avatarUrl") as string) || null;
  const status = (formData.get("status") as string) || "active";

  const rawNiches = formData.get("niches") as string;
  const niches = rawNiches
    ? rawNiches
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];

  const fbAccount = (formData.get("fbAccount") as string)?.trim() || "";
  const igAccount = (formData.get("igAccount") as string)?.trim() || "";
  const tiktokAccount = (formData.get("tiktokAccount") as string)?.trim() || "";
  const threadsAccount = (formData.get("threadsAccount") as string)?.trim() || "";

  const platforms: Record<string, string> = {};
  if (fbAccount) platforms.facebook = fbAccount;
  if (igAccount) platforms.instagram = igAccount;
  if (tiktokAccount) platforms.tiktok = tiktokAccount;
  if (threadsAccount) platforms.threads = threadsAccount;

  const validated = PersonaSchema.safeParse({
    name,
    niches,
    description,
    avatarUrl,
    platforms: Object.keys(platforms).length > 0 ? platforms : null,
    status,
  });

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Mohon periksa data yang Anda masukkan.",
    };
  }

  try {
    const data = validated.data;
    await prisma.persona.update({
      where: { id },
      data: {
        name: data.name,
        niches: data.niches,
        description: data.description,
        avatarUrl: data.avatarUrl,
        platforms: data.platforms || undefined,
        status: data.status,
      },
    });

    revalidatePath("/personas");
    revalidatePath("/distributions");
    revalidatePath("/content");
    revalidatePath("/");

    return {
      success: true,
      message: `Persona "${data.name}" berhasil diperbarui!`,
    };
  } catch (error) {
    console.error("Update persona error:", error);
    return {
      success: false,
      message: "Gagal memperbarui data persona.",
    };
  }
}

export async function deletePersona(id: string): Promise<PersonaActionState> {
  try {
    const persona = await prisma.persona.delete({
      where: { id },
    });

    revalidatePath("/personas");
    revalidatePath("/distributions");
    revalidatePath("/content");
    revalidatePath("/");

    return {
      success: true,
      message: `Persona "${persona.name}" berhasil dihapus.`,
    };
  } catch (error) {
    console.error("Delete persona error:", error);
    return {
      success: false,
      message: "Gagal menghapus persona.",
    };
  }
}

export async function updatePersonaStatus(
  id: string,
  status: "active" | "on_hiatus" | "deactive" | "inactive"
): Promise<PersonaActionState> {
  try {
    const persona = await prisma.persona.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/personas");
    revalidatePath("/distributions");
    revalidatePath("/content");
    revalidatePath("/");

    return {
      success: true,
      message: `Status persona "${persona.name}" berhasil diubah menjadi ${
        status === "on_hiatus"
          ? "On Hiatus"
          : status === "active"
          ? "Aktif"
          : status === "deactive"
          ? "Deactive"
          : "Nonaktif"
      }.`,
    };
  } catch (error) {
    console.error("Update persona status error:", error);
    return {
      success: false,
      message: "Gagal memperbarui status persona.",
    };
  }
}

