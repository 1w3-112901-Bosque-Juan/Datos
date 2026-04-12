import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private api: ApiService, private auth: AuthService) {}

  
  list() {
    return this.api.get('/products', this.auth.getToken() ?? undefined);
  }

  listWithToken(token: string | undefined) {
    return this.api.get('/products', token);
  }

  get(id: string) {
    return this.api.get('/products/' + id, this.auth.getToken() ?? undefined);
  }

  create(p: any) {
    return this.api.post('/products', p, this.auth.getToken() ?? undefined);
  }
}
