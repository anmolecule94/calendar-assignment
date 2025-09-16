"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function TimePicker({ date, setDate, disabled, className }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hours, setHours] = React.useState(date ? date.getHours().toString().padStart(2, "0") : "09")
  const [minutes, setMinutes] = React.useState(date ? date.getMinutes().toString().padStart(2, "0") : "00")

  const handleTimeChange = (newHours: string, newMinutes: string) => {
    if (date) {
      const newDate = new Date(date)
      newDate.setHours(Number.parseInt(newHours), Number.parseInt(newMinutes))
      setDate(newDate)
    }
  }

  const handleHoursChange = (value: string) => {
    const numValue = Number.parseInt(value)
    if (numValue >= 0 && numValue <= 23) {
      setHours(value.padStart(2, "0"))
      handleTimeChange(value.padStart(2, "0"), minutes)
    }
  }

  const handleMinutesChange = (value: string) => {
    const numValue = Number.parseInt(value)
    if (numValue >= 0 && numValue <= 59) {
      setMinutes(value.padStart(2, "0"))
      handleTimeChange(hours, value.padStart(2, "0"))
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? formatTime(date) : "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-4">
          <div className="text-sm font-medium">Select Time</div>
          <div className="flex items-center space-x-2">
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-xs">
                Hours
              </Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => handleHoursChange(e.target.value)}
                className="w-16 text-center"
              />
            </div>
            <div className="text-2xl font-bold pt-6">:</div>
            <div className="space-y-2">
              <Label htmlFor="minutes" className="text-xs">
                Minutes
              </Label>
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                step="15"
                value={minutes}
                onChange={(e) => handleMinutesChange(e.target.value)}
                className="w-16 text-center"
              />
            </div>
          </div>
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHours("09")
                setMinutes("00")
                handleTimeChange("09", "00")
              }}
            >
              9:00 AM
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHours("12")
                setMinutes("00")
                handleTimeChange("12", "00")
              }}
            >
              12:00 PM
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setHours("17")
                setMinutes("00")
                handleTimeChange("17", "00")
              }}
            >
              5:00 PM
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
