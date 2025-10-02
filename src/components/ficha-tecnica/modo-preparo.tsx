"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Clock, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { upsertFichaTecnica } from "@/app/(app)/ficha-tecnica/actions";

type ModoPreparoProps = {
  fichaTecnicaId?: string;
  produtoCardapioId: string;
  modoPreparo?: string;
  tempoPreparoMinutos?: number;
  onSave?: () => void;
};

export function ModoPreparo({
  fichaTecnicaId,
  produtoCardapioId,
  modoPreparo: initialModoPreparo,
  tempoPreparoMinutos: initialTempo,
  onSave,
}: ModoPreparoProps) {
  const [modoPreparo, setModoPreparo] = useState(initialModoPreparo || "");
  const [tempoMinutos, setTempoMinutos] = useState(initialTempo?.toString() || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setModoPreparo(initialModoPreparo || "");
    setTempoMinutos(initialTempo?.toString() || "");
  }, [initialModoPreparo, initialTempo]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const result = await upsertFichaTecnica({
        id: fichaTecnicaId,
        produto_cardapio_id: produtoCardapioId,
        modo_preparo: modoPreparo || undefined,
        tempo_preparo_minutos: tempoMinutos ? parseInt(tempoMinutos) : undefined,
      });

      if (!result.success) {
        toast.error(`Erro ao salvar: ${result.error}`);
        return;
      }

      toast.success("Modo de preparo salvo com sucesso!");
      onSave?.();
    } catch (error) {
      console.error("Erro ao salvar modo de preparo:", error);
      toast.error("Erro ao salvar modo de preparo");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tempo de Preparo - Compacto */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-slate-500 flex-shrink-0" />
        <Label htmlFor="tempo" className="text-sm flex-shrink-0">Tempo (min)</Label>
        <Input
          id="tempo"
          type="number"
          min="0"
          placeholder="30"
          value={tempoMinutos}
          onChange={(e) => setTempoMinutos(e.target.value)}
          className="w-24 h-8 text-sm"
        />
      </div>

      {/* Editor de Modo de Preparo */}
      <div className="space-y-2">
        <RichTextEditor
          content={modoPreparo}
          onChange={setModoPreparo}
          placeholder="Descreva o modo de preparo..."
        />
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="sm">
          {saving ? (
            <>
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              <span className="text-xs">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="mr-1 h-3 w-3" />
              <span className="text-xs sm:text-sm">Salvar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
