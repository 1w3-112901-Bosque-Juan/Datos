import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionToken: string | null = null;
  private username: string | null = null;

  constructor(private api: ApiService) {}

  login(username: string, password: string) {
    return this.api.post('/auth/login', { username, password }).toPromise().then((res: any) => {
      if (res.authenticated) {
        this.sessionToken = res.sessionToken;
        this.username = res.username;
        localStorage.setItem('sessionToken', this.sessionToken!);
        localStorage.setItem('username', this.username!);
      }
      return res;
    });
  }

  getToken() {
    if (!this.sessionToken) this.sessionToken = localStorage.getItem('sessionToken');
    return this.sessionToken;
  }

  getUsername() {
    if (!this.username) this.username = localStorage.getItem('username');
    return this.username;
  }

  logout() {
    this.sessionToken = null; this.username = null; localStorage.removeItem('sessionToken'); localStorage.removeItem('username');
  }
}
