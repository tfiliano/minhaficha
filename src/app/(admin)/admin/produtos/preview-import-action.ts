"use server";

import { createClient } from "@/utils/supabase";
import { Tables } from "@/types/database.types";
import * as XLSX from 'xlsx';

export type ProdutoImportPreview = {
  linha: number;
  'Nome do Produto': string;
  'Código': string | null;
  'Unidade': string;
  'Setor': string;
  'Nome do Grupo': string | null;
  'Nome do Armazenamento': string | null;
  'Nome do Produto Pai': string | null;
  'Estoque Unidade': number | null;
  'Estoque Kilo': number | null;
  'Dias Validade': number | null;
  'Ativo': string;
  // Status fields
  status: 'create' | 'update' | 'conflict' | 'error' | 'skip';
  conflicts: string[];
  warnings: string[];
  skipImport: boolean;
  // Reference data
  grupoExistente?: Tables<'grupos'> | null;
  armazenamentoExistente?: Tables<'locais_armazenamento'> | null;
  produtoPaiExistente?: Tables<'produtos'> | null;
  produtoExistente?: Tables<'produtos'> | null;
};

export type ImportPreviewResult = {
  success: boolean;
  message: string;
  data?: ProdutoImportPreview[];
  stats?: {
    total: number;
    toCreate: number;
    toUpdate: number;
    conflicts: number;
    errors: number;
  };
  // Reference data for dropdowns
  gruposDisponiveis?: Tables<'grupos'>[];
  armazenamentosDisponiveis?: Tables<'locais_armazenamento'>[];
  produtosDisponiveis?: Tables<'produtos'>[];
};

