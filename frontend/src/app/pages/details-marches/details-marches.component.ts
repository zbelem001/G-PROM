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
}

interface Lot {
  id: string;
  numero: string;
  description: string;
  contrat: string;
  documents: LotDocument[];
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
  selectedLot: Lot | null = null;
  selectedDocument: LotDocument | null = null;
  currentStatus = 'Réception';
  statusOptions = ['Réception', 'Ouvert', 'Consultation', 'Soumissions', 'Analyse SCT', 'Attribution', 'Clôturé'];

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

  consultDocument(document: LotDocument) {
    this.selectedDocument = document;
  }
}
