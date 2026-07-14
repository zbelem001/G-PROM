import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { Fournisseur, getFournisseurs, getMarches, Marche } from '../../api.service';

interface MonthPoint {
  label: string;
  count: number;
}

interface DomainPoint {
  label: string;
  count: number;
}

interface StatutSlice {
  label: string;
  count: number;
  pct: number;
  color: string;
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, HeaderComponent, MenuComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  marches: Marche[] = [];
  fournisseurs: Fournisseur[] = [];
  loading = false;
  errorMessage = '';

  constructor(private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const [marches, fournisseurs] = await Promise.all([getMarches(), getFournisseurs()]);
      this.ngZone.run(() => {
        this.marches = marches;
        this.fournisseurs = fournisseurs;
        this.loading = false;
        this.cd.detectChanges();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger les données du tableau de bord.';
        this.loading = false;
        this.cd.detectChanges();
      });
    }
  }

  // ── Cartes statistiques ──────────────────────────────────────────────────

  get totalMarches(): number {
    return this.marches.length;
  }

  get enCoursCount(): number {
    return this.marches.filter((m) => m.Statut === 'En cours').length;
  }

  get aLancerCount(): number {
    return this.marches.filter((m) => m.Statut === 'À lancer').length;
  }

  get clotureCount(): number {
    return this.marches.filter((m) => m.Statut === 'Clôturé').length;
  }

  get totalFournisseurs(): number {
    return this.fournisseurs.length;
  }

  // ── Chart 1 : marchés enregistrés (7 derniers mois) ──────────────────────

  get monthlyRegistrations(): MonthPoint[] {
    const months: MonthPoint[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
      const count = this.marches.filter((m) => {
        if (!m.DateEnregistrement) return false;
        const md = new Date(m.DateEnregistrement);
        return md.getFullYear() === d.getFullYear() && md.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }
    return months;
  }

  get monthlyMax(): number {
    return Math.max(1, ...this.monthlyRegistrations.map((m) => m.count));
  }

  barHeight(count: number): number {
    return Math.max(6, Math.round((count / this.monthlyMax) * 100));
  }

  get monthlyTrendPct(): number {
    const pts = this.monthlyRegistrations;
    const current = pts[pts.length - 1]?.count ?? 0;
    const previous = pts[pts.length - 2]?.count ?? 0;
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // ── Chart 2 : répartition des marchés par statut ─────────────────────────

  get statutBreakdown(): StatutSlice[] {
    const total = this.marches.length || 1;
    const aLancer = this.aLancerCount;
    const enCours = this.enCoursCount;
    const cloture = this.clotureCount;
    const autres = Math.max(0, this.marches.length - aLancer - enCours - cloture);

    const slices: StatutSlice[] = [
      { label: 'À lancer', count: aLancer, pct: Math.round((aLancer / total) * 100), color: '#FFD666' },
      { label: 'En cours', count: enCours, pct: Math.round((enCours / total) * 100), color: '#76d3c8' },
      { label: 'Clôturé', count: cloture, pct: Math.round((cloture / total) * 100), color: '#ADB5BD' },
    ];
    if (autres > 0) {
      slices.push({ label: 'Autres', count: autres, pct: Math.round((autres / total) * 100), color: '#c4c6cd' });
    }
    return slices;
  }

  get donutGradient(): string {
    let cursor = 0;
    const stops: string[] = [];
    for (const slice of this.statutBreakdown) {
      const start = cursor;
      const end = cursor + (slice.pct / 100) * 360;
      stops.push(`${slice.color} ${start}deg ${end}deg`);
      cursor = end;
    }
    stops.push(`#e8e8ea ${cursor}deg 360deg`);
    return `conic-gradient(from 180deg at 50% 50%, ${stops.join(', ')})`;
  }

  // ── Chart 3 : fournisseurs par domaine d'activité ─────────────────────────

  get topDomains(): DomainPoint[] {
    const counts = new Map<string, number>();
    for (const f of this.fournisseurs) {
      const domain = (f.DomaineActivite || 'Autre').trim() || 'Autre';
      counts.set(domain, (counts.get(domain) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([label, count]) => ({ label, count }));
  }

  get topDomainsMax(): number {
    return Math.max(1, ...this.topDomains.map((d) => d.count));
  }

  domainBarHeight(count: number): number {
    return Math.max(8, Math.round((count / this.topDomainsMax) * 100));
  }

  shortDomainLabel(label: string): string {
    return label.length > 10 ? `${label.slice(0, 9)}…` : label;
  }

  // ── Tableau : marchés récents ──────────────────────────────────────────────

  get recentMarches(): Marche[] {
    return [...this.marches]
      .sort((a, b) => new Date(b.DateEnregistrement ?? 0).getTime() - new Date(a.DateEnregistrement ?? 0).getTime())
      .slice(0, 5);
  }

  getStatutClass(statut: string | undefined): string {
    switch (statut) {
      case 'À lancer':
        return 'bg-[#FFF3CD] text-[#856404]';
      case 'En cours':
        return 'bg-[#76d3c8]/15 text-[#006a62]';
      case 'Clôturé':
        return 'bg-[#E9ECEF] text-[#6C757D]';
      default:
        return 'bg-[#76d3c8]/15 text-[#006a62]';
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
