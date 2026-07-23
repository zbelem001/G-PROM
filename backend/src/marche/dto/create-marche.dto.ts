export class CreateMarcheDto {
  numbMarche: string;
  Description: string;
  NombreLot: number;
  Devise?: 'XOF' | 'EUR' | 'USD';
  NatureOuverture?: string;
  DateEnregistrement?: string;
  Financement?: string;
  IdFinancement?: number;
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
  PV_ouverture?: string;
  PV_attribution?: string;
  EstArchive?: boolean;
  DateArchivage?: string;
}
