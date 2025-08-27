"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { importProductsFromExcel } from "@/app/(admin)/admin/produtos/import-action";

type ImportStats = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
};

type ImportResult = {
  success: boolean;
  message: string;
  stats?: ImportStats;
  errors?: string[];
};

export function ImportProdutos() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const importResult = await importProductsFromExcel(formData);
      setResult(importResult);

      if (importResult.success) {
        toast.success(importResult.message);
      } else {
        toast.error(importResult.message);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro inesperado durante a importação');
      setResult({
        success: false,
        message: 'Erro inesperado durante a importação'
      });
    } finally {
      setIsLoading(false);
      // Limpar o input para permitir reenvio do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const resetDialog = () => {
    setResult(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-fit gap-2">
          <Upload className="h-4 w-4" />
          Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Importar Produtos via Excel
          </DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo Excel (.xlsx) para importar produtos em lote.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Estrutura do arquivo Excel:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Coluna A:</strong> ID (opcional)</li>
              <li>• <strong>Coluna B:</strong> Código (opcional)</li>
              <li>• <strong>Coluna C:</strong> Grupo</li>
              <li>• <strong>Coluna D:</strong> Setor (padrão: AÇOUGUE)</li>
              <li>• <strong>Coluna E:</strong> Estoque Unidade</li>
              <li>• <strong>Coluna F:</strong> Estoque Kilo</li>
              <li>• <strong>Coluna G:</strong> Armazenamento</li>
              <li>• <strong>Coluna H:</strong> Dias Validade</li>
              <li>• <strong>Coluna I:</strong> Produto Pai (ID ou nome)</li>
              <li>• <strong>Coluna J:</strong> Nome do Produto (obrigatório)</li>
              <li>• <strong>Coluna K:</strong> Unidade (padrão: UN)</li>
              <li>• <strong>Coluna L:</strong> Loja (padrão: CENTRE)</li>
              <li>• <strong>Coluna M:</strong> Ativo (padrão: SIM)</li>
            </ul>
          </div>

          {/* Upload do arquivo */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">Arquivo Excel</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isLoading}
              ref={fileInputRef}
            />
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Processando arquivo...</span>
              </div>
              <Progress className="w-full" />
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="space-y-4">
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                    {result.message}
                  </AlertDescription>
                </div>
              </Alert>

              {/* Estatísticas */}
              {result.stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="text-center p-2 bg-gray-100 rounded">
                    <div className="font-semibold">{result.stats.total}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-2 bg-green-100 rounded">
                    <div className="font-semibold text-green-700">{result.stats.created}</div>
                    <div className="text-xs text-green-600">Criados</div>
                  </div>
                  <div className="text-center p-2 bg-blue-100 rounded">
                    <div className="font-semibold text-blue-700">{result.stats.updated}</div>
                    <div className="text-xs text-blue-600">Atualizados</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-100 rounded">
                    <div className="font-semibold text-yellow-700">{result.stats.skipped}</div>
                    <div className="text-xs text-yellow-600">Ignorados</div>
                  </div>
                  <div className="text-center p-2 bg-red-100 rounded">
                    <div className="font-semibold text-red-700">{result.stats.errors}</div>
                    <div className="text-xs text-red-600">Erros</div>
                  </div>
                </div>
              )}

              {/* Lista de erros */}
              {result.errors && result.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-sm">Erros encontrados:</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {result.errors.map((error, index) => (
                      <Badge key={index} variant="destructive" className="text-xs block w-fit">
                        {error}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão para nova importação */}
              <Button
                onClick={resetDialog}
                variant="outline"
                className="w-full"
              >
                Fazer Nova Importação
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}