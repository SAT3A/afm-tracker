import { PageSkeleton } from "@/components/page-skeleton";

export default function ContentLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="h-16 border-b border-border bg-card/80 animate-pulse" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageSkeleton title="Memuat Konten Video AI..." />
      </main>
    </div>
  );
}
