import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase";
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
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-center  p-4">
        <h1 className="text-3xl font-bold mb-8 text-primary text-center">
          Qual loja deseja acessar?
        </h1>
        <div
          className={cn("grid gap-6 mb-16 mx-auto group", {
            "grid-cols-2": (lojas || []).length < 3,
            "grid-cols-3": (lojas || []).length >= 3,
          })}
        >
          {(lojas || []).map(({ loja, tipo }) => (
            <ButtonGarageSelect key={loja!.id} loja={loja} tipo={tipo} />
          ))}
        </div>
      </main>
    </div>
  );
}
