"use client"

import { useCallback, useEffect, useState } from "react"

import { ScheduleDashboard } from "@/components/schedule/schedule-dashboard"
import { ScheduleError } from "@/components/schedule/schedule-error"
import { Skeleton } from "@/components/ui/skeleton"
import { loadScheduleInBrowser } from "@/lib/load-schedule"
import type { ScheduleData } from "@/lib/types"

export function ScheduleApp() {
  const [data, setData] = useState<ScheduleData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await loadScheduleInBrowser()
      setData(next)
    } catch {
      setError(
        "스프레드시트를 불러오지 못했습니다. 시트가 ‘링크가 있는 모든 사용자 보기’인지 확인해 주세요."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading && !data) {
    return <DashboardSkeleton />
  }

  if (error && !data) {
    return <ScheduleError message={error} />
  }

  if (!data) {
    return <ScheduleError message="표시할 일정이 없습니다." />
  }

  return (
    <ScheduleDashboard data={data} onRefresh={load} refreshing={loading} />
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-8 w-full max-w-xl" />
      <Skeleton className="h-[480px] rounded-xl" />
    </div>
  )
}
