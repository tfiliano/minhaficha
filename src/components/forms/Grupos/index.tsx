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
              placeholder: "Digite o nome do Grupo",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "cor_botao",
              label: "Cor do Botao",
              placeholder: "Digite a Cor do Botão",
              type: "color",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "cor_fonte",
              label: "Cor da Fonte",
              placeholder: "Digite a Cor da Fonte",
              type: "color",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "icone",
              label: "Icone",
              placeholder: "Digite o Icone",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

type Grupo = Tables<"grupos">;

type GrupoProps = {
  grupo: Grupo;
  bottomSheetController?: BottomSheetSheetController;
};

function GrupoForm({
  mode,
  grupo,
  bottomSheetController,
}: GrupoProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();

  const handleSubmit = async (data: Grupo) => {
    const query =
      mode === "update"
        ? supabase.from("grupos").update(data).eq("id", grupo!.id)
        : supabase.from("grupos").insert(data);

    const { success, message } = await executeQuery(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/grupos");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Grupo>
      mode={mode}
      entity={grupo}
      builder={formBuilder}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
      bottomSheetController={bottomSheetController}
    />
  );
}

export const Grupos = {
  Create: (props: GrupoProps) => <GrupoForm mode="create" {...props} />,
  Update: (props: GrupoProps) => <GrupoForm mode="update" {...props} />,
};
