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
              placeholder: "Digite o nome Operador",
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
      ],
    },
  ],
};

type Operador = Tables<"operadores">;

type OperadorProps = {
  operador: Operador;
  bottomSheetController?: BottomSheetSheetController;
};

function OperadorForm({
  mode,
  operador,
  bottomSheetController,
}: OperadorProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const handleSubmit = async (data: Operador) => {
    const query =
      mode === "update"
        ? supabase.from("operadores").update(data).eq("id", operador!.id)
        : supabase.from("operadores").insert(data);

    const { success, message } = await executeQuery(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/operadores");
    } else {
      toast.error(message);
    }
  };
  return (
    <EntityFormHandler<Operador>
      mode={mode}
      entity={operador}
      builder={formBuilder}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
      bottomSheetController={bottomSheetController}
    />
  );
}

export const Operadores = {
  Create: (props: OperadorProps) => <OperadorForm mode="create" {...props} />,
  Update: (props: OperadorProps) => <OperadorForm mode="update" {...props} />,
};
