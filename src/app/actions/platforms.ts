"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const PlatformSchema = z.object({
  name: z.string().min(1, "Nama grup/channel wajib diisi").trim(),
  platformType: z
    .enum(["facebook", "instagram", "threads", "tiktok", "other"])
    .default("facebook"),
  url: z.string().optional().nullable(),
  category: z
    .string()
    .min(1, "Kategori wajib diisi")
    .trim()
    .default("Sebar link shopee affiliate"),
  requiresApproval: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  status: z
    .enum([
      "active",
      "restricted",
      "pending_approval",
      "suspended",
      "on_hiatus",
      "inactive",
    ])
    .default("active"),
});

export type PlatformActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function getPlatforms(filter?: {
  search?: string;
  platformType?: string;
  status?: string;
  requiresApproval?: boolean;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filter?.status && filter.status !== "all") {
      where.status = filter.status;
    }

    if (filter?.platformType && filter.platformType !== "all") {
      where.platformType = filter.platformType;
    }

    if (filter?.requiresApproval !== undefined) {
      where.requiresApproval = filter.requiresApproval;
    }

    if (filter?.search && filter.search.trim() !== "") {
      const search = filter.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { url: { contains: search, mode: "insensitive" } },
      ];
    }

    const platforms = await prisma.platform.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        distributions: {
          select: {
            distributionType: true,
          },
        },
      },
    });

    return platforms.map(({ distributions, ...p }) => {
      const postsCount = distributions.filter((d) => d.distributionType === "post").length;
      const sharesCount = distributions.length - postsCount;
      return {
        ...p,
        distributionsCount: distributions.length,
        sharesCount,
        postsCount,
      };
    });
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return [];
  }
}

export async function getPlatformCategories() {
  try {
    const platforms = await prisma.platform.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    return platforms.map((p) => p.category).filter(Boolean);
  } catch (error) {
    console.error("Error fetching platform categories:", error);
    return [];
  }
}

export async function createPlatform(
  prevState: PlatformActionState,
  formData: FormData
): Promise<PlatformActionState> {
  const rawData = {
    name: formData.get("name"),
    platformType: formData.get("platformType") || "facebook",
    url: formData.get("url") || null,
    category: formData.get("category") || "Sebar link shopee affiliate",
    requiresApproval: formData.get("requiresApproval") === "true",
    notes: formData.get("notes") || null,
    status: formData.get("status") || "active",
  };

  const validatedFields = PlatformSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Mohon periksa kembali form yang diisi.",
    };
  }

  try {
    const data = validatedFields.data;

    await prisma.platform.create({
      data: {
        name: data.name,
        platformType: data.platformType,
        url: data.url ? data.url.trim() : null,
        category: data.category,
        requiresApproval: data.requiresApproval,
        notes: data.notes ? data.notes.trim() : null,
        status: data.status,
      },
    });

    revalidatePath("/platforms");
    revalidatePath("/distributions");
    revalidatePath("/");

    return {
      success: true,
      message: `Platform "${data.name}" berhasil ditambahkan!`,
    };
  } catch (error) {
    console.error("Create platform error:", error);
    return {
      success: false,
      message: "Gagal menambahkan platform ke database. Silakan coba lagi.",
    };
  }
}

export async function updatePlatform(
  id: string,
  prevState: PlatformActionState,
  formData: FormData
): Promise<PlatformActionState> {
  const rawData = {
    name: formData.get("name"),
    platformType: formData.get("platformType") || "facebook",
    url: formData.get("url") || null,
    category: formData.get("category") || "Sebar link shopee affiliate",
    requiresApproval: formData.get("requiresApproval") === "true",
    notes: formData.get("notes") || null,
    status: formData.get("status") || "active",
  };

  const validatedFields = PlatformSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Mohon periksa kembali form yang diisi.",
    };
  }

  try {
    const data = validatedFields.data;

    await prisma.platform.update({
      where: { id },
      data: {
        name: data.name,
        platformType: data.platformType,
        url: data.url ? data.url.trim() : null,
        category: data.category,
        requiresApproval: data.requiresApproval,
        notes: data.notes ? data.notes.trim() : null,
        status: data.status,
      },
    });

    revalidatePath("/platforms");
    revalidatePath("/distributions");
    revalidatePath("/");

    return {
      success: true,
      message: `Platform "${data.name}" berhasil diperbarui!`,
    };
  } catch (error) {
    console.error("Update platform error:", error);
    return {
      success: false,
      message: "Gagal memperbarui data platform. Silakan coba lagi.",
    };
  }
}

export async function deletePlatform(id: string): Promise<PlatformActionState> {
  try {
    const platform = await prisma.platform.delete({
      where: { id },
    });

    revalidatePath("/platforms");
    revalidatePath("/distributions");
    revalidatePath("/");

    return {
      success: true,
      message: `Platform "${platform.name}" berhasil dihapus.`,
    };
  } catch (error) {
    console.error("Delete platform error:", error);
    return {
      success: false,
      message: "Gagal menghapus platform.",
    };
  }
}

export async function updatePlatformStatus(
  id: string,
  status: string
): Promise<PlatformActionState> {
  try {
    const platform = await prisma.platform.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/platforms");
    revalidatePath("/distributions");
    revalidatePath("/");

    return {
      success: true,
      message: `Status platform "${platform.name}" berhasil diperbarui.`,
    };
  } catch (error) {
    console.error("Update platform status error:", error);
    return {
      success: false,
      message: "Gagal memperbarui status platform.",
    };
  }
}
