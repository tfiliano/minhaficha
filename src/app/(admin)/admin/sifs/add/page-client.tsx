"use client";

import { Forms } from "@/components/forms";
import { SIFProps } from "@/components/forms/SIF";

export function SifAddClient({ ...props }: SIFProps) {
  return <Forms.SIF.Create {...props} />;
}
