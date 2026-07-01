import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { MenuComponent } from '../../components/menu/menu.component';
import { Fournisseur, Soumission, getFournisseurDetails, FournisseurDetails } from '../../api.service';

interface OffreCandidature {
  marche: string;
  lot: string;
  dateSoumission: string;
  montantPropose: string;
  statut: string;
}

interface LegalDocument {
  nom: string;
  statut: string;
  expiry?: string;
  color: 'green' | 'red';
  icon: 'check_circle' | 'error';
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
  legalDocuments: LegalDocument[] = [];

  constructor(private cd: ChangeDetectorRef, private route: ActivatedRoute) {}

  ngOnInit() {
    const idParam = this.route.snapshot.queryParamMap.get('id');
    this.loadFournisseur(idParam);
  }

  async loadFournisseur(idParam: string | null) {
    this.loading = true;
    this.errorMessage = '';

    try {
      const id = idParam ? Number(idParam) : undefined;
      if (!id) {
        throw new Error('Identifiant du fournisseur manquant.');
      }

      const details = await getFournisseurDetails(id);
      this.fournisseur = details.fournisseur;
      this.populateFromDetails(details);
    } catch (error: unknown) {
      this.errorMessage = (error as Error)?.message || 'Impossible de charger le fournisseur.';
      this.offres = [];
      this.legalDocuments = [];
      this.stats = {
        marchesGagnes: '00',
        croissance: '+0% vs LY',
        valeurContrats: '0 FCFA',
        tauxSucces: '0%',
        marchesCandidate: '00',
      };
    }

    this.loading = false;
    this.cd.detectChanges();
  }

  private populateFromDetails(details: FournisseurDetails) {
    this.offres = details.soumissions.map((soumission: Soumission) => ({
      marche: soumission.numbLot,
      lot: soumission.numbLot,
      dateSoumission: soumission.DateDepot ?? soumission.Heure ?? 'N/A',
      montantPropose: this.formatCurrency(soumission.MontantPrev ?? 0),
      statut: 'Soumis',
    }));

    this.legalDocuments = this.mapDocumentRows(details.documents);
    this.stats = this.computeStatsFromOffres(this.offres);
  }

  private mapDocumentRows(rows: any[]): LegalDocument[] {
    const fieldLabels: Record<string, string> = {
      PV_ouverture: 'PV d’ouverture',
      RapportAnalyse: 'Rapport d’analyse',
      PV_attribution: 'PV d’attribution',
      Notification: 'Notification',
      Contrat: 'Contrat',
      FED: 'FED',
      BonCommande: 'Bon de commande',
      Avenant: 'Avenant',
      OrdreService: 'Ordre de service',
      PV_reception_tech: 'PV de réception technique',
    };

    const documents: LegalDocument[] = [];
    rows.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (key === 'numbLot' || value === null || value === undefined || value === '') {
          return;
        }
        documents.push({
          nom: fieldLabels[key] ?? key,
          statut: 'Présent',
          color: 'green',
          icon: 'check_circle',
        });
      });
    });

    if (documents.length === 0) {
      return [
        {
          nom: 'Aucun document légal trouvé',
          statut: 'Aucun',
          color: 'red',
          icon: 'error',
        },
      ];
    }

    return documents;
  }

  private computeStatsFromOffres(offres: OffreCandidature[]): FournisseurStats {
    const total = offres.length;
    const gagnees = offres.filter((offre) => offre.statut === 'Adjugé').length;
    const totalValue = offres
      .filter((offre) => offre.statut === 'Adjugé')
      .reduce((sum, offre) => sum + this.parseMontant(offre.montantPropose), 0);

    return {
      marchesGagnes: String(gagnees).padStart(2, '0'),
      croissance: '+0% vs LY',
      valeurContrats: this.formatCurrency(totalValue),
      tauxSucces: total === 0 ? '0%' : `${Math.round((gagnees / total) * 100)}%`,
      marchesCandidate: String(total).padStart(2, '0'),
    };
  }

  private parseMontant(montant: string): number {
    const digits = montant.replace(/[^0-9]/g, '');
    return Number(digits) || 0;
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
  }
}
