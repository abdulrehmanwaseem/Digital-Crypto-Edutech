import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columnCount: number;
  rowCount?: number;
}

export function TableSkeleton({
  columnCount,
  rowCount = 5,
}: TableSkeletonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array(columnCount)
            .fill(0)
            .map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-[100px]" />
              </TableHead>
            ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array(rowCount)
          .fill(0)
          .map((_, i) => (
            <TableRow key={i}>
              {Array(columnCount)
                .fill(0)
                .map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                ))}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}
