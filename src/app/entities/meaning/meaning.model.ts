import { PartsOfSpeech } from 'src/app/product/product-create/product-create.component'
import { Md5 } from 'ts-md5';

export const get_id = (seed: string, len:number): string => {
    const time_seed = new Date().getTime();
    const rand_seed = Math.round(Math.random()*1000);
    const id = Md5.hashStr(`${rand_seed}—${time_seed}—${seed}`);
    return id.substring(0,len);
};


export interface ITopDefinition {
    word: string;
    meanings?: Meaning[];
    id?: string;
    populateBase(): void;
}

export interface IMeaning {
    partOfSpeech: {};
    definitions?: IDefinition[] | null;
    synonyms?: string[] | null;
    antonyms?: string[] | null;
    id?: string;
}

export interface IDefinition {
    definition: string;
    example?: string | null;
    synonyms?: string[] | null;
    antonyms?: string[] | null;
    id?: string;
}

export class TopDefinition implements ITopDefinition{
    constructor(
        public word: string,
        public meanings?: Meaning[] | [],
        public id?: string,
    ){
        this.word = word;
        this.id = id ? id : get_id(word,8);
        this.meanings = meanings ? meanings : [];
    }

    // this is either turning raw/new definition to parsed origin[Symbol].
    // or making parsed of existing FileSystemEntry;

    public populateBase(): void{
        const pos_filter = (pos: string) => PartsOfSpeech.filter((p:any) => p.txt.toLowerCase() === pos.toLowerCase())[0] || null;
        const fresh = this.meanings?.map((m:any, i:number) => {

            const meaning_defs = m.definitions?.map((d:any, i:number) => {
                console.log('error', d);

                return new Definition(
                    d.definition, 
                    d.example, 
                    d.synonyms, // && d.synonyms !== undefined ? d.synonyms[0].split(',') : undefined, 
                    d.antonyms, // && d.antonyms !== undefined ? d.antonyms[0].split(',') : undefined, 
                    d.id);
            });

            
            console.log(m);
            return new Meaning(
                typeof m.partOfSpeech !== 'object' ? pos_filter(m.partOfSpeech) : m.partOfSpeech,
                meaning_defs || [],
                m.synonyms, // && m.synonyms !== undefined ? m.synonyms[0].split(',') : undefined,
                m.antonyms, // && m.antonyms !== undefined ? m.antonyms[0].split(',') : undefined,
                m.id);
        });

        console.log(fresh);
        this.meanings = fresh;
    }
}

export class Meaning implements IMeaning{
    constructor(
        public partOfSpeech: {},
        public definitions?: Definition[],
        public synonyms?: string[] | null,
        public antonyms?: string[] | null,
        public id?: string,
    ) {
    this.partOfSpeech = partOfSpeech;
    this.definitions = definitions ? definitions : [];
    this.synonyms = Array.isArray(synonyms) && synonyms.length ? synonyms : undefined;
    this.antonyms = Array.isArray(antonyms) && antonyms.length ? antonyms : undefined;
    this.id = id ? id : get_id(partOfSpeech['txt'], 8);
    }
}

export class Definition implements IDefinition{
    constructor(
        public definition: string,
        public example?: string | null,
        public synonyms?: string[] | null,
        public antonyms?: string[] | null,
        public id?: string,
    ){
    this.definition = definition;
    this.example = example ? example : undefined;
    this.synonyms = Array.isArray(synonyms) && synonyms.length ? synonyms : undefined;
    this.antonyms = Array.isArray(antonyms) && antonyms.length ? antonyms : undefined;
    this.id = id ? id : get_id(definition, 8);
    }
}
