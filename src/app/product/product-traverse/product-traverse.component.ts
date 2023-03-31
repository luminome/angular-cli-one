import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, AfterContentInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { IProduct, Product } from 'src/app/entities/product/product.model';
import { InventoryService } from "src/app/shared/inventory.service";
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

  stateGroupOptions: Observable<StateGroup[]> | any;

  output = {'state':true, 'text':'test world'};
  // private products: InventoryService | any;
  // private logger: TextService | any;

  @ViewChild('productInput') productInput: ElementRef<HTMLInputElement> | any;

  constructor(private _formBuilder: FormBuilder,
    private products: InventoryService,
    private logger: TextService) {
  }

    // name: new FormControl(this.name, Validators.required),

  stateForm = this._formBuilder.group({
    stateGroup: [null] //, { validators:[ Validators.required, Validators.minLength(4)]}],
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

    // // Clear the input value
    // this.productInput.nativeElement.value = '';
    // this.productInput.select.value = null;
    // event.chipInput!.clear();
    // this.stateForm.controls['stateGroup'].selected = null;
    // this.productInputControl.setValue(null);
    // this.stateGroupOptions = this.stateGroups;
    // this.stateForm.get('stateGroup').setValue('');
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



  // removeProduct(product: IProduct) {
  //   const index = this.product_phrase.indexOf(product);
  //   if (index >= 0) {
  //     this.product_phrase.splice(index, 1);
  //   }
  // }

  // addProduct(event: MatChipInputEvent): void {
  //   // const value = (event.value);//.trim();

  //   // // Add our keyword
  //   // if (value) {
  //   //   this.product_list.push(event.value);
  //   // }

  //   // // Clear the input value
  //   // event.chipInput!.clear();
  // }

  // stateForm.control = ({
  //   stateGroup: new FormControl('stateGroup', Validators.required)
  // });

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



  // autoChange(event: any, field: any = null): void {
  //   this.logger.ez.set_text(JSON.stringify(this.stateGroups, null, '\t'), true);
  // }

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






    // constructor(private fb: FormBuilder) {
    //   this.control = fb.control({value: 'my val', disabled: true});
    // }
    


  validateMod(val: any):void{
    //this.logger.ez.set_text(JSON.stringify(this.stateGroups, null, '\t'), true);
  }

  ngOnInit(): void {
    this.logger.ez.set_text('ngOnInit product_traverse_init', true);
    this.subscription = this.products.currentMessage.subscribe((products: IProduct[] | any) => this.updateProducts(products));
    // this.stateGroupOptions = this.stateForm.get('stateGroup')!.valueChanges.pipe(
    // this.stateGroupOptions = this.productInputControl.valueChanges.pipe(
    //   startWith(null),
    //   map(value => this._filterGroup(value || null))
    // );


    //this.stateForm.group.control({value: 'stateGroup', disabled: true});

    // this._formBuilder['stateGroup'] = this.autoControl({value: 'stateGroup', disabled: true});

    // this._formBuilder.control({value: 'stateGroup', disabled: true});

    // this.autoControl
    // this._formBuilder.control({value: 'stateGroup', error: true});
    // this._formBuilder.control.setErrors({'nomatch': true});
    // this.productForm.controls['brand'].setErrors({'nomatch': true});
    //this.autoControl.valueChanges.subscribe((val:any) => this.validateMod(val));

    // this.productForm.get("name").valueChanges.subscribe((val:any) => {
    //   if (val) {
    //     this.now = new Date();
    //     // this.logger.ez.set_text('date changed.', true);
    //     this.productForm.controls['date'].setValue(this.now);
    //   }
    // });
    //this.autoControl.valueChanges(val)
      // this.logger.ez.set_text(JSON.stringify(this.stateGroups, null, '\t'), true)
  //   this.myControl = new FormControl();      
  //   this.myControl.valueChanges
  // .pipe(
  //   debounceTime(500),
  //   distinctUntilChanged(),
  //   takeUntil(this.ngUnsubscribe) // optional but recommended 
  // )
  // .subscribe(searchPhrase => check if empty);
    
    // _formBuilder.FormControl('this.name')
      
  }

  ngAfterContentInit(){
    // this.stateForm.controls['stateGroup'].setValue('');
    // this.stateForm.controls['stateGroup'].setErrors({'nomatch': true});
    this.logger.ez.set_text('ngAfterContentInit product_traverse_post_init', true);
  }

  private _filterGroup(value: IProduct | any): StateGroup[] {
    //const check_value = value.name ? value : 
    console.log('_filterGroup', `"${value}"`);

    if (value !== null) {
      const grp = this.stateGroups
        .map(group => ({letter: group.letter, names: _filter(group.names, value )}))
        .filter(group => group.names.length > 0);

    // if (value) {
    //   let kva: any;

    //   if(value.indexOf(' ') !== -1){
    //     const rk = value.split(' ');
    //     kva = rk[rk.length-1];
    //   }else{
    //     kva = value;
    //   }

    //   const grp = this.stateGroups
    //     .map(group => ({letter: group.letter, names: _filter(group.names, kva )}))
    //     .filter(group => group.names.length > 0);
      
      this.logger.ez.set_text(JSON.stringify(grp, null, '\t'), true);

      // if(grp.length === 1 && grp[0]['names'].length === 1){
      //   const the_product = grp[0]['names'][0]; //this.product_list.filter(p => p.name === grp[0]['names'][0])[0];

      //   this.logger.ez.set_text(grp[0]['names'][0], true);

      //   this.product_phrase.push(the_product);
      //   //this.inputControl.setValue('');

      //   this.stateForm.controls['stateGroup'].setValue('');

      //   //this.stateForm.controls['stateGroup'].setValue(grp[0]['names'][0]);
      // }


      
      return grp;
    }
    
    return this.stateGroups;
  }

}
