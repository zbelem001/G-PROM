import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import {
  createLot,
  getLots,
  getFournisseurs,
  getMarcheDetails,
  getSoumissions,
  Marche,
  Lot as ApiLot,
  Soumission,
  getConsultations,
  createConsultation,
  ConsultationApi,
  Fournisseur,
} from '../../api.service';

interface LotDocument {
  id: string;
  nom: string;
  type: string;
  date: string;
  statut: string;
  taille?: string;
  url?: string;
  lot?: string;
}

interface MarketLot {
  id: string;
  numero: string;
  description: string;
  contrat: string;
  documents: LotDocument[];
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
  lot: string;
  fournisseur: Provider;
  dateDepot: string;
  heureDepot: string;
  montant: string;
  delai: string;
  exemplaires: number;
  observation: string;
  statut: string;
}

interface Consultation {
  lot: string;
  fournisseur: Provider;
  date: string;
}

interface SctMember {
  id: string;
  nom: string;
  role: string;
  email?: string;
}

@Component({
  standalone: true,
  selector: 'app-details-marches',
  imports: [CommonModule, FormsModule, HeaderComponent, MenuComponent],
  templateUrl: './details-marches.component.html',
  styleUrls: ['./details-marches.component.css'],
})
export class DetailsMarchesComponent implements OnInit {
  constructor(private route: ActivatedRoute, private cd: ChangeDetectorRef) {}
  activeTab = 'Informations générales';
  loadingMarket = false;
  errorMessage = '';
  market: Marche | null = null;
  allLots: ApiLot[] = [];
  lots: MarketLot[] = [];
  submissions: Submission[] = [];
  lotCount = 0;
  submissionCount = 0;
  showAddLot = false;
  newLotNumero = '';
  newLotNumbMarche = '';
  newLotDescription = '';
  newLotContract = '';
  lotErrorMessage = '';
  isSavingLot = false;
  selectedLotFilter: string = 'Tous';
  showConsultationDrawer = false;
  newConsultationLot = '';
  newConsultationFournisseurId = 0;
  newConsultationDate = '';
  isSavingConsultation = false;
  consultationErrorMessage = '';
  availableFournisseurs: Fournisseur[] = [];
  showSoumissionDrawer = false;
  showAnalyseDrawer = false;
  showDocumentDrawer = false;
  showAttributionDrawer = false;
  showAvenantDrawer = false;
  showStatusDrawer = false;
  showLotModal = false;
  showProviderModal = false;
  showSubmissionModal = false;
  selectedLot: MarketLot | null = null;
  selectedDocument: LotDocument | null = null;
  selectedProvider: Provider | null = null;
  selectedSubmission: Submission | null = null;
  currentStatus = 'Réception';
  statusOptions = ['Réception', 'Ouvert', 'Consultation', 'Soumissions', 'Analyse SCT', 'Attribution', 'Clôturé'];
  showAddSctMember = false;
  newSctMemberName = '';
  newSctMemberRole = '';
  newSctMemberEmail = '';

  documentFlags = {
    PV_ouverture: false,
    RapportAnalyse: false,
    PV_attribution: false,
    Notification: false,
    Contrat: false,
    FED: false,
    BonCommande: false,
    Avenant: false,
    OrdreService: false,
    PV_reception_tech: false,
  };

  sctMembers: SctMember[] = [
    {
      id: 'sct-1',
      nom: 'Sarah Ouédraogo',
      role: 'Présidente',
      email: 's.ouedraogo@2ie.bf',
    },
    {
      id: 'sct-2',
      nom: 'Jean Diarra',
      role: 'Membre Technique',
      email: 'j.diarra@2ie.bf',
    },
  ];

