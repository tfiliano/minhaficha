import { BottomSheetSheetController } from "@/components/bottom-sheet";
import { Builder } from "@/components/form-builder";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

type Produto = Tables<"produtos">;
type Grupo = Tables<"grupos">;
type LocalArmazenamento = Tables<"locais_armazenamento">;

type ProdutoProps = {
  produto?: Produto;
  grupos: Grupo[];
  armazenamentos: LocalArmazenamento[];
  produtos: Produto[];
  bottomSheetController?: BottomSheetSheetController;
};

const formBuilder = (
  grupos: Grupo[],
  armazenamentos: LocalArmazenamento[],
  produtos: Produto[]
) =>
  ({
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
          {
            fields: [
              {
                name: "produto_id",
                label: "Produto (Pai)",
                placeholder: "Selecione o produto",
                type: "combobox",
                options: produtos.map((produto) => ({
                  value: produto.id,
                  label: produto.nome,
                })),
                addNew: false,
                required: true,
              },
            ],
          },
        ],
      },
    ],
  } as Builder);

function ProdutoForm({
  mode,
  produto,
  grupos,
  armazenamentos,
  produtos,
  bottomSheetController,
}: ProdutoProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();

  const handleSubmit = async (data: Produto) => {
    const grupo = grupos.find((g) => g.id === data.grupo_id);
    if (grupo) Object.assign(data, { grupo: grupo.nome });

    const armazenamento = armazenamentos.find(
      (a) => a.id === data.armazenamento_id
    );
    if (armazenamento) data.armazenamento = armazenamento.armazenamento;

    const query =
      mode === "update"
        ? supabase.from("produtos").update(data).eq("id", produto!.id)
        : supabase.from("produtos").insert(data);

    const { success, message } = await executeQuery(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/produtos");
    } else {
      toast.error(message);
    }
  };

  return (
    <EntityFormHandler<Produto>
      mode={mode}
      entity={produto}
      builder={formBuilder(grupos, armazenamentos, produtos)}
      onSubmit={handleSubmit}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
      bottomSheetController={bottomSheetController}
    />
  );
}

export const Produto = {
  Create: (props: ProdutoProps) => <ProdutoForm mode="create" {...props} />,
  Update: (props: ProdutoProps) => <ProdutoForm mode="update" {...props} />,
};
