import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { configuracoes } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET all configurations
export async function GET() {
  try {
    const result = await db.select().from(configuracoes);
    const config: Record<string, string> = {};
    result.forEach(c => {
      config[c.chave] = c.valor;
    });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

// PUT update configurations
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    for (const [chave, valor] of Object.entries(body)) {
      const existing = await db.select().from(configuracoes).where(eq(configuracoes.chave, chave));
      if (existing.length > 0) {
        await db.update(configuracoes).set({ valor: valor as string }).where(eq(configuracoes.chave, chave));
      } else {
        await db.insert(configuracoes).values({ chave, valor: valor as string });
      }
    }

    return NextResponse.json({ message: "Configurações atualizadas com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar configurações" }, { status: 500 });
  }
}
