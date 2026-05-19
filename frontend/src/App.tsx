import { Route, Routes, Navigate } from "react-router-dom"
import Loginpage from "./pages/LoginPage"
import Dashboard from "./pages/Dashboard"
import { authStore } from "./Stores/authStore"
import { useEffect } from "react";

function App() {
  const { checkAuth, checkingAuth, user } = authStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth])

  // Show loading spinner while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <Routes>
        {/* If not logged in, show login. If logged in, redirect to dashboard */}
        <Route path="/" element={!user ? <Loginpage /> : <Navigate to="/dashboard" />} />
        
        {/* If logged in, show dashboard. If not, redirect to login */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App