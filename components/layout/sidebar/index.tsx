"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { IoSettingsOutline } from "react-icons/io5";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Logout } from "@/lib/utils";
import { FaUserClock } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { LuFileText, LuLogOut } from "react-icons/lu";
import { MdOutlineSettingsInputSvideo } from "react-icons/md";

export default function SidebarComponent() {
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarContent>
        <SidebarMenu>
          {[
            {
              icon: LuFileText,
              title: "Cadastros",
              items: [
                { item: "Empresas", url: "/dashboard/empresas" },
                { item: "Funcionários", url: "/dashboard/funcionarios" },
                { item: "Departamentos", url: "/dashboard/departamentos" },
                { item: "Cargos", url: "/dashboard/cargos" },
              ],
            },
            {
              icon: MdOutlineSettingsInputSvideo,
              title: "Equipamentos",
              items: [],
            },
            {
              icon: FaUserClock,
              title: "Config. de Horários",
              items: [{ item: "Horários", url: "/dashboard/horarios" }],
            },
            {
              icon: FaUserClock,
              title: "Relatórios",
              items: [
                { item: "Empresa", url: "empresa" },
                { item: "Funcionário", url: "funcionario" },
                { item: "Departamento", url: "departamento" },
                { item: "Cargo", url: "cargo" },
              ],
            },
            {
              icon: IoSettingsOutline,
              title: "Configurações",
              items: [{ item: "Cores", url: "/dashboard/cores" }],
            },
          ].map((item) => (
            <SidebarMenuItem className="p-2" key={item.title}>
              <Collapsible className="group/collapsible">
                <CollapsibleTrigger asChild className="w-full">
                  <SidebarMenuButton>
                    {<item.icon />} {item.title}
                    <IoIosArrowForward className="ml-auto transition-transform group-data-[state=closed]/collapsible:rotate-0 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.item}>
                        <Link
                          href={item.url}
                          className={buttonVariants({ variant: "link" })}
                        >
                          {item.item}
                        </Link>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild>
          <Button onClick={Logout}>
            <LuLogOut className="text-destructive" />
            <span>Sair</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
