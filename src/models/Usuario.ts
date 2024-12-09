import { Tables } from "@/types/database.types";
import { UsuarioClass } from "@/utils/decorators/usuario";

export const UsuarioTypes = {
  master: "Administrador",
  operator: "Operador",
  manager: "Gerente",
};

type USER = Tables<"usuarios">;

@UsuarioClass
export class Usuario implements USER {
  ativo!: boolean;
  avatar!: string | null;
  created_at!: string;
  email!: string | null;
  id!: string;
  name!: string | null;
  type!: string;

  constructor(usuario: USER) {
    Object.assign(this, usuario);
  }
}
