"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./AuthProvider";

type RequireAuthProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RequireAuth({ children, fallback }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || (!user && typeof window !== "undefined")) {
    return (
      fallback ?? (
        <div className="flex flex-1 items-center justify-center py-10 text-sm text-slate-500">
          Verificando permissão...
        </div>
      )
    );
  }

  return <>{children}</>;
}
