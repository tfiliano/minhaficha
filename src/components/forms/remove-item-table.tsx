"use client";

import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { createBrowserClient } from "@/utils/supabase-client";
import { Trash } from "lucide-react";
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
};

export function ButtonRemoveItem<T>({
  tableCollection,
  entity,
}: ButtonRemoveProps<T>) {
  const router = useRouter();
  const pathname = usePathname();

  if (!entity) return <div className="hidden">Entity not found in props</div>;

  const handleAction = async () => {
    const { id } = entity as unknown as EntityWithId;

    const supabase = createBrowserClient();
    const query = supabase.from(tableCollection).delete().eq("id", id);

    const { success, message } = await executeQuery<typeof query, T>(
      () => query
    );

    if (success) {
      const pathName = pathname.split("/").slice(0, -1).join("/");
      toast.success(message);
      executeRevalidationPath(pathName);
      router.replace(pathName);
    } else {
      toast.error(message);
    }
  };

  return (
    <>
      <AlertDialogConfirm
        title="Remoção de conteudo"
        description="Tem certeza de que deseja remove? Todas as
                  informações e registros associados a esse conteudo serão removidos
                  permanentemente e esta ação não poderá ser desfeita."
        handleAction={handleAction}
      >
        <Button
          className="w-full my-4 flex items-center justify-center gap-2 text-red-500 hover:text-red-800 group hover:bg-transparent"
          variant="link"
        >
          <Trash size={18} />
          Remover
        </Button>
      </AlertDialogConfirm>
    </>
  );
}
