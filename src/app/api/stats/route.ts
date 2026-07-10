import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: confirmados, error: err1 } = await supabaseAdmin
      .from("participantes").select("*").eq("participa", true);
    if (err1) throw err1;

    const { data: todos, error: err2 } = await supabaseAdmin
      .from("participantes").select("*");
    if (err2) throw err2;

    const totalAdultos = (confirmados || []).reduce((s, p) => s + p.adultos, 0);
    const totalCriancas = (confirmados || []).reduce((s, p) => s + p.criancas, 0);
    const totalPessoas = (confirmados || []).reduce((s, p) => s + p.total_pessoas, 0);

    const deptCounts: Record<string, number> = {};
    (confirmados || []).forEach(p => {
      deptCounts[p.departamento] = (deptCounts[p.departamento] || 0) + 1;
    });

    const { data: pratosStats, error: err3 } = await supabaseAdmin.from("pratos").select("*");
    if (err3) throw err3;

    return NextResponse.json({
      confirmados: confirmados?.length || 0,
      adultos: totalAdultos,
      criancas: totalCriancas,
      totalPessoas,
      totalGeral: todos?.length || 0,
      porDepartamento: Object.entries(deptCounts).map(([name, value]) => ({
        name: name.replace(/_/g, " "),
        value,
      })),
      pratosStats: (pratosStats || []).map(p => ({
        name: p.nome,
        escolhidos: p.quantidade_escolhida,
        limite: p.limite,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
