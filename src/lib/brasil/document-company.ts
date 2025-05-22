import { BrasilService } from "./brasil-service";

export async function retriveCompanyDocument(
  input: string | React.ChangeEvent<HTMLInputElement>
) {
  let documentNumber = input;

  if (
    typeof input === "object" &&
    input !== null &&
    "target" in input &&
    "value" in input.target
  ) {
    documentNumber = input.target.value;
  }

  const postalCodeWithoutFormatting = String(documentNumber)?.replace(
    /\D/g,
    ""
  );
  if (postalCodeWithoutFormatting?.length < 14) return;

  const brasil = new BrasilService();
  const result = await brasil.cnpj(postalCodeWithoutFormatting);

  if (result) {
    const {
      nome_fantasia: trading_name,
      razao_social: name,
      ddd_telefone_1: phone,
      numero: number,
      descricao_tipo_de_logradouro,
      logradouro,
      cep,
      complemento: complement,
      bairro: neighborhood,
      uf,
      municipio,
    } = result;

    return {
      trading_name,
      name,
      nome: name,
      phone,
      address: {
        number,
        street: `${descricao_tipo_de_logradouro} ${logradouro}`,
        cep,
        complement,
        neighborhood,
        state: uf,
        city: municipio,
      },
    };
  }
}
