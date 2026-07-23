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
import { ArchivesComponent } from './pages/archives/archives.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { BailleursFinancementsComponent } from './pages/admin/bailleurs-financements/bailleurs-financements.component';
import { UtilisateursComponent } from './pages/admin/utilisateurs/utilisateurs.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

const routes: Route[] = [
  { path: '', component: ConnexionComponent, pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'marches', component: MarketsComponent, canActivate: [authGuard] },
  { path: 'marches/details', component: DetailsMarchesComponent, canActivate: [authGuard] },
  { path: 'suivie-marches', component: SuivieMarchesComponent, canActivate: [authGuard] },
  { path: 'fournisseurs', component: FournisseursComponent, canActivate: [authGuard] },
  { path: 'fournisseurs/details', component: DetailsFournisseursComponent, canActivate: [authGuard] },
  { path: 'rapports', component: RapportsComponent, canActivate: [authGuard] },
  { path: 'archives', component: ArchivesComponent, canActivate: [authGuard] },
  { path: 'admin', redirectTo: 'admin/bailleurs-financements', pathMatch: 'full' },
  {
    path: 'admin/bailleurs-financements',
    component: BailleursFinancementsComponent,
    canActivate: [authGuard, adminGuard],
  },
  { path: 'admin/utilisateurs', component: UtilisateursComponent, canActivate: [authGuard, adminGuard] },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
  ],
};
