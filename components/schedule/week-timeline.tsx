"use client"

import { useEffect, useMemo, useState } from "react"

import { ScheduleEventCard } from "@/components/schedule/schedule-event-card"
import { cn } from "@/lib/utils"
import {
  PIXELS_PER_HOUR,
  formatKoreanDate,
  getTimeBounds,
  groupByDate,
  minutesNowInSeoul,
  todayInSeoul,
} from "@/lib/schedule"
import type { ScheduleItem } from "@/lib/types"

type WeekTimelineProps = {
  items: ScheduleItem[]
}

export function WeekTimeline({ items }: WeekTimelineProps) {
  const days = useMemo(() => groupByDate(items), [items])
  const { startHour, endHour } = useMemo(() => getTimeBounds(items), [items])
  const hours = useMemo(
    () => Array.from({ length: endHour - startHour }, (_, i) => startHour + i),
    [startHour, endHour]
  )
  const totalHeight = (endHour - startHour) * PIXELS_PER_HOUR
  const [nowMinutes, setNowMinutes] = useState<number | null>(null)
  const [today, setToday] = useState<string | null>(null)

  useEffect(() => {
    function tick() {
      setToday(todayInSeoul())
      setNowMinutes(minutesNowInSeoul())
    }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        표시할 일정이 없습니다. 필터를 바꿔 보세요.
      </div>
    )
  }

  const showNow =
    today !== null &&
    nowMinutes !== null &&
    days.some((day) => day.date === today) &&
    nowMinutes >= startHour * 60 &&
    nowMinutes <= endHour * 60
  const nowTop =
    showNow && nowMinutes !== null
      ? ((nowMinutes - startHour * 60) / 60) * PIXELS_PER_HOUR
      : null

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <div
        className="grid min-w-[720px]"
        style={{
          gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur" />
        {days.map((day) => {
          const isToday = day.date === today
          return (
            <div
              key={day.date}
              className={cn(
                "sticky top-0 z-20 border-b border-l bg-background/95 px-3 py-2 backdrop-blur",
                isToday && "bg-primary/6"
              )}
            >
              <p className="text-xs text-muted-foreground">
                {day.dayOfWeek.replace("요일", "요일")}
              </p>
              <p
                className={cn(
                  "text-sm font-medium",
                  isToday && "text-primary"
                )}
              >
                {formatKoreanDate(day.date)}
                {isToday ? " · 오늘" : ""}
              </p>
            </div>
          )
        })}

        <div className="relative" style={{ height: totalHeight }}>
          {hours.map((hour, index) => (
            <div
              key={hour}
              className={cn(
                "absolute right-2 text-[11px] tabular-nums text-muted-foreground",
                index !== 0 && "-translate-y-1/2"
              )}
              style={{ top: index === 0 ? 4 : index * PIXELS_PER_HOUR }}
            >
              {String(hour).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {days.map((day) => {
          const isToday = day.date === today
          return (
            <div
              key={`${day.date}-body`}
              className={cn(
                "relative border-l",
                isToday && "bg-primary/4"
              )}
              style={{ height: totalHeight }}
            >
              {hours.map((hour, index) => (
                <div
                  key={`${day.date}-${hour}`}
                  className="absolute inset-x-0 border-t border-dashed border-border/80"
                  style={{ top: index * PIXELS_PER_HOUR }}
                />
              ))}
              {day.items.map((item) => {
                const top =
                  ((item.startMinutes - startHour * 60) / 60) * PIXELS_PER_HOUR
                const height = Math.max(
                  ((item.endMinutes - item.startMinutes) / 60) * PIXELS_PER_HOUR,
                  44
                )
                return (
                  <div
                    key={item.id}
                    className="absolute inset-x-1 z-10"
                    style={{ top, height }}
                  >
                    <ScheduleEventCard item={item} compact />
                  </div>
                )
              })}
              {isToday && nowTop !== null ? (
                <div
                  className="pointer-events-none absolute inset-x-0 z-20"
                  style={{ top: nowTop }}
                >
                  <div className="h-px bg-destructive" />
                  <span className="absolute -top-2 left-1 rounded bg-destructive px-1 text-[10px] text-white">
                    지금
                  </span>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
