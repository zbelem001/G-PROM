import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  submitting = false;
  errorMessage = '';
  marches: Marche[] = [];
  constructor(private cd: ChangeDetectorRef) {}

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  newMarche: Partial<Marche> = {
    NombreLot: 1,
    Statut: 'À lancer',
    NatureOuverture: 'Fournitures',
    ModePassation: 'Appel d\'Offres Ouvert',
    SCT_person1: 'N/A',
    DateEnregistrement: this.getTodayDate(),
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
    this.marches = [];
    console.debug('[Markets] loadMarches start');
    try {
      this.marches = await getMarches();
      console.debug('[Markets] loadMarches success', this.marches.length, 'marchés');
    } catch (error: any) {
      console.error('[Markets] loadMarches error', error);
      this.errorMessage = error?.message || 'Impossible de charger les marchés.';
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  async submitAddMarket(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.submitting = true;
    console.debug('[Markets] submitAddMarket start');
    try {
      const added = await createMarche(this.newMarche);
      console.debug('[Markets] submitAddMarket returned', added);
      if (Array.isArray(added) && added.length > 0) {
        this.marches.unshift(added[0]);
      }
      this.showAddMarket = false;
      this.newMarche = {
        NombreLot: 1,
        Statut: 'À lancer',
        NatureOuverture: 'Fournitures',
        ModePassation: 'Appel d\'Offres Ouvert',
        DateEnregistrement: this.getTodayDate(),
      };
    } catch (error: any) {
      console.error('[Markets] submitAddMarket error', error);
      this.errorMessage = error.message || 'Impossible de créer le marché.';
    } finally {
      this.submitting = false;
      this.cd.detectChanges();
    }
  }
}
