"use client"

import { useMemo, useState } from "react"

import { ScheduleFilters } from "@/components/schedule/schedule-filters"
import { ScheduleHeader } from "@/components/schedule/schedule-header"
import { ScheduleList } from "@/components/schedule/schedule-list"
import { StatsCards } from "@/components/schedule/stats-cards"
import { WeekTimeline } from "@/components/schedule/week-timeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { filterSchedule, uniqueValues } from "@/lib/schedule"
import type { ScheduleData } from "@/lib/types"

type ScheduleDashboardProps = {
  data: ScheduleData
}

export function ScheduleDashboard({ data }: ScheduleDashboardProps) {
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const categories = useMemo(
    () => uniqueValues(data.items, "category"),
    [data.items]
  )
  const statuses = useMemo(
    () => uniqueValues(data.items, "status"),
    [data.items]
  )
  const filtered = useMemo(
    () => filterSchedule(data.items, category, status),
    [data.items, category, status]
  )

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <ScheduleHeader
        title={data.title}
        items={data.items}
        fetchedAt={data.fetchedAt}
        sheetUrl={data.sheetUrl}
      />
      <StatsCards items={filtered} />
      <ScheduleFilters
        categories={categories}
        statuses={statuses}
        category={category}
        status={status}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
      />
      <Tabs defaultValue="timeline" className="gap-4">
        <TabsList>
          <TabsTrigger value="timeline">주간 타임라인</TabsTrigger>
          <TabsTrigger value="list">일자별 리스트</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline">
          <WeekTimeline items={filtered} />
        </TabsContent>
        <TabsContent value="list">
          <ScheduleList items={filtered} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
