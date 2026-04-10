import { Component, OnInit, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface StoredUser {
  user_id: number;
  name: string;
  email: string;
  position: string;
}

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss']
})
export class UserMenuComponent implements OnInit {
  user: StoredUser | null = null;
  isOpen = signal(false);

  constructor(private router: Router) {}

  ngOnInit() {
    const raw = localStorage.getItem('liceo_admin_user');
    if (raw) {
      try { this.user = JSON.parse(raw); } catch {}
    }
  }

  /** First letter(s) of the user name for the avatar */
  get initials(): string {
    if (!this.user?.name) return '?';
    const parts = this.user.name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  /** Close dropdown when clicking outside the component */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('app-user-menu')) {
      this.isOpen.set(false);
    }
  }

  editProfile() {
    this.isOpen.set(false);
    // Navigate to user management with editSelf flag
    this.router.navigate(['/users'], { queryParams: { editSelf: 'true' } });
  }

  signOut() {
    localStorage.removeItem('liceo_admin_auth');
    localStorage.removeItem('liceo_admin_user');
    this.router.navigate(['/login']);
  }
}
