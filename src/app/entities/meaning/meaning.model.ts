import { auxPartsOfSpeech, PartsOfSpeech } from 'src/app/product/product-create-form/product-create-form.component'

export interface ITopDefinition {
    word: string;
    meanings?: Meaning[];
    populateBase(): void;
}

export interface IMeaning {
    partOfSpeech: object | any;
    definitions?: IDefinition[] | null;
    synonyms?: string[] | null;
    antonyms?: string[] | null;
}

export interface IDefinition {
    definition: string;
    example?: string | null;
    synonyms?: string[] | null;
    antonyms?: string[] | null;
}

export class TopDefinition implements ITopDefinition{
    constructor(
        public word: string,
        public meanings?: Meaning[] | []
    ){
        this.word = word;
        this.meanings = meanings ? meanings : [];
    }

    public populateBase(): void{
        const pos_filter = (pos: string) => PartsOfSpeech.filter(p => p.txt.toLowerCase() === pos.toLowerCase())[0] || null;
        const fresh = this.meanings?.map((m:any, i:number) => {
            return new Meaning(
                typeof m.partOfSpeech !== 'object' ? pos_filter(m.partOfSpeech) : m.partOfSpeech,
                m.definitions,
                m.synonyms,
                m.antonyms);
        })
        this.meanings = fresh;
    }



}

export class Meaning implements IMeaning{
    constructor(
        public partOfSpeech: object | any,
        public definitions?: Definition[] | null,
        public synonyms?: string[],
        public antonyms?: string[]
    ) {
    this.partOfSpeech = partOfSpeech;
    this.definitions = definitions ? definitions : [];
    this.synonyms = Array.isArray(synonyms) && synonyms.length ? synonyms : undefined;
    this.antonyms = Array.isArray(antonyms) && antonyms.length ? antonyms : undefined;
    }
}

export class Definition implements IDefinition{
    constructor(
        public definition: string,
        public example?: string | null,
        public synonyms?: string[] | null,
        public antonyms?: string[] | null
    ){
    this.definition = definition;
    this.example = example ? example : null;
    this.synonyms = synonyms?.length ? synonyms : null;
    this.antonyms = antonyms?.length ? antonyms : null;
    }
}
