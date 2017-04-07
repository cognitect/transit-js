
declare module "transit.types" {
    
    class TransitType {
        toString(): string;
        equiv(other: any): boolean;
    }

    /* 
    http://cognitect.github.io/transit-js/files/src_com_cognitect_transit_types.js.html
    */
    export class TaggedValue extends TransitType {
        constructor(tag: string, rep: any);
    }
    export function taggedValue(tag: string, rep: any): TaggedValue;
    export function isTaggedValue(x: any): boolean;

    export function nullValue(): null;
    export function boolValue(s: "t" | any): boolean;

    export const MAX_INT: number;
    export const MIN_INT: number;

    // classes of TransitType
    export type BigDecimal = any;
    export type Keyword = any;
    export type Symbol = any;
    export type UUID = any;
    export type Binary = any;
    export type URI = any;

    type TransitMapIterator = any;
    export type TransitArrayMap = any;
    export type TransitMap = any;
    export type TransitSet = any;
}