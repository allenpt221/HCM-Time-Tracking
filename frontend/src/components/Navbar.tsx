import { Hourglass } from "lucide-react"

function Navbar() {
  const navItems = ["dashboard", "admin"]

  return (
    <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        
        <div className="flex gap-5">
            <div className="flex items-center gap-3">
            <span className="flex items-center justify-center h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm">
                <Hourglass className="h-5 w-5 text-indigo-500" strokeWidth={2.5} />
            </span>

            <span className="font-bold text-lg tracking-wide">
                Mini HCM
            </span>
            </div>

            <div className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
                <span
                key={index}
                className="text-gray-600 hover:text-indigo-500 cursor-pointer capitalize transition"
                >
                {item}
                </span>
            ))}
            </div>
        </div>

        {/* User Section */}
        <div className="text-sm font-medium text-gray-700">
          User
        </div>
      </div>
    </div>
  )
}

export default Navbar