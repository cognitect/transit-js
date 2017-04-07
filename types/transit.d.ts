
/// <reference path="transit/types.d.ts" />
/// <reference path="transit/caching.d.ts" />
/// <reference path="transit/impl/decoder.d.ts" />
/// <reference path="transit/impl/reader.d.ts" />
/// <reference path="transit/impl/writer.d.ts" />

/**
 * http://cognitect.github.io/transit-js/classes/transit.html
 */

declare module "transit-js" {
    import {
        TaggedValue, Symbol, Keyword,
        TransitArrayMap, TransitMap, TransitSet,
        UUID, BigDecimal, Binary, URI
    } from "transit.types";
    import { Decoder } from "transit.impl.decoder";
    import { ReadCache, WriteCache } from "transit.caching";
    import { Reader } from "transit.impl.reader";
    import { Writer } from "transit.impl.writer";


    export function bigDec(s: string): TaggedValue;
    export function bigInt(s: string): TaggedValue;
    export function binary(s: string): TaggedValue | Uint8Array;
    export function date(s: string | number): Date;
    export function decoder(options: any): Decoder;
    export function exentdToEQ(x: any): any;
    export function hash(x: any): number;
    export function hashArrayLike(x: any): number;
    export function hashMapLike(x: any): number;
    export function integer(s: number | string): number;

    export function isBigDec(x: any): boolean;
    export function isBigInt(x: any): boolean;
    export function isBinary(x: any): boolean;
    export function isInteger(x: any): boolean;
    export function isKeyword(x: any): boolean;
    export function isLink(x: any): boolean;
    export function isList(x: any): boolean;
    export function isMap(x: any): boolean;
    export function isQuoted(x: any): boolean;
    export function isSet(x: any): boolean;
    export function isSymbol(x: any): boolean;
    export function isTaggedValue(x: any): boolean;
    export function isURI(x: any): boolean;
    export function isUUID(x: any): boolean;

    export function keyword(name: string): Keyword;
    export function link(a: TransitArrayMap | TransitMap): any;
    export function list(a: any[]): TaggedValue;
    export function makeWriteHandler(obj: WriteHandler): any;
    export function map(xs: any[]): TransitArrayMap | TransitMap;
    export function mapToObject(m: TransitArrayMap | TransitMap): any;
    export function objectToMap(a: any): TransitArrayMap | TransitMap;
    export function quoted(x: any): TaggedValue;

    export interface ReaderOptions {
        handlers?: any;
        arrayBuilder?: any;
        mapBuilder?: any;
    }

    export function readCache(): ReadCache;
    export function reader(type: "json" | "json-verbose", opts?: ReaderOptions): Reader;

    export function set(xs: any[]): TransitSet;
    export function symbol(name: string): Symbol;
    export function tagged(tag: string, value: any): TaggedValue;
    export function uri(a: string): TaggedValue;

    export interface WriteHandler {
        tag: any;
        rep: any;
        stringRep: any;
        getVerboseHandler?: boolean;
    }

    export interface WriterOptions {
        handlers?: any;
        handlerForForeign?: any;
    }

    export function writeCache(): WriteCache;
    export function writer(type: "json" | "json-verbose", opts?: WriterOptions): Writer;

}


