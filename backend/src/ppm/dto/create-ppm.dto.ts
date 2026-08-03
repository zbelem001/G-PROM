export class CreatePpmDto {
  numbMarche: string;
  Description: string;
  BudgetEstimatif?: number;
  Devise?: 'XOF' | 'EUR' | 'USD';
  ModePassation?: string;
  DatePrevueLancement: string;
}
