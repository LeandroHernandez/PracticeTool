
export interface IWord {
    id?: string;
    type: 'Verb' | 'Adjective' | 'Noun' | 'Preposition' | 'Adverb' ;
    en: string;
    simplePresent?: string;
    simplePast?: string;
    pastParticiple?: string;
    es: Array<string>;
    irregular?: boolean
}
