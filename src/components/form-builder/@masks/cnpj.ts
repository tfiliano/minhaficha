export const normalizeCnpj = (value: string) => {
  // Remove todos os caracteres não numéricos
  const cleanedValue = String(value).replace(/\D/g, "");

  console.log({ cleanedValue });

  // Se o valor estiver vazio, retorna uma string vazia
  const limitedValue = cleanedValue.substring(0, 14);

  // Aplica a máscara de CNPJ
  return limitedValue
    .replace(/(\d{2})(\d)/, "$1.$2") // Primeiro ponto
    .replace(/(\d{3})(\d)/, "$1.$2") // Segundo ponto
    .replace(/(\d{3})(\d{1,4})/, "$1/$2") // Barra
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2"); // Traço
};
