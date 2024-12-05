"use client";

import { Forms } from "@/components/forms";
import { FabricanteProps } from "@/components/forms/Fabricantes";

export function FabricantesUpdateClient({ ...props }: FabricanteProps) {
  return <Forms.Fabricantes.Update {...props} />;
}
