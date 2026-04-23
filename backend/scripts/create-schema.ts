import dotenv from 'dotenv';
import { promises as dns } from 'dns';
import { Client } from 'pg';

dotenv.config({ path: '.env' });

const connectionString = process.env.SUPABASE_DB_URL || process.env.PG_CONNECTION_STRING;

const schemaSql = `
-- 1. Table Marche
CREATE TABLE IF NOT EXISTS Marche (
    numbMarche VARCHAR(150) PRIMARY KEY NOT NULL,
    Description TEXT NOT NULL,
    NombreLot INT NOT NULL CHECK (NombreLot > 0),
    NatureOuverture VARCHAR(100),
    DateEnregistrement DATE,
    Financement VARCHAR(250),
    ModePassation VARCHAR(250),
    Demandeur VARCHAR(150),
    Observation TEXT,
    ResponsableSuivi VARCHAR(250),
    SCT_person1 VARCHAR(250) NOT NULL,
    SCT_person2 VARCHAR(250),
    SCT_person3 VARCHAR(250),
    SCT_person4 VARCHAR(250),
    DatePrevReception DATE,
    Statut VARCHAR(250) DEFAULT 'À lancer'
);

-- 2. Table Lot
CREATE TABLE IF NOT EXISTS Lot (
    numbLot VARCHAR(150) PRIMARY KEY NOT NULL,
    numbMarche VARCHAR(150) NOT NULL,
    Description TEXT NOT NULL,
    numbContrat VARCHAR(250) DEFAULT NULL,
    CONSTRAINT fk_marche FOREIGN KEY (numbMarche) REFERENCES Marche(numbMarche) ON DELETE CASCADE
);

-- 3. Table Fournisseur
CREATE TABLE IF NOT EXISTS Fournisseur (
    idFournisseur INT PRIMARY KEY NOT NULL,
    RaisonSocial VARCHAR(250) NOT NULL,
    FormeJuridique VARCHAR(250) NOT NULL,
    AdresseGeo VARCHAR(250) NOT NULL,
    AdressePost VARCHAR(250) NOT NULL,
    Ville VARCHAR(250) NOT NULL,
    Pays VARCHAR(250) NOT NULL,
    Telephone1 VARCHAR(250) NOT NULL,
    Telephone2 VARCHAR(250),
    Email VARCHAR(100) NOT NULL,
    SiteWeb VARCHAR(250),
    DomaineActivite VARCHAR(250) NOT NULL,
    DisposeIFU BOOLEAN NOT NULL,
    numIFU VARCHAR(250),
    DisposeRCCM BOOLEAN NOT NULL,
    numRCCM VARCHAR(250),
    NomPrenomRepr VARCHAR(250) NOT NULL,
    FonctionRepr VARCHAR(250),
    Telephone1Repr VARCHAR(250) NOT NULL,
    EmailRepr VARCHAR(100) NOT NULL,
    Statut VARCHAR(250) DEFAULT 'Externe'
);

-- 4. Table Utilisateur
CREATE TABLE IF NOT EXISTS Utilisateur (
    idUtilisateur INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nomUtilisateur VARCHAR(100) NOT NULL UNIQUE,
    motDePasse VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    prenom VARCHAR(150),
    nom VARCHAR(150),
    role VARCHAR(50) DEFAULT 'user',
    statut VARCHAR(50) DEFAULT 'actif',
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateMiseAJour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    dernierLogin TIMESTAMP DEFAULT NULL
);

-- 5. Table Consultation (Table de liaison)
CREATE TABLE IF NOT EXISTS Consultation (
    numbLot VARCHAR(150) NOT NULL,
    idFournisseur INT NOT NULL,
    DateConsultation DATE,
    PRIMARY KEY (numbLot, idFournisseur),
    CONSTRAINT fk_cons_lot FOREIGN KEY (numbLot) REFERENCES Lot(numbLot),
    CONSTRAINT fk_cons_fourn FOREIGN KEY (idFournisseur) REFERENCES Fournisseur(idFournisseur)
);

-- 6. Table Soumission
CREATE TABLE IF NOT EXISTS Soumission (
    idSoumission VARCHAR(250) PRIMARY KEY NOT NULL,
    numbLot VARCHAR(150) NOT NULL,
    idFournisseur INT NOT NULL,
    DateDepot DATE,
    Heure TIME,
    Observation TEXT,
    DelaiExecutionPrev INT CHECK (DelaiExecutionPrev > 0),
    MontantPrev INT CHECK (MontantPrev > 0),
    nbExemplaire INT CHECK (nbExemplaire >= 0),
    CONSTRAINT fk_soum_lot FOREIGN KEY (numbLot) REFERENCES Lot(numbLot),
    CONSTRAINT fk_soum_fourn FOREIGN KEY (idFournisseur) REFERENCES Fournisseur(idFournisseur),
    CONSTRAINT unq_soum_fourn_lot UNIQUE (numbLot, idFournisseur)
);

-- 7. Table Analyse
CREATE TABLE IF NOT EXISTS Analyse (
    numbLot VARCHAR(150) PRIMARY KEY NOT NULL,
    DateEffecReception DATE,
    Observation TEXT,
    idAttributairePrev INT,
    DatePresentationRapport DATE,
    CONSTRAINT fk_anal_lot FOREIGN KEY (numbLot) REFERENCES Lot(numbLot),
    CONSTRAINT fk_anal_fourn FOREIGN KEY (idAttributairePrev) REFERENCES Fournisseur(idFournisseur)
);

-- 8. Table Attributaire (Attribution)
CREATE TABLE IF NOT EXISTS Attributaire (
    idSoumissionAttribuee VARCHAR(250) PRIMARY KEY NOT NULL,
    MontantEffec INT CHECK (MontantEffec > 0),
    DelaiExecutionEffec INT CHECK (DelaiExecutionEffec > 0),
    DateDemarage DATE,
    DatePrevFin DATE,
    Observation TEXT,
    Statut VARCHAR(250) DEFAULT 'En cours',
    CONSTRAINT fk_attr_soumission FOREIGN KEY (idSoumissionAttribuee) REFERENCES Soumission(idSoumission)
);

-- 9. Table Avenant
CREATE TABLE IF NOT EXISTS Avenant (
    idAvenant INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    idSoumissionAttribuee VARCHAR(250) NOT NULL,
    numbAvenant INT NOT NULL CHECK (numbAvenant > 0),
    MontantAvenant INT CHECK (MontantAvenant > 0),
    DateProrogation DATE,
    CONSTRAINT fk_avenant_attr FOREIGN KEY (idSoumissionAttribuee) REFERENCES Attributaire(idSoumissionAttribuee)
);

-- 10. Table Document
CREATE TABLE IF NOT EXISTS Document (
    numbLot VARCHAR(150) PRIMARY KEY NOT NULL,
    PV_ouverture VARCHAR(50) DEFAULT 'Non',
    RapportAnalyse VARCHAR(50) DEFAULT 'Non',
    PV_attribution VARCHAR(50) DEFAULT 'Non',
    Notification VARCHAR(50) DEFAULT 'Non',
    Contrat VARCHAR(50) DEFAULT 'Non',
    FED VARCHAR(50) DEFAULT 'Non',
    BonCommande VARCHAR(50) DEFAULT 'Non',
    Avenant VARCHAR(50) DEFAULT 'Non',
    OrdreService VARCHAR(50) DEFAULT 'Non',
    PV_reception_tech VARCHAR(50) DEFAULT 'Non',
    CONSTRAINT fk_doc_lot FOREIGN KEY (numbLot) REFERENCES Lot(numbLot)
);
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
    console.log('Schema created successfully.');
  } catch (error) {
    console.error('Schema creation failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
