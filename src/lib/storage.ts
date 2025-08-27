import { createClient } from "@/utils/supabase";

export interface FileStorageResult {
  success: boolean;
  path?: string;
  error?: string;
}

export async function uploadImportFile(
  file: File,
  lojaId: string,
  usuarioId: string
): Promise<FileStorageResult> {
  try {
    const supabase = await createClient();
    
    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `imports/${lojaId}/${fileName}`;
    
    // Upload do arquivo para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('arquivos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      path: data.path
    };
    
  } catch (error) {
    console.error('Erro no upload do arquivo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export async function saveImportHistory({
  lojaId,
  usuarioId,
  fileName,
  filePath,
  fileSize,
  mimeType,
  stats
}: {
  lojaId: string;
  usuarioId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  stats: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
  };
}): Promise<{ success: boolean; importId?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('import_history')
      .insert({
        loja_id: lojaId,
        usuario_id: usuarioId,
        arquivo_nome: fileName,
        arquivo_path: filePath,
        arquivo_size: fileSize,
        arquivo_mime_type: mimeType,
        total_linhas: stats.total,
        linhas_processadas: stats.created + stats.updated + stats.skipped + stats.errors,
        linhas_criadas: stats.created,
        linhas_atualizadas: stats.updated,
        linhas_puladas: stats.skipped,
        linhas_com_erro: stats.errors,
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Erro ao salvar histórico:', error);
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      importId: data.id
    };
    
  } catch (error) {
    console.error('Erro ao salvar histórico de importação:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export async function saveImportDetails(
  importHistoryId: string,
  details: Array<{
    linha_numero: number;
    produto_id?: string;
    produto_codigo?: string;
    produto_nome: string;
    acao: 'created' | 'updated' | 'skipped' | 'error';
    dados_originais: any;
    dados_processados?: any;
    erro_message?: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Inserir detalhes em lotes para performance
    const batchSize = 100;
    for (let i = 0; i < details.length; i += batchSize) {
      const batch = details.slice(i, i + batchSize).map(detail => ({
        import_history_id: importHistoryId,
        ...detail
      }));
      
      const { error } = await supabase
        .from('import_history_details')
        .insert(batch);
      
      if (error) {
        console.error('Erro ao salvar detalhes:', error);
        return {
          success: false,
          error: error.message
        };
      }
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Erro ao salvar detalhes da importação:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}