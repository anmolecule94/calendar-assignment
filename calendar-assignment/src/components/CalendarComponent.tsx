"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Calendar, Clock, ChevronLeft, ChevronRight, Users } from "lucide-react"
import type { CalendarAppointment } from "@/lib/googleCalendar"
import type { Session } from "next-auth"
import type { Dispatch, SetStateAction } from "react"

interface CalendarComponentProps {
  appointments: CalendarAppointment[]
  loading: boolean
  currentDate: Date
  setCurrentDate: Dispatch<SetStateAction<Date>>
  selectedAppointment: CalendarAppointment | null
  setSelectedAppointment: Dispatch<SetStateAction<CalendarAppointment | null>>
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  cancelAppointment: (appointmentId: string) => Promise<void>
  session: Session | null
  onDateClick?: (date: Date) => void // New prop for handling date clicks
  hideAppointmentDetails?: boolean // New prop to hide appointment details for buyers
  currentUserEmail?: string // New prop to identify shared appointments
}

export default function CalendarComponent({
  appointments,
  loading,
  currentDate,
  setCurrentDate,
  selectedAppointment,
  setSelectedAppointment,
  isModalOpen,
  setIsModalOpen,
  cancelAppointment,
  session,
  onDateClick,
  hideAppointmentDetails = false,
  currentUserEmail,
}: CalendarComponentProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toDateString()
    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.startTime).toDateString()
        return aptDate === dateString && apt.status !== "cancelled"
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const isToday = (date: Date) => new Date().toDateString() === date.toDateString()

  // Check if the current user is involved in this appointment
  const isSharedAppointment = (appointment: CalendarAppointment) => {
    if (!currentUserEmail) return false

    // Check if user is organizer or attendee
    const isOrganizer = appointment.organizer.email === currentUserEmail
    const isAttendee = appointment.attendees.some((attendee) => attendee.email === currentUserEmail)

    return isOrganizer || isAttendee
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      direction === "prev" ? newDate.setMonth(prev.getMonth() - 1) : newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border bg-muted/20"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayAppointments = getAppointmentsForDate(date)
      const isCurrentDay = isToday(date)

      days.push(
        <div
          key={day}
          className={`h-32 border p-2 overflow-y-auto cursor-pointer transition-colors hover:bg-muted/50 ${
            isCurrentDay ? "bg-primary/5 border-primary/30" : "bg-card"
          }`}
          onClick={() => onDateClick && onDateClick(date)}
        >
          <div
            className={`font-medium text-sm mb-2 flex items-center justify-between ${
              isCurrentDay ? "text-primary" : "text-foreground"
            }`}
          >
            <span>{day}</span>
            {isCurrentDay && (
              <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">Today</span>
            )}
          </div>
          <div className="space-y-1">
            {dayAppointments.map((appointment, index) => {
              const isShared = isSharedAppointment(appointment)
              const shouldHideDetails = hideAppointmentDetails && !isShared

              return (
                <div
                  key={appointment.id}
                  className={`text-xs p-2 rounded-md border transition-all hover:shadow-sm ${
                    shouldHideDetails
                      ? "bg-muted text-muted-foreground cursor-not-allowed border-muted"
                      : `cursor-pointer hover:scale-[1.02] ${
                          isShared
                            ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                            : appointment.status === "confirmed"
                              ? "bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
                              : "bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
                        }`
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!shouldHideDetails) {
                      setSelectedAppointment(appointment)
                      setIsModalOpen(true)
                    }
                  }}
                  title={
                    shouldHideDetails
                      ? "Time slot unavailable"
                      : `${appointment.title} (${formatTime(
                          appointment.startTime,
                        )} - ${formatTime(appointment.endTime)})${isShared ? " (Shared appointment)" : ""}`
                  }
                >
                  {shouldHideDetails ? (
                    <>
                      <div className="font-medium truncate flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Busy
                      </div>
                      <div className="truncate text-xs opacity-75">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium truncate flex items-center justify-between">
                        <span>{appointment.title}</span>
                        {isShared && <Users className="h-3 w-3" />}
                      </div>
                      <div className="truncate text-xs opacity-75">{formatTime(appointment.startTime)}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-75">{appointment.attendees.length} attendees</span>
                        <StatusBadge status={appointment.status} className="text-xs px-1 py-0" showIcon={false} />
                      </div>
                    </>
                  )}
                </div>
              )
            })}
            {dayAppointments.length === 0 && (
              <div className="text-xs text-muted-foreground italic p-2 text-center">
                {hideAppointmentDetails ? "Available" : "No appointments"}
              </div>
            )}
          </div>
        </div>,
      )
    }

    return days
  }

  const getTodayAppointments = () => getAppointmentsForDate(new Date())
  const getUpcomingAppointments = () =>
    appointments
      .filter((apt) => new Date(apt.startTime) > new Date() && apt.status !== "cancelled")
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")} className="hover:bg-muted">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="hover:bg-muted">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")} className="hover:bg-muted">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-0 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-3 text-center font-medium text-muted-foreground bg-muted/30 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">{renderCalendarGrid()}</div>
        </CardContent>
      </Card>
    </div>
  )
}
