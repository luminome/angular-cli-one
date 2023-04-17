import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ProductService } from 'src/app/entities/product/product.service';
import { IProduct, Product } from 'src/app/entities/product/product.model';
import { TextService } from "src/app/shared/text.service";
import { CommunicationsService } from 'src/app/shared/coms.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  {val:'ct', txt:'Contraction', id:9},
  {val:'det', txt:'Determiner', id:10},
  {val:'pn', txt:'Proper Noun', id:11},
];

export const ProductFieldNames = {
  'TopDefinition': ['meanings','meaning'],
  'Meaning': ['definitions','definition','synonyms','antonyms'],
  'Definition' : ['definition','example','synonyms','antonyms']
}

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css']
})
export class ProductCreateFormComponent implements OnInit, OnDestroy {
  public now = new Date();
  public parts_of_speech_list: any[] = PartsOfSpeech;

  // productForm: FormGroup | any;
  formState: string = 'new';

  name: string = '';
  brand: string = '';
  date: Date | any = null;
  active: boolean = true;

  error: boolean = false;
  errorMessage: string = 'general error';
  
  notify: boolean = false;
  notifyMessage: string = 'general notification';

  product: IProduct | any = null;
  buildingProduct: IProduct | any = null;

  postMethodState = 'Add';
  postMethodStates = ['Modify','Add'];

  inventoryListing: [] | any;

  formExternalUpdate = false;

  constructor(public logger: TextService,
    public productService: ProductService,
    public _formBuilder: FormBuilder,
    public coms: CommunicationsService
  ) { }

  productListSubscription: Subscription | any;
  products: IProduct[] = [];


  productCreateForm = this._formBuilder.group({
    name: new FormControl('', Validators.required),
    brand: new FormControl('', Validators.required),
    date: new FormControl(this.now, Validators.required),
    active: new FormControl('', Validators.required),
  });


  // serviceSelectedProduct: IProduct | any | null;

  // Init the form when starting the view.
  ngOnInit(): void {
    this.logger.ez.set_text('product_create_init', true);
    //this.inventory.currentMessage.subscribe((products: any) => this.inventoryListing = products)
    this.productService.selected.subscribe((product: IProduct | any) => this.registerSelectedProduct(product));
    
    this.productListSubscription = this.productService.inventory.subscribe((
      productList: IProduct[] | any | []) => this.products = productList);
    
    //this.productCreateForm.valueChanges.subscribe((value:any) => this.formChanged(value));

    this.productCreateForm.valueChanges
    .pipe(debounceTime(200), distinctUntilChanged())
    .subscribe(values => {
      this.talkBack(values,'form');
    });

    // merge(
    //   this.productCreateForm.controls['name'].valueChanges
    //     .pipe(
    //       debounceTime(1500),
    //       distinctUntilChanged(),
    //       map(value => ({ name: value }))
    //     ),
    //   this.productCreateForm.controls['brand'].valueChanges
    //     .pipe(
    //       debounceTime(1500),
    //       distinctUntilChanged(),
    //       map(value => ({ brand: value }))
    //     )
    // )
    // .subscribe(value => {
    //   this.talkBack(value, 'merge');
    // })

    //this.initForm();
  }



  talkBack(values: any, from:string):void{
    if(this.product !== null){
      Object.assign(this.product, values);
      console.log(this.product);
    }
  }

  registerSelectedProduct(product:IProduct | any | null): void{

    //previously no selection
    this.formExternalUpdate = true;
    //this.coms.log(`"${name_value}" appears to be a new word. You may need to define it.`, {'icon':'warning','state':'create'});


    if(product !== null){

      if(this.product === null && this.coms.coms_object.state === 'create-define'){
        if(product.real){
          this.coms.log(`"${product.name}" exists in the dictionary.`, {'level':'info', 'state':'create-existing','from_id':product.id, 'object':product.object});
        }else{
          this.coms.log(`"${product.name}" appears to be a new word. You will need to define it.`, {'level':'info', 'icon':'warning','state':'create-new','from_id':product.id, 'object':product.object});
        }
      }

      this.productCreateForm.patchValue(product);
      
      const exists = this.products.filter((m: IProduct) => m.name === product.name);
      this.postMethodState = this.postMethodStates[+(exists.length === 0)];
      if(exists){
        this.productCreateForm.controls['name'].disable();
        this.productCreateForm.controls['brand'].disable();
      }

      this.product = product;

      if(this.coms.state() === 'add-word-automated'){
        this.coms.state('submitted');
        this.onSubmit();
      }

      this.logger.ez.set_text(`create_form serviceSelectedProduct: ${product !== null ? product.name : null}`, true);
    }else{
      this.productCreateForm.reset();
      this.productCreateForm.controls['name'].enable();
      this.productCreateForm.controls['brand'].enable();
      this.productCreateForm.controls['date'].setValue(this.now);
      this.product = null;
    }
    
    this.formExternalUpdate = false;
  }



  ngOnChanges(): void {

  }

  ngOnDestroy(): void {

  }


  showError(message: string): void{
    this.error = true;
    this.errorMessage = message;
  }

  showNotify(message: string): void{
    this.notify = true;
    this.notifyMessage = message;
  }

  // Hide the error message.
  hideError() {
    this.error = false;
    this.errorMessage = '';
  }

  // Hide the error message.
  hideNotify() {
    this.notify = false;
    this.notifyMessage = '';
  }
  
  // Manage the submit action and create the new product.
  onSubmit() {
    if(this.postMethodState === 'Add'){
      if(!this.productCreateForm.valid) return;
    
      this.logger.ez.set_text(`creating name: ${this.product.name} (.${this.product.brand})`, true);

      this.productService.create(this.product).then((result: Product | any) => {
        if (result === undefined) {
          this.error = true;
        } else {
          this.error = false;        
          //this.showNotify(`Added entry for "${result.name}".`);

          this.coms.log(`manually added "${result.name}" to inventory.`, {'from_id':result.id});

          this.productCreateForm.reset();
          this.productService.setSelected(result);
        }
      });

    }else{

      this.productService.modify(this.product._id, this.product)
      .then((result: any) => { //confirmation of modify only
        console.log(result);

        this.coms.log(`modified: "${this.product.name} (.${this.product.brand})"`,
        {'icon':'check_circle_outline','state':`product-create-modify`,'object':result, 'from_id':this.product.id});

        this.productService.setSelected(this.product);
      })

    }
  }


  nameChanged(event:any){
    if(this.formExternalUpdate) return;

    const name_value = event.target.value;
    const exists = this.products.filter((m: IProduct) => m.name === name_value);

    if(exists.length > 0){
      this.coms.log(`The name "${exists[0].name}" already exists in the inventory.`, 
        {'level':'info', 'icon':'warning','state':'create-exists','from_id':exists[0].id});

        this.productCreateForm.controls['name'].setErrors({'nomatch': true});
      return;
    }else{
      this.error = false;
    }

    if(/[a-zA-Z]/.test(name_value)){
      this.logger.ez.set_text(name_value, true);
      this.productCreateForm.controls['name'].setErrors(null);
      this.buildingProduct = new Product(this.products.length, name_value, [], new Date(), false, false);
      this.coms.log(`seeking definition for "${name_value}"...`, 
        {'level':'info', 'icon':'warning','state':'create-define','from_id':this.buildingProduct.id});
      this.productService.setSelected(this.buildingProduct);
    }else{
      this.productCreateForm.controls['name'].setErrors({'nomatch': true});
      this.productCreateForm.controls['name'].setValue(null);
    }

    event.target.blur();
  }

  reset():void{
    this.product = null;
    this.productService.setSelected(null);
  }

}
