import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: false,
  template: `
    <div style="max-width:400px;margin:auto;padding:2rem">
      <h2>Login</h2>
      <form (submit)="onSubmit($event)">
        <div><label>Usuario</label><input name="username" [(ngModel)]="username" /></div>
        <div>
          <label>Password</label><input name="password" type="password" [(ngModel)]="password" />
        </div>
        <button type="submit">Entrar</button>
      </form>
      <div *ngIf="error" style="color:red">{{ error }}</div>
    </div>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    try {
      const res: any = await this.auth.login(this.username, this.password);
      if (res && res.authenticated) {
        this.router.navigate(['/catalog']);
      } else {
        this.error = 'Credenciales inválidas';
      }
      } catch (err) {
      this.error = 'Usuario o contraseña incorrectos';
    }
  }
}
