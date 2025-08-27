import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { StoreSelector } from "@/components/store-selector";
import { Lightbulb } from "lucide-react";
import Link from "next/link";

const menu = [
  {
    title: "Produtos",
    route: "produtos",
  },
  {
    title: "Etiquetas",
    route: "etiquetas",
  },
  {
    title: "Grupos",
    route: "grupos",
  },
  {
    title: "Armazenamento",
    route: "armazenamentos",
  },
  {
    title: "Operadores",
    route: "operadores",
  },
  {
    title: "Fabricantes",
    route: "fabricantes",
  },
  {
    title: "Impressoras",
    route: "impressoras",
  },
  {
    title: "Configuraçõe da Loja",
    route: "configuracoes",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-4  justify-center">
          <div className="p-2 bg-primary rounded-xl ">
            <Lightbulb className="text-sm rotate-45 text-white" />
          </div>
          <h1 className="font-bold flex flex-col">
            DESCOMPLICA <small className="font-normal text-xs">Admin</small>
          </h1>
        </div>
        <div className="mt-4 px-2">
          <StoreSelector />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={`/admin/${item.route}`}>
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
