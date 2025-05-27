import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

type Impressora = Tables<"impressoras">;

export type ImpressoraProps = {
  impressora?: Impressora;
};

const formBuilder = () =>
  ({
    columns: [
      {
        rows: [
          {
            fields: [
              {
                name: "nome",
                label: "Nome do Impressora",
                placeholder: "Digite o nome do impressora",
                type: "text",
                required: true,
              },
            ],
          },
        ],
      },
    ],
  } as Builder);

function ImpressoraForm({
  mode,
  impressora,
}: ImpressoraProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Impressora) => {
    const query =
      mode === "update"
        ? supabase.from("impressoras").update(data).eq("id", impressora!.id)
        : supabase.from("impressoras").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Impressora>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create") router.replace("/admin/impressoras");
      executeRevalidationPath("/admin/impressoras");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Impressora>
      mode={mode}
      entity={impressora}
      tableCollection="impressoras"
      builder={formBuilder()}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Impressora = {
  Create: (props: ImpressoraProps) => (
    <ImpressoraForm mode="create" {...props} />
  ),
  Update: (props: ImpressoraProps) => (
    <ImpressoraForm mode="update" {...props} />
  ),
};
