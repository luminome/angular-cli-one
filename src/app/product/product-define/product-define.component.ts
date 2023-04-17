import { Directive, Component, Input, ViewChild, ElementRef, OnChanges, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { IProduct, Product } from 'src/app/entities/product/product.model';
import { TextService } from "src/app/shared/text.service";
import { ITopDefinition, TopDefinition, IMeaning, Meaning, IDefinition, Definition, get_id } from 'src/app/entities/meaning/meaning.model';
import { PartsOfSpeech, ProductFieldNames } from 'src/app/product/product-create/product-create.component'
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Subscription } from 'rxjs';
import { ProductService } from 'src/app/entities/product/product.service';
import { CommunicationsService } from 'src/app/shared/coms.service';






@Component({
  selector: 'app-product-define',
  templateUrl: './product-define.component.html',
  styleUrls: ['./product-define.component.scss']
})
export class ProductDefineComponent implements OnChanges, OnInit, AfterViewInit
{

  
  // @Input() preparingProduct: IProduct | any;
  // @Input() createProductForm: FormGroup | any;

  public product: IProduct | any = null;
  public message: string = 'no word';
  

  topDefinitions: ITopDefinition[] = [];
  topDefinitionMeanings: IMeaning[] = [];

  editorTopDefinition: string | any | '' = 'ALL';
  editorTarget: string | any | '';
  editorAttributes: string[] | any | [] = [];
  editorInput: string | any | '' = '';

  editor: { [key: string]: any | null } | any = {
    input_dom_target: null,
    instance: null,
    instance_type: null,
    parent_instance: null,
    attribute: null,
    attributes_available: this.editorAttributes,
    value: null,
    requestedUnsetField: false,
    reset (c:any) {
      this.instance_type = this.instance.hasOwnProperty('definitions') ? 'Meaning' : 'Definition';
      const real_keys = Object.keys(this.instance).filter(k => this.instance[k] !== undefined && this.instance[k] !== null);
      this.attributes_available = ProductFieldNames[this.instance_type].filter((d:any) => !real_keys.includes(d));
    },
  };

  partsOfSpeech: [{}] | any = PartsOfSpeech;
  selectedPartsOfSpeech: [] | any = [];

  selectedDefinitions: [] | any = ['ALL'];
  defs_filter_: [] | any = [];
  meanings_filter_: [] | any = [];

  definitionsEditMode:boolean = false;
  definitionsChanged:boolean = false;

  lastInteraction = 'init';
  hideDefinitions = false;

  public showDefs = false;

  constructor(
    public _formBuilder: FormBuilder, 
    public logger: TextService, 
    public productService: ProductService,
    public coms: CommunicationsService) {}

  @ViewChild('lineEditorAttributes') lineEditorAttributes!: ElementRef;
  @ViewChild('lineEditorField') lineEditorField!: ElementRef;

  @ViewChild('defTopLevel', {static: false}) definitionTopLevel!: ElementRef;

  // @ViewChild('defTopLevel') set ft(definitionTopLevel: ElementRef ) {
  //     console.log(definitionTopLevel);
  // };


  serviceSelectedProduct: IProduct | any | null;

  productDefineForm = this._formBuilder.group({
    posSelect: new FormControl(this.selectedPartsOfSpeech),
    defSelect: this.selectedDefinitions,
    lineEditorField: new FormControl(this.editor.value, [Validators.minLength(1), Validators.required]),
  });

  ngOnChanges(): void {
    console.log("change");
  }


  ngOnInit(): void {
    //this.productService.selected.subscribe((product: IProduct | any | null) => this.registerSelectedProduct(product));
    //this.productDefineForm.controls['defSelect'].valueChanges.subscribe((value:any) => this.formSelectDefinition(value));
    this.productDefineForm.controls['lineEditorField'].disable();
    this.directPrepareProduct();
    //this.productService.selected.subscribe((product: IProduct | any | null) => this.registerSelectedProduct(product));
  }

  ngAfterViewInit() {
    // console.log(this.editor);
    // this.directPrepareProduct();
  }


  directPrepareProduct():void {

    const defs_list = this.product.def.map((def:any, i:number) =>{ return {'word': def.word, 'id':def.id, 'label':i+1} });
    this.selectedDefinitions = [{'word': this.product.name, 'id':'ALL', 'label':'ALL'}, ...defs_list];

    if(this.definitionsEditMode){
      const selected_def = this.lastInteraction === 'add definition' ? this.selectedDefinitions[this.selectedDefinitions.length-1] : this.selectedDefinitions[1];
      this.editorTopDefinition = selected_def.id;
      this.productDefineForm.controls['defSelect'].setValue([selected_def.id]);
      this.formSelectDefinition(selected_def, null);
    }else{
      if(this.editorTopDefinition === 'ALL'){
        this.productDefineForm.controls['defSelect'].setValue(['ALL']);
        this.formSelectDefinition(this.selectedDefinitions[0], null);
      }
    }
    
  }



