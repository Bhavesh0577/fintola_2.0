"use client"

import * as React from "react"
import { DayPicker, type DateRange } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/* ---------- shared classNames ---------- */
const baseClassNames = {
  months: "flex flex-col sm:flex-row gap-2",
  month: "flex flex-col gap-4",
  month_caption: "flex justify-center pt-1 relative items-center h-7",
  caption_label: "text-sm font-medium text-zinc-200",
  nav: "flex items-center gap-1",
  button_previous:
    "absolute left-1 top-0 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 transition-colors",
  button_next:
    "absolute right-1 top-0 inline-flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.06] bg-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-200 transition-colors",
  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "text-zinc-500 w-8 font-normal text-[0.8rem]",
  week: "flex w-full mt-2",
  day: "relative p-0 text-center text-sm",
  day_button:
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-normal text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors aria-selected:opacity-100",
  selected:
    "bg-indigo-500 text-white hover:bg-indigo-600 focus:bg-indigo-500 rounded-md",
  today: "bg-white/[0.06] text-white rounded-md",
  outside:
    "text-zinc-700 aria-selected:bg-indigo-500/20 aria-selected:text-indigo-300",
  disabled: "text-zinc-700 opacity-50",
  range_middle:
    "aria-selected:bg-indigo-500/15 aria-selected:text-indigo-300 rounded-none",
  range_start: "rounded-l-md rounded-r-none",
  range_end: "rounded-r-md rounded-l-none",
  hidden: "invisible",
}

const chevronComponent = {
  Chevron: ({ orientation }: { orientation?: string }) =>
    orientation === "left" ? (
      <ChevronLeft className="h-4 w-4" />
    ) : (
      <ChevronRight className="h-4 w-4" />
    ),
}

/* ---------- Range Calendar ---------- */
interface RangeCalendarProps {
  className?: string
  selected?: DateRange | undefined
  onSelect?: (range: DateRange | undefined) => void
  numberOfMonths?: number
  disabled?: { after?: Date; before?: Date }
  showOutsideDays?: boolean
}

function RangeCalendar({
  className,
  selected,
  onSelect,
  numberOfMonths = 2,
  disabled,
  showOutsideDays = true,
}: RangeCalendarProps) {
  return (
    <DayPicker
      mode="range"
      selected={selected}
      onSelect={(range: DateRange | undefined) => onSelect?.(range)}
      numberOfMonths={numberOfMonths}
      disabled={disabled}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={baseClassNames}
      components={chevronComponent}
    />
  )
}
RangeCalendar.displayName = "RangeCalendar"

/* ---------- Single / generic Calendar ---------- */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{ ...baseClassNames, ...classNames }}
      components={chevronComponent}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar, RangeCalendar }

