import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, camelize } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("pratos").select("*").order("id");
    if (error) throw error;
    return NextResponse.json(camelize(data || []));
  } catch {
    return NextResponse.json({ error: "Erro ao buscar pratos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, limite } = body;
    if (!nome || !limite) {
      return NextResponse.json({ error: "Nome e limite são obrigatórios" }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from("pratos").insert({ nome, limite }).select();
    if (error) throw error;
    return NextResponse.json(camelize(data?.[0]), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar prato" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nome, limite, quantidade_escolhida } = body;
    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }
    const updates: Record<string, unknown> = {};
    if (nome !== undefined) updates.nome = nome;
    if (limite !== undefined) updates.limite = limite;
    if (quantidade_escolhida !== undefined) updates.quantidade_escolhida = quantidade_escolhida;
    const { data, error } = await supabaseAdmin
      .from("pratos").update(updates).eq("id", id).select();
    if (error) throw error;
    return NextResponse.json(camelize(data?.[0]));
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar prato" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }
    const { error } = await supabaseAdmin.from("pratos").delete().eq("id", parseInt(id));
    if (error) throw error;
    return NextResponse.json({ message: "Prato excluído com sucesso" });
  } catch {
    return NextResponse.json({ error: "Erro ao excluir prato" }, { status: 500 });
  }
}
