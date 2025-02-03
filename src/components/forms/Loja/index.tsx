import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

type Loja = Tables<"lojas">;

export type LojaProps = {
  loja?: Loja & { usuarios: any[] };
};

const formBuilder = () =>
  ({
    columns: [
      {
        rows: [
          {
            fields: [
              {
                name: "codigo",
                label: "Codigio",
                placeholder: "Digite o codigo",
                type: "text",
                required: true,
              },
              {
                name: "nome",
                label: "Nome da loja",
                placeholder: "Digite o nome",
                type: "text",
                required: true,
              },
            ],
          },
        ],
      },
    ],
  } as Builder);

function LojaForm({ mode, loja }: LojaProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Loja) => {
    const query =
      mode === "update"
        ? supabase.from("lojas").update(data).eq("id", loja!.id)
        : supabase.from("lojas").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Loja>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create")
        router.replace("/dashboard/lojas" + `/${result!.id}`);
      executeRevalidationPath("/dashboard/lojs");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Loja>
      mode={mode}
      entity={loja}
      tableCollection="lojas"
      builder={formBuilder()}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Loja = {
  Create: (props: LojaProps) => <LojaForm mode="create" {...props} />,
  Update: (props: LojaProps) => <LojaForm mode="update" {...props} />,
};
