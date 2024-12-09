"use client";

import { Forms } from "@/components/forms";
import { LojaProps } from "@/components/forms/Lojas";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./user-management";

export function LojasUpdateClient({ ...props }: LojaProps) {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Loja</h1>
      <Tabs defaultValue="store-info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="store-info">Informações da Loja</TabsTrigger>
          <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="store-info">
          <Forms.Lojas.Update {...props} />
        </TabsContent>
        <TabsContent value="users">
          <UserManagement {...props} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
