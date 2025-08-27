"use client";

import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getFilaImpressao, retryPrint, cancelPrint, type PrintJob } from "../impressao/actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Printer, 
  RefreshCw, 
  Package, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RotateCw,
  X,
  FileText,
  Activity,
  TrendingUp,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PrintQueuePage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const loadJobs = async () => {
    try {
      setRefreshing(true);
      const data = await getFilaImpressao();
      setJobs(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar fila de impressão");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
    // Refresh every 30 seconds
    const interval = setInterval(loadJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async (id: string) => {
    try {
      await retryPrint(id);
      toast.success("Impressão reenviada");
      loadJobs();
    } catch (error: any) {
      toast.error(error.message || "Erro ao reenviar impressão");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelPrint(id);
      toast.success("Impressão cancelada");
      loadJobs();
    } catch (error: any) {
      toast.error(error.message || "Erro ao cancelar impressão");
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          badge: <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>,
          icon: Clock,
          color: "amber"
        };
      case "printing":
        return {
          badge: <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            <Printer className="h-3 w-3 mr-1 animate-pulse" />
            Imprimindo
          </Badge>,
          icon: Printer,
          color: "blue"
        };
      case "completed":
        return {
          badge: <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluído
          </Badge>,
          icon: CheckCircle2,
          color: "emerald"
        };
      case "failed":
        return {
          badge: <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Falhou
          </Badge>,
          icon: XCircle,
          color: "red"
        };
      case "cancelled":
        return {
          badge: <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700">
            <X className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>,
          icon: X,
          color: "slate"
        };
      default:
        return {
          badge: <Badge variant="outline">{status}</Badge>,
          icon: FileText,
          color: "slate"
        };
    }
  };

  // Filtrar jobs baseado no filtro selecionado e regras de data
  const filteredJobs = jobs.filter(job => {
    // Primeiro aplica o filtro de status se não for "all"
    if (filter !== "all" && job.status !== filter) {
      return false;
    }
    
    // Se o job está concluído, só mostra se for do dia atual
    if (job.status === "completed") {
      const jobDate = new Date(job.created_at);
      const today = new Date();
      return (
        jobDate.getDate() === today.getDate() &&
        jobDate.getMonth() === today.getMonth() &&
        jobDate.getFullYear() === today.getFullYear()
      );
    }
    
    // Para outros status (pending, failed, printing, cancelled), mostra todos
    return true;
  });

  // Estatísticas - aplicando mesma lógica de data para concluídos
  const today = new Date();
  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const stats = {
    total: jobs.filter(j => j.status !== "completed" || isToday(j.created_at)).length,
    pending: jobs.filter(j => j.status === "pending").length,
    printing: jobs.filter(j => j.status === "printing").length,
    completed: jobs.filter(j => j.status === "completed" && isToday(j.created_at)).length,
    failed: jobs.filter(j => j.status === "failed").length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <Printer className="h-7 w-7" />
              </div>
              Fila de Impressão
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Monitore e gerencie todas as impressões do sistema
            </p>
          </div>
          
          <Button
            onClick={loadJobs}
            disabled={refreshing}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </>
            )}
          </Button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200",
              filter === "all" 
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                : "hover:shadow-lg"
            )}
            onClick={() => setFilter("all")}
          >
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Total</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <Activity className="h-8 w-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200",
              filter === "pending" 
                ? "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/20" 
                : "hover:shadow-lg"
            )}
            onClick={() => setFilter("pending")}
          >
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Pendentes</p>
                  <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200",
              filter === "printing" 
                ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20" 
                : "hover:shadow-lg"
            )}
            onClick={() => setFilter("printing")}
          >
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Imprimindo</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.printing}</p>
                </div>
                <Printer className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200",
              filter === "completed" 
                ? "ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" 
                : "hover:shadow-lg"
            )}
            onClick={() => setFilter("completed")}
          >
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Concluídas Hoje</p>
                  <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{stats.completed}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={cn(
              "cursor-pointer transition-all duration-200",
              filter === "failed" 
                ? "ring-2 ring-red-500 bg-red-50 dark:bg-red-950/20" 
                : "hover:shadow-lg"
            )}
            onClick={() => setFilter("failed")}
          >
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-600 dark:text-red-400">Falharam</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabela de jobs */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Jobs de Impressão</CardTitle>
              <CardDescription>
                {filter === "all" 
                  ? "Mostrando todos os jobs" 
                  : `Filtrando por: ${filter === "pending" ? "Pendentes" : 
                      filter === "printing" ? "Imprimindo" :
                      filter === "completed" ? "Concluídas" :
                      filter === "failed" ? "Falharam" : filter}`}
              </CardDescription>
            </div>
            {filter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilter("all")}
              >
                Limpar Filtro
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead className="font-semibold">Data/Hora</TableHead>
                  <TableHead className="font-semibold">Produto</TableHead>
                  <TableHead className="font-semibold">Impressora</TableHead>
                  <TableHead className="font-semibold text-center">Quantidade</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => {
                  const statusInfo = getStatusInfo(job.status);
                  return (
                    <TableRow 
                      key={job.id}
                      className={cn(
                        "hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                        job.status === "printing" && "bg-blue-50/30 dark:bg-blue-950/10",
                        job.status === "failed" && "bg-red-50/30 dark:bg-red-950/10"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {format(new Date(job.created_at), "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {format(new Date(job.created_at), "HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-white">
                            {job.produto?.nome || "Teste de Impressão"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Printer className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">
                            {job.impressora?.nome || "Impressora padrão"}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-semibold text-slate-900 dark:text-white">
                            {job.quantidade}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {statusInfo.badge}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {job.status === "failed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetry(job.id)}
                              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 dark:hover:border-blue-700"
                            >
                              <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                              Tentar Novamente
                            </Button>
                          )}
                          {job.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancel(job.id)}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-700"
                            >
                              <X className="h-3.5 w-3.5 mr-1.5" />
                              Cancelar
                            </Button>
                          )}
                          {job.status === "printing" && (
                            <Badge variant="outline" className="animate-pulse">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Em progresso
                            </Badge>
                          )}
                          {job.status === "completed" && (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Finalizado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {filteredJobs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32">
                      <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <Printer className="h-12 w-12 mb-3 opacity-30" />
                        <p className="text-lg font-medium">
                          {filter === "all" 
                            ? "Nenhuma impressão na fila" 
                            : `Nenhuma impressão ${
                                filter === "pending" ? "pendente" :
                                filter === "printing" ? "em andamento" :
                                filter === "completed" ? "concluída" :
                                filter === "failed" ? "falhou" : ""
                              }`}
                        </p>
                        <p className="text-sm mt-1">
                          As impressões aparecerão aqui quando forem enviadas
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}