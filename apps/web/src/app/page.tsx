import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold">Bem-vindo ao EDClub</h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Navegue pelo portal para acompanhar o feed de novidades, organizar sua agenda e acessar a área do aluno. Utilize os
          componentes base para construir novas interfaces com rapidez.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/feed"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Ir para o feed
          </Link>
          <Link
            href="/login?mode=register"
            className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            Criar conta
          </Link>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Experimente os componentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Os campos abaixo demonstram o estilo base configurado para os elementos.</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                E-mail
              </label>
              <Input id="email" placeholder="nome@email.com" type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="senha">
                Senha
              </label>
              <Input id="senha" placeholder="••••••••" type="password" />
            </div>
          </div>
          <div>
            <Button>Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
