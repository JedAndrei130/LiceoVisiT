import { Routes } from '@angular/router';
import { VisitorFormComponent } from './visitor-form/visitor-form.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminVisitorsComponent } from './admin-visitors/admin-visitors.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

export const routes: Routes = [
  { path: '', component: VisitorFormComponent },
  { path: 'login', component: AdminLoginComponent },
  { path: 'admin', component: DashboardComponent },
  { path: 'visitors', component: AdminVisitorsComponent },
  { path: 'users', component: AdminUsersComponent}
];