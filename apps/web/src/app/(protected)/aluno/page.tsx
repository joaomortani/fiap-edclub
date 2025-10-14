import { BadgeList } from "@/components/badges/BadgeList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import WeeklyProgress from "@/components/engagement/WeeklyProgress";

export default function AlunoPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Área do Aluno</h1>
        <p className="text-slate-600">
          Acompanhe sua presença, conquistas e mantenha suas informações acadêmicas em dia.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Progresso semanal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <WeeklyProgress />
          <p className="text-slate-600">
            Mantenha a presença em dia para desbloquear novos badges e garantir sua participação nos projetos da turma.
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-slate-800">Conquistas</h2>
          <p className="text-sm text-slate-600">Badges conquistadas em atividades, desafios e participação.</p>
        </div>
        <BadgeList />
      </section>
    </section>
  );
}
