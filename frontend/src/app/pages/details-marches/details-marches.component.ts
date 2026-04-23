import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

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

interface Lot {
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
export class DetailsMarchesComponent {
  activeTab = 'Informations générales';
  showAddLot = false;
  showConsultationDrawer = false;
  showSoumissionDrawer = false;
  showAnalyseDrawer = false;
  showDocumentDrawer = false;
  showAttributionDrawer = false;
  showAvenantDrawer = false;
  showStatusDrawer = false;
  showLotModal = false;
  showProviderModal = false;
  showSubmissionModal = false;
  selectedLot: Lot | null = null;
  selectedDocument: LotDocument | null = null;
  selectedProvider: Provider | null = null;
  selectedSubmission: Submission | null = null;
  currentStatus = 'Réception';
  statusOptions = ['Réception', 'Ouvert', 'Consultation', 'Soumissions', 'Analyse SCT', 'Attribution', 'Clôturé'];
  showAddSctMember = false;
  newSctMemberName = '';
  newSctMemberRole = '';
  newSctMemberEmail = '';

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

  lots: Lot[] = [
    {
      id: 'lot-1',
      numero: 'MAR001_LOT1',
      description: 'Fourniture de matériel informatique',
      contrat: 'CTR-2024-01',
      documents: [
        { id: 'doc-1', nom: 'CCTP_Lot1.pdf', type: 'Spécifications', date: '12 Oct 2023', statut: 'Validé' },
        { id: 'doc-2', nom: 'Devis_Lot1.xlsx', type: 'Offre fournisseur', date: '15 Oct 2023', statut: 'En attente' },
      ],
    },
    {
      id: 'lot-2',
      numero: 'MAR001_LOT2',
      description: 'Installation et configuration',
      contrat: '—',
      documents: [
        { id: 'doc-3', nom: 'Plan_Installation.pdf', type: 'Plan', date: '18 Oct 2023', statut: 'Validé' },
        { id: 'doc-4', nom: 'Rapport_Reception.docx', type: 'Réception', date: '22 Oct 2023', statut: 'Brouillon' },
      ],
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

  submissions: Submission[] = [
    {
      id: 'SM-2023-015',
      lot: 'Lot 1',
      dateDepot: '12 Oct 2023',
      heureDepot: '10:30',
      montant: '33 500 000 FCFA',
      delai: '45',
      exemplaires: 3,
      observation: 'Offre valable 90 jours.',
      statut: 'En attente',
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
      id: 'SM-2023-016',
      lot: 'Lot 2',
      dateDepot: '14 Oct 2023',
      heureDepot: '09:45',
      montant: '12 250 000 FCFA',
      delai: '30',
      exemplaires: 2,
      observation: 'Prix compétitif et délais respectés.',
      statut: 'Validé',
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
    {
      id: 'SM-2023-017',
      lot: 'Lot 3',
      dateDepot: '15 Oct 2023',
      heureDepot: '11:20',
      montant: '5 500 000 FCFA',
      delai: '15',
      exemplaires: 4,
      observation: 'Offre conforme aux exigences.',
      statut: 'Soumis',
      fournisseur: {
        id: 'prov-4',
        nom: 'Papeterie Centrale',
        domaine: 'Fournitures de bureau',
        adresse: '10 Rue du Commerce',
        ville: 'Ouagadougou',
        pays: 'Burkina Faso',
        email: 'contact@papeteriecentrale.bf',
        telephone1: '+226 25 00 03 45',
        contact: 'E. Zongo',
        fonction: 'Chef de dépôt',
        ifu: '789123456',
        rccm: 'BF-OUA-2023-B-11223',
        statut: 'Actif',
        documents: [
          { id: 'doc-p5', nom: 'Offre_Papeterie.pdf', type: 'Offre', date: '15 Oct 2023', statut: 'Soumis' },
        ],
      },
    },
  ];

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleAddLot() {
    this.showAddLot = !this.showAddLot;
  }

  toggleConsultationDrawer() {
    this.showConsultationDrawer = !this.showConsultationDrawer;
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

  openLotPopup(lot: Lot) {
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
}
