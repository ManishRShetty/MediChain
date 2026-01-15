import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard'; // Import the Auth Guard

// Importing all generated components
import { BlankComponent } from './pages/blank/blank.component';
import { CardsComponent } from './pages/cards/cards.component';
import { ChartsComponent } from './pages/charts/charts.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { TablesComponent } from './pages/tables/tables.component';

import { NotFoundComponent } from './pages/not-found/not-found.component';
import { CompanyProductsComponent } from './components/company-products/company-products.component';
import { RoleBasedComponent } from './pages/role-based/role-based.component';
import { UploadComponent } from './pages/upload/upload.component';
import { ViewtrailComponent } from './pages/viewtrail/viewtrail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: BlankComponent, canActivate: [AuthGuard] }, 
  { path: 'company-products', component: CompanyProductsComponent, canActivate: [AuthGuard] },
  { path: 'role-based', component: RoleBasedComponent, canActivate: [AuthGuard] },
  { path: 'cards', component: CardsComponent, canActivate: [AuthGuard] },
  { path: 'charts', component: ChartsComponent, canActivate: [AuthGuard] },
  { path: 'forgotPassword', component: ForgotPasswordComponent },
  { path: 'register', component: RegisterComponent }, 
  { path: 'login', component: LoginComponent },
  { path: 'tables', component: TablesComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: UploadComponent, canActivate: [AuthGuard] },
  { path: 'viewtrail', component: ViewtrailComponent, canActivate: [AuthGuard] },

  { path: '**', component: NotFoundComponent }
];
