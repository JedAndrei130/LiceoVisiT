import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { UserService, User, CreateUser } from '../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];

  // Signals — same pattern as visitor-form
  isLoading    = signal(false);
  isModalOpen  = signal(false);
  isSubmitting = signal(false);

  editingUser: User | null = null;
  errorMessage  = signal('');
  successMessage = signal('');

  formData: CreateUser = { name: '', email: '', position: '' };

  constructor(private userService: UserService) {}

  async ngOnInit() {
    // Show cached data instantly — no flicker when navigating back
    if (this.userService.cachedUsers.length > 0) {
      this.users = this.userService.cachedUsers;
    }
    await this.loadUsers();
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
    this.formData = { name: '', email: '', position: '' };
    this.errorMessage.set('');
    this.isModalOpen.set(true);
  }

  edit(user: User) {
    this.editingUser = user;
    this.formData = { name: user.name, email: user.email, position: user.position };
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
    if (this.isSubmitting()) return;   // guard — prevent duplicate calls
    if (!this.formData.name || !this.formData.email) {
      this.errorMessage.set('Name and email are required.');
      return;
    }
    this.isSubmitting.set(true);
    this.errorMessage.set('');
    try {
      if (this.editingUser) {
        await this.userService.updateUser(this.editingUser.user_id, this.formData);
        this.showSuccess('User updated successfully.');
      } else {
        await this.userService.createUser(this.formData);
        this.showSuccess('User created successfully.');
      }
      await this.loadUsers();
      this.close();
    } catch (err: any) {
      this.errorMessage.set('Operation failed. Please try again.');
      console.error(err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  close() {
    this.isModalOpen.set(false);
    this.editingUser = null;
    this.formData = { name: '', email: '', position: '' };
    this.errorMessage.set('');
  }

  showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}