"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Lock, Mail, ShieldAlert, ShieldCheck } from "lucide-react"
import Cookies from "js-cookie"
import { useUser } from "@/context/UserContext"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState("admin") // "admin" or "superAdmin"
  const [errors, setErrors] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { setUser } = useUser()

  const validateForm = () => {
    let valid = true
    const newErrors = { email: "", password: "" }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
      valid = false
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required"
      valid = false
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      valid = false
    }

    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const endpoint =
        loginType === "superAdmin"
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/superadmin/login`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/login`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()

        // Store admin token and admin ID in cookies
        Cookies.set("admin_token", data.admin_token, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        })
        Cookies.set("admin_id", data.admin_id, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        })
        Cookies.set("admin_name", data.full_name, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        })
        Cookies.set("admin_email", data.email, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        })
        Cookies.set("is_super", data.is_super, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        })

        // Store user type in cookie
        Cookies.set("user_type", loginType, {
          path: "/",
          secure: true,
          sameSite: "Strict",
        })

        // Set user data in context
        setUser(data)

        // Redirect to dashboard
        window.location.href = "/dashboard"
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Login failed with status: ${response.status}`)
      }
    } catch (error) {
      console.error("Login failed:", error)
      setLoginError(error.message || "Failed to login. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="admin" value={loginType} onValueChange={setLoginType} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin</span>
          </TabsTrigger>
          <TabsTrigger value="superAdmin" className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Super Admin</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="admin" className="mt-4">
          <p className="text-sm text-gray-500 mb-4">
            Sign in as an administrator to manage your assigned water supply facilities.
          </p>
        </TabsContent>
        <TabsContent value="superAdmin" className="mt-4">
          <p className="text-sm text-gray-500 mb-4">
            Sign in as a super administrator to access all system controls and management features.
          </p>
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="email"
              placeholder="your.email@hydratank.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`pl-10 ${
                errors.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-cyan-500"
              }`}
            />
          </div>
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="password"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`pl-10 ${
                errors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-cyan-500"
              }`}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
              <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
            </Button>
          </div>
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <a href="#" className="font-medium text-cyan-600 hover:text-cyan-500">
            Forgot your password?
          </a>
        </div>
      </div>

      {loginError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{loginError}</div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all duration-300"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : `Sign in as ${loginType === "admin" ? "Admin" : "Super Admin"}`}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Need help?</span>
        </div>
      </div>

      <div className="text-center text-sm">
        <p className="text-gray-600">
          Contact system administrator or call our support at
          <a href="tel:+1234567890" className="font-medium text-cyan-600 hover:text-cyan-500 ml-1">
            (123) 456-7890
          </a>
        </p>
      </div>
    </form>
  )
}
