import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { UserService, User, CreateUser } from '../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, UserMenuComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];

  isLoading    = signal(false);
  isModalOpen  = signal(false);
  isSubmitting = signal(false);

  editingUser: User | null = null;
  errorMessage   = signal('');
  successMessage = signal('');

  formData: CreateUser = { name: '', email: '', position: '', password: '' };
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    if (this.userService.cachedUsers.length > 0) {
      this.users = this.userService.cachedUsers;
    }
    await this.loadUsers();

    // Auto-open Edit modal for the logged-in user when navigated with editSelf=true
    this.route.queryParams.subscribe(params => {
      if (params['editSelf'] === 'true') {
        const raw = localStorage.getItem('liceo_admin_user');
        if (raw) {
          try {
            const stored = JSON.parse(raw);
            const self = this.users.find(u => u.user_id === stored.user_id);
            if (self) {
              this.edit(self);
            }
          } catch {}
        }
      }
    });
  }

  async loadUsers() {
    if (this.users.length === 0) this.isLoading.set(true);
    try {
      this.users = await this.userService.getAllUsers();
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  openAdd() {
    this.editingUser = null;
    this.formData = { name: '', email: '', position: '', password: '' };
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.errorMessage.set('');
    this.isModalOpen.set(true);
  }

  edit(user: User) {
    this.editingUser = user;
    this.formData = { name: user.name, email: user.email, position: user.position, password: '' };
    this.confirmPassword = '';
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.errorMessage.set('');
    this.isModalOpen.set(true);
  }

  async delete(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await this.userService.deleteUser(id);
      this.users = this.users.filter(u => u.user_id !== id);
      this.showSuccess('User deleted successfully.');
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  }

  async submit() {
    if (this.isSubmitting()) return;
    if (!this.formData.name || !this.formData.email) {
      this.errorMessage.set('Name and email are required.');
      return;
    }

    if (!this.editingUser) {
      if (!this.formData.password) {
        this.errorMessage.set('Password is required for new users.');
        return;
      }
      if (this.formData.password.length < 6) {
        this.errorMessage.set('Password must be at least 6 characters.');
        return;
      }
      if (this.formData.password !== this.confirmPassword) {
        this.errorMessage.set('Passwords do not match.');
        return;
      }
    }

    if (this.editingUser && this.formData.password) {
      if (this.formData.password.length < 6) {
        this.errorMessage.set('New password must be at least 6 characters.');
        return;
      }
      if (this.formData.password !== this.confirmPassword) {
        this.errorMessage.set('Passwords do not match.');
        return;
      }
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload: CreateUser = { ...this.formData };
    if (this.editingUser && !payload.password) {
      delete payload.password;
    }

    try {
      if (this.editingUser) {
        await this.userService.updateUser(this.editingUser.user_id, payload);
        // Update localStorage if editing own profile
        const raw = localStorage.getItem('liceo_admin_user');
        if (raw) {
          const stored = JSON.parse(raw);
          if (stored.user_id === this.editingUser.user_id) {
            localStorage.setItem('liceo_admin_user', JSON.stringify({
              ...stored,
              name: payload.name,
              email: payload.email,
              position: payload.position,
            }));
          }
        }
        this.showSuccess('User updated successfully.');
      } else {
        await this.userService.createUser(payload);
        this.showSuccess('User created successfully.');
      }
      await this.loadUsers();
      this.close();
    } catch (err: any) {
      const msg = err?.error?.message ?? 'Operation failed. Please try again.';
      this.errorMessage.set(msg);
      console.error(err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close() {
    this.isModalOpen.set(false);
    this.editingUser = null;
    this.formData = { name: '', email: '', position: '', password: '' };
    this.confirmPassword = '';
    this.errorMessage.set('');
  }

  showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}