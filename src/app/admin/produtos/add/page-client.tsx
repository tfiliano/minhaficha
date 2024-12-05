"use client";

import { Forms } from "@/components/forms";
import { ProdutoProps } from "@/components/forms/produtos";

export function ProdutoAddClient({ ...props }: ProdutoProps) {
  return <Forms.Produto.Create {...props} />;
}
