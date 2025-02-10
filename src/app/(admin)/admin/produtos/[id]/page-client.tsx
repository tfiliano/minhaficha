"use client";

import { Forms } from "@/components/forms";
import { ProdutoProps } from "@/components/forms/produtos";

export function ProdutoUpdateClient({ ...props }: ProdutoProps) {
  return <Forms.Produto.Update {...props} />;
}
