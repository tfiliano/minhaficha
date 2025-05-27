export namespace BrasilServiceParams {
  export type Plugin = {
    cep: (cep: string) => Promise<CEP | null>;
    cnpj: (cnpj: string) => Promise<CNPJ | null>;
  };
  export type Location = {
    type: "Point";
    coordinates: {
      longitude: number;
      latitude: number;
    };
  };
  export type CEP = {
    cep: string;
    city: string;
    location: Location;
    neighborhood: string;
    service: string;
    state: string;
    street: string;
    country?: string;
    number?: number | string;
    error?: boolean;
  };

  export type CNPJ = {
    uf: any;
    cep: any;
    qsa: any;
    cnpj: any;
    pais: any;
    email: any;
    porte: any;
    bairro: any;
    numero: any;
    ddd_fax: any;
    municipio: any;
    logradouro: any;
    cnae_fiscal: any;
    codigo_pais: any;
    complemento: any;
    codigo_porte: any;
    razao_social: any;
    nome_fantasia: any;
    capital_social: any;
    ddd_telefone_1: any;
    ddd_telefone_2: any;
    opcao_pelo_mei: any;
    descricao_porte: any;
    codigo_municipio: any;
    cnaes_secundarios: any;
    natureza_juridica: any;
    situacao_especial: any;
    opcao_pelo_simples: any;
    situacao_cadastral: any;
    data_opcao_pelo_mei: any;
    data_exclusao_do_mei: any;
    cnae_fiscal_descricao: any;
    codigo_municipio_ibge: any;
    data_inicio_atividade: any;
    data_situacao_especial: any;
    data_opcao_pelo_simples: any;
    data_situacao_cadastral: any;
    nome_cidade_no_exterior: any;
    codigo_natureza_juridica: any;
    data_exclusao_do_simples: any;
    motivo_situacao_cadastral: any;
    ente_federativo_responsavel: any;
    identificador_matriz_filial: any;
    qualificacao_do_responsavel: any;
    descricao_situacao_cadastral: any;
    descricao_tipo_de_logradouro: any;
    descricao_motivo_situacao_cadastral: any;
    descricao_identificador_matriz_filial: any;
  };
}

type ResponseBrasilServiceData =
  | BrasilServiceParams.CEP
  | BrasilServiceParams.CNPJ
  | null;

const wrapPromise = async <T>(
  promise: Promise<T>
): Promise<{ success: boolean; result: T | null } | null> => {
  try {
    const result = await promise;
    return { success: true, result };
  } catch {
    return { success: false, result: null };
  }
};

export class BrasilService implements BrasilServiceParams.Plugin {
  private readonly url = "https://brasilservice.com.br/api";
  private readonly urlViaCEP = "https://viacep.com.br/ws";
  private readonly urlBrasiAberto = "https://api.brasilaberto.com/v1/zipcode";
  private readonly urlBrasilApi = `https://brasilapi.com.br/api/cep/v1`;
  private readonly urlCNPJWs = "https://publica.cnpj.ws/cnpj";

  async cep(cep: string): Promise<BrasilServiceParams.CEP | null> {
    const controller = new AbortController();
    const signal = controller.signal;

    // Envolvendo BrasilService em uma promessa que nunca rejeita
    const cep1 = this.BrasilService(cep, signal);

    // Envolvendo viaCep em uma promessa que nunca rejeita
    const cep2 = this.viaCep(cep, signal);

    // Envolvendo brasilAbertoCep em uma promessa que nunca rejeita
    const cep3 = this.brasilAbertoCep(cep, signal);

    const cep4 = this.brasilApi(cep, signal);

    try {
      const result = await Promise.any([cep1, cep2, cep3, cep4]);
      if (result && !result.error) {
        console.log(`PluginCEP: ${result?.service}`);
        controller.abort();
        return result;
      }
      return null;
    } catch (error) {
      console.log(error, "error");
      controller.abort();
      return null;
    }
  }

  private async BrasilService(
    cep: string,
    signal?: AbortSignal
  ): Promise<BrasilServiceParams.CEP | null> {
    const request = await fetch(`${this.url}/cep/v2/${cep}`, { signal });
    const response = await request.json();
    return response;
  }

  private async viaCep(
    cep: string,
    signal?: AbortSignal
  ): Promise<BrasilServiceParams.CEP | null> {
    const request = await fetch(`${this.urlViaCEP}/${cep}/json/`, { signal });
    const response = await request.json();

    return {
      ...response,
      city: response.localidade,
      neighborhood: response.bairro,
      service: "viaCep",
      state: response.uf,
      street: response.logradouro,
      country: "BR",
    };
  }

  private async brasilAbertoCep(
    cep: string,
    signal?: AbortSignal
  ): Promise<BrasilServiceParams.CEP | null> {
    const request = await fetch(`${this.urlBrasiAberto}/${cep}`, { signal });
    const response = await request.json();

    return {
      ...response.result,
      cep: response.result.zipcode,
      neighborhood: response.result.bairro || response.result.district,
      service: "brasilAberto",
      state: response.result.stateShortname,
      country: "BR",
    };
  }

  private async brasilApi(
    cep: string,
    signal?: AbortSignal
  ): Promise<BrasilServiceParams.CEP | null> {
    const request = await fetch(`${this.urlBrasilApi}/${cep}`, { signal });
    const response = await request.json();

    return {
      ...response,
      service: "brasilApi",
      country: "BR",
    };
  }

  async cnpj(cnpj: string): Promise<BrasilServiceParams.CNPJ | null> {
    const controller = new AbortController();
    const signal = controller.signal;

    const cnpj1 = this.BrasilServiceCNPJ(cnpj, signal);

    const cnpj2 = this.cnpjWs(cnpj, signal);

    try {
      const result = await Promise.any([cnpj1, cnpj2]);
      if (result) {
        console.log(`PluginCNPJ: ${result?.service}`);
        controller.abort();
        return result;
      }
      return null;
    } catch (error) {
      controller.abort();
      return null;
    }
  }

  private async BrasilServiceCNPJ(cnpj: String, signal?: AbortSignal) {
    const request = await fetch(`${this.url}/cnpj/v1/${cnpj}`, { signal });
    const response = await request.json();
    return response;
  }

  private async cnpjWs(cnpj: string, signal?: AbortSignal) {
    const request = await fetch(`${this.urlCNPJWs}/${cnpj}`, { signal });
    const response = await request.json();

    return {
      ...response,
      ...response.estabelecimento,
      ddd_telefone_1: response.estabelecimento.telefone1,
      descricao_tipo_de_logradouro: `${response.estabelecimento.tipo_logradouro}`,
      logradouro: response.estabelecimento.logradouro,
      uf: response.estabelecimento.estado.sigla,
      municipio: response.estabelecimento.cidade.nome,
    };
  }
}
