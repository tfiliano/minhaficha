import { Operacao } from "@/components/pages";
import { cookies } from "next/headers";

export default async function Home() {
  const tipo_usuario = (await cookies()).get(
    "minhaficha_loja_user_tipo"
  )?.value;

  return <Operacao tipoUsuario={tipo_usuario} />;
}
