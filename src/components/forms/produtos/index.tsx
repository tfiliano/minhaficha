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
import { FormContent } from "..";

const formBuilder = (
  grupos: Grupo[],
  armazenamentos: LocalArmazenamento[]
) => ({
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
              name: "grupo_id",
              label: "Grupo",
              placeholder: "Selecione o grupo",
              type: "select",
              options: grupos.map((grupo) => ({
                value: grupo.id,
                label: grupo.nome,
              })),

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
              name: "armazenamento_id",
              label: "Armazenamento",
              placeholder: "Local de armazenamento",
              type: "select",
              options: armazenamentos.map((armazenamento) => ({
                value: armazenamento.id,
                label: armazenamento.armazenamento,
              })),
              required: true,
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
});

type Produto = Tables<"produtos">;
type Grupo = Tables<`grupos`>;
type LocalArmazenamento = Tables<`locais_armazenamento`>;

type ProdutoProps = {
  produto: Produto;
  grupos: Grupo[];
  armazenamentos: LocalArmazenamento[];
  bottomSheetController?: BottomSheetSheetController;
};

function Update({
  produto,
  grupos,
  armazenamentos,
  bottomSheetController,
}: Pick<
  ProdutoProps,
  "produto" | "bottomSheetController" | "grupos" | "armazenamentos"
>) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ id, ...data }: Produto) => {
    const grupo = grupos.find((grupo) => grupo.id === data.grupo_id);
    data.grupo = grupo!.nome!;

    const armazenamento = armazenamentos.find(
      (armazenamento) => armazenamento.id === data.armazenamento_id
    );
    data.armazenamento = armazenamento!.armazenamento;

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
    <FormContent>
      <FormBuilder2
        builder={formBuilder(grupos, armazenamentos)}
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
    </FormContent>
  );
}

function Create({
  bottomSheetController,
  grupos,
  armazenamentos,
}: Pick<ProdutoProps, "bottomSheetController" | "grupos" | "armazenamentos">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ ...data }: Produto) => {
    const grupo = grupos.find((grupo) => grupo.id === data.grupo_id);
    data.grupo = grupo!.nome!;
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
    <FormContent>
      <FormBuilder2
        builder={formBuilder(grupos, armazenamentos)}
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
    </FormContent>
  );
}

export const Produto = {
  Update,
  Create,
};
