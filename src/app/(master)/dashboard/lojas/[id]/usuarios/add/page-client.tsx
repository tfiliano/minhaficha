"use client";

import { Forms } from "@/components/forms";

export function UserPageClient({ loja_id }: { loja_id: string }) {
  return <Forms.Usuarios.Create loja_id={loja_id} />;
}
