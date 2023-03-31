import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

import { ProductService } from 'src/app/entities/product/product.service';
import { IProduct } from 'src/app/entities/product/product.model';
import { InventoryService } from "src/app/shared/inventory.service";
import { TextService } from "src/app/shared/text.service";
import { Subscription } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


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
  displayedColumns: string[] = ['index', 'name', 'brand', 'date', 'active', 'delete'];
  displayedColumnsWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement: IProduct | any;

  // listSelectedElement: IProduct | any | null;
  product: IProduct | any | null;
  products: IProduct[] = [];
  message: [] | any;
  subscription: Subscription | any;
  

  @ViewChild(MatSort) sort!: MatSort;
  // @Output() selectedProduct = new EventEmitter<IProduct>();
  // @Input() productToDisplay: IProduct | any;

  myDataArray: MatTableDataSource<IProduct> | any;

  // productSubscription: Subscription | any;
  serviceSelectedProduct: IProduct | any | null;

  constructor(protected productService: ProductService, 
    private data: InventoryService,
    private logger: TextService) { }

  // ngAfterViewInit(): void {    
  //   this.myDataArray.sort = this.sort;
  // }

  // Load all the products when starting the view.
  ngOnInit(): void {
    this.logger.ez.set_text('product_list_init', true);
    this.productService.selected.subscribe((product: IProduct | any | null) => this.registerSelectedProduct(product));

    //this.productSubscription = this.productService.selected.subscribe((product: IProduct) => this.serviceSelectedProduct = product);
    
    this.loadAll();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // If new product created, we add it to the list.
  ngOnChanges(): void {

    // if (this.productToDisplay !== null) {
    //   this.products.push(this.productToDisplay);
    //   this.logger.ez.set_text(`created:\n${JSON.stringify(this.productToDisplay, null, '\t')}`, true);
    //   this.productsUpdate(false);
    // }

  }


  registerSelectedProduct(product:IProduct | any | null): void{
    
    if(product !== null){
      this.logger.ez.set_text(`product_list serviceSelectedProduct: ${product !== null ? product.name : null}`, true);
      this.logger.ez.set_text(`status: ${product.name} in list ? ${this.products.includes(product)}`, true);

      if(!this.products.includes(product)){
        this.product = product;
        this.products.push(this.product);
        this.productsUpdate(false);
      }
    }
    // this.productForm.controls['name'].setValue(product !== null ? product.name : null);    
    // this.productForm.controls['brand'].setValue(product !== null ? product.brand : null);    
    // this.productForm.controls['date'].setValue(product !== null ? product.date : null);    
    // this.productForm.controls['active'].setValue(product !== null ? product.active : null);

    // if(product !== null && Array.isArray(product.meta.f)){
    //   const actualPOS = product.meta.f.map((fp:any) => fp.val);
    //   this.productForm.controls['brand'].setValue(actualPOS);    
    // }

    // product !== null ? this.productForm.controls['name'].disable() : this.productForm.controls['name'].enable();
    // this.serviceSelectedProduct = product;
    
  }



  // update all products
  productsUpdate(refresh: boolean | any = true): void {
    if(refresh) this.loadAll();
    this.myDataArray = new MatTableDataSource([...this.products]);
    this.myDataArray.sort = this.sort;
    this.broadcastNames();
  }

  //post list of all products
  broadcastNames(): void{
    //const names_only = this.products.map(p => {return {'name':p.name,'brand':p.brand}});
    this.data.changeMessage(this.products);
  }

  setProductSelection(element: IProduct, toggle: boolean): void{
    //console.log()
    //this.listSelectedElement = toggle ? element : null;
    //this.selectedProduct.emit(this.listSelectedElement);
    
    this.productService.setSelected(toggle ? element : null);
    this.logger.ez.set_text(`setProductSelection "${element.name}" (${toggle})`, true);
  }

  // toggle the "active" property of the product
  setActive(element: IProduct): void{
    const id = element._id;
    const state = element.active;
    this.productService.update(id, 'active', !state).then((result: any) => {
      this.productsUpdate();
      this.logger.ez.set_text(`updated: "${element.name} (.${element.brand})" -> Set active to ${!state}\n ${JSON.stringify(result, null, '\t')}`, true);
      element.active = !state;
      this.productService.setSelected(element);
    });
  }

  // Delete a product. 
  delete(element: IProduct) {
    this.productService.delete(element._id).then((result: any) => {
      this.productsUpdate();
      this.logger.ez.set_text(`permanently deleted: "${element.name} (.${element.brand})" \n ${JSON.stringify(result, null, '\t')}`, true);
      this.productService.setSelected(null);
    });
  }

  // Load all products.
  private loadAll() {
    console.log('reload');
    this.productService
      .get()
      .then((result: Array<IProduct> | any) => {
        this.products = result;
        this.productsUpdate(false);
      });
  }

}

