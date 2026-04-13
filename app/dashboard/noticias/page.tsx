import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { NoticesList } from "./noticesList";

export const metadata: Metadata = {
  title: "Notícias - Amplo Serviços",
  description: "Página de notícias da amplo serviços",
};

export default async function NoticesPage() {
  return (
    <ListarLayout title="Notícias">
      <NoticesList />
    </ListarLayout>
  );
}
