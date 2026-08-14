"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getCurrentUserProfile } from "@/services/auth.service";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileName, setProfileName] = useState<string>("Administrator");
  const [role, setRole] = useState<string>("admin");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setProfileName(user.displayName || user.email?.split("@")[0] || "Administrator");
        try {
          const idTokenResult = await user.getIdTokenResult();
          const userRole = (idTokenResult.claims.role as string) || "admin";
          setRole(userRole);

          const profileRes = await getCurrentUserProfile();
          const pName = profileRes?.data?.displayName || profileRes?.data?.name || profileRes?.name;
          if (pName) setProfileName(pName);
        } catch (e) {
          // Graceful fallback
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/users", label: "Users", icon: "👥" },
    { href: "/admin/teams", label: "Teams", icon: "🏆" },
    { href: "/admin/matches", label: "Matches", icon: "⚡" },
    { href: "/admin/sports", label: "Sports", icon: "⚽" },
  ];

  async function handleLogout() {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error", err);
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
    : "AD";

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 border-r border-slate-200 bg-white md:block">
            <div className="p-6 border-b border-slate-100">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Sports Platform
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-cyan-600">
                Admin Panel
              </p>
            </div>

            <nav className="p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                <Link
                  href="/live"
                  className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
                >
                  <span>View Live Scores</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <span>Logout</span>
                  <span>🚪</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header / Mobile Nav Toggle */}
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                  aria-label="Toggle navigation"
                >
                  {mobileMenuOpen ? "✕" : "☰"}
                </button>

                <h2 className="text-base sm:text-lg font-bold text-slate-800">
                  Admin Dashboard
                </h2>
              </div>

              {/* Top Right Profile & Role Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-xs">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-600 text-xs font-black text-white uppercase shadow-sm">
                    {initials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight">{profileName}</span>
                    <span className="text-[10px] font-extrabold uppercase text-cyan-600 leading-none">
                      {role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm flex items-center gap-1"
                >
                  <span>Logout</span>
                  <span>🚪</span>
                </button>
              </div>
            </header>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-b border-slate-200 bg-white p-4 space-y-2 shadow-lg z-20">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}

                <Link
                  href="/live"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-700 mt-2"
                >
                  <span>View Live Scores</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 mt-2"
                >
                  <span>Logout</span>
                  <span>🚪</span>
                </button>
              </div>
            )}

            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}