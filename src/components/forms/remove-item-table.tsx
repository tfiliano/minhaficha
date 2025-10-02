"use client";

import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/utils/supabase-client";
import { Lock, Trash } from "lucide-react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { TableCollection } from ".";
import { AlertDialogConfirm } from "../form-builder/alert-dialog-confirm";
import { Button } from "../ui/button";

type EntityWithId = {
  id: string | number;
};

type ButtonRemoveProps<T> = {
  tableCollection: TableCollection;
  entity: T | undefined;
  keyProp?: string;
};

export function ButtonRemoveItem<T>({
  tableCollection,
  entity,
  keyProp,
}: ButtonRemoveProps<T>) {
  const router = useRouter();
  const pathname = usePathname();

  const IS_DISABLED = tableCollection.includes("lojas");

  const DIALOG_MESSAGES = {
    remove: {
      title: "Remoção de conteudo",
      description:
        "Tem certeza de que deseja remove? Todas as informações e registros associados a esse conteudo serão removidos permanentemente e esta ação não poderá ser desfeita.",
      button: "Remover",
      icon: Trash,
    },
    disabled: {
      title: "Desativar",
      description:
        "Tem certeza de que deseja desativar este conteúdo? Todas as informações e registros permanecerão armazenados, mas o acesso será bloqueado.",
      button:
        (entity as any)?.ativo || (entity as any)?.is_active
          ? "Desativar"
          : "Ativar",
      icon: Lock,
    },
  };

  if (!entity) return <div className="hidden">Entity not found in props</div>;

  let dialogProps = DIALOG_MESSAGES["remove"];

  if (IS_DISABLED) {
    dialogProps = DIALOG_MESSAGES["disabled"];
  }

  const handleAction = async () => {
    const doc = entity as unknown as EntityWithId;
    const supabase = createBrowserClient();
    const query = supabase.from(tableCollection);
    const queryHandle = IS_DISABLED
      ? query.update({ ativo: !(entity as any).ativo })
      : query.delete();
    const processQuery = queryHandle.eq(
      keyProp || "id",
      (entity as Record<string, any>)["id"] as string
    );
    const { success, message } = await executeQuery<typeof processQuery, T>(
      () => processQuery
    );

    const toastId = toast.loading(
      !(entity as any)?.ativo ? "Ativando" : "Desativando",
      {
        cancel: false,
      }
    );

    if (success) {
      const pathName = pathname.split("/").slice(0, -1).join("/");
      toast.success(message, { id: toastId });
      await executeRevalidationPath(pathName);
      router.replace(pathName);
    } else {
      toast.error(message, { id: toastId });
    }
  };

  return (
    <AlertDialogConfirm {...dialogProps} handleAction={handleAction}>
      <Button
        className={cn(
          "h-9 px-4 text-sm font-medium border transition-all duration-200 gap-2 w-full sm:w-auto",
          {
            "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20":
              !IS_DISABLED ||
              ((entity as any)?.ativo || (entity as any)?.is_active),
            "border-green-300 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/20":
              IS_DISABLED &&
              !(entity as any)?.ativo &&
              !(entity as any)?.is_active,
          }
        )}
        variant="outline"
      >
        <dialogProps.icon className="h-4 w-4" />
        {dialogProps.button}
      </Button>
    </AlertDialogConfirm>
  );
}
