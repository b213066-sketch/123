"use client"

import { Button } from "@/components/ui/button"
import { getCategoryStyle } from "@/lib/schedule"

type ScheduleFiltersProps = {
  categories: string[]
  statuses: string[]
  category: string
  status: string
  onCategoryChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export function ScheduleFilters({
  categories,
  statuses,
  category,
  status,
  onCategoryChange,
  onStatusChange,
}: ScheduleFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <FilterRow label="카테고리">
        <FilterChip
          active={category === "all"}
          onClick={() => onCategoryChange("all")}
        >
          전체
        </FilterChip>
        {categories.map((value) => {
          const style = getCategoryStyle(value)
          return (
            <FilterChip
              key={value}
              active={category === value}
              onClick={() => onCategoryChange(value)}
            >
              <span className={`size-2 rounded-full ${style.dot}`} />
              {value}
            </FilterChip>
          )
        })}
      </FilterRow>
      <FilterRow label="상태">
        <FilterChip
          active={status === "all"}
          onClick={() => onStatusChange("all")}
        >
          전체
        </FilterChip>
        {statuses.map((value) => (
          <FilterChip
            key={value}
            active={status === value}
            onClick={() => onStatusChange(value)}
          >
            {value}
          </FilterChip>
        ))}
      </FilterRow>
    </div>
  )
}

function FilterRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="gap-1.5"
    >
      {children}
    </Button>
  )
}
