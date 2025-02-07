import { api } from "@/api/fake";
import Link from "next/link";
import { ModeToggle } from "../themeToggle";
import { SidebarTrigger } from "../ui/sidebar";

export default async function HeaderComponent() {
  const data = await api.getCompanyInfo();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-background px-8 shadow-lg shadow-sidebar-border">
      <Link href={"/"} className="size-12 rounded-full bg-white">
        icone
      </Link>
      <div className="flex items-center gap-8">
        <SidebarTrigger className="size-9 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground" />
        <ModeToggle />
        <h1>{data.name}</h1>
      </div>
    </header>
  );
}
