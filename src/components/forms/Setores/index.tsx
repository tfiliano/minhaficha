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
              name: "nome",
              label: "Nome",
              placeholder: "Digite o nome do Setor",
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

type Setor = Tables<"setores">;

export type SetorProps = {
  setor?: Setor;
};

function SetorForm({ mode, setor }: SetorProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Setor) => {
    const query =
      mode === "update"
        ? supabase.from("setores").update(data).eq("id", setor!.id)
        : supabase.from("setores").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Setor>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create") router.push("/admin/setores");
      executeRevalidationPath("/admin/setores");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Setor>
      mode={mode}
      entity={setor}
      builder={formBuilder}
      onSubmit={handleSubmit}
      tableCollection="setores"
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Setores = {
  Create: (props: SetorProps) => <SetorForm mode="create" {...props} />,
  Update: (props: SetorProps) => <SetorForm mode="update" {...props} />,
};
