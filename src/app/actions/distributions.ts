"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SingleDistributionSchema = z.object({
  platformId: z.string().min(1, "Pilih platform / grup target"),
  personaId: z.string().min(1, "Pilih persona yang menyebar"),
  distributionType: z.enum(["post", "comment"]).default("comment"),
  postUrl: z.string().default(""),
  postedAt: z.coerce.date().default(() => new Date()),
  status: z
    .enum(["posted", "pending_approval", "approved", "deleted", "rejected"])
    .default("posted"),
  campaign: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  productIds: z.array(z.string()).min(1, "Pilih minimal 1 produk"),
});

const BatchDistributionSchema = z.object({
  platformIds: z.array(z.string()).min(1, "Pilih minimal 1 grup/platform target"),
  productIds: z.array(z.string()).min(1, "Pilih minimal 1 produk"),
  personaId: z.string().min(1, "Pilih persona yang menyebar"),
  distributionType: z.enum(["post", "comment"]).default("comment"),
  campaign: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z
    .enum(["posted", "pending_approval", "approved", "deleted", "rejected"])
    .default("posted"),
  postedAt: z.coerce.date().default(() => new Date()),
});

export type DistributionActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function getDistributions(filter?: {
  search?: string;
  platformId?: string;
  personaId?: string;
  distributionType?: string;
  status?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filter?.status && filter.status !== "all") {
      where.status = filter.status;
    }

    if (filter?.platformId && filter.platformId !== "all") {
      where.platformId = filter.platformId;
    }

    if (filter?.personaId && filter.personaId !== "all") {
      where.personaId = filter.personaId;
    }

    if (filter?.distributionType && filter.distributionType !== "all") {
      where.distributionType = filter.distributionType;
    }

    if (filter?.search && filter.search.trim() !== "") {
      const search = filter.search.trim();
      where.OR = [
        { campaign: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
        { postUrl: { contains: search, mode: "insensitive" } },
        { platform: { name: { contains: search, mode: "insensitive" } } },
        { persona: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const distributions = await prisma.distribution.findMany({
      where,
      orderBy: { postedAt: "desc" },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            platformType: true,
            category: true,
            requiresApproval: true,
            url: true,
          },
        },
        persona: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        items: {
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
        engagements: {
          orderBy: { capturedAt: "desc" },
        },
      },
    });

    return distributions.map((d) => ({
      ...d,
      items: d.items.map((i) => ({
        ...i,
        product: {
          ...i.product,
          price: Number(i.product.price),
          commissionRate: Number(i.product.commissionRate),
        },
      })),
      latestEngagement: d.engagements[0] || null,
      engagements: d.engagements,
    }));
  } catch (error) {
    console.error("Error fetching distributions:", error);
    return [];
  }
}

export async function createSingleDistribution(
  prevState: DistributionActionState,
  formData: FormData
): Promise<DistributionActionState> {
  const rawProductIds = formData.get("productIds") as string;
  const productIds = rawProductIds
    ? rawProductIds.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawData = {
    platformId: formData.get("platformId"),
    personaId: formData.get("personaId"),
    distributionType: formData.get("distributionType") || "comment",
    postUrl: (formData.get("postUrl") as string)?.trim() || "",
    postedAt: formData.get("postedAt") || new Date().toISOString(),
    status: formData.get("status") || "posted",
    campaign: formData.get("campaign") || null,
    notes: formData.get("notes") || null,
    productIds,
  };

  const validated = SingleDistributionSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Mohon lengkapi semua data wajib.",
    };
  }

  try {
    const data = validated.data;

    // Check platform's approval setting to automatically set status if not specified
    let finalStatus = data.status;
    if (!formData.get("status")) {
      const platform = await prisma.platform.findUnique({
        where: { id: data.platformId },
        select: { requiresApproval: true },
      });
      if (platform?.requiresApproval) {
        finalStatus = "pending_approval";
      }
    }

    await prisma.$transaction(async (tx) => {
      const dist = await tx.distribution.create({
        data: {
          platformId: data.platformId,
          personaId: data.personaId,
          distributionType: data.distributionType,
          postUrl: data.postUrl,
          postedAt: data.postedAt,
          status: finalStatus,
          campaign: data.campaign,
          notes: data.notes,
        },
      });

      // Insert items
      if (data.productIds.length > 0) {
        await tx.distributionItem.createMany({
          data: data.productIds.map((pId) => ({
            distributionId: dist.id,
            productId: pId,
          })),
        });
      }
    });

    revalidatePath("/distributions");
    revalidatePath("/products");
    revalidatePath("/platforms");
    revalidatePath("/personas");
    revalidatePath("/");

    return {
      success: true,
      message: "Sebaran link berhasil dicatat!",
    };
  } catch (error) {
    console.error("Create single distribution error:", error);
    return {
      success: false,
      message: "Gagal mencatat distribusi ke database.",
    };
  }
}

