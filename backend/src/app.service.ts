import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export interface Marche {
  numbMarche: string;
  Description: string;
  NombreLot: number;
  Devise?: 'XOF' | 'EUR' | 'USD';
  NatureOuverture?: string;
  DateEnregistrement?: string;
  Financement?: string;
  ModePassation?: string;
  Demandeur?: string;
  Observation?: string;
  ResponsableSuivi?: string;
  SCT_person1: string;
  SCT_person2?: string;
  SCT_person3?: string;
  SCT_person4?: string;
  DatePrevReception?: string;
  Statut?: string;
}

export interface Lot {
  numbLot: string;
  numbMarche: string;
  Description: string;
  numbContrat?: string;
}

export interface Fournisseur {
  idFournisseur: number;
  RaisonSocial: string;
  FormeJuridique: string;
  AdresseGeo: string;
  AdressePost: string;
  Ville: string;
  Pays: string;
  Telephone1: string;
  Telephone2?: string;
  Email: string;
  SiteWeb?: string;
  DomaineActivite: string;
  DisposeIFU: boolean;
  numIFU?: string;
  DisposeRCCM: boolean;
  numRCCM?: string;
  NomPrenomRepr: string;
  FonctionRepr?: string;
  Telephone1Repr: string;
  EmailRepr: string;
  Statut?: string;
  dateAjout?: string;
}

export interface Utilisateur {
  idUtilisateur: number;
  nomUtilisateur: string;
  motDePasse: string;
  email: string;
  prenom?: string;
  nom?: string;
  role?: string;
  statut?: string;
  dateCreation?: string;
  dateMiseAJour?: string;
  dernierLogin?: string;
}

export interface Consultation {
  numbLot: string;
  idFournisseur: number;
  DateConsultation?: string;
}

export interface Soumission {
  idSoumission: string;
  numbLot: string;
  idFournisseur: number;
  DateDepot?: string;
  Heure?: string;
  Observation?: string;
  DelaiExecutionPrev?: number;
  MontantPrev?: number;
  nbExemplaire?: number;
}

export interface Analyse {
  numbLot: string;
  DateEffecReception?: string;
  Observation?: string;
  idAttributairePrev?: number;
  DatePresentationRapport?: string;
}

export interface Attributaire {
  idSoumissionAttribuee: string;
  MontantEffec?: number;
  DelaiExecutionEffec?: number;
  DateDemarage?: string;
  DatePrevFin?: string;
  Observation?: string;
  Statut?: string;
}

export interface Avenant {
  idAvenant: number;
  idSoumissionAttribuee: string;
  numbAvenant: number;
  MontantAvenant?: number;
  DateProrogation?: string;
}

export interface Document {
  numbLot: string;
  PV_ouverture?: string;
  RapportAnalyse?: string;
  PV_attribution?: string;
  Notification?: string;
  Contrat?: string;
  FED?: string;
  BonCommande?: string;
  Avenant?: string;
  OrdreService?: string;
  PV_reception_tech?: string;
}

@Injectable()
export class AppService {
  private marches: Marche[] = [];
  private lots: Lot[] = [];
  private fournisseurs: Fournisseur[] = [];
  private utilisateurs: Utilisateur[] = [];
  private consultations: Consultation[] = [];
  private soumissions: Soumission[] = [];
  private analyses: Analyse[] = [];
  private attributaires: Attributaire[] = [];
  private avenants: Avenant[] = [];
  private documents: Document[] = [];

  private nextFournisseurId = 1;
  private nextUtilisateurId = 1;
  private nextAvenantId = 1;
  private readonly dataFilePath = join(process.cwd(), 'data.json');
  private supabaseUrl: string | null = null;
  private supabaseKey: string | null = null;

  constructor() {
    this.loadSupabaseConfig();
    this.loadData();
  }

  private loadData(): void {
    if (existsSync(this.dataFilePath)) {
      try {
        const raw = readFileSync(this.dataFilePath, 'utf8');
        const data = JSON.parse(raw);
        this.marches = data.marches ?? [];
        this.lots = data.lots ?? [];
        this.fournisseurs = data.fournisseurs ?? [];
        this.utilisateurs = data.utilisateurs ?? [];
        this.consultations = data.consultations ?? [];
        this.soumissions = data.soumissions ?? [];
        this.analyses = data.analyses ?? [];
        this.attributaires = data.attributaires ?? [];
        this.avenants = data.avenants ?? [];
        this.documents = data.documents ?? [];
      } catch {
        this.saveData();
      }
    } else {
      this.saveData();
    }
  }

