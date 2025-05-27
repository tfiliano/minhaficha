"use client";

import { Forms } from "@/components/forms";
import { LojaProps } from "@/components/forms/Loja";
import { Title } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContentProps } from "@radix-ui/react-tabs";
import { PropsWithChildren } from "react";
import { UsuariosPage } from "./usuarios";

function TabContent({
  children,
  ...props
}: PropsWithChildren<TabsContentProps>) {
  return (
    <TabsContent className="border-muted border p-8 rounded-md my-4" {...props}>
      {children}
    </TabsContent>
  );
}

export function LojaUpdateClient({ loja }: LojaProps) {
  return (
    <div className="max-w-2xl w-full mx-auto px-4">
      <Title classNames="text-xl text-left font-bold p-0 m-0 dark:text-white text-black">
        {loja?.nome} - {loja?.codigo}
      </Title>
      <Tabs defaultValue="data">
        <TabsList className="w-full mt-4  py-8 px-2">
          <TabsTrigger className="w-full p-4" value="data">
            Dados
          </TabsTrigger>
          <TabsTrigger className="w-full p-4" value="users">
            Usuarios
          </TabsTrigger>
        </TabsList>
        <TabContent value="data">
          <Forms.Loja.Update loja={loja} />
        </TabContent>
        <TabContent value="users">
          <UsuariosPage usuarios={[...(loja?.usuarios || [])]} />
        </TabContent>
      </Tabs>
    </div>
  );
}
