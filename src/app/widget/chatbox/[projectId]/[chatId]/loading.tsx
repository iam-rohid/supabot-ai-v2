import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="flex h-14 items-center gap-4 border-b px-4">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="flex-1 p-4">
        <Skeleton className="mb-2 h-4 w-20" />
        <Skeleton className="h-[60px] w-full max-w-xs rounded-2xl rounded-tl-sm" />
      </div>
      <div className="flex h-14 items-center justify-between border-t px-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-6" />
      </div>
    </>
  );
}
