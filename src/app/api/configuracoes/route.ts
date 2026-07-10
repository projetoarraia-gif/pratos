import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("configuracoes").select("*");
    if (error) throw error;
    const config: Record<string, string> = {};
    (data || []).forEach(c => { config[c.chave] = c.valor; });
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    for (const [chave, valor] of Object.entries(body)) {
      const { data: existing } = await supabaseAdmin
        .from("configuracoes").select("*").eq("chave", chave);
      if (existing && existing.length > 0) {
        await supabaseAdmin.from("configuracoes").update({ valor: valor as string }).eq("chave", chave);
      } else {
        await supabaseAdmin.from("configuracoes").insert({ chave, valor: valor as string });
      }
    }
    return NextResponse.json({ message: "Configurações atualizadas com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
  }
}
