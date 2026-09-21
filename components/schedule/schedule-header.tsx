"use client"

import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { refreshSchedule } from "@/lib/actions"
import { formatFetchedAt, getWeekRangeLabel } from "@/lib/schedule"
import type { ScheduleItem } from "@/lib/types"

type ScheduleHeaderProps = {
  title: string
  items: ScheduleItem[]
  fetchedAt: string
  sheetUrl: string
}

export function ScheduleHeader({
  title,
  items,
  fetchedAt,
  sheetUrl,
}: ScheduleHeaderProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onRefresh() {
    setError(null)
    startTransition(async () => {
      try {
        await refreshSchedule()
        router.refresh()
      } catch {
        setError("새로고침에 실패했습니다.")
      }
    })
  }

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          일정 대시보드
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {getWeekRangeLabel(items)}
          <span className="mx-2 text-border">|</span>
          마지막 동기화 {formatFetchedAt(fetchedAt)}
        </p>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isPending}
        >
          <RefreshCwIcon className={isPending ? "animate-spin" : undefined} />
          새로고침
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <a href={sheetUrl} target="_blank" rel="noreferrer" />
          }
        >
          <ExternalLinkIcon />
          시트 열기
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
