import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IProduct, Product } from './product.model';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { TopDefinition, Meaning } from 'src/app/entities/meaning/meaning.model';

@Injectable({
    providedIn: 'root'
})

export class ProductService {
    
    constructor(public http: HttpClient) { }

    private selectedProduct = new BehaviorSubject<IProduct>(null as any);
    private modifiedProduct = new BehaviorSubject<IProduct>(null as any);
    
    selected = this.selectedProduct.asObservable();
    modified = this.modifiedProduct.asObservable();


    //glue together the parts of speech
    prepareProductMeta(product: IProduct): void{
        const flat = new Array();
        const struct = {};
        product.def?.map((d:TopDefinition, di:number) => {
            struct[di] = {};
            d.meanings?.map((m:Meaning, mi:Number) => {
                flat.push(m.partOfSpeech);
                struct[di][mi] = m.partOfSpeech;
            })
        })
        product.meta = {m:struct, f:[...new Set([...flat])]};
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
            const telly = new TopDefinition(s.word, s.meanings);
            telly.populateBase(); //responsible for setting the partOfSpeech.
            return telly;
        })
        return output_def;
    }


    setSelected(product: IProduct | any | null) {
        if(product !== null){
            if(!product.def){
                console.log("not a new entry, lookup definition...");
                this.get_definitions(product)
                .then((result: any) =>{
                    product.real = true;
                    product.def = result[0].definition;
                    return this.selectedProduct.next(product);
                }).catch(this.error);
            } 
            if(product.def && product.def.length === 0){ 
                console.log("probably a new entry, acquire definition...");
                this.define(product.name)
                .then((result: any) => {
                    if(Array.isArray(result[0].raw)){
                        product.real = true;
                        product.def = this.prepareDef(result[0].raw, true);
                        this.prepareProductMeta(product);
                    }else{
                        product.real = false;
                        this.prepareProductMeta(product);
                        console.log("probably a new entry, with no meaning found, roll-your-own");
                    }
                    return this.selectedProduct.next(product);
                }).catch(this.error);
            }
        }else{
            this.selectedProduct.next(product);
        }
        
    }

    setModified(product: IProduct | any | null) {
        this.modifiedProduct.next(product);
    }



    public productsUrl = '/api/products';

    public async get() {
        const req = this.http.get(this.productsUrl, {responseType: 'json'});
        return await firstValueFrom(req)
            .then((response : Array<IProduct> | any | null) => response)
            .catch(this.error);
        }


    public async update(id: string, key: string, value: string | boolean){
        const command = {'key': key, 'value': value};
        const req = this.http.post(`${this.productsUrl}/${id}`, command);
        return await firstValueFrom(req)
            .then((response : IProduct | any | null) => response)
            .catch(this.error);
        }


    public async create(product: Product){
        const req = this.http.post(this.productsUrl, product);
        return await firstValueFrom(req)
            .then((response : IProduct | any | null) => response)
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
