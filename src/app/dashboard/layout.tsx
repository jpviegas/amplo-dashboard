import HeaderComponent from "@/components/header";
import SidebarComponent from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Amplo Serviços",
  description: "Deashboard amplo serviços",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-dvw">
        <SidebarComponent />
        <div className="flex flex-auto flex-col">
          <HeaderComponent />
          {children}
          <Toaster />
        </div>
      </div>
    </SidebarProvider>
  );
}
