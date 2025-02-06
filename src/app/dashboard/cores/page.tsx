import { api } from "@/api/fake";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { ThemedButton } from "@/components/ui/ThemedButton";

export default async function ChangeColors() {
  const data = await api.getEmployeeStartDates();
  return (
    <div className="flex flex-col">
      <ColorPicker />
      <ThemedButton isPrimary={true}>botao2</ThemedButton>
      <ThemedButton isPrimary={false}>botao2</ThemedButton>
    </div>
  );
}
