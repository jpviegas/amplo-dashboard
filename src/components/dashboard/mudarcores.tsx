import { api } from "@/api/fake";
import { ColorPicker } from "../ui/ColorPicker";
import { ThemedButton } from "../ui/ThemedButton";

export const ChangeColors = async () => {
  const data = await api.getEmployeeStartDates();
  return (
    <>
      <ColorPicker />
      <ThemedButton isPrimary={true}>botao2</ThemedButton>
      <ThemedButton isPrimary={false}>botao2</ThemedButton>
    </>
  );
};
