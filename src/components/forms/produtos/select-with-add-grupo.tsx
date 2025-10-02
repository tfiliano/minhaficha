"use client";

import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Grupo = {
  id: string;
  nome: string | null;
};

type SelectWithAddGrupoProps = {
  grupos: Grupo[];
  formField?: any;
  onGrupoAdded?: (grupo: Grupo) => void;
};

export function SelectWithAddGrupo({
  grupos: gruposInitial,
  formField,
  onGrupoAdded,
}: SelectWithAddGrupoProps) {
  const value = formField?.value;
  const onChange = formField?.onChange;
  const [grupos, setGrupos] = useState(gruposInitial);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [novoGrupo, setNovoGrupo] = useState({
    nome: "",
    cor_botao: "#3b82f6",
    cor_fonte: "#ffffff",
  });

  const handleAddGrupo = async () => {
    if (!novoGrupo.nome.trim()) {
      toast.error("Digite o nome do grupo");
      return;
    }

    setIsSubmitting(true);
    const supabase = createBrowserClient();

    try {
      console.log("Tentando criar grupo:", novoGrupo);

      const { data, error } = await supabase
        .from("grupos")
        .insert({
          nome: novoGrupo.nome.trim(),
          cor_botao: novoGrupo.cor_botao,
          cor_fonte: novoGrupo.cor_fonte,
        })
        .select()
        .single();

      console.log("Resposta do Supabase:", { data, error });

      if (error) {
        console.error("Erro ao criar grupo:", error);
        toast.error("Erro ao criar grupo: " + error.message);
        setIsSubmitting(false);
        return;
      }

      if (!data) {
        console.error("Nenhum dado retornado do Supabase");
        toast.error("Erro: Nenhum dado retornado");
        setIsSubmitting(false);
        return;
      }

      console.log("Grupo criado com sucesso:", data);
      toast.success("Grupo criado com sucesso!");

      // Adicionar o novo grupo à lista local
      setGrupos([...grupos, data]);

      // Selecionar o grupo recém-criado
      if (data.id && onChange) {
        onChange(data.id);
      }

      // Chamar callback se fornecido
      if (onGrupoAdded) {
        onGrupoAdded(data);
      }

      // Fechar modal e resetar form
      setIsDialogOpen(false);
      setNovoGrupo({
        nome: "",
        cor_botao: "#3b82f6",
        cor_fonte: "#ffffff",
      });
    } catch (error) {
      console.error("Erro exception ao criar grupo:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao criar grupo: " + errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o grupo" />
          </SelectTrigger>
          <SelectContent>
            {grupos.map((grupo) => (
              <SelectItem key={grupo.id} value={grupo.id}>
                {grupo.nome || "Sem nome"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
        title="Adicionar novo grupo"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Grupo</DialogTitle>
            <DialogDescription>
              Crie um novo grupo rapidamente sem sair do cadastro
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome-grupo">Nome do Grupo *</Label>
              <Input
                id="nome-grupo"
                placeholder="Ex: Carnes, Laticínios, Hortifruti"
                value={novoGrupo.nome}
                onChange={(e) =>
                  setNovoGrupo({ ...novoGrupo, nome: e.target.value })
                }
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cor-botao">Cor do Botão</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor-botao"
                    type="color"
                    value={novoGrupo.cor_botao}
                    onChange={(e) =>
                      setNovoGrupo({ ...novoGrupo, cor_botao: e.target.value })
                    }
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={novoGrupo.cor_botao}
                    onChange={(e) =>
                      setNovoGrupo({ ...novoGrupo, cor_botao: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor-fonte">Cor da Fonte</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor-fonte"
                    type="color"
                    value={novoGrupo.cor_fonte}
                    onChange={(e) =>
                      setNovoGrupo({ ...novoGrupo, cor_fonte: e.target.value })
                    }
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={novoGrupo.cor_fonte}
                    onChange={(e) =>
                      setNovoGrupo({ ...novoGrupo, cor_fonte: e.target.value })
                    }
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className="p-4 rounded-lg text-center font-medium"
                style={{
                  backgroundColor: novoGrupo.cor_botao,
                  color: novoGrupo.cor_fonte,
                }}
              >
                {novoGrupo.nome || "Nome do Grupo"}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddGrupo}
              disabled={isSubmitting || !novoGrupo.nome.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Grupo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
