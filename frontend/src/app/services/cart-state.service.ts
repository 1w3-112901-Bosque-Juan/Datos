import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartStateService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }

  getCurrentCount(): number {
    return this.cartCountSubject.getValue();
  }
}
