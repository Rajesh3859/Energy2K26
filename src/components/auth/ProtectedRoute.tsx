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
    const unsubscribe =
      onAuthStateChanged(auth, async (user) => {
        try {
          if (!user) {
            router.replace("/login");
            return;
          }

          const profile =
            await getCurrentUserProfile();

          const role =
            profile.data?.role ||
            profile.role;

          if (!allowedRoles.includes(role)) {
            router.replace("/login");
            return;
          }

          setAuthorized(true);
        } catch (error) {
          console.error(error);

          router.replace("/login");
        } finally {
          setLoading(false);
        }
      });

    return () => unsubscribe();
  }, [router, allowedRoles.join(",")]);

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-slate-500">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}