  formSelectDefinition(def: ITopDefinition | null, event: any | null):void {
    this.editorTopDefinition = def?.id;

    if(event!==null){
      
      if(this.definitionsEditMode && def?.id === 'ALL') return;
      // clear selected partsOfSpeech.
      const prek = event.target.closest('.product-buttons');
      const has_selection = prek.querySelectorAll('.button-select');
      [...has_selection].forEach((s:HTMLElement) => s.classList.remove('button-select'));
      // reset def-selection
      this.productDefineForm.controls['defSelect'].setValue([this.editorTopDefinition]);
    }
    const meta = this.editorTopDefinition === 'ALL' ? this.product.meta.f : this.product.meta.m[this.editorTopDefinition];
    this.defs_filter_ = this.editorTopDefinition === 'ALL' ? this.selectedDefinitions.map((d:any) => d.id): [this.editorTopDefinition];

    this.meanings_filter_ = [];
    this.defs_filter_.map((d:string) => {
      if(d !== 'ALL') this.meanings_filter_.push(...Object.keys(this.product.meta.m[d]));
    });

    if(meta){
      const def_pos = Object.values(meta).map((pos:any) => this.partsOfSpeech[pos['id']]);
      this.productDefineForm.controls['posSelect'].setValue(def_pos);
    }

  }


  formSelectPartOfSpeech(pos: any, event:any):void {

    // disable deselection:
    const current_ = this.productDefineForm.controls['posSelect'].getRawValue();
    current_.push(pos);
    this.productDefineForm.controls['posSelect'].setValue(current_);

    // deselect other pos's:
    const prek = event.target.closest('mat-button-toggle-group');
    const has_selection = prek.querySelectorAll('.button-select');
    [...has_selection].forEach((s:HTMLElement) => s.classList.remove('button-select'));

    if(this.definitionsEditMode){
        this.definitionsChanged = true;
        const topDef = this.product.def.filter((d:any) => d.id === this.editorTopDefinition)[0];
        const def_index = this.product.def.indexOf(topDef);
        const meaning = new Meaning(pos, [new Definition('Undefined')]);
        topDef.meanings.push(meaning);
        this.product.meta.m[topDef.id!][meaning.id!] = pos;

        this.product.meta.f.push(pos);
        //this.defs_filter_ = [topDef.id!];
        // this.meanings_filter_ = [meaning.id!];
        this.meanings_filter_.push(meaning.id!);

        this.lastInteraction = 'add meaning';
        
        this.coms.log(`defined new "${pos.txt}(.${pos.val})" on definition (${def_index+1}). of "${this.product.name}".`, {'from_id':this.product.id, 'state':'define-meaning','icon':'check_circle_outline'});
        this.directPrepareProduct();

        console.log(this.product.meta);
        //this.productService.setSelected(this.product);

    }else{

      //const def_filter_:any = [];
      this.defs_filter_ = [];
      this.meanings_filter_ = [];

      const in_def = Object.keys(this.product.meta.m).map((def:any) => {
        const rtel = Object.entries(this.product.meta.m[def]).filter((d:any) => d[1].val === pos.val);
        if(rtel.length){
          this.defs_filter_.push(def);
          this.meanings_filter_.push(...rtel.map((r:any) => r[0]));
        } 
      });

      this.productDefineForm.controls['defSelect'].setValue(this.defs_filter_);

    }

    if(event.target.classList.contains('button-select')){
      event.target.classList.remove('button-select');
    }else{
      event.target.classList.add('button-select');
    }
   



    // if (this.product !== null) {

    //   const meta = this.product.meta.m[this.editorTopDefinition];
    //   const def_pos = Object.values(meta).map((pos:any) => this.partsOfSpeech[pos['id']]);
    //   const defined = def_pos.find((item:any) => item.id === event.source.value.id);
    //   const toDefNumber = this.selectedDefinitions.find((item:any) => item.id === this.editorTopDefinition);

    //   if(defined){
    //     this.productDefineForm.controls['posSelect'].setValue(def_pos);
    //     this.coms.log(`"${defined.txt}(.${defined.val})" already exists within definition (${toDefNumber.i+1}).`, {'state':'define-meaning-defined','icon':'warning'});
    //   }else{
    //     this.coms.log(`define new "${event.source.value.txt}(.${event.source.value.val})" on definition (${toDefNumber.i+1}). of "${this.product.name}".`, {'from_id':this.product.id, 'state':'define-meaning','icon':'check_circle_outline'});

    //     const topDef = this.product.def.filter((d:any) => d.id === this.editorTopDefinition)[0];
    //     const meaning = new Meaning(event.source.value, [new Definition('Undefined')]);
    //     topDef.meanings.push(meaning);
    //     this.lastInteraction = 'add meaning';
    //     this.productService.setSelected(this.product);
    //   }
    // }

  }




