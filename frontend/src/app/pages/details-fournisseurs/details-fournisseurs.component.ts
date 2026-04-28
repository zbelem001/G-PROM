import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { Fournisseur, getFournisseurs } from '../../../api.service';

@Component({
  standalone: true,
  selector: 'app-details-fournisseurs',
  imports: [CommonModule, HeaderComponent, MenuComponent],
  templateUrl: './details-fournisseurs.component.html',
  styleUrls: ['./details-fournisseurs.component.css'],
})
export class DetailsFournisseursComponent implements OnInit {
  activeTab = 'Profil';
  fournisseur: Fournisseur | null = null;
  loading = false;
  errorMessage = '';

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadFournisseur();
  }

  async loadFournisseur() {
    this.loading = true;
    this.errorMessage = '';

    try {
      const fournisseurs = await getFournisseurs();
      this.fournisseur = fournisseurs.length ? fournisseurs[0] : null;
    } catch (error: unknown) {
      this.errorMessage = (error as Error)?.message || 'Impossible de charger le fournisseur.';
    }

    this.loading = false;
    this.cd.detectChanges();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
