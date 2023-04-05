import { Md5 } from 'ts-md5';

export const get_id = (seed: string, len:number): string => {
    const time_seed = new Date().getTime();
    const rand_seed = Math.round(Math.random()*1000);
    const id = Md5.hashStr(`${rand_seed}—${time_seed}—${seed}`);
    return id.substring(0,len);
};

export interface IProduct {
  _id?: string | any | null;
  id?: string | null;
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
  object?: object; //asserted definition
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
    public _id?: string | null,
    public id?: string | null,
    public object?: {} | undefined
  ) {
    this._id = _id ? _id : null;
    this.id = id ? id : get_id(this.name, 12);
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
    this.object = object ? object : undefined;
  }

}