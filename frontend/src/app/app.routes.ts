import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.component';
import { CatalogComponent } from './components/catalog.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'catalog', component: CatalogComponent }
];
