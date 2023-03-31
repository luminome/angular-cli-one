import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IProduct } from 'src/app/entities/product/product.model';

@Injectable({
    providedIn: 'root'
})

// WOW

export class InventoryService {

  private messageSource = new BehaviorSubject([]);
  currentMessage = this.messageSource.asObservable();

  constructor() { }

  changeMessage(message: [] | any) {
    this.messageSource.next(message)
  }

}