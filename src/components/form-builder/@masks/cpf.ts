export const normalizeCpf = (value: string) => {
  // Remove todos os caracteres não numéricos
  const cleanedValue = String(value).replace(/\D/g, "");

  // Se o valor estiver vazio, retorna uma string vazia
  const limitedValue = cleanedValue.substring(0, 11);

  // Aplica a máscara de CPF
  return limitedValue
    .replace(/(\d{3})(\d)/, "$1.$2") // Primeiro ponto
    .replace(/(\d{3})(\d)/, "$1.$2") // Segundo ponto
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Traço
};
