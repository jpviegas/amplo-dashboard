import ListarLayout from "@/components/layout/listar";
import { HoursList } from "./hoursList";

export default async function ShiftPage() {
  return (
    <ListarLayout title="Horários">
      <HoursList />
    </ListarLayout>
  );
}
