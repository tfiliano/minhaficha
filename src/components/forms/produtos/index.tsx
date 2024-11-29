import { BottomSheetSheetController } from "@/components/bottom-sheet";
import { FormBuilder2 } from "@/components/form-builder";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-device-type";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { cn } from "@/lib/utils";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";

const formBuilder = {
  columns: [
    {
      rows: [
        {
          fields: [
            {
              name: "codigo",
              label: "Código do Produto",
              placeholder: "Digite o código do produto",
              type: "text",
              required: true,
            },
            {
              name: "nome",
              label: "Nome do Produto",
              placeholder: "Digite o nome do produto",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "estoque_unidade",
              label: "Estoque em Unidades",
              placeholder: "Digite a quantidade em unidades",
              type: "number",
              required: false,
            },
            {
              name: "estoque_kilo",
              label: "Estoque em Kilos",
              placeholder: "Digite a quantidade em kilos",
              type: "number",
              required: false,
            },
          ],
        },
        {
          fields: [
            {
              name: "grupo",
              label: "Grupo",
              placeholder: "Selecione o grupo",
              type: "select",
              options: [
                { value: "alimentos", label: "Alimentos" },
                { value: "bebidas", label: "Bebidas" },
                { value: "limpeza", label: "Limpeza" },
              ],
              required: true,
            },
            {
              name: "setor",
              label: "Setor",
              placeholder: "Digite o setor",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "armazenamento",
              label: "Armazenamento",
              placeholder: "Local de armazenamento",
              type: "text",
              required: false,
            },
            {
              name: "dias_validade",
              label: "Dias de Validade",
              placeholder: "Digite a validade em dias",
              type: "number",
              required: false,
            },
          ],
        },
      ],
    },
  ],
};

type Produto = Tables<"produtos">;

type ProdutoProps = {
  produto: Produto;
  bottomSheetController?: BottomSheetSheetController;
};

function Update({
  produto,
  bottomSheetController,
}: Pick<ProdutoProps, "produto" | "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ id, ...data }: Produto) => {
    const query = supabase
      .from("produtos")
      .update({ ...data })
      .eq("id", produto.id);

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/produtos");
    } else if (!success) {
      toast.error(message);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      <FormBuilder2
        builder={formBuilder}
        onSubmit={onSubmit}
        submitLabel="Atualizar"
        buttonsContainerClass={cn({
          "mb-8": useDeviceType() === "PC",
        })}
        form={{ defaultValues: { ...(produto || {}) } }}
        extraButtons={
          <Button
            variant="destructive"
            className="w-full"
            type="button"
            onClick={() => bottomSheetController?.current?.onClose()}
          >
            Cancelar
          </Button>
        }
      />
    </div>
  );
}

function Create({
  bottomSheetController,
}: Pick<ProdutoProps, "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ ...data }: Produto) => {
    const query = supabase.from("produtos").insert({ ...data });

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/produtos");
    } else if (!success) {
      toast.error(message);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      <FormBuilder2
        builder={formBuilder}
        onSubmit={onSubmit}
        submitLabel="Adicionar"
        buttonsContainerClass={cn({
          "mb-8": useDeviceType() === "PC",
        })}
        form={{}}
        extraButtons={
          <Button
            variant="destructive"
            className="w-full"
            type="button"
            onClick={() => bottomSheetController?.current?.onClose()}
          >
            Cancelar
          </Button>
        }
      />
    </div>
  );
}

export const Produto = {
  Update,
  Create,
};
