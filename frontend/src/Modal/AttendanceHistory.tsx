import React from 'react'
import { CalendarDays, X } from 'lucide-react'

interface HistoryRow {
  date: string
  in: string
  out: string
  regular: string
  ot: string
  late: string
}

interface AttendanceHistoryModalProps {
  show: boolean
  historyRows: HistoryRow[]
  onClose: () => void
}

function AttendanceHistoryModal({ show, historyRows, onClose }: AttendanceHistoryModalProps) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-gray-400" />
            <h3 className="font-bold text-gray-800 text-base">Attendance History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="overflow-auto p-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Date", "Punch In", "Punch Out", "Regular", "Overtime", "Late"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pb-3 pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-gray-400">No attendance records yet</td>
                </tr>
              ) : (
                historyRows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-6 font-medium text-gray-700">{row.date}</td>
                    <td className="py-3 pr-6 text-gray-500">{row.in}</td>
                    <td className="py-3 pr-6 text-gray-500">{row.out}</td>
                    <td className="py-3 pr-6 text-gray-700">{row.regular}</td>
                    <td className="py-3 pr-6 text-gray-500">{row.ot}</td>
                    <td className="py-3 pr-6">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        row.late === "0h 00m" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {row.late}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AttendanceHistoryModal