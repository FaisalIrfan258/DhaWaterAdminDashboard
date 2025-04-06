"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Cookies from "js-cookie"
import { useUser } from '@/context/UserContext'

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState("admin") // "admin" or "superAdmin"
  const [errors, setErrors] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
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
        Cookies.set("admin_token", data.admin_token, { path: '/', secure: true, sameSite: 'Strict' })
        Cookies.set("admin_id", data.admin_id, { path: '/', secure: true, sameSite: 'Strict' })
        
        // Store user type in cookie
        Cookies.set("user_type", loginType, { path: '/', secure: true, sameSite: 'Strict' })

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={loginType === "admin" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setLoginType("admin")}
          >
            Sign in as Admin
          </Button>
          <Button
            type="button"
            variant={loginType === "superAdmin" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setLoginType("superAdmin")}
          >
            Sign in as Super Admin
          </Button>
        </div>

        <div className="space-y-2">
          <Input
            id="email"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Input
            id="password"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>
      </div>

      {loginError && <p className="text-sm text-red-500 mt-2">{loginError}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}

