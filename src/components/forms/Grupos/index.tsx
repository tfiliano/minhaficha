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

export type GrupoProps = {
  grupo?: Grupo;
};

function GrupoForm({ mode, grupo }: GrupoProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Grupo) => {
    const query =
      mode === "update"
        ? supabase.from("grupos").update(data).eq("id", grupo!.id)
        : supabase.from("grupos").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Grupo>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create") router.push("/admin/grupos");
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
      tableCollection="grupos"
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Grupos = {
  Create: (props: GrupoProps) => <GrupoForm mode="create" {...props} />,
  Update: (props: GrupoProps) => <GrupoForm mode="update" {...props} />,
};
