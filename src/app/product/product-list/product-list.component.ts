import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProductService } from 'src/app/entities/product/product.service';
import { IProduct } from 'src/app/entities/product/product.model';

import { TextService } from "src/app/shared/text.service";
import { Subscription, mergeMap } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommunicationsService, formatMs, normVal } from 'src/app/shared/coms.service';
import { A } from '@angular/cdk/keycodes';




const overlaps:boolean|any = (a:Element, b:Element, direct:string) => {
  const a_r = a.getBoundingClientRect();
  const b_r = b.getBoundingClientRect();
  const o = direct === 'up' ? (a_r.top < b_r.bottom) : (a_r.top < b_r.bottom) || (a_r.bottom > b_r.top);
  return [o, a_r, b_r];
}

const prev:Element|any|null = (a:Element|HTMLElement, b:string, direct:string) => {
  const k_cond = direct === 'up' ? a.previousElementSibling : a.nextElementSibling;
  var sibling = k_cond;
  if (!b) return sibling;
  while (sibling) {
    if (sibling.matches(b)) return sibling;
    sibling = direct === 'up' ? sibling.previousElementSibling : sibling.nextElementSibling;
  }
  return null;
}

const shuffle:Element|any|null = (a:HTMLElement, selector:string, direction:string) => {
  const mar = 4;///MARGIN
  const el_next:Element|null = prev(a, selector, direction);
  if(el_next){
    const ref = overlaps(a, el_next, direction);
    if(ref[0]){
      const repos = direction==='up' ? (a.offsetTop - ref[2].height)-mar : (a.offsetTop + ref[1].height)+mar;
      el_next['style'].top = (repos)+'px';
      shuffle(el_next, selector, direction);
    }
  }
}


export interface StateGroup {
  letter: string;
  product: IProduct;
  delta_str: string;
  delta_ms: number;
  coms?: {} | undefined;
  coms_position?: number | undefined;
  dom_par?: HTMLElement;
  dom_chi?: HTMLElement;
  state?:boolean;
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
  selectedIndex:number|null = null;

  productSubscription: Subscription | any;
  productListSubscription: Subscription | any;
  
  users: IProduct | any | null;
  stateGroups: StateGroup[] = [];

  ListViews: [] | any = ['table','timeline'];

  @ViewChild(MatSort) sort!: MatSort;
  @Output() selectedProduct:any | null = new EventEmitter<HTMLElement>();
  // @Input() productToDisplay: IProduct | any;

  inventoryDataArray = new MatTableDataSource<IProduct>();

  // productSubscription: Subscription | any;
  serviceSelectedProduct: IProduct | any | null;
  currentView: string | any = 'table';

  viewSelectForm = this._formBuilder.group({
    view: new FormControl('table'),
  });

  public loading = true;
  

  constructor(
    protected productService: ProductService, 
    public _formBuilder: FormBuilder,
    private logger: TextService,
    public coms: CommunicationsService) { }




  @ViewChild('timeSeries') timeSeries!: ElementRef;
  @ViewChild('timeSeriesOne') timeSeriesOne!: ElementRef;




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
    this.coms.log(`(${this.products.length}) products`, {'level':'info','state':`product-list-update-inventory`});

    //build states object
    const k_group: StateGroup[] = [];
    const deltas:number[] = [];
    let pre_time = new Date().getTime();

