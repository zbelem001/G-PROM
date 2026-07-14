export class CreateAvenantDto {
  idSoumissionAttribuee: string;
  numbAvenant: number;
  MontantAvenant?: number;
  DateProrogation?: string;
  Devise?: 'XOF' | 'EUR' | 'USD';
}
