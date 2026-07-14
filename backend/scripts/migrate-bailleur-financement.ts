import dotenv from 'dotenv';
import { promises as dns } from 'dns';
import { Client } from 'pg';

dotenv.config({ path: '.env' });

const connectionString =
  process.env.SUPABASE_POOLER_URL || process.env.SUPABASE_DB_URL || process.env.PG_CONNECTION_STRING;

const schemaSql = `
-- Table Bailleur : le tiers qui finance (ex: Banque Mondiale, 2iE pour les marchés sur fonds propres)
CREATE TABLE IF NOT EXISTS Bailleur (
    idBailleur INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nomBailleur VARCHAR(250) NOT NULL UNIQUE
);

-- Table Financement : un projet/ligne de financement, rattaché à un Bailleur (ex: CEA-Impact -> Banque Mondiale)
CREATE TABLE IF NOT EXISTS Financement (
    idFinancement INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nomFinancement VARCHAR(250) NOT NULL,
    idBailleur INT NOT NULL,
    CONSTRAINT fk_financement_bailleur FOREIGN KEY (idBailleur) REFERENCES Bailleur(idBailleur) ON DELETE CASCADE,
    CONSTRAINT uq_financement_nom_bailleur UNIQUE (nomFinancement, idBailleur)
);

-- Cas par défaut mentionné par le client : marchés sur fonds propres 2iE
INSERT INTO Bailleur (nomBailleur)
VALUES ('2iE')
ON CONFLICT (nomBailleur) DO NOTHING;

INSERT INTO Financement (nomFinancement, idBailleur)
SELECT 'Fonds propres 2iE', idBailleur FROM Bailleur WHERE nomBailleur = '2iE'
ON CONFLICT (nomFinancement, idBailleur) DO NOTHING;
`;

async function main() {
  if (!connectionString) {
    console.log('No database connection string found.');
    console.log('Set SUPABASE_DB_URL or PG_CONNECTION_STRING in .env.');
    console.log('Here is the SQL schema:');
    console.log(schemaSql);
    process.exit(0);
  }

  const parsed = new URL(connectionString);
  let host = parsed.hostname;

  try {
    const addresses = await dns.resolve4(parsed.hostname);
    if (addresses.length > 0) {
      host = addresses[0];
      console.log(`Resolved ${parsed.hostname} to IPv4 ${host}`);
    }
  } catch (err) {
    console.warn(`Unable to resolve IPv4 for ${parsed.hostname}, using hostname instead.`);
  }

  const clientConfig: any = {
    host,
    port: Number(parsed.port || 5432),
    user: parsed.username,
    password: parsed.password,
    database: parsed.pathname?.slice(1) || undefined,
    ssl: { rejectUnauthorized: false },
  };

  const client = new Client(clientConfig);
  await client.connect();
  try {
    await client.query(schemaSql);
    console.log('Bailleur/Financement schema created successfully.');
  } catch (error) {
    console.error('Schema creation failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
