import { GetCompanyEmployeeById } from "@/api/dashboard/funcionarios/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import EmployeeForm from "../cadastrar/employeeForm";

export const metadata: Metadata = {
  title: "Detalhes do Funcionário - Amplo Serviços",
  description: "Página de detalhes do funcionário",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EmployeePage(props: Props) {
  const params = await props.params;
  const { id } = params;

  const data = await GetCompanyEmployeeById(id);

  if (!data.success || !data.employee) {
    return (
      <main className="container mx-auto flex h-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Funcionário não encontrado</h1>
        <Button asChild>
          <Link href="/dashboard/funcionarios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para lista
          </Link>
        </Button>
      </main>
    );
  }

  const { employee } = data;

  return (
    <main className="container mx-auto h-full w-11/12 pt-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/funcionarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Atualizar Funcionário</h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <EmployeeForm initialData={employee} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
