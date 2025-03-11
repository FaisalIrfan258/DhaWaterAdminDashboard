"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("admin");

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const endpoint =
        credentials.type === "superadmin"
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/superadmin/login`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/login`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        credentials: "include", // To handle cookies
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      login({
        fullname: data.fullname,
        email: data.email,
        isSuper: data.is_super,
      });
      toast.success("Login successful", {
        description: `Welcome back, ${data.fullname}`,
      });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error("Login failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password, type: userType });
  };

  return (
    <Tabs defaultValue="admin" onValueChange={setUserType}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="admin">Admin</TabsTrigger>
        <TabsTrigger value="superadmin">Super Admin</TabsTrigger>
      </TabsList>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </Button>
      </form>
    </Tabs>
  );
}
