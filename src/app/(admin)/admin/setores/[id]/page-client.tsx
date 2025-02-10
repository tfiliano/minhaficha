"use client";

import { Forms } from "@/components/forms";
import { SetorProps } from "@/components/forms/Setores";

export function SetoresUpdateClient({ ...props }: SetorProps) {
  return <Forms.Setores.Update {...props} />;
}
