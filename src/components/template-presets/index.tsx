"use client";

import { createLabelTemplate } from "@/app/(admin)/admin/templates/etiquetas/actions";
import { FieldPosition } from "@/app/(admin)/admin/templates/etiquetas/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

interface TemplatePresetDialogProps {
  onSelect: (template: FieldPosition[]) => void;
  onCancel: () => void;
}

export function TemplatePresetDialog({
  onSelect,
  onCancel,
}: TemplatePresetDialogProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleTemplateSelect = async (
    type: "produto" | "envio" | "inventario" | "personalizado"
  ) => {
    try {
      setLoading(type);
      // Agora lidamos corretamente com a função assíncrona
      const template = await createLabelTemplate(type);
      onSelect(template);
    } catch (error) {
      console.error("Erro ao carregar template:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-[700px] max-w-[95vw]">
        <h3 className="text-lg font-semibold mb-4">
          Selecione um Modelo de Etiqueta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className="p-4 hover:border-primary cursor-pointer flex flex-col items-center text-center h-48 relative"
            onClick={() => handleTemplateSelect("produto")}
          >
            {loading === "produto" && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <LoaderCircle className="h-6 w-6 animate-spin" />
              </div>
            )}
            <div className="bg-gray-100 w-full h-20 mb-2 rounded flex items-center justify-center text-sm">
              <div className="w-32 h-16 border border-gray-400 relative">
                <div className="absolute top-1 left-1 right-1 bg-black h-3"></div>
                <div className="absolute top-5 left-1 w-20 h-2 bg-gray-400"></div>
                <div className="absolute top-8 left-1 w-16 h-2 bg-gray-400"></div>
                <div className="absolute bottom-3 left-1 w-24 h-1 bg-gray-400"></div>
                <div className="absolute right-2 bottom-3 w-4 h-4 bg-gray-700"></div>
              </div>
            </div>
            <span className="text-sm font-medium">Produto/Alimento</span>
            <p className="text-xs text-muted-foreground mt-1">
              Similar ao exemplo da imagem
            </p>
          </Card>

          <Card
            className="p-4 hover:border-primary cursor-pointer flex flex-col items-center text-center h-48 relative"
            onClick={() => handleTemplateSelect("envio")}
          >
            {loading === "envio" && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <LoaderCircle className="h-6 w-6 animate-spin" />
              </div>
            )}
            <div className="bg-gray-100 w-full h-20 mb-2 rounded flex items-center justify-center text-sm">
              <div className="w-32 h-16 border border-gray-400 relative">
                <div className="absolute top-1 left-1 right-1 h-2 bg-gray-700"></div>
                <div className="absolute top-5 left-1 w-10 h-1 bg-gray-400"></div>
                <div className="absolute top-5 left-12 w-16 h-1 bg-gray-400"></div>
                <div className="absolute top-8 left-12 w-14 h-1 bg-gray-400"></div>
                <div className="absolute bottom-1 left-1 right-1 h-2 bg-gray-500"></div>
              </div>
            </div>
            <span className="text-sm font-medium">Envio/Transporte</span>
            <p className="text-xs text-muted-foreground mt-1">
              Para etiquetas de remessa/entrega
            </p>
          </Card>

          <Card
            className="p-4 hover:border-primary cursor-pointer flex flex-col items-center text-center h-48 relative"
            onClick={() => handleTemplateSelect("inventario")}
          >
            {loading === "inventario" && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <LoaderCircle className="h-6 w-6 animate-spin" />
              </div>
            )}
            <div className="bg-gray-100 w-full h-20 mb-2 rounded flex items-center justify-center text-sm">
              <div className="w-32 h-16 border border-gray-400 relative">
                <div className="absolute top-1 left-1 right-1 text-center">
                  <div className="h-2 bg-gray-700 w-24 mx-auto"></div>
                </div>
                <div className="absolute top-5 left-1 w-5 h-1 bg-gray-400"></div>
                <div className="absolute top-5 left-7 w-12 h-1 bg-gray-400"></div>
                <div className="absolute top-8 left-1 w-5 h-1 bg-gray-400"></div>
                <div className="absolute top-8 left-7 w-10 h-1 bg-gray-400"></div>
                <div className="absolute right-2 top-4 bottom-4 w-6 bg-gray-500"></div>
              </div>
            </div>
            <span className="text-sm font-medium">Inventário/Estoque</span>
            <p className="text-xs text-muted-foreground mt-1">
              Para controle de estoque e catalogação
            </p>
          </Card>

          <Card
            className="p-4 hover:border-primary cursor-pointer flex flex-col items-center text-center h-48"
            onClick={() => onSelect([])}
          >
            <div className="bg-gray-100 w-full h-20 mb-2 rounded flex items-center justify-center text-sm">
              <div className="w-32 h-16 border border-gray-400 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Em branco</span>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium">Template em Branco</span>
            <p className="text-xs text-muted-foreground mt-1">
              Comece a partir do zero
            </p>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
