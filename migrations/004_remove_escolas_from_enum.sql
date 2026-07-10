UPDATE participantes SET departamento = 'Outro' WHERE departamento NOT IN ('Administracao','Transporte_Escolar','Tecnologia','Alimentacao_Escolar','Pedagogico','Financeiro','Recursos_Humanos','UAB','Outro');

CREATE TYPE departamento_new AS ENUM ('Administracao','Transporte_Escolar','Tecnologia','Alimentacao_Escolar','Pedagogico','Financeiro','Recursos_Humanos','UAB','Outro');

ALTER TABLE participantes ALTER COLUMN departamento TYPE departamento_new USING departamento::text::departamento_new;

DROP TYPE departamento;

ALTER TYPE departamento_new RENAME TO departamento;