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

  register(username: string, password: string) {
    return this.api.post('/auth/register', { username, password }).toPromise();
  }

  getToken() {
    if (!this.sessionToken) this.sessionToken = localStorage.getItem('sessionToken');
    return this.sessionToken;
  }

  getUsername() {
    if (!this.username) this.username = localStorage.getItem('username');
    return this.username;
  }

  logout(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      // no token locally, just clear client state
      this.sessionToken = null;
      this.username = null;
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('username');
      return Promise.resolve();
    }

    // call backend to invalidate session, then clear client storage
    return this.api.post('/auth/logout', {}, token).toPromise().then(() => {
      this.sessionToken = null;
      this.username = null;
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('username');
    }).catch((err: any) => {
      // If backend doesn't expose the logout endpoint (404), clear client session anyway.
      if (err && err.status === 404) {
        console.warn('Logout endpoint not found on server (404). Clearing client session locally.');
        this.clearSession();
        return Promise.resolve();
      }
      return Promise.reject(err);
    });
  }

  // Force-clear client-side session state (useful when logout request fails)
  clearSession() {
    this.sessionToken = null;
    this.username = null;
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('username');
  }
}
