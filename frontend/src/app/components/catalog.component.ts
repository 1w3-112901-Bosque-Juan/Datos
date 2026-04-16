import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-catalog',
  standalone: false,
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
})
export class CatalogComponent implements OnInit {
  products: any[] = [];
  initialLoad = true;

  constructor(
    private svc: ProductService,
    private auth: AuthService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  getAttributeKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  private load() {
    const token = this.auth.getToken() ?? undefined;

    this.svc.listWithToken(token).subscribe({
      next: (res: any) => {
        this.products = res;
        this.initialLoad = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.initialLoad = false;
        this.cdr.detectChanges();
      },
    });
  }

  addToCart(productId: string) {
    const token = this.auth.getToken();
    if (!token) {
      alert('Necesita loguearse');
      return;
    }

    this.cartService.addToCart(token, productId, 1).subscribe({
      next: () => {
        this.cartService.refreshCartCount(token);
      },
      error: (err) => {
        console.error(err);
        alert('Error al agregar al carrito');
      },
    });
  }
}
