import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import NewCityForm from "./citiesForm";

export const metadata: Metadata = {
  title: "Cadastrar cidade - Amplo Serviços",
  description: "Página para cadastro de cidade da amplo serviços",
};

export default async function City() {
  return (
    <main className="container mx-auto h-full w-11/12">
      <div className="flex items-center justify-between">
        <h1 className="mt-8 text-3xl font-bold">Nova Cidade</h1>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <NewCityForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
