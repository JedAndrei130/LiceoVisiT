import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { lastValueFrom } from "rxjs";

export interface User {
  user_id: number;
  name: string;
  email: string;
  position: string;
  created_at?: string;
}

export interface CreateUser {
  name: string;
  email: string;
  position: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:3001/users';

  // Singleton cache — survives route changes
  cachedUsers: User[] = [];

  async getAllUsers(): Promise<User[]> {
    const data = await lastValueFrom(this.http.get<User[]>(this.API_URL));
    this.cachedUsers = data;
    return data;
  }

  createUser(payload: CreateUser) {
    return lastValueFrom(this.http.post<{ message: string; id: number }>(this.API_URL, payload));
  }

  updateUser(id: number, payload: Partial<CreateUser>) {
    return lastValueFrom(this.http.put<{ message: string }>(`${this.API_URL}/${id}`, payload));
  }

  deleteUser(id: number) {
    return lastValueFrom(this.http.delete<{ message: string }>(`${this.API_URL}/${id}`));
  }
}
