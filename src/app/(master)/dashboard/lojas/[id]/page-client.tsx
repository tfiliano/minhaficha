"use client";

import { Forms } from "@/components/forms";
import { LojaProps } from "@/components/forms/Loja";
import { Title } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContentProps } from "@radix-ui/react-tabs";
import { PropsWithChildren, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { UsuariosPage } from "./usuarios";
import { AssignUserToStore } from "./assign-user";

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
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserAssigned = () => {
    // Refresh the page to show the new user
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-4">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/lojas">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar às Lojas
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Title classNames="text-xl text-left font-bold p-0 m-0 dark:text-white text-black">
          {loja?.nome} - {loja?.codigo}
        </Title>
        <Badge variant="outline">
          {loja?.usuarios?.length || 0} usuários
        </Badge>
      </div>
      
      <Tabs defaultValue="data">
        <TabsList className="w-full mt-4 py-8 px-2">
          <TabsTrigger className="w-full p-4" value="data">
            Dados da Loja
          </TabsTrigger>
          <TabsTrigger className="w-full p-4" value="users">
            Gerenciar Usuários
          </TabsTrigger>
        </TabsList>
        
        <TabContent value="data">
          <Forms.Loja.Update loja={loja} />
        </TabContent>
        
        <TabContent value="users">
          <div className="space-y-6">
            {loja && (
              <AssignUserToStore 
                lojaId={loja.id} 
                lojaNome={loja.nome || loja.codigo || 'Loja sem nome'}
                onUserAssigned={handleUserAssigned}
              />
            )}
            <UsuariosPage usuarios={[...(loja?.usuarios || [])]} />
          </div>
        </TabContent>
      </Tabs>
    </div>
  );
}
