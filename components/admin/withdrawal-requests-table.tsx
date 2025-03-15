import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { WithdrawalStatus } from "@prisma/client";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: WithdrawalStatus;
  paymentMethod: string;
  accountDetails: any;
  notes: string | null;
  createdAt: string;
  processedAt: string | null;
}

interface WithdrawalRequestsTableProps {
  withdrawals: WithdrawalRequest[];
  onStatusUpdate: (
    id: string,
    status: WithdrawalStatus,
    notes?: string
  ) => Promise<void>;
}

const statusColors = {
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  REJECTED: "bg-red-500",
  COMPLETED: "bg-blue-500",
};

export function WithdrawalRequestsTable({
  withdrawals,
  onStatusUpdate,
}: WithdrawalRequestsTableProps) {
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);
  const [processingStatus, setProcessingStatus] = useState<
    "APPROVED" | "REJECTED" | null
  >(null);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleProcess = async (status: "APPROVED" | "REJECTED") => {
    if (!selectedWithdrawal) return;

    try {
      setIsProcessing(true);
      await onStatusUpdate(selectedWithdrawal.id, status, notes);
      toast({
        title: "Success",
        description: `Withdrawal request has been ${status.toLowerCase()}`,
      });
      setSelectedWithdrawal(null);
      setNotes("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process withdrawal request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.map((withdrawal) => (
            <TableRow key={withdrawal.id}>
              <TableCell>{withdrawal.userName}</TableCell>
              <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
              <TableCell>{withdrawal.paymentMethod}</TableCell>
              <TableCell>
                <Badge className={statusColors[withdrawal.status]}>
                  {withdrawal.status}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(withdrawal.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {withdrawal.status === "PENDING" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWithdrawal(withdrawal)}
                  >
                    View Details
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!selectedWithdrawal}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWithdrawal(null);
            setNotes("");
            setProcessingStatus(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Request Details</DialogTitle>
            <DialogDescription>
              Review the withdrawal request details and process accordingly.
            </DialogDescription>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">User</p>
                  <p className="text-sm">{selectedWithdrawal.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-sm">
                    {formatCurrency(selectedWithdrawal.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm">{selectedWithdrawal.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date Requested</p>
                  <p className="text-sm">
                    {new Date(
                      selectedWithdrawal.createdAt
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Account Details</p>
                <pre className="text-sm bg-secondary p-2 rounded-md overflow-x-auto">
                  {JSON.stringify(selectedWithdrawal.accountDetails, null, 2)}
                </pre>
              </div>

              {processingStatus && (
                <div>
                  <p className="text-sm font-medium mb-2">Notes</p>
                  <Textarea
                    placeholder="Add any notes about this withdrawal request..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {processingStatus ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setProcessingStatus(null)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant={
                    processingStatus === "APPROVED" ? "default" : "destructive"
                  }
                  onClick={() => handleProcess(processingStatus)}
                  disabled={isProcessing}
                >
                  Confirm {processingStatus.toLowerCase()}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedWithdrawal(null)}
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setProcessingStatus("REJECTED")}
                >
                  Reject
                </Button>
                <Button onClick={() => setProcessingStatus("APPROVED")}>
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
