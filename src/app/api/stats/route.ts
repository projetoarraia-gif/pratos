import { NextResponse } from "next/server";
import { db } from "@/db";
import { participantes, pratos } from "@/db/schema";
import { eq, sql, count, sum } from "drizzle-orm";

export async function GET() {
  try {
    // Total confirmed participants
    const confirmados = await db
      .select({ count: count() })
      .from(participantes)
      .where(eq(participantes.participa, true));

    // Total adults
    const totalAdultos = await db
      .select({ total: sum(participantes.adultos) })
      .from(participantes)
      .where(eq(participantes.participa, true));

    // Total children
    const totalCriancas = await db
      .select({ total: sum(participantes.criancas) })
      .from(participantes)
      .where(eq(participantes.participa, true));

    // Total dishes chosen
    const totalPratos = await db
      .select({ total: sum(participantes.totalPessoas) })
      .from(participantes)
      .where(eq(participantes.participa, true));

    // Participants by department
    const porDepartamento = await db
      .select({
        departamento: participantes.departamento,
        count: count(),
      })
      .from(participantes)
      .where(eq(participantes.participa, true))
      .groupBy(participantes.departamento);

    // Dishes statistics
    const pratosStats = await db.select().from(pratos);

    // Total general (all registrations including non-attending)
    const totalGeral = await db.select({ count: count() }).from(participantes);

    return NextResponse.json({
      confirmados: confirmados[0]?.count || 0,
      adultos: Number(totalAdultos[0]?.total) || 0,
      criancas: Number(totalCriancas[0]?.total) || 0,
      totalPessoas: Number(totalPratos[0]?.total) || 0,
      totalGeral: totalGeral[0]?.count || 0,
      porDepartamento: porDepartamento.map(d => ({
        name: d.departamento.replace(/_/g, " "),
        value: d.count,
      })),
      pratosStats: pratosStats.map(p => ({
        name: p.nome,
        escolhidos: p.quantidadeEscolhida,
        limite: p.limite,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
