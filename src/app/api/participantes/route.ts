import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { participantes, pratos } from "@/db/schema";
import { eq, like, or, sql, and, desc } from "drizzle-orm";

// GET all participants with optional search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const departamento = searchParams.get("departamento") || "";

    let query = db.select().from(participantes).orderBy(desc(participantes.createdAt));

    if (search) {
      query = db.select().from(participantes).where(
        or(
          like(participantes.nome, `%${search}%`),
          like(participantes.telefone, `%${search}%`),
          like(participantes.cpf, `%${search}%`)
        )
      ).orderBy(desc(participantes.createdAt)) as typeof query;
    }

    if (departamento) {
      query = db.select().from(participantes).where(
        eq(participantes.departamento, departamento as "Administracao" | "Transporte_Escolar" | "Tecnologia" | "Alimentacao_Escolar" | "Pedagogico" | "Financeiro" | "Recursos_Humanos" | "Outro" | "CEI_LUIZ_FELIPE" | "CEM_SAO_CRISTOVAO" | "CEI_ARCO_IRIS" | "CEI_BRUNO_LEONARDO" | "CEI_DOM_FRANCO" | "CEI_MENINO_JESUS" | "CEI_NOSSO_LAR" | "CEI_VASCO_PAPA" | "CEI_CRIANCA_FELIZ" | "CEM_GUILHERME" | "CEM_ORLANDO_PEREIRA" | "EM_MARIA_HILDA" | "EM_PAULO_FREIRE" | "EM_JOSE_ANCHIETA" | "ERM_ALVARES_AZEVEDO" | "ERM_CORA_CORALINA" | "ERM_EUCLIDES_CUNHA" | "ERM_OSVALDO_CRUZ" | "ERM_VINICIUS_DE_MORAIS")
      ).orderBy(desc(participantes.createdAt)) as typeof query;
    }

    const result = await query;

    // Get prato names for each participant
    const pratosList = await db.select().from(pratos);
    const pratoMap = new Map(pratosList.map(p => [p.id, p]));

    const enriched = result.map(p => ({
      ...p,
      pratoNome: p.pratoId ? pratoMap.get(p.pratoId)?.nome || "Nenhum" : "Nenhum",
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar participantes" }, { status: 500 });
  }
}

// POST create a new participant
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

    // Check prato limit if participant is attending and chose a prato
    if (participa && prato_id) {
      const prato = await db.select().from(pratos).where(eq(pratos.id, prato_id));
      if (prato.length > 0 && prato[0].quantidadeEscolhida >= prato[0].limite) {
        return NextResponse.json(
          { error: "O prato escolhido já atingiu a quantidade necessária. Escolha outro alimento." },
          { status: 400 }
        );
      }

      // Increment the counter
      await db.update(pratos)
        .set({ quantidadeEscolhida: sql`${pratos.quantidadeEscolhida} + 1` })
        .where(eq(pratos.id, prato_id));
    }

    const result = await db.insert(participantes).values({
      nome,
      cpf: cpf || null,
      telefone: telefone || null,
      departamento: departamento || "Outro",
      participa: participa !== false,
      adultos: adultos || 1,
      criancas: criancas || 0,
      totalPessoas,
      pratoId: participa ? (prato_id || null) : null,
      observacao: observacao || null,
    }).returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar participante" }, { status: 500 });
  }
}
