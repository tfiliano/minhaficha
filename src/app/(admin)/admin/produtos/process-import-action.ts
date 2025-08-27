"use server";

import { createClient } from "@/utils/supabase";
import { ProdutoImportPreview } from "./preview-import-action";
import { saveImportHistory, saveImportDetails } from "@/lib/storage";

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

export async function processImportFromPreview(
  data: ProdutoImportPreview[], 
  fileInfo?: {
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
  }
): Promise<ProcessResult> {
  try {
    const supabase = await createClient();
    
    // Filtrar apenas itens válidos (não são errors ou conflicts não resolvidos)
    const validItems = data.filter(item => 
      item.status !== 'error' && 
      item.conflicts.length === 0
    );

    const stats = {
      total: data.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    const errors: string[] = [];

    // Buscar dados atualizados para criação automática
    const [gruposRes, armazenamentosRes, produtosExistentesRes] = await Promise.all([
      supabase.from('grupos').select('*'),
      supabase.from('locais_armazenamento').select('*'),
      supabase.from('produtos').select('id, codigo, nome, originado')
    ]);

    const grupos = gruposRes.data || [];
    const armazenamentos = armazenamentosRes.data || [];
    const produtosExistentes = produtosExistentesRes.data || [];

    // Maps para busca rápida
    const gruposPorNome = new Map(grupos.map(g => [g.nome?.toLowerCase(), g]));
    const armazenamentosPorNome = new Map(armazenamentos.map(a => [a.armazenamento?.toLowerCase(), a]));
    const produtosPorNome = new Map(produtosExistentes.map(p => [p.nome.toLowerCase(), p]));
    const produtosPorCodigo = new Map(produtosExistentes.map(p => [p.codigo, p]));

    // Processar cada item
    for (const item of validItems) {
      try {
        // 1. Criar ou buscar grupo
        let grupoId: string | null = null;
        let grupoNome = 'GERAL';
        
        if (item['Nome do Grupo']) {
          let grupo = gruposPorNome.get(item['Nome do Grupo'].toLowerCase());
          if (!grupo) {
            // Criar novo grupo
            const { data: novoGrupo, error } = await supabase
              .from('grupos')
              .insert({ nome: item['Nome do Grupo'], ativo: true })
              .select('id, nome')
              .single();

            if (error) {
              errors.push(`Linha ${item.linha}: Erro ao criar grupo "${item['Nome do Grupo']}": ${error.message}`);
              stats.errors++;
              continue;
            }
            
            if (novoGrupo) {
              grupo = novoGrupo;
              gruposPorNome.set(item['Nome do Grupo'].toLowerCase(), grupo);
            }
          }
          
          if (grupo) {
            grupoId = grupo.id;
            grupoNome = grupo.nome || item['Nome do Grupo'];
          }
        }

        // 2. Criar ou buscar armazenamento
        let armazenamentoId: string | null = null;
        let armazenamentoNome: string | null = null;
        
        if (item['Nome do Armazenamento']) {
          let armazenamento = armazenamentosPorNome.get(item['Nome do Armazenamento'].toLowerCase());
          if (!armazenamento) {
            // Criar novo armazenamento
            const { data: novoArmazenamento, error } = await supabase
              .from('locais_armazenamento')
              .insert({ armazenamento: item['Nome do Armazenamento'], ativo: true })
              .select('id, armazenamento')
              .single();

            if (error) {
              errors.push(`Linha ${item.linha}: Erro ao criar armazenamento "${item['Nome do Armazenamento']}": ${error.message}`);
              stats.errors++;
              continue;
            }
            
            if (novoArmazenamento) {
              armazenamento = novoArmazenamento;
              armazenamentosPorNome.set(item['Nome do Armazenamento'].toLowerCase(), armazenamento);
            }
          }
          
          if (armazenamento) {
            armazenamentoId = armazenamento.id;
            armazenamentoNome = armazenamento.armazenamento;
          }
        }

        // 3. Criar ou buscar produto pai
        let produtoPaiId: string | null = null;
        if (item['Nome do Produto Pai']) {
          let produtoPai = produtosPorNome.get(item['Nome do Produto Pai'].toLowerCase());
          if (!produtoPai) {
            // Criar produto pai automaticamente
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const monthLetter = String.fromCharCode(65 + now.getMonth());
            const day = now.getDate().toString().padStart(2, '0');
            const seq = item.linha.toString().padStart(3, '0');
            const codigoPai = `P${year}${monthLetter}${day}${seq}`;
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
              .select('id, codigo, nome, originado')
              .single();

            if (error) {
              errors.push(`Linha ${item.linha}: Erro ao criar produto pai "${item['Nome do Produto Pai']}": ${error.message}`);
              stats.errors++;
              continue;
            }

            if (produtoPaiCriado) {
              produtoPai = produtoPaiCriado;
              produtosPorNome.set(item['Nome do Produto Pai'].toLowerCase(), produtoPai);
              produtosPorCodigo.set(codigoPai, produtoPai);
            }
          }
          
          if (produtoPai) {
            produtoPaiId = produtoPai.id;
          }
        }

        // 4. Criar dados do produto  
        let codigo = item['Código'];
        if (!codigo) {
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2);
          const monthLetter = String.fromCharCode(65 + now.getMonth());
          const day = now.getDate().toString().padStart(2, '0');
          const seq = item.linha.toString().padStart(3, '0');
          codigo = `${year}${monthLetter}${day}${seq}`;
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

        if (item.status === 'update' && item.produtoExistente) {
          // Atualizar produto existente
          const { error } = await supabase
            .from('produtos')
            .update(produtoData)
            .eq('id', item.produtoExistente.id);

          if (error) {
            errors.push(`Linha ${item.linha}: Erro ao atualizar produto "${item['Nome do Produto']}": ${error.message}`);
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
            errors.push(`Linha ${item.linha}: Erro ao criar produto "${item['Nome do Produto']}": ${error.message}`);
            stats.errors++;
          } else {
            stats.created++;
            // Atualizar maps para próximas iterações
            const novoProdutoData = {
              id: '',
              codigo: produtoData.codigo,
              nome: produtoData.nome,
              originado: produtoData.originado || null
            };
            produtosPorCodigo.set(produtoData.codigo, novoProdutoData);
            produtosPorNome.set(produtoData.nome.toLowerCase(), novoProdutoData);
          }
        }

      } catch (error) {
        errors.push(`Linha ${item.linha}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        stats.errors++;
      }
    }

    // Contar itens pulados
    stats.skipped = data.length - validItems.length;

    const message = `Importação concluída: ${stats.created} criados, ${stats.updated} atualizados, ${stats.skipped} pulados, ${stats.errors} erros`;

    // Salvar histórico da importação se arquivo foi fornecido
    if (fileInfo) {
      try {
        // Buscar informações do usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        const { data: userData } = await supabase
          .from('usuarios')
          .select('loja_id')
          .eq('id', user?.id)
          .single();

        if (user && userData) {
          const importHistoryResult = await saveImportHistory({
            lojaId: userData.loja_id,
            usuarioId: user.id,
            fileName: fileInfo.fileName,
            filePath: fileInfo.filePath,
            fileSize: fileInfo.fileSize,
            mimeType: fileInfo.mimeType,
            stats
          });

          if (importHistoryResult.success && importHistoryResult.importId) {
            // Preparar detalhes para salvar
            const details = data.map(item => ({
              linha_numero: item.linha,
              produto_codigo: item['Código'] || undefined,
              produto_nome: item['Nome do Produto'],
              acao: (item.skipImport ? 'skipped' : 
                    item.status === 'error' ? 'error' : 
                    item.status === 'update' ? 'updated' : 'created') as 'created' | 'updated' | 'skipped' | 'error',
              dados_originais: {
                'Nome do Produto': item['Nome do Produto'],
                'Código': item['Código'],
                'Unidade': item['Unidade'],
                'Setor': item['Setor'],
                'Nome do Grupo': item['Nome do Grupo'],
                'Nome do Armazenamento': item['Nome do Armazenamento'],
                'Nome do Produto Pai': item['Nome do Produto Pai'],
                'Dias Validade': item['Dias Validade']
              },
              erro_message: item.conflicts.length > 0 ? item.conflicts.join('; ') : undefined
            }));

            await saveImportDetails(importHistoryResult.importId, details);
          }
        }
      } catch (historyError) {
        console.error('Erro ao salvar histórico:', historyError);
        // Não falhar a importação por erro no histórico
      }
    }

    return {
      success: stats.errors < stats.total,
      message,
      stats,
      errors: errors.slice(0, 10)
    };

  } catch (error) {
    console.error('Erro na importação final:', error);
    return {
      success: false,
      message: `Erro ao processar importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}