"use client";

import { useState } from "react";
import { Builder, blurActionRegistry } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { FieldValues, UseFormReset } from "react-hook-form";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";
import { SelectWithAddGrupo } from "./select-with-add-grupo";
import { SelectWithAddSetor } from "./select-with-add-setor";
import { SelectWithAddArmazenamento } from "./select-with-add-armazenamento";

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
  setores: any[] | null,
  mode?: "create" | "update"
): Builder => ({
  styled: true,
  columns: [
    {
      label: "Informações Básicas",
      rows: [
        {
          fields: [
            {
              name: "codigo",
              label: "Código do Produto",
              placeholder: "Digite o código do produto",
              type: "text",
              required: true,
              ...(mode === "create" ? { onActionBlur: "checarProdutoJaCadastrado" } : {}),
            },
          ],
        },
        {
          fields: [
            {
              name: "nome",
              label: "Nome do Produto",
              placeholder: "Digite o nome do produto",
              type: "text",
              required: true,
              isFullRow: true,
            },
          ],
        },
      ],
    },
    {
      label: "Informações de Estoque",
      rows: [
        {
          fields: [
            {
              name: "unidade",
              label: "Unidade de Medida",
              placeholder: "ex: UN, KG, LT, CX, PCT",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
    {
      label: "Classificação e Organização",
      rows: [
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
              component: (props: any) => (
                <SelectWithAddGrupo
                  grupos={grupos}
                  formField={props.formField}
                  onGrupoAdded={(novoGrupo) => {
                    setGrupos([...grupos, novoGrupo]);
                  }}
                />
              ),
            },
          ],
        },
        {
          fields: [
            {
              name: "setor",
              label: "Setor",
              placeholder: "Selecione o setor",
              type: "select",
              options: (setores || []).map((setor) => ({
                value: setor.nome,
                label: setor.nome,
              })),
              required: true,
              component: (props: any) => (
                <SelectWithAddSetor
                  setores={setores || []}
                  formField={props.formField}
                />
              ),
            },
          ],
        },
      ],
    },
    {
      label: "Armazenamento e Validade",
      rows: [
        {
          fields: [
            {
              name: "armazenamento_id",
              label: "Local de Armazenamento",
              placeholder: "Selecione onde será armazenado",
              type: "select",
              options: armazenamentos.map((armazenamento) => ({
                value: armazenamento.id,
                label: armazenamento.armazenamento || 'Sem nome',
              })),
              required: true,
              component: (props: any) => (
                <SelectWithAddArmazenamento
                  armazenamentos={armazenamentos}
                  formField={props.formField}
                  onArmazenamentoAdded={(novoArmazenamento) => {
                    setArmazenamentos([...armazenamentos, novoArmazenamento]);
                  }}
                />
              ),
            },
            {
              name: "dias_validade",
              label: "Prazo de Validade (dias)",
              placeholder: "Ex: 30, 60, 90",
              type: "number",
              required: false,
            },
          ],
        },
      ],
    },
    {
      label: "Relacionamentos (Opcional)",
      rows: [
        {
          fields: [
            {
              name: "originado",
              label: "Produto Pai/Origem",
              placeholder: "Selecione se este produto deriva de outro",
              type: "select",
              options: [
                ...produtos.map((produto) => ({
                  value: produto.id as string,
                  label: `${produto.codigo} - ${produto.nome}`,
                }))
              ],
              required: false,
              isFullRow: true,
            },
          ],
        },
      ],
    },
    {
      label: "Ficha Técnica",
      rows: [
        {
          fields: [
            {
              name: "item_de_cardapio",
              label: "É um item de cardápio?",
              type: "checkbox",
              required: false,
              helperText: "Marque se este produto possui ficha técnica com ingredientes",
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
  grupos: gruposInitial,
  armazenamentos: armazenamentosInitial,
  produtos,
  setores,
}: ProdutoProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [grupos, setGrupos] = useState(gruposInitial);
  const [armazenamentos, setArmazenamentos] = useState(armazenamentosInitial);

  const handleSubmit = async (data: IProduto) => {
    try {
      console.log(data)
      const grupo = grupos.find((g) => g.id === data.grupo_id);
      const armazenamento = armazenamentos.find((a) => a.id === data.armazenamento_id);

      if (!grupo || !armazenamento) {
        console.error('Grupo não encontrado:', { grupo_id: data.grupo_id, grupos });
        console.error('Armazenamento não encontrado:', { armazenamento_id: data.armazenamento_id, armazenamentos });
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
        item_de_cardapio: data.item_de_cardapio ?? false,
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
      builder={formBuilder(grupos, armazenamentos, produtos, setores, mode)}
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
