import Image from "next/image"
import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-cyan-600 to-blue-700 p-12 text-white">
        <div className="max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative h-12 w-12">
                <Image
                  src="/assets/dhalogo.png"
                  alt="DHA Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="relative h-12 w-12">
                <Image
                  src="/assets/dhasrviceslogo.jpg"
                  alt="DHA Services Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold">HydraTank</h1>
          </div>
          <h2 className="text-2xl font-semibold">Water Supply Management System</h2>
          <p className="text-cyan-100">
            Manage your water supply infrastructure efficiently with our comprehensive dashboard. Monitor water levels,
            track distribution, and ensure quality service delivery.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-medium text-lg">Real-time Monitoring</h3>
              <p className="text-cyan-100 text-sm mt-1">Track water levels and distribution in real-time</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-medium text-lg">Quality Control</h3>
              <p className="text-cyan-100 text-sm mt-1">Ensure water quality meets all standards</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-medium text-lg">Supply Management</h3>
              <p className="text-cyan-100 text-sm mt-1">Optimize distribution across your network</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-medium text-lg">Analytics</h3>
              <p className="text-cyan-100 text-sm mt-1">Data-driven insights for better decisions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <div className="relative h-10 w-10">
                <Image
                  src="/assets/water.png"
                  alt="HydraTank Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-cyan-700">HydraTank</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-gray-500 mt-2">Login to manage your water supply system</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100">
            <LoginForm />
          </div>
          <div className="text-center text-sm text-gray-500">
            <p>© 2025 HydraTank Water Supply Management. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
