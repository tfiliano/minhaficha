import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

type SIF = Tables<"sifs">;

export type SIFProps = {
  sif?: SIF;
};

const formBuilder = () =>
  ({
    columns: [
      {
        rows: [
          {
            fields: [
              {
                name: "nome",
                label: "Nome do SIF",
                placeholder: "Digite o nome do sif",
                type: "text",
                required: true,
              },
            ],
          },
        ],
      },
    ],
  } as Builder);

function SIFForm({ mode, sif }: SIFProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: SIF) => {
    const query =
      mode === "update"
        ? supabase.from("sifs").update(data).eq("id", sif!.id)
        : supabase.from("sifs").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, SIF>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create") router.replace("/admin/sifs");
      executeRevalidationPath("/admin/sifs");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<SIF>
      mode={mode}
      entity={sif}
      tableCollection="sifs"
      builder={formBuilder()}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const SIF = {
  Create: (props: SIFProps) => <SIFForm mode="create" {...props} />,
  Update: (props: SIFProps) => <SIFForm mode="update" {...props} />,
};
