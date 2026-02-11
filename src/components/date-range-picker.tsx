"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { RangeCalendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)

  const label = React.useMemo(() => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
      }
      return format(dateRange.from, "MMM d, yyyy")
    }
    return "Custom range"
  }, [dateRange])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ring-1 ring-inset ${
            dateRange?.from
              ? "bg-cyan-500/10 text-cyan-400 ring-cyan-500/25"
              : "bg-white/[0.03] text-zinc-500 ring-white/[0.06] hover:bg-white/[0.06] hover:text-zinc-300"
          }`}
        >
          <CalendarIcon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-white/[0.08] bg-[#141417]"
        align="start"
      >
        <RangeCalendar
          selected={dateRange}
          onSelect={(range) => {
            onDateRangeChange(range)
            if (range?.from && range?.to) {
              setTimeout(() => setOpen(false), 200)
            }
          }}
          numberOfMonths={2}
          disabled={{ after: new Date() }}
        />
        {dateRange?.from && (
          <div className="border-t border-white/[0.06] px-3 py-2 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500">
              {dateRange.to
                ? `${Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / 86400000)} days`
                : "Select end date"}
            </span>
            <button
              onClick={() => onDateRangeChange(undefined)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