  consultations: Consultation[] = [
    {
      lot: 'Lot 1',
      date: '12 Oct 2023',
      fournisseur: {
        id: 'prov-1',
        nom: 'Tech Solutions S.A.',
        domaine: 'Équipement Informatique',
        adresse: '01 Avenue de la Technologie',
        ville: 'Ouagadougou',
        pays: 'Burkina Faso',
        email: 'contact@techsolutions.bf',
        telephone1: '+226 25 00 00 01',
        telephone2: '+226 25 00 00 02',
        contact: 'A. Traoré',
        fonction: 'Directeur des achats',
        ifu: '123456789',
        rccm: 'BF-OUA-2023-B-12345',
        statut: 'Actif',
        documents: [
          { id: 'doc-p1', nom: 'Offre_TechSolutions.pdf', type: 'Offre', date: '12 Oct 2023', statut: 'Soumis' },
          { id: 'doc-p2', nom: 'RCCM_TechSolutions.pdf', type: 'Document légal', date: '11 Oct 2023', statut: 'Validé' },
        ],
      },
    },
    {
      lot: 'Lot 1',
      date: '12 Oct 2023',
      fournisseur: {
        id: 'prov-2',
        nom: 'Innova Systems',
        domaine: 'Équipement Informatique',
        adresse: '15 Rue de l’Innovation',
        ville: 'Bobo-Dioulasso',
        pays: 'Burkina Faso',
        email: 'info@innovasystems.bf',
        telephone1: '+226 25 00 01 23',
        contact: 'M. Ouédraogo',
        fonction: 'Chef de projet',
        ifu: '987654321',
        rccm: 'BF-BOB-2023-B-54321',
        statut: 'Actif',
        documents: [
          { id: 'doc-p3', nom: 'Fiche_Technique_Innova.pdf', type: 'Fiche technique', date: '10 Oct 2023', statut: 'Validé' },
        ],
      },
    },
    {
      lot: 'Lot 2',
      date: '14 Oct 2023',
      fournisseur: {
        id: 'prov-3',
        nom: 'Bureau Plus',
        domaine: 'Aménagement Espace',
        adresse: '22 Boulevard du Bureau',
        ville: 'Ouagadougou',
        pays: 'Burkina Faso',
        email: 'contact@bureauplus.bf',
        telephone1: '+226 25 00 02 34',
        contact: 'N. Kaboré',
        fonction: 'Responsable commercial',
        ifu: '456789123',
        rccm: 'BF-OUA-2023-B-98765',
        statut: 'Actif',
        documents: [
          { id: 'doc-p4', nom: 'Catalogue_BureauPlus.pdf', type: 'Catalogue', date: '09 Oct 2023', statut: 'Validé' },
        ],
      },
    },
  ];

