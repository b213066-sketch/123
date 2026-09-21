import type { ScheduleItem } from "@/lib/types"

export const CATEGORY_ORDER = ["업무", "학습", "미팅", "휴식"] as const
export const STATUS_ORDER = ["완료", "진행 중", "대기"] as const

export const PIXELS_PER_HOUR = 72

export type CategoryStyle = {
  bar: string
  bg: string
  text: string
  badge: string
  dot: string
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  업무: {
    bar: "bg-blue-500",
    bg: "bg-blue-500/10 dark:bg-blue-400/15",
    text: "text-blue-800 dark:text-blue-200",
    badge:
      "border-blue-500/20 bg-blue-500/12 text-blue-800 dark:text-blue-200",
    dot: "bg-blue-500",
  },
  학습: {
    bar: "bg-violet-500",
    bg: "bg-violet-500/10 dark:bg-violet-400/15",
    text: "text-violet-800 dark:text-violet-200",
    badge:
      "border-violet-500/20 bg-violet-500/12 text-violet-800 dark:text-violet-200",
    dot: "bg-violet-500",
  },
  미팅: {
    bar: "bg-amber-500",
    bg: "bg-amber-500/10 dark:bg-amber-400/15",
    text: "text-amber-900 dark:text-amber-200",
    badge:
      "border-amber-500/25 bg-amber-500/12 text-amber-900 dark:text-amber-200",
    dot: "bg-amber-500",
  },
  휴식: {
    bar: "bg-emerald-500",
    bg: "bg-emerald-500/10 dark:bg-emerald-400/15",
    text: "text-emerald-800 dark:text-emerald-200",
    badge:
      "border-emerald-500/20 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200",
    dot: "bg-emerald-500",
  },
}

const FALLBACK_STYLE: CategoryStyle = {
  bar: "bg-slate-500",
  bg: "bg-slate-500/10 dark:bg-slate-400/15",
  text: "text-slate-800 dark:text-slate-200",
  badge:
    "border-slate-500/20 bg-slate-500/12 text-slate-800 dark:text-slate-200",
  dot: "bg-slate-500",
}

export function getCategoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? FALLBACK_STYLE
}

export function parseTimeRange(value: string) {
  const match = value.match(
    /(\d{1,2}):(\d{2})\s*[-~–—]\s*(\d{1,2}):(\d{2})/
  )

  if (!match) {
    return {
      startMinutes: 9 * 60,
      endMinutes: 10 * 60,
      timeRange: value || "시간 미정",
    }
  }

  const startMinutes = Number(match[1]) * 60 + Number(match[2])
  let endMinutes = Number(match[3]) * 60 + Number(match[4])
  if (endMinutes <= startMinutes) {
    endMinutes = startMinutes + 60
  }

  const pad = (n: number) => String(n).padStart(2, "0")
  const timeRange = `${pad(Math.floor(startMinutes / 60))}:${pad(startMinutes % 60)} - ${pad(Math.floor(endMinutes / 60))}:${pad(endMinutes % 60)}`

  return { startMinutes, endMinutes, timeRange }
}

export function filterSchedule(
  items: ScheduleItem[],
  category: string,
  status: string
) {
  return items.filter((item) => {
    const categoryOk = category === "all" || item.category === category
    const statusOk = status === "all" || item.status === status
    return categoryOk && statusOk
  })
}

export function uniqueValues(items: ScheduleItem[], key: "category" | "status") {
  const present = new Set(items.map((item) => item[key]))
  const preferred: readonly string[] =
    key === "category" ? CATEGORY_ORDER : STATUS_ORDER
  const ordered = preferred.filter((value) => present.has(value))
  const extras = [...present].filter((value) => !preferred.includes(value))
  return [...ordered, ...extras]
}

export function groupByDate(items: ScheduleItem[]) {
  const groups = new Map<string, ScheduleItem[]>()
  for (const item of items) {
    const list = groups.get(item.date) ?? []
    list.push(item)
    groups.set(item.date, list)
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, list]) => ({
      date,
      dayOfWeek: list[0]?.dayOfWeek ?? weekdayLabel(date),
      items: [...list].sort((a, b) => a.startMinutes - b.startMinutes),
    }))
}

export function getWeekRangeLabel(items: ScheduleItem[]) {
  if (items.length === 0) {
    return "일정 없음"
  }

  const dates = items.map((item) => item.date).sort()
  const start = formatRangeDate(dates[0], true)
  const end = formatRangeDate(
    dates[dates.length - 1],
    dates[0].slice(0, 4) !== dates[dates.length - 1].slice(0, 4)
  )
  return `${start} – ${end}`
}

export function getTimeBounds(items: ScheduleItem[]) {
  if (items.length === 0) {
    return { startHour: 9, endHour: 18 }
  }

  const minStart = Math.min(...items.map((item) => item.startMinutes))
  const maxEnd = Math.max(...items.map((item) => item.endMinutes))
  const startHour = Math.max(0, Math.floor(minStart / 60))
  const endHour = Math.min(24, Math.max(startHour + 1, Math.ceil(maxEnd / 60)))
  return { startHour, endHour }
}

export function computeStats(items: ScheduleItem[]) {
  const total = items.length
  const done = items.filter((item) => item.status === "완료").length
  const inProgress = items.filter((item) => item.status === "진행 중").length
  const waiting = items.filter((item) => item.status === "대기").length
  const byCategory = uniqueValues(items, "category").map((category) => ({
    category,
    count: items.filter((item) => item.category === category).length,
  }))

  return {
    total,
    done,
    inProgress,
    waiting,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
    byCategory,
  }
}

export function formatRangeDate(date: string, withYear: boolean) {
  const [year, month, day] = date.split("-")
  if (withYear) {
    return `${year}. ${Number(month)}. ${Number(day)}.`
  }
  return `${Number(month)}. ${Number(day)}.`
}

export function formatKoreanDate(
  date: string,
  options?: { withYear?: boolean; withWeekday?: boolean; weekday?: string }
) {
  const [year, month, day] = date.split("-")
  const weekday = options?.weekday
    ? ` (${options.weekday.replace("요일", "")})`
    : options?.withWeekday
      ? ` (${weekdayLabel(date).replace("요일", "")})`
      : ""
  if (options?.withYear) {
    return `${year}. ${Number(month)}. ${Number(day)}.${weekday}`
  }
  return `${Number(month)}/${Number(day)}${weekday}`
}

export function weekdayLabel(date: string) {
  const labels = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ]
  return labels[new Date(`${date}T00:00:00+09:00`).getDay()]
}

export function todayInSeoul() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
  }).format(new Date())
}

export function minutesNowInSeoul() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date())
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0")
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? "0"
  )
  return hour * 60 + minute
}

export function formatFetchedAt(iso: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function isDone(status: string) {
  return status === "완료"
}

export function isInProgress(status: string) {
  return status === "진행 중"
}
