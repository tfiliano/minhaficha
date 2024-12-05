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
              name: "nome",
              label: "Nome",
              placeholder: "Digite o nome Fabricante",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "cnpj",
              label: "CNPJ",
              placeholder: "Digite o CNPJ",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

type Fabricante = Tables<"fabricantes">;

type FabricanteProps = {
  fabricante: Fabricante;
  bottomSheetController?: BottomSheetSheetController;
};

function FabricanteForm({
  mode,
  fabricante,
  bottomSheetController,
}: FabricanteProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();

  const handleSubmit = async (data: Fabricante) => {
    const query =
      mode === "update"
        ? supabase.from("fabricantes").update(data).eq("id", fabricante!.id)
        : supabase.from("fabricantes").insert(data);

    const { success, message } = await executeQuery(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/fabricantes");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Fabricante>
      mode={mode}
      entity={fabricante}
      builder={formBuilder}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
      bottomSheetController={bottomSheetController}
    />
  );
}

export const Fabricantes = {
  Update: (props: FabricanteProps) => (
    <FabricanteForm mode="create" {...props} />
  ),
  Create: (props: FabricanteProps) => (
    <FabricanteForm mode="update" {...props} />
  ),
};
