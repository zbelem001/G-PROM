export class CreateMarcheDto {
  numbMarche: string;
  Description: string;
  NombreLot: number;
  Devise?: 'XOF' | 'EUR' | 'USD';
  NatureOuverture?: string;
  IdNatureOuverture?: number;
  DateEnregistrement?: string;
  Financement?: string;
  IdFinancement?: number;
  ModePassation?: string;
  Demandeur?: string;
  IdDemandeur?: number;
  Observation?: string;
  ResponsableSuivi?: string;
  IdResponsableSuivi?: number;
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
