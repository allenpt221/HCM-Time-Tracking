import { getWeekStart } from '@/lib/time'
import { attendanceStore } from '@/Stores/attendanceStore'
import { authStore } from '@/Stores/authStore'
import { useEffect } from 'react'

export function AdminKPI() {
  const { EmployeeAttendance } = attendanceStore()
  const { users, getUsers } = authStore()

  useEffect(() => { getUsers() }, [])

  const allRows = EmployeeAttendance ?? []
  const today   = new Date().toISOString().slice(0, 10)

  const totalEmployees = users.length

  const todayRows    = allRows.filter(r => r.date === today)
  const activeToday  = todayRows.filter(r => r.timeIn && !r.timeOut).length
  const clockedToday = todayRows.filter(r => r.timeIn).length

  const weekStart = getWeekStart(today)
  const weekRows  = allRows.filter(r => r.date && r.date >= weekStart && r.date <= today)

  const totalOT   = weekRows.reduce((s, r) => s + (r.overtime          ?? 0), 0)
  const totalND   = weekRows.reduce((s, r) => s + (r.nightDifferential ?? 0), 0)
  const lateCount = new Set(
        weekRows.filter(r => (r.late ?? 0) > 0).map(r => r.userId)
    ).size

  const completedRows = allRows.filter(r => r.timeIn && r.timeOut)
  const avgHours = completedRows.length
    ? completedRows.reduce((s, r) => s + (r.totalHours ?? 0), 0) / completedRows.length
    : 0


  const kpis = [
    {
      icon:  'ti-users',
      label: 'Total employees',
      value: totalEmployees,
      sub:   `${clockedToday} clocked in today`,
    },
    {
      icon:  'ti-user-check',
      label: 'Active now',
      value: activeToday,
      sub:   `of ${totalEmployees} employees`,
      good:  activeToday > 0,
    },
    {
      icon:  'ti-clock',
      label: 'Avg hrs / day',
      value: avgHours.toFixed(1),
      sub:   'target: 8.0 hrs',
      warn:  avgHours > 0 && avgHours < 7,
      good:  avgHours >= 8,
    },
    {
      icon:  'ti-trending-up',
      label: 'OT this week',
      value: totalOT.toFixed(1),
      sub:   'overtime hours',
    },
    {
      icon:  'ti-moon',
      label: 'Night diff',
      value: totalND.toFixed(1),
      sub:   'ND hours this week',
      good:  totalND > 0,
    },
    {
      icon:  'ti-alert-triangle',
      label: 'Late this week',
      value: lateCount,
      sub:   'employees late',
      warn:  lateCount > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 sm:gap-3 gap-1 mb-7">
      {kpis.map(({ icon, label, value, sub, warn, good }) => (
        <div key={label} className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
            <i className={`ti ${icon} text-base`} aria-hidden="true" />
            {label}
          </div>
          <div className="text-2xl font-semibold text-slate-900 leading-none">{value}</div>
          <div className="mt-1.5 text-xs">
            {warn
              ? <span className="bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 font-medium">{sub}</span>
              : good
              ? <span className="bg-green-50 text-green-700 rounded-full px-2 py-0.5 font-medium">{sub}</span>
              : <span className="text-slate-400">{sub}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}