  setEditMode(event:any){
    this.definitionsEditMode = !this.definitionsEditMode;
    console.log(this.defs_filter_);
    console.log(this.selectedDefinitions);
    // let selected_def:string = '';
    // if(this.defs_filter_.length === 1) selected_def = this.defs_filter_[0];
    // if(this.defs_filter_.length === 2)
    const selected_def = this.lastInteraction === 'add definition' ? this.defs_filter_[this.defs_filter_.length-1] : this.defs_filter_[1];
    this.editorTopDefinition = selected_def;
    this.productDefineForm.controls['defSelect'].setValue([selected_def]);
  }


  registerSelectedProduct(product:IProduct | any | null): void{
    const accept_states = ['product-list-selected', 'create'];
    const reject_states = ['product-list-active-false','product-list-active-true','product-list-delete'];
    if (product !== null && !reject_states.includes(this.coms.coms_object.state)) {
      this.showDefs = true;
      this.serviceSelectedProduct = product;
      this.product = product;
      this.message = this.product.name;
      const defs_list = this.product.def.map((def:any, i:number) =>{ return {'word': def.word, 'id':def.id, 'i':i} });
      this.selectedDefinitions = defs_list;
      const selected_def = this.lastInteraction === 'add definition' ? defs_list[defs_list.length-1].id : defs_list[0].id;
      this.editorTopDefinition = selected_def;
      this.productDefineForm.controls['defSelect'].setValue(selected_def);
    }else{
      this.showDefs = false;
      this.product = null;
    }
    this.logger.ez.set_text(`define_form serviceSelectedProduct: ${product !== null ? product.name : null}`, true);
  }


  handleDomChange(event: any) {
    if(this.editor.requestedUnsetField){
      this.openLineEditorField(this.locateField(event.detail));
      this.editor.requestedUnsetField = false;
    }
  }

  locateField(event: Array<MutationRecord>) {
    let flagged_node:HTMLElement | any = null;
    Array.from(event).map((el: MutationRecord) => {
      el.addedNodes.forEach((node: any) =>  {
        if(node.attributes.kcond){
          const found = node.querySelector(`.${this.editor.attribute}`);
          if(found !== null && flagged_node === null) flagged_node = found;
        } 
      });
    });
    return flagged_node !== null ? flagged_node : null;
  }

  openLineEditorField(el:HTMLElement | any):void{
    if(!this.definitionsEditMode) return;
    if(el !== null){
      if(this.editor.input_dom_target !== null) this.editor.input_dom_target.classList.remove('editing-hide');
      this.editor.input_dom_target = el;
      this.editor.value = el.textContent === 'Undefined' ? '' : el.textContent;
      el.classList.add('editing-hide');
      this.productDefineForm.controls['lineEditorField'].enable();
      this.productDefineForm.controls['lineEditorField'].setValue(this.editor.value);
      this.productDefineForm.controls['lineEditorField'].setErrors(null);
      el.parentNode.insertBefore(this.lineEditorField.nativeElement, el);
    }
  }

  closeLineEditorField(){
    if(this.editor.input_dom_target !== null){
      this.editor.input_dom_target.classList.remove('editing-hide');
      this.productDefineForm.controls['lineEditorField'].disable();
    }
  }

  openLineEditorAttributes(el:HTMLElement | any):void{
    if(!this.definitionsEditMode) return;
    const where = el.closest('.has-edit').querySelector('div .editor');
    if(where !== null) where.parentNode.insertBefore(this.lineEditorAttributes.nativeElement, where);
  }

  // this necessitates a special workaround top wait for the dom-element to manifest itself.
  // here u can determine the add state of meaning and definition;
  formAddItemAttribute(event: any, item:string | null = null){
   this.definitionsChanged = true;
    event.preventDefault();
    if(item !== null){
      if(item === 'definition' && this.editor.instance_type === 'Meaning'){
        this.editor.parent_instance = this.editor.instance;
        this.editor.instance = this.formAddDefinition(this.editor.instance);
        this.editor.attribute = 'definition';
        this.editor.requestedUnsetField = true;
      }else{
        this.closeLineEditorField();
        this.editor.instance[item] = 'Undefined';
        this.editor.value = 'Undefined';
        this.editor.attribute = item;
        this.editor.requestedUnsetField = true;
        this.editor.reset();
      }
    }
  }

  
  lineEditorChangeValue(event: any){
    this.definitionsChanged = true;
    //console.log('editor value', event.target.value);

    this.productDefineForm.controls['lineEditorField'].disable();
    if(this.editor.input_dom_target !== null){
      //to delete the whole definition:
      if(event.target.value === '' && this.editor.attribute === 'definition'){
        this.formADeleteDefinition(this.editor.parent_instance, this.editor.instance);
      }else{
        this.editor.input_dom_target.classList.remove('editing-hide');
        this.editor.input_dom_target.innerHTML = event.target.value;

        this.editor.instance[this.editor.attribute] = event.target.value;
        if(event.target.value === '') delete this.editor.instance[this.editor.attribute];
        this.editor.reset();
      }
    }
    
    this.productService.setSelected(this.product);
    event.target.blur();
  }






