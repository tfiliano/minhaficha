"use server";

import { createClient } from "@/utils/supabase";
import { Tables } from "@/types/database.types";
import * as XLSX from 'xlsx';

type ProdutoImport = {
  'Nome do Produto': string;
  'Código'?: string;
  'Unidade'?: string;
  'Setor'?: string;
  'Nome do Grupo'?: string;
  'Nome do Armazenamento'?: string;
  'Nome do Produto Pai'?: string;
  'Estoque Unidade'?: number;
  'Estoque Kilo'?: number;
  'Dias Validade'?: number;
  'Ativo'?: string;
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
    
    // Converter para JSON usando cabeçalhos
    const rawData: ProdutoImport[] = XLSX.utils.sheet_to_json(worksheet, { 
      defval: null 
    }).map((row: any) => ({
      'Nome do Produto': row['Nome do Produto'] || '',
      'Código': row['Código'] || null,
      'Unidade': row['Unidade'] || 'UN',
      'Setor': row['Setor'] || 'AÇOUGUE',
      'Nome do Grupo': row['Nome do Grupo'] || null,
      'Nome do Armazenamento': row['Nome do Armazenamento'] || null,
      'Nome do Produto Pai': row['Nome do Produto Pai'] || null,
      'Estoque Unidade': row['Estoque Unidade'] || null,
      'Estoque Kilo': row['Estoque Kilo'] || null,
      'Dias Validade': row['Dias Validade'] || null,
      'Ativo': row['Ativo'] || 'SIM'
    })).filter(item => item['Nome do Produto'] && item['Nome do Produto'].trim() !== '');

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
        // 1. Buscar ou criar grupo
        let grupoId: string | null = null;
        let grupoNome = 'GERAL';
        
        if (item['Nome do Grupo']) {
          const grupo = grupos.find(g => g.nome?.toLowerCase() === item['Nome do Grupo']?.toLowerCase());
          if (grupo) {
            grupoId = grupo.id;
            grupoNome = grupo.nome || grupoNome;
          } else {
            // Criar novo grupo
            const { data: novoGrupo, error } = await supabase
              .from('grupos')
              .insert({ nome: item['Nome do Grupo'], ativo: true })
              .select('id, nome')
              .single();

            if (error) {
              errors.push(`Linha ${index + 2}: Erro ao criar grupo "${item['Nome do Grupo']}": ${error.message}`);
            } else if (novoGrupo) {
              grupoId = novoGrupo.id;
              grupoNome = novoGrupo.nome || item['Nome do Grupo'];
              // Atualizar lista para próximas iterações
              grupos.push({ id: grupoId, nome: grupoNome, ativo: true } as any);
            }
          }
        }

        // 2. Buscar ou criar armazenamento
        let armazenamentoId: string | null = null;
        let armazenamentoNome: string | null = null;
        
        if (item['Nome do Armazenamento']) {
          const armazenamento = armazenamentos.find(a => 
            a.armazenamento?.toLowerCase() === item['Nome do Armazenamento']?.toLowerCase()
          );
          if (armazenamento) {
            armazenamentoId = armazenamento.id;
            armazenamentoNome = armazenamento.armazenamento;
          } else {
            // Criar novo armazenamento
            const { data: novoArmazenamento, error } = await supabase
              .from('locais_armazenamento')
              .insert({ armazenamento: item['Nome do Armazenamento'], ativo: true })
              .select('id, armazenamento')
              .single();

            if (error) {
              errors.push(`Linha ${index + 2}: Erro ao criar armazenamento "${item['Nome do Armazenamento']}": ${error.message}`);
            } else if (novoArmazenamento) {
              armazenamentoId = novoArmazenamento.id;
              armazenamentoNome = novoArmazenamento.armazenamento;
              // Atualizar lista para próximas iterações
              armazenamentos.push({ id: armazenamentoId, armazenamento: armazenamentoNome, ativo: true } as any);
            }
          }
        }

        // 3. Buscar ou criar produto pai
        let produtoPaiId: string | null = null;
        if (item['Nome do Produto Pai']) {
          const produtoPaiPorNome = produtosPorNome.get(item['Nome do Produto Pai'].toLowerCase());
          if (produtoPaiPorNome) {
            produtoPaiId = produtoPaiPorNome.id;
          } else {
            // Criar produto pai automaticamente
            const codigoPai = `PAI_${Date.now()}_${index}`;
            const novoProdutoPai = {
              codigo: codigoPai,
              nome: item['Nome do Produto Pai'],
              grupo: grupoNome,
              grupo_id: grupoId,
              setor: item['Setor'] || 'AÇOUGUE',
              unidade: 'UN',
              armazenamento: armazenamentoNome,
              armazenamento_id: armazenamentoId,
              ativo: true
            };

            const { data: produtoPaiCriado, error } = await supabase
              .from('produtos')
              .insert(novoProdutoPai)
              .select('id')
              .single();

            if (error) {
              errors.push(`Linha ${index + 2}: Erro ao criar produto pai "${item['Nome do Produto Pai']}": ${error.message}`);
            } else if (produtoPaiCriado) {
              produtoPaiId = produtoPaiCriado.id;
              // Atualizar maps para próximas iterações
              const produtoPaiData = {
                id: produtoPaiId,
                codigo: codigoPai,
                nome: item['Nome do Produto Pai'],
                originado: null
              };
              produtosPorNome.set(item['Nome do Produto Pai'].toLowerCase(), produtoPaiData);
              produtosPorCodigo.set(codigoPai, produtoPaiData);
            }
          }
        }

        // 4. Gerar código se não fornecido
        const codigo = item['Código'] || `AUTO_${Date.now()}_${index}`;

        // 5. Verificar se produto já existe
        let produtoExistente: any | undefined;
        if (item['Código']) {
          produtoExistente = produtosPorCodigo.get(item['Código']);
        }
        if (!produtoExistente) {
          produtoExistente = produtosPorNome.get(item['Nome do Produto'].toLowerCase());
        }

        const produtoData = {
          codigo,
          nome: item['Nome do Produto'],
          grupo: grupoNome,
          grupo_id: grupoId,
          setor: item['Setor'] || 'AÇOUGUE',
          unidade: item['Unidade'] || 'UN',
          armazenamento: armazenamentoNome,
          armazenamento_id: armazenamentoId,
          estoque_unidade: item['Estoque Unidade'] || null,
          estoque_kilo: item['Estoque Kilo'] || null,
          dias_validade: item['Dias Validade'] || null,
          originado: produtoPaiId,
          ativo: item['Ativo'] === 'SIM'
        };

        if (produtoExistente) {
          // Atualizar produto existente
          const { error } = await supabase
            .from('produtos')
            .update(produtoData)
            .eq('id', produtoExistente.id);

          if (error) {
            errors.push(`Linha ${index + 2}: Erro ao atualizar produto "${item['Nome do Produto']}": ${error.message}`);
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
            errors.push(`Linha ${index + 2}: Erro ao criar produto "${item['Nome do Produto']}": ${error.message}`);
            stats.errors++;
          } else {
            stats.created++;
            // Atualizar maps para próximas iterações
            const novoProdutoData = {
              id: '', // Will be filled by database
              codigo: produtoData.codigo,
              nome: produtoData.nome,
              originado: produtoData.originado || null
            };
            produtosPorCodigo.set(produtoData.codigo, novoProdutoData);
            produtosPorNome.set(produtoData.nome.toLowerCase(), novoProdutoData);
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