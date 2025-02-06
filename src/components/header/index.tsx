import { api } from "@/api/fake";
import Link from "next/link";
import { ModeToggle } from "../themeToggle";

export default async function HeaderComponent() {
  const data = await api.getCompanyInfo();
  return (
    <header className="flex h-14 items-center justify-between -bg--primary-color px-8 shadow-lg -shadow--primary-color backdrop-blur-sm">
      <Link href={"/"} className="size-12 rounded-full bg-white"></Link>
      <div className="flex items-center gap-8">
        <ModeToggle />
        <h1 className="text-black">{data.name}</h1>
      </div>
    </header>
  );
}
