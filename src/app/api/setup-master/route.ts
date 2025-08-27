import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    console.log("Configurando usuário master:", email);

    const supabase = await createSupabaseServerAdmin();

    // Buscar usuário na tabela usuarios pelo email
    const { data: usuarios, error: userError } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (userError) {
      console.error("Erro ao buscar usuário:", userError);
      return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
    }

    if (!usuarios) {
      console.error("Usuário não encontrado:", email);
      return NextResponse.json({ error: "Usuário não encontrado na base de dados" }, { status: 404 });
    }

    console.log("Usuário encontrado:", usuarios.id);

    // Adicionar usuário à tabela usuarios_masters
    const { error: masterError } = await supabase
      .from("usuarios_masters")
      .upsert({
        id: usuarios.id,
        is_active: true
      }, {
        onConflict: 'id'
      });

    if (masterError) {
      console.error("Erro ao criar master:", masterError);
      return NextResponse.json({ error: "Erro ao criar usuário master" }, { status: 500 });
    }

    console.log("Usuário adicionado como master com sucesso!");

    return NextResponse.json({ 
      success: true, 
      message: "Usuário configurado como master",
      userId: usuarios.id
    });

  } catch (error: any) {
    console.error("Erro na API setup-master:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}