"use server";

import { createClient } from "@/utils/supabase";
import { cookies } from "next/headers";

export async function getUsuariosDaLoja() {
  try {
    const supabase = await createClient();
    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    if (!lojaId) {
      return {
        success: false,
        error: "Loja não identificada",
        data: [],
      };
    }

    // Buscar todos os usuários vinculados à loja
    const { data: lojaUsuarios, error: lojaError } = await supabase
      .from("loja_usuarios")
      .select(`
        user_id,
        tipo,
        ativo,
        usuarios (
          id,
          name,
          email,
          type,
          created_at
        )
      `)
      .eq("loja_id", lojaId)
      .order("usuarios(name)");

    if (lojaError) throw lojaError;

    // Formatar dados
    const usuarios = lojaUsuarios?.map((lu: any) => ({
      id: lu.usuarios.id,
      name: lu.usuarios.name,
      email: lu.usuarios.email,
      type: lu.tipo, // Role na loja
      ativo: lu.ativo,
      created_at: lu.usuarios.created_at,
    })) || [];

    return {
      success: true,
      data: usuarios,
    };
  } catch (error: any) {
    console.error("Erro ao buscar usuários:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

export async function getUsuarioById(id: string) {
  try {
    const supabase = await createClient();
    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    if (!lojaId) {
      return { success: false, error: "Loja não identificada", data: null };
    }

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    // Buscar role na loja
    const { data: lojaUsuario } = await supabase
      .from("loja_usuarios")
      .select("tipo, ativo")
      .eq("user_id", id)
      .eq("loja_id", lojaId)
      .single();

    return {
      success: true,
      data: {
        ...usuario,
        type: lojaUsuario?.tipo || usuario.type,
        ativo: lojaUsuario?.ativo,
      },
    };
  } catch (error: any) {
    console.error("Erro ao buscar usuário:", error);
    return {
      success: false,
      error: error.message,
      data: null,
    };
  }
}

export async function updateUsuarioRole(userId: string, tipo: string, ativo: boolean) {
  try {
    const supabase = await createClient();
    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    if (!lojaId) {
      return { success: false, error: "Loja não identificada" };
    }

    // Atualizar role na tabela loja_usuarios
    const { error } = await supabase
      .from("loja_usuarios")
      .update({ tipo, ativo })
      .eq("user_id", userId)
      .eq("loja_id", lojaId);

    if (error) throw error;

    return {
      success: true,
      message: "Permissões do usuário atualizadas com sucesso!",
    };
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function toggleUsuarioAtivo(userId: string, ativo: boolean) {
  try {
    const supabase = await createClient();
    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    if (!lojaId) {
      return { success: false, error: "Loja não identificada" };
    }

    const { error } = await supabase
      .from("loja_usuarios")
      .update({ ativo })
      .eq("user_id", userId)
      .eq("loja_id", lojaId);

    if (error) throw error;

    return {
      success: true,
      message: `Usuário ${ativo ? "ativado" : "desativado"} com sucesso!`,
    };
  } catch (error: any) {
    console.error("Erro ao toggle usuário:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getPendingInvites() {
  try {
    const supabase = await createClient();
    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    if (!lojaId) {
      return { success: false, error: "Loja não identificada", data: [] };
    }

    const { data: invites, error } = await supabase
      .from("loja_convites")
      .select(`
        id,
        email,
        tipo,
        status,
        token,
        expires_at,
        created_at,
        invited_by,
        usuarios!loja_convites_invited_by_fkey (
          name
        )
      `)
      .eq("loja_id", lojaId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: invites || [],
    };
  } catch (error: any) {
    console.error("Erro ao buscar convites:", error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

export async function cancelInvite(inviteId: string) {
  try {
    const supabase = await createClient();
    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    if (!lojaId) {
      return { success: false, error: "Loja não identificada" };
    }

    // Deletar o convite ao invés de marcar como expired
    // Isso evita problemas com a constraint UNIQUE (loja_id, email, status)
    const { error } = await supabase
      .from("loja_convites")
      .delete()
      .eq("id", inviteId)
      .eq("loja_id", lojaId);

    if (error) throw error;

    return {
      success: true,
      message: "Convite cancelado com sucesso!",
    };
  } catch (error: any) {
    console.error("Erro ao cancelar convite:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function resendInvite(inviteId: string) {
  try {
    const supabase = await createClient();
    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();

    if (!lojaId || !user) {
      return { success: false, error: "Loja ou usuário não identificado" };
    }

    // Buscar o convite
    const { data: invite, error: inviteError } = await supabase
      .from("loja_convites")
      .select("email, tipo, token")
      .eq("id", inviteId)
      .eq("loja_id", lojaId)
      .eq("status", "pending")
      .single();

    if (inviteError || !invite) {
      return {
        success: false,
        error: "Convite não encontrado"
      };
    }

    // Buscar dados da loja e do usuário
    const { data: loja } = await supabase
      .from("lojas")
      .select("nome")
      .eq("id", lojaId)
      .single();

    const { data: currentUser } = await supabase
      .from("usuarios")
      .select("name")
      .eq("id", user.id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/accept-invite?token=${invite.token}`;

    // Enviar email via Brevo
    try {
      const { sendInviteEmail } = await import("@/lib/brevo");
      await sendInviteEmail(
        invite.email,
        invite.email.split("@")[0],
        currentUser?.name || "Administrador",
        inviteLink,
        loja?.nome || "Loja"
      );
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
      // Continua mesmo se o email falhar
    }

    return {
      success: true,
      message: "Convite reenviado com sucesso!",
      inviteLink,
    };
  } catch (error: any) {
    console.error("Erro ao reenviar convite:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function inviteUser(email: string, tipo: string) {
  try {
    const supabase = await createClient();
    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();

    if (!lojaId || !user) {
      return { success: false, error: "Loja ou usuário não identificado" };
    }

    // Buscar dados da loja e do usuário
    const { data: loja } = await supabase
      .from("lojas")
      .select("nome")
      .eq("id", lojaId)
      .single();

    const { data: currentUser } = await supabase
      .from("usuarios")
      .select("name")
      .eq("id", user.id)
      .single();

    // Verificar se já existe um convite pendente
    const { data: existingInvite } = await supabase
      .from("loja_convites")
      .select("id")
      .eq("loja_id", lojaId)
      .eq("email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvite) {
      return {
        success: false,
        error: "Já existe um convite pendente para este email"
      };
    }

    // Gerar token único
    const token = crypto.randomUUID();

    // Data de expiração: 7 dias
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Criar convite
    const { error } = await supabase
      .from("loja_convites")
      .insert({
        loja_id: lojaId,
        email,
        tipo,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      });

    if (error) throw error;

    // Usar NEXT_PUBLIC_URL ou construir a URL baseada no host
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/accept-invite?token=${token}`;

    // Enviar email via Brevo
    try {
      const { sendInviteEmail } = await import("@/lib/brevo");
      await sendInviteEmail(
        email,
        email.split("@")[0], // Nome temporário baseado no email
        currentUser?.name || "Administrador",
        inviteLink,
        loja?.nome || "Loja"
      );
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
      // Continua mesmo se o email falhar - o convite foi criado
    }

    return {
      success: true,
      message: "Convite enviado com sucesso!",
      inviteLink,
    };
  } catch (error: any) {
    console.error("Erro ao enviar convite:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
