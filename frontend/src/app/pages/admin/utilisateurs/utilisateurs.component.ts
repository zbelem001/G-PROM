import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminMenuComponent } from '../../../components/admin-menu/admin-menu.component';
import { FieldGroupDirective } from '../../../directives/field-group.directive';
import {
  AuthUser,
  createUtilisateur,
  CreateUtilisateurPayload,
  deleteUtilisateur,
  getHistoriqueConnexions,
  getUtilisateurs,
  HistoriqueConnexion,
  updateUtilisateur,
} from '../../../api.service';

const EMAIL_PATTERN = /^[a-z]+(-[a-z]+)*\.[a-z]+(-[a-z]+)*@2ie-edu\.org$/i;

interface UtilisateurForm {
  nomUtilisateur: string;
  motDePasse: string;
  email: string;
  prenom: string;
  nom: string;
  role: string;
  statut: string;
}

function emptyForm(): UtilisateurForm {
  return { nomUtilisateur: '', motDePasse: '', email: '', prenom: '', nom: '', role: 'user', statut: 'actif' };
}

@Component({
  standalone: true,
  selector: 'app-admin-utilisateurs',
  imports: [CommonModule, FormsModule, HeaderComponent, AdminMenuComponent, FieldGroupDirective],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css'],
})
export class UtilisateursComponent implements OnInit {
  utilisateurs: AuthUser[] = [];
  historique: HistoriqueConnexion[] = [];
  loading = false;
  errorMessage = '';

  // Historique de connexions — recherche / filtre / pagination
  historiqueSearchQuery = '';
  historiqueFilterUserId: number | null = null;
  historiqueDateFrom = '';
  historiqueDateTo = '';
  showHistoriqueUserDropdown = false;
  historiqueCurrentPage = 1;
  readonly historiquePageSize = 10;

  // Ajout / édition
  showModal = false;
  editingUser: AuthUser | null = null;
  form: UtilisateurForm = emptyForm();
  isSaving = false;
  formError = '';

  // Suppression
  confirmDeleteUser: AuthUser | null = null;
  isDeleting = false;

  readonly emailHint = 'Format requis : prenom.nom@2ie-edu.org';

