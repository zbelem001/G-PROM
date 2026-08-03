import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { FieldGroupDirective } from '../../directives/field-group.directive';
import { createPpmEntry, deletePpmEntry, getPpmEntries, Ppm } from '../../api.service';

function emptyPpm(): Partial<Ppm> {
  return {
    numbMarche: '',
    Description: '',
    BudgetEstimatif: undefined,
    Devise: 'XOF',
    ModePassation: "Appel d'Offres Ouvert",
    DatePrevueLancement: '',
  };
}

@Component({
  standalone: true,
  selector: 'app-ppm',
  imports: [CommonModule, FormsModule, HeaderComponent, MenuComponent, FieldGroupDirective],
  templateUrl: './ppm.component.html',
  styleUrls: ['./ppm.component.css'],
})
export class PpmComponent implements OnInit {
  entries: Ppm[] = [];
  loading = false;
  errorMessage = '';

  showAddModal = false;
  submitting = false;
  newPpm: Partial<Ppm> = emptyPpm();

  confirmDeleteEntry: Ppm | null = null;
  isDeleting = false;

  constructor(private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadEntries();
  }

  get sortedEntries(): Ppm[] {
    return [...this.entries].sort((a, b) => new Date(a.DatePrevueLancement).getTime() - new Date(b.DatePrevueLancement).getTime());
  }

  async loadEntries() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const entries = await getPpmEntries();
      this.ngZone.run(() => {
        this.entries = entries;
        this.loading = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger le plan de passation.';
        this.loading = false;
        this.cd.markForCheck();
      });
    }
  }

  toggleAddModal() {
    this.showAddModal = !this.showAddModal;
    if (this.showAddModal) {
      this.newPpm = emptyPpm();
      this.errorMessage = '';
    }
  }

  async submitAdd(event: Event) {
    event.preventDefault();
    if (this.submitting) return;
    this.submitting = true;
    this.errorMessage = '';
    try {
      const payload = { ...this.newPpm, numbMarche: this.newPpm.numbMarche?.trim().toUpperCase() };
      const created = await createPpmEntry(payload);
      this.ngZone.run(() => {
        this.entries = [...this.entries, created];
        this.showAddModal = false;
        this.newPpm = emptyPpm();
        this.submitting = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = this.extractErrorMessage(error);
        this.submitting = false;
        this.cd.markForCheck();
      });
    }
  }

  openDelete(entry: Ppm) {
    this.confirmDeleteEntry = entry;
  }

  cancelDelete() {
    this.confirmDeleteEntry = null;
  }

  async confirmDeleteAction() {
    if (!this.confirmDeleteEntry) return;
    const entry = this.confirmDeleteEntry;
    this.isDeleting = true;
    try {
      await deletePpmEntry(entry.numbMarche);
      this.ngZone.run(() => {
        this.entries = this.entries.filter((e) => e.numbMarche !== entry.numbMarche);
        this.confirmDeleteEntry = null;
        this.isDeleting = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = this.extractErrorMessage(error);
        this.isDeleting = false;
        this.cd.markForCheck();
      });
    }
  }

  getStatutClass(statut: string | undefined): string {
    return statut === 'Transféré' ? 'bg-green-50 text-green-700' : 'bg-[#FFF3CD] text-[#856404]';
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
    return raw || 'Une erreur est survenue.';
  }
}
