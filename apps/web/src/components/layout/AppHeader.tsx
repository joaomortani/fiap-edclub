"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

const navigationLinks = [
  { href: "/", label: "Início" },
  { href: "/feed", label: "Feed" },
  { href: "/agenda", label: "Agenda" },
  { href: "/aluno", label: "Aluno" },
];

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.error("Erro ao encerrar sessão", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            EDClub
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end">
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-900 ${
                    isActive ? "bg-slate-100 text-slate-900" : ""
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            {user ? (
              <>
                <span className="truncate" title={user.email ?? undefined}>
                  {user.email ?? "Conta"}
                </span>
                <Button disabled={isSigningOut} onClick={handleSignOut}>
                  {isSigningOut ? "Saindo..." : "Sair"}
                </Button>
              </>
            ) : isLoading ? (
              <span>Carregando...</span>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
