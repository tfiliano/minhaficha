"use server";

import { createClient } from "@/utils/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: any) {
  try {
    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword(formData);

    if (error) throw error;

    const loja = await getStoreUser(data.user.id);

    if (!loja || "error" in loja) {
      await logout();
      throw new Error("Usuário não autorizado a acessar a loja");
    }

    (await cookies()).set("minhaficha_loja_id", loja.loja_id!, {
      httpOnly: false,
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }

  redirect("/auth/login");
}

async function getStoreUser(user_id: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("loja_usuarios")
      .select("*")
      .eq("id", user_id)
      .eq("ativo", true)
      .single();

    console.log({ data, error });
    if (error) throw error;
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}
