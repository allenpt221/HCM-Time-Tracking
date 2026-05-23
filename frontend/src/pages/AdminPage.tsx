import { getWeekEnd, getWeekStart, minutesToTime, to12Hour, tsToDatetimeLocal, tsToDisplay } from '@/lib/time'
import { attendanceStore } from '@/Stores/attendanceStore'
import React, { useState, useEffect } from 'react'

const isLateOrUT = (val: number) => val > 0
const isND = (val: number) => val > 0

interface EditModal {
  id: string
  employeeName: string
  punchIn: string
  punchOut: string
}

function AdminPage() {
  const [activeTab, setActiveTab] = useState('Daily report')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [editModal, setEditModal] = useState<EditModal | null>(null)
  const [saving, setSaving] = useState(false)
  const tabs = ['Daily report', 'Weekly report', 'Punches']

  const { EmployeeAttendance, loading, error, AdminAttendance, updatePunch } = attendanceStore()

  useEffect(() => { AdminAttendance() }, [])

  const allRows = EmployeeAttendance ?? []
  const filteredRows = selectedEmployee === 'all'
    ? allRows
    : allRows.filter(r => r.user?.name === selectedEmployee)
  const uniqueEmployees = [...new Set(allRows.map(r => r.user?.name).filter(Boolean))]

  const weeklyMap: Record<string, any> = {}
  filteredRows.forEach(row => {
    if (!row.date) return
    const weekStart = getWeekStart(row.date)
    const key = `${row.userId}-${weekStart}`

    if (!weeklyMap[key]) {
      weeklyMap[key] = {
        employee:          row.user?.name ?? '—',
        schedule:          row.user?.schedule,
        weekStart,
        weekEnd:           getWeekEnd(weekStart),
        regularHours:      0,
        overtime:          0,
        nightDifferential: 0,
        late:              0,
        undertime:         0,
        totalHours:        0,
        days:              0,
      }
    }

    weeklyMap[key].regularHours      += row.regularHours      ?? 0
    weeklyMap[key].overtime          += row.overtime          ?? 0
    weeklyMap[key].nightDifferential += row.nightDifferential ?? 0
    weeklyMap[key].late              += row.late              ?? 0
    weeklyMap[key].undertime         += row.undertime         ?? 0
    weeklyMap[key].totalHours        += row.totalHours        ?? 0
    weeklyMap[key].days              += 1
  })

  const weeklyRows = Object.values(weeklyMap).sort((a, b) =>
    new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  )

  const openEdit = (row: any) => {
    setEditModal({
      id:           row.attendanceId,
      employeeName: row.user?.name ?? '—',
      punchIn:      tsToDatetimeLocal(row.timeIn),
      punchOut:     tsToDatetimeLocal(row.timeOut),
    })
  }

  const handleSave = async () => {
    if (!editModal) return
    setSaving(true)

    const toISO = (val: string) => val ? new Date(val).toISOString() : undefined

    const { success } = await updatePunch(
      editModal.id,
      toISO(editModal.punchIn),
      toISO(editModal.punchOut),
    )

    setSaving(false)
    if (success) setEditModal(null)
  }

  return (
    <div className="text-slate-900 font-sans">
      <div className="max-w-8xl mx-auto px-8 py-9">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 mb-1">Admin reports</h1>
            <p className="text-sm text-slate-400">Daily &amp; weekly metrics for all employees.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Employee</label>
            <div className="relative">
              <select
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl py-2 pl-3.5 pr-9 text-sm font-medium text-slate-800 cursor-pointer min-w-50 outline-none focus:border-blue-600 transition-colors"
              >
                <option value="all">All employees</option>
                {uniqueEmployees.map(name => (
                  <option key={name} value={name!}>{name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-r-4 border-t-[5px] border-l-transparent border-r-transparent border-t-slate-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-slate-200 mb-5">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer bg-transparent',
                activeTab === tab
                  ? 'text-slate-900 border-blue-600 font-semibold'
                  : 'text-slate-400 border-transparent hover:text-slate-700',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 px-7 pt-7 pb-5 shadow-sm">

          {/* Daily Report */}
          {activeTab === 'Daily report' && (
            <>
              <div className="text-sm font-semibold text-slate-900 mb-1">Daily totals</div>
              <div className="text-xs text-slate-400 mb-6">Regular, OT, ND, late, undertime per day.</div>

              {loading && <div className="py-12 text-center text-sm text-slate-400">Loading attendance data…</div>}
              {error   && <div className="py-12 text-center text-sm text-red-500">{error}</div>}
              {!loading && !error && filteredRows.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">No attendance records found.</div>
              )}

              {!loading && !error && filteredRows.length > 0 && (
                <div className="overflow-auto max-h-72">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {['Employee', 'Schedule', 'Date', 'Time In', 'Time Out', 'Regular', 'OT', 'ND', 'Late', 'Undertime', 'Total', ''].map((col, i) => (
                          <th key={i} className={[
                            'pb-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-200 px-3 sticky top-0 bg-white z-10',
                            i === 10 ? 'text-right' : 'text-left',
                          ].join(' ')}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, i) => (
                        <tr key={row.id ?? i} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3.5 text-sm font-semibold text-slate-900">{row.user?.name ?? '—'}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                            {row.user?.schedule ? `${to12Hour(row.user.schedule.start)} – ${to12Hour(row.user.schedule.end)}` : '—'}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">{row.date}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                            {tsToDisplay(row.timeIn)}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                            {row.timeOut
                              ? tsToDisplay(row.timeOut)
                              : <span className="inline-flex items-center bg-green-50 text-green-600 rounded px-1.5 py-0.5 text-xs font-semibold">Active</span>}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">{(row.regularHours ?? 0).toFixed(2)}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">{(row.overtime ?? 0).toFixed(2)}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">
                            {isND(row.nightDifferential ?? 0)
                              ? <span className="inline-flex items-center bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 text-xs font-semibold">{(row.nightDifferential ?? 0).toFixed(2)}</span>
                              : (row.nightDifferential ?? 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">
                            {isLateOrUT(row.late ?? 0)
                              ? <span className="inline-flex items-center bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-xs font-semibold">{minutesToTime(row.late ?? 0)}</span>
                              : minutesToTime(row.late ?? 0)}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">
                            {isLateOrUT(row.undertime ?? 0)
                              ? <span className="inline-flex items-center bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-xs font-semibold">{minutesToTime(row.undertime ?? 0)}</span>
                              : minutesToTime(row.undertime ?? 0)}
                          </td>
                          <td className="px-3 py-3.5 text-sm font-bold text-slate-900 text-right">{(row.totalHours ?? 0).toFixed(2)}</td>
                          <td className="px-3 py-3.5 text-right">
                            <button onClick={() => openEdit(row)} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer bg-transparent border-none">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Weekly Report */}
          {activeTab === 'Weekly report' && (
            <>
              <div className="text-sm font-semibold text-slate-900 mb-1">Weekly totals</div>
              <div className="text-xs text-slate-400 mb-6">Aggregated hours per employee per week.</div>

              {loading && <div className="py-12 text-center text-sm text-slate-400">Loading attendance data…</div>}
              {error   && <div className="py-12 text-center text-sm text-red-500">{error}</div>}
              {!loading && !error && weeklyRows.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">No attendance records found.</div>
              )}

              {!loading && !error && weeklyRows.length > 0 && (
                <div className="overflow-auto max-h-72">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {['Employee', 'Schedule', 'Week', 'Days', 'Regular', 'OT', 'ND', 'Late', 'Undertime', 'Total'].map((col, i) => (
                          <th key={i} className={[
                            'pb-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-200 px-3 sticky top-0 bg-white z-10',
                            i === 9 ? 'text-right' : 'text-left',
                          ].join(' ')}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyRows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3.5 text-sm font-semibold text-slate-900">{row.employee}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                            {row.schedule ? `${to12Hour(row.schedule.start)} – ${to12Hour(row.schedule.end)}` : '—'}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                            {row.weekStart} – {row.weekEnd}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">{row.days}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">{(row.regularHours ?? 0).toFixed(2)}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">{(row.overtime ?? 0).toFixed(2)}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">
                            {isND(row.nightDifferential ?? 0)
                              ? <span className="inline-flex items-center bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 text-xs font-semibold">{(row.nightDifferential ?? 0).toFixed(2)}</span>
                              : (row.nightDifferential ?? 0).toFixed(2)}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">
                            {isLateOrUT(row.late ?? 0)
                              ? <span className="inline-flex items-center bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-xs font-semibold">{minutesToTime(row.late ?? 0)}</span>
                              : minutesToTime(row.late ?? 0)}
                          </td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">
                            {isLateOrUT(row.undertime ?? 0)
                              ? <span className="inline-flex items-center bg-orange-50 text-orange-600 rounded px-1.5 py-0.5 text-xs font-semibold">{minutesToTime(row.undertime ?? 0)}</span>
                              : minutesToTime(row.undertime ?? 0)}
                          </td>
                          <td className="px-3 py-3.5 text-sm font-bold text-slate-900 text-right">{(row.totalHours ?? 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Punches */}
          {activeTab === 'Punches' && (
            <>
              <div className="text-sm font-semibold text-slate-900 mb-1">Punch records</div>
              <div className="text-xs text-slate-400 mb-6">Raw time-in and time-out per record.</div>

              {loading && <div className="py-12 text-center text-sm text-slate-400">Loading attendance data…</div>}
              {error   && <div className="py-12 text-center text-sm text-red-500">{error}</div>}
              {!loading && !error && filteredRows.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-400">No punch records found.</div>
              )}

              {!loading && !error && filteredRows.length > 0 && (
                <div className="overflow-auto max-h-72">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {['Employee', 'Date', 'Punch In', 'Punch Out', 'Total', ''].map((col, i) => (
                          <th key={i} className={[
                            'pb-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-200 px-3 sticky top-0 bg-white z-10',
                            i === 4 ? 'text-right' : 'text-left',
                          ].join(' ')}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((row, i) => (
                        <tr key={row.id ?? i} className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-3.5 text-sm font-semibold text-slate-900">{row.user?.name ?? '—'}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600">{row.date}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600 whitespace-nowrap">{tsToDisplay(row.timeIn)}</td>
                          <td className="px-3 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                            {row.timeOut
                              ? tsToDisplay(row.timeOut)
                              : <span className="inline-flex items-center bg-green-50 text-green-600 rounded px-1.5 py-0.5 text-xs font-semibold">Active</span>}
                          </td>
                          <td className="px-3 py-3.5 text-sm font-bold text-slate-900 text-right">{(row.totalHours ?? 0).toFixed(2)}</td>
                          <td className="px-3 py-3.5 text-right">
                            <button onClick={() => openEdit(row)} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer bg-transparent border-none">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Edit Punch Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => !saving && setEditModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm mx-4 p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-0.5">Edit punch times</h2>
            <p className="text-xs text-slate-400 mb-5">{editModal.employeeName}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Punch In</label>
                <input
                  type="datetime-local"
                  value={editModal.punchIn}
                  onChange={e => setEditModal({ ...editModal, punchIn: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Punch Out</label>
                <input
                  type="datetime-local"
                  value={editModal.punchOut}
                  onChange={e => setEditModal({ ...editModal, punchOut: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setEditModal(null)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage