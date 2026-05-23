import { useState, useEffect, useMemo } from "react"
import {
  Play, Square, CalendarDays, ChevronRight,
} from "lucide-react"
import { authStore } from "@/Stores/authStore"
import { attendanceStore } from "@/Stores/attendanceStore"
import PunchInAlert from "@/Modal/PunchInAlert"
import AttendanceHistoryModal from "@/Modal/AttendanceHistory"
import { formatElapsed, formatHM, parseTimestamp, to12Hour } from "@/lib/time"

const today = new Date()
const dateLabel = today.toLocaleDateString("en-US", {
  weekday: "long", month: "long", day: "numeric",
})

type Punch = { type: "in" | "out"; time: Date }

export default function Dashboard() {
  const { user } = authStore()
  const {
    punchIn,
    punchOut,
    fetchAttendance,
    loading: punchLoading,
    error: punchError,
    isClockedIn,
    elapsed,
    punchInTime,
    history,
    clearError,
  } = attendanceStore()

  const [punches, setPunches] = useState<Punch[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showPunchAlert, setShowPunchAlert] = useState(false)
  const [punchAlertType, setPunchAlertType] = useState<'too-early' | 'shift-ended'>('too-early')

  useEffect(() => {
    fetchAttendance()
  }, [])

  useEffect(() => {
    if (isClockedIn && punches.length === 0) {
      setPunches([{ type: "in", time: punchInTime ?? new Date() }])
    }
  }, [isClockedIn])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowHistory(false)
        setShowPunchAlert(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const shiftStart = useMemo(() => user?.schedule?.start ?? "09:00", [user])
  const shiftEnd   = useMemo(() => user?.schedule?.end   ?? "18:00", [user])

  async function handlePunchIn() {
    if (isClockedIn) return

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    const [startH, startM] = shiftStart.split(":").map(Number)
    const shiftStartMinutes = startH * 60 + startM

    const [endH, endM] = shiftEnd.split(":").map(Number)
    const shiftEndMinutes = endH * 60 + endM

    if (currentMinutes < shiftStartMinutes) {
      setPunchAlertType('too-early')
      setShowPunchAlert(true)
      return
    }

    if (currentMinutes >= shiftEndMinutes) {
      setPunchAlertType('shift-ended')
      setShowPunchAlert(true)
      return
    }

    const result = await punchIn()
    if (result.success) {
      setPunches(prev => [...prev, { type: "in", time: new Date() }])
    }
  }

  async function handlePunchOut() {
    if (!isClockedIn) return
    const result = await punchOut()
    if (result.success) {
      setPunches(prev => [...prev, { type: "out", time: new Date() }])
    }
  }

  const sinceLabel = isClockedIn && punchInTime
    ? punchInTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null

  const todayRecord    = history[0] ?? null
  const regularHours   = todayRecord?.regularHours     ?? 0
  const overtimeMin    = todayRecord?.overtime          ?? 0
  const nightDiffHours = todayRecord?.nightDifferential ?? 0
  const lateMin        = todayRecord?.late              ?? 0
  const undertimeMin   = todayRecord?.undertime         ?? 0
  const totalHours     = todayRecord?.totalHours        ?? 0

  const historyRows = history.map((record: any) => {
    const timeInDate  = parseTimestamp(record.timeIn)
    const timeOutDate = parseTimestamp(record.timeOut)
    const dateObj     = record.date ? new Date(record.date + "T00:00:00") : null
    return {
      date:    dateObj ? dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "—",
      in:      timeInDate  ? timeInDate.toLocaleTimeString("en-US",  { hour: "2-digit", minute: "2-digit" }) : "—",
      out:     timeOutDate ? timeOutDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Active",
      regular: `${(record.regularHours ?? 0).toFixed(1)}h`,
      ot:      `${((record.overtime ?? 0) / 60).toFixed(1)}h`,
      undertime:      `${((record.undertime ?? 0) / 60).toFixed(1)}h`,
      nightDiff: `${(record.nightDifferential ?? 0).toFixed(2)} h`,
      late:    formatHM((record.late ?? 0) * 60),
    }
  })

  return (
    <div className="overflow-hidden bg-slate-50 flex flex-col p-4 md:p-6">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-4 h-full">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">

          {/* Clock Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-gray-800">{dateLabel}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Shift: {to12Hour(shiftStart)} – {to12Hour(shiftEnd)}
                </p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                isClockedIn ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {isClockedIn ? "On the clock" : "Off the clock"}
              </span>
            </div>

            {punchError && (
              <div className="mb-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {punchError}
                <button onClick={clearError} className="ml-auto text-red-400 hover:text-red-600">✕</button>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl flex-1 flex flex-col items-center justify-center gap-1.5 mb-4">
              <span className="font-mono text-4xl md:text-5xl font-black tracking-tight text-gray-800 tabular-nums">
                {formatElapsed(elapsed)}
              </span>
              {sinceLabel && (
                <span className="text-xs text-gray-400">Since {sinceLabel}</span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePunchIn}
                disabled={isClockedIn || punchLoading}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl font-semibold text-sm transition-all
                  bg-indigo-500 text-white hover:bg-indigo-600 active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {punchLoading && !isClockedIn
                  ? <><svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg> Punching in...</>
                  : <><Play size={15} fill="white" /> Punch In</>
                }
              </button>
              <button
                onClick={handlePunchOut}
                disabled={!isClockedIn || punchLoading}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl font-semibold text-sm transition-all
                  bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {punchLoading && isClockedIn
                  ? <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg> Punching out...
                    </>
                  : <>
                      <Square size={15} fill="white" /> Punch Out
                    </>
                }
              </button>
            </div>
          </div>

          {/* Today's Totals */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
            <h3 className="font-bold text-gray-800 text-sm mb-0.5">Today's totals</h3>
            <p className="text-xs text-gray-400 mb-4">From your attendance record</p>
            <div className="flex flex-col justify-between flex-1">
              <div className="space-y-2.5">
                {[
                  { label: "Regular",    val: `${regularHours.toFixed(2)} h`      },
                  { label: "Overtime",   val: `${(overtimeMin/60).toFixed(2)} h`  },
                  { label: "Night Diff", val: `${nightDiffHours.toFixed(2)} h`    },
                  { label: "Late",       val: formatHM(lateMin * 60)              },
                  { label: "Undertime",  val: formatHM(undertimeMin * 60)         },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-700">{val}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-2.5 mt-2.5 flex justify-between text-sm font-bold">
                <span className="text-gray-700">Total worked</span>
                <span className="text-gray-900">{totalHours.toFixed(2)} h</span>
              </div>
            </div>
          </div>

        </div>

        {/* History trigger */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={15} className="text-gray-400" />
              <div>
                <h3 className="font-bold text-gray-800 text-sm">History</h3>
                <p className="text-xs text-gray-400">Daily breakdown of your attendance</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>
        </div>

      </div>

      <PunchInAlert
        show={showPunchAlert}
        alertType={punchAlertType}
        shiftStart={shiftStart}
        shiftEnd={shiftEnd}
        onClose={() => setShowPunchAlert(false)}
      />

      <AttendanceHistoryModal
        show={showHistory}
        historyRows={historyRows}
        onClose={() => setShowHistory(false)}
      />
    </div>
  )
}