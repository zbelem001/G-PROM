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
  Devise?: 'XOF' | 'EUR' | 'USD';
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
  Devise?: 'XOF' | 'EUR' | 'USD';
}

export interface Lot {
  numbLot: string;
  nomLot: string;
  numbMarche: string;
  Description?: string;
  numbContrat?: string;
}

export interface ConsultationApi {
  numbLot: string;
  idFournisseur: number;
  DateConsultation?: string;
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
    nomLot: raw.nomLot ?? raw.nomlot ?? raw.nom_lot ?? '',
    numbMarche: raw.numbMarche ?? raw.numbmarche ?? raw.numb_marche ?? '',
    Description: raw.Description ?? raw.description ?? '',
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
    Devise: raw.Devise ?? raw.devise ?? 'XOF',
  };
}

export async function getSoumissions(): Promise<Soumission[]> {
  const data = await request<any[]>('/soumissions');
  return data.map(normalizeSoumissionResponse);
}

export async function createSoumission(soumission: Partial<Soumission>): Promise<Soumission> {
  const response = await request<any>('/soumissions', {
    method: 'POST',
    body: JSON.stringify(soumission),
  });
  const row = Array.isArray(response) ? response[0] : response;
  return normalizeSoumissionResponse(row);
}

function normalizeMarcheResponse(raw: any): Marche {
  return {
    numbMarche: raw.numbMarche ?? raw.numbmarche ?? raw.numb_marche ?? '',
    Description: raw.Description ?? raw.description ?? raw.description ?? '',
    NombreLot: raw.NombreLot ?? raw.nombrelot ?? raw.nombre_lot ?? 0,
    Devise: raw.Devise ?? raw.devise ?? 'XOF',
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

export async function updateMarche(numbMarche: string, marche: Record<string, unknown>): Promise<Marche> {
  const payload = normalizeMarchePayload(marche as Partial<Marche>);
  const response = await request<any>(`/marches/${encodeURIComponent(numbMarche)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return normalizeMarcheResponse(response);
}

export async function getLots(): Promise<Lot[]> {
  const data = await request<any[]>('/lots');
  return data.map(normalizeLotResponse);
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

export async function deleteSoumission(idSoumission: string): Promise<void> {
  await request(`/soumissions/${idSoumission}`, {
    method: 'DELETE',
  });
}

function normalizeConsultationResponse(raw: any): ConsultationApi {
  return {
    numbLot: raw.numbLot ?? raw.numblot ?? raw.numb_lot ?? '',
    idFournisseur: raw.idFournisseur ?? raw.idfournisseur ?? raw.id_fournisseur ?? 0,
    DateConsultation: raw.DateConsultation ?? raw.dateconsultation ?? raw.date_consultation,
  };
}

export async function getConsultations(): Promise<ConsultationApi[]> {
  const data = await request<any[]>('/consultations');
  return data.map(normalizeConsultationResponse);
}

export async function createConsultation(consultation: Partial<ConsultationApi>): Promise<ConsultationApi> {
  const payload: any = {};
  if (consultation.numbLot) payload.numblot = consultation.numbLot;
  if (consultation.idFournisseur) payload.idfournisseur = consultation.idFournisseur;
  if (consultation.DateConsultation) payload.dateconsultation = consultation.DateConsultation;

  const response = await request<any>('/consultations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const row = Array.isArray(response) ? response[0] : response;
  return normalizeConsultationResponse(row);
}

export async function deleteConsultation(numbLot: string, idFournisseur: number): Promise<void> {
  await request(`/consultations/${numbLot}/${idFournisseur}`, {
    method: 'DELETE',
  });
}

function normalizeDocumentResponse(raw: any): Document {
  return {
    numbLot: raw.numbLot ?? raw.numblot ?? '',
    PV_ouverture: raw.PV_ouverture ?? raw.pv_ouverture ?? undefined,
    RapportAnalyse: raw.RapportAnalyse ?? raw.rapportanalyse ?? undefined,
    PV_attribution: raw.PV_attribution ?? raw.pv_attribution ?? undefined,
    Notification: raw.Notification ?? raw.notification ?? undefined,
    Contrat: raw.Contrat ?? raw.contrat ?? undefined,
    FED: raw.FED ?? raw.fed ?? undefined,
    BonCommande: raw.BonCommande ?? raw.boncommande ?? undefined,
    Avenant: raw.Avenant ?? raw.avenant ?? undefined,
    OrdreService: raw.OrdreService ?? raw.ordreservice ?? undefined,
    PV_reception_tech: raw.PV_reception_tech ?? raw.pv_reception_tech ?? undefined,
  };
}

export async function getDocuments(): Promise<Document[]> {
  const data = await request<any[]>('/documents');
  return data.map(normalizeDocumentResponse);
}

export async function upsertDocument(numbLot: string, doc: Partial<Document>): Promise<Document> {
  const response = await request<any>(`/documents/${encodeURIComponent(numbLot)}`, {
    method: 'PUT',
    body: JSON.stringify(doc),
  });
  return normalizeDocumentResponse(response);
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

function normalizeAttributaireResponse(raw: any): Attributaire {
  return {
    idSoumissionAttribuee: raw.idSoumissionAttribuee ?? raw.idsoumissionattribuee ?? '',
    MontantEffec: raw.MontantEffec ?? raw.montanteffec ?? undefined,
    DelaiExecutionEffec: raw.DelaiExecutionEffec ?? raw.delaiexecutioneffec ?? undefined,
    DateDemarage: raw.DateDemarage ?? raw.datedemarage ?? undefined,
    DatePrevFin: raw.DatePrevFin ?? raw.dateprevfin ?? undefined,
    Observation: raw.Observation ?? raw.observation ?? undefined,
    Statut: raw.Statut ?? raw.statut ?? undefined,
  };
}

export async function getAttributaires(): Promise<Attributaire[]> {
  const data = await request<any[]>('/attributaires');
  return data.map(normalizeAttributaireResponse);
}

export async function createAttributaire(attr: Attributaire): Promise<Attributaire> {
  const response = await request<any>('/attributaires', {
    method: 'POST',
    body: JSON.stringify(attr),
  });
  return normalizeAttributaireResponse(response);
}

export async function updateAttributaire(idSoumission: string, attr: Partial<Attributaire>): Promise<Attributaire> {
  const response = await request<any>(`/attributaires/${encodeURIComponent(idSoumission)}`, {
    method: 'PATCH',
    body: JSON.stringify(attr),
  });
  return normalizeAttributaireResponse(response);
}

export async function deleteAttributaire(idSoumission: string): Promise<void> {
  await request(`/attributaires/${encodeURIComponent(idSoumission)}`, { method: 'DELETE' });
}

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const url = `${API_BASE_URL}/upload`;
  const response = await fetch(url, { method: 'POST', body: formData });
  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Upload échoué : ${msg}`);
  }
  const data = await response.json();
  return data.url as string;
}

export interface Analyse {
  numbLot: string;
  DateEffecReception?: string;
  Observation?: string;
  idAttributairePrev?: number;
  DatePresentationRapport?: string;
}

function normalizeAnalyseResponse(raw: any): Analyse {
  return {
    numbLot: raw.numbLot ?? raw.numblot ?? '',
    DateEffecReception: raw.DateEffecReception ?? raw.dateeffecreception ?? undefined,
    Observation: raw.Observation ?? raw.observation ?? undefined,
    idAttributairePrev: (raw.idAttributairePrev ?? raw.idattributaireprev) != null
      ? Number(raw.idAttributairePrev ?? raw.idattributaireprev)
      : undefined,
    DatePresentationRapport: raw.DatePresentationRapport ?? raw.datepresentationrapport ?? undefined,
  };
}

export async function getAnalyses(): Promise<Analyse[]> {
  const data = await request<any[]>('/analyses');
  return data.map(normalizeAnalyseResponse);
}

export async function createAnalyse(analyse: Analyse): Promise<Analyse> {
  const response = await request<any>('/analyses', {
    method: 'POST',
    body: JSON.stringify(analyse),
  });
  const row = Array.isArray(response) ? response[0] : response;
  return normalizeAnalyseResponse(row);
}

export async function updateAnalyse(numbLot: string, analyse: Partial<Analyse>): Promise<Analyse> {
  const response = await request<any>(`/analyses/${encodeURIComponent(numbLot)}`, {
    method: 'PATCH',
    body: JSON.stringify(analyse),
  });
  return normalizeAnalyseResponse(response);
}
