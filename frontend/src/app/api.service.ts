const API_BASE_URL = 'http://localhost:3000';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.debug('[API] request start', url, init);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      ...init,
    });

    console.debug('[API] response status', response.status, url);

    if (!response.ok) {
      const message = await response.text();
      console.error('[API] response error', response.status, message || response.statusText, url);
      throw new Error(`API ${response.status}: ${message || response.statusText}`);
    }

    const text = await response.text();
    if (!text) {
      console.debug('[API] response empty', url);
      return {} as T;
    }

    const result = JSON.parse(text) as T;
    console.debug('[API] response data', url, result);
    return result;
  } catch (error) {
    console.error('[API] request failed', url, error);
    throw error;
  }
}

export interface Marche {
  numbMarche: string;
  Description: string;
  NombreLot: number;
  NatureOuverture?: string;
  DateEnregistrement?: string;
  Financement?: string;
  ModePassation?: string;
  Demandeur?: string;
  Observation?: string;
  ResponsableSuivi?: string;
  SCT_person1?: string;
  SCT_person2?: string;
  SCT_person3?: string;
  SCT_person4?: string;
  DatePrevReception?: string;
  Statut?: string;
  BudgetEstimatif?: number;
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
  BudgetEstimatif?: number;
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
  lotDescription?: string;
  numbMarche?: string;
}

export interface Lot {
  numbLot: string;
  numbMarche: string;
  Description?: string;
  numbContrat?: string;
}

export interface FournisseurDetails {
  fournisseur: Fournisseur;
  soumissions: Soumission[];
  documents: Document[];
}

function normalizeMarchePayload(marche: Partial<Marche>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  Object.entries(marche).forEach(([key, value]) => {
    const lowerKey = key.replace(/([A-Z])/g, (match) => match.toLowerCase());
    payload[lowerKey] = value;
  });
  return payload;
}

function normalizeLotResponse(raw: any): Lot {
  return {
    numbLot: raw.numbLot ?? raw.numblot ?? raw.numb_lot ?? '',
    numbMarche: raw.numbMarche ?? raw.numbmarche ?? raw.numb_marche ?? '',
    Description: raw.Description ?? raw.description ?? raw.description ?? '',
    numbContrat: raw.numbContrat ?? raw.numbcontrat ?? raw.numb_contrat ?? '',
  } as Lot;
}

export async function createLot(lot: Partial<Lot>): Promise<Lot[]> {
  const response = await request<any>('/lots', {
    method: 'POST',
    body: JSON.stringify(lot),
  });
  if (!response || (Array.isArray(response) && response.length === 0)) {
    return [];
  }
  const rows = Array.isArray(response) ? response : [response];
  return rows.map(normalizeLotResponse);
}

function normalizeSoumissionResponse(raw: any): Soumission {
  return {
    idSoumission: raw.idSoumission ?? raw.idsoumission ?? raw.id_soumission ?? '',
    numbLot: raw.numbLot ?? raw.numblot ?? raw.numb_lot ?? '',
    idFournisseur: raw.idFournisseur ?? raw.idfournisseur ?? raw.id_fournisseur ?? 0,
    DateDepot: raw.DateDepot ?? raw.datedepot ?? raw.date_depot,
    Heure: raw.Heure ?? raw.heure,
    Observation: raw.Observation ?? raw.observation,
    DelaiExecutionPrev: raw.DelaiExecutionPrev ?? raw.delaiexecutionprev ?? raw.delai_execution_prev,
    MontantPrev: raw.MontantPrev ?? raw.montantprev ?? raw.montant_prev,
    nbExemplaire: raw.nbExemplaire ?? raw.nbexemplaire ?? raw.nb_exemplaire,
    lotDescription: raw.lotDescription ?? raw.lotdescription ?? raw.lot_description,
    numbMarche: raw.numbMarche ?? raw.numbmarche ?? raw.numb_marche,
  } as Soumission;
}

function normalizeMarcheResponse(raw: any): Marche {
  return {
    numbMarche: raw.numbMarche ?? raw.numbmarche ?? raw.numb_marche ?? '',
    Description: raw.Description ?? raw.description ?? raw.description ?? '',
    NombreLot: raw.NombreLot ?? raw.nombrelot ?? raw.nombre_lot ?? 0,
    NatureOuverture: raw.NatureOuverture ?? raw.natureouverture ?? raw.nature_ouverture,
    DateEnregistrement: raw.DateEnregistrement ?? raw.dateenregistrement ?? raw.date_enregistrement,
    Financement: raw.Financement ?? raw.financement,
    ModePassation: raw.ModePassation ?? raw.modepassation ?? raw.mode_passation,
    Demandeur: raw.Demandeur ?? raw.demandeur,
    Observation: raw.Observation ?? raw.observation,
    ResponsableSuivi: raw.ResponsableSuivi ?? raw.responsablesuivi ?? raw.responsable_suivi,
    SCT_person1: raw.SCT_person1 ?? raw.sct_person1,
    SCT_person2: raw.SCT_person2 ?? raw.sct_person2,
    SCT_person3: raw.SCT_person3 ?? raw.sct_person3,
    SCT_person4: raw.SCT_person4 ?? raw.sct_person4,
    DatePrevReception: raw.DatePrevReception ?? raw.dateprevreception ?? raw.date_prev_reception,
    Statut: raw.Statut ?? raw.statut,
    BudgetEstimatif: raw.BudgetEstimatif ?? raw.budgetestimatif ?? raw.budget_estimatif ?? 0,
  } as Marche;
}

export async function getMarches(): Promise<Marche[]> {
  const data = await request<any[]>('/marches');
  return data.map(normalizeMarcheResponse);
}

export async function getMarcheDetails(numbMarche: string): Promise<Marche> {
  const data = await request<any>(`/marches/${encodeURIComponent(numbMarche)}`);
  return normalizeMarcheResponse(data);
}

export async function createMarche(marche: Partial<Marche>): Promise<Marche[]> {
  const payload = normalizeMarchePayload(marche);
  const response = await request<any>('/marches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response || (Array.isArray(response) && response.length === 0)) {
    return [];
  }
  const rows = Array.isArray(response) ? response : [response];
  return rows.map(normalizeMarcheResponse);
}

export async function getLots(): Promise<Lot[]> {
  const data = await request<any[]>('/lots');
  return data.map(normalizeLotResponse);
}

export async function getSoumissions(): Promise<Soumission[]> {
  const data = await request<any[]>('/soumissions');
  return data.map(normalizeSoumissionResponse);
}

export async function getFournisseurs(): Promise<Fournisseur[]> {
  return request<Fournisseur[]>('/fournisseurs');
}

export async function getFournisseurDetails(idFournisseur: number): Promise<FournisseurDetails> {
  return request<FournisseurDetails>(`/fournisseurs/details/${idFournisseur}`);
}

export async function createFournisseur(fournisseur: Partial<Fournisseur>): Promise<Fournisseur[]> {
  return request<Fournisseur[]>('/fournisseurs', {
    method: 'POST',
    body: JSON.stringify(fournisseur),
  });
}