export async function createBatchDistribution(
  prevState: DistributionActionState,
  formData: FormData
): Promise<DistributionActionState> {
  const rawPlatformIds = formData.get("platformIds") as string;
  const platformIds = rawPlatformIds
    ? rawPlatformIds.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawProductIds = formData.get("productIds") as string;
  const productIds = rawProductIds
    ? rawProductIds.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawData = {
    platformIds,
    productIds,
    personaId: formData.get("personaId"),
    distributionType: formData.get("distributionType") || "comment",
    campaign: formData.get("campaign") || null,
    notes: formData.get("notes") || null,
    status: formData.get("status") || "posted",
    postedAt: formData.get("postedAt") || new Date().toISOString(),
  };

  const validated = BatchDistributionSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Mohon lengkapi produk, grup target, dan persona.",
    };
  }

  try {
    const data = validated.data;

    // Fetch platforms to know which ones require approval
    const platforms = await prisma.platform.findMany({
      where: { id: { in: data.platformIds } },
      select: { id: true, name: true, requiresApproval: true },
    });

    const platformApprovalMap = new Map(
      platforms.map((p) => [p.id, p.requiresApproval])
    );

    // Execute in transaction
    await prisma.$transaction(async (tx) => {
      for (const pId of data.platformIds) {
        const needsApproval = platformApprovalMap.get(pId) ?? false;
        const status = needsApproval ? "pending_approval" : data.status;

        const dist = await tx.distribution.create({
          data: {
            platformId: pId,
            personaId: data.personaId,
            distributionType: data.distributionType,
            postUrl: "", // Can be filled later after sebar
            postedAt: data.postedAt,
            status,
            campaign: data.campaign,
            notes: data.notes,
          },
        });

        // Add products to this distribution
        await tx.distributionItem.createMany({
          data: data.productIds.map((prodId) => ({
            distributionId: dist.id,
            productId: prodId,
          })),
        });
      }
    });

    revalidatePath("/distributions");
    revalidatePath("/products");
    revalidatePath("/platforms");
    revalidatePath("/personas");
    revalidatePath("/");

    return {
      success: true,
      message: `Berhasil membuat ${data.platformIds.length} distribusi sebar link sekaligus!`,
    };
  } catch (error) {
    console.error("Batch distribution error:", error);
    return {
      success: false,
      message: "Gagal menyimpan batch sebar link.",
    };
  }
}

export async function updateDistribution(
  id: string,
  prevState: DistributionActionState,
  formData: FormData
): Promise<DistributionActionState> {
  const rawProductIds = formData.get("productIds") as string;
  const productIds = rawProductIds
    ? rawProductIds.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const rawData = {
    platformId: formData.get("platformId"),
    personaId: formData.get("personaId"),
    distributionType: formData.get("distributionType") || "comment",
    postUrl: (formData.get("postUrl") as string)?.trim() || "",
    postedAt: formData.get("postedAt") || new Date().toISOString(),
    status: formData.get("status") || "posted",
    campaign: formData.get("campaign") || null,
    notes: formData.get("notes") || null,
    productIds,
  };

  const validated = SingleDistributionSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Mohon lengkapi semua data wajib.",
    };
  }

  try {
    const data = validated.data;

    await prisma.$transaction(async (tx) => {
      await tx.distribution.update({
        where: { id },
        data: {
          platformId: data.platformId,
          personaId: data.personaId,
          distributionType: data.distributionType,
          postUrl: data.postUrl,
          postedAt: data.postedAt,
          status: data.status,
          campaign: data.campaign,
          notes: data.notes,
        },
      });

      // Update distribution items
      await tx.distributionItem.deleteMany({
        where: { distributionId: id },
      });

      if (data.productIds.length > 0) {
        await tx.distributionItem.createMany({
          data: data.productIds.map((pId) => ({
            distributionId: id,
            productId: pId,
          })),
        });
      }
    });

    revalidatePath("/distributions");
    revalidatePath("/");

    return {
      success: true,
      message: "Data distribusi berhasil diperbarui!",
    };
  } catch (error) {
    console.error("Update distribution error:", error);
    return {
      success: false,
      message: "Gagal memperbarui data distribusi.",
    };
  }
}

export async function updateDistributionStatus(
  id: string,
  status: "posted" | "pending_approval" | "approved" | "deleted" | "rejected"
) {
  try {
    await prisma.distribution.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/distributions");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, message: "Gagal mengubah status." };
  }
}

