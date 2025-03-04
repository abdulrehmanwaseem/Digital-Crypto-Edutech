import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { columns } from "./columns"

const mockTransactions = [
  {
    id: "1",
    user: "John Doe",
    amount: "$99.99",
    course: "Crypto Basics 101",
    date: "2024-03-20",
    status: "pending",
  },
]

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Transactions</h1>
      </div>
      <DataTable columns={columns} data={mockTransactions} />
    </div>
  )
} 