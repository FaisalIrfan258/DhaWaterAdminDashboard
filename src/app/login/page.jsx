import LoginForm from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Login to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}

