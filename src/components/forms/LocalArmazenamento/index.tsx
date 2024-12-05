import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

const formBuilder: Builder = {
  columns: [
    {
      rows: [
        {
          fields: [
            {
              name: "armazenamento",
              label: "Local Armazanamento",
              placeholder: "Digite o código do Local Armazanamento",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "metodo",
              label: "Metodo",
              placeholder: "Digite o metodo",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

type LocalArmazenamento = Tables<"locais_armazenamento">;

export type LocalArmazenamentoProps = {
  localArmazenamento?: LocalArmazenamento;
};

function LocalArmazenamentoForm({
  mode,
  localArmazenamento,
}: LocalArmazenamentoProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: LocalArmazenamento) => {
    const query =
      mode === "update"
        ? supabase
            .from("locais_armazenamento")
            .update(data)
            .eq("id", localArmazenamento!.id)
        : supabase
            .from("locais_armazenamento")
            .insert(data)
            .select()
            .maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, LocalArmazenamento>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create")
        router.push("/admin/armazenamentos" + `${result!.id}`);
      executeRevalidationPath("/admin/armazenamentos");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<LocalArmazenamento>
      mode={mode}
      entity={localArmazenamento}
      builder={formBuilder}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const LocalArmazenamento = {
  Create: (props: LocalArmazenamentoProps) => (
    <LocalArmazenamentoForm mode="create" {...props} />
  ),
  Update: (props: LocalArmazenamentoProps) => (
    <LocalArmazenamentoForm mode="update" {...props} />
  ),
};