  constructor(private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const [utilisateurs, historique] = await Promise.all([getUtilisateurs(), getHistoriqueConnexions()]);
      this.ngZone.run(() => {
        this.utilisateurs = utilisateurs;
        this.historique = historique;
        this.loading = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger les utilisateurs.';
        this.loading = false;
        this.cd.markForCheck();
      });
    }
  }

  // ── Historique de connexions ────────────────────────────────────────────

  userLabel(idutilisateur: number): string {
    const user = this.utilisateurs.find((u) => u.idutilisateur === idutilisateur);
    return user ? this.displayName(user) : `Utilisateur #${idutilisateur}`;
  }

  userEmail(idutilisateur: number): string {
    return this.utilisateurs.find((u) => u.idutilisateur === idutilisateur)?.email ?? '—';
  }

  formatDateTime(date: string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  get filteredHistorique(): HistoriqueConnexion[] {
    const q = this.historiqueSearchQuery.toLowerCase().trim();
    // Date inputs are yyyy-mm-dd (local, no time) — compare against day boundaries so
    // "to" is inclusive of the whole selected day.
    const from = this.historiqueDateFrom ? new Date(`${this.historiqueDateFrom}T00:00:00`).getTime() : null;
    const to = this.historiqueDateTo ? new Date(`${this.historiqueDateTo}T23:59:59.999`).getTime() : null;

    return this.historique.filter((entry) => {
      if (this.historiqueFilterUserId !== null && entry.idutilisateur !== this.historiqueFilterUserId) {
        return false;
      }
      if (from !== null || to !== null) {
        const entryTime = entry.dateconnexion ? new Date(entry.dateconnexion).getTime() : NaN;
        if (Number.isNaN(entryTime)) return false;
        if (from !== null && entryTime < from) return false;
        if (to !== null && entryTime > to) return false;
      }
      if (q) {
        const haystack = [this.userLabel(entry.idutilisateur), this.userEmail(entry.idutilisateur), entry.ipaddress, entry.useragent]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }

  get displayedHistorique(): HistoriqueConnexion[] {
    const start = (this.historiqueCurrentPage - 1) * this.historiquePageSize;
    return this.filteredHistorique.slice(start, start + this.historiquePageSize);
  }

  get historiqueTotalPages(): number {
    return Math.max(1, Math.ceil(this.filteredHistorique.length / this.historiquePageSize));
  }

  get historiquePageNumbers(): number[] {
    return Array.from({ length: this.historiqueTotalPages }, (_, i) => i + 1);
  }

  get historiqueDisplayStart(): number {
    return Math.min((this.historiqueCurrentPage - 1) * this.historiquePageSize + 1, this.filteredHistorique.length || 1);
  }

  get historiqueDisplayEnd(): number {
    return Math.min(this.historiqueCurrentPage * this.historiquePageSize, this.filteredHistorique.length);
  }

  get historiqueUsers(): AuthUser[] {
    const ids = new Set(this.historique.map((h) => h.idutilisateur));
    return this.utilisateurs.filter((u) => ids.has(u.idutilisateur));
  }

  onHistoriqueSearch(): void {
    this.historiqueCurrentPage = 1;
  }

  onHistoriqueDateChange(): void {
    this.historiqueCurrentPage = 1;
  }

  get historiqueHasDateFilter(): boolean {
    return !!this.historiqueDateFrom || !!this.historiqueDateTo;
  }

  clearHistoriqueDateFilter(): void {
    this.historiqueDateFrom = '';
    this.historiqueDateTo = '';
    this.historiqueCurrentPage = 1;
  }

  toggleHistoriqueUserDropdown(event: Event): void {
    event.stopPropagation();
    this.showHistoriqueUserDropdown = !this.showHistoriqueUserDropdown;
  }

  setHistoriqueUserFilter(idutilisateur: number | null): void {
    this.historiqueFilterUserId = idutilisateur;
    this.historiqueCurrentPage = 1;
    this.showHistoriqueUserDropdown = false;
    this.cd.markForCheck();
  }

  setHistoriquePage(page: number): void {
    if (page < 1 || page > this.historiqueTotalPages) return;
    this.historiqueCurrentPage = page;
  }

  previousHistoriquePage(): void {
    this.setHistoriquePage(this.historiqueCurrentPage - 1);
  }

  nextHistoriquePage(): void {
    this.setHistoriquePage(this.historiqueCurrentPage + 1);
  }

  closeDropdowns(): void {
    this.showHistoriqueUserDropdown = false;
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  get totalCount(): number {
    return this.utilisateurs.length;
  }

  get adminCount(): number {
    return this.utilisateurs.filter((u) => u.role === 'admin').length;
  }

  get actifCount(): number {
    return this.utilisateurs.filter((u) => (u.statut ?? 'actif') === 'actif').length;
  }

  get inactifCount(): number {
    return this.utilisateurs.filter((u) => (u.statut ?? 'actif') !== 'actif').length;
  }

  displayName(user: AuthUser): string {
    const full = [user.prenom, user.nom].filter(Boolean).join(' ').trim();
    return full || user.nomutilisateur;
  }

  initials(user: AuthUser): string {
    const source = this.displayName(user);
    return source
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getRoleClass(role: string | undefined): string {
    return role === 'admin' ? 'bg-[#1a2e44] text-white' : 'bg-slate-100 text-slate-600';
  }

  getStatutClass(statut: string | undefined): string {
    return (statut ?? 'actif') === 'actif' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600';
  }

  // ── Ajout / édition ──────────────────────────────────────────────────────

  openAdd() {
    this.editingUser = null;
    this.form = emptyForm();
    this.formError = '';
    this.showModal = true;
  }

  openEdit(user: AuthUser, event: Event) {
    event.stopPropagation();
    this.editingUser = user;
    this.form = {
      nomUtilisateur: user.nomutilisateur,
      motDePasse: '',
      email: user.email,
      prenom: user.prenom ?? '',
      nom: user.nom ?? '',
      role: user.role ?? 'user',
      statut: user.statut ?? 'actif',
    };
    this.formError = '';
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
    this.form = emptyForm();
    this.formError = '';
  }

  async submitForm(event: Event) {
    event.preventDefault();
    const email = this.form.email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      this.formError = this.emailHint;
      return;
    }

    this.isSaving = true;
    this.formError = '';
    try {
      if (this.editingUser) {
        const payload: Partial<CreateUtilisateurPayload> = {
          nomUtilisateur: this.form.nomUtilisateur.trim(),
          email,
          prenom: this.form.prenom.trim() || undefined,
          nom: this.form.nom.trim() || undefined,
          role: this.form.role,
          statut: this.form.statut,
        };
        if (this.form.motDePasse.trim()) {
          payload.motDePasse = this.form.motDePasse.trim();
        }
        const updated = await updateUtilisateur(this.editingUser.idutilisateur, payload);
        this.ngZone.run(() => {
          const idx = this.utilisateurs.findIndex((u) => u.idutilisateur === updated.idutilisateur);
          if (idx !== -1) this.utilisateurs[idx] = updated;
          this.showModal = false;
          this.editingUser = null;
          this.form = emptyForm();
          this.isSaving = false;
          this.cd.markForCheck();
        });
      } else {
        if (!this.form.motDePasse.trim()) {
          this.formError = 'Le mot de passe est requis.';
          this.isSaving = false;
          return;
        }
        const payload: CreateUtilisateurPayload = {
          nomUtilisateur: this.form.nomUtilisateur.trim(),
          motDePasse: this.form.motDePasse.trim(),
          email,
          prenom: this.form.prenom.trim() || undefined,
          nom: this.form.nom.trim() || undefined,
          role: this.form.role,
          statut: this.form.statut,
        };
        const created = await createUtilisateur(payload);
        this.ngZone.run(() => {
          this.utilisateurs = [...this.utilisateurs, created];
          this.showModal = false;
          this.form = emptyForm();
          this.isSaving = false;
          this.cd.markForCheck();
        });
      }
    } catch (error: any) {
      this.ngZone.run(() => {
        this.formError = this.extractErrorMessage(error);
        this.isSaving = false;
        this.cd.markForCheck();
      });
    }
  }

  private extractErrorMessage(error: any): string {
    const raw: string = error?.message || '';
    const jsonStart = raw.indexOf('{');
    if (jsonStart !== -1) {
      try {
        const parsed = JSON.parse(raw.slice(jsonStart));
        if (parsed?.message) return parsed.message;
      } catch {
        // fall through
      }
    }
    return raw || "Impossible d'enregistrer l'utilisateur.";
  }

  // ── Suppression ──────────────────────────────────────────────────────────

  openDelete(user: AuthUser, event: Event) {
    event.stopPropagation();
    this.confirmDeleteUser = user;
  }

  cancelDelete() {
    this.confirmDeleteUser = null;
  }

  async confirmDeleteAction() {
    if (!this.confirmDeleteUser) return;
    const user = this.confirmDeleteUser;
    this.isDeleting = true;
    this.errorMessage = '';
    try {
      await deleteUtilisateur(user.idutilisateur);
      this.ngZone.run(() => {
        this.utilisateurs = this.utilisateurs.filter((u) => u.idutilisateur !== user.idutilisateur);
        this.confirmDeleteUser = null;
        this.isDeleting = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || "Impossible de supprimer l'utilisateur.";
        this.isDeleting = false;
        this.cd.markForCheck();
      });
    }
  }
}
