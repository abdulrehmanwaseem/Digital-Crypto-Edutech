import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { columns } from "./columns"

const mockCourses = [
  {
    id: "1",
    name: "Basic to Advanced Curriculum",
    plan: "Basic",
    students: 45,
    status: "active",
    lastUpdated: "2024-03-20",
  },
  {
    id: "2",
    name: "Crypto Signal Mastery",
    plan: "Premium",
    students: 120,
    status: "active",
    lastUpdated: "2024-03-21",
  },
]

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>
      <DataTable columns={columns} data={mockCourses} />
    </div>
  )
} 