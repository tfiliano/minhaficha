-- Políticas de Storage para o bucket 'arquivos'
-- Execute este SQL no SQL Editor do Supabase

-- 1. Permitir uploads para usuários autenticados
CREATE POLICY "Allow authenticated uploads to arquivos bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'arquivos'
);

-- 2. Permitir leitura pública (necessário para exibir as imagens)
CREATE POLICY "Allow public read from arquivos bucket"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'arquivos'
);

-- 3. Permitir delete apenas para usuários autenticados (donos do arquivo)
CREATE POLICY "Allow authenticated delete from arquivos bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'arquivos'
);

-- 4. Permitir update para usuários autenticados
CREATE POLICY "Allow authenticated update to arquivos bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'arquivos'
)
WITH CHECK (
  bucket_id = 'arquivos'
);
