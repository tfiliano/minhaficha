import React from "react";
import { BrasilService } from "./brasil-service";

export function retrivePostalCode(
  input: string | React.ChangeEvent<HTMLInputElement>
) {
  let postalCode = input;
  if (
    typeof input === "object" &&
    input !== null &&
    "target" in input &&
    "value" in input.target
  ) {
    postalCode = input.target.value;
  }

  const postalCodeWithoutFormatting = String(postalCode)?.replace(/\D/g, "");
  if (postalCodeWithoutFormatting?.length < 8) return;

  const brasil = new BrasilService();
  return brasil.cep(postalCodeWithoutFormatting);
}
