import { Injectable } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
  position: string;
  createdDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {

  users: User[] = [];

  constructor() {
    const data = localStorage.getItem('users');
    if (data) this.users = JSON.parse(data);
  }

  save() {
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  getUsers() {
    return this.users;
  }

  addUser(user: Omit<User, 'id' | 'createdDate'>) {
    const newUser: User = {
      ...user,
      id: Math.random().toString(36).substring(2, 9),
      createdDate: new Date().toLocaleDateString()
    };
    this.users.unshift(newUser);
    this.save();
  }

  updateUser(id: string, data: any) {
    this.users = this.users.map(u =>
      u.id === id ? { ...u, ...data } : u
    );
    this.save();
  }

  deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    this.save();
  }
}