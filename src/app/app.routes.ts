import { Routes } from '@angular/router';
import { VisitorFormComponent } from './visitor-form/visitor-form.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';

export const routes: Routes = [
  {
    path: '',
    component: VisitorFormComponent
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent
  }
];