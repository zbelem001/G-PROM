import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminMenuComponent } from '../../../components/admin-menu/admin-menu.component';
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
  imports: [CommonModule, FormsModule, HeaderComponent, AdminMenuComponent],
  templateUrl: './utilisateurs.component.html',
  styleUrls: ['./utilisateurs.component.css'],
})
export class UtilisateursComponent implements OnInit {
  utilisateurs: AuthUser[] = [];
  historique: HistoriqueConnexion[] = [];
  loading = false;
  errorMessage = '';

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
