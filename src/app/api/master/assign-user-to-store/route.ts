import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userEmail, lojaId, tipo = "admin" } = await request.json();

    if (!userEmail || !lojaId) {
      return NextResponse.json({ 
        error: "Email do usuário e ID da loja são obrigatórios" 
      }, { status: 400 });
    }

    console.log("Atribuindo usuário à loja:", { userEmail, lojaId, tipo });

    const supabase = await createSupabaseServerAdmin();

    // 1. Buscar usuário pelo email na tabela usuarios
    const { data: usuario, error: userError } = await supabase
      .from("usuarios")
      .select("id, name, email")
      .eq("email", userEmail)
      .maybeSingle();
    
    if (userError) {
      console.error("Erro ao buscar usuário:", userError);
      return NextResponse.json({ 
        error: "Erro ao buscar usuário" 
      }, { status: 500 });
    }

    if (!usuario) {
      console.error("Usuário não encontrado:", userEmail);
      return NextResponse.json({ 
        error: "Usuário não encontrado. O usuário precisa estar cadastrado no sistema primeiro." 
      }, { status: 404 });
    }

    const userId = usuario.id;
    console.log("Usuário encontrado:", userId, usuario.name);

    // 2. Verificar se já existe associação
    const { data: existingAssoc } = await supabase
      .from("loja_usuarios")
      .select("id")
      .eq("user_id", userId)
      .eq("loja_id", lojaId)
      .maybeSingle();

    if (existingAssoc) {
      return NextResponse.json({ 
        error: "Usuário já está associado a esta loja" 
      }, { status: 409 });
    }

    // 3. Criar associação usuário-loja
    const { error: assocError } = await supabase
      .from("loja_usuarios")
      .insert({
        user_id: userId,
        loja_id: lojaId,
        tipo: tipo,
        ativo: true
      });

    if (assocError) {
      console.error("Erro ao associar usuário à loja:", assocError);
      return NextResponse.json({ 
        error: "Erro ao associar usuário à loja" 
      }, { status: 500 });
    }

    console.log("Usuário associado à loja com sucesso!");

    return NextResponse.json({ 
      success: true, 
      message: `Usuário ${userEmail} foi associado à loja como ${tipo}`,
      userId: userId
    });

  } catch (error: any) {
    console.error("Erro na API assign-user-to-store:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}