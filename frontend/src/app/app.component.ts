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
  scrollY = 0;
  private subscription!: Subscription;
  private scrollListener!: () => void;

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

    this.scrollListener = () => {
      this.scrollY = window.scrollY;
      this.updateBackground();
    };
    window.addEventListener('scroll', this.scrollListener);

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
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
  }

  updateBackground() {
    const scrollPercent = Math.min(this.scrollY / 500, 1);
    const hue1 = 220 - scrollPercent * 40;
    const hue2 = 260 + scrollPercent * 60;
    const hue3 = 320 - scrollPercent * 40;
    const hue4 = 200 + scrollPercent * 60;
    document.body.style.background = `linear-gradient(180deg, 
      hsl(${hue1}, 70%, 15%) 0%, 
      hsl(${hue2}, 60%, 20%) 35%, 
      hsl(${hue3}, 50%, 25%) 65%, 
      hsl(${hue4}, 60%, 15%) 100%)`;
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
