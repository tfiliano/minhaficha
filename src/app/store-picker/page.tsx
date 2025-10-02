import { createClient } from "@/utils/supabase";
import { Lightbulb } from "lucide-react";
import { redirect } from "next/navigation";
import { ButtonGarageSelect } from "./button-garage-select";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/auth/login");

  const { data: lojas } = await supabase
    .from("loja_usuarios")
    .select("*,loja:lojas(*)")
    .eq("user_id", user.id);

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
            <Lightbulb className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-3">
            Minha Ficha
          </h1>
          <p className="text-lg text-muted-foreground">
            Selecione a loja que deseja acessar
          </p>
        </div>

        {/* Grid de lojas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {(lojas || []).map(({ loja, tipo }) => (
            <ButtonGarageSelect key={loja!.id} loja={loja} tipo={tipo} />
          ))}
        </div>
      </div>
    </div>
  );
}
