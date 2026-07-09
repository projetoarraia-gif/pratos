import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pratos } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// GET all pratos
export async function GET() {
  try {
    const result = await db.select().from(pratos);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar pratos" }, { status: 500 });
  }
}

// POST create a new prato
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, limite } = body;

    if (!nome || !limite) {
      return NextResponse.json({ error: "Nome e limite são obrigatórios" }, { status: 400 });
    }

    const result = await db.insert(pratos).values({ nome, limite }).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar prato" }, { status: 500 });
  }
}

// PUT update a prato
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
    if (quantidade_escolhida !== undefined) updates.quantidadeEscolhida = quantidade_escolhida;

    const result = await db.update(pratos).set(updates).where(eq(pratos.id, id)).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar prato" }, { status: 500 });
  }
}

// DELETE a prato
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await db.delete(pratos).where(eq(pratos.id, parseInt(id)));
    return NextResponse.json({ message: "Prato excluído com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir prato" }, { status: 500 });
  }
}
