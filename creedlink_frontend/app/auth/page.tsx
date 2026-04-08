"use client";

import { ArrowLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSignup && password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      if (isSignup) {
        const data = await apiFetch("/api/auth/signup", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });
        console.log("Signup response: ", data);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/profile-setup");
      } else {
        const data = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
          }),
        });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.profileCompleted) {
          router.push("/");
        } else {
          router.push("/profile-setup");
        }
      }
    } catch (err) {
      console.log(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="absolute top-8 left-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>

      {/* Center Container */}
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-md space-y-6 text-center">
          {/* Logo */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl border border-white/15 bg-white/5 shadow-inner">
            <Image
              src="/assets/feather_quill.svg"
              alt="CreedLink Logo"
              width={60}
              height={60}
            />
          </div>

          <h1 className="text-3xl font-bold text-white">CreedLink</h1>
          <p className="text-slate-400">Digital Consent & Agreement Portal</p>

          {/* Card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="mb-6 text-left text-xl font-medium text-white">
              {isSignup === true ? "Create Account" : "Welcome Back"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-left">
                <label className="text-sm text-slate-400">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  required
                />
              </div>

              <div className="text-left">
                <label className="text-sm text-slate-400">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  required
                />
              </div>

              {isSignup && (
                <div className="text-left">
                  <label className="text-sm text-slate-400">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-xl bg-linear-to-r from-blue-500 to-indigo-700 py-2 font-medium text-white shadow-lg transition-colors duration-300 hover:from-blue-600 hover:to-indigo-800 hover:brightness-110 active:scale-95"
              >
                {loading
                  ? "Loading..."
                  : isSignup
                    ? "Create Account"
                    : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {isSignup === true
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="h-3.5 w-3.5" />
                <span>Secure JWT Authentication</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
