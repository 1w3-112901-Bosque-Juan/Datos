import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding:1rem">
      <h2>Catálogo</h2>
      <div *ngIf="products.length === 0">No hay productos</div>
      <div *ngFor="let p of products" style="border:1px solid #ddd;padding:8px;margin:8px 0;">
        <strong>{{p.name}}</strong> - {{p.type}} - \${{p.price}}
        <div *ngIf="p.attributes">Atributos: {{p.attributes | json}}</div>
        <button (click)="addToCart(p.id)">Agregar al carrito</button>
      </div>
    </div>
  `
})
export class CatalogComponent implements OnInit {
  products: any[] = [];

  constructor(private svc: ProductService, private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.svc.list().subscribe({
      next: (res: any) => this.products = res,
      error: (err) => console.error(err)
    });
  }

  addToCart(productId: string) {
    const token = this.auth.getToken();
    if (!token) { alert('Necesita loguearse'); return; }

    fetch('http://localhost:8080/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': token
      },
      body: JSON.stringify({ [productId]: 1 })
    })
      .then(r => r.json())
      .then(() => alert('Agregado al carrito'))
      .catch(err => console.error(err));
  }
}
