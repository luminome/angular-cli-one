import { Component, OnInit, OnDestroy, OnChanges, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'src/app/entities/product/product.service';
import { IProduct, Product } from 'src/app/entities/product/product.model';
import { InventoryService } from "src/app/shared/inventory.service";
import { TextService } from "src/app/shared/text.service";
import { Subscription } from 'rxjs';
import { ProductDefineComponent } from './product-define/product-define.component';
import { TopDefinition } from 'src/app/entities/meaning/meaning.model';


export const PartsOfSpeech = [
  {val:'n', txt:'Noun', id:0},
  {val:'v', txt:'Verb', id:1},
  {val:'adv', txt:'Adverb', id:2},
  {val:'adj', txt:'Adjective', id:3},
  {val:'c', txt:'Conjunction', id:4},
  {val:'int', txt:'Interjection', id:5},
  {val:'pron', txt:'Pronoun', id:6},
  {val:'prep', txt:'Preposition', id:7},
  {val:'num', txt:'Numeral', id:8},
];

export const auxPartsOfSpeech = {
  'noun': {val:'n', txt:'Noun', id:0},
  'verb': {val:'v', txt:'Verb', id:1},
  'adverb': {val:'adv', txt:'Adverb', id:2},
  'adjective': {val:'adj', txt:'Adjective', id:3},
  'conjunction': {val:'c', txt:'Conjunction', id:4},
  'interjection': {val:'int', txt:'Interjection', id:5},
  'pronoun': {val:'pron', txt:'Pronoun', id:6},
  'preposition': {val:'prep', txt:'Preposition', id:7}
}




@Component({
  selector: 'app-product-create-form',
  templateUrl: './product-create-form.component.html',
  styleUrls: ['./product-create-form.component.css']
})
export class ProductCreateFormComponent implements OnInit, OnDestroy {
  public now = new Date();
  public parts_of_speech_list: any[] = PartsOfSpeech;


  // public parts_of_speech_list: any[] = [
  //   {val:'n', txt:'Noun'},
  //   {val:'v', txt:'Verb'},
  //   {val:'adv', txt:'Adverb'},
  //   {val:'adj', txt:'Adjective'},
  //   {val:'c', txt:'Conjunction'},
  //   {val:'int', txt:'Interjection'},
  //   {val:'pron', txt:'Pronoun'},
  //   {val:'prep', txt:'Preposition'},
  //   {val:'g', txt:'Gerand'}
  // ];



  productForm: FormGroup | any;
  formState: string = 'new';
  name: string = '';
  brand: string = '';
  date: Date | any = null;
  active: boolean = true;
  error: boolean = false;
  errorMessage: string = 'general error';
  
  product: IProduct | any = null;
  buildingProduct: IProduct | any = null;

  inventoryListing: [] | any;
  inventorySubscription: Subscription | any;

  // @Output() createdProduct = new EventEmitter<IProduct>();
  // @Input() listSelectedProduct: IProduct | any;

  // @Output() preparingProduct = new EventEmitter<IProduct>();
  // @Input() products: IProduct[] = [];

  constructor(public logger: TextService,
    public productService: ProductService,
    public formBuilder: FormBuilder,
    public inventory: InventoryService,
  ) { }

  productSubscription: Subscription | any;
  serviceSelectedProduct: IProduct | any | null;

  // Init the form when starting the view.
  ngOnInit(): void {
    this.logger.ez.set_text('product_create_init', true);
    this.initForm();
    this.inventorySubscription = this.inventory.currentMessage.subscribe((products: any) => this.inventoryListing = products)
    this.productService.selected.subscribe((product: IProduct | any | null) => this.registerSelectedProduct(product));
  }

  registerSelectedProduct(product:IProduct | any | null): void{

    this.productForm.controls['name'].setValue(product !== null ? product.name : null);    
    this.productForm.controls['brand'].setValue(product !== null ? product.brand : null);    
    this.productForm.controls['date'].setValue(product !== null ? product.date : null);    
    this.productForm.controls['active'].setValue(product !== null ? product.active : null);

    if(product !== null && Array.isArray(product.meta.f)){
      const actualPOS = product.meta.f.map((fp:any) => fp.val);
      this.productForm.controls['brand'].setValue(actualPOS);
      product.brand = actualPOS;
    }

    this.product = product;
    this.logger.ez.set_text(`create_form serviceSelectedProduct: ${product !== null ? product.name : null}`, true);
  }



  ngOnChanges(): void {
    // called by input and output
    // console.log('something changed');

    // if(this.listSelectedProduct !== null){
    //   this.productService.get_definitions(this.listSelectedProduct)
    //   .then((result: object | any) => {
    //     console.log(result);

    //     this.listSelectedProduct['def'] = result[0].definition.map((s: any, i:number) => {
    //       const telly = new TopDefinition(s.word, s.meanings);
    //       telly.populateBase();
    //       return telly;
    //     })

    //     this.buildingProduct = this.listSelectedProduct;
    //   });
    // }
  }

  ngOnDestroy() {
    this.inventorySubscription.unsubscribe();
  }

  // track definitive change to field value. (not incremental).: now for input or mat-select.
  formFieldChanged(event: any) {
    const field_name = event.target ? 'name' : 'brand';
    const field_value = event.target ? event.target.value : event.value;
    console.log(field_name, field_value, this.serviceSelectedProduct);

    if(field_name === 'name'){
      const exists = this.inventoryListing.filter((m: any) => m.name === field_value);

      if(exists.length > 0){
        this.error = true;
        this.errorMessage = `The name "${exists[0].name}" already exists in the inventory.`;
        this.productForm.controls['name'].setErrors({'nomatch': true});
        return;
      }else{
        if(/[a-zA-Z]/.test(field_value)){

          this.buildingProduct = new Product(this.inventoryListing.length, this.productForm.value['name'], [], new Date(), false, false);
          this.productService.setSelected(this.buildingProduct);
          //this.defineWord(field_value);
        }else{
          this.productForm.controls['name'].setErrors({'nomatch': true});
          this.productForm.controls['name'].setValue(null);
        }
      }
    }
  }

  // Hide the error message.
  hideError() {
    this.error = false;
    this.errorMessage = '';
  }
  /*
  //a definition was found for this word
  definedWord(result: object | any){
    const fw = ['word', 'meanings','partOfSpeech','definitions','definition','example','synonyms','antonyms'];
    const scan = (obj: any) => {
      Object.entries(obj).forEach(([key, val]) => 
        (val && typeof val === 'object' && !Array.isArray(obj[key]) && (fw.includes(key) || !isNaN(parseInt(key)) )) && scan(val) ||
        (val && (Array.isArray(obj[key]) && obj[key].length > 0) && (fw.includes(key) || !isNaN(parseInt(key)) )) && scan(val) ||
        (val === null || val === "" || (Array.isArray(val) && val.length === 0) || (!fw.includes(key) && isNaN(parseInt(key)))) && delete obj[key]
      );
      return obj;
    }

    if(result){
      this.buildingProduct = new Product(this.inventoryListing.length, result.word, result.brand, new Date(), true, true);
      // this.buildingProduct['pos'] = result.pos;
      const scanned = scan(result.def);
      this.buildingProduct['def'] = scanned.map((s: any, i:number) => {
        const telly = new TopDefinition(s.word, s.meanings);
        telly.populateBase();
        return telly;
      })
      this.buildingProduct.setMeta();
    }else{
      this.buildingProduct = new Product(this.inventoryListing.length, this.productForm.value['name'], [], new Date(), false, false);
      this.formState = 'new';
    }
  }

  
  // callback is forcibly on this function;
  // gets word definition from dictionary api.
  // finds part-of-speech of word and changes value of "brand" field accordingly.
  defineWord(word: string){
    const pos_filter = (pos: string) => PartsOfSpeech.filter(p => p.txt.toLowerCase() === pos)[0].val || null;

    this.productService.define(word).then((result: object | any) => {
      if (result === undefined) {
        this.error = true;
        this.errorMessage = result;
      } else {
        this.error = false;
        //this.logger.ez.set_text(JSON.stringify(result, null, '\t'), true);
        const pos : any[] = [];
        const posOrdered : any[] = [];
        
        if(Array.isArray(result[0].raw)) {
          result[0].raw.map((def: any, i: number) => {
            posOrdered[i] = [];
            def.meanings.map((m: any) => {
                pos.push(m.partOfSpeech);
                posOrdered[i].push(pos_filter(m.partOfSpeech));
            })
          });

          const k_set = [...new Set([...pos])];
          this.logger.ez.set_text(k_set, true);
          const brand = k_set.map(k => pos_filter(k));
          this.productForm.controls['brand'].setValue(brand);
          return this.definedWord({word:word, brand:brand, pos:posOrdered, def:result[0].raw});

        }else{
          //no definitions available
          this.error = true;
          this.errorMessage = `No definitions available for "${word}".`;
          this.productForm.controls['brand'].setValue(null);
        }
      }
      return this.definedWord(false);
    });
  }
  */ 
  // Manage the submit action and create the new product.
  onSubmit() {
    if(!this.productForm.valid) return;

    // let product: IProduct;

    // if(this.buildingProduct !== null){
    //   product = this.buildingProduct;
    // }else{
    //   product = new Product(
    //     this.inventoryListing.length+1,
    //     this.productForm.value['name'],
    //     this.productForm.value['brand'],
    //     this.productForm.value['date'],
    //     this.productForm.value['active'],
    //     false
    //     );

    //     product['pos'] = ['no positional data'];
    //     product['def'] = [{'word':product['name'], 'definitions':'no definition available'}];

    // }
   
    this.logger.ez.set_text(`creating name: ${this.product.name} (.${this.product.brand})`, true);

    this.productService.create(this.product).then((result: Product | any) => {
      if (result === undefined) {
        this.error = true;
      } else {
        this.error = false;
        this.logger.ez.set_text(`c daisies`, true);
        
        //this.createdProduct.emit(result);
        this.productForm.controls['name'].setValue(null);
        this.productForm.controls['brand'].setValue(null);
        //this.buildingProduct = null;
        this.productService.setSelected(result);
      }
    });
  }

  // Init the creation form.
  private initForm() {
    this.productForm = new FormGroup({
      name: new FormControl(this.name, Validators.required),
      brand: new FormControl(this.brand, Validators.required),
      date: new FormControl(this.date, Validators.required),
      active: new FormControl(this.active, Validators.required),
    });

    this.productForm.get("name").valueChanges.subscribe((val:any) => {
      if (val) {
        this.now = new Date();
        this.productForm.controls['date'].setValue(this.now);
      }
    });

    this.productForm.controls['date'].setValue(this.now);
  }

}
