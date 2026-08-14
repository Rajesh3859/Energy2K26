"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import Link from "next/link";
import { getCurrentUserProfile } from "@/services/auth.service";

export function Navbar() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setProfileName(user.displayName || user.email?.split("@")[0] || "User");
        try {
          const idTokenResult = await user.getIdTokenResult();
          const userRole = (idTokenResult.claims.role as string) || (user.email?.toLowerCase().includes("admin") ? "admin" : "scorer");
          setRole(userRole);

          const profileRes = await getCurrentUserProfile();
          const pName = profileRes?.data?.displayName || profileRes?.data?.name || profileRes?.name;
          if (pName) setProfileName(pName);
        } catch (e) {
          // Graceful fallback
        }
      } else {
        setProfileName("");
        setRole("");
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
      window.location.href = "/";
    }
  }

  const initials = profileName
    ? profileName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <nav className="border-b border-slate-800 p-4 flex justify-between items-center bg-gray-900 text-white">
      <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
        <span className="text-cyan-400">⚡</span> Energy 2026
      </Link>
      <div className="flex gap-4 items-center">
        <Link href="/live" className="hover:underline text-sm font-medium">
          Live Scores
        </Link>
        <Link href="/scorer" className="hover:underline text-sm font-medium">
          Scorer Console
        </Link>
        <Link href="/admin" className="hover:underline text-sm font-medium">
          Admin
        </Link>

        {currentUser ? (
          <div className="flex items-center gap-3 border-l border-slate-800 pl-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 font-black text-xs text-slate-950 uppercase shadow">
                {initials}
              </div>
              <div className="flex flex-col text-left text-xs">
                <span className="font-bold text-white leading-none">{profileName}</span>
                <span className="text-[10px] text-cyan-400 font-semibold uppercase leading-tight mt-0.5">
                  {role || "User"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
