import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";
import PointsList from "./pointsList";

export const metadata: Metadata = {
  title: "Pontos - Amplo Serviços",
  description: "Página de pontos da amplo serviços",
};

export default async function PointsPage() {
  return (
    <main className="container mx-auto flex h-full w-11/12 flex-col justify-evenly gap-8">
      <header className="flex items-center justify-between border-b pb-8">
        <h1 className="flex text-2xl font-semibold">Relatório de Pontos</h1>
        <div className="flex gap-2">
          <Button asChild className="gap-2">
            <Link href="/dashboard">
              <span>Voltar</span>
            </Link>
          </Button>
        </div>
      </header>
      <PointsList />
    </main>
  );
}
