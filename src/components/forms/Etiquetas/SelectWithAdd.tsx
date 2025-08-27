"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createBrowserClient } from "@/utils/supabase-client";
import { Tables } from "@/types/database.types";

type Fabricante = Tables<"fabricantes">;

interface SelectWithAddProps {
  fabricantes: Fabricante[];
  value?: string;
  onValueChange: (value: string) => void;
  onFabricantesUpdate: (fabricantes: Fabricante[]) => void;
}

export function SelectWithAdd({
  fabricantes: fabricantesInitial,
  value,
  onValueChange,
  onFabricantesUpdate,
}: SelectWithAddProps) {
  const [fabricantes, setFabricantes] = useState(fabricantesInitial);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [novoFabricante, setNovoFabricante] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const supabase = createBrowserClient();

  // Atualiza a lista quando recebe novos fabricantes do componente pai
  useEffect(() => {
    setFabricantes(fabricantesInitial);
  }, [fabricantesInitial]);

  const handleAddFabricante = async () => {
    if (!novoFabricante.trim()) {
      toast.error("Digite o nome do fabricante");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("fabricantes")
        .insert({ nome: novoFabricante.trim() })
        .select()
        .single();

      if (error) throw error;

      // Recarrega a lista completa do banco para garantir sincronização
      const { data: fabricantesAtualizados, error: fetchError } = await supabase
        .from("fabricantes")
        .select("*")
        .order('nome', { ascending: true });

      if (fetchError) {
        console.error('Erro ao recarregar fabricantes:', fetchError);
        // Fallback: usa a lista local
        const novaLista = [...fabricantes, data].sort((a, b) => 
          (a.nome || '').localeCompare(b.nome || '')
        );
        setFabricantes(novaLista);
        onFabricantesUpdate(novaLista);
      } else {
        // Usa a lista atualizada do banco
        setFabricantes(fabricantesAtualizados || []);
        onFabricantesUpdate(fabricantesAtualizados || []);
      }
      
      // Seleciona o novo fabricante
      onValueChange(data.id);
      
      toast.success("Fabricante adicionado com sucesso!");
      setNovoFabricante("");
      setIsDialogOpen(false);
      
      // Re-abre o select para mostrar o novo item após um pequeno delay
      setTimeout(() => {
        setIsSelectOpen(true);
      }, 200);
    } catch (error) {
      console.error("Erro ao adicionar fabricante:", error);
      toast.error("Erro ao adicionar fabricante");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Select 
        value={value} 
        onValueChange={onValueChange}
        open={isSelectOpen}
        onOpenChange={setIsSelectOpen}
      >
        <SelectTrigger className="h-12 sm:h-14 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 sm:px-5 text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:border-slate-400 dark:hover:border-slate-500">
          <SelectValue placeholder="Selecione um fabricante">
            {value && fabricantes.find(f => f.id === value)?.nome}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 sm:max-h-60">
          <div 
            className="flex items-center justify-between gap-2 px-3 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 cursor-pointer border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDialogOpen(true);
              setIsSelectOpen(false);
            }}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar novo fabricante
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {fabricantes.length} {fabricantes.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          {fabricantes.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Nenhum fabricante cadastrado.
              <br />
              Clique acima para adicionar.
            </div>
          ) : (
            fabricantes.map((fabricante, index) => (
              <SelectItem 
                key={`${fabricante.id}-${index}`} 
                value={fabricante.id}
                className="text-slate-900 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-3 px-4 cursor-pointer font-medium transition-colors"
              >
                {fabricante.nome || 'Sem nome'}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Fabricante</DialogTitle>
            <DialogDescription>
              Digite o nome do fabricante que deseja adicionar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={novoFabricante}
                onChange={(e) => setNovoFabricante(e.target.value)}
                className="col-span-3"
                placeholder="Nome do fabricante"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) {
                    handleAddFabricante();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleAddFabricante}
              disabled={isLoading || !novoFabricante.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}