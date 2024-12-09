import * as databaseTypes from "@/types/database.types";
import { UsuarioClass } from "@/utils/decorators/usuario";

export const UsuarioTypes = {
  master: "Administrador",
  operator: "Operador",
  manager: "Gerente",
};

@UsuarioClass
export class Usuario implements databaseTypes.Tables<"usuarios"> {
  ativo!: boolean;
  avatar!: string | null;
  created_at!: string;
  email!: string | null;
  id!: string;
  name!: string | null;
  type!: string;

  constructor(usuario: databaseTypes.Tables<"usuarios">) {
    Object.assign(this, usuario);
  }
}
