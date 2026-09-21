import { ScheduleDashboard } from "@/components/schedule/schedule-dashboard"
import { ScheduleError } from "@/components/schedule/schedule-error"
import { fetchSchedule } from "@/lib/sheets"

export const dynamic = "force-dynamic"

export default async function Page() {
  const result = await fetchSchedule()

  if (!result.ok) {
    return <ScheduleError message={result.error} />
  }

  return <ScheduleDashboard data={result.data} />
}
