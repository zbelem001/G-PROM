import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import {
  ApiAvenant,
  Attributaire,
  Fournisseur,
  Lot,
  Marche,
  Soumission,
  getAttributaires,
  getAvenants,
  getFournisseurs,
  getLots,
  getMarches,
  getSoumissions,
} from '../../api.service';

interface PeriodOption {
  label: string;
  months: number;
}

interface ProcedureSlice {
  label: string;
  count: number;
  pct: number;
  color: string;
}

interface MonthPoint {
  label: string;
  count: number;
}

interface TopFournisseur {
  fournisseur: Fournisseur;
  count: number;
}

@Component({
  standalone: true,
  selector: 'app-rapports',
  imports: [CommonModule, HeaderComponent, MenuComponent],
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.css'],
})
export class RapportsComponent implements OnInit {
  @ViewChild('reportContent') reportContent?: ElementRef<HTMLElement>;

  marches: Marche[] = [];
  lots: Lot[] = [];
  soumissions: Soumission[] = [];
  attributaires: Attributaire[] = [];
  avenants: ApiAvenant[] = [];
  fournisseurs: Fournisseur[] = [];

  loading = false;
  errorMessage = '';
  exporting = false;

  readonly periodOptions: PeriodOption[] = [
    { label: '1 mois', months: 1 },
    { label: '3 mois', months: 3 },
    { label: '6 mois', months: 6 },
    { label: '1 an', months: 12 },
  ];
  periodMonths = 12;

  private readonly procedurePalette = ['#76d3c8', '#43a399', '#039CD3', '#1a2e44', '#FFD666', '#c4c6cd', '#8b5cf6'];

  constructor(private ngZone: NgZone, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.errorMessage = '';
    try {
      const [marches, lots, soumissions, attributaires, avenants, fournisseurs] = await Promise.all([
        getMarches(),
        getLots(),
        getSoumissions(),
        getAttributaires(),
        getAvenants(),
        getFournisseurs(),
      ]);
      this.ngZone.run(() => {
        this.marches = marches;
        this.lots = lots;
        this.soumissions = soumissions;
        this.attributaires = attributaires;
        this.avenants = avenants;
        this.fournisseurs = fournisseurs;
        this.loading = false;
        this.cd.markForCheck();
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = error?.message || 'Impossible de charger les données du rapport.';
        this.loading = false;
        this.cd.markForCheck();
      });
    }
  }

  setPeriod(months: number) {
    this.periodMonths = months;
  }

  get activePeriodLabel(): string {
    return this.periodOptions.find((p) => p.months === this.periodMonths)?.label ?? '';
  }

  // ── Cohorte période ──────────────────────────────────────────────────────

