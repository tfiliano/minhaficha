"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tables } from "@/types/database.types";
import { 
  Settings, 
  Building,
  Code,
  Save,
  Database,
  Palette,
  Globe,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { updateLoja, type LojaFormData } from "./actions";
import { cn } from "@/lib/utils";

type Loja = Tables<`lojas`>;

interface ConfiguracoesPageClientProps {
  loja: Loja | null;
}

export function ConfiguracoesPageClient({ loja }: ConfiguracoesPageClientProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LojaFormData>({
    nome: loja?.nome || "",
    codigo: loja?.codigo || "",
    ativo: loja?.ativo ?? true,
    configuracoes: loja?.configuracoes,
  });

  if (!loja) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
              <Settings className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Loja não encontrada
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Não foi possível carregar as configurações da loja atual
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateLoja(loja.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Configurações salvas com sucesso!");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleConfiguracoesChange = (value: string) => {
    try {
      const parsed = value ? JSON.parse(value) : null;
      setFormData({ ...formData, configuracoes: parsed });
    } catch (error) {
      // Manter como string para permitir edição
      setFormData({ ...formData, configuracoes: value || null });
    }
  };

  const temConfiguracao = !!loja.configuracoes;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Configurações da Loja
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Configure as preferências e personalizações para: <span className="font-semibold text-amber-600 dark:text-amber-400">{loja.nome}</span>
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Settings className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                <p className={cn(
                  "font-semibold",
                  loja.ativo ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}>
                  {loja.ativo ? 'Ativa' : 'Inativa'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Código</p>
                <p className="font-semibold text-slate-900 dark:text-white font-mono">
                  {loja.codigo || 'Não definido'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configurações</p>
                <p className={cn(
                  "font-semibold",
                  temConfiguracao ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
                )}>
                  {temConfiguracao ? 'Personalizadas' : 'Padrão'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form de configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Configurações Gerais
          </CardTitle>
          <CardDescription>
            Ajuste as configurações básicas da loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Loja *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Loja Central"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="codigo">Código da Loja</Label>
                <Input
                  id="codigo"
                  value={formData.codigo || ""}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ex: LC001"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Status da Loja</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Loja ativa pode ser utilizada no sistema
                </p>
              </div>
              <Checkbox
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="submit" disabled={loading || !formData.nome}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Configurações Avançadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configurações Avançadas (JSON)
          </CardTitle>
          <CardDescription>
            Configurações personalizadas em formato JSON para funcionalidades avançadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="configuracoes">Configurações JSON</Label>
              <Textarea
                id="configuracoes"
                value={typeof formData.configuracoes === 'string' 
                  ? formData.configuracoes 
                  : formData.configuracoes 
                    ? JSON.stringify(formData.configuracoes, null, 2) 
                    : ""
                }
                onChange={(e) => handleConfiguracoesChange(e.target.value)}
                placeholder='{\n  "theme": "default",\n  "printer_settings": {\n    "auto_print": true\n  },\n  "label_settings": {\n    "default_template": "standard"\n  }\n}'
                className="font-mono text-sm"
                rows={12}
              />
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>💡 <strong>Dica:</strong> Use JSON válido para configurações personalizadas</p>
                <p>🔧 Exemplos de configurações: tema, impressora padrão, templates, preferências do usuário</p>
                <p>⚠️ Deixe vazio para usar configurações padrão do sistema</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Configurações Avançadas"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="font-medium text-slate-600 dark:text-slate-400">ID da Loja:</span>
              <p className="font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs">
                {loja.id}
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-medium text-slate-600 dark:text-slate-400">Criada em:</span>
              <p className="text-slate-800 dark:text-slate-200">
                {new Date(loja.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}