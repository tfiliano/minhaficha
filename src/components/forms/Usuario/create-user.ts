"use server";

import { Database, Tables } from "@/types/database.types";
import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { SupabaseClient } from "@supabase/supabase-js";

type User = Tables<"usuarios"> & { password: string };

async function findByEmail(supabase: SupabaseClient<Database>, email: string) {
  const { data, error } = await supabase
    .from("usuarios")
    .select()
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createUser(payload: User, loja_id: string) {
  const supabase = await createSupabaseServerAdmin();

  const user: Partial<User> = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    type: payload.type,
  };

  const alreadyUser = await findByEmail(supabase, user.email!);

  if (alreadyUser) {
    await supabase
      .from("loja_usuarios")
      .upsert({
        loja_id,
        tipo: alreadyUser.type,
        user_id: alreadyUser.id,
      })
      .eq("loja_id", loja_id);
    return alreadyUser;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email as string,
    password: user.password as string,
    email_confirm: true,
  });

  user.id = data.user?.id;
  delete user.password;

  await supabase.from("usuarios").insert({ ...user } as any);

  if (error) throw error;

  return createUser(user as any, loja_id);
}
