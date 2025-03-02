# Serviço de Impressão

Aplicativo Electron para gerenciamento de impressoras e fila de impressão ZPL.

## Funcionalidades

- **Lista de Impressoras**: Visualize e gerencie impressoras cadastradas
  - Verificação de status online/offline
  - Teste de conexão com impressoras

- **Fila de Impressão**: Monitore e gerencie trabalhos de impressão
  - Visualização de status (pendente, imprimindo, concluído, falha)
  - Cancelamento de trabalhos pendentes
  - Reenvio de trabalhos com falha

## Requisitos

- Node.js 16+
- NPM ou Yarn
- Acesso ao Supabase (URL e chave de serviço)

## Configuração

1. Clone o repositório
2. Instale as dependências:

```bash
cd print-service
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais do Supabase:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_KEY=sua_chave_de_servico_do_supabase
POLL_INTERVAL=5000
```

## Execução

Para executar em modo de desenvolvimento:

```bash
npm run dev
```

Para iniciar normalmente:

```bash
npm start
```

## Compilação

Para compilar o aplicativo para distribuição:

```bash
npm run build
```

Os arquivos compilados estarão disponíveis na pasta `dist`.

## Estrutura do Banco de Dados

O aplicativo espera as seguintes tabelas no Supabase:

### Tabela `impressoras`

- `id`: UUID (chave primária)
- `nome`: String (nome da impressora)
- `ip`: String (endereço IP)
- `port`: Number (porta, padrão 9100)
- `created_at`: Timestamp

### Tabela `etiquetas` (trabalhos de impressão)

- `id`: UUID (chave primária)
- `impressora_id`: UUID (referência à tabela impressoras)
- `command`: String (comando ZPL)
- `status`: String (pending, printing, completed, failed, cancelled)
- `error_message`: String (mensagem de erro, se houver)
- `created_at`: Timestamp
