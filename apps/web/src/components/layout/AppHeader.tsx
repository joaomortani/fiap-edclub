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
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 transition-colors hover:bg-slate-100 hover:text-slate-900 ${
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
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Entrar
                </Link>
                <Link
                  href="/login?mode=register"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-sky-400 hover:via-violet-400 hover:to-purple-400"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
