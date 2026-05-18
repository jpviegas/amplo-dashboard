"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { useUser } from "@/context/UserContext";
import { Logout } from "@/lib/utils";
import Link from "next/link";
import { FaUserClock } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { IoSettingsOutline } from "react-icons/io5";
import { LuFileText, LuLogOut } from "react-icons/lu";
import { MdOutlineSettingsInputSvideo } from "react-icons/md";

export default function SidebarComponent() {
  const { user } = useUser();
  const isAdmin = user?.role === "admin";

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
                { item: "Cidades", url: "/dashboard/cidades" },
                { item: "Documentos", url: "/dashboard/documentos" },
                { item: "Departamentos", url: "/dashboard/departamentos" },
                { item: "Cargos", url: "/dashboard/cargos" },
                { item: "Treinamentos", url: "/dashboard/treinamentos" },
                { item: "E.P.I.", url: "/dashboard/epi" },
                { item: "Feriados", url: "/dashboard/feriados" },
              ],
            },
            {
              icon: MdOutlineSettingsInputSvideo,
              title: "Gestão de Funcionário",
              items: [
                {
                  item: "Atribuir ponto",
                  url: "/dashboard/gestao/ponto",
                },
                // {
                //   item: "Documentos",
                //   url: "/dashboard/gestao/documentos",
                // },
                {
                  item: "Uniforme/EPI",
                  url: "/dashboard/gestao/epi",
                },
                // {
                //   item: "Pagamento/Benefício",
                //   url: "/dashboard/gestao/pagamento",
                // },
              ],
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
                // { item: "Empresa", url: "empresa" },
                { item: "Folha de Pontos", url: "/dashboard/pontos" },
                // { item: "Departamento", url: "departamento" },
                // { item: "Cargo", url: "cargo" },
                // { item: "Cidade", url: "cidade" },
              ],
            },
            ...(isAdmin
              ? [
                  {
                    icon: IoSettingsOutline,
                    title: "Configurações",
                    items: [
                      {
                        item: "Atribuir Autorização",
                        url: "/dashboard/autorizacao",
                      },
                    ],
                  },
                ]
              : []),
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
          <Button onClick={Logout} variant="outline">
            <LuLogOut className="text-destructive" />
            <span>Sair</span>
          </Button>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
