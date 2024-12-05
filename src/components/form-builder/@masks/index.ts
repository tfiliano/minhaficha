import { normalizeCnpj } from "./cnpj";
import { normalizeCpf } from "./cpf";
import { normalizePhoneNumber } from "./phone-number";

export const Masks = {
  phone: normalizePhoneNumber,
  cnpj: normalizeCnpj,
  cpf: normalizeCpf,
};

export type FieldMask = keyof typeof Masks;