  private get periodStart(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - this.periodMonths);
    return d;
  }

  get marchesInPeriod(): Marche[] {
    const start = this.periodStart;
    return this.marches.filter((m) => m.DateEnregistrement && new Date(m.DateEnregistrement) >= start);
  }

  private get marcheIdsInPeriod(): Set<string> {
    return new Set(this.marchesInPeriod.map((m) => m.numbMarche));
  }

  get lotsInPeriod(): Lot[] {
    const ids = this.marcheIdsInPeriod;
    return this.lots.filter((l) => ids.has(l.numbMarche));
  }

  private get lotIdsInPeriod(): Set<string> {
    return new Set(this.lotsInPeriod.map((l) => l.numbLot));
  }

  get soumissionsInPeriod(): Soumission[] {
    const ids = this.lotIdsInPeriod;
    return this.soumissions.filter((s) => ids.has(s.numbLot));
  }

  private get soumissionIdsInPeriod(): Set<string> {
    return new Set(this.soumissionsInPeriod.map((s) => s.idSoumission));
  }

  get attributairesInPeriod(): Attributaire[] {
    const ids = this.soumissionIdsInPeriod;
    return this.attributaires.filter((a) => ids.has(a.idSoumissionAttribuee));
  }

  get avenantsInPeriod(): ApiAvenant[] {
    const ids = this.soumissionIdsInPeriod;
    return this.avenants.filter((a) => ids.has(a.idSoumissionAttribuee));
  }

  // ── KPIs ─────────────────────────────────────────────────────────────────

  get marchesRecusCount(): number {
    return this.marchesInPeriod.length;
  }

  get marchesAboutisCount(): number {
    const attributedSoumissionIds = new Set(this.attributairesInPeriod.map((a) => a.idSoumissionAttribuee));
    const attributedLotIds = new Set(
      this.soumissionsInPeriod.filter((s) => attributedSoumissionIds.has(s.idSoumission)).map((s) => s.numbLot)
    );
    const attributedMarcheIds = new Set(
      this.lotsInPeriod.filter((l) => attributedLotIds.has(l.numbLot)).map((l) => l.numbMarche)
    );
    return attributedMarcheIds.size;
  }

  get tauxAboutissement(): number {
    if (!this.marchesRecusCount) return 0;
    return Math.round((this.marchesAboutisCount / this.marchesRecusCount) * 100);
  }

  get avenantsCount(): number {
    return this.avenantsInPeriod.length;
  }

  get totalLotsCount(): number {
    return this.lotsInPeriod.length;
  }

  get dureeMoyenneJours(): number {
    const durations = this.marchesInPeriod
      .filter((m) => m.DateEnregistrement && m.DatePrevReception)
      .map((m) =>
        Math.round(
          (new Date(m.DatePrevReception!).getTime() - new Date(m.DateEnregistrement!).getTime()) / 86400000
        )
      )
      .filter((d) => d > 0);
    if (!durations.length) return 0;
    return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  }

  // ── Répartition par procédure ───────────────────────────────────────────

  get procedureBreakdown(): ProcedureSlice[] {
    const counts = new Map<string, number>();
    for (const m of this.marchesInPeriod) {
      const proc = (m.ModePassation || 'Non spécifié').trim() || 'Non spécifié';
      counts.set(proc, (counts.get(proc) ?? 0) + 1);
    }
    const total = this.marchesInPeriod.length || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, count], i) => ({
        label,
        count,
        pct: Math.round((count / total) * 100),
        color: this.procedurePalette[i % this.procedurePalette.length],
      }));
  }

  // SVG donut (not conic-gradient): html2canvas can't rasterize conic-gradient
  // for the PDF export, but it renders plain SVG shapes correctly.
  donutDashOffset(index: number): number {
    let cumulative = 0;
    for (let i = 0; i < index; i++) {
      cumulative += this.procedureBreakdown[i].pct;
    }
    return -cumulative;
  }

  // ── Évolution mensuelle des marchés reçus ───────────────────────────────

  get monthlyEvolution(): MonthPoint[] {
    const months: MonthPoint[] = [];
    const now = new Date();
    const n = Math.max(1, this.periodMonths);
    for (let i = n - 1; i >= 0; i--) {
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

  get monthlyEvolutionMax(): number {
    return Math.max(1, ...this.monthlyEvolution.map((m) => m.count));
  }

  evolutionBarHeight(count: number): number {
    return Math.max(6, Math.round((count / this.monthlyEvolutionMax) * 100));
  }

  // ── Top 3 fournisseurs ───────────────────────────────────────────────────

  get topFournisseurs(): TopFournisseur[] {
    const counts = new Map<number, number>();
    const soumissionById = new Map(this.soumissionsInPeriod.map((s) => [s.idSoumission, s]));
    for (const a of this.attributairesInPeriod) {
      const s = soumissionById.get(a.idSoumissionAttribuee);
      if (!s) continue;
      counts.set(s.idFournisseur, (counts.get(s.idFournisseur) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([idFournisseur, count]) => {
        const fournisseur = this.fournisseurs.find((f) => f.idFournisseur === idFournisseur);
        return fournisseur ? { fournisseur, count } : null;
      })
      .filter((x): x is TopFournisseur => x !== null);
  }

  get topFournisseurMax(): number {
    return Math.max(1, ...this.topFournisseurs.map((f) => f.count));
  }

  fournisseurInitials(nom: string): string {
    return nom
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  // ── Export PDF ───────────────────────────────────────────────────────────

  async exportPdf() {
    if (this.exporting || !this.reportContent) return;
    this.exporting = true;
    this.cd.markForCheck();
    const el = this.reportContent.nativeElement;
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      el.classList.add('pdf-export-mode');
      await new Promise((resolve) => setTimeout(resolve, 50));
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const periodSlug = this.activePeriodLabel.replace(' ', '-');
      const dateSlug = new Date().toISOString().slice(0, 10);
      pdf.save(`rapport-marches-${periodSlug}-${dateSlug}.pdf`);
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = 'Impossible de générer le PDF.';
        this.cd.markForCheck();
      });
    } finally {
      el.classList.remove('pdf-export-mode');
      this.ngZone.run(() => {
        this.exporting = false;
        this.cd.markForCheck();
      });
    }
  }
}
