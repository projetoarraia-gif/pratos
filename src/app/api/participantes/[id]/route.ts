import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { participantes, pratos } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// GET single participant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(participantes).where(eq(participantes.id, parseInt(id)));

    if (result.length === 0) {
      return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar participante" }, { status: 500 });
  }
}

// PUT update participant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, cpf, telefone, departamento, participa, adultos, criancas, prato_id, observacao } = body;

    // Get current participant to handle prato changes
    const current = await db.select().from(participantes).where(eq(participantes.id, parseInt(id)));
    if (current.length === 0) {
      return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
    }

    const totalPessoas = (adultos || 1) + (criancas || 0);

    // Handle prato counter changes
    if (participa && prato_id) {
      const prato = await db.select().from(pratos).where(eq(pratos.id, prato_id));
      if (prato.length > 0 && prato[0].quantidadeEscolhida >= prato[0].limite) {
        return NextResponse.json(
          { error: "O prato escolhido já atingiu a quantidade necessária. Escolha outro alimento." },
          { status: 400 }
        );
      }

      // Decrement old prato if changing
      if (current[0].pratoId && current[0].pratoId !== prato_id) {
        await db.update(pratos)
          .set({ quantidadeEscolhida: sql`GREATEST(${pratos.quantidadeEscolhida} - 1, 0)` })
          .where(eq(pratos.id, current[0].pratoId));
      }

      // Increment new prato only if it's a new selection
      if (!current[0].pratoId || current[0].pratoId !== prato_id) {
        await db.update(pratos)
          .set({ quantidadeEscolhida: sql`${pratos.quantidadeEscolhida} + 1` })
          .where(eq(pratos.id, prato_id));
      }
    } else if (!participa && current[0].pratoId) {
      // Decrement old prato if participant is no longer attending
      await db.update(pratos)
        .set({ quantidadeEscolhida: sql`GREATEST(${pratos.quantidadeEscolhida} - 1, 0)` })
        .where(eq(pratos.id, current[0].pratoId));
    }

    const result = await db.update(participantes)
      .set({
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
      })
      .where(eq(participantes.id, parseInt(id)))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar participante" }, { status: 500 });
  }
}

// DELETE participant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get participant to decrement prato counter
    const current = await db.select().from(participantes).where(eq(participantes.id, parseInt(id)));
    if (current.length > 0 && current[0].pratoId) {
      await db.update(pratos)
        .set({ quantidadeEscolhida: sql`GREATEST(${pratos.quantidadeEscolhida} - 1, 0)` })
        .where(eq(pratos.id, current[0].pratoId));
    }

    await db.delete(participantes).where(eq(participantes.id, parseInt(id)));
    return NextResponse.json({ message: "Participante excluído com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir participante" }, { status: 500 });
  }
}
