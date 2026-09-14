"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ProductSchema = z.object({
  brand: z.string().min(1, "Brand wajib diisi").trim(),
  category: z.string().min(1, "Kategori wajib diisi").trim(),
  productName: z.string().min(1, "Nama produk wajib diisi").trim(),
  variant: z.string().optional().nullable(),
  affiliateLink: z
    .string()
    .min(1, "Link affiliate wajib diisi")
    .trim(),
  originalLink: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  commissionRate: z.coerce
    .number()
    .min(0, "Komisi minimal 0%")
    .max(100, "Komisi maksimal 100%"),
  tags: z.string().optional().nullable(),
  campaign: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["active", "expired", "paused"]).default("active"),
});

export type ProductActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function getProducts(filter?: {
  search?: string;
  category?: string;
  status?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filter?.status && filter.status !== "all") {
      where.status = filter.status;
    }

    if (filter?.category && filter.category !== "all") {
      where.category = {
        equals: filter.category,
        mode: "insensitive",
      };
    }

    if (filter?.search && filter.search.trim() !== "") {
      const search = filter.search.trim();
      where.OR = [
        { productName: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { campaign: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            distributionItems: true,
            contentProducts: true,
          },
        },
      },
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
      commissionRate: Number(p.commissionRate),
      commissionAmount: (Number(p.price) * Number(p.commissionRate)) / 100,
      status: p.status as "active" | "expired" | "paused",
      distributionsCount: p._count.distributionItems,
      contentsCount: p._count.contentProducts,
    }));
  } catch (error) {
    console.error("Failed to get products:", error);
    return [];
  }
}

export async function getProductCategories() {
  try {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    return products.map((p) => p.category);
  } catch {
    return [];
  }
}

export async function createProduct(
  prevState: ProductActionState | undefined,
  formData: FormData
): Promise<ProductActionState> {
  const rawData = {
    brand: formData.get("brand"),
    category: formData.get("category"),
    productName: formData.get("productName"),
    variant: formData.get("variant") || null,
    affiliateLink: formData.get("affiliateLink"),
    originalLink: formData.get("originalLink") || null,
    price: formData.get("price"),
    commissionRate: formData.get("commissionRate"),
    tags: formData.get("tags") || null,
    campaign: formData.get("campaign") || null,
    notes: formData.get("notes") || null,
    status: formData.get("status") || "active",
  };

  const validated = ProductSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;
  const tagsArray = data.tags
    ? data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  try {
    await prisma.product.create({
      data: {
        brand: data.brand,
        category: data.category,
        productName: data.productName,
        variant: data.variant,
        affiliateLink: data.affiliateLink,
        originalLink: data.originalLink,
        price: data.price,
        commissionRate: data.commissionRate,
        tags: tagsArray,
        campaign: data.campaign,
        notes: data.notes,
        status: data.status,
      },
    });

    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, message: "Produk berhasil ditambahkan!" };
  } catch (error) {
    console.error("Failed to create product:", error);
    return {
      success: false,
      message: "Gagal menyimpan produk ke database.",
    };
  }
}

export async function updateProduct(
  id: string,
  prevState: ProductActionState | undefined,
  formData: FormData
): Promise<ProductActionState> {
  const rawData = {
    brand: formData.get("brand"),
    category: formData.get("category"),
    productName: formData.get("productName"),
    variant: formData.get("variant") || null,
    affiliateLink: formData.get("affiliateLink"),
    originalLink: formData.get("originalLink") || null,
    price: formData.get("price"),
    commissionRate: formData.get("commissionRate"),
    tags: formData.get("tags") || null,
    campaign: formData.get("campaign") || null,
    notes: formData.get("notes") || null,
    status: formData.get("status") || "active",
  };

  const validated = ProductSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const data = validated.data;
  const tagsArray = data.tags
    ? data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  try {
    await prisma.product.update({
      where: { id },
      data: {
        brand: data.brand,
        category: data.category,
        productName: data.productName,
        variant: data.variant,
        affiliateLink: data.affiliateLink,
        originalLink: data.originalLink,
        price: data.price,
        commissionRate: data.commissionRate,
        tags: tagsArray,
        campaign: data.campaign,
        notes: data.notes,
        status: data.status,
      },
    });

    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, message: "Produk berhasil diperbarui!" };
  } catch (error) {
    console.error("Failed to update product:", error);
    return {
      success: false,
      message: "Gagal memperbarui produk.",
    };
  }
}

export async function deleteProduct(id: string): Promise<ProductActionState> {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/products");
    revalidatePath("/");
    return { success: true, message: "Produk berhasil dihapus." };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, message: "Gagal menghapus produk." };
  }
}
