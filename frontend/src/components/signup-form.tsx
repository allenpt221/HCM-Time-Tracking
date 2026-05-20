import { Eye, EyeOff, Clock, CheckCircle, X } from "lucide-react"
import { cn, TIMEZONES } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { authStore } from "@/Stores/authStore"
import { Link, useNavigate } from "react-router-dom"
import bgLogo from '../assets/bg.jpg'

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timezone, setTimezone] = useState('Asia/Manila');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const { SignUp, loading, error, clearError } = authStore()

  useEffect(() => {
    if (error) {
      setVisible(true);
      setFadingOut(false);

      const fadeTimer = setTimeout(() => setFadingOut(true), 3000);
      const clearTimer = setTimeout(() => {
        clearError();
        setVisible(false);
        setFadingOut(false);
      }, 3300);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [error]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 4000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await SignUp({ name, email, password, startTime, endTime, timezone });
    if (result.success) {
      setShowSuccess(true);
      setEmail('');
      setPassword('');
      setStartTime('');
      setEndTime('')
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>

      {/* Success Toast */}
      {showSuccess && (
        <div className="flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">Account created successfully! Redirecting to sign in…</span>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-green-600 hover:text-green-800 ml-1"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>

              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h1 className="text-2xl font-bold">Create an account</h1>
                <p className="text-sm text-muted-foreground">
                  Sign up for mini HCM Time Tracking
                </p>
              </div>

              {/* Error Message */}
              {visible && (
                <div
                  className={cn(
                    "flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 transition-opacity duration-300",
                    fadingOut ? "opacity-0" : "opacity-100"
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Full Name */}
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError() }}
                  placeholder="Juan dela Cruz"
                  className="h-10"
                  required
                />
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError() }}
                  placeholder="m@example.com"
                  className="h-10"
                  required
                />
              </Field>

              {/* Password */}
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    onChange={(e) => { setPassword(e.target.value); clearError() }}
                    className="h-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>

              {/* Work Schedule */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Clock size={14} className="text-muted-foreground" />
                  <span>Work Schedule</span>
                </div>

                {/* Start & End Time */}
                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="startTime" className="text-xs text-muted-foreground">
                      Start Time
                    </FieldLabel>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => { setStartTime(e.target.value); clearError() }}
                      className="h-10"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="endTime" className="text-xs text-muted-foreground">
                      End Time
                    </FieldLabel>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => { setEndTime(e.target.value); clearError() }}
                      className="h-10"
                      required
                    />
                  </Field>
                </div>

                {/* Timezone */}
                <Field>
                  <FieldLabel htmlFor="timezone" className="text-xs text-muted-foreground">
                    Timezone
                  </FieldLabel>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => { setTimezone(e.target.value); clearError() }}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    required
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  className="w-full h-10 cursor-pointer"
                  disabled={loading}
                >
                  {loading
                    ? <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Creating account...
                      </span>
                    : "Sign Up"
                  }
                </Button>
              </Field>

              <FieldDescription className="text-center text-xs">
                Already have an account?{" "}
                <Link to="/" className="underline underline-offset-2 hover:text-primary">Sign In</Link>
              </FieldDescription>

            </FieldGroup>
          </form>

          {/* Right Side - Image */}
          <div className="relative hidden md:block">
            <img
              src={bgLogo}
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>

        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-2 hover:text-primary">Terms of Service</a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2 hover:text-primary">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}