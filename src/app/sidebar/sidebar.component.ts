import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface StoredUser {
  user_id: number;
  name: string;
  email: string;
  position: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  user: StoredUser | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    const raw = localStorage.getItem('liceo_admin_user');
    if (raw) {
      try { this.user = JSON.parse(raw); } catch {}
    }
  }

  /** Compute initials: first letter of each word (max 2) */
  get initials(): string {
    if (!this.user?.name) return '?';
    const parts = this.user.name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }

  signOut() {
    localStorage.removeItem('liceo_admin_auth');
    localStorage.removeItem('liceo_admin_user');
    this.router.navigate(['/login']);
  }
}