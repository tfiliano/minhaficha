type QueryResult<T> = {
  success: boolean;
  data: T | null;
  message: string;
};

/**
 * Função genérica para executar requisições ao Supabase
 * @param supabaseQuery - Callback que executa a query do Supabase
 * @returns {QueryResult<T>} - Resultado da requisição
 */
export async function executeQuery<K, T>(
  supabaseQuery: () => K
): Promise<QueryResult<T>> {
  try {
    const { data, error, status } = (await supabaseQuery()) as {
      data: any;
      error: any;
      status: any;
    };

    if (error) {
      console.error(
        `Supabase error [${status}]: ${error.message}`,
        error.details
      );
      return {
        success: false,
        data: null,
        message: parseErrorMessage(error),
      };
    }

    return {
      success: true,
      data,
      message: "Tudo certo ✅",
    };
  } catch (err: any) {
    console.error("Erro inesperado:", err);
    return {
      success: false,
      data: null,
      message: "Erro inesperado. Por favor, tente novamente mais tarde.",
    };
  }
}

/**
 * Gera mensagens de erro amigáveis com base no código ou mensagem do erro
 * @param error - Objeto de erro retornado pelo Supabase
 * @returns {string} - Mensagem de erro amigável
 */
function parseErrorMessage(error: any): string {
  if (!error) return "Erro desconhecido";

  switch (error.code) {
    case "PGRST116": // Erro de autorização
      return "Você não tem permissão para acessar esses dados.";
    case "PGRST002": // Erro de tabela ou coluna
      return "Dados solicitados não encontrados.";
    default:
      if (error.message.includes("Network Error")) {
        return "Erro de conexão. Verifique sua internet.";
      }
      if (error.message) return `Erro ao processar: ${error.message}`;
      return "Erro ao processar a solicitação. Por favor, tente novamente.";
  }
}
