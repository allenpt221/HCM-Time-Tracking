
function parseTime(dateStr: string, timeStr: string, timezone: string): Date {
  const [hour, minute] = timeStr.split(":").map(Number);
  const localString = `${dateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`

  const utcDate = new Date(`${dateStr}T00:00:00Z`)
  const localMidnight = new Date(
    new Date(utcDate).toLocaleString("en-US", { timeZone: timezone })
  )
  const offsetMs = utcDate.getTime() - localMidnight.getTime()

  const naive = new Date(localString)
  return new Date(naive.getTime() + offsetMs)
}

function getLocalDate(time: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
  }).format(time);
}

export function computeAttendance(
  timeIn: Date,
  timeOut: Date,
  schedule: { start: string; end: string },
  timezone: string
) {
  const localDateStr = getLocalDate(timeIn, timezone);

  const startMin =
    Number(schedule.start.split(":")[0]) * 60 +
    Number(schedule.start.split(":")[1]);

  const endMin =
    Number(schedule.end.split(":")[0]) * 60 +
    Number(schedule.end.split(":")[1]);

  let shiftStart = parseTime(localDateStr, schedule.start, timezone);
  let shiftEnd   = parseTime(localDateStr, schedule.end,   timezone);

  const isNightShift = endMin <= startMin;

  if (isNightShift) {
    shiftEnd = new Date(shiftEnd.getTime() + 24 * 60 * 60 * 1000);

    const localTimeIn = new Date(timeIn.toLocaleString("en-US", { timeZone: timezone }))
    const punchHour   = localTimeIn.getHours()

    if (punchHour >= 0 && punchHour < 12) {
      shiftStart = new Date(shiftStart.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  let actualOut = new Date(timeOut);

  if (actualOut < timeIn) {
    actualOut = new Date(actualOut.getTime() + 24 * 60 * 60 * 1000);
  }

  const totalMinutes = Math.max(
    0,
    (actualOut.getTime() - timeIn.getTime()) / 60000
  );

  const shiftMinutes = Math.max(
    0,
    (shiftEnd.getTime() - shiftStart.getTime()) / 60000
  );

  const late = Math.max(
    0,
    (timeIn.getTime() - shiftStart.getTime()) / 60000
  );

  const overtime  = Math.max(0, totalMinutes - shiftMinutes);
  const undertime = Math.max(0, shiftMinutes - totalMinutes);

  const regularMinutes = Math.min(totalMinutes, shiftMinutes);

  return {
    late:         Math.floor(late),
    overtime:     Math.floor(overtime),
    undertime:    Math.floor(undertime),
    regularHours: Number((regularMinutes / 60).toFixed(2)),
    totalHours:   Number((totalMinutes / 60).toFixed(2)),
  };
}