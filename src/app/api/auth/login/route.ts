import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { administradores } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }

    const result = await db.select().from(administradores).where(eq(administradores.email, email));

    if (result.length === 0) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const admin = result[0];

    // Simple password check (in production, use bcrypt)
    if (admin.senha !== senha) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // Return admin info (without password)
    return NextResponse.json({
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
