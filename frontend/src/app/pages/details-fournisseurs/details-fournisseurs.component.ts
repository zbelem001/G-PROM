import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { Fournisseur, SoumissionDetail, getFournisseurDetails, FournisseurDetails } from '../../api.service';

interface OffreCandidature {
  marche: string;
  lot: string;
  dateSoumission: string;
  montantPropose: string;
  montantRaw: number;
  statut: string;
}

interface FournisseurStats {
  marchesGagnes: string;
  croissance: string;
  valeurContrats: string;
  tauxSucces: string;
  marchesCandidate: string;
}

@Component({
  standalone: true,
  selector: 'app-details-fournisseurs',
  imports: [CommonModule, HeaderComponent, MenuComponent],
  templateUrl: './details-fournisseurs.component.html',
  styleUrls: ['./details-fournisseurs.component.css'],
})

export class DetailsFournisseursComponent implements OnInit {
  activeTab = 'Profil';
  fournisseur: Fournisseur | null = null;
  loading = false;
  errorMessage = '';
  stats: FournisseurStats = {
    marchesGagnes: '00',
    croissance: '+0% vs LY',
    valeurContrats: '0 FCFA',
    tauxSucces: '0%',
    marchesCandidate: '00',
  };
  offres: OffreCandidature[] = [];

  constructor(private cd: ChangeDetectorRef, private route: ActivatedRoute, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    const snapshot = this.route.snapshot.queryParamMap;
    const idParam = snapshot.get('id');
    const tabParam = snapshot.get('tab');
    if (tabParam) {
      this.activeTab = tabParam;
    }
    this.loadFournisseur(idParam);
  }

  async loadFournisseur(idParam: string | null) {
    this.loading = true;
    this.errorMessage = '';

    try {
      const id = idParam ? Number(idParam) : undefined;
      if (!id) throw new Error('Identifiant du fournisseur manquant.');

      const details = await getFournisseurDetails(id);
      this.fournisseur = details.fournisseur;
      this.populateFromDetails(details);
    } catch (error: unknown) {
      this.errorMessage = (error as Error)?.message || 'Impossible de charger le fournisseur.';
      this.offres = [];
      this.stats = {
        marchesGagnes: '00',
        croissance: '+0% vs LY',
        valeurContrats: '0 FCFA',
        tauxSucces: '0%',
        marchesCandidate: '00',
      };
    } finally {
      this.loading = false;
      this.cd.detectChanges();
    }
  }

  private populateFromDetails(details: FournisseurDetails) {
    this.offres = details.soumissions.map((soumission: SoumissionDetail) => ({
      marche: soumission.numbMarche ?? soumission.numbLot,
      lot: soumission.lotDescription ?? soumission.numbLot,
      dateSoumission: soumission.DateDepot ?? soumission.Heure ?? 'N/A',
      montantPropose: this.formatCurrency(soumission.MontantPrev ?? 0),
      montantRaw: soumission.MontantPrev ?? 0,
      statut: soumission.estAdjugee ? 'Adjugé' : 'Soumis',
    }));

    this.stats = this.computeStatsFromOffres(this.offres);
  }

  private computeStatsFromOffres(offres: OffreCandidature[]): FournisseurStats {
    const marchesCandidat = new Set(offres.map((o) => o.marche).filter(Boolean));
    const marchesGagnes = new Set(
      offres.filter((o) => o.statut === 'Adjugé').map((o) => o.marche).filter(Boolean)
    );
    const total = marchesCandidat.size;
    const gagnees = marchesGagnes.size;
    const totalValue = offres
      .filter((offre) => offre.statut === 'Adjugé')
      .reduce((sum, offre) => sum + offre.montantRaw, 0);

    return {
      marchesGagnes: String(gagnees).padStart(2, '0'),
      croissance: '+0% vs LY',
      valeurContrats: this.formatCurrency(totalValue),
      tauxSucces: total === 0 ? '0%' : `${Math.round((gagnees / total) * 100)}%`,
      marchesCandidate: String(total).padStart(2, '0'),
    };
  }

  private formatCurrency(value: number): string {
    if (value === 0) {
      return '0 FCFA';
    }
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B FCFA`;
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M FCFA`;
    }
    return `${value.toLocaleString('fr-FR')} FCFA`;
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  getStatutFournisseurClass(statut: string | undefined): string {
    switch (statut) {
      case 'Non conforme': return 'bg-red-100 text-red-700';
      case 'Suspendu':     return 'bg-orange-100 text-orange-700';
      default:             return 'bg-green-100 text-[#1E7A4E]';
    }
  }

  getStatutFournisseurDotClass(statut: string | undefined): string {
    switch (statut) {
      case 'Non conforme': return 'bg-red-700';
      case 'Suspendu':     return 'bg-orange-700';
      default:             return 'bg-[#1E7A4E]';
    }
  }
}
