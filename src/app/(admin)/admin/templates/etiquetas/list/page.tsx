"use client";

import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getTemplates, deleteTemplate } from "../actions";
import { useEffect, useState } from "react";
import { LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
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

interface Template {
  id: string;
  nome: string;
  zpl: string;
  campos: any[];
  width: number;
  height: number;
}

export default function TemplateListPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate(templateToDelete.id);
      toast.success("Template excluído com sucesso");
      await loadTemplates();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir template");
    } finally {
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Title>Templates de Etiqueta</Title>
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="w-6 h-6 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Title>Templates de Etiqueta</Title>
        <Link href="/admin/templates/etiquetas/editor">
          <Button>Novo Template</Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum template encontrado
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{template.nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    {template.width}mm x {template.height}mm • {template.campos.length} campos
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/templates/etiquetas/editor/${template.id}`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setTemplateToDelete(template);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template &quot;{templateToDelete?.nome}&quot;?
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
