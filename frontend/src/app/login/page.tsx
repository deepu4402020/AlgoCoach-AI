"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("algocoach_user_email", email);
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FAFAFB] dark:bg-[#0C0C10] p-4 text-[#0B0B0F] dark:text-[#F4F4F8]">
      <div className="w-full max-w-md space-y-6 rounded-[24px] bg-white dark:bg-[#171720] p-8 border border-[#ECECF1] dark:border-[#282835] shadow-[0_8px_30px_rgba(139,92,246,0.08)]">
        <div className="text-center space-y-2">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Sign in to AlgoCoach AI</h2>
          <p className="text-xs text-[#6B6B76] dark:text-[#A0A0AB]">
            Your AI DSA tutor & coding interview coach
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-[#6B6B76] dark:text-[#A0A0AB] mb-1 block">
                Email address
              </label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border-[#ECECF1] dark:border-[#2B2B38] bg-transparent"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#6B6B76] dark:text-[#A0A0AB] mb-1 block">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-[#ECECF1] dark:border-[#2B2B38] bg-transparent"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center font-medium">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[#0B0B0F] hover:bg-black/85 text-white dark:bg-[#F4F4F8] dark:hover:bg-white dark:text-[#0B0B0F] text-xs font-semibold tracking-wide transition-all shadow-xs disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center text-xs text-[#6B6B76] dark:text-[#A0A0AB]">
            Don't have an account?{" "}
            <a href="/signup" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
              Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
