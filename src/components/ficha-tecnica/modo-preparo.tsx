"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Clock, Save, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { upsertFichaTecnica } from "@/app/(app)/ficha-tecnica/actions";

type ModoPreparoProps = {
  fichaTecnicaId?: string;
  produtoCardapioId: string;
  modoPreparo?: string;
  tempoPreparoMinutos?: number;
  porcoes?: number;
  onSave?: () => void;
};

export function ModoPreparo({
  fichaTecnicaId,
  produtoCardapioId,
  modoPreparo: initialModoPreparo,
  tempoPreparoMinutos: initialTempo,
  porcoes: initialPorcoes,
  onSave,
}: ModoPreparoProps) {
  const [modoPreparo, setModoPreparo] = useState(initialModoPreparo || "");
  const [tempoMinutos, setTempoMinutos] = useState(initialTempo?.toString() || "");
  const [porcoes, setPorcoes] = useState(initialPorcoes?.toString() || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setModoPreparo(initialModoPreparo || "");
    setTempoMinutos(initialTempo?.toString() || "");
    setPorcoes(initialPorcoes?.toString() || "");
  }, [initialModoPreparo, initialTempo, initialPorcoes]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const result = await upsertFichaTecnica({
        id: fichaTecnicaId,
        produto_cardapio_id: produtoCardapioId,
        modo_preparo: modoPreparo || undefined,
        tempo_preparo_minutos: tempoMinutos ? parseInt(tempoMinutos) : undefined,
        porcoes: porcoes ? parseFloat(porcoes) : undefined,
      });

      if (!result.success) {
        toast.error(`Erro ao salvar: ${result.error}`);
        return;
      }

      toast.success("Informações salvas com sucesso!");
      onSave?.();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar informações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card de Informações de Rendimento e Tempo */}
      <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-900/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Rendimento (Porções) */}
            <div className="space-y-2">
              <Label htmlFor="porcoes" className="text-sm font-semibold flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                Rendimento (porções)
              </Label>
              <Input
                id="porcoes"
                type="number"
                min="0"
                step="0.5"
                placeholder="Ex: 4 ou 4.5"
                value={porcoes}
                onChange={(e) => setPorcoes(e.target.value)}
                className="h-10 text-base font-medium border-orange-300 focus:border-orange-500"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Quantidade que a receita rende (pode ser fracionado)
              </p>
            </div>

            {/* Tempo de Preparo */}
            <div className="space-y-2">
              <Label htmlFor="tempo" className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                Tempo de preparo (minutos)
              </Label>
              <Input
                id="tempo"
                type="number"
                min="0"
                placeholder="Ex: 30"
                value={tempoMinutos}
                onChange={(e) => setTempoMinutos(e.target.value)}
                className="h-10 text-base font-medium border-orange-300 focus:border-orange-500"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tempo estimado de preparo em minutos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor de Modo de Preparo */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Modo de Preparo</Label>
        <RichTextEditor
          content={modoPreparo}
          onChange={setModoPreparo}
          placeholder="Descreva o passo a passo do preparo..."
        />
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-orange-600 hover:bg-orange-700">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Informações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
