import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

const formBuilder: Builder = {
  styled: true,
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

export type OperadorProps = {
  operador?: Operador;
};

function OperadorForm({ mode, operador }: OperadorProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Operador) => {
    const query =
      mode === "update"
        ? supabase.from("operadores").update(data).eq("id", operador!.id)
        : supabase.from("operadores").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Operador>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create") router.push("/admin/operadores");
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
      tableCollection="operadores"
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Operadores = {
  Create: (props: OperadorProps) => <OperadorForm mode="create" {...props} />,
  Update: (props: OperadorProps) => <OperadorForm mode="update" {...props} />,
};
