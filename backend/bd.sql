-- 1. Table Marche
CREATE TABLE Marche (
    numbMarche VARCHAR(150) PRIMARY KEY NOT NULL,
    Description TEXT NOT NULL,
    NombreLot INT NOT NULL CHECK (NombreLot > 0),
    Devise VARCHAR(3) NOT NULL DEFAULT 'XOF' CHECK (Devise IN ('XOF', 'EUR', 'USD')),
    NatureOuverture VARCHAR(100),
    DateEnregistrement DATE,
    Financement VARCHAR(250),
    ModePassation VARCHAR(250),
    BudgetEstimatif INT CHECK (BudgetEstimatif > 0),
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
CREATE TABLE Lot (
    numbLot VARCHAR(150) PRIMARY KEY NOT NULL,
    nomLot VARCHAR(150) NOT NULL,
    numbMarche VARCHAR(150) NOT NULL,
    Description TEXT NOT NULL,
    numbContrat VARCHAR(250) DEFAULT NULL,
    CONSTRAINT fk_marche FOREIGN KEY (numbMarche) REFERENCES Marche(numbMarche) ON DELETE CASCADE,
    CONSTRAINT uq_lot_nom_marche UNIQUE (nomLot, numbMarche)
);

-- 3. Table Fournisseur
CREATE TABLE Fournisseur (
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
CREATE TABLE Utilisateur (
    idUtilisateur INT PRIMARY KEY AUTO_INCREMENT,
    nomUtilisateur VARCHAR(100) NOT NULL UNIQUE,
    motDePasse VARCHAR(255) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    prenom VARCHAR(150),
    nom VARCHAR(150),
    role VARCHAR(50) DEFAULT 'user',
    statut VARCHAR(50) DEFAULT 'actif',
    dateCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateMiseAJour TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    dernierLogin DATETIME DEFAULT NULL
);

-- 5. Table Consultation (Table de liaison)
CREATE TABLE Consultation (
    numbLot VARCHAR(150) NOT NULL,
    idFournisseur INT NOT NULL,
    DateConsultation DATE,
    PRIMARY KEY (numbLot, idFournisseur),
    CONSTRAINT fk_cons_lot FOREIGN KEY (numbLot) REFERENCES Lot(numbLot),
    CONSTRAINT fk_cons_fourn FOREIGN KEY (idFournisseur) REFERENCES Fournisseur(idFournisseur)
);

-- 5. Table Soumission
CREATE TABLE Soumission (
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
    CONSTRAINT unq_soum_fourn_lot UNIQUE (numbLot, idFournisseur) -- Un fournisseur = une offre par lot
);

-- 6. Table Analyse
CREATE TABLE Analyse (
    numbLot VARCHAR(150) PRIMARY KEY NOT NULL,
    DateEffecReception DATE,
    Observation TEXT,
    idAttributairePrev INT,
    DatePresentationRapport DATE,
    CONSTRAINT fk_anal_lot FOREIGN KEY (numbLot) REFERENCES Lot(numbLot),
    CONSTRAINT fk_anal_fourn FOREIGN KEY (idAttributairePrev) REFERENCES Fournisseur(idFournisseur)
);

-- 7. Table Attributaire (Attribution)
CREATE TABLE Attributaire (
    idSoumissionAttribuee VARCHAR(250) PRIMARY KEY NOT NULL,
    MontantEffec INT CHECK (MontantEffec > 0),
    DelaiExecutionEffec INT CHECK (DelaiExecutionEffec > 0),
    DateDemarage DATE,
    DatePrevFin DATE,
    Observation TEXT,
    Statut VARCHAR(250) DEFAULT 'En cours',
    CONSTRAINT fk_attr_soumission FOREIGN KEY (idSoumissionAttribuee) REFERENCES Soumission(idSoumission)
);

-- 8. Table Avenant
CREATE TABLE Avenant (
    idAvenant INT PRIMARY KEY AUTO_INCREMENT, -- Ou SERIAL pour Postgres
    idSoumissionAttribuee VARCHAR(250) NOT NULL,
    numbAvenant INT NOT NULL CHECK (numbAvenant > 0),
    MontantAvenant INT CHECK (MontantAvenant > 0),
    DateProrogation DATE,
    CONSTRAINT fk_avenant_attr FOREIGN KEY (idSoumissionAttribuee) REFERENCES Attributaire(idSoumissionAttribuee)
);

-- 9. Table Document
CREATE TABLE Document (
    numbLot VARCHAR(150) PRIMARY KEY NOT NULL,
    PV_ouverture TEXT DEFAULT 'Non',
    RapportAnalyse TEXT DEFAULT 'Non',
    PV_attribution TEXT DEFAULT 'Non',
    Notification TEXT DEFAULT 'Non',
    Contrat TEXT DEFAULT 'Non',
    FED TEXT DEFAULT 'Non',
    BonCommande TEXT DEFAULT 'Non',
    Avenant TEXT DEFAULT 'Non',
    OrdreService TEXT DEFAULT 'Non',
    PV_reception_tech TEXT DEFAULT 'Non',
    CONSTRAINT fk_doc_lot FOREIGN KEY (numbLot) REFERENCES Lot(numbLot)
);