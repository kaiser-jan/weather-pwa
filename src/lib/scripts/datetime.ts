export function startOfDate(date: Date = new Date()) {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}
export function endOfDate(date: Date = new Date()) {
  const copy = new Date(date)
  copy.setHours(24, 0, 0, 0)
  return copy
}

export function doDatesMatch(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
