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
    <div className="space-y-6">
      {/* Card de Tempo de Preparo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Tempo de Preparo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="tempo">Tempo estimado (em minutos)</Label>
            <Input
              id="tempo"
              type="number"
              min="0"
              placeholder="Ex: 30"
              value={tempoMinutos}
              onChange={(e) => setTempoMinutos(e.target.value)}
              className="max-w-xs"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Informe o tempo médio necessário para preparar este item
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Card de Instruções */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Instruções de Preparo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="modo-preparo">Passo a passo do preparo</Label>
            <RichTextEditor
              content={modoPreparo}
              onChange={setModoPreparo}
              placeholder="Descreva o modo de preparo detalhado com formatação rica..."
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Use a barra de ferramentas para formatar o texto (negrito, itálico, listas, etc.)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Modo de Preparo
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
