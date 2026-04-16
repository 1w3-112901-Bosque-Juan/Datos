import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CartStateService } from './cart-state.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  constructor(
    private api: ApiService,
    private cartState: CartStateService,
  ) {}

  getCart(token: string) {
    return this.api.get('/cart', token);
  }

  addToCart(token: string, productId: string, quantity: number = 1) {
    return this.api.post('/cart', { [productId]: quantity }, token).pipe();
  }

  removeFromCart(token: string, productId: string) {
    return this.api.delete('/cart/' + productId, token);
  }

  clearCart(token: string) {
    return this.api.delete('/cart');
  }

  getCartCount(cart: { [key: string]: number }): number {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  refreshCartCount(token: string) {
    this.getCart(token).subscribe({
      next: (cart: any) => {
        const count = this.getCartCount(cart);
        this.cartState.updateCartCount(count);
        // also update map observable
        this.cartState.updateCartMap(cart);
      },
      error: () => {
        this.cartState.updateCartCount(0);
        this.cartState.updateCartMap(null);
      },
    });
  }

  getCartItems(token: string) {
    return this.getCart(token);
  }
}
