import { AttendanceList } from "../../components/aluno/AttendanceList";

export default function AlunoPage() {
  return (
    <section className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Área do Aluno</h1>
        <p className="text-slate-600">
          Centralize suas informações acadêmicas e atualize seus dados pessoais.
        </p>
      </div>
      <AttendanceList />
    </section>
  );
}
