import { authStore } from "@/Stores/authStore"
import { Hourglass, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom";

function Navbar() {

  const { user } = authStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [{
    item: 'Dashboard',
    href: '/dashboard'
  }, {
    item: 'Admin',
    href: '/admin'

  }]

  return (
    <>
      <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          {/* Left: Logo + Desktop Nav */}
          <div className="flex gap-5">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-sm">
                <Hourglass className="h-5 w-5 text-indigo-500" strokeWidth={2.5} />
              </span>
              <span className="font-bold text-lg tracking-wide">
                Mini HCM
              </span>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item, index) => (
                <Link to={item.href}
                  key={index}
                  className="text-gray-600 hover:text-indigo-500 cursor-pointer capitalize transition"
                >
                  {item.item}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: User info (desktop) + Burger */}
          <div className="flex items-center gap-4">

            {/* User info — desktop only */}
            <div className="hidden md:flex text-sm items-center gap-5">
              <div className="flex flex-col">
                <span className="font-semibold">{user?.email}</span>
                <span className="text-end text-black/70">{user?.role}</span>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer border shadow-sm">
                <LogOut />
              </button>
            </div>

            {/* Burger — mobile only */}
            <button
              className="md:hidden flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

          </div>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Right Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <span className="font-bold text-lg tracking-wide">Mini HCM</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col px-5 py-4 gap-1">
          {navItems.map((item, index) => (
            <Link to={item.href}
              key={index}
              className="text-gray-700 hover:text-indigo-500 hover:bg-indigo-50 cursor-pointer capitalize transition rounded-lg px-3 py-2.5 text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {item.item}
            </Link>
          ))}
        </div>

        {/* User Info at Bottom */}
        <div className="mt-auto border-t border-gray-200 px-5 py-4 flex items-center justify-between">
          <div className="flex flex-col text-sm">
            <span className="font-semibold">{user?.email}</span>
            <span className="text-black/70">{user?.role}</span>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <LogOut size={18} className=""/>
          </button>
        </div>
      </div>
    </>
  )
}

export default Navbar