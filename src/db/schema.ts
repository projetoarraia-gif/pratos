import { pgTable, serial, text, varchar, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Enum for departments
export const departamentoEnum = pgEnum("departamento", [
  "Administracao",
  "Transporte_Escolar",
  "Tecnologia",
  "Alimentacao_Escolar",
  "Pedagogico",
  "Financeiro",
  "Recursos_Humanos",
  "Outro",
  "CEI_LUIZ_FELIPE",
  "CEM_SAO_CRISTOVAO",
  "CEI_ARCO_IRIS",
  "CEI_BRUNO_LEONARDO",
  "CEI_DOM_FRANCO",
  "CEI_MENINO_JESUS",
  "CEI_NOSSO_LAR",
  "CEI_VASCO_PAPA",
  "CEI_CRIANCA_FELIZ",
  "CEM_GUILHERME",
  "CEM_ORLANDO_PEREIRA",
  "EM_MARIA_HILDA",
  "EM_PAULO_FREIRE",
  "EM_JOSE_ANCHIETA",
  "ERM_ALVARES_AZEVEDO",
  "ERM_CORA_CORALINA",
  "ERM_EUCLIDES_CUNHA",
  "ERM_OSVALDO_CRUZ",
  "ERM_VINICIUS_DE_MORAIS",
]);

// Pratos (dishes) table
export const pratos = pgTable("pratos", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  limite: integer("limite").notNull().default(10),
  quantidadeEscolhida: integer("quantidade_escolhida").notNull().default(0),
});

// Participants table
export const participantes = pgTable("participantes", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  telefone: varchar("telefone", { length: 15 }),
  departamento: departamentoEnum("departamento").notNull(),
  participa: boolean("participa").notNull().default(true),
  adultos: integer("adultos").notNull().default(1),
  criancas: integer("criancas").notNull().default(0),
  totalPessoas: integer("total_pessoas").notNull().default(1),
  pratoId: integer("prato_id").references(() => pratos.id),
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admins table
export const administradores = pgTable("administradores", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha: varchar("senha", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event configuration table
export const configuracoes = pgTable("configuracoes", {
  id: serial("id").primaryKey(),
  chave: varchar("chave", { length: 100 }).notNull().unique(),
  valor: varchar("valor", { length: 500 }).notNull(),
});

export type Prato = typeof pratos.$inferSelect;
export type Participante = typeof participantes.$inferSelect;
export type Administrador = typeof administradores.$inferSelect;
export type Configuracao = typeof configuracoes.$inferSelect;
