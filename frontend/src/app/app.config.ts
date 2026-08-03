import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MarketsComponent } from './pages/markets/markets.component';
import { PpmComponent } from './pages/ppm/ppm.component';
import { DetailsMarchesComponent } from './pages/details-marches/details-marches.component';
import { FournisseursComponent } from './pages/fournisseurs/fournisseurs.component';
import { DetailsFournisseursComponent } from './pages/details-fournisseurs/details-fournisseurs.component';
import { RapportsComponent } from './pages/rapports/rapports.component';
import { ArchivesComponent } from './pages/archives/archives.component';
import { ConnexionComponent } from './pages/connexion/connexion.component';
import { MotDePasseOublieComponent } from './pages/mot-de-passe-oublie/mot-de-passe-oublie.component';
import { BailleursFinancementsComponent } from './pages/admin/bailleurs-financements/bailleurs-financements.component';
import { UtilisateursComponent } from './pages/admin/utilisateurs/utilisateurs.component';
import { ListesParametrablesComponent } from './pages/admin/listes-parametrables/listes-parametrables.component';
import { JournalAuditComponent } from './pages/admin/journal-audit/journal-audit.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

const routes: Route[] = [
  { path: '', component: ConnexionComponent, pathMatch: 'full' },
  { path: 'connexion', component: ConnexionComponent },
  { path: 'mot-de-passe-oublie', component: MotDePasseOublieComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'ppm', component: PpmComponent, canActivate: [authGuard] },
  { path: 'marches', component: MarketsComponent, canActivate: [authGuard] },
  { path: 'marches/details', component: DetailsMarchesComponent, canActivate: [authGuard] },
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
  {
    path: 'admin/listes-parametrables',
    component: ListesParametrablesComponent,
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'admin/journal-audit',
    component: JournalAuditComponent,
    canActivate: [authGuard, adminGuard],
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
  ],
};
