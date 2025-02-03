"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { ButtonAdd } from "../../button-new";

type Usuario = Tables<`usuarios`>;

export function UsuariosPage({
  usuarios: users,
}: PropsWithChildren<{ usuarios: { data: Usuario }[] | null }>) {
  const usuarios = users?.map((user) => user.data);

  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const usuariosFiltrados = (usuarios || []).filter((usuario) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(usuario.name!).includes(normalizar(busca)) ||
      normalizar(usuario.name!).includes(normalizar(busca))
    );
  });

  return (
    <>
      <div className=" mb-4 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar usuarios..."
          className="pl-10"
          onChange={(event) => setBusca(event.target.value)}
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <ButtonAdd />
      <GridItems classNames="md:grid-cols-1 lg:grid-cols-1">
        {(usuariosFiltrados || [])?.map((usuario) => {
          return (
            <Link href={pathname + `/usuarios/${usuario.id}`} key={usuario.id}>
              <GridItem title={usuario.name!}>
                <p className="text-gray-600 mb-2">{usuario.email}</p>
              </GridItem>
            </Link>
          );
        })}
      </GridItems>
    </>
  );
}
