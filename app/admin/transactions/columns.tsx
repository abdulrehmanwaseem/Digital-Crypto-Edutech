"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, Eye, ExternalLink } from "lucide-react";
import Image from "next/image";

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "userName",
    header: "User",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.userName}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.userId}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="font-medium">${row.original.amount.toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "courseName",
    header: "Course",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.courseName}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.courseId}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase();
      return (
        <Badge
          variant={
            status === "approved"
              ? "success"
              : status === "rejected"
              ? "destructive"
              : "secondary"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const [showDetails, setShowDetails] = useState(false);
      const [notes, setNotes] = useState("");
      const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(
        null
      );

      const handleAction = () => {
        if (actionType && table.options.meta?.onAction) {
          table.options.meta.onAction(row.original.id, actionType, notes);
          setShowDetails(false);
          setNotes("");
          setActionType(null);
        }
      };

      return (
        <>
          <div className="flex gap-2">
            {row.original.status === "PENDING" && (
              <>
                <Button
                  size="sm"
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setActionType("APPROVE");
                    setShowDetails(true);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setActionType("REJECT");
                    setShowDetails(true);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setActionType(null);
                setShowDetails(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Transaction Details
                  {actionType && ` - ${actionType}`}
                </DialogTitle>
                <DialogDescription>
                  Review the transaction details and proof of payment
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Transaction Info</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">ID:</span>{" "}
                        {row.original.transactionId}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Amount:</span> $
                        {row.original.amount}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Date:</span>{" "}
                        {new Date(row.original.createdAt).toLocaleString()}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        {row.original.status}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">Course Info</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Name:</span>{" "}
                        {row.original.courseName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">ID:</span>{" "}
                        {row.original.courseId}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Payment Proof</h4>
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                    <Image
                      src={row.original.proofImageUrl}
                      alt="Payment Proof"
                      fill
                      className="object-contain"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() =>
                        window.open(row.original.proofImageUrl, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {actionType && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <Textarea
                      placeholder="Add notes about this decision..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                {actionType && (
                  <Button
                    variant={
                      actionType === "APPROVE" ? "default" : "destructive"
                    }
                    onClick={handleAction}
                  >
                    {actionType === "APPROVE"
                      ? "Approve Payment"
                      : "Reject Payment"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