  private saveData(): void {
    const data = {
      marches: this.marches,
      lots: this.lots,
      fournisseurs: this.fournisseurs,
      utilisateurs: this.utilisateurs,
      consultations: this.consultations,
      soumissions: this.soumissions,
      analyses: this.analyses,
      attributaires: this.attributaires,
      avenants: this.avenants,
      documents: this.documents,
    };
    writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  }

  private loadSupabaseConfig(): void {
    const env = this.readEnvFile();
    this.supabaseUrl = process.env.SUPABASE_URL || env.SUPABASE_URL || null;
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || null;
  }

  private readEnvFile(): Record<string, string> {
    const envPath = join(process.cwd(), '.env');
    if (!existsSync(envPath)) {
      return {};
    }

    const content = readFileSync(envPath, 'utf8');
    return content
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith('#'))
      .reduce((acc, line) => {
        const [key, ...valueParts] = line.split('=');
        acc[key.trim()] = valueParts.join('=').trim();
        return acc;
      }, {} as Record<string, string>);
  }

  private async fetchSupabaseFournisseurs(): Promise<Fournisseur[]> {
    if (!this.supabaseUrl || !this.supabaseKey) {
      return [];
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/Fournisseur?select=*&order=dateajout.desc`, {
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${this.supabaseKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const rows = (await response.json()) as Array<Record<string, unknown>>;
      return rows.map((row) => this.mapSupabaseRowToFournisseur(row));
    } catch {
      return [];
    }
  }

  private async insertSupabaseFournisseur(fournisseur: Fournisseur): Promise<void> {
    if (!this.supabaseUrl || !this.supabaseKey) {
      return;
    }

    const payload = [{
      idfournisseur: fournisseur.idFournisseur,
      raisonsocial: fournisseur.RaisonSocial,
      formejuridique: fournisseur.FormeJuridique,
      adressegeo: fournisseur.AdresseGeo,
      adressepost: fournisseur.AdressePost,
      ville: fournisseur.Ville,
      pays: fournisseur.Pays,
      telephone1: fournisseur.Telephone1,
      telephone2: fournisseur.Telephone2 ?? null,
      email: fournisseur.Email,
      siteweb: fournisseur.SiteWeb ?? null,
      domaineactivite: fournisseur.DomaineActivite,
      disposeifu: fournisseur.DisposeIFU,
      numifu: fournisseur.numIFU ?? null,
      disposerccm: fournisseur.DisposeRCCM,
      numrccm: fournisseur.numRCCM ?? null,
      nomprenomrepr: fournisseur.NomPrenomRepr,
      fonctionrepr: fournisseur.FonctionRepr ?? null,
      telephone1repr: fournisseur.Telephone1Repr,
      emailrepr: fournisseur.EmailRepr,
      statut: fournisseur.Statut ?? 'Externe',
      dateajout: new Date().toISOString(),
    }];

    const response = await fetch(`${this.supabaseUrl}/rest/v1/Fournisseur`, {
      method: 'POST',
      headers: {
        apikey: this.supabaseKey,
        Authorization: `Bearer ${this.supabaseKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new BadRequestException(`Supabase insert failed: ${response.status} ${body}`);
    }
  }

  private async fetchSupabaseFournisseur(idFournisseur: number): Promise<Fournisseur | null> {
    if (!this.supabaseUrl || !this.supabaseKey) {
      return null;
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/rest/v1/Fournisseur?select=*&idfournisseur=eq.${idFournisseur}`, {
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${this.supabaseKey}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const rows = (await response.json()) as Array<Record<string, unknown>>;
      if (rows.length === 0) {
        return null;
      }

      return this.mapSupabaseRowToFournisseur(rows[0]);
    } catch {
      return null;
    }
  }

  private mapSupabaseRowToFournisseur(row: Record<string, unknown>): Fournisseur {
    const normalized: Record<string, unknown> = {};
    Object.entries(row).forEach(([key, value]) => {
      normalized[key.toLowerCase()] = value;
    });

    return {
      idFournisseur: Number(normalized['idfournisseur'] ?? normalized['idFournisseur'] ?? 0),
      RaisonSocial: String(normalized['raisonsocial'] ?? normalized['raisonsocial'] ?? ''),
      FormeJuridique: String(normalized['formejuridique'] ?? normalized['formejuridique'] ?? ''),
      AdresseGeo: String(normalized['adressegeo'] ?? normalized['adressegeo'] ?? ''),
      AdressePost: String(normalized['adressepost'] ?? normalized['adressepost'] ?? ''),
      Ville: String(normalized['ville'] ?? normalized['ville'] ?? ''),
      Pays: String(normalized['pays'] ?? normalized['pays'] ?? ''),
      Telephone1: String(normalized['telephone1'] ?? normalized['telephone1'] ?? ''),
      Telephone2: normalized['telephone2'] ? String(normalized['telephone2']) : undefined,
      Email: String(normalized['email'] ?? normalized['email'] ?? ''),
      SiteWeb: normalized['siteweb'] ? String(normalized['siteweb']) : undefined,
      DomaineActivite: String(normalized['domaineactivite'] ?? normalized['domaineactivite'] ?? ''),
      DisposeIFU: Boolean(normalized['disposeifu'] ?? normalized['disposeifu'] ?? false),
      numIFU: normalized['numifu'] ? String(normalized['numifu']) : undefined,
      DisposeRCCM: Boolean(normalized['disposerccm'] ?? normalized['disposerccm'] ?? false),
      numRCCM: normalized['numrccm'] ? String(normalized['numrccm']) : undefined,
      NomPrenomRepr: String(normalized['nomprenomrepr'] ?? normalized['nomprenomrepr'] ?? ''),
      FonctionRepr: normalized['fonctionrepr'] ? String(normalized['fonctionrepr']) : undefined,
      Telephone1Repr: String(normalized['telephone1repr'] ?? normalized['telephone1repr'] ?? ''),
      EmailRepr: String(normalized['emailrepr'] ?? normalized['emailrepr'] ?? ''),
      Statut: normalized['statut'] ? String(normalized['statut']) : undefined,
      dateAjout: normalized['dateajout'] ? String(normalized['dateajout']) : undefined,
    };
  }

  getHello(): string {
    return 'Hello World!';
  }

  // Marche
  getMarches(): Marche[] {
    return this.marches;
  }

  getMarche(numbMarche: string): Marche {
    const marche = this.marches.find((item) => item.numbMarche === numbMarche);
    if (!marche) {
      throw new NotFoundException(`Marche ${numbMarche} not found`);
    }
    return marche;
  }

  createMarche(marche: Partial<Marche>): Marche {
    if (!marche.numbMarche || !marche.Description || marche.NombreLot === undefined || !marche.SCT_person1) {
      throw new BadRequestException('Missing required Marche fields');
    }
    if (this.marches.some((item) => item.numbMarche === marche.numbMarche)) {
      throw new BadRequestException(`Marche ${marche.numbMarche} already exists`);
    }
    const newMarche: Marche = {
      ...marche,
      Statut: marche.Statut ?? 'À lancer',
    } as Marche;
    this.marches.push(newMarche);
    this.saveData();
    return newMarche;
  }

  updateMarche(numbMarche: string, changes: Partial<Marche>): Marche {
    const marche = this.getMarche(numbMarche);
    Object.assign(marche, changes);
    this.saveData();
    return marche;
  }

  deleteMarche(numbMarche: string): void {
    const index = this.marches.findIndex((item) => item.numbMarche === numbMarche);
    if (index < 0) {
      throw new NotFoundException(`Marche ${numbMarche} not found`);
    }
    this.marches.splice(index, 1);
  }

  // Lot
  getLots(): Lot[] {
    return this.lots;
  }

  getLot(numbLot: string): Lot {
    const lot = this.lots.find((item) => item.numbLot === numbLot);
    if (!lot) {
      throw new NotFoundException(`Lot ${numbLot} not found`);
    }
    return lot;
  }

  createLot(lot: Partial<Lot>): Lot {
    if (!lot.numbLot || !lot.numbMarche || !lot.Description) {
      throw new BadRequestException('Missing required Lot fields');
    }
    if (this.lots.some((item) => item.numbLot === lot.numbLot)) {
      throw new BadRequestException(`Lot ${lot.numbLot} already exists`);
    }
    const newLot: Lot = {
      ...lot,
      numbContrat: lot.numbContrat ?? null,
    } as Lot;
    this.lots.push(newLot);
    this.saveData();
    return newLot;
  }

  updateLot(numbLot: string, changes: Partial<Lot>): Lot {
    const lot = this.getLot(numbLot);
    Object.assign(lot, changes);
    this.saveData();
    return lot;
  }

  deleteLot(numbLot: string): void {
    const index = this.lots.findIndex((item) => item.numbLot === numbLot);
    if (index < 0) {
      throw new NotFoundException(`Lot ${numbLot} not found`);
    }
    this.lots.splice(index, 1);
    this.saveData();
  }

  // Fournisseur
  async getFournisseurs(): Promise<Fournisseur[]> {
    const remoteFournisseurs = await this.fetchSupabaseFournisseurs();
    const remoteIds = new Set(remoteFournisseurs.map((f) => f.idFournisseur));
    const rows = [
      ...remoteFournisseurs,
      ...this.fournisseurs.filter((item) => !remoteIds.has(item.idFournisseur)),
    ];
    return rows.sort((a, b) => {
      const aDate = a.dateAjout ? Date.parse(a.dateAjout) : 0;
      const bDate = b.dateAjout ? Date.parse(b.dateAjout) : 0;
      if (aDate !== bDate) return bDate - aDate;
      return b.idFournisseur - a.idFournisseur;
    });
  }

  async getFournisseur(idFournisseur: number): Promise<Fournisseur> {
    const local = this.fournisseurs.find((item) => item.idFournisseur === idFournisseur);
    if (local) {
      return local;
    }

    if (this.supabaseUrl && this.supabaseKey) {
      const remote = await this.fetchSupabaseFournisseur(idFournisseur);
      if (remote) {
        return remote;
      }
    }

    throw new NotFoundException(`Fournisseur ${idFournisseur} not found`);
  }

  async createFournisseur(fournisseur: Partial<Fournisseur>): Promise<Fournisseur> {
    if (!fournisseur.RaisonSocial || !fournisseur.FormeJuridique || !fournisseur.AdresseGeo || !fournisseur.AdressePost || !fournisseur.Ville || !fournisseur.Pays || !fournisseur.Telephone1 || !fournisseur.Email || !fournisseur.DomaineActivite || fournisseur.DisposeIFU === undefined || fournisseur.DisposeRCCM === undefined || !fournisseur.NomPrenomRepr || !fournisseur.Telephone1Repr || !fournisseur.EmailRepr) {
      throw new BadRequestException('Missing required Fournisseur fields');
    }
    const newFournisseur: Fournisseur = {
      idFournisseur: fournisseur.idFournisseur ?? this.nextFournisseurId++,
      RaisonSocial: fournisseur.RaisonSocial,
      FormeJuridique: fournisseur.FormeJuridique,
      AdresseGeo: fournisseur.AdresseGeo,
      AdressePost: fournisseur.AdressePost,
      Ville: fournisseur.Ville,
      Pays: fournisseur.Pays,
      Telephone1: fournisseur.Telephone1,
      Telephone2: fournisseur.Telephone2,
      Email: fournisseur.Email,
      SiteWeb: fournisseur.SiteWeb,
      DomaineActivite: fournisseur.DomaineActivite,
      DisposeIFU: fournisseur.DisposeIFU,
      numIFU: fournisseur.numIFU,
      DisposeRCCM: fournisseur.DisposeRCCM,
      numRCCM: fournisseur.numRCCM,
      NomPrenomRepr: fournisseur.NomPrenomRepr,
      FonctionRepr: fournisseur.FonctionRepr,
      Telephone1Repr: fournisseur.Telephone1Repr,
      EmailRepr: fournisseur.EmailRepr,
      Statut: fournisseur.Statut ?? 'Externe',
      dateAjout: new Date().toISOString(),
    };

    await this.insertSupabaseFournisseur(newFournisseur);

    this.fournisseurs.push(newFournisseur);
    this.saveData();
    return newFournisseur;
  }

  async updateFournisseur(idFournisseur: number, changes: Partial<Fournisseur>): Promise<Fournisseur> {
    const fournisseur = await this.getFournisseur(idFournisseur);
    Object.assign(fournisseur, changes);
    this.saveData();
    return fournisseur;
  }

  deleteFournisseur(idFournisseur: number): void {
    const index = this.fournisseurs.findIndex((item) => item.idFournisseur === idFournisseur);
    if (index < 0) {
      throw new NotFoundException(`Fournisseur ${idFournisseur} not found`);
    }
    this.fournisseurs.splice(index, 1);
    this.saveData();
  }

  // Utilisateur
  getUtilisateurs(): Utilisateur[] {
    return this.utilisateurs;
  }

  getUtilisateur(idUtilisateur: number): Utilisateur {
    const utilisateur = this.utilisateurs.find((item) => item.idUtilisateur === idUtilisateur);
    if (!utilisateur) {
      throw new NotFoundException(`Utilisateur ${idUtilisateur} not found`);
    }
    return utilisateur;
  }

  createUtilisateur(utilisateur: Partial<Utilisateur>): Utilisateur {
    if (!utilisateur.nomUtilisateur || !utilisateur.motDePasse || !utilisateur.email) {
      throw new BadRequestException('Missing required Utilisateur fields');
    }
    const newUtilisateur: Utilisateur = {
      idUtilisateur: this.nextUtilisateurId++,
      nomUtilisateur: utilisateur.nomUtilisateur,
      motDePasse: utilisateur.motDePasse,
      email: utilisateur.email,
      prenom: utilisateur.prenom,
      nom: utilisateur.nom,
      role: utilisateur.role ?? 'user',
      statut: utilisateur.statut ?? 'actif',
      dateCreation: new Date().toISOString(),
      dateMiseAJour: new Date().toISOString(),
      dernierLogin: utilisateur.dernierLogin,
    };
    this.utilisateurs.push(newUtilisateur);
    this.saveData();
    return newUtilisateur;
  }

  updateUtilisateur(idUtilisateur: number, changes: Partial<Utilisateur>): Utilisateur {
    const utilisateur = this.getUtilisateur(idUtilisateur);
    Object.assign(utilisateur, changes, { dateMiseAJour: new Date().toISOString() });
    this.saveData();
    return utilisateur;
  }

  deleteUtilisateur(idUtilisateur: number): void {
    const index = this.utilisateurs.findIndex((item) => item.idUtilisateur === idUtilisateur);
    if (index < 0) {
      throw new NotFoundException(`Utilisateur ${idUtilisateur} not found`);
    }
    this.utilisateurs.splice(index, 1);
    this.saveData();
  }

  // Consultation
  getConsultations(): Consultation[] {
    return this.consultations;
  }

  getConsultation(numbLot: string, idFournisseur: number): Consultation {
    const consultation = this.consultations.find((item) => item.numbLot === numbLot && item.idFournisseur === idFournisseur);
    if (!consultation) {
      throw new NotFoundException(`Consultation ${numbLot}/${idFournisseur} not found`);
    }
    return consultation;
  }

  createConsultation(consultation: Partial<Consultation>): Consultation {
    if (!consultation.numbLot || consultation.idFournisseur === undefined) {
      throw new BadRequestException('Missing required Consultation fields');
    }
    if (this.consultations.some((item) => item.numbLot === consultation.numbLot && item.idFournisseur === consultation.idFournisseur)) {
      throw new BadRequestException('Consultation already exists');
    }
    const newConsultation: Consultation = {
      numbLot: consultation.numbLot,
      idFournisseur: consultation.idFournisseur,
      DateConsultation: consultation.DateConsultation,
    };
    this.consultations.push(newConsultation);
    this.saveData();
    return newConsultation;
  }

  updateConsultation(numbLot: string, idFournisseur: number, changes: Partial<Consultation>): Consultation {
    const consultation = this.getConsultation(numbLot, idFournisseur);
    Object.assign(consultation, changes);
    this.saveData();
    return consultation;
  }

  deleteConsultation(numbLot: string, idFournisseur: number): void {
    const index = this.consultations.findIndex((item) => item.numbLot === numbLot && item.idFournisseur === idFournisseur);
    if (index < 0) {
      throw new NotFoundException(`Consultation ${numbLot}/${idFournisseur} not found`);
    }
    this.consultations.splice(index, 1);
    this.saveData();
  }

  // Soumission
  getSoumissions(): Soumission[] {
    return this.soumissions;
  }

  getSoumission(idSoumission: string): Soumission {
    const soumission = this.soumissions.find((item) => item.idSoumission === idSoumission);
    if (!soumission) {
      throw new NotFoundException(`Soumission ${idSoumission} not found`);
    }
    return soumission;
  }

  createSoumission(soumission: Partial<Soumission>): Soumission {
    if (!soumission.idSoumission || !soumission.numbLot || soumission.idFournisseur === undefined) {
      throw new BadRequestException('Missing required Soumission fields');
    }
    if (this.soumissions.some((item) => item.idSoumission === soumission.idSoumission)) {
      throw new BadRequestException(`Soumission ${soumission.idSoumission} already exists`);
    }
    const newSoumission: Soumission = {
      idSoumission: soumission.idSoumission,
      numbLot: soumission.numbLot,
      idFournisseur: soumission.idFournisseur,
      DateDepot: soumission.DateDepot,
      Heure: soumission.Heure,
      Observation: soumission.Observation,
      DelaiExecutionPrev: soumission.DelaiExecutionPrev,
      MontantPrev: soumission.MontantPrev,
      nbExemplaire: soumission.nbExemplaire,
    };
    this.soumissions.push(newSoumission);
    this.saveData();
    return newSoumission;
  }

  updateSoumission(idSoumission: string, changes: Partial<Soumission>): Soumission {
    const soumission = this.getSoumission(idSoumission);
    Object.assign(soumission, changes);
    this.saveData();
    return soumission;
  }

  deleteSoumission(idSoumission: string): void {
    const index = this.soumissions.findIndex((item) => item.idSoumission === idSoumission);
    if (index < 0) {
      throw new NotFoundException(`Soumission ${idSoumission} not found`);
    }
    this.soumissions.splice(index, 1);
    this.saveData();
  }

  // Analyse
  getAnalyses(): Analyse[] {
    return this.analyses;
  }

  getAnalyse(numbLot: string): Analyse {
    const analyse = this.analyses.find((item) => item.numbLot === numbLot);
    if (!analyse) {
      throw new NotFoundException(`Analyse ${numbLot} not found`);
    }
    return analyse;
  }

  createAnalyse(analyse: Partial<Analyse>): Analyse {
    if (!analyse.numbLot) {
      throw new BadRequestException('Missing required Analyse fields');
    }
    if (this.analyses.some((item) => item.numbLot === analyse.numbLot)) {
      throw new BadRequestException(`Analyse ${analyse.numbLot} already exists`);
    }
    const newAnalyse: Analyse = {
      numbLot: analyse.numbLot,
      DateEffecReception: analyse.DateEffecReception,
      Observation: analyse.Observation,
      idAttributairePrev: analyse.idAttributairePrev,
      DatePresentationRapport: analyse.DatePresentationRapport,
    };
    this.analyses.push(newAnalyse);
    this.saveData();
    return newAnalyse;
  }

  updateAnalyse(numbLot: string, changes: Partial<Analyse>): Analyse {
    const analyse = this.getAnalyse(numbLot);
    Object.assign(analyse, changes);
    this.saveData();
    return analyse;
  }

  deleteAnalyse(numbLot: string): void {
    const index = this.analyses.findIndex((item) => item.numbLot === numbLot);
    if (index < 0) {
      throw new NotFoundException(`Analyse ${numbLot} not found`);
    }
    this.analyses.splice(index, 1);
    this.saveData();
  }

  // Attributaire
  getAttributaires(): Attributaire[] {
    return this.attributaires;
  }

  getAttributaire(idSoumissionAttribuee: string): Attributaire {
    const attributaire = this.attributaires.find((item) => item.idSoumissionAttribuee === idSoumissionAttribuee);
    if (!attributaire) {
      throw new NotFoundException(`Attributaire ${idSoumissionAttribuee} not found`);
    }
    return attributaire;
  }

  createAttributaire(attributaire: Partial<Attributaire>): Attributaire {
    if (!attributaire.idSoumissionAttribuee) {
      throw new BadRequestException('Missing required Attributaire fields');
    }
    if (this.attributaires.some((item) => item.idSoumissionAttribuee === attributaire.idSoumissionAttribuee)) {
      throw new BadRequestException(`Attributaire ${attributaire.idSoumissionAttribuee} already exists`);
    }
    const newAttributaire: Attributaire = {
      idSoumissionAttribuee: attributaire.idSoumissionAttribuee,
      MontantEffec: attributaire.MontantEffec,
      DelaiExecutionEffec: attributaire.DelaiExecutionEffec,
      DateDemarage: attributaire.DateDemarage,
      DatePrevFin: attributaire.DatePrevFin,
      Observation: attributaire.Observation,
      Statut: attributaire.Statut ?? 'En cours',
    };
    this.attributaires.push(newAttributaire);
    this.saveData();
    return newAttributaire;
  }

  updateAttributaire(idSoumissionAttribuee: string, changes: Partial<Attributaire>): Attributaire {
    const attributaire = this.getAttributaire(idSoumissionAttribuee);
    Object.assign(attributaire, changes);
    this.saveData();
    return attributaire;
  }

  deleteAttributaire(idSoumissionAttribuee: string): void {
    const index = this.attributaires.findIndex((item) => item.idSoumissionAttribuee === idSoumissionAttribuee);
    if (index < 0) {
      throw new NotFoundException(`Attributaire ${idSoumissionAttribuee} not found`);
    }
    this.attributaires.splice(index, 1);
    this.saveData();
  }

  // Avenant
  getAvenants(): Avenant[] {
    return this.avenants;
  }

  getAvenant(idAvenant: number): Avenant {
    const avenant = this.avenants.find((item) => item.idAvenant === idAvenant);
    if (!avenant) {
      throw new NotFoundException(`Avenant ${idAvenant} not found`);
    }
    return avenant;
  }

  createAvenant(avenant: Partial<Avenant>): Avenant {
    if (!avenant.idSoumissionAttribuee || avenant.numbAvenant === undefined) {
      throw new BadRequestException('Missing required Avenant fields');
    }
    const newAvenant: Avenant = {
      idAvenant: this.nextAvenantId++,
      idSoumissionAttribuee: avenant.idSoumissionAttribuee,
      numbAvenant: avenant.numbAvenant,
      MontantAvenant: avenant.MontantAvenant,
      DateProrogation: avenant.DateProrogation,
    };
    this.avenants.push(newAvenant);
    this.saveData();
    return newAvenant;
  }

  updateAvenant(idAvenant: number, changes: Partial<Avenant>): Avenant {
    const avenant = this.getAvenant(idAvenant);
    Object.assign(avenant, changes);
    this.saveData();
    return avenant;
  }

  deleteAvenant(idAvenant: number): void {
    const index = this.avenants.findIndex((item) => item.idAvenant === idAvenant);
    if (index < 0) {
      throw new NotFoundException(`Avenant ${idAvenant} not found`);
    }
    this.avenants.splice(index, 1);
    this.saveData();
  }

  // Document
  getDocuments(): Document[] {
    return this.documents;
  }

  getDocument(numbLot: string): Document {
    const document = this.documents.find((item) => item.numbLot === numbLot);
    if (!document) {
      throw new NotFoundException(`Document for lot ${numbLot} not found`);
    }
    return document;
  }

  createDocument(document: Partial<Document>): Document {
    if (!document.numbLot) {
      throw new BadRequestException('Missing required Document fields');
    }
    if (this.documents.some((item) => item.numbLot === document.numbLot)) {
      throw new BadRequestException(`Document for lot ${document.numbLot} already exists`);
    }
    const newDocument: Document = {
      numbLot: document.numbLot,
      PV_ouverture: document.PV_ouverture ?? 'Non',
      RapportAnalyse: document.RapportAnalyse ?? 'Non',
      PV_attribution: document.PV_attribution ?? 'Non',
      Notification: document.Notification ?? 'Non',
      Contrat: document.Contrat ?? 'Non',
      FED: document.FED ?? 'Non',
      BonCommande: document.BonCommande ?? 'Non',
      Avenant: document.Avenant ?? 'Non',
      OrdreService: document.OrdreService ?? 'Non',
      PV_reception_tech: document.PV_reception_tech ?? 'Non',
    };
    this.documents.push(newDocument);
    this.saveData();
    return newDocument;
  }

  updateDocument(numbLot: string, changes: Partial<Document>): Document {
    const document = this.getDocument(numbLot);
    Object.assign(document, changes);
    this.saveData();
    return document;
  }

  deleteDocument(numbLot: string): void {
    const index = this.documents.findIndex((item) => item.numbLot === numbLot);
    if (index < 0) {
      throw new NotFoundException(`Document for lot ${numbLot} not found`);
    }
    this.documents.splice(index, 1);
    this.saveData();
  }
}
