import { Route, Routes, Navigate, useLocation } from "react-router-dom"
import { useEffect } from "react"

import Loginpage from "./pages/LoginPage"
import Dashboard from "./pages/Dashboard"
import Navbar from "./components/Navbar"
import { authStore } from "./Stores/authStore"
import SignupPage from "./pages/SignupPage"

function App() {
  const { checkAuth, checkingAuth, user } = authStore()
  const location = useLocation()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Show navbar only on dashboard
  const showNavbar = location.pathname === "/dashboard"

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
      </Routes>
    </div>
  )
}

export default App