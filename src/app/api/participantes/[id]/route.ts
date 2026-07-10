import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, camelize } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("participantes").select("*").eq("id", parseInt(id));
    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
    }
    return NextResponse.json(camelize(data[0]));
  } catch {
    return NextResponse.json({ error: "Erro ao buscar participante" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, cpf, telefone, departamento, participa, adultos, criancas, prato_id, observacao } = body;

    const { data: current } = await supabaseAdmin
      .from("participantes").select("*").eq("id", parseInt(id));
    if (!current || current.length === 0) {
      return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
    }

    const totalPessoas = (adultos || 1) + (criancas || 0);

    if (participa && prato_id) {
      const { data: prato } = await supabaseAdmin
        .from("pratos").select("*").eq("id", prato_id).single();
      if (prato && prato.quantidade_escolhida >= prato.limite) {
        return NextResponse.json(
          { error: "O prato escolhido já atingiu a quantidade necessária. Escolha outro alimento." },
          { status: 400 }
        );
      }
      if (current[0].prato_id && current[0].prato_id !== prato_id) {
        const { data: old } = await supabaseAdmin
          .from("pratos").select("*").eq("id", current[0].prato_id).single();
        if (old) {
          await supabaseAdmin.from("pratos").update({
            quantidade_escolhida: Math.max(old.quantidade_escolhida - 1, 0)
          }).eq("id", current[0].prato_id);
        }
      }
      if (!current[0].prato_id || current[0].prato_id !== prato_id) {
        const { data: newPrato } = await supabaseAdmin
          .from("pratos").select("*").eq("id", prato_id).single();
        if (newPrato) {
          await supabaseAdmin.from("pratos").update({
            quantidade_escolhida: newPrato.quantidade_escolhida + 1
          }).eq("id", prato_id);
        }
      }
    } else if (!participa && current[0].prato_id) {
      const { data: old } = await supabaseAdmin
        .from("pratos").select("*").eq("id", current[0].prato_id).single();
      if (old) {
        await supabaseAdmin.from("pratos").update({
          quantidade_escolhida: Math.max(old.quantidade_escolhida - 1, 0)
        }).eq("id", current[0].prato_id);
      }
    }

    const { data, error } = await supabaseAdmin.from("participantes").update({
      nome,
      cpf: cpf || null,
      telefone: telefone || null,
      departamento: departamento || "Outro",
      participa: participa !== false,
      adultos: adultos || 1,
      criancas: criancas || 0,
      total_pessoas: totalPessoas,
      prato_id: participa ? (prato_id || null) : null,
      observacao: observacao || null,
    }).eq("id", parseInt(id)).select();

    if (error) throw error;
    return NextResponse.json(camelize(data!)[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar participante" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: current } = await supabaseAdmin
      .from("participantes").select("*").eq("id", parseInt(id));
    if (current && current.length > 0 && current[0].prato_id) {
      const { data: prato } = await supabaseAdmin
        .from("pratos").select("*").eq("id", current[0].prato_id).single();
      if (prato) {
        await supabaseAdmin.from("pratos").update({
          quantidade_escolhida: Math.max(prato.quantidade_escolhida - 1, 0)
        }).eq("id", current[0].prato_id);
      }
    }
    const { error } = await supabaseAdmin.from("participantes").delete().eq("id", parseInt(id));
    if (error) throw error;
    return NextResponse.json({ message: "Participante excluído com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir participante" }, { status: 500 });
  }
}
