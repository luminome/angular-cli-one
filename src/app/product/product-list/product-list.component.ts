import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { ProductService } from 'src/app/entities/product/product.service';
import { IProduct } from 'src/app/entities/product/product.model';

import { TextService } from "src/app/shared/text.service";
import { Subscription, mergeMap } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommunicationsService } from 'src/app/shared/coms.service';

export interface PeriodicElement {
  name: string;
}

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ProductListComponent implements OnInit, OnChanges, OnDestroy {
  displayedColumns: string[] = ['id', 'name', 'brand', 'date', 'active', 'delete'];
  displayedColumnsWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement: IProduct | any;

  // listSelectedElement: IProduct | any | null;
  product: IProduct | any | null;
  products: IProduct[] = [];
  message: [] | any;

  productSubscription: Subscription | any;
  productListSubscription: Subscription | any;
  
  users: IProduct | any | null;

  @ViewChild(MatSort) sort!: MatSort;
  // @Output() selectedProduct = new EventEmitter<IProduct>();
  // @Input() productToDisplay: IProduct | any;

  inventoryDataArray = new MatTableDataSource<IProduct>();

  // productSubscription: Subscription | any;
  serviceSelectedProduct: IProduct | any | null;

  constructor(
    protected productService: ProductService, 
    private logger: TextService,
    public coms: CommunicationsService) { }


  // Load all the products when starting the view.
  ngOnInit(): void {
    this.logger.ez.set_text('product_list_init', true);
    this.productSubscription = this.productService.selected.subscribe((product: IProduct | any) => {
      this.registerSelectedProduct(product);
    });
    this.productListSubscription = this.productService.inventory.subscribe((productList: IProduct[] | any | []) => {
      this.updateCurrentInventory(productList);
    });

    this.productService.get();
    // this.loadAll();
  }

  ngOnDestroy() {
    this.productSubscription.unsubscribe();
  }

  // If new product created, we add it to the list.
  ngOnChanges(): void {

  }

  updateCurrentInventory(productList:IProduct[] | []){
    this.logger.ez.set_text(`product_list updateCurrentInventory: (${productList.length}) products.`, true);
    this.products = productList;
    this.inventoryDataArray.data = this.products;
    this.inventoryDataArray.sort = this.sort;
  }

  registerSelectedProduct(product:IProduct | any | null): void{

    this.logger.ez.set_text(`product_list serviceSelectedProduct: ${product !== null ? product.name : null}`, true);

    if(product !== null){
      this.logger.ez.set_text(`status: ${product.name} in list ? ${this.products.includes(product)}`, true);
    }else{
      this.expandedElement = null;
    }
  }


  setProductSelection(element: IProduct | null): void{
    if(element !== null){
      this.product = element;
      this.coms.log(`selected: "${element.name}"`, {'state':`product-list-selected`});
      this.productService.setSelected(this.product);
    }else{
      this.coms.log(`deselected: "${this.product.name}"`, {'state':`product-list-deselected`});
      this.product = null;
      this.productService.setSelected(null);
    }
  }

  // toggle the "active" property of the product
  setActive(element: IProduct): void{
    const id = element._id;
    const state = element.active;
    this.product = element;
    this.productService.update(id, 'active', !state)
    .then((result: any) => {
      this.product.active = !state;
      this.productService.setSelected(this.product);
      this.coms.log(`updated: "${element.name} (.${element.brand})" -> Set active to ${!state}`, {'icon':'check_circle_outline','state':`product-list-active-${!state}`});
      this.productService.setSelected(this.product);
      this.logger.ez.set_text(`updated: "${element.name} (.${element.brand})" -> Set active to ${!state}\n ${JSON.stringify(result, null, '\t')}`, true);
    });
  }

  // Delete a product. 
  delete(element: IProduct) {
    this.productService.delete(element._id).then((result: any) => {
      //this.productsUpdate();

      const index = this.products.indexOf(element);
      if (index >= 0) {
        this.products.splice(index, 1);
        this.inventoryDataArray.data = this.products;
      }
      


      this.coms.log(`permanently deleted: "${element.name} (.${element.brand})"`, {'icon':'delete_forever','state':'product-list-delete'});

      this.logger.ez.set_text(`permanently deleted: "${element.name} (.${element.brand})" \n ${JSON.stringify(result, null, '\t')}`, true);
      this.productService.setSelected(null);
    });
  }

}

