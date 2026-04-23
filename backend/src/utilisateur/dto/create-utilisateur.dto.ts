export class CreateUtilisateurDto {
  nomUtilisateur: string;
  motDePasse: string;
  email: string;
  prenom?: string;
  nom?: string;
  role?: string;
  statut?: string;
}
