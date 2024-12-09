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
              placeholder: "Digite o nome Loja",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "codigo",
              label: "Código",
              placeholder: "Digite o código",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

type Loja = Tables<"lojas">;

export type LojaProps = {
  loja?: Loja & any;
};

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
      if (mode === "create") router.push("/master/lojas" + `/${result!.id}`);
      executeRevalidationPath("/master/lojas");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Loja>
      mode={mode}
      entity={loja}
      builder={formBuilder}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Lojas = {
  Update: (props: LojaProps) => <LojaForm mode="update" {...props} />,
  Create: (props: LojaProps) => <LojaForm mode="create" {...props} />,
};
