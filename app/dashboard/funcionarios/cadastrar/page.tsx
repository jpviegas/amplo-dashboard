import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import NewEmployeeForm from "./employeeForm";

export const metadata: Metadata = {
  title: "Cadastrar funcionário - Amplo Serviços",
  description: "Página para cadastro de funcionário da amplo serviços",
};

export default async function NewEmployee() {
  return (
    <main className="container mx-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="mt-8 text-3xl font-bold">Novo Funcionário</h1>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <NewEmployeeForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
