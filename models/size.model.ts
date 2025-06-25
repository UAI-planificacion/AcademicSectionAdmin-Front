export type SizeId = 'XS' | 'XE' | 'S' | 'SE' | 'MS' | 'M' | 'L' | 'XL' | 'XXL';


export interface Sizes {
    id              : SizeId;
    detail          : string;
    min?            : number;
    max?            : number;
    lessThan?       : number;
    greaterThan?    : number;
    label           : string;
}


export interface Size {
    id              : SizeId;
    detail          : string;
    min?            : number;
    max?            : number;
    lessThan?       : number;
    greaterThan?    : number;
}


export interface SizeSave {
    id              : SizeId;
    min?            : number;
    max?            : number;
    lessThan?       : number;
    greaterThan?    : number;
}
