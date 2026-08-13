"use client";

import { FormEvent, useState } from "react";
import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useRouter } from "next/navigation";

import { auth } from "@/lib/firebase";
import {
  getCurrentUserProfile,
} from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      // 1. Login with Firebase
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 2. Get user's role/profile from backend
      const profile =
        await getCurrentUserProfile();

      console.log("User profile:", profile);

      // 5. Redirect based on role
      const role =
        profile.data?.role ||
        profile.role;

      if (role === "admin") {
        router.push("/admin");
        return;
      }

      if (role === "scorer") {
        router.push("/scorer");
        return;
      }

      router.push("/live");

    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        <h1 className="text-2xl font-bold">
          Sports Platform
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Sign in to continue
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-lg border p-3"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-lg border p-3"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 font-medium text-white disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}