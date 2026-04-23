import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { createMarche, getMarches, Marche } from '../../api.service';

@Component({
  standalone: true,
  selector: 'app-markets',
  imports: [CommonModule, FormsModule, HeaderComponent, MenuComponent, RouterModule],
  templateUrl: './markets.component.html',
  styleUrls: ['./markets.component.css'],
})
export class MarketsComponent implements OnInit {
  showAddMarket = false;
  loading = false;
  errorMessage = '';
  marches: Marche[] = [];
  newMarche: Partial<Marche> = {
    NombreLot: 1,
    Statut: 'À lancer',
    NatureOuverture: 'Fournitures',
    ModePassation: 'Appel d\'Offres Ouvert',
  };

  ngOnInit() {
    this.loadMarches();
  }

  toggleAddMarket() {
    this.showAddMarket = !this.showAddMarket;
  }

  async loadMarches() {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.marches = await getMarches();
    } catch (error: any) {
      this.errorMessage = error.message || 'Impossible de charger les marchés.';
    } finally {
      this.loading = false;
    }
  }

  async submitAddMarket(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    try {
      const added = await createMarche(this.newMarche);
      if (Array.isArray(added) && added.length > 0) {
        this.marches.unshift(added[0]);
      }
      this.showAddMarket = false;
      this.newMarche = {
        NombreLot: 1,
        Statut: 'À lancer',
        NatureOuverture: 'Fournitures',
        ModePassation: 'Appel d\'Offres Ouvert',
      };
    } catch (error: any) {
      this.errorMessage = error.message || 'Impossible de créer le marché.';
    }
  }
}
