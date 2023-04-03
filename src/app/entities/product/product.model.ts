
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
  }

}