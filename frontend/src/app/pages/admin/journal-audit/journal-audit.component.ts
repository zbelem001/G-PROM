import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../components/header/header.component';
import { AdminMenuComponent } from '../../../components/admin-menu/admin-menu.component';
import { AuditLogEntry, getAuditLog } from '../../../api.service';

const TABLES = [
  'Marche',
  'Lot',
  'Fournisseur',
  'Consultation',
  'Soumission',
  'Analyse',
  'Attributaire',
  'Avenant',
  'Document',
  'Bailleur',
  'Financement',
  'OptionMarche',
  'Utilisateur',
];

@Component({
  standalone: true,
  selector: 'app-admin-journal-audit',
  imports: [CommonModule, FormsModule, HeaderComponent, AdminMenuComponent],
  templateUrl: './journal-audit.component.html',
  styleUrls: ['./journal-audit.component.css'],
})
export class JournalAuditComponent implements OnInit {
  readonly tables = TABLES;

  entries: AuditLogEntry[] = [];
  loading = false;
  errorMessage = '';

  selectedTable = '';
  searchRecordId = '';
  expandedId: number | null = null;

  constructor(private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const entries = await getAuditLog(this.selectedTable || undefined, this.searchRecordId.trim() || undefined);
      this.ngZone.run(() => {
        this.entries = entries;
        this.loading = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || "Impossible de charger le journal d'audit.";
        this.loading = false;
        this.cd.markForCheck();
      });
    }
  }

  onFilterChange() {
    this.loadData();
  }

  toggleDetails(entry: AuditLogEntry) {
    this.expandedId = this.expandedId === entry.id ? null : entry.id;
  }

  actionLabel(action: AuditLogEntry['action']): string {
    switch (action) {
      case 'CREATE':
        return 'Création';
      case 'UPDATE':
        return 'Modification';
      case 'DELETE':
        return 'Suppression';
      default:
        return action;
    }
  }

  actionClass(action: AuditLogEntry['action']): string {
    switch (action) {
      case 'CREATE':
        return 'bg-green-50 text-green-700';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-700';
      case 'DELETE':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-slate-50 text-slate-700';
    }
  }

  formatJson(value: unknown): string {
    if (value === null || value === undefined) return '—';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
}
