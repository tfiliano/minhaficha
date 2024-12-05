/**
 * Função para limpar e deixar apenas os números de um CPF ou CNPJ
 * @param {string} value - O CPF ou CNPJ com ou sem máscara
 * @returns {string} - Apenas os números do CPF ou CNPJ
 */
export const cleanDocument = (value: string) => {
  // Remove todos os caracteres que não são números
  return value.replace(/\D/g, "");
};
