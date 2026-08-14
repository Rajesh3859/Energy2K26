"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getCurrentUserProfile } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // 2. Refresh ID token to get latest custom claims
      const idTokenResult = await userCredential.user.getIdTokenResult(true);
      let role = idTokenResult.claims.role as string | undefined;

      // 3. Fallback: Fetch profile from backend API if claim isn't cached yet
      if (!role) {
        try {
          const profile = await getCurrentUserProfile();
          role = profile?.data?.role || profile?.role;
        } catch (err) {
          console.warn("Backend profile fetch fallback in login", err);
        }
      }

      // 4. Role-based redirect with email fallback
      const lowerEmail = email.toLowerCase();
      const effectiveRole = role || (lowerEmail.includes("admin") ? "admin" : lowerEmail.includes("scorer") ? "scorer" : "scorer");

      if (effectiveRole === "admin" || lowerEmail.includes("admin")) {
        router.push("/admin");
        return;
      }

      if (effectiveRole === "scorer" || lowerEmail.includes("scorer")) {
        router.push("/scorer");
        return;
      }

      router.push("/live");
    } catch (err: any) {
      console.error("Login error:", err);
      let msg = "Invalid email or password. Please check your credentials.";

      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Invalid email address format.";
      } else if (err.message && !err.message.includes("fetch")) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3 text-2xl">
            ⚡
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Energy 2026 Sports Console
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access Scorer & Admin Control Center
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-950/50 border border-red-800/50 p-4 text-xs font-semibold text-red-300">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              placeholder="scorer@energy.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 p-3 text-sm font-bold text-white shadow-lg hover:brightness-110 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}