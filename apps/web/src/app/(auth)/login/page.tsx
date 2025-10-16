"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";

type AuthMode = "login" | "register";

const MIN_PASSWORD_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, signIn, signUp, error: authError } = useAuth();

  const [mode, setMode] = useState<AuthMode>(() =>
    searchParams?.get("mode") === "register" ? "register" : "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const paramMode = searchParams?.get("mode") === "register" ? "register" : "login";
    setMode(paramMode);
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/feed");
    }
  }, [user, isLoading, router]);

  const resetMessages = () => {
    setError(authError);
    setFeedback(null);
  };

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    resetMessages();
    router.replace(nextMode === "register" ? "/login?mode=register" : "/login", { scroll: false });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Informe um e-mail válido.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await signIn(trimmedEmail, password);
        setFeedback("Login realizado! Redirecionando...");
      } else {
        const result = await signUp(trimmedEmail, password);

        if (result.requiresConfirmation) {
          setFeedback(
            "Conta criada! Verifique seu e-mail para confirmar o cadastro antes de acessar.",
          );
        } else {
          setFeedback("Conta criada com sucesso! Redirecionando...");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir a operação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">
          {mode === "login" ? "Entrar no EDClub" : "Criar conta no EDClub"}
        </h1>
        <p className="text-sm text-slate-600">
          {mode === "login"
            ? "Informe suas credenciais para acessar as áreas restritas do portal."
            : "Crie sua conta para aproveitar todos os recursos do portal do aluno."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mode === "login" ? "Acesso" : "Cadastro"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-slate-600">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">
                E-mail institucional
              </label>
              <Input
                autoComplete="email"
                id="email"
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@email.com"
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">
                Senha
              </label>
              <Input
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                value={password}
              />
            </div>

            {mode === "register" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="confirm-password">
                  Confirmar senha
                </label>
                <Input
                  autoComplete="new-password"
                  id="confirm-password"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repita a senha"
                  type="password"
                  value={confirmPassword}
                />
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {feedback ? <p className="text-sm text-green-600">{feedback}</p> : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting
                ? mode === "login"
                  ? "Entrando..."
                  : "Criando conta..."
                : mode === "login"
                ? "Entrar"
                : "Criar conta"}
            </Button>
          </form>

          <p className="text-center text-sm">
            {mode === "login" ? "Ainda não possui acesso?" : "Já possui uma conta?"}{" "}
            <button
              className="font-medium text-blue-600 transition hover:text-blue-500"
              onClick={() => handleModeChange(mode === "login" ? "register" : "login")}
              type="button"
            >
              {mode === "login" ? "Crie uma conta" : "Faça login"}
            </button>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
