"use server";

import { createClient } from "@/utils/supabase";

export async function sendPasswordResetEmail(email: string) {
  try {
    const supabase = await createClient();

    // Buscar usuário
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("name")
      .eq("email", email)
      .single();

    if (!usuario) {
      // Não revelar se o usuário existe ou não por segurança
      return {
        success: true,
        message: "Se o email existir, você receberá um link de recuperação."
      };
    }

    // Gerar link de recuperação usando Supabase Auth
    // IMPORTANTE: Configurar no Supabase Dashboard para NÃO enviar email automático
    // Settings > Auth > Email Templates > Desabilitar "Enable email confirmations"
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/auth/reset-password`,
    });

    if (error) throw error;

    // Enviar email APENAS via Brevo
    const { sendPasswordResetEmail: sendBrevoEmail } = await import("@/lib/brevo");

    // Construir o link de reset - o Supabase enviará o token via query params
    const resetLink = `${baseUrl}/auth/reset-password`;

    await sendBrevoEmail(
      email,
      usuario.name || email.split("@")[0],
      resetLink
    );

    return {
      success: true,
      message: "Email de recuperação enviado com sucesso!"
    };
  } catch (error: any) {
    console.error("Erro ao enviar email de recuperação:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function sendMagicLink(email: string) {
  try {
    const supabase = await createClient();

    // Buscar usuário
    const { data: usuario } = await supabase
      .from("usuarios")
      .select("name, id")
      .eq("email", email)
      .single();

    if (!usuario) {
      // Não revelar se o usuário existe ou não por segurança
      return {
        success: true,
        message: "Se o email existir, você receberá um link de acesso."
      };
    }

    // Criar nosso próprio sistema de magic link
    // Gerar token único
    const token = crypto.randomUUID();
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    // Criar registro de magic link na tabela (vamos criar)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

    // Por enquanto, vamos usar a mesma tabela de convites adaptada ou criar nova
    // Temporariamente, usar resetPasswordForEmail do Supabase que funciona
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/home`,
    });

    if (error) throw error;

    // Enviar email via Brevo
    const { sendMagicLinkEmail } = await import("@/lib/brevo");

    // Link que será enviado - o Supabase gerará o token e enviará para /home
    const magicLink = `${baseUrl}/home`;

    await sendMagicLinkEmail(
      email,
      usuario.name || email.split("@")[0],
      magicLink
    );

    return {
      success: true,
      message: "Link mágico enviado com sucesso!"
    };
  } catch (error: any) {
    console.error("Erro ao enviar magic link:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
