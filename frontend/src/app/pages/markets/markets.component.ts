import { ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { FieldGroupDirective } from '../../directives/field-group.directive';
import {
  Bailleur,
  createMarche,
  deleteMarche,
  Financement,
  getBailleurs,
  getFinancements,
  getMarches,
  getOptionsMarche,
  Marche,
  OptionMarche,
  updateMarche,
} from '../../api.service';

@Component({
  standalone: true,
  selector: 'app-markets',
  imports: [CommonModule, FormsModule, HeaderComponent, MenuComponent, RouterModule, FieldGroupDirective],
  templateUrl: './markets.component.html',
  styleUrls: ['./markets.component.css'],
})
export class MarketsComponent implements OnInit {
  marches: Marche[] = [];
  bailleurs: Bailleur[] = [];
  financements: Financement[] = [];
  optionsMarche: OptionMarche[] = [];
  loading = false;
  submitting = false;
  isUpdating = false;
  isDeleting = false;
  errorMessage = '';

  // Add
  showAddMarket = false;
  newMarche: Partial<Marche> = this.defaultNewMarche();
  newMarcheBailleurId: number | null = null;

  // Edit
  showEditMarket = false;
  editingMarche: Partial<Marche> = {};
  editMarcheBailleurId: number | null = null;

  // Delete
  confirmDeleteMarcheId: string | null = null;

  // Archive
  archivingMarcheId: string | null = null;

  // Search & filters
  searchQuery = '';
  filterStatut = '';
  filterFinancement = '';
  showStatutDropdown = false;
  showFinancementDropdown = false;

  // Pagination
  pageSize = 10;
  currentPage = 1;

  constructor(private cd: ChangeDetectorRef, private router: Router, private ngZone: NgZone, private appRef: ApplicationRef) {}

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
      if (m.EstArchive) return false;
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

  get nextMarcheNumero(): string {
    const year = new Date().getFullYear();
    const pattern = new RegExp(`^${year}/0*(\\d+)`);
    const numbers = this.marches
      .map((m) => {
        const match = pattern.exec(m.numbMarche);
        return match ? Number(match[1]) : 0;
      })
      .filter((value) => value > 0);
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${year}/${String(nextNumber).padStart(3, '0')}/`;
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

  get financementsForNewBailleur(): Financement[] {
    return this.newMarcheBailleurId
      ? this.financements.filter((f) => f.idBailleur === this.newMarcheBailleurId)
      : [];
  }

  get financementsForEditBailleur(): Financement[] {
    return this.editMarcheBailleurId
      ? this.financements.filter((f) => f.idBailleur === this.editMarcheBailleurId)
      : [];
  }

  get natureOuvertureOptions(): OptionMarche[] {
    return this.optionsMarche.filter((o) => o.categorie === 'nature_ouverture');
  }

  get demandeurOptions(): OptionMarche[] {
    return this.optionsMarche.filter((o) => o.categorie === 'demandeur');
  }

  get responsableSuiviOptions(): OptionMarche[] {
    return this.optionsMarche.filter((o) => o.categorie === 'responsable_suivi');
  }

  private resolveOptionId(categorie: OptionMarche['categorie'], valeur: string | undefined): number | undefined {
    if (!valeur) return undefined;
    return this.optionsMarche.find((o) => o.categorie === categorie && o.valeur === valeur)?.id;
  }

  private resolveMarcheOptionIds(marche: Partial<Marche>): void {
    marche.IdNatureOuverture = this.resolveOptionId('nature_ouverture', marche.NatureOuverture);
    marche.IdDemandeur = this.resolveOptionId('demandeur', marche.Demandeur);
    marche.IdResponsableSuivi = this.resolveOptionId('responsable_suivi', marche.ResponsableSuivi);
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
      const [raw, bailleurs, financements, optionsMarche] = await Promise.all([
        getMarches(),
        getBailleurs(),
        getFinancements(),
        getOptionsMarche(),
      ]);
      this.ngZone.run(() => {
        this.marches = raw.sort((a, b) =>
          new Date(b.DateEnregistrement ?? 0).getTime() - new Date(a.DateEnregistrement ?? 0).getTime()
        );
        this.bailleurs = bailleurs;
        this.financements = financements;
        this.optionsMarche = optionsMarche;
        this.loading = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger les marchés.';
        this.loading = false;
        this.cd.markForCheck();
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
    if (this.showAddMarket) {
      this.errorMessage = '';
      this.newMarche.numbMarche = this.nextMarcheNumero;
      this.newMarcheBailleurId = null;
    }
  }

  onNewBailleurChange() {
    this.newMarche.IdFinancement = undefined;
    this.newMarche.Financement = undefined;
  }

  onNewFinancementChange() {
    const financement = this.financements.find((f) => f.idFinancement === this.newMarche.IdFinancement);
    this.newMarche.Financement = financement?.nomFinancement;
  }

  async submitAddMarket(event: Event) {
    event.preventDefault();
    this.errorMessage = '';
    this.submitting = true;
    try {
      this.resolveMarcheOptionIds(this.newMarche);
      const added = await createMarche(this.newMarche);
      this.ngZone.run(() => {
        if (Array.isArray(added) && added.length > 0) {
          this.marches.unshift(added[0]);
          this.currentPage = 1;
        }
        this.showAddMarket = false;
        this.newMarche = this.defaultNewMarche();
        this.newMarcheBailleurId = null;
        this.submitting = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error.message || 'Impossible de créer le marché.';
        this.submitting = false;
        this.cd.markForCheck();
      });
    }
  }

  // ── Édition ───────────────────────────────────────────────────────────────

  openEditMarche(marche: Marche, event: Event) {
    event.stopPropagation();
    this.editingMarche = { ...marche };
    const financement = this.financements.find((f) => f.idFinancement === marche.IdFinancement);
    this.editMarcheBailleurId = financement?.idBailleur ?? null;
    this.showEditMarket = true;
    this.errorMessage = '';
    this.cd.detectChanges();
  }

  onEditBailleurChange() {
    this.editingMarche.IdFinancement = undefined;
    this.editingMarche.Financement = undefined;
  }

  onEditFinancementChange() {
    const financement = this.financements.find((f) => f.idFinancement === this.editingMarche.IdFinancement);
    this.editingMarche.Financement = financement?.nomFinancement;
  }

  closeEditMarket() {
    this.showEditMarket = false;
    this.editingMarche = {};
    this.editMarcheBailleurId = null;
  }

  async submitEditMarket(event: Event) {
    event.preventDefault();
    if (!this.editingMarche.numbMarche) return;
    this.errorMessage = '';
    this.isUpdating = true;
    try {
      this.resolveMarcheOptionIds(this.editingMarche);
      const updated = await updateMarche(this.editingMarche.numbMarche, this.editingMarche as Record<string, unknown>);
      this.ngZone.run(() => {
        const idx = this.marches.findIndex((m) => m.numbMarche === updated.numbMarche);
        if (idx !== -1) this.marches[idx] = updated;
        this.showEditMarket = false;
        this.editingMarche = {};
        this.isUpdating = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de modifier le marché.';
        this.isUpdating = false;
        this.cd.markForCheck();
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
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de supprimer le marché.';
        this.isDeleting = false;
        this.cd.markForCheck();
      });
    }
  }

  // ── Archivage ─────────────────────────────────────────────────────────────

  async archiveMarche(marche: Marche, event: Event) {
    event.stopPropagation();
    if (this.archivingMarcheId) return;
    this.archivingMarcheId = marche.numbMarche;
    this.errorMessage = '';
    try {
      const updated = await updateMarche(marche.numbMarche, {
        EstArchive: true,
        DateArchivage: new Date().toISOString(),
      });
      this.ngZone.run(() => {
        const idx = this.marches.findIndex((m) => m.numbMarche === updated.numbMarche);
        if (idx !== -1) this.marches[idx] = updated;
        this.archivingMarcheId = null;
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || "Impossible d'archiver le marché.";
        this.archivingMarcheId = null;
        this.cd.markForCheck();
      });
    }
  }
}
