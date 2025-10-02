import { Builder } from "@/components/form-builder";
import { cleanDocument } from "@/components/form-builder/@masks/clean";
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
              mask: "cnpj",
            },
          ],
        },
      ],
    },
  ],
};

type Fabricante = Tables<"fabricantes">;

export type FabricanteProps = {
  fabricante?: Fabricante;
};

function FabricanteForm({
  mode,
  fabricante,
}: FabricanteProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Fabricante) => {
    data.cnpj = cleanDocument(data.cnpj!);

    const query =
      mode === "update"
        ? supabase.from("fabricantes").update(data).eq("id", fabricante!.id)
        : supabase.from("fabricantes").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Fabricante>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create") router.push("/admin/fabricantes");
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
      tableCollection="fabricantes"
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Fabricantes = {
  Update: (props: FabricanteProps) => (
    <FabricanteForm mode="update" {...props} />
  ),
  Create: (props: FabricanteProps) => (
    <FabricanteForm mode="create" {...props} />
  ),
};
