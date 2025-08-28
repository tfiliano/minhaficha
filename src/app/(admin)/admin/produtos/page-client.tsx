"use client";

import { Tables } from "@/types/database.types";
import { PropsWithChildren } from "react";
import { ButtonExcel } from "../button-excel";
import { ButtonAdd } from "../button-new";
import { ImportProdutos } from "@/components/admin/import-produtos";
import { ProdutosView } from "@/components/admin/produtos-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, FileSpreadsheet, Plus, Upload, Database, Layers, ShoppingCart } from "lucide-react";

type Produto = Tables<`produtos`>;

type ProdutosPage = {
  produtos: Produto[] | null;
};

export function ProdutosPageClient({
  produtos,
}: PropsWithChildren<ProdutosPage>) {
  const produtosAtivos = produtos?.filter(p => p.ativo) || [];
  const produtosInativos = produtos?.filter(p => !p.ativo) || [];
  const produtosPai = produtos?.filter(p => !p.originado) || [];
  const produtosFilhos = produtos?.filter(p => p.originado) || [];

  return (
    <div className="space-y-4">
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-4 sm:p-6 border border-blue-200 dark:border-blue-700 shadow-sm">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
              Gestão de Produtos
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              Gerencie seu catálogo completo de produtos e insumos
            </p>
          </div>
          <div className="p-2 sm:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Total</p>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">
                  {produtos?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Ativos</p>
                <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                  {produtosAtivos.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Principais</p>
                <p className="font-semibold text-sm text-blue-600 dark:text-blue-400">
                  {produtosPai.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-slate-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Insumos</p>
                <p className="font-semibold text-sm text-purple-600 dark:text-purple-400">
                  {produtosFilhos.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Ações */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-blue-600" />
            Ações de Gerenciamento
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Adicione, importe ou exporte produtos do seu catálogo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <ButtonAdd />
            <ImportProdutos />
            <ButtonExcel />
          </div>
        </CardContent>
      </Card>

      {/* Visualização dos produtos */}
      <ProdutosView produtos={produtos || []} />
    </div>
  );
}