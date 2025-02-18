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
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getFilaImpressao, retryPrint, cancelPrint, type PrintJob } from "../impressao/actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PrintQueuePage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      case "printing":
        return <Badge variant="default">Imprimindo</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white">Concluído</Badge>;
      case "failed":
        return <Badge variant="destructive">Falhou</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Title>Fila de Impressão</Title>
        <div className="flex justify-center items-center h-64">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Title>Fila de Impressão</Title>
        <Button
          variant="outline"
          onClick={loadJobs}
          disabled={refreshing}
        >
          {refreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Impressora</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  {format(new Date(job.created_at), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>{job.produto?.nome || "Teste"}</TableCell>
                <TableCell>{job.impressora?.nome || "-"}</TableCell>
                <TableCell>{job.quantidade}</TableCell>
                <TableCell>{getStatusBadge(job.status)}</TableCell>
                <TableCell>
                  {job.test_print ? (
                    <Badge variant="secondary">Teste</Badge>
                  ) : (
                    <Badge variant="default">Produção</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {job.status === "failed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRetry(job.id)}
                    >
                      Tentar Novamente
                    </Button>
                  )}
                  {job.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(job.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Nenhuma impressão na fila
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
