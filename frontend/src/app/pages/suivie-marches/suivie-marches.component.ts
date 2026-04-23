import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

interface MarketCard {
  id: string;
  title: string;
  assigned: string;
  ownerInitials: string;
  ownerImage?: string;
  date: string;
  status: string;
  description: string;
  badge?: string;
  urgent?: boolean;
  progress?: string;
}

@Component({
  standalone: true,
  selector: 'app-suivie-marches',
  imports: [CommonModule, RouterModule, HeaderComponent, MenuComponent],
  templateUrl: './suivie-marches.component.html',
  styleUrls: ['./suivie-marches.component.css'],
})
export class SuivieMarchesComponent {
  statuses = [
    {
      code: 'a_lancer',
      label: 'À lancer',
      badgeClass: 'bg-[#d1f3ea] text-[#1a6e5f]',
      dotClass: 'bg-[#76d3c8]/40',
      boardClass: 'bg-[#effaf7]',
    },
    {
      code: 'reception',
      label: 'Réception',
      badgeClass: 'bg-[#dbe5ff] text-[#1f4db3]',
      dotClass: 'bg-[#43a399]/20',
      boardClass: 'bg-[#eff2ff]',
    },
    {
      code: 'soumission',
      label: 'Soumission',
      badgeClass: 'bg-[#f7d8ff] text-[#7a389b]',
      dotClass: 'bg-[#b95bd7]/20',
      boardClass: 'bg-[#f6e7ff]',
    },
  ];

  cards: MarketCard[] = [
    {
      id: 'M-2024-089',
      title: 'Acquisition de serveurs haute performance pour le laboratoire de calcul.',
      assigned: 'S. Traoré',
      ownerInitials: 'ST',
      ownerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
      date: '12 Oct',
      status: 'a_lancer',
      description: 'Marché pour l’achat de serveurs et maintenance pour le centre informatique.',
    },
    {
      id: 'M-2024-092',
      title: 'Renouvellement des licences logicielles d’ingénierie (AutoCAD, MATLAB).',
      assigned: 'I. Barry',
      ownerInitials: 'IB',
      date: '15 Oct',
      status: 'a_lancer',
      description: 'Préparation des dossiers pour le renouvellement des licences métiers.',
      badge: 'bg-[#ffdad6] text-[#93000a]',
      urgent: true,
    },
    {
      id: 'M-2024-081',
      title: 'Fourniture de mobilier de bureau pour le nouveau pavillon administratif.',
      assigned: 'A. Diop',
      ownerInitials: 'AD',
      date: '04 Nov',
      status: 'reception',
      description: 'Suivi des fournisseurs et réception des offres avant ouverture.',
      progress: '66%',
    },
  ];

  dragCard: MarketCard | null = null;
  showMarketModal = false;
  selectedMarket: MarketCard | null = null;

  constructor(private router: Router) {}

  startDrag(card: MarketCard) {
    this.dragCard = card;
  }

  endDrag() {
    this.dragCard = null;
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  dropCard(status: string) {
    if (!this.dragCard) {
      return;
    }
    this.dragCard.status = status;
    this.dragCard = null;
  }

  openMarketModal(card: MarketCard) {
    this.selectedMarket = card;
    this.showMarketModal = true;
  }

  closeMarketModal() {
    this.showMarketModal = false;
    this.selectedMarket = null;
  }

  goToDetails() {
    this.closeMarketModal();
    this.router.navigate(['/marches/details']);
  }
}
