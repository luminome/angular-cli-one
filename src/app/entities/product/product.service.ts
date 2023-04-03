import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IProduct, Product } from './product.model';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { TopDefinition, Meaning, Definition } from 'src/app/entities/meaning/meaning.model';
import { PartsOfSpeech } from 'src/app/product/product-create-form/product-create-form.component'
// import { ObjectId } from 'mongodb';

@Injectable({
    providedIn: 'root'
})

export class ProductService {
    
    constructor(public http: HttpClient) { }

    private selectedProduct = new BehaviorSubject<IProduct>(null as any);
    selected = this.selectedProduct.asObservable();

    private currentInventory = new BehaviorSubject<IProduct>([] as any);
    inventory = this.currentInventory.asObservable();
  
    productInventory: IProduct[] | [] | any;

    //glue together the parts of speech
    prepareProductMeta(product: IProduct): void{
        const flat = new Array();
        const struct = {};
        product.def?.map((d:TopDefinition, di:number) => {
            struct[d.id!] = {};
            d.meanings?.map((m:Meaning, mi:Number) => {
                flat.push(m.partOfSpeech);
                struct[d.id!][m.id] = {...m.partOfSpeech};
            })
        })
        const m_flat = [...new Set([...flat])];
        product.brand = m_flat.map(m => m.val);
        product.meta = {m:struct, f:m_flat};
    }

    //translate/sanitize recently acquired definition from the internet.
    prepareDef(def:object, raw:boolean): object{        
        const fw = ['word', 'meanings','partOfSpeech','definitions','definition','example','synonyms','antonyms'];
        const scan = (obj: any) => {
          Object.entries(obj).forEach(([key, val]) => 
            (val && typeof val === 'object' && !Array.isArray(obj[key]) && (fw.includes(key) || !isNaN(parseInt(key)) )) && scan(val) ||
            (val && (Array.isArray(obj[key]) && obj[key].length > 0) && (fw.includes(key) || !isNaN(parseInt(key)) )) && scan(val) ||
            (val === null || val === "" || (Array.isArray(val) && val.length === 0) || (!fw.includes(key) && isNaN(parseInt(key)))) && delete obj[key]
          );
          return obj;
        }
        const scanned = scan(def);
        const output_def = scanned.map((s: any, i:number) => {
            const telly = new TopDefinition(s.word, s.meanings, s.id);
            telly.populateBase(); //responsible for setting the partOfSpeech.
            return telly;
        })
        return output_def;
    }

    //set the current working product
    setSelected(product: IProduct | any | null) {
        console.log('product service:', product);

        if(product !== null){
            if(product.def && product.def.length === 0){ 
                console.log("probably a new entry, acquire definition...");

                this.define(product.name)
                .then((result: any) => {
                    if(Array.isArray(result[0].raw)){
                        product.real = true;
                        product.def = this.prepareDef(result[0].raw, true);
                    }else{
                        product.real = false;
                        product.def = [new TopDefinition(product.name,[])];
                        console.log("probably a new entry, with no meaning found, roll-your-own");
                    }
                    this.prepareProductMeta(product);
                    return this.selectedProduct.next(product);
                    
                }).catch(this.error);
            }else if(!product.def){
                console.log("not a new entry, get existing lookup definition...");
                this.get_definitions(product)
                .then((result: any) =>{
                    product.real = true;
                    product.def = result[0].definition;
                    this.prepareProductMeta(product);
                    return this.selectedProduct.next(product);
                }).catch(this.error);
            }else{
                //and finally, just update the product.
                console.log("product exists...");
                this.prepareProductMeta(product);
                this.selectedProduct.next(product);
            }
        }else{
            this.selectedProduct.next(product);
        }
    }

    public productsUrl = '/api/products';

    public async get() {
        const req = this.http.get(this.productsUrl, {responseType: 'json'});
        return await firstValueFrom(req)
            .then((response : Array<IProduct> | any | null) => this.currentInventory.next(response))
            .catch(this.error);
        }


    public async update(id: string, key: string, value: string | boolean){
        const command = {'key': key, 'value': value};
        const req = this.http.post(`${this.productsUrl}/${id}`, command);
        return await firstValueFrom(req)
            .then((response : IProduct | any | null) => response)
            .catch(this.error);
        }

    public async modify(id:string, object:IProduct){
        const req = this.http.post(`/api/modify/${id}`, object);
        return await firstValueFrom(req)
            .then((response : IProduct | any | null) => response)
            .catch(this.error);
        }


    public async create(product: Product){
        const req = this.http.post(this.productsUrl, product);
        return await firstValueFrom(req)
            .then((response : IProduct | any | null) => {
                this.productInventory = this.currentInventory.getValue();
                this.productInventory.push(response);
                this.currentInventory.next(this.productInventory);
                return response;
            })
            .catch(this.error);
        }

    public async delete(id: string){
        const req = this.http.delete(`${this.productsUrl}/${id}`);
        return await firstValueFrom(req)
            .then((response: any) => response)
            .catch(this.error);
        }

    public async define(name: string){
        const req = this.http.get(`/api/define/${name}`);
        return await firstValueFrom(req)
            .then((response: any) => response)
            .catch(this.error);
        }

    public async get_definitions(product: Product){
        const req = this.http.get(`/api/lookup/${product.name}`);
        return await firstValueFrom(req)
            .then((response: any) => response)
            .catch(this.error);
        }
        
    // Error handling
    private error(error: any) {
        let message = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(message);
    }
}
