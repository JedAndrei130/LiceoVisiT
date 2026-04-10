import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {

  email    = '';
  password = '';
  error    = signal('');
  isLoading = signal(false);
  showPassword = false;

  constructor(private router: Router, private userService: UserService) {}

  async login() {
    this.error.set('');

    if (!this.email || !this.password) {
      this.error.set('Email and password are required.');
      return;
    }

    this.isLoading.set(true);
    try {
      const res = await this.userService.login(this.email, this.password);
      // Store minimal session info
      localStorage.setItem('liceo_admin_auth', 'true');
      localStorage.setItem('liceo_admin_user', JSON.stringify(res.user));
      this.router.navigate(['/admin']);
    } catch (err: any) {
      const msg = err?.error?.message ?? 'Invalid email or password.';
      this.error.set(msg);
    } finally {
      this.isLoading.set(false);
    }
  }

}