export async function previewImportFromExcel(formData: FormData): Promise<ImportPreviewResult> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, message: 'Nenhum arquivo fornecido' };
    }

    // Validar tamanho do arquivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        message: `Arquivo muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(0)}MB` 
      };
    }

    // Ler arquivo Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Converter para JSON usando cabeçalhos
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    
    console.log('Dados brutos do Excel:', jsonData);
    console.log('Colunas disponíveis:', jsonData.length > 0 ? Object.keys(jsonData[0]) : 'Nenhuma');

    const rawData = jsonData.map((row: any, index) => {
      // Tentar diferentes variações de nomes de colunas
      const getNomeProduto = () => {
        return row['Nome do Produto'] || 
               row['Nome'] || 
               row['NOME DO PRODUTO'] || 
               row['nome'] || 
               row['Produto'] || 
               row['produto'] || '';
      };

      const getCodigo = () => {
        return row['Código'] || 
               row['Codigo'] || 
               row['CÓDIGO'] || 
               row['codigo'] || 
               row['COdigo'] || 
               null;
      };

      const getGrupo = () => {
        return row['Nome do Grupo'] || 
               row['Grupo'] || 
               row['GRUPO'] || 
               row['grupo'] || 
               null;
      };

      const getArmazenamento = () => {
        return row['Nome do Armazenamento'] || 
               row['Armazenamento'] || 
               row['ARMAZENAMENTO'] || 
               row['armazenamento'] || 
               null;
      };

      return {
        linha: index + 2, // +2 porque começamos da linha 2 (depois do header)
        'Nome do Produto': getNomeProduto(),
        'Código': getCodigo(),
        'Unidade': row['Unidade'] || row['UNIDADE'] || row['unidade'] || 'UN',
        'Setor': row['Setor'] || row['SETOR'] || row['setor'] || 'AÇOUGUE',
        'Nome do Grupo': getGrupo(),
        'Nome do Armazenamento': getArmazenamento(),
        'Nome do Produto Pai': row['Nome do Produto Pai'] || row['Produto Pai'] || row['PRODUTO PAI'] || null,
        'Estoque Unidade': row['Estoque Unidade'] || row['ESTOQUE UNIDADE'] || null,
        'Estoque Kilo': row['Estoque Kilo'] || row['ESTOQUE KILO'] || null,
        'Dias Validade': row['Dias Validade'] || row['DIAS VALIDADE'] || row['Validade'] || null,
        'Ativo': row['Ativo'] || row['ATIVO'] || row['ativo'] || 'SIM'
      };
    }).filter(item => item['Nome do Produto'] && item['Nome do Produto'].toString().trim() !== '');

    console.log('Dados processados:', rawData);

    if (rawData.length === 0) {
      return { 
        success: false, 
        message: `Nenhum produto válido encontrado no arquivo. Colunas encontradas: ${jsonData.length > 0 ? Object.keys(jsonData[0]).join(', ') : 'Nenhuma'}` 
      };
    }

    const supabase = await createClient();
    
    // Buscar dados de referência
    const [gruposRes, armazenamentosRes, produtosExistentesRes] = await Promise.all([
      supabase.from('grupos').select('*'),
      supabase.from('locais_armazenamento').select('*'),
      supabase.from('produtos').select('id, codigo, nome, originado')
    ]);

    const grupos = gruposRes.data || [];
    const armazenamentos = armazenamentosRes.data || [];
    const produtosExistentes = produtosExistentesRes.data || [];

    // Criar maps para busca rápida
    const produtosPorNome = new Map(produtosExistentes.map(p => [p.nome.toLowerCase(), p]));
    const produtosPorCodigo = new Map(produtosExistentes.map(p => [p.codigo, p]));
    const gruposPorNome = new Map(grupos.map(g => [g.nome?.toLowerCase(), g]));
    const armazenamentosPorNome = new Map(armazenamentos.map(a => [a.armazenamento?.toLowerCase(), a]));

    // Processar cada linha
    const previewData: ProdutoImportPreview[] = [];
    const stats = {
      total: rawData.length,
      toCreate: 0,
      toUpdate: 0,
      conflicts: 0,
      errors: 0
    };

    for (const item of rawData) {
      const preview: ProdutoImportPreview = {
        ...item,
        status: 'create',
        conflicts: [],
        warnings: [],
        skipImport: false,
        grupoExistente: null,
        armazenamentoExistente: null,
        produtoPaiExistente: null,
        produtoExistente: null
      };

      try {
        // Validar nome obrigatório
        if (!item['Nome do Produto']?.trim()) {
          preview.status = 'error';
          preview.conflicts.push('Nome do produto é obrigatório');
          stats.errors++;
          previewData.push(preview);
          continue;
        }

        // Gerar código se não fornecido
        if (!item['Código']) {
          const now = new Date();
          const year = now.getFullYear().toString().slice(-2); // últimos 2 dígitos do ano
          const monthLetter = String.fromCharCode(65 + now.getMonth()); // A=Jan, B=Fev, ..., L=Dez
          const day = now.getDate().toString().padStart(2, '0');
          const seq = item.linha.toString().padStart(3, '0');
          preview['Código'] = `${year}${monthLetter}${day}${seq}`;
          preview.warnings.push('Código será gerado automaticamente');
        }

        // Verificar se produto já existe
        let produtoExistente: any | undefined;
        if (item['Código']) {
          produtoExistente = produtosPorCodigo.get(item['Código']);
        }
        if (!produtoExistente) {
          produtoExistente = produtosPorNome.get(item['Nome do Produto'].toLowerCase());
        }

        if (produtoExistente) {
          preview.produtoExistente = produtoExistente;
          preview.status = 'update';
          preview.warnings.push('Produto existente será atualizado');
          stats.toUpdate++;
        } else {
          stats.toCreate++;
        }

        // Verificar grupo
        if (item['Nome do Grupo']) {
          const grupoExistente = gruposPorNome.get(item['Nome do Grupo'].toLowerCase());
          if (grupoExistente) {
            preview.grupoExistente = grupoExistente;
          } else {
            preview.warnings.push(`Grupo "${item['Nome do Grupo']}" será criado automaticamente`);
          }
        } else {
          preview.warnings.push('Grupo padrão será usado');
        }

        // Verificar armazenamento
        if (item['Nome do Armazenamento']) {
          const armazenamentoExistente = armazenamentosPorNome.get(item['Nome do Armazenamento'].toLowerCase());
          if (armazenamentoExistente) {
            preview.armazenamentoExistente = armazenamentoExistente;
          } else {
            preview.warnings.push(`Armazenamento "${item['Nome do Armazenamento']}" será criado automaticamente`);
          }
        }

        // Verificar produto pai
        if (item['Nome do Produto Pai']) {
          const produtoPaiExistente = produtosPorNome.get(item['Nome do Produto Pai'].toLowerCase());
          if (produtoPaiExistente) {
            preview.produtoPaiExistente = produtoPaiExistente;
          } else {
            preview.warnings.push(`Produto pai "${item['Nome do Produto Pai']}" será criado automaticamente`);
          }
        }

        // Verificar conflitos potenciais
        if (item['Código'] && produtosPorCodigo.has(item['Código']) && 
            produtosPorCodigo.get(item['Código'])?.nome !== item['Nome do Produto']) {
          preview.status = 'conflict';
          preview.conflicts.push(`Código "${item['Código']}" já existe para outro produto`);
          stats.conflicts++;
        }

        // Validações adicionais
        if (item['Estoque Unidade'] && item['Estoque Unidade'] < 0) {
          preview.conflicts.push('Estoque em unidades não pode ser negativo');
        }

        if (item['Estoque Kilo'] && item['Estoque Kilo'] < 0) {
          preview.conflicts.push('Estoque em kilos não pode ser negativo');
        }

        if (item['Dias Validade'] && item['Dias Validade'] < 0) {
          preview.conflicts.push('Dias de validade não pode ser negativo');
        }

        if (preview.conflicts.length > 0) {
          preview.status = 'conflict';
          stats.conflicts++;
        }

      } catch (error) {
        preview.status = 'error';
        preview.conflicts.push(`Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        stats.errors++;
      }

      previewData.push(preview);
    }

    return {
      success: true,
      message: `Arquivo processado: ${stats.total} produtos analisados`,
      data: previewData,
      stats,
      gruposDisponiveis: grupos,
      armazenamentosDisponiveis: armazenamentos,
      produtosDisponiveis: produtosExistentes
    };

  } catch (error) {
    console.error('Erro na pré-visualização:', error);
    return {
      success: false,
      message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    };
  }
}