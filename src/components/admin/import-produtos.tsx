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
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { previewImportFromExcel, ImportPreviewResult, ProdutoImportPreview } from "@/app/(admin)/admin/produtos/preview-import-action";
import { processImportFromPreview } from "@/app/(admin)/admin/produtos/process-import-action";
import { ImportPreviewTable } from "./import-preview-table";
import { ImportHistory } from "./import-history";
import { createImportTables } from "@/app/(admin)/admin/produtos/create-import-tables-action";
// import { uploadImportFile } from "@/lib/storage"; // Usar server action em vez disso

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [previewResult, setPreviewResult] = useState<ImportPreviewResult | null>(null);
  const [previewData, setPreviewData] = useState<ProdutoImportPreview[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [fileInfo, setFileInfo] = useState<{
    file: File;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  } | null>(null);
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
    setPreviewResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const preview = await previewImportFromExcel(formData);
      setPreviewResult(preview);

      if (preview.success && preview.data) {
        // Salvar informações do arquivo para uso posterior
        setFileInfo({
          file,
          fileName: file.name,
          filePath: '', // Será preenchido no upload
          fileSize: file.size,
          mimeType: file.type
        });
        
        setPreviewData(preview.data);
        setCurrentStep('preview');
        toast.success('Arquivo processado! Revise os dados antes de confirmar a importação.');
      } else {
        toast.error(preview.message);
        setCurrentStep('upload');
      }
    } catch (error) {
      console.error('Erro no preview:', error);
      toast.error('Erro inesperado durante o processamento');
      setCurrentStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    
    try {
      let fileInfoWithPath = null;
      
      // Upload do arquivo se disponível
      if (fileInfo) {
        toast.loading('Salvando arquivo...');
        // Simular busca da loja_id e usuario_id (normalmente viriam do contexto/auth)
        // Por enquanto, vamos apenas processar sem upload
        fileInfoWithPath = {
          fileName: fileInfo.fileName,
          filePath: `temp/${fileInfo.fileName}`,
          fileSize: fileInfo.fileSize,
          mimeType: fileInfo.mimeType
        };
      }
      
      const result = await processImportFromPreview(previewData, fileInfoWithPath);
      setResult(result);
      setCurrentStep('result');

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
      toast.error('Erro inesperado durante a importação');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataChange = (updatedData: ProdutoImportPreview[]) => {
    setPreviewData(updatedData);
  };

  const resetDialog = () => {
    setResult(null);
    setPreviewResult(null);
    setPreviewData([]);
    setFileInfo(null);
    setIsLoading(false);
    setIsProcessing(false);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const goBackToUpload = () => {
    setPreviewResult(null);
    setPreviewData([]);
    setFileInfo(null);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateTables = async () => {
    try {
      toast.loading('Verificando tabelas de histórico...');
      const result = await createImportTables();
      
      if (result.success) {
        toast.success(result.message);
      } else if (result.error === 'MANUAL_SQL_REQUIRED') {
        toast.dismiss();
        
        // Criar modal com instruções SQL
        const sqlModal = document.createElement('div');
        sqlModal.innerHTML = `
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div class="p-6 border-b">
                <h2 class="text-xl font-semibold">Criar Tabelas de Histórico</h2>
                <p class="text-gray-600">Execute o SQL abaixo no painel do Supabase (SQL Editor):</p>
              </div>
              <div class="p-6">
                <pre class="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-[50vh] whitespace-pre-wrap">${(result as any).sqlInstructions}</pre>
                <div class="mt-4 flex gap-2">
                  <button id="copy-sql" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Copiar SQL
                  </button>
                  <button id="close-modal" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
        
        document.body.appendChild(sqlModal);
        
        document.getElementById('copy-sql')?.addEventListener('click', () => {
          navigator.clipboard.writeText((result as any).sqlInstructions);
          toast.success('SQL copiado! Execute no Supabase SQL Editor');
        });
        
        document.getElementById('close-modal')?.addEventListener('click', () => {
          document.body.removeChild(sqlModal);
        });
        
        sqlModal.addEventListener('click', (e) => {
          if (e.target === sqlModal) {
            document.body.removeChild(sqlModal);
          }
        });
        
      } else {
        toast.error(result.error || 'Erro ao criar tabelas');
      }
    } catch (error) {
      console.error('Erro ao criar tabelas:', error);
      toast.error('Erro inesperado ao criar tabelas');
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
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStep === 'preview' && <Eye className="h-5 w-5" />}
              <FileSpreadsheet className="h-5 w-5" />
              <DialogTitle className="text-lg font-semibold">
                {currentStep === 'upload' && 'Importar Produtos via Excel'}
                {currentStep === 'preview' && 'Pré-visualização da Importação'}
                {currentStep === 'result' && 'Resultado da Importação'}
              </DialogTitle>
            </div>
            <ImportHistory onCreateTables={handleCreateTables} />
          </div>
          <DialogDescription>
            {currentStep === 'upload' && 'Faça upload de um arquivo Excel (.xlsx) para importar produtos em lote.'}
            {currentStep === 'preview' && 'Revise e edite os dados antes de confirmar a importação.'}
            {currentStep === 'result' && 'Resultado da importação dos produtos.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Passo 1: Upload do arquivo */}
          {currentStep === 'upload' && (
            <>
              {/* Instruções */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Novo formato de importação:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>Nome do Produto:</strong> Obrigatório</li>
                  <li>• <strong>Código:</strong> Opcional (será gerado automaticamente)</li>
                  <li>• <strong>Unidade:</strong> Padrão &quot;UN&quot;</li>
                  <li>• <strong>Setor:</strong> Padrão &quot;AÇOUGUE&quot;</li>
                  <li>• <strong>Nome do Grupo:</strong> Será criado se não existir</li>
                  <li>• <strong>Nome do Armazenamento:</strong> Será criado se não existir</li>
                  <li>• <strong>Nome do Produto Pai:</strong> Será criado se não existir</li>
                  <li>• <strong>Estoque Unidade/Kilo, Dias Validade:</strong> Opcionais</li>
                  <li>• <strong>Ativo:</strong> Padrão &quot;SIM&quot;</li>
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
                    <span className="text-sm">Analisando arquivo...</span>
                  </div>
                  <Progress className="w-full" />
                </div>
              )}
            </>
          )}

          {/* Passo 2: Pré-visualização */}
          {currentStep === 'preview' && previewResult && previewResult.data && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Pré-visualização dos dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Revise os dados e resolva conflitos antes da importação
                  </p>
                </div>
                <Button variant="outline" onClick={goBackToUpload}>
                  Escolher Outro Arquivo
                </Button>
              </div>

              <ImportPreviewTable
                data={previewData}
                gruposDisponiveis={previewResult.gruposDisponiveis || []}
                armazenamentosDisponiveis={previewResult.armazenamentosDisponiveis || []}
                produtosDisponiveis={previewResult.produtosDisponiveis || []}
                onDataChange={handleDataChange}
                onConfirmImport={handleConfirmImport}
                isProcessing={isProcessing}
              />
            </>
          )}

          {/* Passo 3: Resultado */}
          {currentStep === 'result' && result && (
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