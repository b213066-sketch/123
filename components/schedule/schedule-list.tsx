import { ScheduleEventCard } from "@/components/schedule/schedule-event-card"
import { formatKoreanDate, groupByDate } from "@/lib/schedule"
import type { ScheduleItem } from "@/lib/types"

type ScheduleListProps = {
  items: ScheduleItem[]
}

export function ScheduleList({ items }: ScheduleListProps) {
  const days = groupByDate(items)

  if (days.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        표시할 일정이 없습니다. 필터를 바꿔 보세요.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {days.map((day) => (
        <section key={day.date} className="space-y-3">
          <h2 className="text-sm font-medium">
            {formatKoreanDate(day.date, {
              withYear: true,
              weekday: day.dayOfWeek,
            })}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {day.items.length}개
            </span>
          </h2>
          <div className="grid gap-2 md:grid-cols-2">
            {day.items.map((item) => (
              <ScheduleEventCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
