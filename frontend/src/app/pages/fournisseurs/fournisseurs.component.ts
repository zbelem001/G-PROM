import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { createFournisseur, deleteFournisseur, Fournisseur, getFournisseurs, updateFournisseur } from '../../../api.service';

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
  submitting = false;
  errorMessage = '';
  successMessage = '';
  fournisseurs: Fournisseur[] = [];
  currentPage = 1;
  pageSize = 10;

  searchQuery = '';
  filterStatut = '';
  showStatutDropdown = false;

  showEditFournisseur = false;
  editingFournisseur: Partial<Fournisseur> = {};
  isUpdating = false;

  confirmDeleteFournisseur: Fournisseur | null = null;
  isDeleting = false;

  constructor(private cd: ChangeDetectorRef) {}

  newFournisseur: Partial<Fournisseur> = {
    RaisonSocial: '',
    FormeJuridique: 'SARL',
    DomaineActivite: '',
    AdresseGeo: '',
    AdressePost: '',
    Ville: '',
    Pays: 'Burkina Faso',
    Telephone1: '',
    Telephone2: '',
    Email: '',
    SiteWeb: '',
    DisposeIFU: false,
    numIFU: '',
    DisposeRCCM: false,
    numRCCM: '',
    NomPrenomRepr: '',
    FonctionRepr: '',
    Telephone1Repr: '',
    EmailRepr: '',
    Statut: 'Externe',
  };

  ngOnInit() {
    this.loadFournisseurs();
  }

  get filteredFournisseurs(): Fournisseur[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.fournisseurs.filter((f) => {
      if (q) {
        const haystack = [f.RaisonSocial, f.DomaineActivite, f.Ville, f.Email]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (this.filterStatut && (f.Statut || 'Externe') !== this.filterStatut) return false;
      return true;
    });
  }

  get sortedFournisseurs(): Fournisseur[] {
    return [...this.filteredFournisseurs].sort((a, b) => {
      const aDate = a.dateAjout ? Date.parse(a.dateAjout) : 0;
      const bDate = b.dateAjout ? Date.parse(b.dateAjout) : 0;
      if (aDate !== bDate) {
        return bDate - aDate;
      }
      return b.idFournisseur - a.idFournisseur;
    });
  }

  get displayedFournisseurs(): Fournisseur[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sortedFournisseurs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredFournisseurs.length / this.pageSize));
  }

  get uniqueStatuts(): string[] {
    return [...new Set(this.fournisseurs.map((f) => f.Statut || 'Externe'))];
  }

  onSearch(): void {
    this.currentPage = 1;
  }

  toggleStatutDropdown(event: Event): void {
    event.stopPropagation();
    this.showStatutDropdown = !this.showStatutDropdown;
  }

  setFilterStatut(statut: string): void {
    this.filterStatut = statut;
    this.currentPage = 1;
    this.showStatutDropdown = false;
    this.cd.detectChanges();
  }

  closeDropdowns(): void {
    this.showStatutDropdown = false;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }

  previousPage(): void {
    this.setPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.setPage(this.currentPage + 1);
  }

  toggleAddFournisseur() {
    this.showAddFournisseur = !this.showAddFournisseur;
  }

  get displayStart(): number {
    return Math.min((this.currentPage - 1) * this.pageSize + 1, this.filteredFournisseurs.length || 1);
  }

  get displayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredFournisseurs.length);
  }

  async loadFournisseurs() {
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.fournisseurs = [];
    try {
      this.fournisseurs = await getFournisseurs();
      this.currentPage = 1;
    } catch (error: any) {
      this.errorMessage = error?.message || 'Impossible de charger les fournisseurs.';
    } finally {
      this.loading = false;
      this.cd.markForCheck();
    }
  }

  async onSubmit(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.successMessage = '';
    this.submitting = true;
    try {
      const created = await createFournisseur(this.newFournisseur);
      this.fournisseurs.unshift(created);
      this.currentPage = 1;
      this.successMessage = 'Fournisseur ajouté avec succès.';
      this.showAddFournisseur = false;
      this.newFournisseur = {
        RaisonSocial: '',
        FormeJuridique: 'SARL',
        DomaineActivite: '',
        AdresseGeo: '',
        AdressePost: '',
        Ville: '',
        Pays: 'Burkina Faso',
        Telephone1: '',
        Telephone2: '',
        Email: '',
        SiteWeb: '',
        DisposeIFU: false,
        numIFU: '',
        DisposeRCCM: false,
        numRCCM: '',
        NomPrenomRepr: '',
        FonctionRepr: '',
        Telephone1Repr: '',
        EmailRepr: '',
        Statut: 'Externe',
      };
    } catch (error: any) {
      this.errorMessage = error?.message || 'Impossible de créer le fournisseur.';
    } finally {
      this.submitting = false;
      this.cd.markForCheck();
    }
  }

  getStatutClass(statut: string | undefined): string {
    switch (statut) {
      case 'Non conforme': return 'bg-red-100 text-red-700';
      case 'Suspendu':     return 'bg-orange-100 text-orange-700';
      case 'Interne':      return 'bg-blue-50 text-blue-700';
      default:             return 'bg-green-100 text-[#1E7A4E]';
    }
  }

  getStatutDotClass(statut: string | undefined): string {
    switch (statut) {
      case 'Non conforme': return 'bg-red-700';
      case 'Suspendu':     return 'bg-orange-700';
      case 'Interne':      return 'bg-blue-700';
      default:             return 'bg-[#1E7A4E]';
    }
  }

  // ── Édition ───────────────────────────────────────────────────────────────

  openEditFournisseur(fournisseur: Fournisseur, event: Event) {
    event.stopPropagation();
    this.editingFournisseur = { ...fournisseur };
    this.showEditFournisseur = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cd.detectChanges();
  }

  closeEditFournisseur() {
    this.showEditFournisseur = false;
    this.editingFournisseur = {};
  }

  async submitEditFournisseur(event: Event) {
    event.preventDefault();
    if (!this.editingFournisseur.idFournisseur) return;
    this.errorMessage = '';
    this.isUpdating = true;
    try {
      const { idFournisseur, ...changes } = this.editingFournisseur;
      const updated = await updateFournisseur(idFournisseur, changes);
      const idx = this.fournisseurs.findIndex((f) => f.idFournisseur === idFournisseur);
      if (idx !== -1) this.fournisseurs[idx] = updated;
      this.showEditFournisseur = false;
      this.editingFournisseur = {};
      this.successMessage = 'Fournisseur modifié avec succès.';
    } catch (error: any) {
      this.errorMessage = error?.message || 'Impossible de modifier le fournisseur.';
    } finally {
      this.isUpdating = false;
      this.cd.markForCheck();
    }
  }

  // ── Suppression ───────────────────────────────────────────────────────────

  openDeleteConfirm(fournisseur: Fournisseur, event: Event) {
    event.stopPropagation();
    this.confirmDeleteFournisseur = fournisseur;
    this.cd.detectChanges();
  }

  cancelDelete() {
    this.confirmDeleteFournisseur = null;
    this.cd.detectChanges();
  }

  async confirmDelete() {
    if (!this.confirmDeleteFournisseur) return;
    const fournisseur = this.confirmDeleteFournisseur;
    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await deleteFournisseur(fournisseur.idFournisseur);
      this.fournisseurs = this.fournisseurs.filter((item) => item.idFournisseur !== fournisseur.idFournisseur);
      this.successMessage = 'Fournisseur supprimé avec succès.';
      this.confirmDeleteFournisseur = null;
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }
    } catch (error: any) {
      this.errorMessage = error?.message || 'Impossible de supprimer le fournisseur.';
    } finally {
      this.isDeleting = false;
      this.cd.markForCheck();
    }
  }
}
