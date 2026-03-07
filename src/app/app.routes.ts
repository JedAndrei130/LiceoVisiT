import { Routes } from '@angular/router';
import { VisitorFormComponent } from './visitor-form/visitor-form.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminVisitorsComponent } from './admin-visitors/admin-visitors.component';

export const routes: Routes = [
  { path: '', component: VisitorFormComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: DashboardComponent },
  { path: 'admin/visitors', component: AdminVisitorsComponent }
];