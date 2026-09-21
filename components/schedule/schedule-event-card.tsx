import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import {
  getCategoryStyle,
  isDone,
  isInProgress,
} from "@/lib/schedule"
import type { ScheduleItem } from "@/lib/types"

type ScheduleEventCardProps = {
  item: ScheduleItem
  compact?: boolean
}

export function ScheduleEventCard({ item, compact = false }: ScheduleEventCardProps) {
  const style = getCategoryStyle(item.category)
  const done = isDone(item.status)
  const inProgress = isInProgress(item.status)

  const card = (
    <article
      className={cn(
        "flex h-full min-h-0 overflow-hidden rounded-lg ring-1 ring-foreground/10",
        style.bg,
        done && "opacity-60",
        inProgress && "ring-2 ring-primary/70"
      )}
    >
      <span className={cn("w-1 shrink-0", style.bar)} />
      <div className={cn("min-w-0 flex-1", compact ? "p-1.5" : "p-3")}>
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "font-medium leading-snug",
              compact ? "line-clamp-2 text-xs" : "text-sm",
              style.text,
              done && "line-through"
            )}
          >
            {item.title}
          </p>
          {!compact ? (
            <Badge variant="outline" className={style.badge}>
              {item.category}
            </Badge>
          ) : null}
        </div>
        <p
          className={cn(
            "mt-0.5 tabular-nums text-muted-foreground",
            compact ? "text-[10px]" : "text-xs"
          )}
        >
          {item.timeRange}
        </p>
        {!compact && item.notes ? (
          <p className="mt-2 text-xs text-muted-foreground">{item.notes}</p>
        ) : null}
        <div className={cn("flex flex-wrap items-center gap-1", compact ? "mt-1" : "mt-2")}>
          {compact ? (
            <Badge variant="outline" className={cn("h-4 px-1.5 text-[10px]", style.badge)}>
              {item.category}
            </Badge>
          ) : null}
          <Badge
            variant={done ? "secondary" : inProgress ? "default" : "outline"}
            className={compact ? "h-4 px-1.5 text-[10px]" : undefined}
          >
            {item.status}
          </Badge>
        </div>
      </div>
    </article>
  )

  if (!item.notes || !compact) {
    return card
  }

  return (
    <Tooltip>
      <TooltipTrigger className="block h-full w-full text-left">
        {card}
      </TooltipTrigger>
      <TooltipContent>{item.notes}</TooltipContent>
    </Tooltip>
  )
}
