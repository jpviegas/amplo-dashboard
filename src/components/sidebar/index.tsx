import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { api } from "@/api/fake";
import Link from "next/link";
import { FaUserClock } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { MdOutlineSettingsInputSvideo } from "react-icons/md";

export default async function SidebarComponent() {
  const data = await api.getCompanyInfo();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="flex gap-8">
          <SidebarGroupLabel>{data.name}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <ul className="flex flex-col gap-4">
                {[
                  {
                    icon: MdOutlineSettingsInputSvideo,
                    icon2: IoIosArrowForward,
                    title: "Cadastros",
                    url: "dashboard/cadastros",
                  },
                  {
                    icon: MdOutlineSettingsInputSvideo,
                    icon2: IoIosArrowForward,
                    title: "Equipamentos",
                    url: "dashboard/equipamentos",
                  },
                  {
                    icon: FaUserClock,
                    icon2: IoIosArrowForward,
                    title: "Config de Horários",
                    url: "dashboard/horarios",
                  },
                  {
                    icon: FaUserClock,
                    icon2: IoIosArrowForward,
                    title: "Relatórios",
                    url: "dashboard/relatorios",
                  },
                  {
                    icon: MdOutlineSettingsInputSvideo,
                    icon2: IoIosArrowForward,
                    title: "Cores",
                    url: "dashboard/cores",
                  },
                ].map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className="flex w-full items-center gap-4"
                      >
                        <item.icon />
                        <span>{item.title}</span>
                        <item.icon2 className="ml-auto" />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </ul>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
