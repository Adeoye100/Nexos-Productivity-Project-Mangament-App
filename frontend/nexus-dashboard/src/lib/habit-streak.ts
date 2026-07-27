/** Shared habit streak helpers — reused by habit tracker and XP awards */

export function toDateString(d: Date): string {
  return d.toISOString().split("T")[0]
}

export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function calcHabitStreaks(dates: Set<string>): {
  current: number
  longest: number
} {
  if (dates.size === 0) return { current: 0, longest: 0 }

  const today = startOfToday()
  const todS = toDateString(today)
  const checkFrom = dates.has(todS)
    ? today
    : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)

  let cur = 0
  const cd = new Date(checkFrom)
  while (dates.has(toDateString(cd))) {
    cur++
    cd.setDate(cd.getDate() - 1)
  }

  const sorted = [...dates].sort()
  let longest = 1
  let run = 1
  for (let i = 1; i < sorted.length; i++) {
    const diff = Math.round(
      (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) /
        86400000,
    )
    if (diff === 1) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }

  return { current: cur, longest: Math.max(longest, cur) }
}
