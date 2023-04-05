import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, Output, EventEmitter } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProductService } from 'src/app/entities/product/product.service';
import { IProduct } from 'src/app/entities/product/product.model';

import { TextService } from "src/app/shared/text.service";
import { Subscription, mergeMap } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommunicationsService, formatMs, normVal } from 'src/app/shared/coms.service';


export interface StateGroup {
  letter: string;
  product: IProduct;
  delta_str: string;
  delta_ms: number;
}

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
  stateGroups: StateGroup[] = [];

  ListViews: [] | any = ['table','timeline'];

  @ViewChild(MatSort) sort!: MatSort;
  // @Output() selectedProduct = new EventEmitter<IProduct>();
  // @Input() productToDisplay: IProduct | any;

  inventoryDataArray = new MatTableDataSource<IProduct>();

  // productSubscription: Subscription | any;
  serviceSelectedProduct: IProduct | any | null;
  currentView: string | any = 'table';

  viewSelectForm = this._formBuilder.group({
    view: new FormControl('table'),
  });

  constructor(
    protected productService: ProductService, 
    public _formBuilder: FormBuilder,
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

    this.viewSelectForm.controls['view'].valueChanges.subscribe((value: string | any) => this.currentView = value);

    this.productService.get();
    // this.loadAll();
  }

  ngAfterViewInit(): void{
    // for(let i=0;i<k_chars.length;i++){
    // }
  }

  ngOnDestroy() {
    this.productSubscription.unsubscribe();
  }

  // If new product created, we add it to the list.
  ngOnChanges(): void {

  }

  updateCurrentInventory(productList:IProduct[] | []){
    if(productList.length === 0) return;

    this.products = productList;
    this.inventoryDataArray.data = this.products;
    this.inventoryDataArray.sort = this.sort;
    this.coms.log(`(${this.products.length}) products`, {'state':`product-list-update-inventory`});

    //build states object
    const k_group: StateGroup[] = [];
    const deltas:number[] = [];
    let pre_time = new Date().getTime();

    for(let i=0;i<this.products.length;i++){
      const p_time = new Date(this.products[i].date).getTime();
      const delta = p_time - pre_time > 0 ? p_time - pre_time : 0;
      const delta_str = formatMs(delta);
      deltas.push(delta);
      this.logger.ez.set_text(`${this.products[i].name} ${delta_str}`, true);
      
      const r_part = {
        'letter': this.products[i].name.substring(0,1),
        'product': this.products[i],
        'delta_str': delta_str,
        'delta_ms': delta
      };
      pre_time = p_time;
      k_group.push(r_part);
    }

    const k_max = Math.max(...deltas);
    const k_min = Math.min(...deltas);
    k_group.map((part:any) => {
      part.delta_ms = Math.round(normVal(part.delta_ms, k_min, k_max)*1000);
    })



    this.stateGroups = k_group.reverse();
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
      this.coms.log(`selected: "${element.name}"`, {'state':`product-list-selected`, 'from_id':element.id});
      this.productService.setSelected(this.product);
    }else{
      this.coms.log(`deselected: "${this.product.name}"`, {'state':`product-list-deselected`, 'from_id':this.product.id});
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
      this.coms.log(`updated: "${element.name} (.${element.brand})" -> Set active to ${!state}`,
        {'icon':'check_circle_outline','state':`product-list-active-${!state}`,'object':result, 'from_id':this.product.id});
      this.productService.setSelected(this.product);
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
    
      this.coms.log(`permanently deleted: "${element.name} (.${element.brand})"`, 
        {'icon':'delete_forever','state':'product-list-delete','object':result, 'from_id':this.product.id});

      this.productService.setSelected(null);
    });
  }

}

