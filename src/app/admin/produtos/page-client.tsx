"use client";

import { FormBuilder2 } from "@/components/form-builder";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useDeviceType } from "@/hooks/use-device-type";
import { useScrollBehavior } from "@/hooks/use-scroll-behavior";
import { cn } from "@/lib/utils";
import { Tables } from "@/types/database.types";
import { Search } from "lucide-react";
import { PropsWithChildren, useState } from "react";

type Produto = Tables<`produtos`>;

type ProdutosPage = {
  produtos: Produto[] | null;
};

export function ProdutosPageClient({
  produtos,
}: PropsWithChildren<ProdutosPage>) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [busca, setBusca] = useState("");
  const deviceType = useDeviceType();

  const produtosFiltrados = (produtos || []).filter((produto) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(produto.nome).includes(normalizar(busca)) ||
      normalizar(produto.nome).includes(normalizar(busca))
    );
  });

  useScrollBehavior(!!produto?.id);

  return (
    <>
      <Drawer open={!!produto?.id} onClose={() => setProduto(null)}>
        <DrawerContent className="z-50">
          <DrawerHeader>
            <DrawerTitle>Confirmação</DrawerTitle>
            <DrawerDescription>
              Verifique os dados antes de confirmar
            </DrawerDescription>
          </DrawerHeader>
          <div className="max-w-lg mx-auto px-4">
            <FormBuilder2
              builder={{
                columns: [
                  {
                    rows: [
                      {
                        fields: [
                          {
                            name: "codigo",
                            label: "Código do Produto",
                            placeholder: "Digite o código do produto",
                            type: "text",
                            required: true,
                          },
                          {
                            name: "nome",
                            label: "Nome do Produto",
                            placeholder: "Digite o nome do produto",
                            type: "text",
                            required: true,
                          },
                        ],
                      },
                      {
                        fields: [
                          {
                            name: "estoque_unidade",
                            label: "Estoque em Unidades",
                            placeholder: "Digite a quantidade em unidades",
                            type: "number",
                            required: false,
                          },
                          {
                            name: "estoque_kilo",
                            label: "Estoque em Kilos",
                            placeholder: "Digite a quantidade em kilos",
                            type: "number",
                            required: false,
                          },
                        ],
                      },
                      {
                        fields: [
                          {
                            name: "grupo",
                            label: "Grupo",
                            placeholder: "Selecione o grupo",
                            type: "select",
                            options: [
                              { value: "alimentos", label: "Alimentos" },
                              { value: "bebidas", label: "Bebidas" },
                              { value: "limpeza", label: "Limpeza" },
                            ],
                            required: true,
                          },
                          {
                            name: "setor",
                            label: "Setor",
                            placeholder: "Digite o setor",
                            type: "text",
                            required: true,
                          },
                        ],
                      },
                      {
                        fields: [
                          {
                            name: "armazenamento",
                            label: "Armazenamento",
                            placeholder: "Local de armazenamento",
                            type: "text",
                            required: false,
                          },
                          {
                            name: "dias_validade",
                            label: "Dias de Validade",
                            placeholder: "Digite a validade em dias",
                            type: "number",
                            required: false,
                          },
                        ],
                      },
                    ],
                  },
                ],
              }}
              onSubmit={function (data: any): void {
                throw new Error("Function not implemented.");
              }}
              submitLabel="Atualizar"
              submitClass={cn("mb-4", {
                "mb-8": useDeviceType() === "PC",
              })}
              form={{}}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <div className=" mb-6 w-full sticky z-20 top-[19.3px]">
        <Input
          type="text"
          placeholder="Buscar produtos..."
          className="pl-10"
          onChange={(event) => setBusca(event.target.value)}
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 w-full">
        {(produtosFiltrados || [])?.map((produto) => {
          return (
            <Card
              key={produto.id}
              className="w-full hover:border-primary cursor-pointer"
              onClick={() => setProduto(produto)}
            >
              <CardHeader>{produto.nome}</CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{produto.codigo}</p>
                <p className="font-bold">{produto.unidade}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}
