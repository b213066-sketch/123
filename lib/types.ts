export type ScheduleItem = {
  id: string
  date: string
  dayOfWeek: string
  timeRange: string
  startMinutes: number
  endMinutes: number
  category: string
  title: string
  status: string
  notes: string
}

export type ScheduleData = {
  title: string
  items: ScheduleItem[]
  fetchedAt: string
  sheetUrl: string
}

export type ScheduleFetchResult =
  | { ok: true; data: ScheduleData }
  | { ok: false; error: string }
