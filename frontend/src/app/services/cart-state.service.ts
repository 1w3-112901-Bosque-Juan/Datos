import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartStateService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();
  private cartMapSubject = new BehaviorSubject<{ [key: string]: number } | null>(null);
  cartMap$ = this.cartMapSubject.asObservable();

  updateCartCount(count: number) {
    this.cartCountSubject.next(count);
  }

  updateCartMap(map: { [key: string]: number } | null) {
    this.cartMapSubject.next(map);
  }

  getCurrentCount(): number {
    return this.cartCountSubject.getValue();
  }
}
