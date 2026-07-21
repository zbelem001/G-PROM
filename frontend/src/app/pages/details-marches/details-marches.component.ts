import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import {
  createLot,
  updateLot,
  deleteLot,
  getLots,
  getFournisseurs,
  getMarcheDetails,
  getSoumissions,
  Marche,
  Lot as ApiLot,
  Soumission,
  getConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
  createSoumission,
  updateSoumission,
  deleteSoumission,
  updateMarche,
  getAnalyses,
  createAnalyse,
  updateAnalyse,
  Analyse,
  getDocuments,
  upsertDocument,
  uploadFile,
  Document as ApiDocument,
  getAttributaires,
  createAttributaire,
  updateAttributaire,
  Attributaire,
  ConsultationApi,
  Fournisseur,
  ApiAvenant,
  getAvenants,
  createAvenant,
  updateAvenant,
  deleteAvenant,
} from '../../api.service';

const SCT_MEMBER_SLOTS = 4;

const DOC_TYPES: { key: keyof ApiDocument; label: string }[] = [
  { key: 'Contrat', label: 'Contrat' },
  { key: 'FED', label: "Fichier d'Engagement des Dépenses (FED)" },
  { key: 'BonCommande', label: 'Bon de commande' },
  { key: 'OrdreService', label: "Ordre de service" },
  { key: 'PV_reception_tech', label: 'PV de réception technique' },
];

const MARCHE_DOC_TYPES: { key: 'PV_ouverture' | 'PV_attribution'; label: string }[] = [
  { key: 'PV_ouverture', label: "PV d'ouverture des offres" },
  { key: 'PV_attribution', label: "PV d'attribution" },
];

interface MarketLot {
  id: string;
  nomLot: string;
  description: string;
  contrat: string;
}

interface ProviderDocument {
  id: string;
  nom: string;
  type: string;
  date: string;
  statut: string;
}

interface Provider {
  id: string;
  nom: string;
  domaine: string;
  adresse: string;
  ville: string;
  pays: string;
  email: string;
  telephone1: string;
  telephone2?: string;
  contact: string;
  fonction: string;
  ifu: string;
  rccm: string;
  statut: string;
  documents: ProviderDocument[];
}

interface Submission {
  id: string;
  lotId: string;
  lot: string;
  fournisseur: Provider;
  dateDepot: string;
  heureDepot: string;
  montant: string;
  montantRaw: number;
  devise: string;
  delai: string;
  delaiRaw: number;
  exemplaires: number;
  observation: string;
  statut: string;
}

interface Consultation {
  lotId: string;
  lot: string;
  fournisseur: Provider;
  date: string;
}

