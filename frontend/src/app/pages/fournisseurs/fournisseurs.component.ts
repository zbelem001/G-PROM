import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { createFournisseur, Fournisseur, getFournisseurs } from '../../api.service';

@Component({
  standalone: true,
  selector: 'app-fournisseurs',
  imports: [CommonModule, FormsModule, HeaderComponent, MenuComponent, RouterModule],
  templateUrl: './fournisseurs.component.html',
  styleUrls: ['./fournisseurs.component.css'],
})
export class FournisseursComponent implements OnInit {
  showAddFournisseur = false;
  loading = false;
  errorMessage = '';
  fournisseurs: Fournisseur[] = [];
  newFournisseur: Partial<Fournisseur> = {
    FormeJuridique: 'SARL',
    DomaineActivite: 'Fournitures',
    Ville: 'Ouagadougou',
    Pays: 'Burkina Faso',
    DisposeIFU: true,
    DisposeRCCM: true,
    NomPrenomRepr: '',
    Telephone1Repr: '',
    EmailRepr: '',
    Statut: 'Externe',
  };

  ngOnInit() {
    this.loadFournisseurs();
  }

  toggleAddFournisseur() {
    this.showAddFournisseur = !this.showAddFournisseur;
  }

  async loadFournisseurs() {
    this.loading = true;
    this.errorMessage = '';
    try {
      this.fournisseurs = await getFournisseurs();
    } catch (error: any) {
      this.errorMessage = error.message || 'Impossible de charger les fournisseurs.';
    } finally {
      this.loading = false;
    }
  }

  async submitFournisseur(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    try {
      const added = await createFournisseur(this.newFournisseur);
      if (Array.isArray(added) && added.length > 0) {
        this.fournisseurs.unshift(added[0]);
      }
      this.showAddFournisseur = false;
      this.newFournisseur = {
        FormeJuridique: 'SARL',
        DomaineActivite: 'Fournitures',
        Ville: 'Ouagadougou',
        Pays: 'Burkina Faso',
        DisposeIFU: true,
        DisposeRCCM: true,
        NomPrenomRepr: '',
        Telephone1Repr: '',
        EmailRepr: '',
        Statut: 'Externe',
      };
    } catch (error: any) {
      this.errorMessage = error.message || 'Impossible de créer le fournisseur.';
    }
  }
}
