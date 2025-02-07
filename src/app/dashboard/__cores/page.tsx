import { ColorPicker } from "@/components/ui/ColorPicker";
import { ThemedButton } from "@/components/ui/ThemedButton";

export default async function ChangeColors() {
  return (
    <div className="flex flex-col">
      <ColorPicker />
      <ThemedButton isPrimary={true}>botao2</ThemedButton>
      <ThemedButton isPrimary={false}>botao2</ThemedButton>
    </div>
  );
}