@Component({
  standalone: true,
  selector: 'app-details-marches',
  imports: [CommonModule, FormsModule, HeaderComponent, MenuComponent],
  templateUrl: './details-marches.component.html',
  styleUrls: ['./details-marches.component.css'],
})
export class DetailsMarchesComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private cd: ChangeDetectorRef, private ngZone: NgZone) {}
  activeTab = 'Informations générales';
  loadingMarket = false;
  errorMessage = '';
  market: Marche | null = null;
  allLots: ApiLot[] = [];
  lots: MarketLot[] = [];
  submissions: Submission[] = [];
  lotCount = 0;
  submissionCount = 0;
  latestSubmission: { lot: string; supplier: string; date: string } | null = null;
  showAddLot = false;
  editingLot: MarketLot | null = null;
  newLotNumero = '';
  newLotNumbMarche = '';
  newLotDescription = '';
  newLotContract = '';
  lotErrorMessage = '';
  isSavingLot = false;
  selectedLotFilter: string = 'Tous';
  showConsultationDrawer = false;
  editingConsultation: Consultation | null = null;
  newConsultationLot = '';
  newConsultationFournisseurId = 0;
  newConsultationDate = '';
  isSavingConsultation = false;
  consultationErrorMessage = '';
  consultationFournisseurSearch = '';
  showConsultationFournisseurDropdown = false;

  // Soumission Form State
  editingSoumissionId = '';
  newSoumissionId = '';
  newSoumissionLot = '';
  newSoumissionIdFournisseur: number = 0;
  newSoumissionDate: string = '';
  newSoumissionHeure: string = '';
  newSoumissionMontant: number = 0;
  newSoumissionDevise: string = 'XOF';
  newSoumissionDelai: number = 0;
  newSoumissionExemplaires: number = 3;
  newSoumissionObservation: string = '';
  isSavingSoumission = false;
  soumissionErrorMessage = '';

  // Documents
  documents: ApiDocument[] = [];
  selectedLotDocument: ApiDocument | null = null;
  editingDocField = '';
  editingDocValue = '';
  isSavingDoc = false;
  uploadingDocField = '';
  docSaveError = '';
  uploadingAnalyseDocLot = '';
  analyseDocError = '';
  pendingAnalyseDoc: File | null = null;
  pendingAnalyseDocName = '';
  readonly DOC_TYPES = DOC_TYPES;
  readonly MARCHE_DOC_TYPES = MARCHE_DOC_TYPES;
  uploadingMarcheDocField: string | null = null;
  marcheDocError = '';

  // Analyse Form State
  analyses: Analyse[] = [];
  newAnalyseLot = '';
  newAnalyseDateReception = '';
  newAnalyseDatePresentation = '';
  newAnalyseIdAttributaire: number = 0;
  newAnalyseObservation = '';
  isSavingAnalyse = false;
  analyseErrorMessage = '';

  availableFournisseurs: Fournisseur[] = [];
  fournisseurs: Fournisseur[] = [];
  showSoumissionDrawer = false;
  showAnalyseDrawer = false;
  showAttributionDrawer = false;
  attributaires: Attributaire[] = [];
  newAttributionId = '';
  newAttributionMontant: number = 0;
  newAttributionDelai: number = 0;
  newAttributionDateDemarage = '';
  newAttributionDatePrevFin = '';
  newAttributionObservation = '';
  newAttributionStatut = 'En cours';
  isSavingAttribution = false;
  attributionErrorMessage = '';
  readonly ATTRIBUTION_STATUTS = ['En cours', 'Terminé', 'Suspendu', 'Résilié'];
  showAvenantDrawer = false;
  avenants: ApiAvenant[] = [];
  editingAvenant: ApiAvenant | null = null;
  isSavingAvenant = false;
  avenantErrorMessage = '';
  newAvenantSoumissionId = '';
  newAvenantNumb = 1;
  newAvenantMontant = 0;
  newAvenantDevise = 'XOF';
  newAvenantDateProrogation = '';
  pendingAvenantDoc: File | null = null;
  pendingAvenantDocName = '';
  uploadingAvenantDocId: number | null = null;
  avenantDocError = '';
  showStatusDrawer = false;
  showLotModal = false;
  showProviderModal = false;
  showSubmissionModal = false;
  selectedLot: MarketLot | null = null;
  selectedProvider: Provider | null = null;
  selectedSubmission: Submission | null = null;
  currentStatus = 'Réception';
  statusOptions = ['Réception', 'Ouvert', 'Consultation', 'Soumissions', 'Analyse SCT', 'Attribution', 'Clôturé'];
  showAddSctMember = false;
  newSctMemberName = '';
  isSavingSctMember = false;
  sctMemberErrorMessage = '';


  consultations: Consultation[] = [];


  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  get nextLotNumero(): string {
    const lotNumbers = this.lots
      .map((lot) => {
        const match = /Lot\s*0*(\d+)/i.exec(lot.nomLot);
        return match ? Number(match[1]) : 0;
      })
      .filter((value) => value > 0);

    const nextNumber = lotNumbers.length > 0 ? Math.max(...lotNumbers) + 1 : 1;
    return `LOT ${String(nextNumber).padStart(3, '0')}`;
  }

  get nextContractNumero(): string {
    const year = new Date().getFullYear();
    const pattern = new RegExp(`^SAM-${year}-0*(\\d+)`, 'i');
    const numbers = this.allLots
      .map((lot) => {
        const match = pattern.exec(lot.numbContrat || '');
        return match ? Number(match[1]) : 0;
      })
      .filter((value) => value > 0);
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `SAM-${year}-${String(nextNumber).padStart(3, '0')}`;
  }

  toggleAddLot(lot?: MarketLot) {
    this.showAddLot = !this.showAddLot;
    this.isSavingLot = false;
    this.lotErrorMessage = '';
    if (this.showAddLot) {
      if (lot) {
        this.editingLot = lot;
        this.newLotNumero = lot.nomLot;
        this.newLotNumbMarche = this.market?.numbMarche ?? '';
        this.newLotDescription = lot.description;
        this.newLotContract = lot.contrat !== '—' ? lot.contrat : '';
      } else {
        this.editingLot = null;
        this.newLotNumero = this.nextLotNumero;
        this.newLotNumbMarche = this.market?.numbMarche ?? '';
        this.newLotDescription = '';
        this.newLotContract = this.nextContractNumero;
      }
    } else {
      this.editingLot = null;
    }
  }

  async addLot() {
    if (this.isSavingLot) {
      return;
    }

    this.lotErrorMessage = '';
    if (!this.newLotNumero.trim() || !this.newLotDescription.trim() || !this.newLotNumbMarche.trim()) {
      return;
    }

    const lotNumero = this.newLotNumero.trim().toUpperCase();
    const currentMarche = this.newLotNumbMarche.trim();
    const duplicate = this.allLots.some(
      (lot) =>
        String(lot.nomLot).trim().toLowerCase() === lotNumero.toLowerCase() &&
        String(lot.numbMarche).trim() === currentMarche &&
        lot.numbLot !== this.editingLot?.id,
    );
    if (duplicate) {
      this.lotErrorMessage = `Un lot nommé "${lotNumero}" existe déjà dans ce marché.`;
      return;
    }

    const lotPayload: Partial<ApiLot> = {
      nomLot: lotNumero,
      numbMarche: currentMarche,
      Description: this.newLotDescription.trim(),
      numbContrat: this.newLotContract.trim() || undefined,
    };

    this.isSavingLot = true;
    try {
      if (this.editingLot) {
        await updateLot(this.editingLot.id, {
          nomLot: lotNumero,
          Description: this.newLotDescription.trim(),
          numbContrat: this.newLotContract.trim() || undefined,
        });
      } else {
        await createLot(lotPayload);
      }
      this.editingLot = null;
      this.showAddLot = false;
      this.isSavingLot = false;
      this.cd.markForCheck();
      if (this.market) {
        this.loadMarcheDetails(this.market.numbMarche).catch((e) =>
          console.error('[DetailsMarches] reload after saveLot failed', e)
        );
      }
    } catch (error: any) {
      this.lotErrorMessage = error?.message || "Impossible d'ajouter le lot.";
      console.error('[DetailsMarches] saveLot failed', error);
    } finally {
      this.isSavingLot = false;
      this.cd.markForCheck();
    }
  }

  async removeLot(lot: MarketLot) {
    if (!confirm(`Voulez-vous vraiment supprimer le lot "${lot.nomLot}" ? Cette action supprimera aussi toutes ses soumissions et consultations associées.`)) return;
    try {
      await deleteLot(lot.id);
      this.lots = this.lots.filter((l) => l.id !== lot.id);
      this.cd.markForCheck();
      if (this.market) {
        this.loadMarcheDetails(this.market.numbMarche).catch((e) =>
          console.error('[DetailsMarches] reload after removeLot failed', e)
        );
      }
    } catch (error: any) {
      alert(error?.message || 'Impossible de supprimer le lot.');
    }
  }

  toggleConsultationDrawer(consultation?: Consultation) {
    this.showConsultationDrawer = !this.showConsultationDrawer;
    this.consultationErrorMessage = '';
    this.isSavingConsultation = false;
    this.showConsultationFournisseurDropdown = false;
    if (this.showConsultationDrawer) {
      if (consultation) {
        this.editingConsultation = consultation;
        this.newConsultationLot = consultation.lotId;
        this.newConsultationFournisseurId = Number(consultation.fournisseur.id);
        this.newConsultationDate = consultation.date !== '—' ? consultation.date : new Date().toISOString().split('T')[0];
        this.consultationFournisseurSearch = consultation.fournisseur.nom;
      } else {
        this.editingConsultation = null;
        this.newConsultationLot = '';
        this.newConsultationFournisseurId = 0;
        this.newConsultationDate = new Date().toISOString().split('T')[0];
        this.consultationFournisseurSearch = '';
      }
    } else {
      this.editingConsultation = null;
    }
  }

  get sortedAvailableFournisseurs(): Fournisseur[] {
    return [...this.availableFournisseurs].sort((a, b) => b.idFournisseur - a.idFournisseur);
  }

  get filteredConsultationFournisseurs(): Fournisseur[] {
    const q = this.consultationFournisseurSearch.trim().toLowerCase();
    const list = this.sortedAvailableFournisseurs;
    if (!q) return list;
    return list.filter((f) => f.RaisonSocial.toLowerCase().includes(q));
  }

  onConsultationFournisseurSearchChange() {
    this.newConsultationFournisseurId = 0;
    this.showConsultationFournisseurDropdown = true;
  }

  selectConsultationFournisseur(f: Fournisseur) {
    this.newConsultationFournisseurId = f.idFournisseur;
    this.consultationFournisseurSearch = f.RaisonSocial;
    this.showConsultationFournisseurDropdown = false;
  }

  async addConsultation() {
    if (this.isSavingConsultation) return;
    
    // ... existing validation code omitted for brevity but preserved in real execution
    
    const fournisseurId = Number(this.newConsultationFournisseurId);
    
    if (!this.newConsultationLot || !fournisseurId || fournisseurId === 0) {
      this.consultationErrorMessage = 'Veuillez sélectionner un lot et un fournisseur.';
      return;
    }

    // Vérifier si cette consultation existe déjà localement pour éviter l'erreur 500
    const exists = this.consultations.some(c =>
      c.lotId === this.newConsultationLot &&
      Number(c.fournisseur.id) === fournisseurId
    );

    if (exists) {
      this.consultationErrorMessage = 'Ce fournisseur a déjà été consulté pour ce lot.';
      return;
    }

    this.isSavingConsultation = true;
    this.consultationErrorMessage = '';

    try {
      if (this.editingConsultation) {
        await updateConsultation(
          this.editingConsultation.lotId,
          Number(this.editingConsultation.fournisseur.id),
          { DateConsultation: this.newConsultationDate }
        );
      } else {
        await createConsultation({
          numbLot: this.newConsultationLot,
          idFournisseur: fournisseurId,
          DateConsultation: this.newConsultationDate,
        });
      }

      this.isSavingConsultation = false;
      this.showConsultationDrawer = false;
      this.editingConsultation = null;
      this.cd.markForCheck();

      if (this.market) {
        this.loadMarcheDetails(this.market.numbMarche).catch((e) =>
          console.error('[DetailsMarches] reload after saveConsultation failed', e)
        );
      }
    } catch (error: any) {
      this.consultationErrorMessage = error?.message || "Erreur lors de l'enregistrement de la consultation.";
      console.error('[DetailsMarches] addConsultation failed', error);
      this.isSavingConsultation = false;
      this.cd.markForCheck();
    }
  }

  async removeConsultation(consultation: Consultation) {
    if (!confirm(`Voulez-vous vraiment supprimer la consultation du fournisseur ${consultation.fournisseur.nom} pour le ${consultation.lot} ?`)) {
      return;
    }

    try {
      await deleteConsultation(consultation.lotId, Number(consultation.fournisseur.id));
      this.consultations = this.consultations.filter(
        (c) => !(c.lotId === consultation.lotId && c.fournisseur.id === consultation.fournisseur.id)
      );
      this.cd.markForCheck();
      if (this.market) {
        this.loadMarcheDetails(this.market.numbMarche).catch((e) =>
          console.error('[DetailsMarches] reload after deleteConsultation failed', e)
        );
      }
    } catch (error: any) {
      console.error('[DetailsMarches] deleteConsultation failed', error);
      alert('Impossible de supprimer la consultation.');
    }
  }

  toggleSoumissionDrawer(submission?: Submission) {
    this.showSoumissionDrawer = !this.showSoumissionDrawer;
    this.isSavingSoumission = false;
    this.soumissionErrorMessage = '';
    if (this.showSoumissionDrawer) {
      if (submission) {
        this.editingSoumissionId = submission.id;
        this.newSoumissionId = submission.id;
        this.newSoumissionLot = submission.lotId;
        this.newSoumissionIdFournisseur = Number(submission.fournisseur.id);
        this.newSoumissionDate = submission.dateDepot || new Date().toISOString().split('T')[0];
        this.newSoumissionHeure = submission.heureDepot || '';
        this.newSoumissionMontant = submission.montantRaw;
        this.newSoumissionDevise = submission.devise;
        this.newSoumissionDelai = submission.delaiRaw;
        this.newSoumissionExemplaires = submission.exemplaires;
        this.newSoumissionObservation = submission.observation !== '—' ? submission.observation : '';
      } else {
        this.editingSoumissionId = '';
        this.newSoumissionId = `SM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        this.newSoumissionLot = '';
        this.newSoumissionIdFournisseur = 0;
        this.newSoumissionDate = new Date().toISOString().split('T')[0];
        this.newSoumissionHeure = new Date().toTimeString().split(' ')[0].substring(0, 5);
        this.newSoumissionMontant = 0;
        this.newSoumissionDevise = this.market?.Devise || 'XOF';
        this.newSoumissionDelai = 0;
        this.newSoumissionExemplaires = 3;
        this.newSoumissionObservation = '';
      }
    } else {
      this.editingSoumissionId = '';
    }
  }

  async addSoumission() {
    if (this.isSavingSoumission) return;

    const fournisseurId = Number(this.newSoumissionIdFournisseur);
    if (!this.newSoumissionId || !this.newSoumissionLot || !fournisseurId) {
      this.soumissionErrorMessage = 'Veuillez remplir les champs obligatoires (Lot et Fournisseur).';
      return;
    }

    this.isSavingSoumission = true;
    this.soumissionErrorMessage = '';

    try {
      if (this.editingSoumissionId) {
        await updateSoumission(this.editingSoumissionId, {
          numbLot: this.newSoumissionLot,
          idFournisseur: fournisseurId,
          DateDepot: this.newSoumissionDate,
          Heure: this.newSoumissionHeure,
          MontantPrev: this.newSoumissionMontant,
          Devise: this.newSoumissionDevise as 'XOF' | 'EUR' | 'USD',
          DelaiExecutionPrev: this.newSoumissionDelai,
          nbExemplaire: this.newSoumissionExemplaires,
          Observation: this.newSoumissionObservation,
        });
      } else {
        await createSoumission({
          idSoumission: this.newSoumissionId,
          numbLot: this.newSoumissionLot,
          idFournisseur: fournisseurId,
          DateDepot: this.newSoumissionDate,
          Heure: this.newSoumissionHeure,
          MontantPrev: this.newSoumissionMontant,
          Devise: this.newSoumissionDevise as 'XOF' | 'EUR' | 'USD',
          DelaiExecutionPrev: this.newSoumissionDelai,
          nbExemplaire: this.newSoumissionExemplaires,
          Observation: this.newSoumissionObservation,
        });
      }

      this.isSavingSoumission = false;
      this.editingSoumissionId = '';
      this.showSoumissionDrawer = false;
      this.cd.markForCheck();

      // Recharger les données en arrière-plan
      if (this.market) {
        this.loadMarcheDetails(this.market.numbMarche).catch((e) =>
          console.error('[DetailsMarches] reload after addSoumission failed', e)
        );
      }
    } catch (error: any) {
      this.soumissionErrorMessage = error?.message || 'Erreur lors de l enregistrement de la soumission.';
      console.error('[DetailsMarches] addSoumission failed', error);
      this.isSavingSoumission = false;
      this.cd.markForCheck();
    }
  }

  async removeSoumission(submission: Submission) {
    if (!confirm(`Voulez-vous vraiment supprimer la soumission ${submission.id} ?`)) {
      return;
    }

    try {
      await deleteSoumission(submission.id);
      this.submissions = this.submissions.filter((s: Submission) => s.id !== submission.id);
      this.cd.markForCheck();
      if (this.market) {
        this.loadMarcheDetails(this.market.numbMarche).catch((e) =>
          console.error('[DetailsMarches] reload after deleteSoumission failed', e)
        );
      }
    } catch (error: any) {
      console.error('[DetailsMarches] deleteSoumission failed', error);
      alert('Impossible de supprimer la soumission.');
    }
  }

  toggleAnalyseDrawer(preselectedLotId?: string) {
    this.showAnalyseDrawer = !this.showAnalyseDrawer;
    this.analyseErrorMessage = '';
    this.isSavingAnalyse = false;
    if (this.showAnalyseDrawer) {
      const lotId = preselectedLotId ?? '';
      const existing = lotId ? this.getAnalyseForLot(lotId) : undefined;
      this.newAnalyseLot = lotId;
      this.newAnalyseDateReception = existing?.DateEffecReception ?? '';
      this.newAnalyseDatePresentation = existing?.DatePresentationRapport ?? '';
      this.newAnalyseIdAttributaire = existing?.idAttributairePrev ?? 0;
      this.newAnalyseObservation = existing?.Observation ?? '';
    } else {
      this.newAnalyseLot = '';
      this.pendingAnalyseDoc = null;
      this.pendingAnalyseDocName = '';
    }
  }

  get analyseConsultedFournisseurs(): Fournisseur[] {
    if (!this.newAnalyseLot) return [];
    const consultedIds = new Set(
      this.consultations
        .filter((c) => c.lotId === this.newAnalyseLot)
        .map((c) => Number(c.fournisseur.id))
    );
    return this.availableFournisseurs.filter((f) => consultedIds.has(f.idFournisseur));
  }

  onAnalyseLotChange() {
    const existing = this.getAnalyseForLot(this.newAnalyseLot);
    this.newAnalyseDateReception = existing?.DateEffecReception ?? '';
    this.newAnalyseDatePresentation = existing?.DatePresentationRapport ?? '';
    this.newAnalyseIdAttributaire = existing?.idAttributairePrev ?? 0;
    this.newAnalyseObservation = existing?.Observation ?? '';
  }

  getAnalyseForLot(lotId: string): Analyse | undefined {
    return this.analyses.find((a) => a.numbLot === lotId);
  }

  getLotNom(lotId: string): string {
    return this.lots.find((l) => l.id === lotId)?.nomLot ?? lotId;
  }

  private readonly lotAccentPalette = [
    { solid: '#1a2e44', soft: '#eef1f5' }, // marine
    { solid: '#43a399', soft: '#e6f6f4' }, // teal
    { solid: '#856404', soft: '#fff8e6' }, // amber
    { solid: '#039CD3', soft: '#e6f6fc' }, // bleu
    { solid: '#8b5cf6', soft: '#f3eefe' }, // violet
    { solid: '#dc6803', soft: '#fef3e6' }, // orange
  ];

  getLotAccent(lotId: string): { solid: string; soft: string } {
    const idx = this.lots.findIndex((l) => l.id === lotId);
    return this.lotAccentPalette[(idx < 0 ? 0 : idx) % this.lotAccentPalette.length];
  }

  get montantHeaderLabel(): string {
    const devises = [...new Set(this.submissions.map((s) => s.devise).filter(Boolean))];
    return devises.length ? `Montant (${devises.join(' / ')})` : 'Montant';
  }

  get averagesByDevise(): { montant: number; devise: string }[] {
    const groups = new Map<string, number[]>();
    for (const s of this.submissions) {
      if (s.montantRaw > 0) {
        const d = s.devise || this.market?.Devise || 'XOF';
        if (!groups.has(d)) groups.set(d, []);
        groups.get(d)!.push(s.montantRaw);
      }
    }
    return [...groups.entries()].map(([devise, amounts]) => ({
      montant: Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length),
      devise,
    }));
  }

  getFournisseurNom(id: number | string): string {
    const numId = Number(id);
    return this.availableFournisseurs.find((f) => f.idFournisseur === numId)?.RaisonSocial ?? `#${id}`;
  }

  get avenantCount(): number {
    return this.avenants.length;
  }

  get avenantMontantCumule(): number {
    return this.avenants.reduce((sum, a) => sum + (a.MontantAvenant ?? 0), 0);
  }

  get lastAvenant(): ApiAvenant | null {
    if (this.avenants.length === 0) return null;
    return [...this.avenants].sort((a, b) => b.numbAvenant - a.numbAvenant)[0];
  }

  async saveAnalyse() {
    if (this.isSavingAnalyse || !this.newAnalyseLot) return;

    this.isSavingAnalyse = true;
    this.analyseErrorMessage = '';

    const payload: Analyse = {
      numbLot: this.newAnalyseLot,
      DateEffecReception: this.newAnalyseDateReception || undefined,
      DatePresentationRapport: this.newAnalyseDatePresentation || undefined,
      idAttributairePrev: this.newAnalyseIdAttributaire || undefined,
      Observation: this.newAnalyseObservation || undefined,
    };

    try {
      const lotId = this.newAnalyseLot;
      const existing = this.getAnalyseForLot(lotId);
      if (existing) {
        const { numbLot, ...update } = payload;
        await updateAnalyse(lotId, update);
      } else {
        await createAnalyse(payload);
      }

      if (this.pendingAnalyseDoc) {
        const url = await uploadFile(this.pendingAnalyseDoc);
        const updated = await upsertDocument(lotId, { RapportAnalyse: url });
        const idx = this.documents.findIndex((d) => d.numbLot === lotId);
        if (idx >= 0) this.documents[idx] = updated;
        else this.documents.push(updated);
        this.pendingAnalyseDoc = null;
        this.pendingAnalyseDocName = '';
      }

      this.isSavingAnalyse = false;
      this.showAnalyseDrawer = false;
      this.cd.markForCheck();
      if (this.market) {
        this.loadMarcheDetails(this.market.numbMarche).catch((e) =>
          console.error('[DetailsMarches] reload after saveAnalyse failed', e)
        );
      }
    } catch (error: any) {
      this.analyseErrorMessage = error?.message || "Impossible d'enregistrer l'analyse.";
      console.error('[DetailsMarches] saveAnalyse failed', error);
      this.isSavingAnalyse = false;
      this.cd.markForCheck();
    }
  }

  onPendingAnalyseDocSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.pendingAnalyseDoc = file;
      this.pendingAnalyseDocName = file.name;
    }
  }

  getAnalyseDocUrl(numbLot: string): string | undefined {
    const doc = this.documents.find((d) => d.numbLot === numbLot);
    const val = doc?.RapportAnalyse;
    return typeof val === 'string' && val.startsWith('http') ? val : undefined;
  }

  getMarcheDocUrl(field: 'PV_ouverture' | 'PV_attribution'): string | undefined {
    const val = this.market?.[field];
    return typeof val === 'string' && val.startsWith('http') ? val : undefined;
  }

  async onMarcheDocFileSelected(event: Event, field: 'PV_ouverture' | 'PV_attribution') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.uploadingMarcheDocField || !this.market) return;

    this.uploadingMarcheDocField = field;
    this.marcheDocError = '';

    try {
      const url = await uploadFile(file);
      const updated = await updateMarche(this.market.numbMarche, { [field]: url });
      this.market = { ...this.market, ...updated };
    } catch (error: any) {
      this.marcheDocError = error?.message || 'Erreur lors du téléversement.';
    } finally {
      this.uploadingMarcheDocField = null;
      input.value = '';
      this.cd.markForCheck();
    }
  }

  openDocument(url: string | undefined): void {
    if (!url) return;
    // Normalise Cloudinary image URLs to raw for proper file serving
    const rawUrl = url.replace('/image/upload/', '/raw/upload/');
    if (typeof window !== 'undefined') {
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
    }
  }


  async onAnalyseDocFileSelected(event: Event, numbLot: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.uploadingAnalyseDocLot) return;

    this.uploadingAnalyseDocLot = numbLot;
    this.analyseDocError = '';

    try {
      const url = await uploadFile(file);
      const updated = await upsertDocument(numbLot, { RapportAnalyse: url });
      const idx = this.documents.findIndex((d) => d.numbLot === numbLot);
      if (idx >= 0) this.documents[idx] = updated;
      else this.documents.push(updated);
    } catch (error: any) {
      this.analyseDocError = error?.message || 'Erreur lors du téléversement.';
    } finally {
      this.uploadingAnalyseDocLot = '';
      input.value = '';
      this.cd.markForCheck();
    }
  }

  toggleAttributionDrawer(preselectedId?: string) {
    this.showAttributionDrawer = !this.showAttributionDrawer;
    this.attributionErrorMessage = '';
    this.isSavingAttribution = false;
    if (this.showAttributionDrawer) {
      const existing = preselectedId ? this.getAttributaireForSoumission(preselectedId) : undefined;
      this.newAttributionId = preselectedId ?? '';
      this.newAttributionMontant = existing?.MontantEffec ?? 0;
      this.newAttributionDelai = existing?.DelaiExecutionEffec ?? 0;
      this.newAttributionDateDemarage = existing?.DateDemarage ?? '';
      this.newAttributionDatePrevFin = existing?.DatePrevFin ?? '';
      this.newAttributionObservation = existing?.Observation ?? '';
      this.newAttributionStatut = existing?.Statut ?? 'En cours';
    } else {
      this.newAttributionId = '';
    }
  }

  getAttributaireForSoumission(idSoumission: string): Attributaire | undefined {
    return this.attributaires.find((a) => a.idSoumissionAttribuee === idSoumission);
  }

  getSoumissionLabel(idSoumission: string): string {
    const s = this.submissions.find((sub) => sub.id === idSoumission);
    return s ? `${s.lot} — ${s.fournisseur.nom}` : idSoumission;
  }

  getAttributionAccent(idSoumission: string): { solid: string; soft: string } {
    const lotId = this.submissions.find((sub) => sub.id === idSoumission)?.lotId ?? '';
    return this.getLotAccent(lotId);
  }

  async saveAttribution() {
    if (this.isSavingAttribution || !this.newAttributionId) return;
    this.isSavingAttribution = true;
    this.attributionErrorMessage = '';

    const payload: Attributaire = {
      idSoumissionAttribuee: this.newAttributionId,
      MontantEffec: this.newAttributionMontant || undefined,
      DelaiExecutionEffec: this.newAttributionDelai || undefined,
      DateDemarage: this.newAttributionDateDemarage || undefined,
      DatePrevFin: this.newAttributionDatePrevFin || undefined,
      Observation: this.newAttributionObservation || undefined,
      Statut: this.newAttributionStatut || undefined,
    };

    try {
      const existing = this.getAttributaireForSoumission(this.newAttributionId);
      if (existing) {
        const { idSoumissionAttribuee, ...update } = payload;
        const updated = await updateAttributaire(this.newAttributionId, update);
        const idx = this.attributaires.findIndex((a) => a.idSoumissionAttribuee === this.newAttributionId);
        if (idx >= 0) this.attributaires[idx] = updated;
      } else {
        const created = await createAttributaire(payload);
        this.attributaires.unshift(created);
      }
      this.showAttributionDrawer = false;
    } catch (error: any) {
      this.attributionErrorMessage = error?.message || "Impossible d'enregistrer l'attribution.";
      console.error('[DetailsMarches] saveAttribution failed', error);
    } finally {
      this.isSavingAttribution = false;
      this.cd.markForCheck();
    }
  }

  toggleAvenantDrawer(avenant?: ApiAvenant) {
    this.showAvenantDrawer = !this.showAvenantDrawer;
    this.avenantErrorMessage = '';
    this.isSavingAvenant = false;
    this.pendingAvenantDoc = null;
    this.pendingAvenantDocName = '';
    if (this.showAvenantDrawer) {
      if (avenant) {
        this.editingAvenant = avenant;
        this.newAvenantSoumissionId = avenant.idSoumissionAttribuee;
        this.newAvenantNumb = avenant.numbAvenant;
        this.newAvenantMontant = avenant.MontantAvenant ?? 0;
        this.newAvenantDevise = avenant.Devise ?? this.market?.Devise ?? 'XOF';
        this.newAvenantDateProrogation = avenant.DateProrogation ?? '';
      } else {
        this.editingAvenant = null;
        this.newAvenantSoumissionId = this.attributaires[0]?.idSoumissionAttribuee ?? '';
        this.newAvenantNumb = (this.avenants.length > 0 ? Math.max(...this.avenants.map((a) => a.numbAvenant)) + 1 : 1);
        this.newAvenantMontant = 0;
        this.newAvenantDevise = this.market?.Devise ?? 'XOF';
        this.newAvenantDateProrogation = '';
      }
    } else {
      this.editingAvenant = null;
    }
  }

  async saveAvenant() {
    if (this.isSavingAvenant || !this.newAvenantSoumissionId) return;
    this.isSavingAvenant = true;
    this.avenantErrorMessage = '';
    try {
      if (this.editingAvenant) {
        const updated = await updateAvenant(this.editingAvenant.idAvenant, {
          MontantAvenant: this.newAvenantMontant || undefined,
          DateProrogation: this.newAvenantDateProrogation || undefined,
          numbAvenant: this.newAvenantNumb,
          Devise: this.newAvenantDevise as 'XOF' | 'EUR' | 'USD' || undefined,
        });
        const idx = this.avenants.findIndex((a) => a.idAvenant === this.editingAvenant!.idAvenant);
        if (idx >= 0) this.avenants[idx] = updated;
      } else {
        const created = await createAvenant({
          idSoumissionAttribuee: this.newAvenantSoumissionId,
          numbAvenant: this.newAvenantNumb,
          MontantAvenant: this.newAvenantMontant || undefined,
          DateProrogation: this.newAvenantDateProrogation || undefined,
          Devise: this.newAvenantDevise as 'XOF' | 'EUR' | 'USD' || undefined,
        });
        this.avenants.push(created);
        this.avenants.sort((a, b) => b.numbAvenant - a.numbAvenant);
      }

      if (this.pendingAvenantDoc) {
        const lotId = this.getLotIdForSoumission(this.newAvenantSoumissionId);
        if (lotId) {
          const url = await uploadFile(this.pendingAvenantDoc);
          const updated = await upsertDocument(lotId, { Avenant: url });
          const idx = this.documents.findIndex((d) => d.numbLot === lotId);
          if (idx >= 0) this.documents[idx] = updated;
          else this.documents.push(updated);
        }
        this.pendingAvenantDoc = null;
        this.pendingAvenantDocName = '';
      }

      this.showAvenantDrawer = false;
      this.editingAvenant = null;
    } catch (error: any) {
      this.avenantErrorMessage = error?.message || "Impossible d'enregistrer l'avenant.";
    } finally {
      this.isSavingAvenant = false;
      this.cd.markForCheck();
    }
  }

  getLotIdForSoumission(idSoumission: string): string | undefined {
    return this.submissions.find((s) => s.id === idSoumission)?.lotId;
  }

  getAvenantDocUrl(avenant: ApiAvenant): string | undefined {
    const lotId = this.getLotIdForSoumission(avenant.idSoumissionAttribuee);
    if (!lotId) return undefined;
    const val = this.documents.find((d) => d.numbLot === lotId)?.Avenant;
    return typeof val === 'string' && val.startsWith('http') ? val : undefined;
  }

  onPendingAvenantDocSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.pendingAvenantDoc = file;
      this.pendingAvenantDocName = file.name;
    }
  }

  async onAvenantDocFileSelected(event: Event, avenant: ApiAvenant) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.uploadingAvenantDocId) return;

    const lotId = this.getLotIdForSoumission(avenant.idSoumissionAttribuee);
    if (!lotId) {
      this.avenantDocError = "Impossible de déterminer le lot associé à cet avenant.";
      return;
    }

    this.uploadingAvenantDocId = avenant.idAvenant;
    this.avenantDocError = '';

    try {
      const url = await uploadFile(file);
      const updated = await upsertDocument(lotId, { Avenant: url });
      const idx = this.documents.findIndex((d) => d.numbLot === lotId);
      if (idx >= 0) this.documents[idx] = updated;
      else this.documents.push(updated);
    } catch (error: any) {
      this.avenantDocError = error?.message || 'Erreur lors du téléversement.';
    } finally {
      this.uploadingAvenantDocId = null;
      input.value = '';
      this.cd.markForCheck();
    }
  }

  async removeAvenant(idAvenant: number) {
    if (!confirm(`Voulez-vous vraiment supprimer cet avenant ?`)) return;
    try {
      await deleteAvenant(idAvenant);
      this.avenants = this.avenants.filter((a) => a.idAvenant !== idAvenant);
      this.cd.markForCheck();
    } catch (error: any) {
      alert(error?.message || "Impossible de supprimer l'avenant.");
    }
  }

  toggleStatusDrawer() {
    this.showStatusDrawer = !this.showStatusDrawer;
  }

  openLotPopup(lot: MarketLot) {
    this.selectedLot = lot;
    this.selectedLotDocument = this.documents.find((d) => d.numbLot === lot.id) ?? null;
    this.editingDocField = '';
    this.editingDocValue = '';
    this.docSaveError = '';
    this.showLotModal = true;
  }

  closeLotPopup() {
    this.showLotModal = false;
    this.selectedLot = null;
    this.selectedLotDocument = null;
    this.editingDocField = '';
  }

  getDocValue(field: string): string | undefined {
    if (!this.selectedLotDocument) return undefined;
    const val = (this.selectedLotDocument as any)[field];
    return typeof val === 'string' && val.startsWith('http') ? val : undefined;
  }

  startEditDoc(field: string, currentValue?: string) {
    this.editingDocField = field;
    this.editingDocValue = currentValue ?? '';
    this.docSaveError = '';
  }

  cancelEditDoc() {
    this.editingDocField = '';
    this.editingDocValue = '';
    this.docSaveError = '';
  }

  async saveDocField(field: string) {
    if (!this.selectedLot || this.isSavingDoc) return;
    this.isSavingDoc = true;
    this.docSaveError = '';
    try {
      const updated = await upsertDocument(this.selectedLot.id, {
        [field]: this.editingDocValue.trim() || undefined,
      } as Partial<ApiDocument>);
      this.selectedLotDocument = updated;
      const idx = this.documents.findIndex((d) => d.numbLot === this.selectedLot!.id);
      if (idx >= 0) this.documents[idx] = updated;
      else this.documents.push(updated);
      this.cancelEditDoc();
    } catch (error: any) {
      this.docSaveError = error?.message || 'Erreur lors de la sauvegarde.';
    } finally {
      this.isSavingDoc = false;
      this.cd.markForCheck();
    }
  }

  async onFileSelected(event: Event, field: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.selectedLot || this.uploadingDocField) return;

    this.uploadingDocField = field;
    this.docSaveError = '';

    try {
      const url = await uploadFile(file);
      const updated = await upsertDocument(this.selectedLot.id, {
        [field]: url,
      } as Partial<ApiDocument>);
      this.selectedLotDocument = updated;
      const idx = this.documents.findIndex((d) => d.numbLot === this.selectedLot!.id);
      if (idx >= 0) this.documents[idx] = updated;
      else this.documents.push(updated);
    } catch (error: any) {
      this.docSaveError = error?.message || 'Erreur lors du téléversement.';
    } finally {
      this.uploadingDocField = '';
      input.value = '';
      this.cd.markForCheck();
    }
  }

  openProviderPopup(consultation: Consultation) {
    this.selectedProvider = consultation.fournisseur;
    this.showProviderModal = true;
  }

  closeProviderPopup() {
    this.showProviderModal = false;
    this.selectedProvider = null;
  }

  openSubmissionPopup(submission: Submission) {
    this.selectedSubmission = submission;
    this.showSubmissionModal = true;
  }

  closeSubmissionPopup() {
    this.showSubmissionModal = false;
    this.selectedSubmission = null;
  }

  ngOnInit() {
    let loadedId: string | null = null;
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      const tab = params.get('tab');
      if (tab) {
        this.activeTab = tab;
      }
      if (id && id !== loadedId) {
        loadedId = id;
        this.loadMarcheDetails(id);
      }
      this.cd.markForCheck();
    });
  }

  async loadMarcheDetails(numbMarche: string) {
    this.loadingMarket = true;
    this.errorMessage = '';
    try {
      this.market = await getMarcheDetails(numbMarche);
      this.cd.markForCheck();
    } catch (error: any) {
      console.error('[DetailsMarches] getMarcheDetails failed', error);
      this.errorMessage = error?.message || 'Impossible de charger les informations du marché.';
      this.loadingMarket = false;
      this.cd.markForCheck();
      return;
    }

    try {
      const [lots, submissions, fournisseurs, consultations, allAnalyses, allDocuments, allAttributaires, allAvenants] = await Promise.all([
        getLots(),
        getSoumissions(),
        getFournisseurs(),
        getConsultations(),
        getAnalyses(),
        getDocuments(),
        getAttributaires(),
        getAvenants(),
      ]);

      this.allLots = lots;
      this.availableFournisseurs = fournisseurs;
      this.fournisseurs = fournisseurs;
      const filteredLots = lots.filter((lot) => String(lot.numbMarche) === String(numbMarche));
      const filteredLotIds = new Set(filteredLots.map((l) => l.numbLot));
      this.analyses = allAnalyses.filter((a) => filteredLotIds.has(a.numbLot)).reverse();
      this.documents = allDocuments.filter((d) => filteredLotIds.has(d.numbLot));
      const marketSubmissionIds = new Set(
        submissions
          .filter((s) => filteredLots.some((l) => String(l.numbLot) === String(s.numbLot)))
          .map((s) => s.idSoumission)
      );
      this.attributaires = allAttributaires.filter((a) => marketSubmissionIds.has(a.idSoumissionAttribuee)).reverse();
      this.avenants = allAvenants
        .filter((av) => marketSubmissionIds.has(av.idSoumissionAttribuee))
        .sort((a, b) => b.numbAvenant - a.numbAvenant);
      this.lots = filteredLots
        .map((rawLot) => ({
          id: rawLot.numbLot,
          nomLot: rawLot.nomLot,
          description: rawLot.Description || '',
          contrat: rawLot.numbContrat ?? '—',
        }))
        .sort((a, b) => {
          const na = Number(/(\d+)/.exec(a.nomLot)?.[1] ?? 0);
          const nb = Number(/(\d+)/.exec(b.nomLot)?.[1] ?? 0);
          return nb - na;
        });

      this.consultations = consultations
        .filter((c) => filteredLots.some((lot) => lot.numbLot === c.numbLot))
        .sort((a, b) => new Date(b.DateConsultation ?? 0).getTime() - new Date(a.DateConsultation ?? 0).getTime())
        .map((c) => {
          const f = fournisseurs.find((fourn) => fourn.idFournisseur === c.idFournisseur);
          const matchedLot = filteredLots.find((lot) => lot.numbLot === c.numbLot);
          return {
            lotId: c.numbLot,
            lot: matchedLot?.nomLot ?? c.numbLot,
            date: c.DateConsultation || '—',
            fournisseur: {
              id: f?.idFournisseur.toString() ?? String(c.idFournisseur),
              nom: f?.RaisonSocial ?? `Fournisseur ${c.idFournisseur}`,
              domaine: f?.DomaineActivite ?? '—',
              adresse: f?.AdresseGeo || '—',
              ville: f?.Ville ?? '—',
              pays: f?.Pays ?? '—',
              email: f?.Email ?? '—',
              telephone1: f?.Telephone1 ?? '—',
              contact: f?.NomPrenomRepr ?? '—',
              fonction: f?.FonctionRepr ?? '—',
              ifu: f?.numIFU ?? '—',
              rccm: f?.numRCCM ?? '—',
              statut: f?.Statut ?? '—',
              documents: [],
            },
          };
        });

      this.submissions = submissions
        .filter(
          (submission) =>
            filteredLots.some((lot) => String(lot.numbLot) === String(submission.numbLot))
        )
        .sort((a, b) => new Date(b.DateDepot ?? 0).getTime() - new Date(a.DateDepot ?? 0).getTime())
        .map((submission) => {
          const fournisseur = fournisseurs.find((f) => f.idFournisseur === submission.idFournisseur);
          const matchedLot = filteredLots.find((lot) => String(lot.numbLot) === String(submission.numbLot));
          return {
            id: submission.idSoumission,
            lotId: submission.numbLot,
            lot: matchedLot?.nomLot ?? submission.numbLot,
            fournisseur: {
              id: fournisseur?.idFournisseur.toString() ?? String(submission.idFournisseur),
              nom: fournisseur?.RaisonSocial ?? `Fournisseur ${submission.idFournisseur}`,
              domaine: fournisseur?.DomaineActivite ?? '—',
              adresse: fournisseur?.AdresseGeo || fournisseur?.AdressePost || '—',
              ville: fournisseur?.Ville ?? '—',
              pays: fournisseur?.Pays ?? '—',
              email: fournisseur?.Email ?? '—',
              telephone1: fournisseur?.Telephone1 ?? '—',
              telephone2: fournisseur?.Telephone2,
              contact: fournisseur?.NomPrenomRepr ?? '—',
              fonction: fournisseur?.FonctionRepr ?? '—',
              ifu: fournisseur?.numIFU ?? '—',
              rccm: fournisseur?.numRCCM ?? '—',
              statut: fournisseur?.Statut ?? '—',
              documents: [],
            },
            dateDepot: submission.DateDepot ?? '',
            heureDepot: submission.Heure ?? '',
            devise: submission.Devise || this.market?.Devise || 'XOF',
            montant: submission.MontantPrev ? `${submission.MontantPrev.toLocaleString()} ${submission.Devise || this.market?.Devise || 'XOF'}` : '—',
            montantRaw: submission.MontantPrev ?? 0,
            delai: submission.DelaiExecutionPrev?.toString() ?? '—',
            delaiRaw: submission.DelaiExecutionPrev ?? 0,
            exemplaires: submission.nbExemplaire ?? 0,
            observation: submission.Observation ?? '—',
            statut: (submission as any).Statut ?? '—',
          };
        });

      this.lotCount = this.lots.length;
      this.submissionCount = this.submissions.length;

      if (this.submissions.length > 0) {
        const sorted = [...this.submissions].sort((a, b) =>
          new Date(b.dateDepot).getTime() - new Date(a.dateDepot).getTime()
        );
        const latest = sorted[0];
        this.latestSubmission = latest
          ? { lot: latest.lot, supplier: latest.fournisseur.nom, date: latest.dateDepot }
          : null;
      } else {
        this.latestSubmission = null;
      }

      this.cd.markForCheck();
    } catch (error: any) {
      console.error('[DetailsMarches] getLots/getSoumissions/getFournisseurs failed', error);
    } finally {
      this.loadingMarket = false;
      this.cd.markForCheck();
    }
  }

  get sctMembers(): string[] {
    if (!this.market) {
      return [];
    }
    return [this.market.SCT_person1, this.market.SCT_person2, this.market.SCT_person3, this.market.SCT_person4]
      .filter((nom): nom is string => !!nom && nom.trim() !== '' && nom.trim().toUpperCase() !== 'N/A');
  }

  get canAddSctMember(): boolean {
    return this.sctMembers.length < SCT_MEMBER_SLOTS;
  }

  toggleAddSctMember() {
    this.showAddSctMember = !this.showAddSctMember;
    this.newSctMemberName = '';
    this.sctMemberErrorMessage = '';
  }

  private async persistSctMembers(members: string[]) {
    if (!this.market) {
      return;
    }
    const updated = await updateMarche(this.market.numbMarche, {
      SCT_person1: members[0] || 'N/A',
      SCT_person2: members[1] || null,
      SCT_person3: members[2] || null,
      SCT_person4: members[3] || null,
    });
    this.market = { ...this.market, ...updated };
  }

  async addSctMember() {
    const name = this.newSctMemberName.trim();
    if (!name || !this.market) {
      return;
    }
    if (!this.canAddSctMember) {
      this.sctMemberErrorMessage = `La sous-commission technique est limitée à ${SCT_MEMBER_SLOTS} membres.`;
      return;
    }

    this.isSavingSctMember = true;
    this.sctMemberErrorMessage = '';
    try {
      await this.persistSctMembers([...this.sctMembers, name]);
      this.newSctMemberName = '';
      this.showAddSctMember = false;
    } catch (error: any) {
      this.sctMemberErrorMessage = error?.message || "Impossible d'ajouter le membre.";
      console.error('[DetailsMarches] addSctMember failed', error);
    } finally {
      this.isSavingSctMember = false;
      this.cd.markForCheck();
    }
  }

  setLotFilter(filter: string) {
    this.selectedLotFilter = filter;
    this.cd.detectChanges();
  }

  get filteredConsultations(): Consultation[] {
    if (this.selectedLotFilter === 'Tous') {
      return this.consultations;
    }
    return this.consultations.filter((c) => c.lot === this.selectedLotFilter);
  }
}
