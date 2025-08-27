"use server";

import { createClient } from "@/utils/supabase";
import { Tables } from "@/types/database.types";
import * as XLSX from 'xlsx';

type ProdutoImport = {
  ID?: string;
  COdigo?: string;
  Grupo?: string;
  Setor?: string;
  'Estoque Unidade'?: number;
  'Estoque Kilo'?: number;
  Armazenamento?: string;
  'Dias Validade'?: number;
  'Produto Pai'?: string; // Column I - ID do produto pai
  Nome: string; // Column J - Nome do produto
  Unidade?: string;
  Loja?: string;
  Ativo?: string;
};

type ProcessResult = {
  success: boolean;
  message: string;
  stats?: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  errors?: string[];
};

export async function importProductsFromExcel(formData: FormData): Promise<ProcessResult> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, message: 'Nenhum arquivo fornecido' };
    }

    // Ler arquivo Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON
    const rawData: ProdutoImport[] = (XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: null 
    }) as any[][]).slice(1) // Remove header row
    .map((row: any[]) => ({
      ID: row[0] || null,
      COdigo: row[1] || null, 
      Grupo: row[2] || null,
      Setor: row[3] || 'AÇOUGUE', // Default value
      'Estoque Unidade': row[4] || null,
      'Estoque Kilo': row[5] || null,
      Armazenamento: row[6] || null,
      'Dias Validade': row[7] || null,
      'Produto Pai': row[8] || null, // Column I
      Nome: row[9] || '', // Column J - Required
      Unidade: row[10] || 'UN',
      Loja: row[11] || 'CENTRE',
      Ativo: row[12] || 'SIM'
    })).filter(item => item.Nome && item.Nome.trim() !== '');

    if (rawData.length === 0) {
      return { success: false, message: 'Nenhum produto válido encontrado no arquivo' };
    }

    const supabase = await createClient();
    const stats = {
      total: rawData.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    const errors: string[] = [];

    // Buscar dados de referência
    const [gruposRes, armazenamentosRes, produtosExistentesRes] = await Promise.all([
      supabase.from('grupos').select('*'),
      supabase.from('locais_armazenamento').select('*'),
      supabase.from('produtos').select('id, codigo, nome, originado')
    ]);

    const grupos = gruposRes.data || [];
    const armazenamentos = armazenamentosRes.data || [];
    const produtosExistentes = produtosExistentesRes.data || [];

    // Mapear produtos existentes por ID e nome para busca rápida
    const produtosPorId = new Map(produtosExistentes.map(p => [p.id, p]));
    const produtosPorNome = new Map(produtosExistentes.map(p => [p.nome.toLowerCase(), p]));
    const produtosPorCodigo = new Map(produtosExistentes.map(p => [p.codigo, p]));

    // Processar cada produto
    for (const [index, item] of rawData.entries()) {
      try {
        // Validar produto pai se especificado
        let produtoPaiId: string | null = null;
        if (item['Produto Pai']) {
          // Primeiro tentar buscar por ID (coluna I)
          const produtoPai = produtosPorId.get(item['Produto Pai']);
          if (produtoPai) {
            produtoPaiId = produtoPai.id;
          } else {
            // Se não encontrou por ID, tentar buscar por nome
            const produtoPaiPorNome = produtosPorNome.get(item['Produto Pai'].toLowerCase());
            if (produtoPaiPorNome) {
              produtoPaiId = produtoPaiPorNome.id;
            } else {
              // Se não encontrou, criar produto pai com o nome
              const novoProdutoPai = {
                codigo: `PAI_${Date.now()}_${index}`, // Código temporário
                nome: item['Produto Pai'],
                grupo: item.Grupo || 'GERAL',
                setor: item.Setor || 'AÇOUGUE',
                unidade: 'UN',
                ativo: true
              };

              const { data: produtoPaiCriado, error } = await supabase
                .from('produtos')
                .insert(novoProdutoPai)
                .select('id')
                .single();

              if (error) {
                errors.push(`Linha ${index + 2}: Erro ao criar produto pai "${item['Produto Pai']}": ${error.message}`);
                stats.errors++;
                continue;
              }

              if (produtoPaiCriado) {
                produtoPaiId = produtoPaiCriado.id;
                // Atualizar maps para próximas iterações
                produtosPorId.set(produtoPaiId, { 
                  id: produtoPaiId, 
                  codigo: novoProdutoPai.codigo, 
                  nome: novoProdutoPai.nome,
                  originado: null 
                });
                produtosPorNome.set(novoProdutoPai.nome.toLowerCase(), {
                  id: produtoPaiId,
                  codigo: novoProdutoPai.codigo,
                  nome: novoProdutoPai.nome,
                  originado: null
                });
              }
            }
          }
        }

        // Buscar grupo por nome
        let grupoId: string | null = null;
        let grupoNome = item.Grupo || 'GERAL';
        if (item.Grupo) {
          const grupo = grupos.find(g => g.nome?.toLowerCase() === item.Grupo?.toLowerCase());
          if (grupo) {
            grupoId = grupo.id;
            grupoNome = grupo.nome || grupoNome;
          }
        }

        // Buscar armazenamento por nome
        let armazenamentoId: string | null = null;
        let armazenamentoNome: string | null = null;
        if (item.Armazenamento) {
          const armazenamento = armazenamentos.find(a => 
            a.armazenamento?.toLowerCase() === item.Armazenamento?.toLowerCase()
          );
          if (armazenamento) {
            armazenamentoId = armazenamento.id;
            armazenamentoNome = armazenamento.armazenamento;
          } else {
            armazenamentoNome = item.Armazenamento;
          }
        }

        // Verificar se produto já existe (por código se fornecido, senão por nome)
        let produtoExistente: any | undefined;
        if (item.COdigo) {
          produtoExistente = produtosPorCodigo.get(item.COdigo);
        } else {
          produtoExistente = produtosPorNome.get(item.Nome.toLowerCase());
        }

        const produtoData = {
          codigo: item.COdigo || `AUTO_${Date.now()}_${index}`,
          nome: item.Nome,
          grupo: grupoNome,
          grupo_id: grupoId,
          setor: item.Setor || 'AÇOUGUE',
          unidade: item.Unidade || 'UN',
          armazenamento: armazenamentoNome,
          armazenamento_id: armazenamentoId,
          estoque_unidade: item['Estoque Unidade'] || null,
          estoque_kilo: item['Estoque Kilo'] || null,
          dias_validade: item['Dias Validade'] || null,
          originado: produtoPaiId,
          ativo: item.Ativo === 'SIM'
        };

        if (produtoExistente) {
          // Atualizar produto existente
          const { error } = await supabase
            .from('produtos')
            .update(produtoData)
            .eq('id', produtoExistente.id);

          if (error) {
            errors.push(`Linha ${index + 2}: Erro ao atualizar produto "${item.Nome}": ${error.message}`);
            stats.errors++;
          } else {
            stats.updated++;
          }
        } else {
          // Criar novo produto
          const { error } = await supabase
            .from('produtos')
            .insert(produtoData);

          if (error) {
            errors.push(`Linha ${index + 2}: Erro ao criar produto "${item.Nome}": ${error.message}`);
            stats.errors++;
          } else {
            stats.created++;
            // Atualizar maps para próximas iterações
            if (produtoData.codigo) {
              produtosPorCodigo.set(produtoData.codigo, {
                id: '', // Will be filled by database
                codigo: produtoData.codigo,
                nome: produtoData.nome,
                originado: produtoData.originado || null
              });
            }
            produtosPorNome.set(produtoData.nome.toLowerCase(), {
              id: '', // Will be filled by database
              codigo: produtoData.codigo || '',
              nome: produtoData.nome,
              originado: produtoData.originado || null
            });
          }
        }

      } catch (error) {
        errors.push(`Linha ${index + 2}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        stats.errors++;
      }
    }

    const message = `Importação concluída: ${stats.created} criados, ${stats.updated} atualizados, ${stats.errors} erros`;

    return {
      success: stats.errors < stats.total,
      message,
      stats,
      errors: errors.slice(0, 10) // Limitar a 10 erros para não sobrecarregar a UI
    };

  } catch (error) {
    console.error('Erro na importação:', error);
    return {
      success: false,
      message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}