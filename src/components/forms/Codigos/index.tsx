import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

type Codigo = Tables<"codigos">;

export type CodigosProps = {
  codigo?: Codigo;
};

const formBuilder = () =>
  ({
    columns: [
      {
        rows: [
          {
            fields: [
              {
                name: "code",
                label: "Codigo",
                placeholder: "Digite o codigo",
                type: "text",
                required: true,
              },
            ],
          },
        ],
      },
    ],
  } as Builder);

function CodigoForm({ mode, codigo }: CodigosProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Codigo) => {
    const query =
      mode === "update"
        ? supabase.from("codigos").update(data).eq("id", codigo!.id)
        : supabase.from("codigos").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Codigo>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create")
        router.replace("/admin/codigos" + `/${result!.id}`);
      executeRevalidationPath("/admin/codigos");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Codigo>
      mode={mode}
      entity={codigo}
      tableCollection="codigos"
      builder={formBuilder()}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Codigo = {
  Create: (props: CodigosProps) => <CodigoForm mode="create" {...props} />,
  Update: (props: CodigosProps) => <CodigoForm mode="update" {...props} />,
};
