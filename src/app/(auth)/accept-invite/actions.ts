"use server";

import { createClient } from "@/utils/supabase";
import { cookies } from "next/headers";

const ROLES = [
  { value: "master", label: "Master" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Gerente" },
  { value: "operator", label: "Operador" },
  { value: "user", label: "Usuário" },
];

export async function validateInviteToken(token: string) {
  try {
    const supabase = await createClient();

    // Buscar convite
    const { data: invite, error } = await supabase
      .from("loja_convites")
      .select(`
        id,
        email,
        tipo,
        loja_id,
        expires_at,
        lojas (
          nome
        ),
        usuarios!loja_convites_invited_by_fkey (
          name
        )
      `)
      .eq("token", token)
      .eq("status", "pending")
      .single();

    if (error || !invite) {
      return {
        success: false,
        error: "Convite não encontrado ou já utilizado",
      };
    }

    // Verificar se expirou
    if (new Date(invite.expires_at) < new Date()) {
      // Marcar como expirado
      await supabase
        .from("loja_convites")
        .update({ status: "expired" })
        .eq("id", invite.id);

      return {
        success: false,
        error: "Este convite expirou",
      };
    }

    // Verificar se usuário já existe
    const { data: existingUser } = await supabase
      .from("usuarios")
      .select("id, name")
      .eq("email", invite.email)
      .maybeSingle();

    const roleLabel = ROLES.find((r) => r.value === invite.tipo)?.label || invite.tipo;

    return {
      success: true,
      data: {
        inviteId: invite.id,
        email: invite.email,
        lojaNome: (invite.lojas as any)?.nome || "Loja",
        lojaId: invite.loja_id,
        tipo: invite.tipo,
        roleLabel,
        inviterName: (invite.usuarios as any)?.name || "Administrador",
        needsAccount: !existingUser,
        existingUserId: existingUser?.id,
      },
    };
  } catch (error: any) {
    console.error("Erro ao validar token:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function acceptInvite(
  token: string,
  userData?: { name: string; password: string }
) {
  try {
    const supabase = await createClient();

    // Validar token novamente
    const validation = await validateInviteToken(token);
    if (!validation.success) {
      return validation;
    }

    const inviteData = validation.data;
    let userId = inviteData.existingUserId;

    // Se precisa criar conta
    if (inviteData.needsAccount) {
      if (!userData) {
        return {
          success: false,
          error: "Dados de usuário não fornecidos",
        };
      }

      // Criar usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inviteData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) {
        return {
          success: false,
          error: "Erro ao criar conta",
        };
      }

      userId = authData.user.id;

      // Criar registro na tabela usuarios
      const { error: userError } = await supabase
        .from("usuarios")
        .insert({
          id: userId,
          email: inviteData.email,
          name: userData.name,
          type: "user", // Type global padrão
        });

      if (userError) throw userError;
    } else {
      // Usuário já existe, fazer login
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: inviteData.email,
        password: userData?.password || "",
      });

      if (signInError) {
        return {
          success: false,
          error: "Erro ao fazer login. Verifique sua senha.",
        };
      }
    }

    // Verificar se já está vinculado à loja
    const { data: existingLink } = await supabase
      .from("loja_usuarios")
      .select("id")
      .eq("user_id", userId!)
      .eq("loja_id", inviteData.lojaId)
      .maybeSingle();

    if (!existingLink) {
      // Vincular usuário à loja
      const { error: linkError } = await supabase
        .from("loja_usuarios")
        .insert({
          user_id: userId!,
          loja_id: inviteData.lojaId,
          tipo: inviteData.tipo,
          ativo: true,
        });

      if (linkError) throw linkError;
    }

    // Marcar convite como aceito
    const { error: updateError } = await supabase
      .from("loja_convites")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", inviteData.inviteId);

    if (updateError) throw updateError;

    // Definir cookie da loja
    (await cookies()).set("minhaficha_loja_id", inviteData.lojaId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return {
      success: true,
      message: inviteData.needsAccount
        ? "Conta criada e convite aceito com sucesso!"
        : "Convite aceito com sucesso!",
    };
  } catch (error: any) {
    console.error("Erro ao aceitar convite:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
