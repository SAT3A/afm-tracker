"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ContentSchema = z.object({
  personaId: z.string().min(1, "Pilih persona kreator"),
  title: z.string().min(2, "Judul video minimal 2 karakter").trim(),
  contentType: z
    .enum(["shopee_video", "fb_reels", "ig_reels", "tiktok", "other"])
    .default("shopee_video"),
  platformUrl: z.string().url("URL platform harus valid").or(z.literal("")),
  campaign: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["published", "draft", "deleted"]).default("published"),
  publishedAt: z.coerce.date().default(() => new Date()),
  productIds: z.array(z.string()).default([]),
});

const ContentMetricSchema = z.object({
  viewsCount: z.coerce.number().min(0).default(0),
  likesCount: z.coerce.number().min(0).default(0),
  commentsCount: z.coerce.number().min(0).default(0),
  sharesCount: z.coerce.number().min(0).default(0),
  savesCount: z.coerce.number().min(0).optional().nullable(),
  clicksCount: z.coerce.number().min(0).optional().nullable(),
  capturedAt: z.coerce.date().default(() => new Date()),
});

export type ContentActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function getContent(filter?: {
  search?: string;
  personaId?: string;
  contentType?: string;
  campaign?: string;
  status?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filter?.status && filter.status !== "all") {
      where.status = filter.status;
    }

    if (filter?.personaId && filter.personaId !== "all") {
      where.personaId = filter.personaId;
    }

    if (filter?.contentType && filter.contentType !== "all") {
      where.contentType = filter.contentType;
    }

    if (filter?.campaign && filter.campaign !== "all") {
      where.campaign = filter.campaign;
    }

    if (filter?.search && filter.search.trim() !== "") {
      const search = filter.search.trim();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { platformUrl: { contains: search, mode: "insensitive" } },
        { campaign: { contains: search, mode: "insensitive" } },
        { persona: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const contents = await prisma.content.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                brand: true,
                category: true,
                price: true,
                commissionRate: true,
                affiliateLink: true,
              },
            },
          },
        },
        metrics: {
          orderBy: { capturedAt: "desc" },
        },
      },
    });

    return contents.map((c) => {
      const latestMetric = c.metrics[0] || null;
      return {
        ...c,
        products: c.products.map((p) => ({
          ...p,
          product: {
            ...p.product,
            price: Number(p.product.price),
            commissionRate: Number(p.product.commissionRate),
          },
        })),
        latestMetric,
        metricsHistory: c.metrics,
      };
    });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return [];
  }
}

export async function getContentById(id: string) {
  try {
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                productName: true,
                brand: true,
                category: true,
                price: true,
                commissionRate: true,
                affiliateLink: true,
              },
            },
          },
        },
        metrics: {
          orderBy: { capturedAt: "desc" },
        },
      },
    });

    if (!content) return null;

    return {
      ...content,
      products: content.products.map((p) => ({
        ...p,
        product: {
          ...p.product,
          price: Number(p.product.price),
          commissionRate: Number(p.product.commissionRate),
        },
      })),
      latestMetric: content.metrics[0] || null,
      metricsHistory: content.metrics,
    };
  } catch (error) {
    console.error("Error fetching content by id:", error);
    return null;
  }
}

export async function createContent(
  prevState: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const rawProductIds = formData.get("productIds") as string;
  const productIds = rawProductIds
    ? rawProductIds.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawData = {
    personaId: formData.get("personaId"),
    title: formData.get("title"),
    contentType: formData.get("contentType") || "shopee_video",
    platformUrl: (formData.get("platformUrl") as string)?.trim() || "",
    campaign: (formData.get("campaign") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
    status: formData.get("status") || "published",
    publishedAt: formData.get("publishedAt") || new Date().toISOString(),
    productIds,
  };

  const validated = ContentSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Mohon lengkapi semua data wajib konten video.",
    };
  }

  try {
    const data = validated.data;

    await prisma.$transaction(async (tx) => {
      const content = await tx.content.create({
        data: {
          personaId: data.personaId,
          title: data.title,
          contentType: data.contentType,
          platformUrl: data.platformUrl,
          campaign: data.campaign,
          notes: data.notes,
          status: data.status,
          publishedAt: data.publishedAt,
        },
      });

      if (data.productIds.length > 0) {
        await tx.contentProduct.createMany({
          data: data.productIds.map((pId) => ({
            contentId: content.id,
            productId: pId,
          })),
        });
      }

      // If initial views/likes were submitted optionally
      const initialViews = Number(formData.get("initialViews") || 0);
      const initialLikes = Number(formData.get("initialLikes") || 0);
      const initialComments = Number(formData.get("initialComments") || 0);
      const initialClicks = Number(formData.get("initialClicks") || 0);

      if (initialViews > 0 || initialLikes > 0 || initialClicks > 0) {
        await tx.contentMetric.create({
          data: {
            contentId: content.id,
            viewsCount: initialViews,
            likesCount: initialLikes,
            commentsCount: initialComments,
            clicksCount: initialClicks,
            capturedAt: new Date(),
          },
        });
      }
    });

    revalidatePath("/content");
    revalidatePath("/");
    revalidatePath("/personas");
    revalidatePath("/products");

    return {
      success: true,
      message: "Konten video AI berhasil ditambahkan!",
    };
  } catch (error) {
    console.error("Create content error:", error);
    return {
      success: false,
      message: "Gagal menyimpan konten video ke database.",
    };
  }
}

