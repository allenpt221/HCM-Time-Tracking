import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { authStore } from "@/Stores/authStore"
import { useNavigate } from "react-router-dom"
import bgLogo from '../assets/bg.jpg'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { LogIn, loading, error, clearError } = authStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await LogIn({ email, password });
    if (result.success) {
      navigate('/dashboard');
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2 ">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>

              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center mb-2">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                  Login to your mini HCM Time Tracking
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

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
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a href="#" className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => { setPassword(e.target.value); clearError() }}
                  className="h-10"
                  required
                />
              </Field>

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
                        Signing in...
                      </span>
                    : "Sign In"
                  }
                </Button>
              </Field>

              <FieldDescription className="text-center text-xs">
                Don&apos;t have an account?{" "}
                <a href="#" className="underline underline-offset-2 hover:text-primary">Sign up</a>
              </FieldDescription>

            </FieldGroup>
          </form>

          {/* Right Side - Image */}
          <div className="relative hidden md:block ">
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