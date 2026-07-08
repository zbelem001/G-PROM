import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { createMarche, deleteMarche, getMarches, Marche, updateMarche } from '../../api.service';

@Component({
  standalone: true,
  selector: 'app-markets',
  imports: [CommonModule, FormsModule, HeaderComponent, MenuComponent, RouterModule],
  templateUrl: './markets.component.html',
  styleUrls: ['./markets.component.css'],
})
export class MarketsComponent implements OnInit {
  departements = [
    'Académiques',
    'Génie Civil et Bâtiments Travaux Publics (GC-BTP)',
    "Génie de l'Eau, de l'Assainissement et des Aménagements Hydro-agricoles (GEAAH)",
    'Génie Électrique, Énergétique et Industriel (GEEI)',
    "Sciences et Techniques de l'Ingénieur (STI)",
    'Sciences Humaines, Sociales et Managériales (SHSM)',
    'Formation Professionnelle en Ligne',
    'IA',
  ];

  marches: Marche[] = [];
  loading = false;
  submitting = false;
  isUpdating = false;
  isDeleting = false;
  errorMessage = '';

  // Add
  showAddMarket = false;
  newMarche: Partial<Marche> = this.defaultNewMarche();

  // Edit
  showEditMarket = false;
  editingMarche: Partial<Marche> = {};

  // Delete
  confirmDeleteMarcheId: string | null = null;

  // Search & filters
  searchQuery = '';
  filterStatut = '';
  filterFinancement = '';
  showStatutDropdown = false;
  showFinancementDropdown = false;

  // Pagination
  pageSize = 10;
  currentPage = 1;

  constructor(private cd: ChangeDetectorRef, private router: Router, private ngZone: NgZone) {}

  private getTodayDate(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private defaultNewMarche(): Partial<Marche> {
    return {
      NombreLot: 1,
      Devise: 'XOF',
      Statut: 'À lancer',
      NatureOuverture: 'Fournitures',
      ModePassation: "Appel d'Offres Ouvert",
      SCT_person1: 'N/A',
      BudgetEstimatif: 0,
      DateEnregistrement: this.getTodayDate(),
    };
  }

  ngOnInit() {
    this.loadMarches();
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  get filteredMarches(): Marche[] {
    const q = this.searchQuery.toLowerCase().trim();
    return this.marches.filter((m) => {
      if (q && !m.numbMarche.toLowerCase().includes(q) && !(m.Description ?? '').toLowerCase().includes(q)) return false;
      if (this.filterStatut && m.Statut !== this.filterStatut) return false;
      if (this.filterFinancement && m.Financement !== this.filterFinancement) return false;
      return true;
    });
  }

  get paginatedMarches(): Marche[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMarches.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredMarches.length / this.pageSize));
  }

