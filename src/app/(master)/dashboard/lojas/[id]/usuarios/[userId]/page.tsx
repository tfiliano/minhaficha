import { Tables } from "@/types/database.types";
import { createClient } from "@/utils/supabase";
import { UserPageClient } from "./page-client";

async function getUser(id: string, loja_id: string) {
  const supabase = await createClient();
  const { data: usuario, error } = await supabase
    .from("loja_usuarios")
    .select("*,usuario:usuarios(*)")
    .eq("user_id", id)
    .eq("loja_id", loja_id)
    .maybeSingle();
  return { ...usuario?.usuario, type: usuario?.tipo } as Tables<"usuarios">;
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const { id, userId } = await params;

  const user = await getUser(userId!, id);
  return <UserPageClient loja_id={id} user={user!} />;
}
