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
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            Aktif
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Ditunda
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
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
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
              className="w-full sm:w-44 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
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
              className="w-full sm:w-36 h-9 px-3 text-xs rounded-lg border border-input bg-background outline-none focus:border-ring focus:ring-1 focus:ring-ring font-medium"
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
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-9 text-xs font-semibold shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold text-muted-foreground w-[280px]">
                Produk & Brand
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Kategori
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Harga
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Komisi (%)
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Link Affiliate
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-center">
                Aktivitas
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground text-right">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Package className="w-10 h-10 stroke-[1.3] text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold">
                      {products.length === 0
                        ? "Belum ada produk yang ditambahkan"
                        : "Tidak ada produk yang cocok dengan pencarian"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
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
                        className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
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
                    className="hover:bg-muted/40 cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(item);
                      setIsDetailOpen(true);
                    }}
                  >
                    {/* Produk & Brand */}
                    <TableCell className="py-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                          {item.brand}
                        </span>
                        <p className="text-xs font-semibold text-foreground line-clamp-1 hover:text-primary transition-colors">
                          {item.productName}
                        </p>
                        {item.variant && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            Var: {item.variant}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {/* Kategori */}
                    <TableCell className="text-xs text-muted-foreground">
                      {item.category}
                    </TableCell>

                    {/* Harga */}
                    <TableCell className="text-xs font-semibold whitespace-nowrap">
                      Rp {item.price.toLocaleString("id-ID")}
                    </TableCell>

                    {/* Komisi */}
                    <TableCell className="whitespace-nowrap">
                      <div className="text-xs font-bold text-primary">
                        {item.commissionRate}%
                      </div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
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
                              <Check className="w-3 h-3 text-teal-500" />
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
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
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
                      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400"
                          title="Jumlah Sebaran di Grup"
                        >
                          <Share2 className="w-3 h-3" />
                          {item.distributionsCount}
                        </span>
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-primary"
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
                        <DropdownMenuTrigger className="p-1.5 rounded-lg hover:bg-muted cursor-pointer outline-none">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
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
                            className="cursor-pointer gap-2 text-xs text-destructive focus:text-destructive"
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