  //either by button or by direct-click?
  formEditLine(event: any, item: Meaning | Definition, parent: Meaning | TopDefinition, attribute:string | null = null):void{
    const is_line_editor = attribute === null;  
    this.closeLineEditorField();
    this.editor.instance = item;
    this.editor.parent_instance = parent;
    this.editor.attribute = attribute;
    this.editor.reset();
    this.openLineEditorAttributes(event.target);
    if(!is_line_editor){
      this.openLineEditorField(event.target);
    }
  }






  formAddMeaning():void{
    //this.productMeanings.push(new Meaning('test'));
  }


  formAddDefinition(meaning: IMeaning | any): Definition{
   this.definitionsChanged = true;
    const new_def = new Definition('Undefined', 'Example usage');
    meaning.definitions.push(new_def);
    return new_def;
  }




  formAddTopDefinition():void{
    this.definitionsChanged = true;
    const topDefinition = new TopDefinition(this.product.name, []);
    this.product.def.push(topDefinition);
    this.lastInteraction = 'add definition';
    this.product.meta.m[topDefinition.id!] = {};

    this.coms.log(`added new empty definition (${topDefinition.id!}) to "${this.product.name}".`,
    {'from_id':this.product.id, 'state':'add-definition','icon':'check_circle_outline'});

    //this.productService.setSelected(this.product);
    this.directPrepareProduct();
  }


  formDeleteMeaning(meaning: IMeaning, tDef: ITopDefinition):void{
    this.definitionsChanged = true;
    const top_index = this.product.def.indexOf(tDef);
    const mean_index = this.product.def[top_index].meanings.indexOf(meaning);
    this.product.def[top_index].meanings.splice(mean_index, 1);
    delete this.product.meta.m[tDef.id!][meaning.id!];

    this.coms.log(`removed "${meaning.partOfSpeech['txt']}(.${meaning.partOfSpeech['val']})" on definition (${tDef.id!}) of "${this.product.name}".`,
    {'from_id':this.product.id, 'state':'delete-meaning', 'icon':'block'});

    this.productService.setSelected(this.product);


    // const top_index = this.product.def.indexOf(tDef);
    // const mean_index = this.product.def[top_index].meanings.indexOf(meaning);

    // this.product.def[top_index].meanings.splice(mean_index, 1);
    // delete this.product.meta.m[tDef.id!][meaning.id!];

    // console.log(this.product.def, this.product.meta, top_index, mean_index);
    // this.product.def.find((d:{}|any) => d.id === def.id)

    // const topDef = this.product.def.filter((d:any) => d.id === this.editorTopDefinition)[0];
    // const toDefNumber = this.selectedDefinitions.find((item:any) => item.id === this.editorTopDefinition);
    // const index = topDef.meanings.indexOf(meaning);
    // if (index >= 0) {
    //   topDef.meanings.splice(index, 1);
    // }


    
  }


  formDeleteTopDefinition(topDefinition: ITopDefinition):void{
    this.definitionsChanged = true;
    const index = this.product.def.indexOf(topDefinition);
    if (index >= 0) {
      delete this.product.meta.m[topDefinition.id!];
      this.product.def.splice(index, 1);
      this.coms.log(`deleted definition Nº${index} (id:${topDefinition.id!}) of "${this.product.name}".`,
      {'from_id':this.product.id, 'state':'delete-definition','icon':'block'});
    }
    this.productService.setSelected(this.product);
  }

  formADeleteDefinition(meaning: IMeaning, definition: IDefinition):void{
    //this.definitionsChanged = true;
    const index = meaning.definitions!.indexOf(definition);
    if (index >= 0) {
      meaning.definitions!.splice(index, 1);
    }
  }



  definitionChanged(event: any, meaning: IMeaning, definition: IDefinition, field: string){
    definition[field] = event.target.value;
    console.log('definitionChanged', event.target.value, meaning, definition, field);
    return false;
  }

  onSubmit() {
    return false;
  }

  saveChanges():void{
    this.productService.modify(this.product._id, this.product)
      .then((result: any) => { //confirmation of modify only
        this.coms.log(`saved changes to "${this.product.name} (.${this.product.brand})"`,
        {'icon':'check_circle_outline','state':`product-create-modify`,'object':result, 'from_id':this.product.id});
        this.productService.setSelected(this.product);
        this.definitionsChanged = false;
      })
  }

}