  get pageNumbers(): (number | null)[] {
    const total = this.totalPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | null)[] = [1];
    if (this.currentPage > 3) pages.push(null);
    for (let i = Math.max(2, this.currentPage - 1); i <= Math.min(total - 1, this.currentPage + 1); i++) pages.push(i);
    if (this.currentPage < total - 2) pages.push(null);
    pages.push(total);
    return pages;
  }

  get uniqueStatuts(): string[] {
    return [...new Set(this.marches.map((m) => m.Statut).filter(Boolean))] as string[];
  }

  get uniqueFinancements(): string[] {
    return [...new Set(this.marches.map((m) => m.Financement).filter(Boolean))] as string[];
  }

  get displayStart(): number {
    return this.filteredMarches.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get displayEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredMarches.length);
  }

  // ── Badge couleur ─────────────────────────────────────────────────────────

  getStatutClass(statut: string | undefined): string {
    switch (statut) {
      case 'À lancer':  return 'bg-[#FFF3CD] text-[#856404]';
      case 'En cours':  return 'bg-[#76d3c8]/15 text-[#006a62]';
      case 'Clôturé':   return 'bg-[#E9ECEF] text-[#6C757D]';
      default:          return 'bg-[#76d3c8]/15 text-[#006a62]';
    }
  }

  // ── Chargement ────────────────────────────────────────────────────────────

  async loadMarches() {
    this.loading = true;
    this.errorMessage = '';
    this.marches = [];
    try {
      const raw = await getMarches();
      this.ngZone.run(() => {
        this.marches = raw.sort((a, b) =>
          new Date(b.DateEnregistrement ?? 0).getTime() - new Date(a.DateEnregistrement ?? 0).getTime()
        );
        this.loading = false;
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger les marchés.';
        this.loading = false;
      });
    }
  }

  // ── Recherche & Filtres ───────────────────────────────────────────────────

  onSearch() {
    this.currentPage = 1;
  }

  toggleStatutDropdown(event: Event) {
    event.stopPropagation();
    this.showStatutDropdown = !this.showStatutDropdown;
    this.showFinancementDropdown = false;
  }

  toggleFinancementDropdown(event: Event) {
    event.stopPropagation();
    this.showFinancementDropdown = !this.showFinancementDropdown;
    this.showStatutDropdown = false;
  }

  setFilterStatut(statut: string) {
    this.filterStatut = statut;
    this.currentPage = 1;
    this.showStatutDropdown = false;
    this.cd.detectChanges();
  }

  setFilterFinancement(fin: string) {
    this.filterFinancement = fin;
    this.currentPage = 1;
    this.showFinancementDropdown = false;
    this.cd.detectChanges();
  }

  closeDropdowns() {
    this.showStatutDropdown = false;
    this.showFinancementDropdown = false;
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  setPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.cd.detectChanges();
  }

  // ── Ajout ─────────────────────────────────────────────────────────────────

  toggleAddMarket() {
    this.showAddMarket = !this.showAddMarket;
    if (this.showAddMarket) this.errorMessage = '';
  }

  async submitAddMarket(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.submitting = true;
    try {
      const added = await createMarche(this.newMarche);
      this.ngZone.run(() => {
        if (Array.isArray(added) && added.length > 0) {
          this.marches.unshift(added[0]);
          this.currentPage = 1;
        }
        this.showAddMarket = false;
        this.newMarche = this.defaultNewMarche();
        this.submitting = false;
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error.message || 'Impossible de créer le marché.';
        this.submitting = false;
      });
    }
  }

  // ── Édition ───────────────────────────────────────────────────────────────

  openEditMarche(marche: Marche, event: Event) {
    event.stopPropagation();
    this.editingMarche = { ...marche };
    this.showEditMarket = true;
    this.errorMessage = '';
    this.cd.detectChanges();
  }

  closeEditMarket() {
    this.showEditMarket = false;
    this.editingMarche = {};
  }

  async submitEditMarket(event: Event) {
    event.preventDefault();
    if (!this.editingMarche.numbMarche) return;
    this.errorMessage = '';
    this.isUpdating = true;
    try {
      const updated = await updateMarche(this.editingMarche.numbMarche, this.editingMarche as Record<string, unknown>);
      this.ngZone.run(() => {
        const idx = this.marches.findIndex((m) => m.numbMarche === updated.numbMarche);
        if (idx !== -1) this.marches[idx] = updated;
        this.showEditMarket = false;
        this.editingMarche = {};
        this.isUpdating = false;
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de modifier le marché.';
        this.isUpdating = false;
      });
    }
  }

  // ── Suppression ───────────────────────────────────────────────────────────

  openDeleteConfirm(marcheId: string, event: Event) {
    event.stopPropagation();
    this.confirmDeleteMarcheId = marcheId;
    this.cd.detectChanges();
  }

  cancelDelete() {
    this.confirmDeleteMarcheId = null;
    this.cd.detectChanges();
  }

  async confirmDelete() {
    if (!this.confirmDeleteMarcheId) return;
    const id = this.confirmDeleteMarcheId;
    this.isDeleting = true;
    try {
      await deleteMarche(id);
      this.ngZone.run(() => {
        this.marches = this.marches.filter((m) => m.numbMarche !== id);
        this.confirmDeleteMarcheId = null;
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        this.isDeleting = false;
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de supprimer le marché.';
        this.isDeleting = false;
      });
    }
  }
}
