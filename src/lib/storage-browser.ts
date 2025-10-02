import { createBrowserClient } from "@/utils/supabase-browser";

export interface FileStorageResult {
  success: boolean;
  path?: string;
  error?: string;
}

export async function uploadFichaTecnicaFoto(
  file: File,
  lojaId: string,
  fichaTecnicaId: string
): Promise<FileStorageResult> {
  try {
    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de arquivo inválido. Use JPG, PNG ou WebP.'
      };
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB.'
      };
    }

    const supabase = createBrowserClient();

    // Gerar nome único para o arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = file.name.split('.').pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;
    const filePath = `fichas-tecnicas/${lojaId}/${fichaTecnicaId}/${fileName}`;

    // Upload do arquivo para o Supabase Storage
    const { data, error } = await supabase.storage
      .from('arquivos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Erro no upload:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('arquivos')
      .getPublicUrl(data.path);

    return {
      success: true,
      path: publicUrl
    };

  } catch (error) {
    console.error('Erro no upload da foto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
