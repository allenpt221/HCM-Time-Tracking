import { Route, Routes, Navigate, useLocation } from "react-router-dom"
import { useEffect } from "react"

import Loginpage from "./pages/LoginPage"
import Dashboard from "./pages/Dashboard"
import Navbar from "./components/Navbar"
import { authStore } from "./Stores/authStore"
import SignupPage from "./pages/SignupPage"
import { attendanceStore } from "./Stores/attendanceStore"
import AdminPage from "./pages/AdminPage"

function App() {
  const { checkAuth, checkingAuth, user } = authStore()
  const { fetchAttendance, AdminAttendance } = attendanceStore();
  const location = useLocation()

useEffect(() => {
  checkAuth();
}, [])

useEffect(() => {
  if (!user) return

  if (user.role === 'admin') {
    AdminAttendance()
  } else {
    fetchAttendance()
  }
}, [user])


  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Show navbar only on dashboard
  const showNavbar = location.pathname === "/dashboard" || location.pathname === "/admin";

  return (
    <div>
      {showNavbar && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={!user ? <Loginpage /> : <Navigate to="/dashboard" />}
        />
                <Route
          path="/signup"
          element={!user ? <SignupPage /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminPage /> : <Navigate to="/" />}
        />
      </Routes>
    </div>
  )
}

export default App