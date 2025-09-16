"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { TimePicker } from "@/components/ui/time-picker"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function DateTimePicker({
  date,
  setDate,
  disabled,
  className,
  placeholder = "Select date and time",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP 'at' p") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 border-b">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </div>
        <div className="p-3">
          <TimePicker date={date} setDate={setDate} />
        </div>
      </PopoverContent>
    </Popover>
  )
}
