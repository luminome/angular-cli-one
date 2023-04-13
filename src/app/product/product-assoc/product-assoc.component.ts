import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProductService, dtf } from 'src/app/entities/product/product.service';
import { IProduct, Product } from 'src/app/entities/product/product.model';
import { CommunicationsService } from 'src/app/shared/coms.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { ITopDefinition, TopDefinition, IMeaning, Meaning, IDefinition, Definition, get_id } from 'src/app/entities/meaning/meaning.model';


export interface productAssoc {
  letter: string;
  product: string;
  product_clean: string;
  index: number;
  char_index: number;
  relative: IProduct[] | any | undefined;
  relative_meta?: [] | undefined;
  selected: boolean;
  brand?: object;
  lookup_value?: string[] | undefined;
  k_hot?: boolean | undefined;
}


@Component({
  selector: 'app-product-assoc',
  templateUrl: './product-assoc.component.html',
  styleUrls: ['./product-assoc.component.scss']
})
export class ProductAssocComponent {

  constructor(
    protected _formBuilder: FormBuilder,
    protected coms: CommunicationsService,
    protected productService: ProductService) {
  }

  @ViewChild('productInput') productAssocField!: ElementRef;
  productAssocFieldDelta = false;

  separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
  output = {'pos':0, 'product':'', 'phrase':'', 'state':true, 'text':'test world', 'lex':'null', 'info':'none', 'auto':''};
  caretPos: number = 0;
  products: IProduct[] = [];
  associations: productAssoc[] = [];
  phraseDelta: string[] = [];

  selectedDefinition: number | null = null;
  selectedMeaning: number | null = null;
  selectedDefOutput: IMeaning | null = null;

  productAssocForm = this._formBuilder.group({
    lex: new FormControl('', Validators.required),
  });


  // Init the form when starting the view.
  ngOnInit(): void {
    this.productService.inventory.subscribe((productList: IProduct[] | any | []) => this.setInventory(productList));
    this.productService.selected.subscribe((product: IProduct | any) => this.activateProduct(product));
    this.productAssocForm.controls['lex'].valueChanges.subscribe((value: string | any | []) => this.readInput(value));

    console.log('coms_state', this.coms.state());
    // this._eventService.events$.source['_value'] 
  }

  setInventory(inventory:IProduct[] | any):void{
    this.products = inventory;
    console.log('assoc inventory updated.');
    this.handleInput(null);
  }

  activateProduct(product: IProduct | any):void {
    if(product!==null && this.selectedDefinition !== null && this.selectedMeaning !== null){
      

      this.selectedDefOutput = product.def[this.selectedDefinition].meanings[this.selectedMeaning];
      console.log('selectedDefOutput', this.selectedDefOutput);
      // this.selectedDefinition = def;//product.relative_meta[def]['id'];
      // this.selectedMeaning = cond;//track['id'];

      // console.log(product.relative);
      //this.selectedDefOutput = product.relative.def[def].meanings[cond];
    }
  }

  strSplice:string|any = (str:string, start:number, len:number, insertString:string = '') => 
    str.substring(0,start) + insertString + str.substring(start + len, str.length);



  indices:[]|any = (c:string, s:string) => s
    .split('')
    .reduce((a:[]|any, e, i:number) => e === c ? a.concat(i) : a, []);

  // Loop equality
  diffArray3:[]|any = (a1:[], a2:[]) => {
    let aDiffs:number[] = [];
    for (let i=0; i<a1.length; ++i) {
      if (a1[i] !== a2[i]) {
        aDiffs.push(i);
      }
    }
    return aDiffs;
  };


  readInput(value: string | any){
    // const va:string[] = value.trimEnd().split(' ');
    // this.output.lex = va.filter(v => v !== '').toString();
    // const autoWord = va[va.length-1];
    this.productAssocFieldDelta = true;
  }

