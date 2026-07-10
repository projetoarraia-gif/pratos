ALTER TYPE departamento ADD VALUE IF NOT EXISTS 'Almoxarifado';
ALTER TYPE departamento ADD VALUE IF NOT EXISTS 'Logistica';
ALTER TYPE departamento ADD VALUE IF NOT EXISTS 'Merenda';
ALTER TYPE departamento ADD VALUE IF NOT EXISTS 'Predio_SME';

UPDATE participantes SET departamento = 'Almoxarifado' WHERE departamento NOT IN ('Almoxarifado','Logistica','Merenda','Predio_SME');

CREATE TYPE departamento_new AS ENUM ('Almoxarifado','Logistica','Merenda','Predio_SME');

ALTER TABLE participantes ALTER COLUMN departamento TYPE departamento_new USING departamento::text::departamento_new;

DROP TYPE departamento;

ALTER TYPE departamento_new RENAME TO departamento;