export async function updateDistributionPostUrl(id: string, postUrl: string) {
  try {
    await prisma.distribution.update({
      where: { id },
      data: { postUrl: postUrl.trim() },
    });

    revalidatePath("/distributions");
    return { success: true };
  } catch (error) {
    console.error("Update post url error:", error);
    return { success: false, message: "Gagal memperbarui link postingan." };
  }
}

export async function deleteDistribution(id: string): Promise<DistributionActionState> {
  try {
    await prisma.distribution.delete({
      where: { id },
    });

    revalidatePath("/distributions");
    revalidatePath("/products");
    revalidatePath("/platforms");
    revalidatePath("/personas");
    revalidatePath("/");

    return {
      success: true,
      message: "Distribusi berhasil dihapus.",
    };
  } catch (error) {
    console.error("Delete distribution error:", error);
    return {
      success: false,
      message: "Gagal menghapus distribusi.",
    };
  }
}

const DistributionEngagementSchema = z.object({
  likesCount: z.coerce.number().min(0).default(0),
  viewsCount: z.coerce.number().min(0).default(0),
  sharesCount: z.coerce.number().min(0).default(0),
  clicksCount: z.coerce.number().min(0).default(0),
  ordersCount: z.coerce.number().min(0).optional().nullable(),
  capturedAt: z.coerce.date().default(() => new Date()),
});

export async function addDistributionEngagement(
  distributionId: string,
  prevState: DistributionActionState,
  formData: FormData
): Promise<DistributionActionState> {
  const rawData = {
    likesCount: formData.get("likesCount") || 0,
    viewsCount: formData.get("viewsCount") || 0,
    sharesCount: formData.get("sharesCount") || 0,
    clicksCount: formData.get("clicksCount") || 0,
    ordersCount: formData.get("ordersCount")
      ? Number(formData.get("ordersCount"))
      : null,
    capturedAt: formData.get("capturedAt") || new Date().toISOString(),
  };

  const validated = DistributionEngagementSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
      message: "Mohon periksa kembali isian angka engagement.",
    };
  }

  try {
    await prisma.distributionEngagement.create({
      data: {
        distributionId,
        likesCount: validated.data.likesCount,
        viewsCount: validated.data.viewsCount,
        sharesCount: validated.data.sharesCount,
        clicksCount: validated.data.clicksCount,
        ordersCount: validated.data.ordersCount,
        capturedAt: validated.data.capturedAt,
      },
    });

    revalidatePath("/distributions");
    revalidatePath("/");

    return {
      success: true,
      message: "Metrik engagement sebaran berhasil disimpan!",
    };
  } catch (error) {
    console.error("Add distribution engagement error:", error);
    return {
      success: false,
      message: "Gagal menyimpan metrik engagement.",
    };
  }
}

export async function deleteDistributionEngagement(
  engagementId: string
): Promise<DistributionActionState> {
  try {
    await prisma.distributionEngagement.delete({
      where: { id: engagementId },
    });

    revalidatePath("/distributions");
    revalidatePath("/");

    return {
      success: true,
      message: "Metrik engagement berhasil dihapus.",
    };
  } catch (error) {
    console.error("Delete distribution engagement error:", error);
    return {
      success: false,
      message: "Gagal menghapus engagement.",
    };
  }
}

export type DuplicateCheckResult = {
  productId: string;
  productName: string;
  platformId: string;
  platformName: string;
  postedAt: string;
  distributionType: string;
  postUrl: string;
};

export async function checkDuplicateDistributions(
  platformIds: string[],
  productIds: string[]
): Promise<DuplicateCheckResult[]> {
  if (!platformIds.length || !productIds.length) return [];

  try {
    const existing = await prisma.distributionItem.findMany({
      where: {
        productId: { in: productIds },
        distribution: {
          platformId: { in: platformIds },
        },
      },
      include: {
        product: { select: { id: true, productName: true } },
        distribution: {
          select: {
            platformId: true,
            postedAt: true,
            distributionType: true,
            postUrl: true,
            platform: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: {
        distribution: {
          postedAt: "desc",
        },
      },
    });

    return existing.map((item) => ({
      productId: item.product.id,
      productName: item.product.productName,
      platformId: item.distribution.platformId,
      platformName: item.distribution.platform.name,
      postedAt: item.distribution.postedAt.toISOString(),
      distributionType: item.distribution.distributionType,
      postUrl: item.distribution.postUrl,
    }));
  } catch (error) {
    console.error("Check duplicate distributions error:", error);
    return [];
  }
}
