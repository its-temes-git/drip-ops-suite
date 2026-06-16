import { cn } from "@/lib/utils";

/** Base shimmer block */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        "before:[animation:shimmer_1.6s_infinite]",
        className,
      )}
      {...props}
    />
  );
}

/** Matches the Shop page 2/3/4-col product card */
function ShopCardSkeleton() {
  return (
    <div className="border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 md:p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-4 w-1/3 mt-1" />
      </div>
    </div>
  );
}

/** Matches the Sales Portal catalog card (with "RECORD SALE" button row) */
function SalesCardSkeleton() {
  return (
    <div className="border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-8 w-full" />
      </div>
    </div>
  );
}

export { Skeleton, ShopCardSkeleton, SalesCardSkeleton };
