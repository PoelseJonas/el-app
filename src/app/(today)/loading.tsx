import { Skeleton } from "@/components/ui/skeleton";

/** Shown while "I dag" loads: grey blocks in the shape of the content, not a spinner (docs/design.md). */
export default function TodayLoading() {
  return (
    <div aria-busy className="flex flex-col gap-8">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="aspect-video w-full md:aspect-[3/1]" />
    </div>
  );
}
