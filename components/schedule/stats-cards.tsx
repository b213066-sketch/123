import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { getCategoryStyle } from "@/lib/schedule"
import type { ScheduleItem } from "@/lib/types"
import { computeStats } from "@/lib/schedule"

type StatsCardsProps = {
  items: ScheduleItem[]
}

export function StatsCards({ items }: StatsCardsProps) {
  const stats = computeStats(items)

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-muted-foreground">전체 일정</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">{stats.total}</p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-muted-foreground">완료</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-2xl font-semibold tabular-nums">{stats.done}</p>
          <Progress value={stats.completionRate}>
            <ProgressLabel>완료율</ProgressLabel>
            <ProgressValue>
              {(formatted) => formatted ?? `${stats.completionRate}%`}
            </ProgressValue>
          </Progress>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-muted-foreground">진행 중 / 대기</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tabular-nums">
            {stats.inProgress}
            <span className="mx-1 text-muted-foreground">/</span>
            {stats.waiting}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">진행 중 · 대기</p>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-muted-foreground">카테고리</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {stats.byCategory.map(({ category, count }) => {
              const style = getCategoryStyle(category)
              return (
                <li key={category} className="flex items-center gap-1.5 text-sm">
                  <span className={`size-2 rounded-full ${style.dot}`} />
                  <span>{category}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {count}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}
