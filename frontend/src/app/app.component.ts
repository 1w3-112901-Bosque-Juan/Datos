import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CartService } from './services/cart.service';
import { CartStateService } from './services/cart-state.service';
import { ProductService } from './services/product.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit, OnDestroy {
  showSplash = true;
  splashDone = false;
  cartCount = 0;
  showCartDropdown = false;
  cartItems: any[] = [];
  products: any[] = [];
  private subscription!: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private cartState: CartStateService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();

    this.subscription = this.cartState.cartCount$.subscribe((count) => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });

    setTimeout(() => {
      this.splashDone = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.showSplash = false;
        this.cdr.detectChanges();
        this.loadCartCount();
      }, 1000);
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadProducts() {
    const token = localStorage.getItem('sessionToken') ?? undefined;
    this.productService.listWithToken(token).subscribe({
      next: (res: any) => {
        this.products = res;
      },
      error: () => {
        this.products = [];
      },
    });
  }

  getProductName(productId: string): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : productId;
  }

  loadCartCount() {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      this.cartState.updateCartCount(0);
      return;
    }

    this.cartService.getCart(token).subscribe({
      next: (cart: any) => {
        const count = this.cartService.getCartCount(cart);
        this.cartState.updateCartCount(count);
      },
      error: () => {
        this.cartState.updateCartCount(0);
      },
    });
  }

  refreshCart() {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      this.cartService.refreshCartCount(token);
    }
  }

  toggleCartDropdown() {
    this.showCartDropdown = !this.showCartDropdown;
    if (this.showCartDropdown) {
      this.loadCartItems();
    }
    this.cdr.detectChanges();
  }

  loadCartItems() {
    const token = localStorage.getItem('sessionToken');
    if (!token) return;

    this.cartService.getCartItems(token).subscribe({
      next: (cart: any) => {
        this.cartItems = Object.entries(cart).map(([id, quantity]) => ({
          productId: id,
          quantity: quantity,
          name: this.getProductName(id),
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.cartItems = [];
        this.cdr.detectChanges();
      },
    });
  }

  removeFromCart(productId: string) {
    const token = localStorage.getItem('sessionToken');
    if (!token) return;

    this.cartService.removeFromCart(token, productId).subscribe({
      next: (cart: any) => {
        this.cartItems = Object.entries(cart).map(([id, qty]) => ({
          productId: id,
          quantity: qty,
          name: this.getProductName(id),
        }));
        const count = this.cartService.getCartCount(cart);
        this.cartState.updateCartCount(count);
        this.cdr.detectChanges();
      },
      error: () => {
        console.error('Error removing from cart');
      },
    });
  }

  closeCartDropdown(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-cart')) {
      this.showCartDropdown = false;
      this.cdr.detectChanges();
    }
  }
}
