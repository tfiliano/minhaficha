"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { History, FileSpreadsheet, Download, Eye, Calendar, User, BarChart3 } from "lucide-react";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";

interface ImportHistoryRecord {
  id: string;
  arquivo_nome: string;
  arquivo_path: string;
  arquivo_size: number;
  total_linhas: number;
  linhas_criadas: number;
  linhas_atualizadas: number;
  linhas_puladas: number;
  linhas_com_erro: number;
  status: string;
  created_at: string;
  processed_at: string | null;
  usuario_id: string;
}

interface ImportDetail {
  id: string;
  linha_numero: number;
  produto_codigo: string | null;
  produto_nome: string;
  acao: 'created' | 'updated' | 'skipped' | 'error';
  dados_originais: any;
  erro_message: string | null;
}

interface ImportHistoryProps {
  onCreateTables?: () => Promise<void>;
}

export function ImportHistory({ onCreateTables }: ImportHistoryProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<ImportHistoryRecord[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<ImportDetail[]>([]);
  const [selectedImport, setSelectedImport] = useState<ImportHistoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [needsTableCreation, setNeedsTableCreation] = useState(false);
  const [sqlInstructions, setSqlInstructions] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('import_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        if (error.code === '42P01') {
          setNeedsTableCreation(true);
          setHistory([]);
        } else {
          throw error;
        }
      } else {
        setHistory(data || []);
        setNeedsTableCreation(false);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de importações');
    } finally {
      setIsLoading(false);
    }
  };

  const loadImportDetails = async (importId: string) => {
    setIsLoadingDetails(true);
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from('import_history_details')
        .select('*')
        .eq('import_history_id', importId)
        .order('linha_numero');

      if (error) throw error;
      setSelectedDetails(data || []);
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      toast.error('Erro ao carregar detalhes da importação');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      processing: 'secondary',
      failed: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status === 'completed' ? 'Concluída' : 
         status === 'processing' ? 'Processando' : 
         status === 'failed' ? 'Falhou' : status}
      </Badge>
    );
  };

  const getActionBadge = (action: string) => {
    const colors = {
      created: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      skipped: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      created: 'Criado',
      updated: 'Atualizado',
      skipped: 'Pulado',
      error: 'Erro'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[action as keyof typeof labels] || action}
      </span>
    );
  };

  const handleCreateTables = async () => {
    if (onCreateTables) {
      try {
        const result = await onCreateTables();
        await loadHistory(); // Recarregar após criar tabelas
      } catch (error) {
        console.error('Erro ao criar tabelas:', error);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('SQL copiado para a área de transferência!');
    }).catch(() => {
      toast.error('Erro ao copiar SQL');
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Histórico de Importações">
          <History className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Importações
          </DialogTitle>
          <DialogDescription>
            Visualize o histórico de importações de produtos realizadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {needsTableCreation ? (
            <div className="text-center py-8 space-y-4">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <div>
                <p className="text-muted-foreground mb-2">As tabelas de histórico ainda não foram criadas.</p>
                <Button onClick={handleCreateTables} disabled={!onCreateTables}>
                  <History className="h-4 w-4 mr-2" />
                  Configurar Histórico
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhuma importação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Lista do histórico */}
              <div className="grid gap-4">
                {history.map((record) => (
                  <Card key={record.id} className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => {
                          setSelectedImport(record);
                          loadImportDetails(record.id);
                        }}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileSpreadsheet className="h-4 w-4" />
                          {record.arquivo_nome}
                        </CardTitle>
                        {getStatusBadge(record.status)}
                      </div>
                      <CardDescription className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(record.created_at).toLocaleString()}
                        </span>
                        <span>{formatFileSize(record.arquivo_size)}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-gray-600">{record.total_linhas}</div>
                          <div className="text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{record.linhas_criadas}</div>
                          <div className="text-gray-500">Criados</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{record.linhas_atualizadas}</div>
                          <div className="text-gray-500">Atualizados</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-600">{record.linhas_puladas}</div>
                          <div className="text-gray-500">Pulados</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">{record.linhas_com_erro}</div>
                          <div className="text-gray-500">Erros</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Modal de detalhes */}
              {selectedImport && (
                <Dialog open={!!selectedImport} onOpenChange={() => setSelectedImport(null)}>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Detalhes da Importação</DialogTitle>
                      <DialogDescription>
                        {selectedImport.arquivo_nome} - {new Date(selectedImport.created_at).toLocaleString()}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="max-h-[60vh] overflow-y-auto">
                      {isLoadingDetails ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                          <p className="mt-2 text-sm text-muted-foreground">Carregando detalhes...</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Linha</TableHead>
                              <TableHead className="w-20">Ação</TableHead>
                              <TableHead className="min-w-[100px]">Código</TableHead>
                              <TableHead className="min-w-[200px]">Nome do Produto</TableHead>
                              <TableHead className="min-w-[200px]">Erro</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedDetails.map((detail) => (
                              <TableRow key={detail.id}>
                                <TableCell>{detail.linha_numero}</TableCell>
                                <TableCell>{getActionBadge(detail.acao)}</TableCell>
                                <TableCell>{detail.produto_codigo || '-'}</TableCell>
                                <TableCell>{detail.produto_nome}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                  {detail.erro_message || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}