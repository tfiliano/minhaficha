"use client";

import { Forms } from "@/components/forms";
import { LojaProps } from "@/components/forms/Lojas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Usuario } from "@/models/Usuario";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export function UserManagement({ loja }: LojaProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addUser = () => {};

  const removeUser = (id: string) => {};

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">Usuários da Loja</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            </DialogHeader>
            <Forms.Usuarios.Create />
          </DialogContent>
        </Dialog>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Nome</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loja.loja_usuarios
              .map(({ usuario }: any) => new Usuario(usuario))
              .map((usuario: Usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell className="font-medium">{usuario.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {usuario.email}
                  </TableCell>
                  <TableCell>{usuario.type}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      onClick={() => removeUser(usuario.id)}
                    >
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
