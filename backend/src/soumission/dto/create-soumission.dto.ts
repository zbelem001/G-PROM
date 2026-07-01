export class CreateSoumissionDto {
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
