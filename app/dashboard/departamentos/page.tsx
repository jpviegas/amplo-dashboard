import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { DepartmentsList } from "./departmentsList";

export const metadata: Metadata = {
  title: "Departamentos - Amplo Serviços",
  description: "Página de departamentos amplo serviços",
};

export default async function DepartmentPage() {
  return (
    <ListarLayout title="Departamentos">
      <DepartmentsList />
    </ListarLayout>
  );
}
