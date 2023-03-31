//import { IMeaning } from 'src/app/entities/meaning/meaning.model';
import { auxPartsOfSpeech } from 'src/app/product/product-create-form/product-create-form.component'
import { TopDefinition, Meaning } from "../meaning/meaning.model";

export interface IProduct {
  _id?: string | any | null;
  int: number;
  name: string;
  brand: string[];
  date: Date;
  active: boolean;
  real: boolean;
  parents?: string[];
  children?: string[];
  pos?: string[]; //parts of speech
  def?: any[]; //asserted definition
  meta?: object; //asserted definition
  // setMeta: () => object | {};
}

export class Product implements IProduct {
  constructor(
    public int: number,
    public name: string,
    public brand: string[],
    public date: Date,
    public active: boolean,
    public real: boolean,
    public parents?: string[] | [],
    public children?: string[] | [],
    public pos?: string[] | [], //parts of speech
    public def?: any[] | [], //asserted definition
    public meta?: object | {}, //asserted definition
    public _id?: string | null
  ) {
    this._id = _id ? _id : null;
    this.int = int;
    this.name = name;
    this.brand = brand;
    this.date = date;
    this.active = active;
    this.real = real;
    this.parents = parents ? parents : [];
    this.children = children ? children : [];
    this.pos = pos ? pos : [];
    this.def = def ? def : [];
    this.meta = meta ? meta : {};
    //this.setMeta = this.setMeta;
  }

  // public setMeta(){
  //   console.log('called')
  //   const flat = new Array();
  //   const struct = {};
  //   this.def?.map((d:TopDefinition, di:number) => {
  //     struct[di] = {};
  //     d.meanings?.map((m:Meaning, mi:Number) => {
  //       flat.push(m.partOfSpeech);
  //       struct[di][mi] = m.partOfSpeech;
  //     })
  //   })
  //   this.meta = {m:struct, f:[...new Set([...flat])]};
  //   return this.meta;
  // }

}