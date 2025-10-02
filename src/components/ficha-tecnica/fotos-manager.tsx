"use client";

import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Upload, Star, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFichaTecnicaFoto } from "@/lib/storage-browser";
import { addFoto, deleteFoto, setFotoCapa } from "@/app/(app)/ficha-tecnica/actions";
import type { FichaTecnicaFoto } from "@/app/(app)/ficha-tecnica/actions";

type FotosManagerProps = {
  fichaTecnicaId: string;
  lojaId: string;
  fotos: FichaTecnicaFoto[];
  onFotosChange?: () => void;
};

export function FotosManager({
  fichaTecnicaId,
  lojaId,
  fotos: initialFotos,
  onFotosChange,
}: FotosManagerProps) {
  const [fotos, setFotos] = useState<FichaTecnicaFoto[]>(initialFotos);
  const [uploading, setUploading] = useState(false);
  const [fotoToDelete, setFotoToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FOTOS = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (fotos.length + files.length > MAX_FOTOS) {
      toast.error(`Máximo de ${MAX_FOTOS} fotos permitidas`);
      return;
    }

    setUploading(true);

    try {
      for (const file of files) {
        // Validar tamanho
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} é muito grande. Máximo: 5MB`);
          continue;
        }

        // Validar tipo
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
          toast.error(`${file.name} não é um formato válido. Use JPG, PNG ou WebP`);
          continue;
        }

        // Upload para storage
        const uploadResult = await uploadFichaTecnicaFoto(file, lojaId, fichaTecnicaId);

        if (!uploadResult.success) {
          toast.error(`Erro ao fazer upload: ${uploadResult.error}`);
          continue;
        }

        // Salvar registro no banco
        const isFirstPhoto = fotos.length === 0;
        const addResult = await addFoto({
          ficha_tecnica_id: fichaTecnicaId,
          url: uploadResult.path!,
          is_capa: isFirstPhoto, // Primeira foto é capa automaticamente
          ordem: fotos.length,
        });

        if (!addResult.success) {
          toast.error(`Erro ao salvar foto: ${addResult.error}`);
          continue;
        }

        // Atualizar lista local
        setFotos((prev) => [...prev, addResult.data]);
      }

      toast.success("Foto(s) adicionada(s) com sucesso!");
      onFotosChange?.();
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao fazer upload das fotos");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetCapa = async (fotoId: string) => {
    try {
      const result = await setFotoCapa(fotoId, fichaTecnicaId);

      if (!result.success) {
        toast.error(`Erro: ${result.error}`);
        return;
      }

      // Atualizar estado local
      setFotos((prev) =>
        prev.map((f) => ({
          ...f,
          is_capa: f.id === fotoId,
        }))
      );

      toast.success("Foto de capa definida!");
      onFotosChange?.();
    } catch (error) {
      console.error("Erro ao definir capa:", error);
      toast.error("Erro ao definir foto de capa");
    }
  };

  const handleDelete = async () => {
    if (!fotoToDelete) return;

    try {
      const result = await deleteFoto(fotoToDelete);

      if (!result.success) {
        toast.error(`Erro: ${result.error}`);
        return;
      }

      // Atualizar estado local
      setFotos((prev) => prev.filter((f) => f.id !== fotoToDelete));

      toast.success("Foto removida!");
      onFotosChange?.();
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
      toast.error("Erro ao remover foto");
    } finally {
      setFotoToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botão de Upload */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || fotos.length >= MAX_FOTOS}
          variant="outline"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Adicionar Fotos
            </>
          )}
        </Button>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {fotos.length}/{MAX_FOTOS} fotos
        </span>
      </div>

      {/* Grid de Fotos */}
      {fotos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-4">
              <ImageIcon className="h-12 w-12 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-center">
              Nenhuma foto adicionada ainda
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 text-center mt-2">
              Adicione até {MAX_FOTOS} fotos (JPG, PNG ou WebP, máx. 5MB cada)
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotos.map((foto) => (
            <Card key={foto.id} className="overflow-hidden group relative">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  {/* Imagem */}
                  <img
                    src={foto.url}
                    alt="Foto da ficha técnica"
                    className="w-full h-full object-cover"
                  />

                  {/* Badge de Capa */}
                  {foto.is_capa && (
                    <Badge
                      className="absolute top-2 left-2 bg-amber-500 text-white"
                      variant="default"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Capa
                    </Badge>
                  )}

                  {/* Botões de Ação (aparecem no hover) */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!foto.is_capa && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetCapa(foto.id!)}
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Tornar Capa
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setFotoToDelete(foto.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!fotoToDelete} onOpenChange={() => setFotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta foto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
