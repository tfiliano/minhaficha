"use client";

import { Title } from "@/components/layout";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Json } from "@/types/database.types";
import { 
  LoaderCircle, 
  Pencil, 
  Trash2, 
  FileText, 
  Plus, 
  Search,
  Ruler,
  Layout,
  Hash,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteTemplate, getTemplates } from "../actions";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  nome: string | null;
  zpl: string | null;
  campos: Json[];
  width: number | null;
  height: number | null;
}

export default function TemplateListPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = (await getTemplates()) as any[];
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

  const templatesFiltrados = templates.filter((template) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(template.nome || "").includes(normalizar(busca))
    );
  });

  // Estatísticas
  const totalTemplates = templatesFiltrados.length;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-center h-32">
            <LoaderCircle className="h-8 w-8 animate-spin text-pink-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-gradient-to-r from-slate-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Título e descrição */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Templates de Etiquetas
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Crie e gerencie layouts personalizados para impressão de etiquetas
              </p>
            </div>
            {/* Estatísticas */}
            <div className="flex flex-wrap gap-3">
              <Badge className="px-3 py-1.5 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                {totalTemplates} {totalTemplates === 1 ? 'template' : 'templates'}
              </Badge>
            </div>
          </div>

          {/* Botão de adicionar */}
          <Link href="/admin/templates/etiquetas/editor">
            <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar templates por nome..."
          className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {templatesFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <FileText className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhum template encontrado
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {busca ? 
                    `Nenhum template corresponde à busca "${busca}"` : 
                    "Comece criando templates personalizados para suas etiquetas"
                  }
                </p>
                {!busca && (
                  <Link href="/admin/templates/etiquetas/editor">
                    <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Template
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          templatesFiltrados.map((template) => {
            return (
              <Card
                key={template.id}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 h-full"
              >
                {/* Gradiente decorativo */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors line-clamp-2">
                        {template.nome || "Template sem nome"}
                      </CardTitle>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {template.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
                      <Layout className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="relative space-y-4">
                  {/* Dimensões */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <Ruler className="h-4 w-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Dimensões</p>
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                        {template.width}mm × {template.height}mm
                      </p>
                    </div>
                  </div>

                  {/* Campos */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 dark:text-blue-400">Campos Configurados</p>
                      <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                        {template.campos.length} {template.campos.length === 1 ? 'campo' : 'campos'}
                      </p>
                    </div>
                  </div>

                  {/* Preview indicator */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <Layout className="h-4 w-4 text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Layout ZPL Configurado
                      </span>
                    </div>
                  </div>
                </CardContent>

                {/* Botões de ação */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent dark:from-slate-900 dark:to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/templates/etiquetas/editor/${template.id}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 dark:hover:border-blue-700"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Editar
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-700"
                      onClick={() => {
                        setTemplateToDelete(template);
                        setDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            );
          })
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Template</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o template &quot;
              {templateToDelete?.nome}&quot;? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}