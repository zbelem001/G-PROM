import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  standalone: true,
  selector: 'app-details-marches',
  imports: [CommonModule, HeaderComponent, MenuComponent],
  templateUrl: './details-marches.component.html',
  styleUrls: ['./details-marches.component.css'],
})
export class DetailsMarchesComponent {
  activeTab = 'Informations générales';
  showAddLot = false;
  showConsultationDrawer = false;

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleAddLot() {
    this.showAddLot = !this.showAddLot;
  }

  toggleConsultationDrawer() {
    this.showConsultationDrawer = !this.showConsultationDrawer;
  }
}
