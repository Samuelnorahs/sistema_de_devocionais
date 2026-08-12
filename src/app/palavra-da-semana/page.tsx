import { redirect } from "next/navigation";
import { getCurrentWeekSermon } from "@/actions/sermon";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";

export default async function PalavraDaSemanaIndexPage() {
  const sermon = await getCurrentWeekSermon();

  if (sermon) {
    redirect(`/palavra-da-semana/${sermon.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-1 py-16 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-3xl font-bold text-navy-900 mb-4">
            Palavra da Semana
          </h1>
          <p className="text-navy-500">
            Nenhuma semana publicada ainda. Volte em breve!
          </p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
