"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  DollarSign,
} from "lucide-react";
import type {
  DadoProducao,
  DadoConversao,
  DadoInsumo,
  DadoMargem,
} from "./actions";

interface RelatoriosClientProps {
  dadosProducao: DadoProducao[];
  dadosConversao: DadoConversao[];
  dadosInsumos: DadoInsumo[];
  dadosMargem: DadoMargem[];
}

export function RelatoriosClient({
  dadosProducao,
  dadosConversao,
  dadosInsumos,
  dadosMargem,
}: RelatoriosClientProps) {
  const handleTabChange = (value: string) => {
    // Disparar evento customizado quando a tab muda
    const event = new CustomEvent("relatorio-tab-change", {
      detail: { tab: value },
    });
    window.dispatchEvent(event);
  };

  return (
    <>
      {/* Relatórios Analíticos com Tabs */}
      <div>
        <Tabs defaultValue="producao" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="producao" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Produção</span>
            </TabsTrigger>
            <TabsTrigger value="conversao" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Correção</span>
            </TabsTrigger>
            <TabsTrigger value="insumos" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Insumos</span>
            </TabsTrigger>
            <TabsTrigger value="margem" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Margem</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Produção */}
          <TabsContent value="producao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Produção</CardTitle>
                <CardDescription>
                  {dadosProducao.length > 0
                    ? `${dadosProducao.length} registros de produção`
                    : "Nenhum registro de produção encontrado"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dadosProducao.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Produto Pai</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Peso</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Peso Médio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosProducao.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-slate-600">{item.codigo}</TableCell>
                            <TableCell className="font-medium">{item.produto}</TableCell>
                            <TableCell className="text-slate-600">
                              {item.produtoPai || "-"}
                            </TableCell>
                            <TableCell>{item.data}</TableCell>
                            <TableCell>{item.responsavel}</TableCell>
                            <TableCell className="text-right">{item.quantidade}</TableCell>
                            <TableCell className="text-right">
                              {item.peso.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {item.tipo}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {item.pesoMedio.toLocaleString("pt-BR", {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Nenhum dado de produção disponível no momento
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Conversão */}
          <TabsContent value="conversao" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Fator de Correção</CardTitle>
                <CardDescription>
                  {dadosConversao.length > 0
                    ? `${dadosConversao.length} registros de produção com fator de correção`
                    : "Nenhum registro encontrado"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dadosConversao.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produto</TableHead>
                          <TableHead>Produto Pai</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Peso Bruto</TableHead>
                          <TableHead className="text-right">Peso Líquido</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">FC</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosConversao.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.produto}</TableCell>
                            <TableCell className="text-slate-600">{item.produtoPai}</TableCell>
                            <TableCell>{item.data}</TableCell>
                            <TableCell>{item.responsavel}</TableCell>
                            <TableCell className="text-right">{item.quantidade}</TableCell>
                            <TableCell className="text-right">
                              {item.pesoBruto.toLocaleString("pt-BR", {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.pesoLiquido.toLocaleString("pt-BR", {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                              })}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {item.tipo}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-blue-600">
                              {item.fc.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Nenhum dado de correção disponível no momento
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Insumos */}
          <TabsContent value="insumos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Entradas de Insumos</CardTitle>
                <CardDescription>
                  {dadosInsumos.length > 0
                    ? `${dadosInsumos.length} entradas de insumos`
                    : "Nenhuma entrada de insumo encontrada"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dadosInsumos.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Peso Bruto</TableHead>
                          <TableHead>Fornecedor</TableHead>
                          <TableHead>NF</TableHead>
                          <TableHead>SIF</TableHead>
                          <TableHead>Temp. °C</TableHead>
                          <TableHead>Lote</TableHead>
                          <TableHead>Validade</TableHead>
                          <TableHead>Responsável</TableHead>
                          <TableHead className="text-center">Conf. Trans.</TableHead>
                          <TableHead className="text-center">Conf. Emb.</TableHead>
                          <TableHead className="text-center">Conf. Prod.</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dadosInsumos.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="whitespace-nowrap">{item.dataRecebimento}</TableCell>
                            <TableCell className="font-medium">{item.produto}</TableCell>
                            <TableCell className="text-right">
                              {item.pesoBruto.toLocaleString("pt-BR", {
                                minimumFractionDigits: 3,
                                maximumFractionDigits: 3,
                              })}
                            </TableCell>
                            <TableCell>{item.fornecedor}</TableCell>
                            <TableCell>{item.notaFiscal}</TableCell>
                            <TableCell>{item.sif}</TableCell>
                            <TableCell>{item.temperatura}</TableCell>
                            <TableCell>{item.lote}</TableCell>
                            <TableCell className="whitespace-nowrap">{item.validade}</TableCell>
                            <TableCell>{item.responsavel}</TableCell>
                            <TableCell className="text-center">
                              {item.confTransporte && (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    item.confTransporte === "Conforme"
                                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {item.confTransporte === "Conforme" ? "✓" : "✗"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.confEmbalagem && (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    item.confEmbalagem === "Conforme"
                                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {item.confEmbalagem === "Conforme" ? "✓" : "✗"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.confProdutos && (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                    item.confProdutos === "Conforme"
                                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {item.confProdutos === "Conforme" ? "✓" : "✗"}
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{item.observacoes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Nenhum dado de entrada disponível no momento
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Margem */}
          <TabsContent value="margem" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Margem de Contribuição</CardTitle>
                <CardDescription>
                  Análise de margem de contribuição dos itens de cardápio
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dadosMargem.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Grupo</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Preço de Venda</TableHead>
                          <TableHead className="text-right">Preço de Custo</TableHead>
                          <TableHead className="text-right">Margem de Contribuição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          let lastGroup = "";
                          return dadosMargem.map((item, index) => {
                            const showGroup = item.grupo !== lastGroup;
                            lastGroup = item.grupo;

                            return (
                              <TableRow key={index}>
                                <TableCell className="font-bold text-blue-600">
                                  {showGroup ? item.grupo : ""}
                                </TableCell>
                                <TableCell className="pl-6">{item.codigo}</TableCell>
                                <TableCell className="pl-6">{item.descricao}</TableCell>
                                <TableCell className="text-right">
                                  R$ {item.precoVenda.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell className="text-right">
                                  R$ {item.precoCusto.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-green-600">
                                  {item.margem > 0 ? item.margem.toFixed(1) : "0.0"}
                                </TableCell>
                              </TableRow>
                            );
                          });
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    Nenhum item de cardápio com margem disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </>
  );
}
