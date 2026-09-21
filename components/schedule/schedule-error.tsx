import { AlertCircleIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ScheduleErrorProps = {
  message: string
}

export function ScheduleError({ message }: ScheduleErrorProps) {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-lg items-center px-4">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertCircleIcon className="size-5 text-destructive" />
          <CardTitle>일정을 불러오지 못했습니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{message}</p>
          <p>
            구글 시트 공유 상태를 ‘링크가 있는 모든 사용자 보기’로 유지해야
            대시보드가 데이터를 가져올 수 있습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
