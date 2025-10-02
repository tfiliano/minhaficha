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

type Setor = {
  nome: string;
};

type SelectWithAddSetorProps = {
  setores: Setor[];
  formField?: any;
};

export function SelectWithAddSetor({
  setores: setoresInitial,
  formField,
}: SelectWithAddSetorProps) {
  const value = formField?.value;
  const onChange = formField?.onChange;
  const [setores, setSetores] = useState(setoresInitial);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [novoSetor, setNovoSetor] = useState({
    nome: "",
    cor_botao: "#10b981",
    cor_fonte: "#ffffff",
  });

  const handleAdd = async () => {
    if (!novoSetor.nome.trim()) {
      toast.error("Digite o nome do setor");
      return;
    }

    setIsSubmitting(true);
    const supabase = createBrowserClient();

    try {
      const { data, error } = await supabase
        .from("setores")
        .insert({
          nome: novoSetor.nome.trim(),
          cor_botao: novoSetor.cor_botao,
          cor_fonte: novoSetor.cor_fonte,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar setor:", error);
        toast.error("Erro ao criar setor: " + error.message);
        return;
      }

      toast.success("Setor criado com sucesso!");

      // Adicionar o novo setor à lista local
      setSetores([...setores, { nome: data.nome || "" }]);

      if (data?.nome && onChange) {
        onChange(data.nome);
      }

      setIsDialogOpen(false);
      setNovoSetor({
        nome: "",
        cor_botao: "#10b981",
        cor_fonte: "#ffffff",
      });
    } catch (error) {
      console.error("Erro ao criar setor:", error);
      toast.error("Erro ao criar setor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o setor" />
          </SelectTrigger>
          <SelectContent>
            {setores.map((setor) => (
              <SelectItem key={setor.nome} value={setor.nome}>
                {setor.nome}
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
        title="Adicionar novo setor"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Setor</DialogTitle>
            <DialogDescription>
              Cadastre um novo setor rapidamente sem sair do cadastro
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome-setor">Nome do Setor *</Label>
              <Input
                id="nome-setor"
                placeholder="Ex: Açougue, Padaria, Hortifruti"
                value={novoSetor.nome}
                onChange={(e) =>
                  setNovoSetor({ ...novoSetor, nome: e.target.value })
                }
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cor-botao-setor">Cor do Botão</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor-botao-setor"
                    type="color"
                    value={novoSetor.cor_botao}
                    onChange={(e) =>
                      setNovoSetor({ ...novoSetor, cor_botao: e.target.value })
                    }
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={novoSetor.cor_botao}
                    onChange={(e) =>
                      setNovoSetor({ ...novoSetor, cor_botao: e.target.value })
                    }
                    placeholder="#10b981"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor-fonte-setor">Cor da Fonte</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor-fonte-setor"
                    type="color"
                    value={novoSetor.cor_fonte}
                    onChange={(e) =>
                      setNovoSetor({ ...novoSetor, cor_fonte: e.target.value })
                    }
                    className="w-16 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={novoSetor.cor_fonte}
                    onChange={(e) =>
                      setNovoSetor({ ...novoSetor, cor_fonte: e.target.value })
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
                  backgroundColor: novoSetor.cor_botao,
                  color: novoSetor.cor_fonte,
                }}
              >
                {novoSetor.nome || "Nome do Setor"}
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
              onClick={handleAdd}
              disabled={isSubmitting || !novoSetor.nome.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Setor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
