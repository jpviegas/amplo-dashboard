import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { FaUserClock } from "react-icons/fa6";
import { LuFileText } from "react-icons/lu";

import { IoIosArrowForward } from "react-icons/io";
import { MdOutlineSettingsInputSvideo } from "react-icons/md";
import { Button } from "../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

export default async function SidebarComponent() {
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
              url: "dashboard/cadastros",
            },
            {
              icon: MdOutlineSettingsInputSvideo,
              title: "Equipamentos",
              items: [
                { item: "Empresa", url: "empresa" },
                { item: "Funcionário", url: "funcionario" },
                { item: "Departamento", url: "departamento" },
                { item: "Cargo", url: "cargo" },
              ],
              url: "dashboard/equipamentos",
            },
            {
              icon: FaUserClock,
              title: "Config de Horários",
              items: [
                { item: "Empresa", url: "empresa" },
                { item: "Funcionário", url: "funcionario" },
                { item: "Departamento", url: "departamento" },
                { item: "Cargo", url: "cargo" },
              ],
              url: "dashboard/horarios",
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
              url: "dashboard/relatorios",
            },
            {
              icon: MdOutlineSettingsInputSvideo,
              title: "Cores",
              items: [
                { item: "Empresa", url: "empresa" },
                { item: "Funcionário", url: "funcionario" },
                { item: "Departamento", url: "departamento" },
                { item: "Cargo", url: "cargo" },
              ],
              url: "dashboard/cores",
            },
          ].map((item) => (
            <SidebarMenuItem className="p-2" key={item.url}>
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
                        <Button variant="link">
                          <Link href={item.url}>{item.item}</Link>
                        </Button>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
