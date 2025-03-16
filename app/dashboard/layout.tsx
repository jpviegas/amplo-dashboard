import HeaderComponent from "@/components/layout/header";
import NavLinks from "@/components/layout/navlinks";
import SidebarComponent from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";

export const metadata: Metadata = {
  title: "Dashboard - Amplo Serviços",
  description: "Página dashboard da amplo serviços",
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
          <div className="border-foreground/10 bg-background sticky top-0 z-10 border-b">
            <HeaderComponent />
            <NavLinks />
          </div>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
      </div>
    </SidebarProvider>
  );
}
