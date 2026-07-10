const { Client } = require('pg');

async function run() {
  const c = new Client({
    connectionString: 'postgresql://postgres:Mud@r202650@db.vpkqgypucpocxlxybsdq.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await c.connect();

  // Step 1: Add new values to existing enum (one connection at a time)
  const newValues = ['Almoxarifado', 'Logistica', 'Merenda', 'Predio_SME'];
  for (const val of newValues) {
    await c.query(`ALTER TYPE departamento ADD VALUE IF NOT EXISTS '${val}'`);
    console.log(`Added: ${val}`);
  }

  // Step 2: Update all existing records to a valid new value
  await c.query("UPDATE participantes SET departamento = 'Almoxarifado' WHERE departamento NOT IN ('Almoxarifado','Logistica','Merenda','Predio_SME')");
  console.log('Data updated');

  // Step 3: Create new enum type
  await c.query("CREATE TYPE departamento_new AS ENUM ('Almoxarifado','Logistica','Merenda','Predio_SME')");
  console.log('New type created');

  // Step 4: Alter column type
  await c.query("ALTER TABLE participantes ALTER COLUMN departamento TYPE departamento_new USING departamento::text::departamento_new");
  console.log('Column altered');

  // Step 5: Drop old type
  await c.query('DROP TYPE departamento');
  console.log('Old type dropped');

  // Step 6: Rename new type
  await c.query('ALTER TYPE departamento_new RENAME TO departamento');
  console.log('Type renamed');

  await c.end();
  console.log('Done!');
}

run().catch(e => { console.error(e.message); process.exit(1); });
