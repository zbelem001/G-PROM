import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MarketsComponent } from './pages/markets/markets.component';
import { DetailsMarchesComponent } from './pages/details-marches/details-marches.component';
import { SuivieMarchesComponent } from './pages/suivie-marches/suivie-marches.component';
import { FournisseursComponent } from './pages/fournisseurs/fournisseurs.component';
import { DetailsFournisseursComponent } from './pages/details-fournisseurs/details-fournisseurs.component';
import { RapportsComponent } from './pages/rapports/rapports.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { BailleursFinancementsComponent } from './pages/admin/bailleurs-financements/bailleurs-financements.component';
import { UtilisateursComponent } from './pages/admin/utilisateurs/utilisateurs.component';

const routes: Route[] = [
  { path: '', component: ConnexionComponent, pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'marches', component: MarketsComponent },
  { path: 'marches/details', component: DetailsMarchesComponent },
  { path: 'suivie-marches', component: SuivieMarchesComponent },
  { path: 'fournisseurs', component: FournisseursComponent },
  { path: 'fournisseurs/details', component: DetailsFournisseursComponent },
  { path: 'rapports', component: RapportsComponent },
  { path: 'admin', redirectTo: 'admin/bailleurs-financements', pathMatch: 'full' },
  { path: 'admin/bailleurs-financements', component: BailleursFinancementsComponent },
  { path: 'admin/utilisateurs', component: UtilisateursComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
  ],
};
