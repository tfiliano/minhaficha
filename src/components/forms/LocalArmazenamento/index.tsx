import { BottomSheetSheetController } from "@/components/bottom-sheet";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

const formBuilder = {
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

type LocalArmazenamentoProps = {
  localArmazenamento: LocalArmazenamento;
  bottomSheetController?: BottomSheetSheetController;
};

function LocalArmazenamentoForm({
  mode,
  localArmazenamento,
  bottomSheetController,
}: LocalArmazenamentoProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();

  const handleSubmit = async (data: LocalArmazenamento) => {
    const query =
      mode === "update"
        ? supabase
            .from("locais_armazenamento")
            .update(data)
            .eq("id", localArmazenamento!.id)
        : supabase.from("locais_armazenamento").insert(data);

    const { success, message } = await executeQuery(() => query);

    if (success) {
      toast.success(message);
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
      bottomSheetController={bottomSheetController}
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
