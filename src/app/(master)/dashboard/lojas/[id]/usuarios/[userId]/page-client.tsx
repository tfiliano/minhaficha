"use client";

import { Forms } from "@/components/forms";
import { UsuarioProps } from "@/components/forms/Usuario";

export function UserPageClient({
  loja_id,
  user,
}: UsuarioProps & { loja_id: string }) {
  return (
    <Forms.Usuarios.Update user={user} loja_id={loja_id} keyProp={"user_id"} />
  );
}
