"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return {
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
          icon: CheckCircle,
          label: "Confirmed",
        }
      case "pending":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
          icon: Clock,
          label: "Pending",
        }
      case "cancelled":
        return {
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
          icon: XCircle,
          label: "Cancelled",
        }
      case "accepted":
        return {
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
          icon: CheckCircle,
          label: "Accepted",
        }
      case "declined":
        return {
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
          icon: XCircle,
          label: "Declined",
        }
      case "tentative":
        return {
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
          icon: AlertCircle,
          label: "Tentative",
        }
      default:
        return {
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100",
          icon: AlertCircle,
          label: status,
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={cn(config.className, "flex items-center gap-1", className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  )
}
