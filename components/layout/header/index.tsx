"use client";

import { ModeToggle } from "@/components/themeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";
import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function HeaderComponent() {
  const { user } = useUser();

  return (
    <header className="flex h-16 items-center justify-between px-8">
      <Link href={"/dashboard"} className="size-12">
        <Image src={logo} alt="icon logo" />
      </Link>

      <div className="flex items-center gap-8">
        <SidebarTrigger className="border-input hover:bg-accent hover:text-accent-foreground size-9 border shadow-sm" />

        <ModeToggle />

        <h1>{user?.name}</h1>
      </div>
    </header>
  );
}