    for(let i=0;i<this.products.length;i++){
      const p_time = new Date(this.products[i].date).getTime();
      const delta = p_time - pre_time > 0 ? p_time - pre_time : 0;
      const delta_str = formatMs(delta);
      deltas.push(delta);

      //this.logger.ez.set_text(`${this.products[i].name} ${delta_str}`, true);
      
      const r_part = {
        'letter': this.products[i].name.substring(0,1),
        'product': this.products[i],
        'delta_str': delta_str,
        'delta_ms': delta*3
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


  getProductComs(event: any, product:StateGroup, index:number){

    
    
    product.state = !product.state;

    if(product.product && !product.product.def){
      this.productService.getProductDefinition(product.product)
      .then((def_prod:boolean|void) => {
        
        console.log('getProductComs', def_prod, product);
      });
    };// return;

    // return;

    const open_items = [...this.timeSeriesOne.nativeElement.querySelectorAll('.time-row-select')];
    open_items.forEach((o:HTMLElement) => o.classList.remove('definitive'));

    const caller_row = document.getElementById('ts'+index);
    caller_row?.classList.toggle('time-row-select');

    let opening:boolean = false;

    if(caller_row?.matches('.time-row-select')){
      this.conf.s_h.push(index);
      opening = true;
    }else{
      const p = this.conf.s_h.indexOf(index);
      if(p !== -1) this.conf.s_h.splice(p, 1);
    }

    this.selectedIndex = this.conf.s_h[this.conf.s_h.length-1];

    const caller_now = document.getElementById('ts'+this.selectedIndex);
    caller_now?.classList.add('definitive');

    const open_child = document.getElementById('s'+index);
    open_child?.classList.toggle('time-row-open');
    // open_child?.classList.add('relevant');

    if(open_child?.matches('.time-row-open')){
      const vpos = caller_now?.offsetTop;
      if(open_child) open_child['style'].top = vpos+'px';
    }

    const open_col_two = [...this.timeSeries.nativeElement.querySelectorAll('.time-row-open')];
    for(let i=0; i < open_col_two.length; i++){
      const el = open_col_two[i];
      el.setAttribute('data-moved', '0');
    }

    if(opening){
      this.productService.get_coms(product.product)
      .then((response:{}) => {
        product.coms = response;
      });
    }else{
      this.handleDomChange(null);
    }
  }


  conf: { [key: string]: any | null } | any = {
    s_h: [],
    margin: 4,
    pko:0,
    previous: null,
    list_up:null,
    list_dn:null
  }



  overlaps:[]|any = (a:HTMLElement, b:HTMLElement) => {
    const at = a.offsetTop;
    const bt = b.offsetTop;
    const ab = at+a.getBoundingClientRect().height;
    const bb = bt+b.getBoundingClientRect().height;
    //top is in, bottom is in, or both are in; x2; if any true it overlaps;
    return (((at > bt) && (at < bb)) || ((ab > bt) && (ab < bb)) || ((at > bt) && (ab < bb))) ||
    (((bt > at) && (bt < ab)) || ((bb > at) && (bb < ab)) || ((bt > at) && (bb < ab)))
  }



  handleList(list:HTMLElement[], index:number, direction:string):void{
    const cursor:HTMLElement|any = (c:HTMLElement[], i:number, c_direction:string) => {
      const dir = (c_direction === 'up' ? -1: 1);
      const a:HTMLElement|null = c[i];
      const b:HTMLElement|null = c[i+dir];

      if(a && b && i >= 0){
        
        const n_o = this.overlaps(a,b) || 
          (dir === -1 && b.offsetTop > a.offsetTop) ||
          (dir === 1 && a.offsetTop > b.offsetTop) ||
          (dir === -1 && (b.offsetTop < Number(b.dataset['pos']))) ||
          (dir === 1 && (a.offsetTop+a.offsetHeight) > Number(b.dataset['pos']));

        if(n_o){
          const offset = [
            a.offsetTop - b.getBoundingClientRect().height,
            a.offsetTop + a.getBoundingClientRect().height
          ][+(direction !== 'up')];

          b.setAttribute('data-moved', '1');
          b['style'].top = (offset+(this.conf.margin*dir))+'px';


          cursor(c, i+dir, c_direction);
        }
      }
    }
    cursor(list, index, direction);
  }



  handleDomChange(event: any|null) {


    const wraps = [...this.timeSeries.nativeElement.querySelectorAll('.system-wrapper')];
    wraps.forEach((h:HTMLElement) =>{
      // const ht = h.getBoundingClientRect().height;
      const fc = h.firstElementChild?.getBoundingClientRect().height;
      if(fc) h['style'].height = (fc) + 'px';
    });


    const open_items = [...this.timeSeries.nativeElement.querySelectorAll('.time-row-open')];
    const open_rows = [...this.timeSeriesOne.nativeElement.querySelectorAll('.time-row-select')];
    const col_width = document.getElementById('column-one')?.getBoundingClientRect().width;

    for(let i=0; i < open_items.length; i++){
      const el = open_items[i];
      el.setAttribute('data-moved', 0);
    }
    
    for(let i=0; i < open_items.length; i++){
      //reset position first, then validate.
      const el = open_items[i];
      const par = document.getElementById('t'+el.id);
      if(par){
        el.setAttribute('data-pos', par.offsetTop);
        // el['style'].background = 'var(--bg)';
        if(par.matches('.definitive')){
          // el['style'].background = 'aqua';
          el.dataset['moved'] = '0';
        }
        if(el.dataset['moved'] === '0') el['style'].top = par.offsetTop + 'px';
      }

      this.handleList(open_items, i, 'up');
      this.handleList(open_items, i, 'down');
    }


    
    const w = 120;
    const opy = 0;
    const tension = 40;
    const t1 = w-tension;
    const t2 = tension;

    
    for(let ni=0; ni < open_rows.length; ni++){
      const par = open_rows[ni];
      const cid = par.id.substring(1,par.id.length);
      const chi = document.getElementById(cid);
      const curve = par?.querySelector('.time-curve');

      if(chi && curve){
        const n_rect = chi.getBoundingClientRect();
        const p_rect = par.getBoundingClientRect();

        const top = Math.min(par.offsetTop, chi.offsetTop);
        const bot = Math.max(par.offsetTop+p_rect.height, chi.offsetTop+n_rect.height);
        const h = bot-top;//h is legit;

        curve.setAttribute('viewBox', `0 0 ${w} ${h}`);
        const D = chi.offsetTop - par.offsetTop;
        const A = D<0 ? D : 0;

        curve['style'].left = col_width+'px';
        curve['style'].top = `${A}px`;
        curve['style'].height = `${h}px`;
        curve['style'].width = `${w}px`;
        
        const ty = (chi.offsetTop - par.offsetTop);
        const by = ((chi.offsetTop+n_rect.height) - (par.offsetTop+p_rect.height));

        const M = {x:0, y:D<0 ? (ty*-1)+opy : opy};
        const T = D<0 ? n_rect.height : ty+n_rect.height;

        let formula = `M ${M.x},${M.y} c ${t1},0 ${t2},${ty} ${w},${ty} `;
        formula += `L ${w},${T} `;
        formula += `c ${-t1},0 ${-t2},${-by} ${-w},${-by} z`;
        curve.querySelector('path')?.setAttribute('d', formula);

      }
    }
  }


















  handleDomChangeTWO(event: any|null) {
    const open_items = [...this.timeSeries.nativeElement.querySelectorAll('.time-row-open')];

    for(let ni=0; ni < open_items.length; ni++){
      const el = open_items[ni];
      const par = document.getElementById('t'+el.id);
      if(par) el.setAttribute('data-pos',par.offsetTop);
      el['style'].background = 'var(--bg)';
    }

    console.log('handleDomChange', this.selectedIndex)

    if(this.selectedIndex !== null){
      const selected = document.getElementById('s'+this.selectedIndex);
      // const par_selected = document.getElementById('ts'+this.selectedIndex);
      // if(!par_selected?.matches('.time-row-select')) selected?.classList.remove('time-row-open');

      const index = open_items.indexOf(selected);

      if(index !== -1){
        this.handleList(open_items, index, 'up');
        this.handleList(open_items, index, 'down');
        open_items[index]['style'].background = 'pink';
        this.conf.previous = index;
      }else{
        [this.conf.list_up, this.conf.list_dn-1].forEach((e:number) =>{
          if(e !== -1 && e !== open_items.length){
            this.handleList(open_items, e, 'up');
            this.handleList(open_items, e, 'down');
            open_items[e]['style'].background = 'pink';
          }
        })
        // console.log(this.conf.list_up, this.conf.list_dn-1);
        // if(this.conf.list_up!==-1){

        //   this.handleList(open_items, this.conf.list_up, 'up');
        //   this.handleList(open_items, this.conf.list_up, 'down');
        //   open_items[this.conf.list_up]['style'].background = 'pink';
        // }
        // this.handleList(open_items, this.conf.list_dn-1, 'up');
        // this.handleList(open_items, this.conf.list_dn-1, 'down');
        // open_items[this.conf.list_dn-1]['style'].background = 'pink';
      }

      // if(index === -1){
      //   this.handleList(open_items, this.conf.previous, 'up');
      //   this.handleList(open_items, this.conf.previous, 'down');
      //   open_items[this.conf.previous]['style'].background = 'pink';
      //   //open_items[this.conf.previous]['style'].top = open_items[this.conf.previous].dataset['pos'] +'px';  
      // }else{
      //   this.handleList(open_items, index, 'up');
      //   this.handleList(open_items, index, 'down');
      //   open_items[index]['style'].background = 'pink';
      //   this.conf.previous = index;
      // }
      


      // this.handleList(open_items, index, 'up');
      // this.handleList(open_items, index, 'down');

    }
    


    // console.log(open_items[this.selectedIndex])
    // if(this.selectedIndex !== null) 


  }

  handleDomChangePrev(event: any|null) {
    const col_width = document.getElementById('column-one')?.getBoundingClientRect().width;
    const w = 120;
    const opy = 0;
    const tension = 80;
    const t1 = w-tension;
    const t2 = tension;

    const open_rows = [...this.timeSeriesOne.nativeElement.querySelectorAll('.time-row-select')];
    const rows = [...this.timeSeriesOne.nativeElement.querySelectorAll('.time-row')];
    const selected = document.getElementById('ts'+this.selectedIndex);
    const selected_chi = document.getElementById('s'+this.selectedIndex);

    const arr:string[]|any = [[]];

    //rows.forEach((r:HTMLElement) => r['style'].background = 'none');

    for(let ni=0; ni < open_rows.length; ni++){
      const par = open_rows[ni];
      const cid = par.id.substring(1,par.id.length);
      const chi = document.getElementById(cid);
      const r_chi_ht = chi?.getBoundingClientRect().height;
      
      const r_nxt = open_rows[ni+1];
      const n_cid = r_nxt?.id.substring(1,r_nxt?.id.length);
      const r_nxt_chi = document.getElementById(n_cid);

      const m_f = (chi&&r_chi_ht) ? chi.offsetTop + r_chi_ht+ (-1*this.conf.pko) : 0;
      // let chi_pos:number = 0;

      if(chi && chi.matches('.time-row-open') && r_nxt_chi && r_chi_ht && 
        ( m_f > r_nxt.offsetTop)){ //m_f > r_nxt_chi.offsetTop ||
        
        if(arr[arr.length-1].length === 0){
          // par['style'].background = 'aqua';
          if(chi && chi.matches('.time-row-open')){
            chi['style'].top = (par.offsetTop) + 'px';
          }
        }else{
          // par['style'].background = 'yellow';
        }


        if(r_nxt_chi && chi && r_chi_ht){
          r_nxt_chi['style'].top = (chi?.offsetTop + r_chi_ht + 4) + 'px';
          // r_nxt['style'].background = 'orange';
        } 
        arr[arr.length-1].push(par.id);
      }else{
        if(arr[arr.length-1].length === 0){
          // par['style'].background = 'blue';
          if(chi && chi.matches('.time-row-open')){
            chi['style'].top = (par.offsetTop) + 'px';
          }
        }

        arr[arr.length-1].push(par.id);
        arr.push([]);
      }
    }

    //if(selected) selected['style'].background = 'pink';
    this.conf.pko = (selected && selected_chi) ? selected?.offsetTop - selected_chi?.offsetTop : 0;

    const open_items = [...this.timeSeries.nativeElement.querySelectorAll('.time-row-open')];

    arr.map((subarray:any) =>{
      if(subarray.includes(selected?.id)){
        subarray.map((s:string) => {
          const r_id = s.substring(1, s.length);
          const chi = document.getElementById(r_id);
          if(chi){
            chi['style'].top = (chi.offsetTop)+(this.conf.pko) + 'px';

            this.handleList(open_items, open_items.indexOf(chi), 'up');
            //shuffle(chi,'.time-row-open', 'up');
          }
        })
      }
    });


    for(let ni=0; ni < open_rows.length; ni++){
      const par = open_rows[ni];
      const cid = par.id.substring(1,par.id.length);
      const chi = document.getElementById(cid);
      const curve = par?.querySelector('.time-curve');

      if(par && chi && curve){
        const n_rect = chi.getBoundingClientRect();
        const p_rect = par.getBoundingClientRect();

        const top = Math.min(par.offsetTop, chi.offsetTop);
        const bot = Math.max(par.offsetTop+p_rect.height, chi.offsetTop+n_rect.height);
        const h = bot-top;//h is legit;

        curve.setAttribute('viewBox', `0 0 ${w} ${h}`);
        const D = chi.offsetTop - par.offsetTop;
        const A = D<0 ? D : 0;

        curve['style'].left = col_width+'px';
        curve['style'].top = `${A}px`;
        curve['style'].height = `${h}px`;
        curve['style'].width = `${w}px`;
        
        const ty = (chi.offsetTop - par.offsetTop);
        const by = ((chi.offsetTop+n_rect.height) - (par.offsetTop+p_rect.height));

        const M = {x:0, y:D<0 ? (ty*-1)+opy : opy};
        const T = D<0 ? n_rect.height : ty+n_rect.height;

        let formula = `M ${M.x},${M.y} c ${t1},0 ${t2},${ty} ${w},${ty} `;
        formula += `L ${w},${T} `;
        formula += `c ${-t1},0 ${-t2},${-by} ${-w},${-by} z`;
        curve.querySelector('path')?.setAttribute('d', formula);

      }
    }
  }

  registerSelectedProduct(product:IProduct | any | null): void{
    
    if(product !== null){
      this.logger.ez.set_text(JSON.stringify(product,null,'\t'), true);
      this.logger.ez.set_text(`status: ${product.name} in list ? ${this.products.includes(product)}`, true);
    }else{
      this.expandedElement = null;
    }
  }


  setProductSelection(element: IProduct | null, event:any): void{
    //console.log(event.target.parentNode.nextElementSibling);

    if(element !== null){

      if(element && !element.def){
        this.productService.getProductDefinition(element)
        .then((def_prod:boolean|void) => console.log(def_prod));
      };



      this.selectedProduct.emit(event.target.parentNode.nextElementSibling);
      this.product = element;
      this.coms.log(`selected: "${element.name}"`, {'level':'info', 'state':`product-list-selected`, 'from_id':element.id});
      this.productService.setSelected(this.product);
    }else{
      this.selectedProduct.emit(null);
      this.coms.log(`deselected: "${this.product.name}"`, {'level':'info', 'state':`product-list-deselected`, 'from_id':this.product.id});
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

