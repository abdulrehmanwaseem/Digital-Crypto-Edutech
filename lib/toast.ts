import { toast } from "@/hooks/use-toast"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

type ToasterToast = ToastProps & {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
}

export const showToast = {
  success: (message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default",
    })
  },
  error: (message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    })
  },
  info: (message: string) => {
    toast({
      description: message,
      variant: "default",
    })
  },
}
