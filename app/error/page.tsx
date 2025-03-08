// app/error/page.tsx
"use client"
import { useSearchParams } from 'next/navigation'

const ErrorPage = () => {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">Error: {error}</p>
      </div>
    </div>
  )
}

export default ErrorPage