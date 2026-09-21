import {
  DEFAULT_SHEET_GID,
  DEFAULT_SHEET_ID,
  extractTitle,
  getSheetUrl,
  parseScheduleCsv,
} from "@/lib/sheets"
import type { ScheduleData } from "@/lib/types"

export async function loadScheduleInBrowser(): Promise<ScheduleData> {
  const id = DEFAULT_SHEET_ID
  const gid = DEFAULT_SHEET_GID
  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`

  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) {
    throw new Error("시트 요청이 실패했습니다.")
  }

  const csv = await response.text()
  if (!csv.trim() || csv.trimStart().startsWith("<")) {
    throw new Error("시트 응답이 CSV가 아닙니다.")
  }

  return {
    title: extractTitle(csv) ?? "주간 업무 및 학습 일정표",
    items: parseScheduleCsv(csv),
    fetchedAt: new Date().toISOString(),
    sheetUrl: getSheetUrl(),
  }
}
