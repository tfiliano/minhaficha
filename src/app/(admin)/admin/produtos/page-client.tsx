"use client";

import { Tables } from "@/types/database.types";
import { PropsWithChildren } from "react";
import { ButtonExcel } from "../button-excel";
import { ButtonAdd } from "../button-new";
import { ImportProdutos } from "@/components/admin/import-produtos";
// import { ImportHistory } from "@/components/admin/import-history"; // Movido para dentro do ImportProdutos
import { ProdutosView } from "@/components/admin/produtos-view";

type Produto = Tables<`produtos`>;

type ProdutosPage = {
  produtos: Produto[] | null;
};

export function ProdutosPageClient({
  produtos,
}: PropsWithChildren<ProdutosPage>) {
  return (
    <div className="space-y-6">
      {/* Header com botões de ação */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos e catálogo
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ButtonExcel />
          <ImportProdutos />
          <ButtonAdd />
        </div>
      </div>

      {/* Visualização dos produtos */}
      <ProdutosView produtos={produtos || []} />
    </div>
  );
}
