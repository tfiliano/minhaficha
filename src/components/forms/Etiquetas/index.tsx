import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

const formBuilder = (fabricantes: Fabricante[]) =>
  ({
    columns: [
      {
        rows: [
          {
            fields: [
              {
                name: "validade",
                label: "Validade",
                placeholder: "Validade",
                type: "date",
                required: true,
              },
            ],
          },
          {
            fields: [
              {
                name: "fornecedor_id",
                label: "Fabricante",
                placeholder: "Selecione",
                type: "select",
                required: true,
                options: fabricantes.map((fabricante) => ({
                  value: fabricante.id,
                  label: fabricante.nome,
                })),
              },
            ],
          },
          {
            fields: [
              {
                name: "lote",
                label: "Lote",
                placeholder: "Digite o LOTE",
                type: "text",
                required: true,
              },
            ],
          },
          {
            fields: [
              {
                name: "SIF",
                label: "S.I.F",
                placeholder: "Digite o S.I.F",
                type: "text",
                required: true,
              },
            ],
          },
          {
            fields: [
              {
                name: "quantidade",
                label: "Quantidade",
                placeholder: "Digite a quantidade",
                type: "number",
                required: true,
              },
            ],
          },
        ],
      },
    ],
  } as Builder);

type Etiqueta = Tables<"etiquetas">;
type Fabricante = Tables<"fabricantes">;

export type EtiquetaProps = {
  etiqueta?: Etiqueta;
  fabricantes: Fabricante[];
};

function EtiquetaForm({
  mode,
  etiqueta,
  fabricantes,
}: EtiquetaProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Etiqueta) => {
    const query =
      mode === "update"
        ? supabase.from("etiquetas").update(data).eq("id", etiqueta!.id)
        : supabase.from("etiquetas").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Etiqueta>(() => query);

    if (success) {
      console.log(result);
      toast.success(message);
      if (mode === "create") router.push(`/admin/etiquetas/${result!.id}`);
      executeRevalidationPath("/admin/etiquetas");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Etiqueta>
      mode={mode}
      entity={etiqueta}
      builder={formBuilder(fabricantes)}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Etiquetas = {
  Update: (props: EtiquetaProps) => <EtiquetaForm mode="update" {...props} />,
  Create: (props: EtiquetaProps) => <EtiquetaForm mode="create" {...props} />,
};
