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
    <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="text-lg font-semibold text-white">
            EDClub
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:justify-end">
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-300">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-inner shadow-slate-900/40'
                      : 'hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            {user ? (
              <>
                <span className="truncate text-slate-200" title={user.email ?? undefined}>
                  {user.email ?? "Conta"}
                </span>
                <Button
                  className="bg-blue-500 hover:bg-blue-400"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                >
                  {isSigningOut ? "Saindo..." : "Sair"}
                </Button>
              </>
            ) : isLoading ? (
              <span>Carregando...</span>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800/70 hover:text-white"
                >
                  Entrar
                </Link>
                <Link
                  href="/login?mode=register"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-sky-400 hover:via-violet-400 hover:to-purple-400"
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
