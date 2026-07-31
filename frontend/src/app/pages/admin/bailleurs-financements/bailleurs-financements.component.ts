import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminMenuComponent } from '../../../components/admin-menu/admin-menu.component';
import { FieldGroupDirective } from '../../../directives/field-group.directive';
import {
  Bailleur,
  createBailleur,
  createFinancement,
  deleteBailleur,
  deleteFinancement,
  Financement,
  getBailleurs,
  getFinancements,
  updateBailleur,
  updateFinancement,
} from '../../../api.service';

@Component({
  standalone: true,
  selector: 'app-admin-bailleurs-financements',
  imports: [CommonModule, FormsModule, HeaderComponent, AdminMenuComponent, FieldGroupDirective],
  templateUrl: './bailleurs-financements.component.html',
  styleUrls: ['./bailleurs-financements.component.css'],
})
export class BailleursFinancementsComponent implements OnInit {
  bailleurs: Bailleur[] = [];
  financements: Financement[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Ajout / édition bailleur
  showBailleurModal = false;
  editingBailleur: Bailleur | null = null;
  bailleurNameInput = '';
  isSavingBailleur = false;

  // Suppression bailleur
  confirmDeleteBailleur: Bailleur | null = null;
  isDeletingBailleur = false;

  // Ajout financement (par bailleur)
  newFinancementNameByBailleur: Record<number, string> = {};
  savingFinancementForBailleur: number | null = null;

  // Édition inline financement
  editingFinancementId: number | null = null;
  editingFinancementName = '';
  savingFinancementEdit = false;

  // Suppression financement
  confirmDeleteFinancement: Financement | null = null;
  isDeletingFinancement = false;

  constructor(private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const [bailleurs, financements] = await Promise.all([getBailleurs(), getFinancements()]);
      this.ngZone.run(() => {
        this.bailleurs = bailleurs;
        this.financements = financements;
        this.loading = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger les bailleurs et financements.';
        this.loading = false;
        this.cd.markForCheck();
      });
    }
  }

  getFinancementsForBailleur(idBailleur: number): Financement[] {
    return this.financements.filter((f) => f.idBailleur === idBailleur);
  }

  // ── Bailleur : ajout / édition ────────────────────────────────────────────

  openAddBailleur() {
    this.editingBailleur = null;
    this.bailleurNameInput = '';
    this.errorMessage = '';
    this.showBailleurModal = true;
  }

  openEditBailleur(bailleur: Bailleur, event: Event) {
    event.stopPropagation();
    this.editingBailleur = bailleur;
    this.bailleurNameInput = bailleur.nomBailleur;
    this.errorMessage = '';
    this.showBailleurModal = true;
  }

  closeBailleurModal() {
    this.showBailleurModal = false;
    this.editingBailleur = null;
    this.bailleurNameInput = '';
  }

  async submitBailleur(event: Event) {
    event.preventDefault();
    const name = this.bailleurNameInput.trim();
    if (!name) return;
    this.isSavingBailleur = true;
    this.errorMessage = '';
    try {
      if (this.editingBailleur) {
        const updated = await updateBailleur(this.editingBailleur.idBailleur, name);
        this.ngZone.run(() => {
          const idx = this.bailleurs.findIndex((b) => b.idBailleur === updated.idBailleur);
          if (idx !== -1) this.bailleurs[idx] = updated;
          this.showBailleurModal = false;
          this.editingBailleur = null;
          this.bailleurNameInput = '';
          this.isSavingBailleur = false;
          this.cd.markForCheck();
        });
      } else {
        const created = await createBailleur(name);
        this.ngZone.run(() => {
          this.bailleurs = [...this.bailleurs, created].sort((a, b) => a.nomBailleur.localeCompare(b.nomBailleur));
          this.showBailleurModal = false;
          this.bailleurNameInput = '';
          this.isSavingBailleur = false;
          this.cd.markForCheck();
        });
      }
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || "Impossible d'enregistrer le bailleur.";
        this.isSavingBailleur = false;
        this.cd.markForCheck();
      });
    }
  }

  // ── Bailleur : suppression ────────────────────────────────────────────────

  openDeleteBailleur(bailleur: Bailleur, event: Event) {
    event.stopPropagation();
    this.confirmDeleteBailleur = bailleur;
  }

  cancelDeleteBailleur() {
    this.confirmDeleteBailleur = null;
  }

  async confirmDeleteBailleurAction() {
    if (!this.confirmDeleteBailleur) return;
    const bailleur = this.confirmDeleteBailleur;
    this.isDeletingBailleur = true;
    this.errorMessage = '';
    try {
      await deleteBailleur(bailleur.idBailleur);
      this.ngZone.run(() => {
        this.bailleurs = this.bailleurs.filter((b) => b.idBailleur !== bailleur.idBailleur);
        this.financements = this.financements.filter((f) => f.idBailleur !== bailleur.idBailleur);
        this.confirmDeleteBailleur = null;
        this.isDeletingBailleur = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de supprimer le bailleur.';
        this.isDeletingBailleur = false;
        this.cd.markForCheck();
      });
    }
  }

  // ── Financement : ajout ───────────────────────────────────────────────────

  async addFinancement(idBailleur: number) {
    const name = (this.newFinancementNameByBailleur[idBailleur] || '').trim();
    if (!name) return;
    this.savingFinancementForBailleur = idBailleur;
    this.errorMessage = '';
    try {
      const created = await createFinancement(name, idBailleur);
      this.ngZone.run(() => {
        this.financements = [...this.financements, created];
        this.newFinancementNameByBailleur[idBailleur] = '';
        this.savingFinancementForBailleur = null;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || "Impossible d'ajouter le financement.";
        this.savingFinancementForBailleur = null;
        this.cd.markForCheck();
      });
    }
  }

  // ── Financement : édition inline ──────────────────────────────────────────

  startEditFinancement(financement: Financement) {
    this.editingFinancementId = financement.idFinancement;
    this.editingFinancementName = financement.nomFinancement;
    this.errorMessage = '';
  }

  cancelEditFinancement() {
    this.editingFinancementId = null;
    this.editingFinancementName = '';
  }

  async saveEditFinancement(financement: Financement) {
    const name = this.editingFinancementName.trim();
    if (!name) return;
    this.savingFinancementEdit = true;
    this.errorMessage = '';
    try {
      const updated = await updateFinancement(financement.idFinancement, name);
      this.ngZone.run(() => {
        const idx = this.financements.findIndex((f) => f.idFinancement === updated.idFinancement);
        if (idx !== -1) this.financements[idx] = updated;
        this.editingFinancementId = null;
        this.editingFinancementName = '';
        this.savingFinancementEdit = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de modifier le financement.';
        this.savingFinancementEdit = false;
        this.cd.markForCheck();
      });
    }
  }

  // ── Financement : suppression ─────────────────────────────────────────────

  openDeleteFinancement(financement: Financement) {
    this.confirmDeleteFinancement = financement;
  }

  cancelDeleteFinancement() {
    this.confirmDeleteFinancement = null;
  }

  async confirmDeleteFinancementAction() {
    if (!this.confirmDeleteFinancement) return;
    const financement = this.confirmDeleteFinancement;
    this.isDeletingFinancement = true;
    this.errorMessage = '';
    try {
      await deleteFinancement(financement.idFinancement);
      this.ngZone.run(() => {
        this.financements = this.financements.filter((f) => f.idFinancement !== financement.idFinancement);
        this.confirmDeleteFinancement = null;
        this.isDeletingFinancement = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de supprimer le financement.';
        this.isDeletingFinancement = false;
        this.cd.markForCheck();
      });
    }
  }
}
