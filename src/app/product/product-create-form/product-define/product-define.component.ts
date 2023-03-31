import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IProduct, Product } from 'src/app/entities/product/product.model';
import { TextService } from "src/app/shared/text.service";
import { ITopDefinition, TopDefinition, IMeaning, Meaning, IDefinition, Definition } from 'src/app/entities/meaning/meaning.model';
import { ProductCreateFormComponent, PartsOfSpeech } from 'src/app/product/product-create-form/product-create-form.component'
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Subscription } from 'rxjs';
import { ProductService } from 'src/app/entities/product/product.service';


@Component({
  selector: 'app-product-define',
  templateUrl: './product-define.component.html',
  styleUrls: ['./product-define.component.css']
})
export class ProductDefineComponent implements OnChanges, OnInit
{

  @Input() preparingProduct: IProduct | any;
  @Input() createProductForm: FormGroup | any;

  product: IProduct | any = null;
  message: string = 'no word';
  
  // // productDefinitions: ITopDefinition[] = [];
  // productMeanings: IMeaning[] = [];
  // productDefinitions: ITopDefinition[] = [];
  // //test_definition: IDefinition[] = [];

  partsOfSpeech: [] | any = PartsOfSpeech;
  selectedPartsOfSpeech: [] | any = [];

  myvariable: any | null = 'varmint';

  // posSelectControl = new FormControl([null]);

  constructor(public _formBuilder: FormBuilder, public logger: TextService, public productService: ProductService) {}

  // productSubscription: Subscription | any;
  serviceSelectedProduct: IProduct | any | null;

  productDefineForm = this._formBuilder.group({
    posSelect: this.selectedPartsOfSpeech
  });

  // If a new product is being constructed, we deal with it.
  ngOnChanges(): void {
    if (this.preparingProduct !== null) {
      // console.log('ProductDefineComponent change', this.preparingProduct);
      // this.product = this.preparingProduct;
      // this.message = this.product.name;
      // const actualPOS = this.product.meta.f.map((fp:any) => PartsOfSpeech[fp.id]);
      // // const actualPOS = PartsOfSpeech.filter((p:any) => this.product.meta.f.map((fp:any) => fp.val).includes(p.val));
      // // console.log(this.product.meta.f, actualPOS);
      // this.productDefineForm.controls.posSelect.setValue(actualPOS);
    }else{
      this.message = 'no message';
    }
  }


  ngOnInit(): void {
    this.productService.selected.subscribe((product: IProduct | any | null) => this.registerSelectedProduct(product));
    // const testMeaning = new Meaning({val:'v', txt:'Verb'});
    // const def_1 = new Definition('as of yet undefined', 'no working example.');
    // const def_2 = new Definition('as of yet undefined');
    // testMeaning.definitions = [def_1, def_2];
    // const testTopDefinition = new TopDefinition('testing', [testMeaning]);
    // this.productDefinitions.push(testTopDefinition);
    // this.logger.ez.set_text(JSON.stringify(this.productDefinitions, null, '\t'), true);      
  }

  registerSelectedProduct(product:IProduct | any | null): void{
    if (product !== null) {
      this.serviceSelectedProduct = product;
      this.product = product;
      this.message = this.product.name;
      const actualPOS = this.product.meta.f.map((fp:any) => PartsOfSpeech[fp.id]);
      this.productDefineForm.controls.posSelect.setValue(actualPOS);
      this.productDefineForm.controls.posSelect.disable();
    }else{
      this.product = null;
    }
    this.logger.ez.set_text(`define_form serviceSelectedProduct: ${product !== null ? product.name : null}`, true);
  }

  
  createFormUpdate(){

    //productDefinitions
    // this.selectedPartsOfSpeech = this.product.meta.f;///this.product.def.map(d => d.map(m=>m.partOfSpeech);
    // console.log(this.selectedPartsOfSpeech);
    //this.productDefineForm.controls.posSelect.setValue(this.product.meta.f);

    // this.productDefineForm.controls.posSelect.setValue(this.product.meta.f);
    // const posByVal = this.productMeanings.map(m => m.partOfSpeech.val);
    // this.createProductForm.controls['brand'].setValue(posByVal);

  }


  formSelectPartOfSpeech(event: MatButtonToggleChange):void {
    console.log(event.source.value, event.value);

    // const part = event.source.value;
    // if(!this.selectedPartsOfSpeech.includes(part)){
    //   this.logger.ez.set_text(JSON.stringify(part, null, '\t'), true);  
    //   //this.productMeanings.push(new Meaning(this.product.name, part, [new Definition('undefined', 'no example')]));
    // }
    // this.createFormUpdate();
  }

  formAddMeaning():void{
    //this.productMeanings.push(new Meaning('test'));
  }

  formDeleteMeaning(meaning: IMeaning):void{
    console.log(this.productDefineForm.value);

    // const index = this.productMeanings.indexOf(meaning);
    // if (index >= 0) {
    //   this.productMeanings.splice(index, 1);
    //   this.createFormUpdate();
    // }
  }

  formAddDefinition(meaning: IMeaning):void{
    // //this.productMeanings.push(new Meaning('test'));
    // this.test_definition.push(new Definition('undefined', 'no example'));
  }

  formADeleteDefinition(meaning: IMeaning, definition: IDefinition):void{
    const index = meaning.definitions!.indexOf(definition);
    if (index >= 0) {
      meaning.definitions!.splice(index, 1);
    }
    console.log(this.product.def);
  }



  definitionChanged(event: any, meaning: IMeaning, definition: IDefinition, field: string){
    definition[field] = event.target.value;
    console.log(event.target.value, meaning, definition, field);
    return false;
  }

  onSubmit() {
    return false;
  }
}
