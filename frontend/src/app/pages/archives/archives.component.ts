import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { getMarches, Marche, updateMarche } from '../../api.service';

@Component({
  standalone: true,
  selector: 'app-archives',
  imports: [CommonModule, RouterModule, HeaderComponent, MenuComponent],
  templateUrl: './archives.component.html',
  styleUrls: ['./archives.component.css'],
})
export class ArchivesComponent implements OnInit {
  marches: Marche[] = [];
  loading = false;
  errorMessage = '';
  unarchivingMarcheId: string | null = null;

  constructor(private cd: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit() {
    this.loadArchivedMarches();
  }

  get archivedMarches(): Marche[] {
    return this.marches
      .filter((m) => m.EstArchive)
      .sort((a, b) => new Date(b.DateArchivage ?? 0).getTime() - new Date(a.DateArchivage ?? 0).getTime());
  }

  async loadArchivedMarches() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const raw = await getMarches();
      this.ngZone.run(() => {
        this.marches = raw;
        this.loading = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger les archives.';
        this.loading = false;
        this.cd.markForCheck();
      });
    }
  }

  getStatutClass(statut: string | undefined): string {
    switch (statut) {
      case 'À lancer': return 'bg-[#FFF3CD] text-[#856404]';
      case 'Réception': return 'bg-[#E3F2FD] text-[#0d47a1]';
      case 'Analyse': return 'bg-[#EDE7F6] text-[#4527A0]';
      case 'En cours': return 'bg-[#76d3c8]/15 text-[#006a62]';
      case 'Exécuté': return 'bg-green-50 text-green-700';
      case 'Clôturé': return 'bg-[#E9ECEF] text-[#6C757D]';
      default: return 'bg-[#76d3c8]/15 text-[#006a62]';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  async unarchiveMarche(marche: Marche, event: Event) {
    event.stopPropagation();
    if (this.unarchivingMarcheId) return;
    this.unarchivingMarcheId = marche.numbMarche;
    this.errorMessage = '';
    try {
      const updated = await updateMarche(marche.numbMarche, { EstArchive: false });
      this.ngZone.run(() => {
        const idx = this.marches.findIndex((m) => m.numbMarche === updated.numbMarche);
        if (idx !== -1) this.marches[idx] = updated;
        this.unarchivingMarcheId = null;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || "Impossible de désarchiver le marché.";
        this.unarchivingMarcheId = null;
        this.cd.markForCheck();
      });
    }
  }
}
