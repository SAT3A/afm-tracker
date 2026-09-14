"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  Package,
  Share2,
  Video,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductFormModal, ProductData } from "./product-form-modal";
import { ProductDetailModal } from "./product-detail-modal";
import { deleteProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";

export interface ProductItem extends ProductData {
  id: string;
  commissionAmount: number;
  distributionsCount: number;
  contentsCount: number;
  createdAt: Date;
}

interface ProductTableProps {
  products: ProductItem[];
  categories: string[];
}

export function ProductTable({ products, categories }: ProductTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Search & Filters state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ProductData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Copy status per product id
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      startTransition(async () => {
        await deleteProduct(id);
        router.refresh();
      });
    }
  };

  // Filter products locally for instant response
  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      search.trim() === "" ||
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.brand.toLowerCase().includes(search.toLowerCase()) ||
      (item.variant && item.variant.toLowerCase().includes(search.toLowerCase())) ||
      (item.campaign && item.campaign.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Aktif
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            Ditunda
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
            Expired
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className={`space-y-4 ${isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}`}>
      {/* Top action toolbar: Search + Category Filter + Status Filter + Add Button */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-center">
          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Cari nama, brand, campaign..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-44 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-background outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-36 h-9 px-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-background outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="active">🟢 Aktif</option>
              <option value="paused">🟡 Ditunda</option>
              <option value="expired">🔴 Expired</option>
            </select>
          </div>
        </div>

        {/* Add Product Button */}
        <Button
          onClick={() => {
            setProductToEdit(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-9 text-xs font-semibold shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50/70 dark:bg-slate-900/70">
            <TableRow>
              <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300 w-[280px]">
                Produk & Brand
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Kategori
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Harga
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Komisi (%)
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Link Affiliate
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Status
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center">
                Aktivitas
              </TableHead>
              <TableHead className="text-xs font-bold text-slate-700 dark:text-slate-300 text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <Package className="w-10 h-10 stroke-[1.3] text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-sm font-semibold">
                      {products.length === 0
                        ? "Belum ada produk yang ditambahkan"
                        : "Tidak ada produk yang cocok dengan pencarian"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {products.length === 0
                        ? "Mulai dengan menambahkan produk affiliate Shopee pertama Anda."
                        : "Coba ubah kata kunci atau filter yang Anda gunakan."}
                    </p>
                    {products.length === 0 && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setProductToEdit(null);
                          setIsFormOpen(true);
                        }}
                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Tambah Produk Sekarang
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((item) => {
                const isCopied = copiedId === item.id;
                return (
                  <TableRow
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(item);
                      setIsDetailOpen(true);
                    }}
                  >
                    {/* Produk & Brand */}
                    <TableCell className="py-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          {item.brand}
                        </span>
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 hover:text-blue-600 transition-colors">
                          {item.productName}
                        </p>
                        {item.variant && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            Var: {item.variant}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Kategori */}
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      {item.category}
                    </TableCell>

                    {/* Harga */}
                    <TableCell className="text-xs font-semibold whitespace-nowrap">
                      Rp {item.price.toLocaleString("id-ID")}
                    </TableCell>

                    {/* Komisi */}
                    <TableCell className="whitespace-nowrap">
                      <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {item.commissionRate}%
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Rp {Math.round(item.commissionAmount).toLocaleString("id-ID")}
                      </div>
                    </TableCell>

                    {/* Link Affiliate + Quick Copy */}
                    <TableCell
                      className="py-3 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant={isCopied ? "default" : "outline"}
                          onClick={() => handleCopyLink(item.id, item.affiliateLink)}
                          className="h-7 px-2 text-[11px] gap-1 font-medium"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              Tersalin
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Salin
                            </>
                          )}
                        </Button>

                        <a
                          href={item.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          title="Buka Link di Tab Baru"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell className="whitespace-nowrap">
                      {statusBadge(item.status)}
                    </TableCell>

                    {/* Aktivitas Sebaran & Konten */}
                    <TableCell className="text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400"
                          title="Jumlah Sebaran di Grup"
                        >
                          <Share2 className="w-3 h-3" />
                          {item.distributionsCount}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400"
                          title="Jumlah Konten Video AI"
                        >
                          <Video className="w-3 h-3" />
                          {item.contentsCount}
                        </span>
                      </div>
                    </TableCell>

                    {/* Action Menu */}
                    <TableCell
                      className="text-right py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer outline-none">
                          <MoreVertical className="w-4 h-4 text-slate-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(item);
                              setIsDetailOpen(true);
                            }}
                            className="cursor-pointer gap-2 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setProductToEdit(item);
                              setIsFormOpen(true);
                            }}
                            className="cursor-pointer gap-2 text-xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="cursor-pointer gap-2 text-xs text-red-600 dark:text-red-400 focus:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        product={selectedProduct}
        onEdit={(prod) => {
          setProductToEdit(prod);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
      />

      {/* Product Create / Edit Modal */}
      <ProductFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        productToEdit={productToEdit}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
