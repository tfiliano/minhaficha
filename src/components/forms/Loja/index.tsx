import { Builder, FormBuilderRef } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { getDocumentCompany } from "@/lib/brasil/get-document-company";
import { getPostalCode } from "@/lib/brasil/get-postal-code";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { useRef } from "react";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

type Loja = Tables<"lojas">;

export type LojaProps = {
  loja?: Loja & { usuarios: any[] };
};

const formBuilder = (formRef: any) =>
  ({
    columns: [
      {
        rows: [
          {
            fields: [
              {
                name: "registration_number",
                label: "CNPJ",
                placeholder: "Documento da loja",
                type: "tel",
                onChangeCapture: getDocumentCompany(formRef),
              },
            ],
          },
          {
            fields: [
              {
                name: "codigo",
                label: "Código",
                placeholder: "Digite o codigo",
                type: "text",
                required: true,
              },
              {
                name: "nome",
                label: "Nome da loja",
                placeholder: "Digite o nome",
                type: "text",
                required: true,
              },
            ],
          },
          {
            fields: [
              {
                name: "address.cep",
                label: "CEP",
                placeholder: "CEP",
                type: "text",
                onChangeCapture: getPostalCode(formRef),
              },
            ],
          },
          {
            fields: [
              {
                name: "address.street",
                label: "Endereço",
                placeholder: "Endereço",
                type: "text",
              },
            ],
          },
          {
            fields: [
              {
                name: "address.number",
                label: "Numero",
                placeholder: "N°",
                type: "number",
                itemClass: "w-[86px]",
              },
              {
                name: "address.neighborhood",
                label: "Bairro",
                placeholder: "Bairro",
                type: "text",
                itemClass: "w-full",
              },
            ],
            className: "flex",
          },
          {
            fields: [
              {
                name: "address.complement",
                label: "Complemento",
                placeholder: "Complemento",
                type: "text",
                required: false,
              },
            ],
          },
          {
            fields: [
              {
                name: "address.city",
                label: "Cidade",
                placeholder: "Cidade",
                type: "text",
                itemClass: "w-full",
              },
              {
                name: "address.state",
                label: "Estado",
                placeholder: "UF",
                type: "text",
                itemClass: "w-[56px]",
              },
            ],
            className: "flex",
          },
        ],
      },
    ],
  } as Builder);

function LojaForm({ mode, loja }: LojaProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const formRef = useRef<FormBuilderRef | undefined>(undefined);

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
      if (mode === "create") {
        router.replace("/dashboard/lojas");
      }
      executeRevalidationPath("/dashboard/lojs");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Loja>
      formRef={formRef}
      mode={mode}
      entity={loja}
      tableCollection="lojas"
      builder={formBuilder(formRef)}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Loja = {
  Create: (props: LojaProps) => <LojaForm mode="create" {...props} />,
  Update: (props: LojaProps) => <LojaForm mode="update" {...props} />,
};
