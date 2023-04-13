import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, AfterContentInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IProduct, Product } from 'src/app/entities/product/product.model';
import { ProductService } from 'src/app/entities/product/product.service';

import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TextService } from "src/app/shared/text.service";
import { Subscription } from 'rxjs';
import { Observable} from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

export interface StateGroup {
  letter: string;
  names: IProduct[];
}

export const _filter = (opt: IProduct[], value: IProduct | any): IProduct[] => {
  const filterValue = value.name ? value.name.toLowerCase() : value.toLowerCase();
  return opt.filter(item => item.name.toLowerCase().indexOf(filterValue) === 0);
};


// export class wordForm {
 
//   title = 'Angular Reactive forms';
 
//   constructor(private _formBuilder: FormBuilder) {


//   }
// }

@Component({
  selector: 'app-product-traverse',
  templateUrl: './product-traverse.component.html',
  styleUrls: ['./product-traverse.component.css']
})
export class ProductTraverseComponent implements OnInit, AfterContentInit {
  separatorKeysCodes: number[] = [ENTER, COMMA];

  subscription: Subscription | any;
  product_list: IProduct[] = [];
  product_phrase: IProduct[] = [];
  stateGroups: StateGroup[] = [];
  // inputControl: FormControl | any;
  productInputControl = new FormControl([null]);
  lexInputControl = new FormControl([null]);

  stateGroupOptions: Observable<StateGroup[]> | any;

  output = {'state':true, 'text':'test world'};
  // private products: InventoryService | any;
  // private logger: TextService | any;

  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement> | any;

  constructor(
    private _formBuilder: FormBuilder,
    private logger: TextService,
    protected productService: ProductService) {
  }

  stateForm = this._formBuilder.group({
    stateGroup: [null], //, { validators:[ Validators.required, Validators.minLength(4)]}],
  });

  // formControl = new FormControl(['angular']);

  addProductChip(event: MatChipInputEvent): void {
    const value = event.value;    
    // Add our fruit
    let selected_product: IProduct;

    if (value) {
      const in_list = this.product_list.filter(p => p.name.toLowerCase() === value.toLowerCase());
      const in_phrase = this.product_phrase.filter(p => p.name.toLowerCase() === value.toLowerCase());

      if(in_list.length > 0){
        selected_product = in_list[0];
      }else{
        selected_product = new Product(this.product_list.length, value, ['undefined'], new Date(), false, true);
      }

      if(in_phrase.length === 0) this.product_phrase.push(selected_product);
    }

  }

  removeProductChip(product: IProduct): void {
    const index = this.product_phrase.indexOf(product);
    if (index >= 0) {
      this.product_phrase.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    console.log('selected', event.option.value);
    if(!this.product_phrase.includes(event.option.value)){
      this.product_phrase.push(event.option.value);
    }
    this.productInput.nativeElement.value = '';
    this.productInputControl.setValue(null);
    // this.stateForm.controls['stateGroup'].setValue('');
  }

  dropProductChip(event: CdkDragDrop<IProduct[]> | any) {
    moveItemInArray(this.product_phrase, event.previousIndex, event.currentIndex);
  }

  caretPos: number = 0;

  getCaretPos(event: any) {
    const field = event.target;
    if (field.selectionStart || field.selectionStart == '0') {
       this.caretPos = field.selectionStart;
       this.output.text = `POS:${this.caretPos}`;
    }
  }

  //process asnyc and deferred load.
  updateProducts(products: IProduct[] | any): void {
    this.product_list = products;
    //this.logger.ez.set_text(JSON.stringify(this.product_list, null, '\t'), true);
    this.populateProductsAlphabetized();

    this.stateGroupOptions = this.productInputControl.valueChanges.pipe(
      startWith(null),
      map(value => this._filterGroup(value || null))
    );
  }

  //get products into form-input state.
  populateProductsAlphabetized(): void{
    if(this.product_list.length){
      const k_group: StateGroup[] = [];
      const k_chars = 'abcdefghijklmnopqrstuvwxyz';
      for(let i=0;i<k_chars.length;i++){
        const relevant = this.product_list.filter(p => p.name[0].toLowerCase().indexOf(k_chars[i]) !== -1 );
        if(relevant.length){
          const r_part = {
            'letter': k_chars[i].toUpperCase()+k_chars[i],
            'names': relevant //.map((r:IProduct | any) => {return `${r.name}`}), //{return `${r.name} (.${r.brand})`}),
          };
          k_group.push(r_part);
        }
      }
      this.stateGroups = k_group;

      // this.stateGroupOptions = this._filterGroup(null);
      // this.logger.ez.set_text(JSON.stringify(k_group, null, '\t'), true);
    }
  }

  validateMod(val: any):void{
    //this.logger.ez.set_text(JSON.stringify(this.stateGroups, null, '\t'), true);
  }

  ngOnInit(): void {
    this.logger.ez.set_text('ngOnInit product_traverse_init', true);
    this.subscription = this.productService.inventory.subscribe((products: IProduct[] | any) => this.updateProducts(products));
  }

  ngAfterContentInit(){
    this.logger.ez.set_text('ngAfterContentInit product_traverse_post_init', true);
  }

  private _filterGroup(value: IProduct | any): StateGroup[] {
    console.log('_filterGroup', `"${value}"`);

    if (value !== null) {
      const grp = this.stateGroups
        .map(group => ({letter: group.letter, names: _filter(group.names, value )}))
        .filter(group => group.names.length > 0);

      this.logger.ez.set_text(JSON.stringify(grp, null, '\t'), true);

      return grp;
    }
    
    return this.stateGroups;
  }

}
