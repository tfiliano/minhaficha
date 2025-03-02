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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getPrinters, savePrinter, updatePrinter, deletePrinter, testPrinter, type Printer } from "./../actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [printerToDelete, setPrinterToDelete] = useState<Printer | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    ip: "",
    porta: "9100"
  });

  const loadPrinters = async () => {
    try {
      const data = await getPrinters();
      setPrinters(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar impressoras");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrinters();
  }, []);

  const handleSave = async () => {
    if (!formData.nome || !formData.ip) {
      toast.error("Nome e IP são obrigatórios");
      return;
    }

    try {
      await savePrinter({
        nome: formData.nome,
        ip: formData.ip,
        porta: parseInt(formData.porta),
        status: 'offline'
      });
      toast.success("Impressora salva com sucesso");
      setDialogOpen(false);
      setFormData({ nome: "", ip: "", porta: "9100" });
      loadPrinters();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar impressora");
    }
  };

  const handleDelete = async () => {
    if (!printerToDelete) return;

    try {
      await deletePrinter(printerToDelete.id);
      toast.success("Impressora excluída com sucesso");
      loadPrinters();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir impressora");
    } finally {
      setDeleteConfirmOpen(false);
      setPrinterToDelete(null);
    }
  };

  const handleTest = async (id: string) => {
    try {
      await testPrinter(id);
      toast.success("Teste de impressão enviado");
    } catch (error: any) {
      toast.error(error.message || "Erro ao testar impressora");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Title>Impressoras</Title>
        <div className="flex justify-center items-center h-64">
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Title>Impressoras</Title>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Nova Impressora</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Impressora</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Impressora Balcão"
                />
              </div>
              <div>
                <Label>IP</Label>
                <Input
                  value={formData.ip}
                  onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                  placeholder="Ex: 192.168.1.100"
                />
              </div>
              <div>
                <Label>Porta</Label>
                <Input
                  type="number"
                  value={formData.porta}
                  onChange={(e) => setFormData({ ...formData, porta: e.target.value })}
                  placeholder="Ex: 9100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Porta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printers.map((printer) => (
              <TableRow key={printer.id}>
                <TableCell>{printer.nome}</TableCell>
                <TableCell>{printer.ip}</TableCell>
                <TableCell>{printer.porta}</TableCell>
                <TableCell>
                  {printer.status === 'online' ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600">Online</Badge>
                  ) : (
                    <Badge variant="secondary">Offline</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(printer.id)}
                  >
                    Testar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setPrinterToDelete(printer);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {printers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Nenhuma impressora cadastrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Impressora</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a impressora &quot;{printerToDelete?.nome}&quot;?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
