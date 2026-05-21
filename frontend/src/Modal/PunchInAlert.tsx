import React from 'react'

interface PunchInAlertProps {
  show: boolean
  shiftStart: string
  onClose: () => void
}

function to12Hour(time: string) {
  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}

function PunchInAlert({ show, shiftStart, onClose }: PunchInAlertProps) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>

        <h3 className="text-center font-bold text-gray-800 text-base mb-1">Not yet time to punch in</h3>
        <p className="text-center text-sm text-gray-400 mb-5 leading-relaxed">
          Punch in will be available once your shift starts at{" "}
          <span className="font-semibold text-gray-600">{to12Hour(shiftStart)}</span>.
        </p>

        <div className="flex justify-between bg-slate-50 rounded-xl px-4 py-3 mb-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Current time</span>
            <span className="text-sm font-semibold text-gray-700">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Shift start</span>
            <span className="text-sm font-semibold text-amber-500">{to12Hour(shiftStart)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-10 rounded-xl bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-600 active:scale-[0.98] transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export default PunchInAlert