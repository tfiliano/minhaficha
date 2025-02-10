"use client";

import { Forms } from "@/components/forms";
import { SIFProps } from "@/components/forms/SIF";

export function SIFUpdateClient({ ...props }: SIFProps) {
  return <Forms.SIF.Update {...props} />;
}
