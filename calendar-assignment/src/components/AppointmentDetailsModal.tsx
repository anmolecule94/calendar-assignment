"use client"

import { useState } from "react"
import type { CalendarAppointment } from "@/lib/googleCalendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import { StatusBadge } from "@/components/ui/status-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import ConfirmationModal from "@/components/ConfirmationModal"
import {
  Calendar,
  Clock,
  Users,
  MessageCircle,
  ExternalLink,
  Mail,
  Crown,
  Edit,
  Save,
  User,
  XCircle,
} from "lucide-react"

interface AppointmentDetailsModalProps {
  appointment: CalendarAppointment | null
  isOpen: boolean
  onClose: () => void
  onCancel?: (appointmentId: string) => void
  onUpdate?: () => void
  userRole?: "Buyer" | "Seller"
  currentUserEmail?: string
}

export default function AppointmentDetailsModal({
  appointment,
  isOpen,
  onClose,
  onCancel,
  onUpdate,
  userRole,
  currentUserEmail,
}: AppointmentDetailsModalProps) {
  const [isCancelling, setIsCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Response status editing state
  const [isEditingResponse, setIsEditingResponse] = useState(false)
  const [selectedResponseStatus, setSelectedResponseStatus] = useState("")
  const [isUpdatingResponse, setIsUpdatingResponse] = useState(false)

  // Time editing state
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [editStartTime, setEditStartTime] = useState("")
  const [editEndTime, setEditEndTime] = useState("")
  const [isUpdatingTime, setIsUpdatingTime] = useState(false)

  if (!appointment) return null

  // Helper functions
  const isOrganizer = currentUserEmail === appointment.organizer.email
  const isAttendee = appointment.attendees.some((attendee) => attendee.email === currentUserEmail)
  const currentUserAttendee = appointment.attendees.find((attendee) => attendee.email === currentUserEmail)
  const isFutureAppointment = new Date(appointment.startTime) > new Date()
  const canEditAppointment = appointment.status !== "cancelled" && isFutureAppointment

  // Check if the current user can cancel the appointment
  const canCancelAppointment = () => {
    if (!currentUserEmail || appointment.status === "cancelled") return false
    return isOrganizer || isAttendee
  }

  // Response status change handlers
  const handleEditResponseClick = () => {
    if (currentUserAttendee) {
      setSelectedResponseStatus(currentUserAttendee.responseStatus || "")
      setIsEditingResponse(true)
    }
  }

  const handleResponseStatusSave = async () => {
    if (!selectedResponseStatus || !currentUserEmail || isUpdatingResponse) return

    setIsUpdatingResponse(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/response`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          responseStatus: selectedResponseStatus,
          userEmail: currentUserEmail,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update response status")
      }

      setIsEditingResponse(false)
      onUpdate?.() // Refresh the appointment data
    } catch (error) {
      console.error("Failed to update response status:", error)
    } finally {
      setIsUpdatingResponse(false)
    }
  }

  const handleResponseStatusCancel = () => {
    setIsEditingResponse(false)
    setSelectedResponseStatus("")
  }

  // Time editing handlers
  const handleEditTimeClick = () => {
    const startDate = new Date(appointment.startTime)
    const endDate = new Date(appointment.endTime)

    setEditStartTime(startDate.toISOString().slice(0, 16))
    setEditEndTime(endDate.toISOString().slice(0, 16))
    setIsEditingTime(true)
  }

  const handleTimeSave = async () => {
    if (!editStartTime || !editEndTime || isUpdatingTime) return

    const startTime = new Date(editStartTime)
    const endTime = new Date(editEndTime)

    if (startTime >= endTime) {
      alert("End time must be after start time")
      return
    }

    setIsUpdatingTime(true)
    try {
      const response = await fetch(`/api/appointments/${appointment.id}/time`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update appointment time")
      }

      setIsEditingTime(false)
      onUpdate?.() // Refresh the appointment data
    } catch (error) {
      console.error("Failed to update appointment time:", error)
    } finally {
      setIsUpdatingTime(false)
    }
  }

  const handleTimeCancel = () => {
    setIsEditingTime(false)
    setEditStartTime("")
    setEditEndTime("")
  }

  const handleCancelClick = () => {
    setShowCancelConfirm(true)
  }

  const handleCancelAppointment = async () => {
    if (!onCancel || !appointment || isCancelling) return

    setIsCancelling(true)
    setShowCancelConfirm(false)

    try {
      await onCancel(appointment.id)
      onClose() // Close modal after successful cancellation
    } catch (error) {
      console.error("Failed to cancel appointment:", error)
      // Note: Error handling could be improved with a toast notification
    } finally {
      setIsCancelling(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getResponseStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return <User className="h-4 w-4 text-green-600" />
      case "declined":
        return <User className="h-4 w-4 text-red-600" />
      case "tentative":
        return <User className="h-4 w-4 text-yellow-600" />
      default:
        return <User className="h-4 w-4 text-gray-400" />
    }
  }

  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-700 border-green-200"
      case "declined":
        return "bg-red-50 text-red-700 border-red-200"
      case "tentative":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto w-">
        <DialogHeader className="pb-6">
          <DialogTitle className="flex items-center space-x-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <span>Appointment Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-foreground">{appointment.title}</h3>
              <div className="flex items-center gap-3">
                <StatusBadge status={appointment.status} />
                {appointment.status === "confirmed" && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    <User className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
              </div>
            </div>

            {appointment.description && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">Description</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{appointment.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Date & Time</p>
                  {!isEditingTime ? (
                    <p className="text-sm text-muted-foreground">{formatDateTime(appointment.startTime)}</p>
                  ) : (
                    <div className="space-y-4 mt-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-time" className="text-sm font-medium">
                            Start Time
                          </Label>
                          <DateTimePicker
                            date={editStartTime ? new Date(editStartTime) : undefined}
                            setDate={(date) => setEditStartTime(date?.toISOString() || "")}
                            placeholder="Select start time"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-time" className="text-sm font-medium">
                            End Time
                          </Label>
                          <DateTimePicker
                            date={editEndTime ? new Date(editEndTime) : undefined}
                            setDate={(date) => setEditEndTime(date?.toISOString() || "")}
                            placeholder="Select end time"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          size="sm"
                          onClick={handleTimeSave}
                          disabled={isUpdatingTime}
                          className="flex items-center space-x-2"
                        >
                          {isUpdatingTime ? <LoadingSpinner size="sm" /> : <Save className="h-3 w-3" />}
                          <span>{isUpdatingTime ? "Saving..." : "Save Changes"}</span>
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleTimeCancel} disabled={isUpdatingTime}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {isOrganizer && canEditAppointment && !isEditingTime && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditTimeClick}
                  className="flex items-center space-x-2 hover:bg-muted"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            {!isEditingTime && (
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Clock className="h-4 w-4 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Organizer */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Crown className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Organizer</p>
                <div className="flex items-center space-x-2">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{appointment.organizer.email}</span>
                  {appointment.organizer.email === currentUserEmail && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                      You
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-foreground">Attendees ({appointment.attendees.length})</p>
            </div>

            <div className="space-y-3">
              {appointment.attendees.map((attendee, index) => (
                <div key={index} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-muted rounded-full">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium text-foreground">{attendee.email}</span>
                        <div className="flex items-center gap-2">
                          {attendee.email === currentUserEmail && (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                              You
                            </Badge>
                          )}
                          {attendee.email === appointment.organizer.email && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              <Crown className="h-3 w-3 mr-1" />
                              Organizer
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {attendee.email === currentUserEmail && canEditAppointment && !isEditingResponse ? (
                        <div className="flex items-center space-x-3">
                          <StatusBadge status={attendee.responseStatus || "pending"} />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleEditResponseClick}
                            className="flex items-center space-x-1 hover:bg-muted"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : attendee.email === currentUserEmail && isEditingResponse ? (
                        <div className="flex items-center space-x-3">
                          <select
                            value={selectedResponseStatus}
                            onChange={(e) => setSelectedResponseStatus(e.target.value)}
                            className="text-sm border rounded-md px-3 py-1.5 bg-background"
                            disabled={isUpdatingResponse}
                          >
                            <option value="">No response</option>
                            <option value="accepted">Accepted</option>
                            <option value="declined">Declined</option>
                            <option value="tentative">Tentative</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={handleResponseStatusSave}
                            disabled={isUpdatingResponse || !selectedResponseStatus}
                            className="flex items-center space-x-1"
                          >
                            {isUpdatingResponse ? <LoadingSpinner size="sm" /> : <Save className="h-3 w-3" />}
                            <span>{isUpdatingResponse ? "Saving..." : "Save"}</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleResponseStatusCancel}
                            disabled={isUpdatingResponse}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <StatusBadge status={attendee.responseStatus || "pending"} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Meeting Link */}
          {appointment.meetingLink && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Meeting Link</p>
                  <Button
                    size="sm"
                    onClick={() => window.open(appointment.meetingLink, "_blank")}
                    className="flex items-center space-x-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Join Meeting</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Appointment ID:</span>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{appointment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(appointment.created).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <div>
            {canCancelAppointment() && onCancel && new Date(appointment.startTime) > new Date() && (
              <Button
                variant="destructive"
                onClick={handleCancelClick}
                disabled={isCancelling}
                className="flex items-center space-x-2"
              >
                {isCancelling ? <LoadingSpinner size="sm" /> : <XCircle className="h-4 w-4" />}
                <span>{isCancelling ? "Cancelling..." : "Cancel Appointment"}</span>
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose} className="min-w-20 bg-transparent">
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Cancel Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancelAppointment}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone and all attendees will be notified."
        confirmText="Cancel Appointment"
        cancelText="Keep Appointment"
        isLoading={isCancelling}
        variant="destructive"
      />
    </Dialog>
  )
}
