"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { getCurrentUserProfile } from "@/services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          router.replace("/login");
          return;
        }

        // 1. Try to read custom claims role directly from Firebase token
        const idTokenResult = await user.getIdTokenResult();
        let role = idTokenResult.claims.role as string | undefined;

        // 2. If claim is missing, fetch user profile from API with fallback
        if (!role) {
          try {
            const profile = await getCurrentUserProfile();
            role = profile?.data?.role || profile?.role;
          } catch (err) {
            console.warn("User profile fetch fallback in ProtectedRoute", err);
          }
        }

        const effectiveRole = role || "scorer";

        // Allow access if role matches allowedRoles or if default scorer/admin fallback
        if (allowedRoles.length > 0 && !allowedRoles.includes(effectiveRole) && !allowedRoles.includes("user")) {
          // If allowed roles explicitly requires admin but role is not admin, redirect
          if (allowedRoles.includes("admin") && effectiveRole !== "admin") {
            router.replace("/login");
            return;
          }
        }

        setAuthorized(true);
      } catch (error) {
        console.error("ProtectedRoute auth error:", error);
        setAuthorized(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, allowedRoles.join(",")]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-400 animate-pulse">
          Checking authentication credentials...
        </p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}