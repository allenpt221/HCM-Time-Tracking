
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




export const minutesToTime = (minutes: number) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export const tsToDatetimeLocal = (ts: { _seconds: number } | null) => {
  if (!ts) return ''
  const d = new Date(ts._seconds * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const tsToDisplay = (ts: { _seconds: number } | null) => {
  if (!ts) return '—'
  const d = new Date(ts._seconds * 1000)
  return d.toLocaleString('en-PH', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}



export const getWeekStart = (dateStr: string) => {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export const getWeekEnd = (weekStart: string) => {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}