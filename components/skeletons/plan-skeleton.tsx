import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlanSkeleton() {
  return (
    <Card className="p-6 flex flex-col h-[520px]">
      {/* Title and Price */}
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* Stipend placeholder */}
        <Skeleton className="h-4 w-48 mt-2" />
      </div>

      {/* Features */}
      <div className="flex-grow space-y-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-grow" />
            </div>
          ))}
      </div>

      {/* Button */}
      <div className="pt-6 border-t">
        <Skeleton className="h-12 w-full mb-3" />
        <Skeleton className="h-3 w-32 mx-auto" />
      </div>
    </Card>
  );
}
