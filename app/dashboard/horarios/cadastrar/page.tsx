import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import RegisterHourForm from "./registerHourForm";

export const metadata: Metadata = {
  title: "Cadastrar horário - Amplo Serviços",
  description: "Página para cadastro de horário da amplo serviços",
};

export default async function NewHour() {
  return (
    <main className="container mx-auto h-full w-11/12">
      <div className="mb-8 flex items-center justify-between pt-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/horarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Novo Horário</h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <RegisterHourForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
