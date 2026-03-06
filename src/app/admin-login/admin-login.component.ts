import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {

  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  login() {

    this.error = '';

    if (this.username === 'admin' && this.password === 'admin123') {

      localStorage.setItem('liceo_admin_auth', 'true');

      this.router.navigate(['/admin']);

    } else {

      this.error = 'Invalid username or password';

    }

  }

}