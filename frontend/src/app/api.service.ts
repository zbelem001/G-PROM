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
    throw new Error(`API ${response.status}: ${message || response.statusText}`);
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
  SCT_person1?: string;
  SCT_person2?: string;
  SCT_person3?: string;
  SCT_person4?: string;
  DatePrevReception?: string;
  Statut?: string;
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

export async function getMarches(): Promise<Marche[]> {
  return request<Marche[]>('/marches');
}

export async function createMarche(marche: Partial<Marche>): Promise<Marche[]> {
  return request<Marche[]>('/marches', {
    method: 'POST',
    body: JSON.stringify(marche),
  });
}

export async function getFournisseurs(): Promise<Fournisseur[]> {
  return request<Fournisseur[]>('/fournisseurs');
}

export async function createFournisseur(fournisseur: Partial<Fournisseur>): Promise<Fournisseur[]> {
  return request<Fournisseur[]>('/fournisseurs', {
    method: 'POST',
    body: JSON.stringify(fournisseur),
  });
}
