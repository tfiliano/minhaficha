"use client";

import { Forms } from "@/components/forms";
import { GrupoProps } from "@/components/forms/Grupos";

export function GruposUpdateClient({ ...props }: GrupoProps) {
  return <Forms.Grupos.Update {...props} />;
}
