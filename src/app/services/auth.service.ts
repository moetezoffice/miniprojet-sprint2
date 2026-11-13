import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly users: User[] = [
    { username: 'admin', password: '123', roles: ['ADMIN'] },
    { username: 'moetez', password: '123', roles: ['USER'] },
  ];

  loggedUser: string | null = null;
  isloggedIn = false;
  roles: string[] = [];

  constructor() {
    this.restoreSession();
  }

  signIn(user: Pick<User, 'username' | 'password'>): boolean {
    const validUser = this.users.find(
      (candidate) => candidate.username === user.username && candidate.password === user.password,
    );
    if (!validUser) return false;

    this.loggedUser = validUser.username;
    this.isloggedIn = true;
    this.roles = [...validUser.roles];
    localStorage.setItem('loggedUser', validUser.username);
    localStorage.setItem('isloggedIn', 'true');
    return true;
  }

  logout(): void {
    this.loggedUser = null;
    this.isloggedIn = false;
    this.roles = [];
    localStorage.removeItem('loggedUser');
    localStorage.setItem('isloggedIn', 'false');
    void this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.roles.includes('ADMIN');
  }

  restoreSession(): void {
    const isLoggedIn = localStorage.getItem('isloggedIn') === 'true';
    const username = localStorage.getItem('loggedUser');
    const validUser = isLoggedIn && username
      ? this.users.find((user) => user.username === username)
      : undefined;

    if (!validUser) {
      this.loggedUser = null;
      this.isloggedIn = false;
      this.roles = [];
      localStorage.removeItem('loggedUser');
      localStorage.setItem('isloggedIn', 'false');
      return;
    }

    this.loggedUser = validUser.username;
    this.isloggedIn = true;
    this.roles = [...validUser.roles];
  }
}