export async function updateContent(
  id: string,
  prevState: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const rawProductIds = formData.get("productIds") as string;
  const productIds = rawProductIds
    ? rawProductIds.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawData = {
    personaId: formData.get("personaId"),
    title: formData.get("title"),
    contentType: formData.get("contentType") || "shopee_video",
    platformUrl: (formData.get("platformUrl") as string)?.trim() || "",
    campaign: (formData.get("campaign") as string)?.trim() || null,
    notes: (formData.get("notes") as string)?.trim() || null,
    status: formData.get("status") || "published",
    publishedAt: formData.get("publishedAt") || new Date().toISOString(),
    productIds,
  };

  const validated = ContentSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Mohon lengkapi semua data wajib konten video.",
    };
  }

  try {
    const data = validated.data;

    await prisma.$transaction(async (tx) => {
      await tx.content.update({
        where: { id },
        data: {
          personaId: data.personaId,
          title: data.title,
          contentType: data.contentType,
          platformUrl: data.platformUrl,
          campaign: data.campaign,
          notes: data.notes,
          status: data.status,
          publishedAt: data.publishedAt,
        },
      });

      // Sync products
      await tx.contentProduct.deleteMany({
        where: { contentId: id },
      });

      if (data.productIds.length > 0) {
        await tx.contentProduct.createMany({
          data: data.productIds.map((pId) => ({
            contentId: id,
            productId: pId,
          })),
        });
      }
    });

    revalidatePath("/content");
    revalidatePath("/");

    return {
      success: true,
      message: "Data konten video berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Update content error:", error);
    return {
      success: false,
      message: "Gagal memperbarui data konten video.",
    };
  }
}

export async function deleteContent(id: string): Promise<ContentActionState> {
  try {
    await prisma.content.delete({
      where: { id },
    });

    revalidatePath("/content");
    revalidatePath("/");
    return {
      success: true,
      message: "Konten video berhasil dihapus.",
    };
  } catch (error) {
    console.error("Delete content error:", error);
    return {
      success: false,
      message: "Gagal menghapus konten video.",
    };
  }
}

export async function addContentMetric(
  contentId: string,
  prevState: ContentActionState,
  formData: FormData
): Promise<ContentActionState> {
  const rawData = {
    viewsCount: formData.get("viewsCount") || 0,
    likesCount: formData.get("likesCount") || 0,
    commentsCount: formData.get("commentsCount") || 0,
    sharesCount: formData.get("sharesCount") || 0,
    savesCount: formData.get("savesCount")
      ? Number(formData.get("savesCount"))
      : null,
    clicksCount: formData.get("clicksCount")
      ? Number(formData.get("clicksCount"))
      : null,
    capturedAt: formData.get("capturedAt") || new Date().toISOString(),
  };

  const validated = ContentMetricSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Periksa kembali isian angka metrik.",
    };
  }

  try {
    await prisma.contentMetric.create({
      data: {
        contentId,
        viewsCount: validated.data.viewsCount,
        likesCount: validated.data.likesCount,
        commentsCount: validated.data.commentsCount,
        sharesCount: validated.data.sharesCount,
        savesCount: validated.data.savesCount,
        clicksCount: validated.data.clicksCount,
        capturedAt: validated.data.capturedAt,
      },
    });

    revalidatePath("/content");
    revalidatePath("/");

    return {
      success: true,
      message: "Metrik performa video berhasil dicatat!",
    };
  } catch (error) {
    console.error("Add content metric error:", error);
    return {
      success: false,
      message: "Gagal menyimpan metrik video.",
    };
  }
}

export async function deleteContentMetric(
  metricId: string
): Promise<ContentActionState> {
  try {
    await prisma.contentMetric.delete({
      where: { id: metricId },
    });

    revalidatePath("/content");
    revalidatePath("/");

    return {
      success: true,
      message: "Catatan metrik berhasil dihapus.",
    };
  } catch (error) {
    console.error("Delete content metric error:", error);
    return {
      success: false,
      message: "Gagal menghapus metrik.",
    };
  }
}
