import type { ScheduleFetchResult, ScheduleItem } from "@/lib/types"
import { parseTimeRange } from "@/lib/schedule"

export const DEFAULT_SHEET_ID = "1O_6q3hfWJN9bPwtyPxQAKzazhk2LvRQ4ziLyqfFgXAU"
export const DEFAULT_SHEET_GID = "0"

const HEADER_ALIASES = {
  date: ["날짜", "date"],
  dayOfWeek: ["요일", "요일명", "day"],
  time: ["시간", "time"],
  category: ["카테고리", "분류", "category"],
  title: ["할 일", "할일", "일정", "제목", "task", "title"],
  status: ["상태", "status"],
  notes: ["비고", "메모", "notes", "note"],
} as const

function getSheetId() {
  return process.env.GOOGLE_SHEET_ID ?? DEFAULT_SHEET_ID
}

function getSheetGid() {
  return process.env.GOOGLE_SHEET_GID ?? DEFAULT_SHEET_GID
}

export function getSheetUrl() {
  return `https://docs.google.com/spreadsheets/d/${getSheetId()}/edit?usp=sharing`
}

function getCsvUrls() {
  const id = getSheetId()
  const gid = getSheetGid()
  return [
    `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`,
    `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`,
  ]
}

function isCsv(text: string) {
  const trimmed = text.trimStart()
  return trimmed.length > 0 && !trimmed.startsWith("<")
}

async function fetchCsvText() {
  const headers = {
    Accept: "text/csv,text/plain;q=0.9,*/*;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (compatible; ScheduleDashboard/1.0; +https://vercel.com)",
  }

  for (const url of getCsvUrls()) {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers,
    })
    if (!response.ok) {
      continue
    }
    const csv = await response.text()
    if (isCsv(csv)) {
      return csv
    }
  }

  return null
}

export async function fetchSchedule(): Promise<ScheduleFetchResult> {
  try {
    const csv = await fetchCsvText()
    if (!csv) {
      return {
        ok: false,
        error:
          "스프레드시트를 불러오지 못했습니다. 시트가 ‘링크가 있는 모든 사용자 보기’인지 확인해 주세요.",
      }
    }

    const items = parseScheduleCsv(csv)
    const title = extractTitle(csv) ?? "주간 업무 및 학습 일정표"

    return {
      ok: true,
      data: {
        title,
        items,
        fetchedAt: new Date().toISOString(),
        sheetUrl: getSheetUrl(),
      },
    }
  } catch {
    return {
      ok: false,
      error:
        "네트워크 오류로 일정을 가져오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    }
  }
}

export function parseScheduleCsv(csv: string): ScheduleItem[] {
  const rows = parseCsv(csv)
  const headerIndex = rows.findIndex((row) => findColumnMap(row))
  if (headerIndex === -1) {
    return []
  }

  const columnMap = findColumnMap(rows[headerIndex])
  if (!columnMap) {
    return []
  }

  const items: ScheduleItem[] = []

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i]
    const dateRaw = row[columnMap.date]?.trim() ?? ""
    const title = row[columnMap.title]?.trim() ?? ""
    const timeRange = row[columnMap.time]?.trim() ?? ""

    if (!dateRaw && !title && !timeRange) {
      if (items.length > 0) {
        break
      }
      continue
    }

    const date = normalizeDate(dateRaw)
    if (!date || !title) {
      continue
    }

    const { startMinutes, endMinutes, timeRange: normalizedRange } =
      parseTimeRange(timeRange)
    const dayOfWeek =
      row[columnMap.dayOfWeek]?.trim() || weekdayFromDate(date)

    items.push({
      id: `${date}-${startMinutes}-${i}`,
      date,
      dayOfWeek,
      timeRange: normalizedRange,
      startMinutes,
      endMinutes,
      category: row[columnMap.category]?.trim() || "기타",
      title,
      status: row[columnMap.status]?.trim() || "대기",
      notes: row[columnMap.notes]?.trim() ?? "",
    })
  }

  return items
}

export function extractTitle(csv: string) {
  const rows = parseCsv(csv)
  const header = rows.find((row) => findColumnMap(row))
  if (header) {
    const dateIndex = findAliasIndex(
      header.map((cell) => cell.trim().toLowerCase()),
      HEADER_ALIASES.date
    )
    const prefix = header[dateIndex]?.trim().replace(/\s*날짜$/i, "").trim()
    if (prefix) {
      return prefix
    }
  }

  return extractTitleFromRows(rows)
}

function extractTitleFromRows(rows: string[][]) {
  for (const row of rows) {
    const value = row.find((cell) => cell.trim())
    if (value && !findColumnMap(row)) {
      return value.trim()
    }
  }
  return null
}

function findColumnMap(row: string[]) {
  const normalized = row.map((cell) => cell.trim().toLowerCase())
  const date = findAliasIndex(normalized, HEADER_ALIASES.date)
  const time = findAliasIndex(normalized, HEADER_ALIASES.time)
  const title = findAliasIndex(normalized, HEADER_ALIASES.title)

  if (date === -1 || time === -1 || title === -1) {
    return null
  }

  return {
    date,
    dayOfWeek: findAliasIndex(normalized, HEADER_ALIASES.dayOfWeek),
    time,
    category: findAliasIndex(normalized, HEADER_ALIASES.category),
    title,
    status: findAliasIndex(normalized, HEADER_ALIASES.status),
    notes: findAliasIndex(normalized, HEADER_ALIASES.notes),
  }
}

function findAliasIndex(row: string[], aliases: readonly string[]) {
  const exact = row.findIndex((cell) =>
    aliases.some((alias) => cell.trim().toLowerCase() === alias.toLowerCase())
  )
  if (exact !== -1) {
    return exact
  }

  return row.findIndex((cell) =>
    aliases.some((alias) => {
      const value = cell.trim().toLowerCase()
      const needle = alias.toLowerCase()
      return value.endsWith(needle) || value.includes(needle)
    })
  )
}

function normalizeDate(value: string) {
  const trimmed = value.trim()
  const iso = trimmed.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/)
  if (iso) {
    const [, year, month, day] = iso
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  const us = trimmed.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})$/)
  if (us) {
    const [, month, day, year] = us
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
  }

  if (/^\d+$/.test(trimmed)) {
    const serial = Number(trimmed)
    if (serial > 20000 && serial < 80000) {
      const excelEpoch = Date.UTC(1899, 11, 30)
      const date = new Date(excelEpoch + serial * 86400000)
      return date.toISOString().slice(0, 10)
    }
  }

  return null
}

function weekdayFromDate(date: string) {
  const labels = [
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
    "일요일",
  ]
  const utc = new Date(`${date}T00:00:00+09:00`)
  const day = utc.getUTCDay()
  const mondayFirst = (day + 6) % 7
  return labels[mondayFirst]
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false
  const source = text.replace(/^\uFEFF/, "")

  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (inQuotes) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      row.push(cell)
      cell = ""
    } else if (char === "\n") {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else if (char !== "\r") {
      cell += char
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}
