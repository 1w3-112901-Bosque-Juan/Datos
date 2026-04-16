import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CartService } from './services/cart.service';
import { CartStateService } from './services/cart-state.service';
import { ProductService } from './services/product.service';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

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
  showCartPanel = false;
  showLoginPanel = false;
  cartItems: any[] = [];
  // track recently added items to animate highlight in the open cart
  recentlyAdded: { [productId: string]: boolean } = {};
  private prevCartMap: { [key: string]: number } | null = null;
  products: any[] = [];
  scrollY = 0;
  currentBanner = 0;
  showLoginMessage = false;
  loginMessage = '';
  pendingProductId: string | null = null;
  // username is used for the login form; currentUser holds the logged-in name
  username = '';
  password = '';
  currentUser: string | null = null;
  loginError = '';
  initialLoad = true;
  private subscription!: Subscription;
  private scrollListener!: () => void;
  private bannerInterval: any;
  private loginMessageTimeout: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private cartState: CartStateService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
  ) {}

  // For debugging: attach a DOM listener to the logout button after view init
  ngAfterViewInit(): void {
    try {
      const btn = document.getElementById('btn-logout');
      if (btn) {
        btn.addEventListener('click', (e) => {
          // native listener kept for instrumentation if needed
        });
      }
    } catch (e) {
      console.warn('Failed to attach native listener to logout button', e);
    }
  }

  ngOnInit(): void {
    this.loadProducts();
    // initialize current user from auth service/localStorage
    this.currentUser = this.authService.getUsername();

    this.subscription = this.cartState.cartCount$.subscribe((count) => {
      this.cartCount = count;
      this.cdr.detectChanges();
    });
    // subscribe to whole cart map to update open cart view reactively and animate new items
    this.cartState.cartMap$.subscribe((map) => {
      if (!map) {
        this.prevCartMap = null;
        return;
      }

      // detect newly added or increased items by comparing with previous map
      if (this.showCartPanel && this.prevCartMap) {
        for (const [id, qty] of Object.entries(map)) {
          const prevQty = this.prevCartMap[id] ?? 0;
          if (qty > prevQty) {
            // mark as recently added
            this.recentlyAdded[id] = true;
            // clear highlight after animation
            setTimeout(() => {
              delete this.recentlyAdded[id];
              this.cdr.detectChanges();
            }, 900);
          }
        }
      }

      if (map && this.showCartPanel) {
        this.cartItems = Object.entries(map).map(([id, q]) => ({ productId: id, quantity: q, name: this.getProductName(id) }));
        this.cdr.detectChanges();
      }

      // store for next comparison
      this.prevCartMap = { ...map };
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
        this.startBannerAutoPlay();
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
    if (this.bannerInterval) {
      clearInterval(this.bannerInterval);
    }
    if (this.loginMessageTimeout) {
      clearTimeout(this.loginMessageTimeout);
    }
  }

  startBannerAutoPlay() {
    this.bannerInterval = setInterval(() => {
      this.nextBanner();
    }, 5000);
  }

  nextBanner() {
    this.currentBanner = (this.currentBanner + 1) % 2;
    this.cdr.detectChanges();
  }

  prevBanner() {
    this.currentBanner = (this.currentBanner - 1 + 2) % 2;
    this.cdr.detectChanges();
  }

  goToBanner(index: number) {
    this.currentBanner = index;
    this.cdr.detectChanges();
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
    const token = this.authService.getToken() ?? undefined;
    this.productService.listWithToken(token).subscribe({
    next: (res: any) => {
        this.products = res;
        this.initialLoad = false;
      },
      error: () => {
        this.products = [];
        this.initialLoad = false;
      },
    });
  }

  getAttributeKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  getProductName(productId: string): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : productId;
  }

  loadCartCount() {
    const token = this.authService.getToken();
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
    const token = this.authService.getToken();
    if (token) {
      this.cartService.refreshCartCount(token);
    }
  }

  toggleCartPanel() {
    this.showCartPanel = !this.showCartPanel;
    if (this.showCartPanel) {
      this.loadCartItems();
    }
    this.cdr.detectChanges();
  }

  closeCartPanel() {
    this.showCartPanel = false;
    this.cdr.detectChanges();
  }

  toggleCartDropdown() {
    this.showCartDropdown = !this.showCartDropdown;
    if (this.showCartDropdown) {
      this.loadCartItems();
    }
    this.cdr.detectChanges();
  }

  loadCartItems() {
    const token = this.authService.getToken();
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
    const token = this.authService.getToken();
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
        this.cartState.updateCartMap(cart);
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

  toggleLoginPanel() {
    // toggle login panel
    // ensure logout confirm modal is hidden when opening login panel
    this.showLogoutConfirm = false;
    this.showLoginPanel = !this.showLoginPanel;
    this.loginError = '';
    this.cdr.detectChanges();
  }

  

  closeLoginPanel() {
    this.showLoginPanel = false;
    this.loginError = '';
    this.cdr.detectChanges();
  }

  async onLoginSubmit() {
    // handle login submit
    this.loginError = '';
    try {
      const res: any = await this.authService.login(this.username, this.password);
      if (res && res.authenticated) {
        this.showLoginPanel = false;
        // set currentUser separately from the form username
        this.currentUser = res.username ?? this.authService.getUsername();
        this.username = '';
        this.password = '';

        if (this.pendingProductId) {
          const token = this.authService.getToken();
          if (token) {
            this.cartService.addToCart(token, this.pendingProductId, 1).subscribe({
              next: () => {
                this.loginMessage = 'Producto agregado al carrito';
                this.showLoginMessage = true;
                this.cartService.refreshCartCount(token);
                this.pendingProductId = null;
                if (this.loginMessageTimeout) clearTimeout(this.loginMessageTimeout);
                this.loginMessageTimeout = setTimeout(() => {
                  this.showLoginMessage = false;
                  this.cdr.detectChanges();
                }, 2000);
                this.cdr.detectChanges();
              },
            });
          }
        }

        this.loadCartCount();
        this.cdr.detectChanges();
      } else {
        this.loginError = 'Credenciales inválidas';
        this.cdr.detectChanges();
      }
      } catch (err) {
      this.loginError = 'Usuario o contraseña incorrectos';
      this.cdr.detectChanges();
    }
  }

  addToCart(productId: string) {
    const token = this.authService.getToken();

    if (!token || token === 'null' || token === 'undefined') {
      window.alert('Debes iniciar sesión para añadir al carrito');
      this.showLoginPanel = true;
      this.pendingProductId = productId;
      this.cdr.detectChanges();
      return;
    }

    this.cartService.addToCart(token, productId, 1).subscribe({
      next: () => {
        this.loginMessage = 'Producto agregado al carrito';
        this.showLoginMessage = true;
        this.cartService.refreshCartCount(token);
        if (this.loginMessageTimeout) clearTimeout(this.loginMessageTimeout);
        this.loginMessageTimeout = setTimeout(() => {
          this.showLoginMessage = false;
          this.cdr.detectChanges();
        }, 2000);
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          this.authService.clearSession();
          window.alert('Tu sesión ha expirado. Debes iniciar sesión nuevamente.');
          this.showLoginPanel = true;
          this.pendingProductId = productId;
          this.cdr.detectChanges();
        }
      },
    });
  }

  isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }

  // Legacy handler left in place for compatibility. Do not call this directly.
  async onLogout(_: boolean = false) {
    // deprecated logout handler
    return;
  }

  // Actual logout executor called only after explicit confirmation in the modal
  private async executeLogout() {
    try {
      await this.authService.logout();
    } catch (err) {
      console.error('Logout request failed', err);
    } finally {
      this.authService.clearSession();
      this.clearClientSessionUI();
      // reload the page to reset app state fully
      window.location.reload();
    }
  }

  private clearClientSessionUI() {
    this.currentUser = null;
    this.cartItems = [];
    this.showCartPanel = false;
    this.showCartDropdown = false;
    this.cartState.updateCartCount(0);
    this.cdr.detectChanges();
  }

  // Logout confirmation modal control
  showLogoutConfirm = false;
  // Coming soon modal control
  showComingSoon = false;

  openLogoutConfirm(evt?: Event) {
    if (evt) {
      try { evt.stopPropagation(); (evt as any).preventDefault(); } catch(e) {}
    }
    this.showLogoutConfirm = true;
    this.cdr.detectChanges();
  }

  closeLogoutConfirm() {
    this.showLogoutConfirm = false;
    this.cdr.detectChanges();
  }

  async confirmLogout() {
    this.closeLogoutConfirm();
    await this.executeLogout();
  }

  closeMessage() {
    this.showLoginMessage = false;
    this.cdr.detectChanges();
  }

  // Provide a graceful fallback when an image fails to load
  imageFallback(evt: Event) {
    const img = evt.target as HTMLImageElement;
    if (!img) return;
    // replace with a tiny placeholder data URI or a bundled placeholder path
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%231a73e8"/><text x="50%" y="50%" font-size="20" fill="white" dominant-baseline="middle" text-anchor="middle">Imagen no disponible</text></svg>';
  }

  // Reusable placeholder (same as used in imageFallback)
  placeholderDataUri = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="%231a73e8"/><text x="50%" y="50%" font-size="20" fill="white" dominant-baseline="middle" text-anchor="middle">Imagen no disponible</text></svg>';
}
