
function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function formatElapsed(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export function formatHM(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${pad(m)}m`
}

export function to12Hour(time: string) {
  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}

export function parseTimestamp(value: any): Date | null {
  if (!value) return null
  if (value?._seconds) return new Date(value._seconds * 1000)
  if (value?.seconds) return new Date(value.seconds * 1000)
  if (value?.toDate) return value.toDate()
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}