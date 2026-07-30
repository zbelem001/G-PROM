import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminMenuComponent } from '../../../components/admin-menu/admin-menu.component';
import {
  createOptionMarche,
  deleteOptionMarche,
  getOptionsMarche,
  OptionMarche,
  OptionMarcheCategorie,
} from '../../../api.service';

interface CategorieConfig {
  categorie: OptionMarcheCategorie;
  titre: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-admin-listes-parametrables',
  imports: [CommonModule, FormsModule, HeaderComponent, AdminMenuComponent],
  templateUrl: './listes-parametrables.component.html',
  styleUrls: ['./listes-parametrables.component.css'],
})
export class ListesParametrablesComponent implements OnInit {
  readonly categories: CategorieConfig[] = [
    {
      categorie: 'nature_ouverture',
      titre: "Nature d'ouverture",
      description: 'Types de procédure (Fournitures, Services, Travaux...).',
    },
    {
      categorie: 'demandeur',
      titre: 'Demandeur du marché',
      description: 'Directions / départements pouvant initier un marché.',
    },
    {
      categorie: 'responsable_suivi',
      titre: 'Responsable de suivi',
      description: 'Personnel pouvant être désigné responsable du suivi.',
    },
  ];

  options: OptionMarche[] = [];
  loading = false;
  errorMessage = '';

  newValueByCategorie: Record<string, string> = {};
  savingCategorie: string | null = null;
  deletingId: number | null = null;

  constructor(private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const options = await getOptionsMarche();
      this.ngZone.run(() => {
        this.options = options;
        this.loading = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger les listes.';
        this.loading = false;
        this.cd.markForCheck();
      });
    }
  }

  optionsFor(categorie: OptionMarcheCategorie): OptionMarche[] {
    return this.options.filter((o) => o.categorie === categorie);
  }

  async addValue(categorie: OptionMarcheCategorie) {
    const valeur = (this.newValueByCategorie[categorie] || '').trim();
    if (!valeur) return;
    this.savingCategorie = categorie;
    this.errorMessage = '';
    try {
      const created = await createOptionMarche(categorie, valeur);
      this.ngZone.run(() => {
        this.options = [...this.options, created];
        this.newValueByCategorie[categorie] = '';
        this.savingCategorie = null;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || "Impossible d'ajouter cette valeur.";
        this.savingCategorie = null;
        this.cd.markForCheck();
      });
    }
  }

  async removeValue(option: OptionMarche) {
    this.deletingId = option.id;
    this.errorMessage = '';
    try {
      await deleteOptionMarche(option.id);
      this.ngZone.run(() => {
        this.options = this.options.filter((o) => o.id !== option.id);
        this.deletingId = null;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de supprimer cette valeur.';
        this.deletingId = null;
        this.cd.markForCheck();
      });
    }
  }
}
