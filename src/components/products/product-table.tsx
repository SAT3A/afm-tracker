"use client";

import { useState, useTransition, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
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
  updatedAt: Date;
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

  // Delete Alert Dialog state
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Copy status per product id
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleRequestDelete = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      setProductToDelete(target);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const target = productToDelete;
    startTransition(async () => {
      try {
        const res = await deleteProduct(target.id);
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
        if (res && res.success === false) {
          toast.error("Gagal menghapus produk", {
            description: res.message || "Terjadi kesalahan saat menghapus data.",
          });
        } else {
          toast.error("Data produk berhasil dihapus");
          router.refresh();
        }
      } catch (error) {
        toast.error("Terjadi kesalahan sistem", {
          description: "Tidak dapat menghapus produk saat ini.",
        });
        console.error(error);
      }
    });
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setCurrentPage(1);
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

  // Pagination state & calculations (10 products per page)
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Auto-reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedStatus]);

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
            Active
          </span>
        );
      case "hold":
      case "paused":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
            Hold
          </span>
        );
      case "non_active":
      case "expired":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            Non Active
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
              <option value="active">🟢 Active</option>
              <option value="hold">🟡 Hold</option>
              <option value="non_active">🔴 Non Active</option>
            </select>

            {/* Reset Filter Button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleResetFilters}
              className="h-9 w-9 border-input hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
              title="Reset filter & datatable"
              aria-label="Reset filter & datatable"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
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
              paginatedProducts.map((item) => {
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
                            onClick={() => handleRequestDelete(item.id)}
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

      {/* Pagination Controls (10 products per page) */}
      {totalItems > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1 text-xs text-muted-foreground">
          <div>
            Menampilkan <span className="font-semibold text-foreground">{startIndex + 1}</span> -{" "}
            <span className="font-semibold text-foreground">{endIndex}</span> dari{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> produk
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={safeCurrentPage <= 1}
                className="h-8 w-8 p-0"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first, last, and pages around current page
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= safeCurrentPage - 1 && pageNum <= safeCurrentPage + 1)
                ) {
                  const isActive = pageNum === safeCurrentPage;
                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-8 min-w-8 px-2 text-xs font-semibold ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {pageNum}
                    </Button>
                  );
                }

                if (
                  (pageNum === safeCurrentPage - 2 && pageNum > 1) ||
                  (pageNum === safeCurrentPage + 2 && pageNum < totalPages)
                ) {
                  return (
                    <span key={pageNum} className="px-1 text-muted-foreground">
                      ...
                    </span>
                  );
                }

                return null;
              })}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={safeCurrentPage >= totalPages}
                className="h-8 w-8 p-0"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        product={selectedProduct}
        onEdit={(prod) => {
          setProductToEdit(prod);
          setIsFormOpen(true);
        }}
        onDelete={handleRequestDelete}
      />

      {/* Product Create / Edit Modal */}
      <ProductFormModal
        key={productToEdit?.id || (isFormOpen ? "new" : "closed")}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        productToEdit={productToEdit}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-foreground">
              Hapus Data Produk?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-1 text-xs text-muted-foreground block">
              <span className="block">Apakah Anda yakin ingin menghapus produk ini?</span>

              <span className="block p-3 rounded-lg bg-muted/60 border border-border/80 text-foreground font-semibold text-sm leading-relaxed text-center">
                &ldquo;{productToDelete?.productName}&rdquo;
              </span>

              <span className="block text-[11px] text-muted-foreground/80 leading-relaxed">
                Tindakan ini akan menghapus produk dari katalog secara permanen dan tidak dapat dibatalkan.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Produk"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
