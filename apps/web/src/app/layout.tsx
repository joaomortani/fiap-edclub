import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppHeader } from "@/components/layout/AppHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EDClub",
  description: "Portal acadêmico com navegação básica entre áreas do aluno.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} text-slate-100 antialiased`}
      >
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
              {children}
            </main>
            <footer className="border-t border-slate-800 bg-slate-900/60 py-6 text-center text-sm text-slate-400">
              © {new Date().getFullYear()} EDClub. Todos os direitos reservados.
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
