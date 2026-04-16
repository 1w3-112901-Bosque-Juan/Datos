import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  template: `
    <div style="max-width:400px;margin:auto;padding:2rem">
      <h2>Register</h2>
      <form (submit)="onSubmit($event)">
        <div><label>Usuario</label><input name="username" [(ngModel)]="username" required/></div>
        <div>
          <label>Password</label><input name="password" type="password" [(ngModel)]="password" required/>
        </div>
        <div *ngIf="error" style="color:red">{{ error }}</div>
        <button type="submit">Registrar</button>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(e: Event) {
    e.preventDefault();
    try {
      await this.auth.register(this.username, this.password);
      // on success redirect to login
      this.router.navigate(['/login']);
    } catch (err: any) {
      if (err && err.status === 409) {
        this.error = 'Usuario ya existe';
      } else {
        this.error = 'Error al registrar';
      }
    }
  }
}