  handleInput(event: any | null) {
    if(!this.productAssocField) return;

    const field = this.productAssocField.nativeElement;

    if(event !== null){
      this.output.info = `"${event.key}"`;
      if(event.key === ' ') this.output.info = '*Space';
      const spaced = field.value[field.value.length-1] === ' ';
      if(event.key === 'Enter' && spaced) return;
      if(event.key === 'Enter' && !spaced) field.value += ' ';
      console.log(event.key);
    }

    if (field.selectionStart || field.selectionStart == '0') {
       this.caretPos = field.selectionStart;
       this.output.pos = this.caretPos;
    }

    const phraseArray:string[] = field.value.trimEnd().split(' ').filter((v:string) => v !== '');
    const k_sto = this.indices(' ', field.value);
    const kxl = k_sto.filter((n:number, i:number) => this.caretPos > n);
    const k_pos = k_sto.indexOf(kxl.pop())+1;

    this.output.product = phraseArray[k_pos] ? `${phraseArray[k_pos]}` : '';
    this.output.phrase = `${phraseArray.join('-')}`;
    this.output.auto = `${phraseArray[k_pos]} ${k_sto}`;

    let char_pos:number = 0;
    const assoc = phraseArray.map((prod:string, i:number) => {
      const str_prod = prod.replace(/[^\w\s\']|_/g, "").replace(/\s+/g, " ");
      const part = {
        letter: prod.substring(0,1),
        product: prod,
        product_clean: str_prod,
        index: i,
        char_index: char_pos,
        relative: this.products.find((p:IProduct) => p.name === str_prod || undefined),
        // || str_prod.indexOf(p.name) === 0) 
        selected: k_pos === i,
      }
      char_pos += (prod.length+1);
      return part;
    })

    const init_len = this.phraseDelta.length;
    const news_len = phraseArray.length;
    const diff = this.diffArray3(phraseArray, this.phraseDelta);

    // one two three four five six seven eight
    if(init_len > news_len){ //remove
      this.associations.splice(diff[0], init_len - news_len);
    }else if(init_len < news_len){ //add
      const kpf = assoc.slice(diff[0], diff[0]+(news_len-init_len));
      this.associations.splice(diff[0], 0, ...kpf);
    }

    assoc.map((a:productAssoc, i:number) => {
      if(a.relative !== undefined) a.relative_meta = dtf(a.relative.meta.m, []);

      if(!this.associations[i]){
        this.associations.push(a);
      }else{
        Object.assign(this.associations[i], a);
      }

      

      if(!this.associations[i].selected && !this.associations[i].relative && !this.associations[i].k_hot){
        console.log('undefined', this.associations[i].product_clean);
        const k_prod = new Product(this.products.length, assoc[i].product_clean, [], new Date(), false, false);
        this.associations[i].k_hot = true;
        this.productService.defineAndSaveSelected(k_prod).then((p:void | IProduct) => a.relative = p);


        //console.log(this.coms.state('add-word-automated'));
        //this.productService.setSelected(k_prod);
      }
      // if(i > 0 && !assoc[i-1].relative && !this.associations[i-1].k_hot){
      //   this.associations[i-1].k_hot = true;
      //   console.log(this.coms.state('add-word-'+assoc[i-1].product_clean));
      //   const k_prod = new Product(this.products.length, assoc[i-1].product_clean, [], new Date(), false, false);
      //   console.log(this.coms.state('add-word-automated'));
      //   this.productService.setSelected(k_prod);
      // }
      // if(news_len > init_len && init_len > 0) console.log(this.coms.state('add-word-'+this.phraseDelta[init_len-1]));
      // console.log(this.associations[i]);
    })

    this.phraseDelta = phraseArray;
  }

  handleProductCardSelect(event: any, product:productAssoc):void{
    //const card = event.target;
    const field = this.productAssocField.nativeElement;
    //card.closest('.card').classList.add('card-selected');

    this.associations.map((a:productAssoc) => (a.selected = a === product) );

    product.k_hot = true;

    field.focus();
    field.selectionStart = product.char_index;
    field.selectionEnd = field.selectionStart+product.product.length+1;

    console.log(product);
  }

  dropProductCard(event: CdkDragDrop<productAssoc[]> | any) {
    moveItemInArray(this.associations, event.previousIndex, event.currentIndex);
    const field = this.productAssocField.nativeElement;
    const new_str = this.associations.map((p: productAssoc) => p.product).join(' ');
    field.value = new_str;
    this.handleInput(null);
  }

  removeProductCard(product: productAssoc): void {
    const field = this.productAssocField.nativeElement;
    const the_value = this.strSplice(field.value,product.char_index, product.product.length+1);
    field.value = the_value;
    this.handleInput(null);
    // const index = this.associations.indexOf(product);
    // if (index >= 0) {
    //   this.associations.splice(index, 1);
    // }
  }


  isArrayInArray(source:[]|any, search:[]|any) {
    for (var i = 0, len = source.length; i < len; i++) {
        if (source[i][0] === search[0] && source[i][1] === search[1]) {
            return true;
        }
    }
    return false;
  }

  handleAddPhrase(event: any | null):void{
    const products_lexic: any[] = [];
    const shlex:string[] | any = (p:productAssoc | any) => p.lookup_value ? p.lookup_value : [p.product_clean];
    const products:IProduct[] = [];

    this.associations.map((p: productAssoc, i:number) => {
      const lex = shlex(p);
      products_lexic.push(lex);

      const k_par: any[] = p.relative.parents;
      const k_chi: any[] = p.relative.children;

      if(i > 0) {
        const pre = shlex(this.associations[i-1]);
        if(!this.isArrayInArray(k_par, pre)) k_par.push(pre);
      }

      if(i < this.associations.length-1) {
        const pre = shlex(this.associations[i+1]);
        if(!this.isArrayInArray(k_chi, pre)) k_chi.push(pre);
      }

      p.relative.parents = k_par;
      p.relative.children = k_chi;

      products.push(p.relative);
      // console.log(i,lex,k_par,k_chi);
    });

    const object = {'products':products_lexic};
    const text = this.productAssocField.nativeElement.value;
    this.coms.log(text, {'state':'association-phrase','icon':'check_circle_outline', 'object':object});
    this.productService.set_assoc(products)
    .then((result:any) => this.coms.log(`updated associations`, {'level':'info', 'state':'association-phrase-imply','icon':'check_circle_outline', 'object':result}));
  }


  updateProductCard(event:any, product:productAssoc, def:number, cond:number) {
    //event.source.value.id
    //MatButtonToggleChange
    // product.k_hot = false;

    // const track = product.relative_meta ? product.relative_meta[def]['v'][cond] : undefined;
    // const ref = event.target.closest('.card-def');
    // ref.querySelector('.card-button').classList.add('fired');

    if(product.relative_meta){
      const track = product.relative_meta[def]['v'][cond];
      product.brand = track['id'];

      this.selectedDefinition = def;//product.relative_meta[def]['id'];
      this.selectedMeaning = cond;//track['id'];

      product.lookup_value = [
        product.product_clean,
        track['v'][0],
        product.relative.id,
        product.relative_meta[def]['id'],
        product.brand
      ]

      // console.log(product.relative);
      //this.selectedDefOutput = product.relative.def[def].meanings[cond];
      this.productService.setSelected(product.relative);

    }
    
    console.log(event, product.brand);


    // const index = this.associations.indexOf(product);
    // const a_product = this.associations[index];
    
    // a_product.brand = event.value;
    // a_product.k_hot = false;

    // console.log('a', a_product);
    // a_product.brand = event.value;
    // a_product.parts_of_speech = ['test'];

    // console.log(event.value, a_product);
    
    // const ref = event.target.closest('.card-def');
    // ref.querySelector('.card-button').classList.add('fired');

    //console.log(ref,ref.querySelector('.card-button'),ref.querySelectorAll('.card-button'));//, event.source.nativeElement.parentNode);
    
    //ref.childNodes[0].ClassList.add('fired');

    //this.output.phrase = `${product.brand}`;//.toString();
  }
}
