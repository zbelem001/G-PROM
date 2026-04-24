const API_BASE_URL = 'http://localhost:3000';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
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

export async function getMarches(): Promise<Marche[]> {
  return request<Marche[]>('/marches');
}

export async function getMarche(numbMarche: string): Promise<Marche> {
  return request<Marche>(`/marches/${encodeURIComponent(numbMarche)}`);
}

export async function createMarche(marche: Partial<Marche>): Promise<Marche> {
  return request<Marche>('/marches', {
    method: 'POST',
    body: JSON.stringify(marche),
  });
}

export async function updateMarche(numbMarche: string, changes: Partial<Marche>): Promise<Marche> {
  return request<Marche>(`/marches/${encodeURIComponent(numbMarche)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteMarche(numbMarche: string): Promise<void> {
  return request<void>(`/marches/${encodeURIComponent(numbMarche)}`, {
    method: 'DELETE',
  });
}

export async function getLots(): Promise<Lot[]> {
  return request<Lot[]>('/lots');
}

export async function getLot(numbLot: string): Promise<Lot> {
  return request<Lot>(`/lots/${encodeURIComponent(numbLot)}`);
}

export async function createLot(lot: Partial<Lot>): Promise<Lot> {
  return request<Lot>('/lots', {
    method: 'POST',
    body: JSON.stringify(lot),
  });
}

export async function updateLot(numbLot: string, changes: Partial<Lot>): Promise<Lot> {
  return request<Lot>(`/lots/${encodeURIComponent(numbLot)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteLot(numbLot: string): Promise<void> {
  return request<void>(`/lots/${encodeURIComponent(numbLot)}`, {
    method: 'DELETE',
  });
}

export async function getFournisseurs(): Promise<Fournisseur[]> {
  return request<Fournisseur[]>('/fournisseurs');
}

export async function getFournisseur(idFournisseur: number): Promise<Fournisseur> {
  return request<Fournisseur>(`/fournisseurs/${idFournisseur}`);
}

export async function createFournisseur(fournisseur: Partial<Fournisseur>): Promise<Fournisseur> {
  return request<Fournisseur>('/fournisseurs', {
    method: 'POST',
    body: JSON.stringify(fournisseur),
  });
}

export async function updateFournisseur(idFournisseur: number, changes: Partial<Fournisseur>): Promise<Fournisseur> {
  return request<Fournisseur>(`/fournisseurs/${idFournisseur}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteFournisseur(idFournisseur: number): Promise<void> {
  return request<void>(`/fournisseurs/${idFournisseur}`, {
    method: 'DELETE',
  });
}

export async function getUtilisateurs(): Promise<Utilisateur[]> {
  return request<Utilisateur[]>('/utilisateurs');
}

export async function getUtilisateur(idUtilisateur: number): Promise<Utilisateur> {
  return request<Utilisateur>(`/utilisateurs/${idUtilisateur}`);
}

export async function createUtilisateur(utilisateur: Partial<Utilisateur>): Promise<Utilisateur> {
  return request<Utilisateur>('/utilisateurs', {
    method: 'POST',
    body: JSON.stringify(utilisateur),
  });
}

export async function updateUtilisateur(idUtilisateur: number, changes: Partial<Utilisateur>): Promise<Utilisateur> {
  return request<Utilisateur>(`/utilisateurs/${idUtilisateur}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteUtilisateur(idUtilisateur: number): Promise<void> {
  return request<void>(`/utilisateurs/${idUtilisateur}`, {
    method: 'DELETE',
  });
}

export async function getConsultations(): Promise<Consultation[]> {
  return request<Consultation[]>('/consultations');
}

export async function getConsultation(numbLot: string, idFournisseur: number): Promise<Consultation> {
  return request<Consultation>(`/consultations/${encodeURIComponent(numbLot)}/${idFournisseur}`);
}

export async function createConsultation(consultation: Partial<Consultation>): Promise<Consultation> {
  return request<Consultation>('/consultations', {
    method: 'POST',
    body: JSON.stringify(consultation),
  });
}

export async function updateConsultation(numbLot: string, idFournisseur: number, changes: Partial<Consultation>): Promise<Consultation> {
  return request<Consultation>(`/consultations/${encodeURIComponent(numbLot)}/${idFournisseur}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteConsultation(numbLot: string, idFournisseur: number): Promise<void> {
  return request<void>(`/consultations/${encodeURIComponent(numbLot)}/${idFournisseur}`, {
    method: 'DELETE',
  });
}

export async function getSoumissions(): Promise<Soumission[]> {
  return request<Soumission[]>('/soumissions');
}

export async function getSoumission(idSoumission: string): Promise<Soumission> {
  return request<Soumission>(`/soumissions/${encodeURIComponent(idSoumission)}`);
}

export async function createSoumission(soumission: Partial<Soumission>): Promise<Soumission> {
  return request<Soumission>('/soumissions', {
    method: 'POST',
    body: JSON.stringify(soumission),
  });
}

export async function updateSoumission(idSoumission: string, changes: Partial<Soumission>): Promise<Soumission> {
  return request<Soumission>(`/soumissions/${encodeURIComponent(idSoumission)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteSoumission(idSoumission: string): Promise<void> {
  return request<void>(`/soumissions/${encodeURIComponent(idSoumission)}`, {
    method: 'DELETE',
  });
}

export async function getAnalyses(): Promise<Analyse[]> {
  return request<Analyse[]>('/analyses');
}

export async function getAnalyse(numbLot: string): Promise<Analyse> {
  return request<Analyse>(`/analyses/${encodeURIComponent(numbLot)}`);
}

export async function createAnalyse(analyse: Partial<Analyse>): Promise<Analyse> {
  return request<Analyse>('/analyses', {
    method: 'POST',
    body: JSON.stringify(analyse),
  });
}

export async function updateAnalyse(numbLot: string, changes: Partial<Analyse>): Promise<Analyse> {
  return request<Analyse>(`/analyses/${encodeURIComponent(numbLot)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteAnalyse(numbLot: string): Promise<void> {
  return request<void>(`/analyses/${encodeURIComponent(numbLot)}`, {
    method: 'DELETE',
  });
}

export async function getAttributaires(): Promise<Attributaire[]> {
  return request<Attributaire[]>('/attributaires');
}

export async function getAttributaire(idSoumissionAttribuee: string): Promise<Attributaire> {
  return request<Attributaire>(`/attributaires/${encodeURIComponent(idSoumissionAttribuee)}`);
}

export async function createAttributaire(attributaire: Partial<Attributaire>): Promise<Attributaire> {
  return request<Attributaire>('/attributaires', {
    method: 'POST',
    body: JSON.stringify(attributaire),
  });
}

export async function updateAttributaire(idSoumissionAttribuee: string, changes: Partial<Attributaire>): Promise<Attributaire> {
  return request<Attributaire>(`/attributaires/${encodeURIComponent(idSoumissionAttribuee)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteAttributaire(idSoumissionAttribuee: string): Promise<void> {
  return request<void>(`/attributaires/${encodeURIComponent(idSoumissionAttribuee)}`, {
    method: 'DELETE',
  });
}

export async function getAvenants(): Promise<Avenant[]> {
  return request<Avenant[]>('/avenants');
}

export async function getAvenant(idAvenant: number): Promise<Avenant> {
  return request<Avenant>(`/avenants/${idAvenant}`);
}

export async function createAvenant(avenant: Partial<Avenant>): Promise<Avenant> {
  return request<Avenant>('/avenants', {
    method: 'POST',
    body: JSON.stringify(avenant),
  });
}

export async function updateAvenant(idAvenant: number, changes: Partial<Avenant>): Promise<Avenant> {
  return request<Avenant>(`/avenants/${idAvenant}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteAvenant(idAvenant: number): Promise<void> {
  return request<void>(`/avenants/${idAvenant}`, {
    method: 'DELETE',
  });
}

export async function getDocuments(): Promise<Document[]> {
  return request<Document[]>('/documents');
}

export async function getDocument(numbLot: string): Promise<Document> {
  return request<Document>(`/documents/${encodeURIComponent(numbLot)}`);
}

export async function createDocument(document: Partial<Document>): Promise<Document> {
  return request<Document>('/documents', {
    method: 'POST',
    body: JSON.stringify(document),
  });
}

export async function updateDocument(numbLot: string, changes: Partial<Document>): Promise<Document> {
  return request<Document>(`/documents/${encodeURIComponent(numbLot)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
  });
}

export async function deleteDocument(numbLot: string): Promise<void> {
  return request<void>(`/documents/${encodeURIComponent(numbLot)}`, {
    method: 'DELETE',
  });
}
