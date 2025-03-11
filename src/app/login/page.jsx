import LoginForm from "@/components/login-form"

export const metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-6 bg-background rounded-lg shadow-lg">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-muted-foreground">Enter your credentials to access the dashboard</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

