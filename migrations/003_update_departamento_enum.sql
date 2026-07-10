-- Migration: Atualizar enum departamento - remover escolas e adicionar UAB
-- Passo 1: Migrar participantes existentes das escolas para "Outro"
UPDATE participantes
SET departamento = 'Outro'
WHERE departamento IN (
  'EM_MARIA_HILDA',
  'EM_PAULO_FREIRE',
  'EM_JOSE_ANCHIETA',
  'ERM_ALVARES_AZEVEDO',
  'ERM_CORA_CORALINA',
  'ERM_EUCLIDES_CUNHA',
  'ERM_OSVALDO_CRUZ',
  'ERM_VINICIUS_DE_MORAIS'
);

-- Passo 2: Criar novo enum com os valores corretos
CREATE TYPE departamento_new AS ENUM (
  'Administracao',
  'Transporte_Escolar',
  'Tecnologia',
  'Alimentacao_Escolar',
  'Pedagogico',
  'Financeiro',
  'Recursos_Humanos',
  'UAB',
  'Outro',
  'CEI_LUIZ_FELIPE',
  'CEM_SAO_CRISTOVAO',
  'CEI_ARCO_IRIS',
  'CEI_BRUNO_LEONARDO',
  'CEI_DOM_FRANCO',
  'CEI_MENINO_JESUS',
  'CEI_NOSSO_LAR',
  'CEI_VASCO_PAPA',
  'CEI_CRIANCA_FELIZ',
  'CEM_GUILHERME',
  'CEM_ORLANDO_PEREIRA'
);

-- Passo 3: Atualizar a coluna para usar o novo tipo
ALTER TABLE participantes
  ALTER COLUMN departamento TYPE departamento_new
  USING departamento::text::departamento_new;

-- Passo 4: Remover o enum antigo
DROP TYPE departamento;

-- Passo 5: Renomear o novo enum
ALTER TYPE departamento_new RENAME TO departamento;