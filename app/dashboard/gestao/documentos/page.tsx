import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { ManagementEPIList } from "./epiList";

export const metadata: Metadata = {
  title: "E.P.I. - Amplo Serviços",
  description: "Página de E.P.I. da amplo serviços",
};

export default async function EPIPage() {
  return (
    <ListarLayout title="Gestão: Uniforme/EPI">
      <ManagementEPIList />
    </ListarLayout>
  );
}
