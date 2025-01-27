"use server";

import { createClient } from "@/utils/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(formData: any) {
  try {
    const supabase = createClient();

    const { error, data } = await supabase.auth.signInWithPassword(formData);

    if (error) throw error;

    revalidatePath("/", "layout");
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logout() {
  try {
    const supabase = createClient();

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