  marketDocuments: LotDocument[] = [
    {
      id: 'market-doc-1',
      nom: 'Rapport_SCT_Lot1.pdf',
      type: 'PDF',
      date: '12 Nov 2023',
      taille: '2.4 MB',
      statut: 'À jour',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    {
      id: 'market-doc-2',
      nom: 'CCTP_Lot1.docx',
      type: 'DOCX',
      date: '10 Nov 2023',
      taille: '1.2 MB',
      statut: 'Validé',
      url: 'https://file-examples.com/wp-content/uploads/2017/02/file-sample_100kB.doc',
    },
    {
      id: 'market-doc-3',
      nom: 'Plan_Aménagement.pdf',
      type: 'PDF',
      date: '15 Nov 2023',
      taille: '3.1 MB',
      statut: 'À jour',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    {
      id: 'market-doc-4',
      nom: 'Devis_Mobilier.xlsx',
      type: 'XLSX',
      date: '18 Nov 2023',
      taille: '850 KB',
      statut: 'En attente',
      url: 'https://file-examples.com/wp-content/uploads/2017/02/file_example_XLS_10.xls',
    },
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  get nextLotNumero(): string {
    const lotNumbers = this.lots
      .map((lot) => {
        const match = /Lot\s*0*(\d+)/i.exec(lot.numero);
        return match ? Number(match[1]) : 0;
      })
      .filter((value) => value > 0);

    const nextNumber = lotNumbers.length > 0 ? Math.max(...lotNumbers) + 1 : 1;
    return `Lot ${String(nextNumber).padStart(2, '0')}`;
  }

  toggleAddLot() {
    this.showAddLot = !this.showAddLot;
    this.isSavingLot = false;
    this.lotErrorMessage = '';
    if (this.showAddLot) {
      this.newLotNumero = this.nextLotNumero;
      this.newLotNumbMarche = this.market?.numbMarche ?? '';
      this.newLotDescription = '';
      this.newLotContract = '';
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

    const lotNumero = this.newLotNumero.trim();
    if (this.allLots.some((lot) => String(lot.numbLot).trim().toLowerCase() === lotNumero.toLowerCase())) {
      this.lotErrorMessage = `Le numéro de lot ${lotNumero} existe déjà.`;
      return;
    }

    const lotPayload: Partial<ApiLot> = {
      numbLot: lotNumero,
      numbMarche: this.newLotNumbMarche.trim(),
      Description: this.newLotDescription.trim(),
      numbContrat: this.newLotContract.trim() || undefined,
    };

    this.isSavingLot = true;
    try {
      const createdLots = await createLot(lotPayload);
      const createdLot = createdLots[0];
      if (createdLot && this.market) {
        await this.loadMarcheDetails(this.market.numbMarche);
      }
      this.toggleAddLot();
    } catch (error: any) {
      this.lotErrorMessage = error?.message || 'Impossible d’ajouter le lot.';
      console.error('[DetailsMarches] createLot failed', error);
    } finally {
      this.isSavingLot = false;
      this.cd.detectChanges();
    }
  }

  toggleConsultationDrawer() {
    this.showConsultationDrawer = !this.showConsultationDrawer;
    this.consultationErrorMessage = '';
    this.isSavingConsultation = false;
    if (this.showConsultationDrawer) {
      this.newConsultationLot = this.lots[0]?.numero || '';
      this.newConsultationFournisseurId = this.availableFournisseurs[0]?.idFournisseur || 0;
      this.newConsultationDate = new Date().toISOString().split('T')[0];
    }
  }

  async addConsultation() {
    if (this.isSavingConsultation) return;
    
    const fournisseurId = Number(this.newConsultationFournisseurId);
    
    if (!this.newConsultationLot || !fournisseurId || fournisseurId === 0) {
      this.consultationErrorMessage = 'Veuillez sélectionner un lot et un fournisseur.';
      return;
    }

    // Vérifier si cette consultation existe déjà localement pour éviter l'erreur 500
    const exists = this.consultations.some(c => 
      c.lot === this.newConsultationLot && 
      Number(c.fournisseur.id) === fournisseurId
    );

    if (exists) {
      this.consultationErrorMessage = 'Ce fournisseur a déjà été consulté pour ce lot.';
      return;
    }

    this.isSavingConsultation = true;
    this.consultationErrorMessage = '';

    try {
      await createConsultation({
        numbLot: this.newConsultationLot,
        idFournisseur: fournisseurId,
        DateConsultation: this.newConsultationDate,
      });

      if (this.market) {
        await this.loadMarcheDetails(this.market.numbMarche);
      }
      this.toggleConsultationDrawer();
    } catch (error: any) {
      this.consultationErrorMessage = error?.message || 'Erreur lors de l’enregistrement de la consultation.';
      console.error('[DetailsMarches] addConsultation failed', error);
    } finally {
      this.isSavingConsultation = false;
      this.cd.detectChanges();
    }
  }

  toggleSoumissionDrawer() {
    this.showSoumissionDrawer = !this.showSoumissionDrawer;
  }

  toggleAnalyseDrawer() {
    this.showAnalyseDrawer = !this.showAnalyseDrawer;
  }

  toggleDocumentDrawer() {
    this.showDocumentDrawer = !this.showDocumentDrawer;
  }

  toggleAttributionDrawer() {
    this.showAttributionDrawer = !this.showAttributionDrawer;
  }

  toggleAvenantDrawer() {
    this.showAvenantDrawer = !this.showAvenantDrawer;
  }

  toggleStatusDrawer() {
    this.showStatusDrawer = !this.showStatusDrawer;
  }

  openLotPopup(lot: MarketLot) {
    this.selectedLot = lot;
    this.selectedDocument = null;
    this.showLotModal = true;
  }

  closeLotPopup() {
    this.showLotModal = false;
    this.selectedLot = null;
    this.selectedDocument = null;
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
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id');
      const tab = params.get('tab');
      if (tab) {
        this.activeTab = tab;
      }
      if (id) {
        this.loadMarcheDetails(id);
      }
      this.cd.detectChanges();
    });
  }

  async loadMarcheDetails(numbMarche: string) {
    this.loadingMarket = true;
    this.errorMessage = '';
    try {
      this.market = await getMarcheDetails(numbMarche);
      this.cd.detectChanges();
    } catch (error: any) {
      console.error('[DetailsMarches] getMarcheDetails failed', error);
      this.errorMessage = error?.message || 'Impossible de charger les informations du marché.';
      this.loadingMarket = false;
      this.cd.detectChanges();
      return;
    }

    try {
      const [lots, submissions, fournisseurs, consultations] = await Promise.all([
        getLots(),
        getSoumissions(),
        getFournisseurs(),
        getConsultations(),
      ]);

      this.allLots = lots;
      this.availableFournisseurs = fournisseurs;
      const filteredLots = lots.filter((lot) => String(lot.numbMarche) === String(numbMarche));
      this.lots = filteredLots.map((rawLot) => ({
        id: rawLot.numbLot,
        numero: rawLot.numbLot,
        description: rawLot.Description || '',
        contrat: (rawLot as any).numbContrat ?? '—',
        documents: [],
      }));

      this.consultations = consultations
        .filter((c) => filteredLots.some((lot) => lot.numbLot === c.numbLot))
        .map((c) => {
          const f = fournisseurs.find((fourn) => fourn.idFournisseur === c.idFournisseur);
          return {
            lot: c.numbLot,
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
            String(submission.numbMarche) === String(numbMarche) ||
            filteredLots.some((lot) => String(lot.numbLot) === String(submission.numbLot))
        )
        .map((submission) => {
          const fournisseur = fournisseurs.find((f) => f.idFournisseur === submission.idFournisseur);
          return {
            id: submission.idSoumission,
            lot: submission.numbLot,
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
            montant: submission.MontantPrev ? `${submission.MontantPrev.toLocaleString()} XOF` : '—',
            delai: submission.DelaiExecutionPrev?.toString() ?? '—',
            exemplaires: submission.nbExemplaire ?? 0,
            observation: submission.Observation ?? '—',
            statut: (submission as any).Statut ?? '—',
          };
        });

      this.lotCount = this.lots.length;
      this.submissionCount = this.submissions.length;
      this.cd.detectChanges();
    } catch (error: any) {
      console.error('[DetailsMarches] getLots/getSoumissions/getFournisseurs failed', error);
    } finally {
      this.loadingMarket = false;
      this.cd.detectChanges();
    }
  }

  toggleAddSctMember() {
    this.showAddSctMember = !this.showAddSctMember;
  }

  addSctMember() {
    const name = this.newSctMemberName.trim();
    const role = this.newSctMemberRole.trim();
    if (!name || !role) {
      return;
    }

    this.sctMembers.push({
      id: `sct-${Date.now()}`,
      nom: name,
      role,
      email: this.newSctMemberEmail.trim() || undefined,
    });

    this.newSctMemberName = '';
    this.newSctMemberRole = '';
    this.newSctMemberEmail = '';
    this.showAddSctMember = false;
  }

  removeSctMember(member: SctMember) {
    this.sctMembers = this.sctMembers.filter((item) => item.id !== member.id);
  }

  consultDocument(document: LotDocument) {
    this.selectedDocument = document;
  }

  openDocument(url?: string) {
    if (!url) {
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
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
