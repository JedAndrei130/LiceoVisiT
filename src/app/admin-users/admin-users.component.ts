import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserStoreService } from '../services/user-store.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent {

  users: any[] = [];

  isModalOpen = false;
  editingUser: any = null;

  formData = {
    name: '',
    email: '',
    position: ''
  };

  constructor(private userService: UserStoreService) {
    this.users = this.userService.getUsers();
  }

  openAdd() {
    this.resetForm();
    this.isModalOpen = true;
  }

  edit(user: any) {
    this.editingUser = user;
    this.formData = { ...user };
    this.isModalOpen = true;
  }

  delete(id: string) {
    if (confirm('Delete this user?')) {
      this.userService.deleteUser(id);
      this.users = this.userService.getUsers();
    }
  }

  submit() {
    if (this.editingUser) {
      this.userService.updateUser(this.editingUser.id, this.formData);
    } else {
      this.userService.addUser(this.formData);
    }

    this.close();
    this.users = this.userService.getUsers();
  }

  close() {
    this.isModalOpen = false;
    this.editingUser = null;
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      name: '',
      email: '',
      position: ''
    };
  }
}