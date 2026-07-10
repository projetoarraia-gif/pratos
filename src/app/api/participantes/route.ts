import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, camelize } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const departamento = searchParams.get("departamento") || "";

    let q = supabaseAdmin.from("participantes").select("*");

    if (search) {
      q = q.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%,cpf.ilike.%${search}%`);
    }

    if (departamento) {
      q = q.eq("departamento", departamento);
    }

    q = q.order("created_at", { ascending: false });

    const { data: result, error } = await q;
    if (error) throw error;

    const { data: pratosList } = await supabaseAdmin.from("pratos").select("*");
    const pratoMap = new Map((pratosList || []).map(p => [p.id, p]));

    const enriched = (result || []).map(p => {
      const row: Record<string, unknown> = { ...p };
      row.prato_nome = p.prato_id ? pratoMap.get(p.prato_id)?.nome || "Nenhum" : "Nenhum";
      return row;
    });

    return NextResponse.json(camelize(enriched));
  } catch {
    return NextResponse.json({ error: "Erro ao buscar participantes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, cpf, telefone, departamento, participa, adultos, criancas, prato_id, observacao } = body;

    if (!nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    if (adultos < 0 || criancas < 0) {
      return NextResponse.json({ error: "Números negativos não são permitidos" }, { status: 400 });
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
      await supabaseAdmin.from("pratos").update({
        quantidade_escolhida: prato!.quantidade_escolhida + 1
      }).eq("id", prato_id);
    }

    const { data, error } = await supabaseAdmin.from("participantes").insert({
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
    }).select();

    if (error) throw error;
    return NextResponse.json(camelize(data!)[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar participante" }, { status: 500 });
  }
}
