import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MarketsComponent } from './pages/markets/markets.component';
import { DetailsMarchesComponent } from './pages/details-marches/details-marches.component';
import { FournisseursComponent } from './pages/fournisseurs/fournisseurs.component';

const routes: Route[] = [
  { path: '', component: DashboardComponent },
  { path: 'marches', component: MarketsComponent },
  { path: 'marches/details', component: DetailsMarchesComponent },
  { path: 'fournisseurs', component: FournisseursComponent },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideRouter(routes),
  ],
};
