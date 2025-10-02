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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, Star, Trash2, Image as ImageIcon, Loader2, Maximize2 } from "lucide-react";
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
  const [fotoFullscreen, setFotoFullscreen] = useState<FichaTecnicaFoto | null>(null);
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
      <div className="flex items-center justify-center gap-2 sm:gap-4">
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
          size="sm"
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md sm:px-4"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              <span className="text-xs sm:text-sm">Enviando...</span>
            </>
          ) : (
            <>
              <Upload className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline text-sm">Adicionar Fotos</span>
              <span className="sm:hidden text-xs">Fotos</span>
            </>
          )}
        </Button>
        <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
          {fotos.length}/{MAX_FOTOS}
        </Badge>
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
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {fotos.map((foto) => (
            <Card key={foto.id} className="overflow-hidden group relative">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  {/* Imagem */}
                  <img
                    src={foto.url}
                    alt="Foto da ficha técnica"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setFotoFullscreen(foto)}
                  />

                  {/* Badge de Capa */}
                  {foto.is_capa && (
                    <Badge
                      className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] px-1 py-0"
                      variant="default"
                    >
                      <Star className="h-2 w-2 mr-0.5" />
                      Capa
                    </Badge>
                  )}

                  {/* Botões de Ação (aparecem no hover) */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setFotoFullscreen(foto)}
                      className="h-7 w-7 p-0"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    {!foto.is_capa && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetCapa(foto.id!)}
                        className="h-7 w-7 p-0"
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setFotoToDelete(foto.id!)}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Visualização em Tela Cheia */}
      <Dialog open={!!fotoFullscreen} onOpenChange={() => setFotoFullscreen(null)}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Visualização da Foto
              {fotoFullscreen?.is_capa && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Capa
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full">
            <img
              src={fotoFullscreen?.url}
              alt="Foto em tela cheia"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {!fotoFullscreen?.is_capa && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (fotoFullscreen?.id) {
                    handleSetCapa(fotoFullscreen.id);
                    setFotoFullscreen(null);
                  }
                }}
              >
                <Star className="h-3 w-3 mr-1" />
                Definir como Capa
              </Button>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (fotoFullscreen?.id) {
                  setFotoToDelete(fotoFullscreen.id);
                  setFotoFullscreen(null);
                }
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
