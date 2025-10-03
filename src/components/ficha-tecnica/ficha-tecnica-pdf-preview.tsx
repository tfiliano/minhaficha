"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";

type Produto = {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
  grupo: string;
  setor: string;
};

type FichaTecnica = {
  id: string;
  produto_cardapio_id: string;
  nome?: string;
  porcoes?: number;
  observacoes?: string;
  modo_preparo?: string;
  tempo_preparo_minutos?: number;
};

type Ingrediente = {
  id: string;
  produto_ingrediente_id: string;
  quantidade: number;
  unidade: string;
  custo_unitario?: number;
  observacoes?: string;
  produto: {
    id: string;
    codigo: string;
    nome: string;
    unidade: string;
    grupo: string;
  };
};

type Props = {
  produto: Produto;
  fichaTecnica: FichaTecnica;
  ingredientes: Ingrediente[];
  fotoCapa?: string | null;
};

export function FichaTecnicaPDFPreview({ produto, fichaTecnica, ingredientes, fotoCapa }: Props) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/ficha-tecnica/${produto.id}/pdf`);
      if (!response.ok) throw new Error("Erro ao gerar PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ficha-tecnica-${produto.codigo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Calcular custos totais
  const custoTotal = ingredientes.reduce((total, item) => {
    const custo = (item.custo_unitario || 0) * item.quantidade;
    return total + custo;
  }, 0);

  const custoPorPorcao = fichaTecnica.porcoes ? custoTotal / fichaTecnica.porcoes : 0;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Botões de ação (não imprimem) */}
      <div className="no-print bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="gap-2 bg-orange-600 hover:bg-orange-700"
          >
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Salvar PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Conteúdo para impressão */}
      <div className="container mx-auto px-4 py-8 print:p-0">
        <div className="bg-white shadow-lg print:shadow-none mx-auto" style={{ maxWidth: "210mm" }}>
          <div className="p-6 print:p-4">
            {/* Cabeçalho Premium */}
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-5 mb-4 shadow-md">
              <div className="flex justify-between items-center mb-1">
                <h1 className="text-2xl font-bold uppercase tracking-wide">Ficha Técnica de Preparação</h1>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                  CÓDIGO {produto.codigo}
                </div>
              </div>
              <p className="text-xs opacity-90">Documento técnico de produção e controle de custos</p>
            </div>

            {/* Card de Informações */}
            <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 shadow-sm">
              <div className="grid grid-cols-[1.3fr,1fr]">
                <div className="p-5 border-r border-slate-200 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Preparação</p>
                    <p className="text-lg font-bold text-slate-900">{produto.nome}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Categoria</p>
                    <p className="text-sm font-bold text-slate-900">{produto.grupo} • {produto.setor}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Responsável</p>
                    <p className="text-sm font-bold text-slate-400">_______________________________</p>
                  </div>
                </div>
                {fotoCapa && (
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <img
                      src={fotoCapa}
                      alt={produto.nome}
                      className="w-full h-full object-cover"
                      style={{ maxHeight: "160px" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Tabela de Ingredientes */}
            <div className="mb-4">
              <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-t-lg p-3 flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-wide">Ingredientes & Insumos</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-semibold">
                  {ingredientes.length} ITENS
                </span>
              </div>
              <div className="border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="border-b-2 border-slate-200 px-3 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Ingrediente
                      </th>
                      <th className="border-b-2 border-slate-200 px-2 py-3 text-center w-16 text-xs font-bold text-slate-600 uppercase">
                        UN
                      </th>
                      <th className="border-b-2 border-slate-200 px-2 py-3 text-center w-24 text-xs font-bold text-slate-600 uppercase">
                        Qtd.
                      </th>
                      <th className="border-b-2 border-slate-200 px-2 py-3 text-center w-24 text-xs font-bold text-slate-600 uppercase">
                        F.C.
                      </th>
                      <th className="border-b-2 border-slate-200 px-2 py-3 text-right w-28 text-xs font-bold text-slate-600 uppercase">
                        Valor Unit.
                      </th>
                      <th className="border-b-2 border-slate-200 px-2 py-3 text-right w-28 text-xs font-bold text-slate-600 uppercase">
                        Valor Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredientes.map((item, idx) => {
                      const valorTotal = (item.custo_unitario || 0) * item.quantidade;
                      return (
                        <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="px-3 py-2 text-slate-700">{item.produto.nome}</td>
                          <td className="px-2 py-2 text-center text-slate-700">{item.unidade}</td>
                          <td className="px-2 py-2 text-center text-slate-700">{item.quantidade.toFixed(3)}</td>
                          <td className="px-2 py-2 text-center text-slate-700">1,000</td>
                          <td className="px-2 py-2 text-right text-slate-700">
                            R$ {(item.custo_unitario || 0).toFixed(2)}
                          </td>
                          <td className="px-2 py-2 text-right text-slate-700">R$ {valorTotal.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 px-5 py-3 flex justify-between items-center border-t-2 border-green-600">
                  <span className="text-sm font-bold uppercase tracking-wide text-slate-900">Custo Total dos Insumos</span>
                  <span className="text-lg font-bold text-green-600">R$ {custoTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modo de Preparo */}
            {fichaTecnica.modo_preparo && (
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-4 shadow-sm">
                <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                  <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Modo de Preparo</h3>
                </div>
                <div
                  className="px-5 py-4 text-sm text-slate-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: fichaTecnica.modo_preparo }}
                />
              </div>
            )}

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-slate-200 rounded-lg p-4 text-center shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rendimento</p>
                <p className="text-2xl font-bold text-green-600">
                  {fichaTecnica.porcoes || 0}
                  <span className="text-xs text-slate-400 font-medium ml-1">porções</span>
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 text-center shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Custo Total</p>
                <p className="text-2xl font-bold text-green-600">R$ {custoTotal.toFixed(2)}</p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 text-center shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Custo/Porção</p>
                <p className="text-2xl font-bold text-green-600">R$ {custoPorPorcao.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estilos para impressão */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            margin: 0;
            padding: 0;
          }

          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
