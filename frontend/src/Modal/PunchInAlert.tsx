interface PunchInAlertProps {
  show: boolean
  shiftStart: string
  shiftEnd?: string
  alertType?: 'too-early' | 'shift-ended'
  onClose: () => void
}

function to12Hour(time: string) {
  const [h, m] = time.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`
}

function PunchInAlert({ show, shiftStart, shiftEnd, alertType = 'too-early', onClose }: PunchInAlertProps) {
  if (!show) return null

  const isShiftEnded = alertType === 'shift-ended'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">

        {/* Icon */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isShiftEnded ? 'bg-red-50' : 'bg-amber-50'}`}>
          {isShiftEnded ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
            </svg>
          )}
        </div>

        {/* Title & description */}
        <h3 className="text-center font-bold text-gray-800 text-base mb-1">
          {isShiftEnded ? 'Shift has ended' : 'Not yet time to punch in'}
        </h3>
        <p className="text-center text-sm text-gray-400 mb-5 leading-relaxed">
          {isShiftEnded ? (
            <>
              Your shift has already ended at{" "}
              <span className="font-semibold text-gray-600">{shiftEnd ? to12Hour(shiftEnd) : '—'}</span>.
              {" "}Please contact your administrator if you need to log attendance.
            </>
          ) : (
            <>
              Punch in will be available once your shift starts at{" "}
              <span className="font-semibold text-gray-600">{to12Hour(shiftStart)}</span>.
            </>
          )}
        </p>

        {/* Time info row */}
        <div className="flex justify-between bg-slate-50 rounded-xl px-4 py-3 mb-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Current time</span>
            <span className="text-sm font-semibold text-gray-700">
              {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="w-px bg-gray-200" />
          {isShiftEnded ? (
            <div className="flex flex-col gap-0.5 items-end">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Shift ended</span>
              <span className="text-sm font-semibold text-red-400">{shiftEnd ? to12Hour(shiftEnd) : '—'}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 items-end">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Shift start</span>
              <span className="text-sm font-semibold text-amber-500">{to12Hour(shiftStart)}</span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className={`w-full h-10 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-all ${
            isShiftEnded ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-500 hover:bg-indigo-600'
          }`}
        >
          Got it
        </button>
      </div>
    </div>
  )
}

export default PunchInAlert