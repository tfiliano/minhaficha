"use client";

import { Builder, blurActionRegistry } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { FieldValues, UseFormReset } from "react-hook-form";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

type IProduto = Tables<"produtos">;
type Grupo = Tables<"grupos">;
type LocalArmazenamento = Tables<"locais_armazenamento">;

export type ProdutoProps = {
  produto?: IProduto;
  grupos: Grupo[];
  armazenamentos: LocalArmazenamento[];
  produtos: IProduto[];
  setores: any[] | null;
};

async function checarProdutoJaCadastrado(
  value: string,
  resetForm: UseFormReset<FieldValues>
) {
  if (!value || value.length <= 1) return value;

  const supabase = createBrowserClient();
  const query = supabase
    .from("produtos")
    .select()
    .eq("codigo", value)
    .maybeSingle();

  const { success, message, data } = await executeQuery<
    typeof query,
    IProduto
  >(() => query);

  if (success && data?.id) {
    toast.warning("Produto já cadastrado. Verifique o código inserido.");
    resetForm({ values: {} }); // Clear the form when a duplicate is found
  } else if (!success) {
    toast.error(`Erro ao verificar produto: ${message}`);
  }

  return value;
}

blurActionRegistry.register(checarProdutoJaCadastrado);

const formBuilder = (
  grupos: Grupo[],
  armazenamentos: LocalArmazenamento[],
  produtos: IProduto[],
  setores: any[] | null
): Builder => ({
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
              onActionBlur: "checarProdutoJaCadastrado",
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
              name: "unidade",
              label: "Unidades",
              placeholder: "ex: UN, KG, LT",
              type: "text",
              required: true,
            },
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
                label: grupo.nome || 'Sem nome',
              })),
              required: true,
            },
            {
              name: "setor",
              label: "Setor",
              placeholder: "Digite o setor",
              type: "select",
              options: (setores || []).map((setor) => ({
                value: setor.nome,
                label: setor.nome,
              })),
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
                label: armazenamento.armazenamento || 'Sem nome',
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
              name: "originado",
              label: "Produto (Pai)",
              placeholder: "Selecione o produto",
              type: "select",
              options: [
                ...produtos.map((produto) => ({
                  value: produto.id as string,
                  label: `${produto.codigo} - ${produto.nome}`,
                }))
              ],
              required: false,
            },
          ],
        },
      ],
    },
  ],
});

function ProdutoForm({
  mode,
  produto,
  grupos,
  armazenamentos,
  produtos,
  setores,
}: ProdutoProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: IProduto) => {
    try {
      console.log(data)
      const grupo = grupos.find((g) => g.id === data.grupo_id);
      const armazenamento = armazenamentos.find((a) => a.id === data.armazenamento_id);

      if (!grupo || !armazenamento) {
        throw new Error('Grupo ou local de armazenamento não encontrado');
      }

      // Create base data with required fields
      const baseData = {
        codigo: data.codigo,
        nome: data.nome,
        unidade: data.unidade,
        setor: data.setor,
        grupo: grupo.nome || "",
        grupo_id: data.grupo_id || null,
        armazenamento_id: data.armazenamento_id || null,
        armazenamento: armazenamento.armazenamento || null,
      };

      // Add optional fields explicitly
      const optionalFields = {
        originado: data.originado || null,
        estoque_unidade: data.estoque_unidade === undefined ? null : data.estoque_unidade,
        estoque_kilo: data.estoque_kilo === undefined ? null : data.estoque_kilo,
        dias_validade: data.dias_validade === undefined ? null : data.dias_validade,
        ativo: data.ativo ?? true,
        loja_id: data.loja_id ?? null,
      };

      // Combine all data
      const finalData = {
        ...baseData,
        ...optionalFields,
      };

      const query = mode === "update"
        ? supabase
            .from("produtos")
            .update(finalData)
            .eq("id", produto!.id)
        : supabase
            .from("produtos")
            .insert(finalData)
            .select()
            .maybeSingle();

      const { success, message, data: result } = await executeQuery<typeof query, IProduto>(() => query);

      if (success) {
        toast.success(mode === "create" ? "Produto criado com sucesso!" : "Produto atualizado com sucesso!");
        if (mode === "create") router.push("/admin/produtos");
        executeRevalidationPath("/admin/produtos");
      } else {
        throw new Error(message);
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error(`Erro ao ${mode === "create" ? "criar" : "atualizar"} produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <EntityFormHandler<IProduto>
      mode={mode}
      entity={produto}
      builder={formBuilder(grupos, armazenamentos, produtos, setores)}
      onSubmit={handleSubmit}
      tableCollection="produtos"
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Produto = {
  Create: (props: ProdutoProps) => <ProdutoForm mode="create" {...props} />,
  Update: (props: ProdutoProps) => <ProdutoForm mode="update" {...props} />,
};
