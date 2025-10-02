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

type Armazenamento = {
  id: string;
  armazenamento: string | null;
  metodo: string | null;
};

type SelectWithAddArmazenamentoProps = {
  armazenamentos: Armazenamento[];
  formField?: any;
  onArmazenamentoAdded?: (armazenamento: Armazenamento) => void;
};

export function SelectWithAddArmazenamento({
  armazenamentos: armazenamentosInitial,
  formField,
  onArmazenamentoAdded,
}: SelectWithAddArmazenamentoProps) {
  const value = formField?.value;
  const onChange = formField?.onChange;
  const [armazenamentos, setArmazenamentos] = useState(armazenamentosInitial);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [novoArmazenamento, setNovoArmazenamento] = useState({
    armazenamento: "",
    metodo: "",
  });

  const handleAdd = async () => {
    if (!novoArmazenamento.armazenamento.trim()) {
      toast.error("Digite o nome do local de armazenamento");
      return;
    }

    setIsSubmitting(true);
    const supabase = createBrowserClient();

    try {
      const { data, error } = await supabase
        .from("locais_armazenamento")
        .insert({
          armazenamento: novoArmazenamento.armazenamento.trim(),
          metodo: novoArmazenamento.metodo.trim() || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao criar armazenamento:", error);
        toast.error("Erro ao criar armazenamento: " + error.message);
        return;
      }

      toast.success("Local de armazenamento criado com sucesso!");

      // Adicionar o novo armazenamento à lista local
      setArmazenamentos([...armazenamentos, data]);

      // Chamar callback se fornecido
      if (onArmazenamentoAdded) {
        onArmazenamentoAdded(data);
      }

      if (data?.id && onChange) {
        onChange(data.id);
      }

      setIsDialogOpen(false);
      setNovoArmazenamento({
        armazenamento: "",
        metodo: "",
      });
    } catch (error) {
      console.error("Erro ao criar armazenamento:", error);
      toast.error("Erro ao criar armazenamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione onde será armazenado" />
          </SelectTrigger>
          <SelectContent>
            {armazenamentos.map((arm) => (
              <SelectItem key={arm.id} value={arm.id}>
                {arm.armazenamento || "Sem nome"}
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
        title="Adicionar novo local de armazenamento"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Local de Armazenamento</DialogTitle>
            <DialogDescription>
              Cadastre um novo local de armazenamento rapidamente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="armazenamento">Local de Armazenamento *</Label>
              <Input
                id="armazenamento"
                placeholder="Ex: Geladeira, Freezer, Prateleira"
                value={novoArmazenamento.armazenamento}
                onChange={(e) =>
                  setNovoArmazenamento({
                    ...novoArmazenamento,
                    armazenamento: e.target.value,
                  })
                }
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metodo">Método (opcional)</Label>
              <Input
                id="metodo"
                placeholder="Ex: Refrigerado, Congelado, Seco"
                value={novoArmazenamento.metodo}
                onChange={(e) =>
                  setNovoArmazenamento({
                    ...novoArmazenamento,
                    metodo: e.target.value,
                  })
                }
              />
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
              disabled={isSubmitting || !novoArmazenamento.armazenamento.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
